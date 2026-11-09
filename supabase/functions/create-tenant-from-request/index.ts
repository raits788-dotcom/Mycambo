import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Génère un mot de passe temporaire fort (fallback interne).
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Token court (22 caractères URL-safe) : assez court pour que l'URL complète
// tienne sur UNE ligne et ne soit pas coupée par l'encodage quoted-printable
// des emails (qui brise les longues URLs). ~130 bits d'entropie, sûr.
function shortToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Crée un lien magique (30 jours, usage unique) et renvoie l'URL COURTE.
async function createMagicLink(
  supabase: any, userId: string, email: string, siteUrl: string
): Promise<string> {
  const rawToken = shortToken();
  const tokenHash = await sha256(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("magic_links").insert({
    user_id: userId,
    email,
    token_hash: tokenHash,
    purpose: "partner_activation",
    expires_at: expiresAt,
  });
  // Route COURTE /a/<token> -> page d'activation. URL totale ~50 caractères.
  return `${siteUrl}/a/${rawToken}`;
}

// Slugifie un nom (accents, espaces -> tirets).
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request } = await supabase
      .from("partner_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (!request) {
      return new Response(JSON.stringify({ error: "REQUEST_NOT_FOUND" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Est-ce une association ? (détermine la formule par défaut)
    const isAssociation = request.category === "association";

    // ─── 1. Vérifie si l'utilisateur existe déjà ─────────────────────────
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId: string;
    let tempPassword: string;
    let isNewUser = false;

    const existing = existingUsers?.users?.find((u) => u.email === request.email);

    if (existing) {
      // L'utilisateur existe déjà : on régénère un mot de passe temporaire
      // et on force son changement. Ainsi un partenaire approuvé a TOUJOURS
      // un accès, qu'il soit nouveau ou déjà présent (évite le blocage
      // « compte existe mais pas de mot de passe »).
      userId = existing.id;
      tempPassword = generateTempPassword();
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          ...(existing.user_metadata || {}),
          must_change_password: true,
          from_partner_request: request_id,
        },
      });
      if (updErr) {
        return new Response(JSON.stringify({
          error: "USER_UPDATE_FAILED",
          details: updErr.message,
        }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      isNewUser = false;
    } else {
      // Crée un utilisateur avec mot de passe temporaire
      tempPassword = generateTempPassword();
      const { data: newUser, error: userErr } = await supabase.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: request.legal_representative_name || request.company_name,
          must_change_password: true,
          from_partner_request: request_id,
        },
      });

      if (userErr || !newUser.user) {
        return new Response(JSON.stringify({
          error: "USER_CREATE_FAILED",
          details: userErr?.message,
        }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = newUser.user.id;
      isNewUser = true;
    }

    // ─── 2. Crée le tenant ───────────────────────────────────────────────
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id, slug")
      .eq("email", request.email)
      .maybeSingle();

    let tenantId: string;
    let tenantSlug: string;

    if (existingTenant) {
      tenantId = existingTenant.id;
      tenantSlug = existingTenant.slug;
    } else {
      const baseSlug = slugify(request.company_name);
      tenantSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .insert({
          slug: tenantSlug,
          name: request.company_name,
          email: request.email,
          phone: request.phone || request.legal_representative_phone,
          city: request.city,
          address: request.establishments?.[0]?.address || null,
          status: "pending",
          verification_level: "inscrit",
          structure_type: request.structure_type,
          registration_authority: request.registration_authority,
        })
        .select()
        .single();

      if (tenantErr) {
        return new Response(JSON.stringify({
          error: "TENANT_CREATE_FAILED",
          details: tenantErr.message,
        }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      tenantId = tenant.id;
    }

    // ─── 3. Lie l'utilisateur au tenant ──────────────────────────────────
    const { data: existingLink } = await supabase
      .from("tenant_users")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingLink) {
      await supabase.from("tenant_users").insert({
        tenant_id: tenantId,
        user_id: userId,
        role: "owner",
      });
    }

    // ─── 4. Formule par défaut selon la catégorie ────────────────────────
    //   association -> plan "association" (gratuit, dédié)
    //   commerce    -> plan "decouverte" (gratuit, limité ; upgrade ensuite)
    const defaultSlug = isAssociation ? "association" : "decouverte";
    const { data: defaultPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", defaultSlug)
      .maybeSingle();

    if (defaultPlan) {
      await supabase.from("tenants").update({
        plan_id: defaultPlan.id,
      }).eq("id", tenantId);
    }

    // ─── 5. Crée les établissements déclarés (en brouillon) ──────────────
    //   On ne crée que ceux qui n'existent pas déjà (idempotent).
    //   Statut 'pending' : non publiés tant qu'un admin ne les valide pas.
    const declared = Array.isArray(request.establishments) ? request.establishments : [];
    let createdEstablishments = 0;

    if (declared.length > 0) {
      // Fallback : catégorie au niveau demande (anciennes demandes sans
      // category_id par établissement).
      const { data: fallbackCat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", request.category)
        .maybeSingle();

      // Photos au niveau demande (fallback pour anciennes demandes).
      const reqPhotos = [request.photo_exterior_url, request.photo_interior_url]
        .filter((u: unknown): u is string => typeof u === "string" && u.length > 0);

      // Résout un category_id à partir de ce que porte l'établissement :
      //  - est.category_id direct (nouveau format)
      //  - sinon est.category (slug) -> id
      //  - sinon la catégorie de la demande (fallback)
      async function resolveCategoryId(est: any): Promise<string | null> {
        if (est?.category_id) return est.category_id;
        if (est?.category) {
          const { data: c } = await supabase
            .from("categories").select("id").eq("slug", est.category).maybeSingle();
          if (c?.id) return c.id;
        }
        return fallbackCat?.id ?? null;
      }

      for (const est of declared) {
        const name = (est?.name || "").trim();
        if (!name) continue;

        // déjà créé ? (même nom pour ce tenant)
        const { data: already } = await supabase
          .from("businesses")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("name", name)
          .maybeSingle();
        if (already) continue;

        const estSlug = `${slugify(name)}-${Math.random().toString(36).substring(2, 8)}`;
        const categoryId = await resolveCategoryId(est);

        // Photos : par établissement si fournies, sinon celles de la demande.
        const estPhotos = Array.isArray(est?.photos) && est.photos.length
          ? est.photos.filter((u: unknown): u is string => typeof u === "string" && u.length > 0)
          : reqPhotos;

        // Champs détails (étape « Détails ») -> alimentent la fiche publique.
        // services est un objet { "<label>": true } (format de la table businesses).
        const servicesArr = Array.isArray(est?.services) ? est.services : [];
        const servicesObj: Record<string, boolean> = {};
        for (const s of servicesArr) if (typeof s === "string") servicesObj[s] = true;
        const languages = Array.isArray(est?.languages) ? est.languages : [];

        const { error: estErr } = await supabase.from("businesses").insert({
          tenant_id: tenantId,
          name,
          slug: estSlug,
          category_id: categoryId,
          // accroche -> description ; présentation -> long_description
          description: est?.tagline || est?.description || request.message || null,
          long_description: est?.description || null,
          address: est?.address || null,
          city: est?.city || request.city || null,
          phone: est?.public_phone || est?.phone || request.phone || request.legal_representative_phone || null,
          email: est?.public_email || est?.email || request.email || null,
          website: est?.website_url || request.website_url || null,
          // hours est jsonb : une chaîne JSON scalaire est acceptée et
          // formatHours() côté front sait l'afficher telle quelle.
          hours: est?.hours ? est.hours : null,
          services: Object.keys(servicesObj).length ? servicesObj : null,
          price_range: est?.price_range || null,
          languages: languages.length ? languages : null,
          photos: estPhotos,
          status: "pending",
        });
        if (!estErr) createdEstablishments++;
      }
    }

    // ─── 6. Log audit ────────────────────────────────────────────────────
    await supabase.from("audit_logs").insert({
      actor_type: "system",
      action: "partner_request.approved",
      entity_type: "tenant",
      entity_id: tenantId,
      changes: {
        request_id,
        company_name: request.company_name,
        user_created: isNewUser,
        plan: defaultSlug,
        establishments_created: createdEstablishments,
      },
    });

    // ─── 7. Lien magique d'accès (30 jours, usage unique) ────────────────
    const siteUrl = Deno.env.get("SITE_URL") || "https://dev.mycambo.net";
    let magicLink: string | null = null;
    try {
      magicLink = await createMagicLink(supabase, userId, request.email, siteUrl);
    } catch (_e) {
      magicLink = null; // on garde temp_password en secours
    }

    return new Response(JSON.stringify({
      success: true,
      tenant_id: tenantId,
      tenant_slug: tenantSlug,
      user_id: userId,
      user_email: request.email,
      // Lien magique = moyen d'accès principal ; temp_password reste en
      // secours si la génération du lien a échoué.
      magic_link: magicLink,
      temp_password: tempPassword,
      is_new_user: isNewUser,
      plan: defaultSlug,
      establishments_created: createdEstablishments,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
