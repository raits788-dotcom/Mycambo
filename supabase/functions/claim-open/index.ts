// ============================================================================
// Edge Function : claim-open
// ----------------------------------------------------------------------------
// Appelée depuis la page publique /reclamer?token=... quand l'asso ouvre son
// lien d'invitation. Deux actions :
//   action = "check"    -> valide le token et renvoie les infos (nom asso,
//                          email, si un compte existe déjà) sans rien modifier.
//   action = "finalize" -> crée (ou récupère) le compte auth avec le mot de
//                          passe choisi, le lie au tenant (tenant_users owner,
//                          en attente), passe l'invitation à account_created.
// Tout en service_role. L'invitation elle-même sert de preuve (le lien est
// parti à l'email officiel du tenant).
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

    const { token, action, password, requester_name } = await req.json();
    if (!token) return json({ error: "token requis" }, 400);

    // Retrouver l'invitation par hash
    const tokenHash = await sha256(token);
    const { data: inv } = await admin
      .from("claim_invitations")
      .select("*, tenants(id, name, email, slug), businesses:business_id(id, name)")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (!inv) return json({ error: "LIEN_INVALIDE" }, 404);
    if (["approved", "rejected", "revoked"].includes(inv.status)) {
      return json({ error: "LIEN_CLOS", status: inv.status }, 410);
    }
    if (new Date(inv.expires_at) < new Date()) {
      await admin.from("claim_invitations").update({ status: "expired" }).eq("id", inv.id);
      return json({ error: "LIEN_EXPIRE" }, 410);
    }

    const tenant = (inv as any).tenants;

    // --- action: check ---
    if (!action || action === "check") {
      return json(
        {
          ok: true,
          status: inv.status,
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          invited_email: inv.invited_email,
          has_account: inv.status !== "invited",
        },
        200
      );
    }

    // --- action: finalize (créer le compte) ---
    if (action === "finalize") {
      if (!password || String(password).length < 8) {
        return json({ error: "MOT_DE_PASSE_TROP_COURT" }, 400);
      }

      // Créer ou récupérer l'utilisateur pour l'email invité
      let userId: string | null = null;

      // Chercher un user existant avec cet email
      const { data: existing } = await admin.auth.admin.listUsers();
      const match = existing?.users?.find(
        (u) => (u.email || "").toLowerCase() === inv.invited_email.toLowerCase()
      );

      if (match) {
        userId = match.id;
        // mettre à jour le mot de passe
        await admin.auth.admin.updateUserById(userId, { password });
      } else {
        const { data: created, error: createErr } =
          await admin.auth.admin.createUser({
            email: inv.invited_email,
            password,
            email_confirm: true,
            app_metadata: { tenant_id: tenant.id, role: "partner" },
          });
        if (createErr || !created?.user) {
          return json({ error: createErr?.message || "CREATION_COMPTE_ECHEC" }, 500);
        }
        userId = created.user.id;
      }

      // Lier le compte au tenant (owner) — idempotent
      const { data: link } = await admin
        .from("tenant_users")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (!link) {
        await admin
          .from("tenant_users")
          .insert({ tenant_id: tenant.id, user_id: userId, role: "owner" });
      }

      // Mettre à jour l'invitation
      await admin
        .from("claim_invitations")
        .update({
          status: "account_created",
          requester_user_id: userId,
          requester_name: requester_name || null,
        })
        .eq("id", inv.id);

      return json({ ok: true, tenant_slug: tenant.slug }, 200);
    }

    return json({ error: "ACTION_INCONNUE" }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
