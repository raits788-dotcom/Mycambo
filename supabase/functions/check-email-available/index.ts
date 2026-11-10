// ============================================================================
// Edge Function : check-email-available
// ----------------------------------------------------------------------------
// Vérifie (service_role) si un email peut être utilisé pour une NOUVELLE demande
// partenaire. Renvoie { available: boolean, reason }.
// Indisponible si :
//   - un compte Auth existe déjà pour cet email, OU
//   - une demande partenaire est déjà en attente ou approuvée pour cet email.
// Garantit l'unicité d'un email dans le système.
// Verify JWT OFF (page publique de demande).
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return json({ available: false, reason: "INVALID_EMAIL" }, 400);
    }
    const normalized = email.trim().toLowerCase();

    // 1. Compte Auth déjà existant ?
    const { data: users } = await admin.auth.admin.listUsers();
    const exists = users?.users?.some((u) => (u.email || "").toLowerCase() === normalized);
    if (exists) return json({ available: false, reason: "ACCOUNT_EXISTS" });

    // 2. Demande déjà en attente ou approuvée ?
    const { data: reqRows } = await admin
      .from("partner_requests")
      .select("id, status")
      .eq("email", normalized)
      .in("status", ["pending", "approved"]);
    if (reqRows && reqRows.length > 0) {
      return json({ available: false, reason: "REQUEST_EXISTS" });
    }

    return json({ available: true });
  } catch (err) {
    return json({ available: false, reason: String(err) }, 500);
  }
});
