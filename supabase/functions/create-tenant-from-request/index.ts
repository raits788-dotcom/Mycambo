import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Génère un mot de passe temporaire fort
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
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
      userId = existing.id;
      tempPassword = "(existant — mot de passe inchangé)";
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
      // Catégorie de la demande -> category_id
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", request.category)
        .maybeSingle();

      // Photos éventuelles de la demande (extérieur / intérieur)
      const reqPhotos = [request.photo_exterior_url, request.photo_interior_url]
        .filter((u: unknown): u is string => typeof u === "string" && u.length > 0);

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

        const { error: estErr } = await supabase.from("businesses").insert({
          tenant_id: tenantId,
          name,
          slug: estSlug,
          category_id: cat?.id ?? null,
          description: request.message || null,
          address: est?.address || null,
          city: est?.city || request.city || null,
          phone: request.phone || request.legal_representative_phone || null,
          email: request.email || null,
          website: request.website_url || null,
          photos: reqPhotos,
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

    return new Response(JSON.stringify({
      success: true,
      tenant_id: tenantId,
      tenant_slug: tenantSlug,
      user_id: userId,
      user_email: request.email,
      temp_password: isNewUser ? tempPassword : null,
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
