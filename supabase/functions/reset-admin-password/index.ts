import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user || user.app_metadata?.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id } = await req.json();
    if (!tenant_id) {
      return new Response(JSON.stringify({ error: "tenant_id requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tenantUser } = await supabase
      .from("tenant_users")
      .select("user_id, role, tenants(email, name)")
      .eq("tenant_id", tenant_id)
      .in("role", ["owner", "admin"])
      .limit(1)
      .maybeSingle();

    if (!tenantUser) {
      return new Response(JSON.stringify({ error: "OWNER_NOT_FOUND" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tenant = tenantUser.tenants as any;

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: tenant.email,
      options: {
        redirectTo: `${Deno.env.get("SITE_URL") || "https://mycambo.net"}/espace-partenaire/connexion`,
      },
    });

    if (linkErr) throw linkErr;

    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: tenant.email,
        subject: "Réinitialisation de votre mot de passe myCAMBO",
        html: `<p>Bonjour ${tenant.name},</p>
               <p>Un SuperAdmin a demandé la réinitialisation de votre mot de passe.</p>
               <p><a href="${linkData.properties.action_link}">Cliquez ici pour définir un nouveau mot de passe</a></p>
               <p>Ce lien expire dans 24h.</p>`,
        tenant_id,
      }),
    });

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_type: "superadmin",
      action: "reset_password",
      entity_type: "tenant",
      entity_id: tenant_id,
    });

    return new Response(JSON.stringify({ success: true, email: tenant.email }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});