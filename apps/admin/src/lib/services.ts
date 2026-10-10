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
// ============================================================================
// PLAN FEATURES (catalogue)
// ============================================================================
export async function getPlanFeatures() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('plan_features')
    .select('*')
    .order('position', { ascending: true });
  if (error) { console.error('getPlanFeatures:', error); return []; }
  return data || [];
}

export async function createPlanFeature(payload: {
  code: string; label: string; description?: string;
  category: string; metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('plan_features').insert({
    code: payload.code,
    label: payload.label,
    description: payload.description || null,
    category: payload.category,
    metadata: payload.metadata || {},
    is_active: true,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlanFeature(id: string, payload: Partial<{
  label: string; description: string; category: string;
  metadata: Record<string, unknown>; is_active: boolean;
}>) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plan_features').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deletePlanFeature(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plan_features').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// PLAN VERSIONS
// ============================================================================
export async function getPlanVersions(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('plan_versions')
    .select('*')
    .eq('plan_id', planId)
    .order('version', { ascending: false });
  if (error) { console.error('getPlanVersions:', error); return []; }
  return data || [];
}

export async function getCurrentPlanVersion(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('plan_versions')
    .select('*')
    .eq('plan_id', planId)
    .eq('status', 'current')
    .maybeSingle();
  if (error) { console.error('getCurrentPlanVersion:', error); return null; }
  return data;
}

export async function getPlansWithCurrentVersion() {
  const supabase = getSupabase();
  const { data: plans, error: plansErr } = await supabase
    .from('plans')
    .select('*')
    .order('position', { ascending: true });
  if (plansErr) { console.error('getPlansWithCurrentVersion:', plansErr); return []; }

  const { data: versions, error: versErr } = await supabase
    .from('plan_versions')
    .select('*')
    .eq('status', 'current');
  if (versErr) { console.error('versions:', versErr); return plans || []; }

  const { data: features } = await supabase
    .from('plan_features')
    .select('*');

  return (plans || []).map((p: any) => {
    const v = (versions || []).find((ver: any) => ver.plan_id === p.id);
    const featureIds: string[] = v?.feature_ids || [];
    const planFeatures = (features || []).filter((f: any) => featureIds.includes(f.id));
    return {
      ...p,
      current_version: v || null,
      features_details: planFeatures,
    };
  });
}

export async function createPlanWithVersion(payload: {
  name: string; price_monthly: number; price_yearly: number | null;
  max_businesses: number; trial_days: number; feature_ids: string[];
  audience?: 'business' | 'association';
}) {
  const supabase = getSupabase();

  // 1. Insère le plan (audience incluse)
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .insert({
      name: payload.name,
      slug,
      price_monthly: payload.price_monthly,
      price_yearly: payload.price_yearly,
      max_businesses: payload.max_businesses,
      features: [],
      trial_days: payload.trial_days,
      is_active: true,
      position: 99,
      audience: payload.audience || 'business',
    })
    .select()
    .single();

  if (planErr) throw planErr;

  // 2. Crée la version 1
  const { error: verErr } = await supabase
    .from('plan_versions')
    .insert({
      plan_id: plan.id,
      version: 1,
      price_monthly: payload.price_monthly,
      price_yearly: payload.price_yearly,
      max_businesses: payload.max_businesses,
      trial_days: payload.trial_days,
      feature_ids: payload.feature_ids,
      status: 'current',
    });

  if (verErr) throw verErr;

  // 3. Log audit
  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'plan.create',
    entity_type: 'plan',
    entity_id: plan.id,
  });

  return plan.id;
}

export async function createNewPlanVersion(payload: {
  plan_id: string; price_monthly: number; price_yearly: number | null;
  max_businesses: number; trial_days: number; feature_ids: string[];
  notes?: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_create_plan_version', {
    p_plan_id: payload.plan_id,
    p_price_monthly: payload.price_monthly,
    p_price_yearly: payload.price_yearly,
    p_max_businesses: payload.max_businesses,
    p_trial_days: payload.trial_days,
    p_feature_ids: payload.feature_ids,
    p_notes: payload.notes || null,
  });
  if (error) throw error;
  return data as string;
}

export async function migrateSubscriptionsToCurrentVersion(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_migrate_subscriptions_to_current_version', {
    p_plan_id: planId,
  });
  if (error) throw error;
  return data as number;
}
// ============================================================================
// REFERRAL / PARRAINAGE
// ============================================================================
export async function getReferralSettings() {
  const supabase = getSupabase();
  const { data } = await supabase.from('referral_settings').select('*').eq('id', 1).maybeSingle();
  return data || { enabled: true, referee_discount_percent: 10 };
}

export async function updateReferralSettings(payload: {
  enabled: boolean; referee_discount_percent: number;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('referral_settings').update({
    ...payload, updated_at: new Date().toISOString(),
  }).eq('id', 1);
  if (error) throw error;
}

export async function getReferralTiers() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('referral_tiers')
    .select('*')
    .order('tier_order', { ascending: true });
  if (error) { console.error('getReferralTiers:', error); return []; }
  return data || [];
}

export async function createReferralTier(payload: {
  tier_order: number; referrals_required: number;
  reward_type: 'discount_percent' | 'free_months';
  reward_value: number; badge_name?: string; badge_color?: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('referral_tiers').insert(payload);
  if (error) throw error;
}

export async function updateReferralTier(id: string, payload: Partial<{
  tier_order: number; referrals_required: number;
  reward_type: 'discount_percent' | 'free_months';
  reward_value: number; badge_name: string; badge_color: string;
  is_active: boolean;
}>) {
  const supabase = getSupabase();
  const { error } = await supabase.from('referral_tiers').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteReferralTier(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('referral_tiers').delete().eq('id', id);
  if (error) throw error;
}

export async function getReferrals() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referrer:tenants!referrals_referrer_tenant_id_fkey(id, name, email),
      referred:tenants!referrals_referred_tenant_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false });
  if (error) { console.error('getReferrals:', error); return []; }
  return data || [];
}

