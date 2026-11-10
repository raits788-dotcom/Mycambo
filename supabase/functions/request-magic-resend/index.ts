// ============================================================================
// Edge Function : request-magic-resend
// ----------------------------------------------------------------------------
// Renvoi sécurisé d'un lien magique pour un partenaire dont le lien a expiré
// ou a déjà été utilisé, MAIS dont le compte n'est pas encore activé.
//
// Trois actions :
//   - { action: "send_code", email } : si un compte partenaire non activé
//     existe pour cet email, envoie un code à 6 chiffres par email. Réponse
//     volontairement neutre (ne révèle pas si l'email existe).
//   - { action: "verify_code", email, code } : vérifie le code ; si bon,
//     génère un NOUVEAU lien magique (30j, usage unique) et l'envoie par email.
//
// Verify JWT OFF (page publique).
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

// Token court URL-safe (22 car.) pour que le lien tienne sur une ligne.
function shortToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
  const sendEmailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  async function sendEmail(to: string, subject: string, html: string) {
    await fetch(sendEmailUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to, subject, html }),
    });
  }

  // Éligible UNIQUEMENT si :
  //   1. il existe une demande partenaire APPROUVÉE pour cet email,
  //   2. un tenant existe pour cet email et n'est PAS encore activé,
  //   3. le compte Auth existe.
  // Sinon -> null (réponse neutre). Ferme la faille : un email quelconque
  // (ex. créé par /inscription) ne peut plus obtenir de lien.
  async function findEligibleUser(email: string): Promise<{ userId: string } | null> {
    // 1. demande approuvée ?
    const { data: reqRow } = await admin
      .from("partner_requests")
      .select("id, status").eq("email", email).eq("status", "approved")
      .maybeSingle();
    if (!reqRow) return null;

    // 2. tenant existant non activé ?
    const { data: tenant } = await admin
      .from("tenants").select("id, status").eq("email", email).maybeSingle();
    if (!tenant) return null;
    if (tenant.status === "active") return null; // déjà activé -> connexion normale

    // 3. compte Auth existant ?
    const { data: users } = await admin.auth.admin.listUsers();
    const u = users?.users?.find((x) => x.email === email);
    if (!u) return null;

    return { userId: u.id };
  }

  try {
    const { action, email, code } = await req.json();
    if (!email) return json({ ok: false, error: "MISSING_EMAIL" }, 400);

    if (action === "send_code") {
      const eligible = await findEligibleUser(email);
      // Réponse neutre dans tous les cas (anti-énumération).
      if (eligible) {
        const plain = String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
        const codeHash = await sha256(plain);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
        await admin.from("email_verification_codes").insert({
          email, code_hash: codeHash, purpose: "magic_resend", expires_at: expiresAt,
        });
        await sendEmail(
          email,
          "myCAMBO — Votre code de vérification",
          `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1B3A6B;">
             <div style="background:#1B3A6B;padding:20px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:18px;">Code de vérification</h1></div>
             <div style="border:1px solid #E6E9EF;border-top:none;border-radius:0 0 12px 12px;padding:22px;">
               <p style="font-size:14px;color:#5A6578;">Voici votre code pour recevoir un nouveau lien d'accès :</p>
               <p style="font-size:30px;font-weight:bold;letter-spacing:8px;text-align:center;margin:18px 0;color:#1B3A6B;">${plain}</p>
               <p style="font-size:12px;color:#9AA4B4;">Ce code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
             </div>
           </div>`
        );
      }
      return json({ ok: true }); // toujours neutre
    }

    if (action === "verify_code") {
      if (!code) return json({ ok: false, error: "MISSING_CODE" }, 400);
      const codeHash = await sha256(String(code));
      // Dernier code non utilisé pour cet email.
      const { data: rows } = await admin
        .from("email_verification_codes")
        .select("*")
        .eq("email", email).eq("purpose", "magic_resend").is("used_at", null)
        .order("created_at", { ascending: false }).limit(1);
      const row = rows?.[0];
      if (!row) return json({ ok: false, error: "NO_CODE" });
      if (new Date(row.expires_at) < new Date()) return json({ ok: false, error: "EXPIRED" });
      if (row.attempts >= 5) return json({ ok: false, error: "TOO_MANY" });

      if (row.code_hash !== codeHash) {
        await admin.from("email_verification_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
        return json({ ok: false, error: "WRONG_CODE" });
      }

      // Code OK -> marque utilisé + génère un nouveau lien magique.
      await admin.from("email_verification_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

      const eligible = await findEligibleUser(email);
      if (!eligible) return json({ ok: false, error: "NOT_ELIGIBLE" });

      const rawToken = shortToken();
      const tokenHash = await sha256(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await admin.from("magic_links").insert({
        user_id: eligible.userId, email, token_hash: tokenHash,
        purpose: "partner_activation", expires_at: expiresAt,
      });
      const link = `${siteUrl}/a/${rawToken}`;
      await sendEmail(
        email,
        "myCAMBO — Votre nouveau lien d'accès",
        `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1B3A6B;">
           <div style="background:#35A85B;padding:20px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:18px;">Votre nouvel accès</h1></div>
           <div style="border:1px solid #E6E9EF;border-top:none;border-radius:0 0 12px 12px;padding:22px;">
             <p style="font-size:14px;color:#5A6578;">Cliquez pour activer votre compte et définir votre mot de passe :</p>
             <p style="text-align:center;margin:18px 0;"><a href="${link}" style="background:#1B3A6B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:24px;display:inline-block;">Activer mon accès</a></p>
             <p style="font-size:12px;color:#9AA4B4;">Lien valable 30 jours, utilisable une seule fois.</p>
           </div>
         </div>`
      );
      return json({ ok: true });
    }

    return json({ ok: false, error: "UNKNOWN_ACTION" }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});
