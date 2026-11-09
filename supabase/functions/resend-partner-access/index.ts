// ============================================================================
// Edge Function : resend-partner-access
// ----------------------------------------------------------------------------
// Appelée depuis la console superadmin : régénère un lien magique (30j, usage
// unique) pour le partenaire d'un tenant et l'envoie par email.
// Verify JWT OFF (l'appel porte le token superadmin en Authorization, mais on
// valide surtout via service_role ; le bouton n'est visible qu'en console).
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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { tenant_id, email } = await req.json();
    const targetEmail = email || (await admin.from("tenants").select("email").eq("id", tenant_id).maybeSingle()).data?.email;
    if (!targetEmail) return json({ ok: false, error: "EMAIL_NOT_FOUND" }, 404);

    // Retrouve le user Auth.
    const { data: users } = await admin.auth.admin.listUsers();
    const u = users?.users?.find((x) => x.email === targetEmail);
    if (!u) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    const rawToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await admin.from("magic_links").insert({
      user_id: u.id, email: targetEmail, token_hash: tokenHash,
      purpose: "partner_activation", expires_at: expiresAt,
    });
    const link = `${siteUrl}/espace-partenaire/activer?token=${rawToken}`;

    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        to: targetEmail,
        subject: "myCAMBO — Votre lien d'accès partenaire",
        html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1B3A6B;">
          <div style="background:#1B3A6B;padding:20px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:18px;">Votre accès partenaire</h1></div>
          <div style="border:1px solid #E6E9EF;border-top:none;border-radius:0 0 12px 12px;padding:22px;">
            <p style="font-size:14px;color:#5A6578;">Cliquez pour activer votre compte et définir votre mot de passe :</p>
            <p style="text-align:center;margin:18px 0;"><a href="${link}" style="background:#1B3A6B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:24px;display:inline-block;">Activer mon accès</a></p>
            <p style="font-size:12px;color:#9AA4B4;">Lien valable 30 jours, utilisable une seule fois.</p>
          </div></div>`,
      }),
    });

    return json({ ok: true, email: targetEmail });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});
