// ============================================================================
// Edge Function : team-accept
// ----------------------------------------------------------------------------
// Le collaborateur ouvre le lien /rejoindre-equipe?token=... :
//   action = "check"  -> valide le token, renvoie tenant + rôle + email.
//   action = "accept" -> crée (ou récupère) le compte avec le mot de passe,
//                        l'ajoute à tenant_users avec le rôle de l'invitation.
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

    const { token, action, password } = await req.json();
    if (!token) return json({ error: "token requis" }, 400);

    const tokenHash = await sha256(token);
    const { data: inv } = await admin
      .from("team_invitations")
      .select("*, tenants(id, name, slug)")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (!inv) return json({ error: "LIEN_INVALIDE" }, 404);
    if (inv.status !== "pending") return json({ error: "LIEN_CLOS", status: inv.status }, 410);
    if (new Date(inv.expires_at) < new Date()) {
      await admin.from("team_invitations").update({ status: "expired" }).eq("id", inv.id);
      return json({ error: "LIEN_EXPIRE" }, 410);
    }

    const tenant = (inv as any).tenants;

    if (!action || action === "check") {
      return json(
        {
          ok: true,
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          email: inv.email,
          role: inv.role,
        },
        200
      );
    }

    if (action === "accept") {
      if (!password || String(password).length < 8) {
        return json({ error: "MOT_DE_PASSE_TROP_COURT" }, 400);
      }

      // Créer ou récupérer l'utilisateur
      let userId: string | null = null;
      const { data: existing } = await admin.auth.admin.listUsers();
      const match = existing?.users?.find(
        (u) => (u.email || "").toLowerCase() === inv.email.toLowerCase()
      );
      if (match) {
        userId = match.id;
        await admin.auth.admin.updateUserById(userId, { password });
      } else {
        const { data: created, error: cErr } = await admin.auth.admin.createUser({
          email: inv.email,
          password,
          email_confirm: true,
          app_metadata: { tenant_id: tenant.id, role: "partner" },
        });
        if (cErr || !created?.user) {
          return json({ error: cErr?.message || "CREATION_COMPTE_ECHEC" }, 500);
        }
        userId = created.user.id;
      }

      // Ajouter au tenant avec le rôle de l'invitation (idempotent)
      const { data: link } = await admin
        .from("tenant_users")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (link) {
        await admin.from("tenant_users").update({ role: inv.role }).eq("id", link.id);
      } else {
        await admin
          .from("tenant_users")
          .insert({ tenant_id: tenant.id, user_id: userId, role: inv.role });
      }

      await admin
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", inv.id);

      return json({ ok: true, tenant_slug: tenant.slug }, 200);
    }

    return json({ error: "ACTION_INCONNUE" }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
