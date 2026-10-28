// ============================================================================
// Edge Function : impersonate-action
// ----------------------------------------------------------------------------
// Exécute des opérations "partenaire" avec le service_role quand un SUPERADMIN
// est en impersonation (sa session navigateur sur le site public n'a pas le
// tenant courant, donc les RLS basées sur current_tenant_id() bloquent).
//
// Validé par le token d'impersonation (existe + non expiré). Toutes les
// opérations sont restreintes au tenant du token.
//
// Opérations (champ "op") :
//   referral_get            -> { code } du tenant
//   projects_list           -> projets du tenant
//   project_create          -> crée un projet
//   project_update          -> met à jour un projet (du tenant)
//   project_delete          -> supprime un projet (du tenant)
//   team_list               -> membres + invitations
//   team_invite             -> invite un collaborateur (email, role)
//   team_update_role        -> change le rôle d'un membre
//   team_remove             -> retire un membre
//   team_revoke_invitation  -> annule une invitation
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
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { token, op, payload } = body || {};
    if (!token || !op) return json({ error: "token et op requis" }, 400);

    // Valider le token d'impersonation
    const { data: inv } = await admin
      .from("impersonation_tokens")
      .select("tenant_id, expires_at")
      .eq("token", token)
      .maybeSingle();
    if (!inv) return json({ error: "TOKEN_INVALIDE" }, 403);
    if (new Date(inv.expires_at) < new Date()) {
      return json({ error: "TOKEN_EXPIRE" }, 403);
    }
    const tenantId = inv.tenant_id as string;
    const p = payload || {};

    // fiche principale du tenant (pour les projets)
    async function mainBusinessId(): Promise<string | null> {
      const { data } = await admin
        .from("businesses")
        .select("id")
        .eq("tenant_id", tenantId)
        .limit(1)
        .maybeSingle();
      return data?.id ?? null;
    }

    switch (op) {
      // -------- PARRAINAGE --------
      case "referral_get": {
        const { data } = await admin
          .from("referral_codes")
          .select("code")
          .eq("tenant_id", tenantId)
          .maybeSingle();
        return json({ ok: true, code: data?.code ?? null }, 200);
      }

      // -------- PROJETS --------
      case "projects_list": {
        const bizId = p.business_id || (await mainBusinessId());
        const { data } = await admin
          .from("association_projects")
          .select("*")
          .eq("business_id", bizId)
          .order("position", { ascending: true })
          .order("created_at", { ascending: false });
        return json({ ok: true, projects: data || [] }, 200);
      }
      case "project_create": {
        const bizId = p.business_id || (await mainBusinessId());
        if (!bizId) return json({ error: "FICHE_INTROUVABLE" }, 404);
        const { error } = await admin.from("association_projects").insert({
          business_id: bizId,
          tenant_id: tenantId,
          title: p.title,
          description: p.description ?? null,
          goal_amount: p.goal_amount ?? null,
          deadline: p.deadline ?? null,
        });
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }
      case "project_update": {
        const { data, error } = await admin
          .from("association_projects")
          .update(p.fields || {})
          .eq("id", p.id)
          .eq("tenant_id", tenantId)
          .select("id");
        if (error) return json({ error: error.message }, 500);
        if (!data || data.length === 0) return json({ error: "HORS_TENANT" }, 404);
        return json({ ok: true }, 200);
      }
      case "project_delete": {
        const { error } = await admin
          .from("association_projects")
          .delete()
          .eq("id", p.id)
          .eq("tenant_id", tenantId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }

      // -------- ÉQUIPE --------
      case "team_list": {
        const { data: members } = await admin
          .from("tenant_users")
          .select("id, user_id, role, created_at")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: true });
        const { data: invitations } = await admin
          .from("team_invitations")
          .select("id, email, role, status, created_at")
          .eq("tenant_id", tenantId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        return json(
          { ok: true, members: members || [], invitations: invitations || [] },
          200
        );
      }
      case "team_invite": {
        const email = String(p.email || "").trim().toLowerCase();
        const role = ["editor", "viewer"].includes(p.role) ? p.role : "editor";
        if (!email) return json({ error: "EMAIL_MANQUANT" }, 400);

        await admin
          .from("team_invitations")
          .update({ status: "revoked" })
          .eq("tenant_id", tenantId)
          .eq("email", email)
          .eq("status", "pending");

        const rawToken =
          crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
        const tokenHash = await sha256(rawToken);
        const expiresAt = new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString();

        const { error } = await admin.from("team_invitations").insert({
          tenant_id: tenantId,
          email,
          role,
          token_hash: tokenHash,
          status: "pending",
          expires_at: expiresAt,
        });
        if (error) return json({ error: error.message }, 500);

        const { data: tenant } = await admin
          .from("tenants").select("name").eq("id", tenantId).maybeSingle();
        const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
        const link = `${siteUrl}/rejoindre-equipe?token=${rawToken}`;
        const roleLabel = role === "editor" ? "Éditeur" : "Lecteur";
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: email,
            subject: `Rejoignez l'équipe de ${tenant?.name || "votre association"} sur myCAMBO`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0"><h1 style="margin:0;font-size:20px">👥 Invitation à rejoindre une équipe myCAMBO</h1></div>
              <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
                <p>Bonjour,</p>
                <p>Vous êtes invité(e) à rejoindre l'équipe de <strong>${tenant?.name || "cette association"}</strong> avec le rôle <strong>${roleLabel}</strong>.</p>
                <p style="text-align:center;margin:28px 0"><a href="${link}" style="display:inline-block;background:#1B3A6B;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold">Rejoindre l'équipe →</a></p>
                <p style="font-size:12px;color:#9ca3af">Ce lien expire dans 14 jours.</p>
              </div></div>`,
          }),
        });
        return json({ ok: true }, 200);
      }
      case "team_update_role": {
        const role = ["editor", "viewer"].includes(p.role) ? p.role : "editor";
        const { data, error } = await admin
          .from("tenant_users")
          .update({ role })
          .eq("id", p.member_id)
          .eq("tenant_id", tenantId)
          .neq("role", "owner")
          .select("id");
        if (error) return json({ error: error.message }, 500);
        if (!data || data.length === 0) return json({ error: "IMPOSSIBLE" }, 404);
        return json({ ok: true }, 200);
      }
      case "team_remove": {
        const { error } = await admin
          .from("tenant_users")
          .delete()
          .eq("id", p.member_id)
          .eq("tenant_id", tenantId)
          .neq("role", "owner");
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }
      case "team_revoke_invitation": {
        const { error } = await admin
          .from("team_invitations")
          .update({ status: "revoked" })
          .eq("id", p.invitation_id)
          .eq("tenant_id", tenantId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }

      default:
        return json({ error: "OP_INCONNUE" }, 400);
    }
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
