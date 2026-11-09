// ============================================================================
// Edge Function : notify-partner-decision
// ----------------------------------------------------------------------------
// Envoie l'email de décision (approuvée / refusée) à un demandeur partenaire.
//
// APPROUVÉE : l'email affiche TOUJOURS le mot de passe temporaire. La fonction
// create-tenant-from-request (re)génère systématiquement un mot de passe
// temporaire — y compris pour un compte déjà existant — et le renvoie dans
// temp_password. L'ancien comportement « compte existe déjà, mot de passe
// habituel » bloquait les comptes sans mot de passe utilisable ; on l'abandonne.
//
// Réutilise l'Edge Function send-email (SMTP). Verify JWT OFF.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function approvedEmailHtml(
  name: string, email: string, magicLink: string | null, tempPassword: string, portalUrl: string
): string {
  // Accès principal = lien magique (bouton). Le mot de passe temporaire n'est
  // montré qu'en secours, si la génération du lien a échoué.
  const accessBlock = magicLink
    ? `
      <p style="text-align:center;margin:22px 0;">
        <a href="${magicLink}" style="background:#1B3A6B;color:#fff;text-decoration:none;font-weight:bold;padding:14px 30px;border-radius:24px;display:inline-block;font-size:15px;">
          Activer mon accès
        </a>
      </p>
      <p style="font-size:12px;color:#9AA4B4;text-align:center;margin:0 0 8px;">
        Ce lien est valable 30 jours et utilisable une seule fois. Vous définirez votre mot de passe en cliquant.
      </p>`
    : `
      <div style="background:#EEF3FB;border-left:4px solid #1B3A6B;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:bold;">Vos identifiants de connexion</p>
        <p style="margin:0 0 4px;font-size:13px;color:#5A6578;">Email : <strong>${email}</strong></p>
        <p style="margin:0;font-size:13px;color:#5A6578;">Mot de passe temporaire :
          <strong style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #E6E9EF;">${tempPassword}</strong>
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:#9AA4B4;">À changer à la première connexion.</p>
      </div>
      <p style="text-align:center;margin:22px 0;">
        <a href="${portalUrl}" style="background:#1B3A6B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:24px;display:inline-block;">Me connecter</a>
      </p>`;

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;color:#1B3A6B;">
    <div style="background:#35A85B;padding:22px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🎉 Bienvenue sur myCAMBO !</h1>
    </div>
    <div style="border:1px solid #E6E9EF;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <p style="font-size:15px;">Bonjour <strong>${name}</strong>,</p>
      <p style="font-size:14px;line-height:1.6;color:#5A6578;">
        Nous avons le plaisir de vous annoncer que votre demande de partenariat a été
        <strong style="color:#35A85B;">approuvée</strong> !
      </p>

      ${accessBlock}

      <div style="background:#EEF3FB;border-left:4px solid #1B3A6B;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:bold;">Prochaines étapes :</p>
        <ol style="margin:0;padding-left:18px;font-size:13px;color:#1B3A6B;line-height:1.8;">
          <li>Activez votre accès et définissez votre mot de passe</li>
          <li>Choisissez une formule d'abonnement</li>
          <li>Complétez vos établissements</li>
        </ol>
      </div>

      <p style="font-size:12px;color:#9AA4B4;margin-top:24px;text-align:center;">
        Pour toute question, contactez-nous à contact@mycambo.net
      </p>
    </div>
  </div>`;
}

function rejectedEmailHtml(name: string, reason: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;color:#1B3A6B;">
    <div style="background:#1B3A6B;padding:22px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">myCAMBO — Suite de votre demande</h1>
    </div>
    <div style="border:1px solid #E6E9EF;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <p style="font-size:15px;">Bonjour <strong>${name}</strong>,</p>
      <p style="font-size:14px;line-height:1.6;color:#5A6578;">
        Après étude, nous ne pouvons pas donner suite à votre demande de partenariat pour le moment.
      </p>
      ${reason ? `<div style="background:#F5F7FA;border:1px solid #E6E9EF;border-radius:8px;padding:14px;margin:16px 0;font-size:13px;color:#5A6578;"><strong>Motif :</strong> ${reason}</div>` : ""}
      <p style="font-size:13px;color:#5A6578;">
        Vous pouvez nous recontacter à contact@mycambo.net pour plus d'informations.
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

    const body = await req.json();
    const { request_id, decision, magic_link, temp_password, reason } = body;

    // Récupère la demande pour le nom + l'email.
    const { data: reqRow, error } = await admin
      .from("partner_requests")
      .select("email, legal_representative_name, company_name, legal_name, rejection_reason")
      .eq("id", request_id)
      .maybeSingle();
    if (error || !reqRow) {
      return new Response(JSON.stringify({ error: "REQUEST_NOT_FOUND" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = reqRow.legal_representative_name || reqRow.company_name || reqRow.legal_name || "";
    const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
    const portalUrl = `${siteUrl}/espace-partenaire/connexion`;
    const sendEmailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let subject: string;
    let html: string;

    if (decision === "approved") {
      subject = "myCAMBO — Votre demande de partenariat est approuvée 🎉";
      html = approvedEmailHtml(name, reqRow.email, magic_link || null, temp_password || "—", portalUrl);
    } else {
      subject = "myCAMBO — Suite de votre demande de partenariat";
      html = rejectedEmailHtml(name, reason || reqRow.rejection_reason || "");
    }

    const res = await fetch(sendEmailUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: reqRow.email, subject, html }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: "EMAIL_SEND_FAILED", details: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
