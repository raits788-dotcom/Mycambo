// ============================================================================
// Edge Function : claim-submit
// ----------------------------------------------------------------------------
// Appelée quand l'asso (compte créé via claim-open) soumet sa demande pour
// validation par myCAMBO. Vérifie que le compte appelant est bien celui lié à
// l'invitation, enregistre le justificatif éventuel, passe en "submitted".
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Identifier l'appelant (l'asso connectée)
    const { data: { user }, error: authErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "NON_AUTHENTIFIE" }, 401);

    const { invitation_id, justificatif_url } = await req.json();
    if (!invitation_id) return json({ error: "invitation_id requis" }, 400);

    const { data: inv } = await admin
      .from("claim_invitations")
      .select("id, requester_user_id, status")
      .eq("id", invitation_id)
      .maybeSingle();
    if (!inv) return json({ error: "DEMANDE_INTROUVABLE" }, 404);
    if (inv.requester_user_id !== user.id) return json({ error: "INTERDIT" }, 403);
    if (inv.status !== "account_created") {
      return json({ error: "ETAT_INVALIDE", status: inv.status }, 409);
    }

    const { error } = await admin
      .from("claim_invitations")
      .update({
        status: "submitted",
        justificatif_url: justificatif_url || null,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", invitation_id);
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
