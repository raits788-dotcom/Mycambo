// ============================================================================
// Edge Function : claim-invite
// ----------------------------------------------------------------------------
// Appelée par un SUPERADMIN depuis la page Gérance. Crée une invitation de
// réclamation pour une asso en gérance et envoie un email avec un lien unique.
// Le lien contient un jeton en clair ; seul son hash est stocké en base.
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

    // 1. Vérifier superadmin
    const { data: { user }, error: authErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user || user.app_metadata?.role !== "superadmin") {
      return json({ error: "FORBIDDEN" }, 403);
    }

    const { tenant_id, email_override } = await req.json();
    if (!tenant_id) return json({ error: "tenant_id requis" }, 400);

    // 2. Charger le tenant (doit être en gérance, non réclamé)
    const { data: tenant } = await admin
      .from("tenants")
      .select("id, name, email, managed_by_mycambo, claimed_at")
      .eq("id", tenant_id)
      .single();
    if (!tenant) return json({ error: "TENANT_NOT_FOUND" }, 404);
    if (!tenant.managed_by_mycambo) {
      return json({ error: "TENANT_NON_GERE" }, 400);
    }

    const invitedEmail = (email_override || tenant.email || "").trim();
    if (!invitedEmail) return json({ error: "EMAIL_MANQUANT" }, 400);

    // fiche principale (pour pré-remplir plus tard)
    const { data: biz } = await admin
      .from("businesses")
      .select("id")
      .eq("tenant_id", tenant_id)
      .limit(1)
      .maybeSingle();

    // 3. Révoquer les invitations actives précédentes pour ce tenant
    await admin
      .from("claim_invitations")
      .update({ status: "revoked" })
      .eq("tenant_id", tenant_id)
      .in("status", ["invited", "account_created"]);

    // 4. Générer le jeton (clair -> lien ; hash -> base)
    const rawToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 jours

    const { error: insErr } = await admin.from("claim_invitations").insert({
      tenant_id,
      business_id: biz?.id ?? null,
      invited_email: invitedEmail,
      token_hash: tokenHash,
      expires_at: expiresAt,
      status: "invited",
      invited_by: user.id,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    // 5. Envoyer l'email avec le lien
    const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
    const link = `${siteUrl}/reclamer?token=${rawToken}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:20px">🔑 Réclamez l'accès à votre fiche myCAMBO</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Bonjour <strong>${tenant.name}</strong>,</p>
          <p>myCAMBO a créé une fiche pour votre association. Pour en prendre la gestion,
          cliquez sur le bouton ci-dessous : vous définirez votre mot de passe, puis
          compléterez les informations nécessaires à la validation.</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${link}" style="display:inline-block;background:#1B3A6B;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold">
              Réclamer l'accès →
            </a>
          </p>
          <p style="font-size:12px;color:#9ca3af">Ce lien est personnel et expire dans 14 jours.
          Si vous n'êtes pas concerné, ignorez cet email.</p>
          <p style="font-size:12px;color:#9ca3af">Besoin d'aide ? contact@mycambo.net</p>
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
          subject: "Réclamez l'accès à votre fiche myCAMBO",
          html,
        }),
      }
    );
    if (!emailRes.ok) {
      const t = await emailRes.text();
      return json({ error: "EMAIL_NON_ENVOYE", detail: t }, 502);
    }

    return json({ ok: true, invited_email: invitedEmail }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
