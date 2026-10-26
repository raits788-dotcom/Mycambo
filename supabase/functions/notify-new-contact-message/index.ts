import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { business_id } = await req.json();
    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer le business + le tenant
    const { data: business } = await supabase
      .from("businesses")
      .select("name, email, tenant_id, tenants(name, email)")
      .eq("id", business_id)
      .single();

    if (!business) throw new Error("BUSINESS_NOT_FOUND");

    // Récupérer le dernier message
    const { data: message } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("business_id", business_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!message) throw new Error("MESSAGE_NOT_FOUND");

    // Email au tenant
    const tenantEmail = (business.tenants as any)?.email;
    if (tenantEmail) {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: tenantEmail,
          subject: `Nouveau message pour ${business.name}`,
          html: `
            <h2>Nouveau message reçu</h2>
            <p><b>Établissement :</b> ${business.name}</p>
            <p><b>Client :</b> ${message.name}</p>
            <p><b>Email :</b> ${message.email}</p>
            <p><b>Sujet :</b> ${message.subject}</p>
            <p><b>Message :</b> ${message.message}</p>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});