// ============================================================================
// Edge Function : send-renewal-reminders
// ----------------------------------------------------------------------------
// Envoie les emails de relance de renouvellement (abonnement annuel) aux
// tenants dont l'abonnement expire sous 30 jours.
//
// Garde-fous :
//   - Mode "auto" (cron) : n'envoie QUE si le réglage renewal_emails_enabled
//     vaut 'true' dans platform_settings.
//   - Mode "manual" (bouton admin) : { mode: "manual" } force l'envoi même si
//     le flag est désactivé (action explicite d'un admin).
//
// Email trilingue : Français · English · ភាសាខ្មែរ.
// Réutilise l'Edge Function send-email (SMTP) pour l'envoi réel.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function renewalEmailHtml(name: string, endDate: string, portalUrl: string): string {
  const d = new Date(endDate).toLocaleDateString("fr-FR");
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a3a6b;">
    <div style="background:linear-gradient(135deg,#1a3a6b,#c0392b);padding:22px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">myCAMBO</h1>
    </div>
    <div style="border:1px solid #e6e9ef;border-top:none;border-radius:0 0 12px 12px;padding:24px;">

      <!-- Français -->
      <p style="font-size:15px;"><strong>Bonjour ${name},</strong></p>
      <p style="font-size:14px;line-height:1.6;color:#5a6578;">
        Votre abonnement myCAMBO arrive à échéance le <strong>${d}</strong>.
        Pensez à le renouveler pour garder votre établissement visible en ligne.
      </p>
      <p style="text-align:center;margin:22px 0;">
        <a href="${portalUrl}" style="background:#1a3a6b;color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:24px;display:inline-block;">
          Renouveler mon abonnement
        </a>
      </p>

      <hr style="border:none;border-top:1px solid #e6e9ef;margin:20px 0;">

      <!-- English -->
      <p style="font-size:14px;line-height:1.6;color:#5a6578;">
        <strong>Hello ${name},</strong><br>
        Your myCAMBO subscription expires on <strong>${d}</strong>.
        Please renew it to keep your listing visible online.
      </p>

      <hr style="border:none;border-top:1px solid #e6e9ef;margin:20px 0;">

      <!-- ភាសាខ្មែរ -->
      <p style="font-size:14px;line-height:1.7;color:#5a6578;">
        <strong>សួស្តី ${name},</strong><br>
        ការជាវ myCAMBO របស់អ្នកនឹងផុតកំណត់នៅថ្ងៃ <strong>${d}</strong>។
        សូមបន្តការជាវ ដើម្បីរក្សាទំព័ររបស់អ្នកឱ្យនៅលើអ៊ីនធឺណិត។
      </p>

      <p style="font-size:12px;color:#9aa4b4;margin-top:24px;text-align:center;">
        myCAMBO — Tout le Cambodge dans votre poche
      </p>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "manual" ? "manual" : "auto";

    // En mode auto, on respecte le flag d'activation.
    if (mode === "auto") {
      const { data: setting } = await admin
        .from("platform_settings")
        .select("value")
        .eq("key", "renewal_emails_enabled")
        .maybeSingle();
      if ((setting?.value ?? "false") !== "true") {
        return new Response(
          JSON.stringify({ skipped: true, reason: "DISABLED", sent: 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Abonnements à relancer (vue créée en migration 0031).
    const { data: rows, error } = await admin
      .from("subscriptions_to_remind")
      .select("*");
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
    const portalUrl = `${siteUrl}/espace-partenaire/dashboard`;
    const sendEmailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let sent = 0;
    const errors: string[] = [];

    for (const r of rows || []) {
      try {
        const res = await fetch(sendEmailUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            to: r.tenant_email,
            subject: "myCAMBO — Renouvellement de votre abonnement / Subscription renewal",
            html: renewalEmailHtml(r.tenant_name || "", r.current_period_end, portalUrl),
            tenant_id: r.tenant_id,
          }),
        });
        if (res.ok) sent++;
        else errors.push(`${r.tenant_email}: HTTP ${res.status}`);
      } catch (e) {
        errors.push(`${r.tenant_email}: ${String(e)}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, mode, candidates: rows?.length || 0, sent, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
