// ═══════════════════════════════════════════════════════════
// Edge Function : send-email
// Rôle : Envoyer des emails via SMTP Hostinger
// ═══════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ─── Configuration CORS ───────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Types ────────────────────────────────────────────────
interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  tenant_id?: string;
}

// ─── Handler principal ────────────────────────────────────
serve(async (req) => {
  // Réponse aux requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Récupérer les données
    const { to, subject, html, tenant_id }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants (to, subject, html)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Configurer le client SMTP Hostinger
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
        port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER") || "",
          password: Deno.env.get("SMTP_PASS") || "",
        },
      },
    });

    // 3. Envoyer l'email
    const from = Deno.env.get("EMAIL_FROM") || "contact@mycambo.net";

    await client.send({
      from: `My Cambo <${from}>`,
      to,
      subject,
      html,
      content: "auto",
    });

    await client.close();

    // 4. Logger dans emails_log (succès)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    await supabase.from("emails_log").insert({
      tenant_id: tenant_id || null,
      direction: "sent",
      recipient: to,
      sender: from,
      subject,
      body_preview: html.substring(0, 200),
      status: "sent",
    });

    // 5. Réponse succès
    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erreur envoi email :", error);

    // Logger l'erreur dans emails_log
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );
      await supabase.from("emails_log").insert({
        direction: "sent",
        recipient: "unknown",
        sender: Deno.env.get("EMAIL_FROM") || "contact@mycambo.net",
        subject: "Erreur envoi",
        body_preview: String(error),
        status: "failed",
        error_message: String(error),
      });
    } catch (logError) {
      console.error("Erreur log :", logError);
    }

    return new Response(
      JSON.stringify({ error: "Erreur d'envoi", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});