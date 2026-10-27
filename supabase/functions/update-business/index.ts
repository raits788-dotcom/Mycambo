// ============================================================================
// Edge Function : update-business
// ----------------------------------------------------------------------------
// Permet à un SUPERADMIN en impersonation (token d'impersonation valide) de
// modifier une fiche `businesses` du tenant impersonné, en écrivant avec le
// service_role (qui ignore la RLS). Sécurité :
//   - le token d'impersonation doit exister et ne pas être expiré ;
//   - l'UPDATE est restreint aux fiches dont le tenant_id == tenant du token
//     (le superadmin ne peut donc écrire que dans le tenant où il est entré) ;
//   - seuls des champs en liste blanche sont modifiables.
// Les écritures d'un VRAI partenaire (session Supabase normale) ne passent PAS
// par ici : elles vont directement en base et sont couvertes par la RLS.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Champs qu'un partenaire / superadmin a le droit de modifier sur sa fiche.
const ALLOWED_FIELDS = new Set<string>([
  "name",
  "description",
  "short_description",
  "long_description",
  "founded_year",
  "address",
  "city",
  "lat",
  "lng",
  "phone",
  "email",
  "website",
  "whatsapp",
  "facebook",
  "instagram",
  "photos",
  "hours",
  "services",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => null);
    const token: string | undefined = body?.token;
    const businessId: string | undefined = body?.business_id;
    const rawPayload: Record<string, unknown> = body?.payload ?? {};

    if (!token || !businessId) {
      return json({ error: "token et business_id requis" }, 400);
    }

    // 1. Valider le token d'impersonation (existe + non expiré)
    const { data: tok, error: tokErr } = await admin
      .from("impersonation_tokens")
      .select("tenant_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (tokErr || !tok) {
      return json({ error: "TOKEN_INVALIDE" }, 403);
    }
    if (new Date(tok.expires_at) < new Date()) {
      return json({ error: "TOKEN_EXPIRE" }, 403);
    }

    // 2. Filtrer le payload sur la liste blanche
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawPayload)) {
      if (ALLOWED_FIELDS.has(k)) payload[k] = v;
    }
    if (Object.keys(payload).length === 0) {
      return json({ error: "AUCUN_CHAMP_MODIFIABLE" }, 400);
    }

    // 3. UPDATE restreint : la fiche DOIT appartenir au tenant du token.
    const { data, error } = await admin
      .from("businesses")
      .update(payload)
      .eq("id", businessId)
      .eq("tenant_id", tok.tenant_id)
      .select("id");

    if (error) {
      return json({ error: error.message }, 500);
    }
    if (!data || data.length === 0) {
      return json(
        { error: "FICHE_INTROUVABLE_OU_HORS_TENANT" },
        404
      );
    }

    return json({ ok: true, id: data[0].id }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
