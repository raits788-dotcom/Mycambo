import { createClient } from './supabase';

function getSupabase() {
  return createClient();
}

// ============================================================================
// TENANTS
// ============================================================================
export async function getTenants() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenants')
    .select('*, plans(name)')
    .order('created_at', { ascending: false });
if (error) { 
  console.error('getTenants error:', JSON.stringify(error, null, 2));
  console.error('error.message:', error.message);
  console.error('error.code:', error.code);
  console.error('error.details:', error.details);
  console.error('error.hint:', error.hint);
  return []; 
}
  return data || [];
}

export async function getTenant(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenants').select('*').eq('id', id).single();
  if (error) { console.error('getTenant error:', error); return null; }
  return data;
}

export async function getTenantBusinesses(tenantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select('*, categories(name, color)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getTenantBusinesses error:', error); return []; }
  return data || [];
}

export async function getTenantPayments(tenantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getTenantPayments error:', error); return []; }
  return data || [];
}

export async function getTenantSubscription(tenantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(name, price_monthly)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('getTenantSubscription error:', error); return null; }
  return data;
}

// ============================================================================
// BUSINESSES
// ============================================================================
export async function getBusinesses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select('*, categories(name, color), tenants(name)')
    .order('created_at', { ascending: false });
  if (error) { console.error('getBusinesses error:', error); return []; }
  return data || [];
}

// ============================================================================
// PARTNER REQUESTS
// ============================================================================
export async function getPartnerRequests() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('partner_requests').select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getPartnerRequests error:', error); return []; }
  return data || [];
}

// ============================================================================
// PLANS
// ============================================================================
export async function getPlans() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('plans').select('*').order('position', { ascending: true });
  if (error) { console.error('getPlans error:', error); return []; }
  return data || [];
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================
export async function getSubscriptions() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(name, price_monthly), tenants(name, id)')
    .order('current_period_end', { ascending: false });
  if (error) { console.error('getSubscriptions error:', error); return []; }
  return data || [];
}

// ============================================================================
// PAYMENTS
// ============================================================================
export async function getPayments() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('payments')
    .select('*, tenants(name, id)')
    .order('created_at', { ascending: false });
  if (error) { console.error('getPayments error:', error); return []; }
  return data || [];
}

// ============================================================================
// CATEGORIES
// ============================================================================
export async function getCategories() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories').select('*').order('position', { ascending: true });
  if (error) { console.error('getCategories error:', error); return []; }
  return data || [];
}

// ============================================================================
// CAROUSEL SLIDES
// ============================================================================
export async function getCarouselSlides() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('carousel_slides').select('*').order('position', { ascending: true });
  if (error) { console.error('getCarouselSlides error:', error); return []; }
  return data || [];
}

// ============================================================================
// CMS PAGES
// ============================================================================
export async function getCmsPages() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('cms_pages').select('*').order('updated_at', { ascending: false });
  if (error) { console.error('getCmsPages error:', error); return []; }
  return data || [];
}

// ============================================================================
// AUDIT LOGS
// ============================================================================
export async function getAuditLogs(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('audit_logs').select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getAuditLogs error:', error); return []; }
  return data || [];
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================
export async function getDashboardStats() {
  const supabase = getSupabase();
  const [tenants, businesses, subscriptions, payments] = await Promise.all([
    supabase.from('tenants').select('id, status', { count: 'exact' }),
    supabase.from('businesses').select('id, status', { count: 'exact' }),
    supabase.from('subscriptions').select('id, status', { count: 'exact' }),
    supabase.from('payments').select('amount, status, paid_at'),
  ]);

  const tenantsActive = (tenants.data || []).filter((t: any) => t.status === 'active').length;
  const businessesTotal = businesses.data?.length || 0;
  const subsActive = (subscriptions.data || []).filter(
    (s: any) => s.status === 'active' || s.status === 'expiring'
  ).length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = (payments.data || [])
    .filter((p: any) => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= monthStart)
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  return {
    tenantsTotal: tenants.data?.length || 0,
    tenantsActive,
    businessesTotal,
    subscriptionsActive: subsActive,
    monthlyRevenue,
  };
}

// ============================================================================
// FEATURED BUSINESSES
// ============================================================================
export async function getFeaturedBusinesses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select('*, categories(name, color), tenants(name)')
    .eq('is_featured', true)
    .order('featured_position', { ascending: true });
  if (error) { console.error('getFeaturedBusinesses error:', error); return []; }
  return data || [];
}

// ============================================================================
// ADMIN USERS
// ============================================================================
export async function getAdminUsers() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('actor_id, actor_type')
    .eq('actor_type', 'superadmin')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('getAdminUsers error:', error); return []; }
  return data || [];
}

// ═══════════════════════════════════════════════════════════
// CITIES
// ═══════════════════════════════════════════════════════════
export async function getCities() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('getCities error:', error);
    return [];
  }

  const citiesWithCount = await Promise.all(
    (data || []).map(async (city: any) => {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', city.name);

      return { ...city, count: count || 0 };
    })
  );

  return citiesWithCount;
}
// ============================================================================
// IMPERSONATION
// ============================================================================
export async function startImpersonation(tenantId: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/impersonate-tenant`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'IMPERSONATION_FAILED');
  return data as { token: string; expiresAt: string; tenantId: string; tenantName: string };
}
// ============================================================================
// RESET PASSWORD
// ============================================================================
export async function resetTenantAdminPassword(tenantId: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reset-admin-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'RESET_FAILED');
  return data as { success: boolean; email: string };
}
// ============================================================================
// TENANTS CRUD
// ============================================================================
export async function createTenant(payload: {
  name: string; email: string; phone?: string;
  city?: string; address?: string; plan_id?: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_create_tenant', {
    p_name: payload.name,
    p_email: payload.email,
    p_phone: payload.phone || null,
    p_city: payload.city || null,
    p_address: payload.address || null,
    p_plan_id: payload.plan_id || null,
  });
  if (error) throw error;
  return data as string;
}

export async function deleteTenant(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_delete_tenant', { p_tenant_id: id });
  if (error) throw error;
}
// ============================================================================
// PLANS CRUD
// ============================================================================
export async function createPlan(payload: {
  name: string; slug?: string; price_monthly: number;
  price_yearly?: number; max_businesses: number;
  features: string[]; trial_days?: number;
}) {
  const supabase = getSupabase();
  const slug = payload.slug || payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data, error } = await supabase.from('plans').insert({
    name: payload.name,
    slug,
    price_monthly: payload.price_monthly,
    price_yearly: payload.price_yearly || null,
    max_businesses: payload.max_businesses,
    features: payload.features,
    trial_days: payload.trial_days || 0,
    is_active: true,
    position: 99,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlan(id: string, payload: Partial<{
  name: string; price_monthly: number; price_yearly: number | null;
  max_businesses: number; features: string[]; is_active: boolean;
  trial_days: number;
}>) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plans').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deletePlan(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plans').delete().eq('id', id);
  if (error) throw error;
}
