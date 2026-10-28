// ============================================================================
// Edge Function : claim-review
// ----------------------------------------------------------------------------
// Appelée par un SUPERADMIN depuis la page Gérance pour VALIDER ou REFUSER une
// demande de réclamation soumise.
//   action = "approve" -> sort le tenant de la gérance (managed_by_mycambo=false,
//                         claimed_at=now), invitation -> approved, email asso.
//   action = "reject"  -> invitation -> rejected (+ motif), email asso.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ to, subject, html }),
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
    if (authErr || !user || user.app_metadata?.role !== "superadmin") {
      return json({ error: "FORBIDDEN" }, 403);
    }

    const { invitation_id, action, rejection_reason } = await req.json();
    if (!invitation_id || !["approve", "reject"].includes(action)) {
      return json({ error: "PARAMS_INVALIDES" }, 400);
    }

    const { data: inv } = await admin
      .from("claim_invitations")
      .select("*, tenants(id, name, email)")
      .eq("id", invitation_id)
      .maybeSingle();
    if (!inv) return json({ error: "DEMANDE_INTROUVABLE" }, 404);
    if (inv.status !== "submitted") {
      return json({ error: "ETAT_INVALIDE", status: inv.status }, 409);
    }

    const tenant = (inv as any).tenants;

    if (action === "approve") {
      // Sortir le tenant de la gérance
      await admin
        .from("tenants")
        .update({ managed_by_mycambo: false, claimed_at: new Date().toISOString() })
        .eq("id", inv.tenant_id);

      await admin
        .from("claim_invitations")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", invitation_id);

      await sendEmail(
        inv.invited_email,
        "Votre accès myCAMBO est validé ✅",
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
            <h1 style="margin:0;font-size:20px">✅ Accès validé</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${tenant.name}</strong>,</p>
            <p>Votre demande d'accès a été validée par myCAMBO. Vous pouvez
            désormais gérer votre fiche depuis votre espace partenaire.</p>
            <p style="text-align:center;margin:24px 0">
              <a href="${Deno.env.get("SITE_URL") || "https://dev.mycambo.net"}/espace-partenaire/connexion"
                 style="display:inline-block;background:#1B3A6B;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">
                Accéder à mon espace →
              </a>
            </p>
          </div>
        </div>`
      );

      return json({ ok: true, status: "approved" }, 200);
    }

    // action === "reject"
    await admin
      .from("claim_invitations")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null,
      })
      .eq("id", invitation_id);

    await sendEmail(
      inv.invited_email,
      "Votre demande d'accès myCAMBO",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:20px">Demande d'accès</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Bonjour <strong>${tenant.name}</strong>,</p>
          <p>Votre demande d'accès n'a pas pu être validée${
            rejection_reason ? ` : <em>${rejection_reason}</em>` : "."
          }</p>
          <p>Pour toute question, contactez-nous à contact@mycambo.net.</p>
        </div>
      </div>`
    );

    return json({ ok: true, status: "rejected" }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
