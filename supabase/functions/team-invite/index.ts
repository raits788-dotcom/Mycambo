// ============================================================================
// Edge Function : team-invite
// ----------------------------------------------------------------------------
// Un OWNER d'un tenant invite un collaborateur par email avec un rôle
// (editor / viewer). Crée une invitation (token haché) et envoie un email avec
// le lien d'acceptation. Vérifie que l'appelant est bien owner du tenant.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "NON_AUTHENTIFIE" }, 401);

    const { tenant_id, email, role } = await req.json();
    if (!tenant_id || !email) return json({ error: "PARAMS_MANQUANTS" }, 400);
    const safeRole = ["editor", "viewer"].includes(role) ? role : "editor";

    // Vérifier que l'appelant est OWNER du tenant (ou superadmin)
    const isSuper = user.app_metadata?.role === "superadmin";
    if (!isSuper) {
      const { data: me } = await admin
        .from("tenant_users")
        .select("role")
        .eq("tenant_id", tenant_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!me || me.role !== "owner") return json({ error: "INTERDIT" }, 403);
    }

    const invitedEmail = String(email).trim().toLowerCase();

    // Révoquer les invitations pending précédentes pour ce couple tenant/email
    await admin
      .from("team_invitations")
      .update({ status: "revoked" })
      .eq("tenant_id", tenant_id)
      .eq("email", invitedEmail)
      .eq("status", "pending");

    const rawToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { error: insErr } = await admin.from("team_invitations").insert({
      tenant_id,
      email: invitedEmail,
      role: safeRole,
      token_hash: tokenHash,
      invited_by: user.id,
      status: "pending",
      expires_at: expiresAt,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    // Nom du tenant pour l'email
    const { data: tenant } = await admin
      .from("tenants").select("name").eq("id", tenant_id).maybeSingle();

    const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
    const link = `${siteUrl}/rejoindre-equipe?token=${rawToken}`;
    const roleLabel = safeRole === "editor" ? "Éditeur" : "Lecteur";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:20px">👥 Invitation à rejoindre une équipe myCAMBO</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Bonjour,</p>
          <p>Vous êtes invité(e) à rejoindre l'équipe de
          <strong>${tenant?.name || "cette association"}</strong> sur myCAMBO
          avec le rôle <strong>${roleLabel}</strong>.</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${link}" style="display:inline-block;background:#1B3A6B;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold">
              Rejoindre l'équipe →
            </a>
          </p>
          <p style="font-size:12px;color:#9ca3af">Ce lien expire dans 14 jours.</p>
        </div>
      </div>`;

    const emailRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: invitedEmail,
          subject: `Rejoignez l'équipe de ${tenant?.name || "votre association"} sur myCAMBO`,
          html,
        }),
      }
    );
    if (!emailRes.ok) {
      return json({ error: "EMAIL_NON_ENVOYE" }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
