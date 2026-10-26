import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, token, business_name } = await req.json();

    if (!email || !token || !business_name) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants (email, token, business_name)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construire l'URL de vérification
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verifier-email-contact?token=${token}`;

    // Envoyer l'email au client
    const emailRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: email,
        subject: `Vérifiez votre demande pour ${business_name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
              <h1 style="margin:0;font-size:20px">Vérifiez votre demande</h1>
            </div>
            <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p>Bonjour,</p>
              <p>Vous avez envoyé une demande à <b>${business_name}</b>.</p>
              <p>Pour valider votre demande, cliquez sur le lien ci-dessous :</p>
              <p style="text-align:center;margin:24px 0">
                <a href="${verifyUrl}" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">
                  Vérifier mon email →
                </a>
              </p>
              <p style="font-size:12px;color:#6b7280">
                Ce lien expire dans 24h. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      throw new Error("Échec de l'envoi de l'email de vérification");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});