export async function getReferralsStats() {
  const supabase = getSupabase();
  const { data } = await supabase.from('referrals').select('status');
  const all = data || [];
  return {
    total: all.length,
    pending: all.filter((r: any) => r.status === 'pending').length,
    qualified: all.filter((r: any) => r.status === 'qualified').length,
    cancelled: all.filter((r: any) => r.status === 'cancelled').length,
  };
}

export async function getReferralCodes() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*, tenants(name, email)')
    .order('created_at', { ascending: false });
  if (error) { console.error('getReferralCodes:', error); return []; }
  return data || [];
}
// ============================================================================
// AUDIENCE (business / association)
// ============================================================================
export async function getPlansByAudience(audience: 'business' | 'association') {
  const supabase = getSupabase();

  const { data: plans, error: plansErr } = await supabase
    .from('plans')
    .select('*')
    .eq('audience', audience)
    .order('position', { ascending: true });

  if (plansErr) { console.error('getPlansByAudience:', plansErr); return []; }

  const { data: versions } = await supabase
    .from('plan_versions')
    .select('*')
    .eq('status', 'current');

  const { data: features } = await supabase
    .from('plan_features')
    .select('*');

  return (plans || []).map((p: any) => {
    const v = (versions || []).find((ver: any) => ver.plan_id === p.id);
    const featureIds: string[] = v?.feature_ids || [];
    const planFeatures = (features || []).filter((f: any) => featureIds.includes(f.id));
    return { ...p, current_version: v || null, features_details: planFeatures };
  });
}

export async function getReferralBadgeForTenant(tenantId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .rpc('count_qualified_referrals', { p_tenant_id: tenantId });
  return (data as number) || 0;
}
// ============================================================================
// VALIDATION TENANT (approve / reject)
// ============================================================================
export async function approveTenant(tenantId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId);

  if (error) throw error;

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'tenant.approve',
    entity_type: 'tenant',
    entity_id: tenantId,
  });
}

export async function suspendTenant(tenantId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tenants')
    .update({ status: 'suspended' })
    .eq('id', tenantId);

  if (error) throw error;

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'tenant.suspend',
    entity_type: 'tenant',
    entity_id: tenantId,
  });
}
// ============================================================================
// NIVEAUX DE VÉRIFICATION
// ============================================================================
export const VERIFICATION_LEVELS = {
  inscrit:   { label: 'Inscrit',   badge: 'Inscrit',    color: '#9CA3AF', bg: 'bg-gray-100',   text: 'text-gray-700'   },
  verifie:   { label: 'Vérifié',   badge: 'Bronze',     color: '#CD7F32', bg: 'bg-amber-100',  text: 'text-amber-800'  },
  premium:   { label: 'Premium',   badge: 'Silver',     color: '#C0C0C0', bg: 'bg-slate-100',  text: 'text-slate-700'  },
  exception: { label: 'Exception', badge: 'Gold',       color: '#FFD700', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  legende:   { label: 'Légende',   badge: 'Platine',    color: '#E5E4E2', bg: 'bg-cyan-100',   text: 'text-cyan-800'   },
} as const;

export type VerificationLevel = keyof typeof VERIFICATION_LEVELS;

export async function changeVerificationLevel(
  tenantId: string,
  newLevel: VerificationLevel,
  reason?: string
) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_change_verification_level', {
    p_tenant_id: tenantId,
    p_new_level: newLevel,
    p_reason: reason || null,
  });
  if (error) throw error;
}

export async function getVerificationHistory(tenantId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('verification_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

// ============================================================================
// SOUS-LABELS
// ============================================================================
export async function getLabelCatalog() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('label_catalog')
    .select('*')
    .order('position', { ascending: true });
  if (error) { console.error('getLabelCatalog:', error); return []; }
  return data || [];
}

export async function createLabel(payload: {
  code: string; name: string; description?: string;
  icon?: string; color?: string; category: string;
  is_paid?: boolean;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('label_catalog').insert({
    code: payload.code,
    name: payload.name,
    description: payload.description || null,
    icon: payload.icon || null,
    color: payload.color || '#1B3A6B',
    category: payload.category,
    is_paid: payload.is_paid || false,
    is_active: true,
  });
  if (error) throw error;
}

export async function updateLabel(id: string, payload: Partial<{
  name: string; description: string; icon: string;
  color: string; category: string; is_paid: boolean; is_active: boolean;
}>) {
  const supabase = getSupabase();
  const { error } = await supabase.from('label_catalog').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteLabel(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('label_catalog').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// ATTRIBUTION LABELS AUX TENANTS
// ============================================================================
export async function getTenantLabels(tenantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenant_labels')
    .select('*, label:label_catalog(*)')
    .eq('tenant_id', tenantId);
  if (error) { console.error('getTenantLabels:', error); return []; }
  return data || [];
}

export async function toggleTenantLabel(
  tenantId: string,
  labelId: string,
  attach: boolean
) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_set_tenant_label', {
    p_tenant_id: tenantId,
    p_label_id: labelId,
    p_attach: attach,
  });
  if (error) throw error;
}

// ============================================================================
// FILE D'ATTENTE VÉRIFICATIONS
// ============================================================================
export async function getPendingVerifications() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('verification_level', 'inscrit')
    .order('created_at', { ascending: false });
  if (error) { console.error('getPendingVerifications:', error); return []; }
  return data || [];
}

export async function getPendingCount() {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('verification_level', 'inscrit');
  return count || 0;
}
