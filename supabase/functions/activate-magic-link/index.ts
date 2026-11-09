// ============================================================================
// Edge Function : activate-magic-link
// ----------------------------------------------------------------------------
// Consomme un lien magique (30j, usage unique) et définit le mot de passe du
// partenaire. Deux actions :
//   - { action: "check", token }   -> vérifie la validité du lien (sans le
//     consommer) : renvoie { ok, email } ou { ok:false, error }.
//   - { action: "set", token, password } -> consomme le lien, pose le mot de
//     passe, active le compte. Renvoie { ok, email }.
// Verify JWT OFF (appelée par une page publique).
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { action, token, password } = await req.json();
    if (!token) {
      return json({ ok: false, error: "MISSING_TOKEN" }, 400);
    }
    const tokenHash = await sha256(token);

    // CHECK : valide sans consommer (lecture directe).
    if (action === "check") {
      const { data: row } = await admin
        .from("magic_links").select("email, used_at, expires_at")
        .eq("token_hash", tokenHash).maybeSingle();
      if (!row) return json({ ok: false, error: "INVALID" });
      if (row.used_at) return json({ ok: false, error: "USED" });
      if (new Date(row.expires_at) < new Date()) return json({ ok: false, error: "EXPIRED" });
      return json({ ok: true, email: row.email });
    }

    // SET : consomme le lien (usage unique) puis pose le mot de passe.
    if (action === "set") {
      if (!password || String(password).length < 8) {
        return json({ ok: false, error: "WEAK_PASSWORD" }, 400);
      }
      const { data: consumed } = await admin.rpc("consume_magic_link", { p_token_hash: tokenHash });
      if (!consumed?.ok) {
        return json({ ok: false, error: consumed?.error || "INVALID" });
      }
      const { error: updErr } = await admin.auth.admin.updateUserById(consumed.user_id, {
        password,
        email_confirm: true,
        user_metadata: { must_change_password: false },
      });
      if (updErr) return json({ ok: false, error: "SET_FAILED", details: updErr.message }, 500);

      // Active le tenant lié à cet email (si en attente).
      await admin.from("tenants").update({ status: "active" }).eq("email", consumed.email).eq("status", "pending");

      return json({ ok: true, email: consumed.email });
    }

    return json({ ok: false, error: "UNKNOWN_ACTION" }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
