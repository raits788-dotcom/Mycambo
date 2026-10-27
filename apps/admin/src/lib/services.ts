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
  if (error) { console.error('getTenants error:', error); return []; }
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
    .select('*, categories(name, color), plans(name, slug, price_monthly)')
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
    .select('*, categories(name, color), tenants(name), plans(name)')
    .order('created_at', { ascending: false });
  if (error) { console.error('getBusinesses error:', error); return []; }
  return data || [];
}

// ============================================================================
// PARTNER REQUESTS (liste)
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
    .select('*, plans(name, price_monthly), tenants(name, id), businesses(name, id)')
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
    .select('*, tenants(name, id), businesses(name, id)')
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
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });
  if (error) {
    console.error('getCategories error:', error);
    return [];
  }
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

// ============================================================================
// CITIES
// ============================================================================
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
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  description?: string;
  structure_type?: string;
  plan_id?: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_create_tenant', {
    p_name: payload.name,
    p_email: payload.email,
    p_phone: payload.phone || null,
    p_city: payload.city || null,
    p_address: payload.address || null,
    p_description: payload.description || null,
    p_structure_type: payload.structure_type || 'commercial',
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

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'plan.create',
    entity_type: 'plan',
    entity_id: plan.id,
  });

  return plan.id;
}

// Publie une nouvelle version de formule via la fonction SQL migrée
// publish_plan_version : archive l'ancienne "current", crée la nouvelle.
// Les abonnements en cours gardent leur version (plan_version_id figé).
export async function createNewPlanVersion(payload: {
  plan_id: string; price_monthly: number; price_yearly: number | null;
  max_businesses: number; trial_days: number; feature_ids: string[];
  notes?: string;
}) {
  const supabase = getSupabase();
  // Récupérer les permissions actuelles de la formule pour les transmettre
  const { data: plan } = await supabase
    .from('plans')
    .select('permissions, features')
    .eq('id', payload.plan_id)
    .maybeSingle();

  const { data, error } = await supabase.rpc('publish_plan_version', {
    p_plan_id: payload.plan_id,
    p_price_monthly: payload.price_monthly,
    p_price_yearly: payload.price_yearly,
    p_max_businesses: payload.max_businesses,
    p_permissions: plan?.permissions ?? {},
    p_features: plan?.features ?? [],
  });
  if (error) throw error;
  if (data && (data as any).ok === false) throw new Error((data as any).error);
  return (data as any)?.version_id as string;
}

// Migrer les abonnements en cours vers la version courante (option explicite
// du superadmin : "appliquer aussi aux abonnements existants").
export async function migrateSubscriptionsToCurrentVersion(planId: string) {
  const supabase = getSupabase();
  // Repointe les souscriptions actives du plan vers sa version "current".
  const { data: cur } = await supabase
    .from('plan_versions')
    .select('id')
    .eq('plan_id', planId)
    .eq('status', 'current')
    .maybeSingle();
  if (!cur) return 0;
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan_version_id: cur.id })
    .eq('plan_id', planId)
    .in('status', ['active', 'expiring'])
    .select('id');
  if (error) throw error;
  return (data || []).length;
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
export async function getPendingCount() {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('verification_level', 'inscrit');
  return count || 0;
}

// ============================================================================
// CHANGEMENT EMAIL PARTENAIRE
// ============================================================================
export async function updateTenantEmail(tenantId: string, newEmail: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-update-tenant-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId, new_email: newEmail }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'EMAIL_UPDATE_FAILED');
  return data;
}

// ============================================================================
// MODIFICATION REQUESTS
// ============================================================================
export async function getModificationRequests(status?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from('modification_requests')
    .select(`
      *,
      tenant:tenants!modification_requests_tenant_id_fkey(id, name, email),
      business:businesses!modification_requests_business_id_fkey(id, name, slug)
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) { console.error('getModificationRequests:', error); return []; }
  return data || [];
}

export async function getModificationRequestsCount() {
  const supabase = getSupabase();
  const { count } = await supabase
    .from('modification_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  return count || 0;
}

export async function approveModificationRequest(requestId: string, notes?: string) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_approve_modification_request', {
    p_request_id: requestId,
    p_notes: notes || null,
  });
  if (error) throw error;
}

export async function rejectModificationRequest(requestId: string, reason: string) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_reject_modification_request', {
    p_request_id: requestId,
    p_reason: reason,
  });
  if (error) throw error;
}

// ============================================================================
// STORAGE SETTINGS
// ============================================================================
export async function getStorageSettings() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('storage_settings')
    .select('*')
    .eq('is_active', true)
    .order('bucket_name');
  if (error) { console.error('getStorageSettings:', error); return []; }
  return data || [];
}

export async function updateStorageSetting(payload: {
  bucket_name: string;
  max_size_bytes: number;
  allowed_formats: string[];
  recommended_width?: number;
  recommended_height?: number;
  description?: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_update_storage_setting', {
    p_bucket_name: payload.bucket_name,
    p_max_size_bytes: payload.max_size_bytes,
    p_allowed_formats: payload.allowed_formats,
    p_recommended_width: payload.recommended_width || null,
    p_recommended_height: payload.recommended_height || null,
    p_description: payload.description || null,
  });
  if (error) throw error;
}

export async function getStorageUsage() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-storage-usage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'STORAGE_CHECK_FAILED');
  return data as {
    success: boolean;
    total_size_mb: string;
    file_count: number;
    percentage: string;
    alerts_sent: number[];
  };
}

export async function getStorageAlerts(limit = 20) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('storage_alerts')
    .select('*')
    .order('notified_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getStorageAlerts:', error); return []; }
  return data || [];
}

// ============================================================================
// PARTNER REQUESTS — Approbation / Refus
// ============================================================================
export async function approvePartnerRequest(requestId: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const { error: updateErr } = await supabase
    .from('partner_requests')
    .update({
      status: 'approved',
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateErr) throw updateErr;

  const tenantRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-tenant-from-request`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ request_id: requestId }),
    }
  );

  const tenantData = await tenantRes.json();
  if (!tenantRes.ok) throw new Error(tenantData.error || 'TENANT_CREATE_FAILED');

  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-partner-decision`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        decision: 'approved',
        temp_password: tenantData.temp_password || null,
        is_new_user: tenantData.is_new_user || false,
      }),
    }
  );

  return tenantData;
}

export async function rejectPartnerRequest(requestId: string, reason: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const { error } = await supabase
    .from('partner_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;

  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-partner-decision`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        decision: 'rejected',
        rejection_reason: reason,
      }),
    }
  );
}

export async function getPartnerRequestById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('partner_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('getPartnerRequestById:', error); return null; }
  return data;
}

// ============================================================================
// SUPPRESSION DEMANDE PARTENAIRE
// ============================================================================
export async function deletePartnerRequest(requestId: string) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const { data: req } = await supabase
    .from('partner_requests')
    .select('company_name, email')
    .eq('id', requestId)
    .maybeSingle();

  const { error } = await supabase
    .from('partner_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert({
      actor_id: session.user.id,
      actor_type: 'superadmin',
      action: 'partner_request.delete',
      entity_type: 'partner_request',
      entity_id: requestId,
      changes: { company_name: req?.company_name, email: req?.email },
    });
  } catch (logErr) {
    console.warn('Audit log failed:', logErr);
  }
}

// ============================================================================
// VÉRIFICATIONS — 3 VUES (par ÉTABLISSEMENT)
// ============================================================================

/**
 * Onglet 1 : Dossiers soumis (à traiter en priorité)
 */
export async function getSubmittedVerifications() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenant_verifications')
    .select(`
      *,
      business:businesses!tenant_verifications_business_id_fkey(
        id, name, email, city, phone, status, tenant_id
      ),
      tenant:tenants!tenant_verifications_tenant_id_fkey(
        id, name, email
      )
    `)
    .eq('status', 'submitted')
    .not('business_id', 'is', null)
    .order('last_submitted_at', { ascending: false });

  if (error) { console.error('getSubmittedVerifications:', error); return []; }
  return data || [];
}

/**
 * Onglet 2 : Établissements sans dossier soumis (en attente)
 */
export async function getPendingVerifications() {
  const supabase = getSupabase();

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id, name, email, city, phone, status, tenant_id, plan_id, created_at,
      tenants!businesses_tenant_id_fkey(id, name, email, managed_by_mycambo),
      tenant_verifications(status, last_submitted_at, business_id)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) { console.error('getPendingVerifications:', error); return []; }

  return (businesses || []).filter((b: any) => {
    // Les fiches en gérance myCAMBO (import en masse, non réclamées) ne sont
    // pas en "attente de dossier" : personne ne gère encore leur vérification.
    const t = Array.isArray(b.tenants) ? b.tenants[0] : b.tenants;
    if (t?.managed_by_mycambo) return false;

    const verif = Array.isArray(b.tenant_verifications)
      ? b.tenant_verifications.find((v: any) => v.business_id === b.id)
      : (b.tenant_verifications?.business_id === b.id ? b.tenant_verifications : null);
    return !verif || verif.status === 'incomplete' || verif.status === 'rejected';
  });
}

/**
 * Onglet 3 : Historique des vérifications
 */
export async function getVerificationHistoryList(limit = 100) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenant_verifications')
    .select(`
      *,
      business:businesses!tenant_verifications_business_id_fkey(id, name),
      tenant:tenants!tenant_verifications_tenant_id_fkey(id, name, email)
    `)
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('getVerificationHistoryList:', error); return []; }
  return data || [];
}

/**
 * Relance par email un établissement sans dossier (tenant + établissement)
 */
export async function remindTenantToSubmitVerification(
  tenantId: string,
  businessId?: string,
  businessEmail?: string
) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, email')
    .eq('id', tenantId)
    .single();

  if (!tenant) throw new Error('TENANT_NOT_FOUND');

  const emailSubject = `[MyCambo] Complétez votre dossier de vérification`;
  const emailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1B3A6B;color:white;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px">📋 Dossier à compléter</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p>Bonjour <strong>${tenant.name}</strong>,</p>
        <p>Votre établissement n'a pas encore soumis son dossier de vérification.</p>
        <p>Pour apparaître dans l'annuaire et bénéficier de toutes les fonctionnalités, complétez votre dossier :</p>
        <p style="text-align:center;margin:24px 0">
          <a href="https://dev.mycambo.net/espace-partenaire/verification" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">
            Compléter mon dossier →
          </a>
        </p>
        <p style="font-size:12px;color:#9ca3af">Pour toute question : contact@mycambo.net</p>
      </div>
    </div>
  `;

  // 1. Email au tenant (contact principal)
  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        to: tenant.email,
        subject: emailSubject,
        html: emailHtml,
      }),
    }
  );

  // 2. Email à l'établissement (si différent)
  if (businessEmail && businessEmail !== tenant.email) {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: businessEmail,
          subject: emailSubject,
          html: emailHtml,
        }),
      }
    );
  }

  // 3. Log audit
  await supabase.from('audit_logs').insert({
    actor_id: session.user.id,
    actor_type: 'superadmin',
    action: 'verification.reminder_sent',
    entity_type: 'tenant',
    entity_id: tenantId,
    changes: { business_id: businessId, business_email: businessEmail },
  });

  return { success: true };
}

/**
 * Approuver une vérification (passe au niveau supérieur)
 */
export async function approveVerification(verifId: string, businessId: string, notes?: string) {
  const supabase = getSupabase();

  await supabase
    .from('tenant_verifications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || null,
    })
    .eq('id', verifId);

  await supabase
    .from('businesses')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', businessId);

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'business.verify',
    entity_type: 'business',
    entity_id: businessId,
  });
}

/**
 * Refuser une vérification
 */
export async function rejectVerification(verifId: string, reason: string) {
  const supabase = getSupabase();
  await supabase
    .from('tenant_verifications')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', verifId);
}

// ============================================================================
// NOTIFICATIONS ADMIN
// ============================================================================
export async function getAdminNotifications(filter?: 'all' | 'unread') {
  const supabase = getSupabase();
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_type', 'superadmin')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter === 'unread') {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) { console.error('getAdminNotifications:', error); return []; }
  return data || [];
}

export async function markNotificationAsRead(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsAsRead(recipientType: 'superadmin' | 'tenant' | 'user') {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('recipient_type', recipientType)
    .eq('is_read', false);
  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
// ============================================================================
// SOUSCRIPTIONS — Création / Mise à jour
// ============================================================================

/**
 * Crée ou met à jour une souscription pour un établissement
 */
export async function createOrUpdateSubscription(payload: {
  businessId: string;
  tenantId: string;
  planId: string;
  amount: number;
}) {
  const supabase = createClient();

  // 1. Vérifier si une souscription existe déjà pour ce business
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('business_id', payload.businessId)
    .maybeSingle();

  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  if (existing) {
    // Mise à jour
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: payload.planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: oneMonthLater.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;

    // Créer un paiement
    await supabase.from('payments').insert({
      tenant_id: payload.tenantId,
      business_id: payload.businessId,
      subscription_id: existing.id,
      amount: payload.amount,
      currency: 'USD',
      method: 'manual',
      status: 'pending',
    });

    return existing.id;
  }

  // Création
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .insert({
      tenant_id: payload.tenantId,
      business_id: payload.businessId,
      plan_id: payload.planId,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: oneMonthLater.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Créer un paiement
  await supabase.from('payments').insert({
    tenant_id: payload.tenantId,
    business_id: payload.businessId,
    subscription_id: sub.id,
    amount: payload.amount,
    currency: 'USD',
    method: 'manual',
    status: 'pending',
  });

  return sub.id;
}

// ============================================================================
// MOT DE PASSE — Changement
// ============================================================================

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/espace-partenaire/changer-mot-de-passe`,
  });
  if (error) throw error;
}

// ============================================================================
// SUPPRESSION DE COMPTE — Demande
// ============================================================================

/**
 * Crée une demande de suppression de compte
 */
export async function requestAccountDeletion(payload: {
  tenantId: string;
  reason: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.from('deletion_requests').insert({
    tenant_id: payload.tenantId,
    reason: payload.reason,
    status: 'pending',
  });

  if (error) throw error;
}
// ============================================================================
// VALIDATION MANUELLE D'UN PAIEMENT
// ============================================================================
export async function validatePaymentManually(paymentId: string) {
  const supabase = getSupabase();

  // 1. Récupérer le paiement
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('*, subscriptions(id, business_id)')
    .eq('id', paymentId)
    .single();

  if (payErr || !payment) throw new Error('PAYMENT_NOT_FOUND');
  if (payment.status === 'paid') throw new Error('ALREADY_PAID');

  // 2+3. Valider le paiement de façon atomique : paiement -> paid,
  // souscription -> active pour 1 AN, tenant -> active (fonction SQL dédiée).
  const { data: result, error: rpcErr } = await supabase.rpc('validate_manual_payment', {
    p_payment: paymentId,
  });
  if (rpcErr) throw rpcErr;
  if (result && result.ok === false) throw new Error(result.error || 'VALIDATION_FAILED');

  // 4. Publier l'établissement
  if (payment.business_id) {
    await supabase
      .from('businesses')
      .update({ status: 'approved' })
      .eq('id', payment.business_id);
  }

  // 5. Log audit
  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'payment.validate_manual',
    entity_type: 'payment',
    entity_id: paymentId,
    changes: { amount: payment.amount, method: payment.method },
  });

  return { success: true };
}
// ============================================================================
// ANNULATION D'UN PAIEMENT
// ============================================================================
export async function cancelPaymentManually(paymentId: string, reason: string) {
  const supabase = getSupabase();

  // 1. Récupérer le paiement
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('*, subscriptions(id, business_id)')
    .eq('id', paymentId)
    .single();

  if (payErr || !payment) throw new Error('PAYMENT_NOT_FOUND');
  if (payment.status !== 'paid') throw new Error('NOT_PAID_YET');

  // 2. Mettre à jour le paiement
  const now = new Date().toISOString();
  await supabase
    .from('payments')
    .update({ 
      status: 'refunded',
      failure_reason: reason,
      updated_at: now,
    })
    .eq('id', paymentId);

  // 3. Mettre à jour la souscription (repasse en 'cancelled')
  if (payment.subscription_id) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        canceled_at: now,
      })
      .eq('id', payment.subscription_id);
  }

  // 4. Dépublier l'établissement
  if (payment.business_id) {
    await supabase
      .from('businesses')
      .update({ status: 'pending' })
      .eq('id', payment.business_id);
  }

  // 5. Log audit
  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'payment.cancel_manual',
    entity_type: 'payment',
    entity_id: paymentId,
    changes: { reason, amount: payment.amount },
  });

  return { success: true };
}
// ============================================================================
// ÉTABLISSEMENTS — Actions admin
// ============================================================================
export async function updateBusinessStatus(businessId: string, status: 'approved' | 'pending' | 'suspended') {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', businessId);
  
  if (error) throw error;

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: `business.${status}`,
    entity_type: 'business',
    entity_id: businessId,
  });
}

export async function toggleFeatured(businessId: string) {
  const supabase = getSupabase();
  const { data: business } = await supabase
    .from('businesses')
    .select('is_featured')
    .eq('id', businessId)
    .single();

  if (!business) throw new Error('BUSINESS_NOT_FOUND');

  const { error } = await supabase
    .from('businesses')
    .update({ is_featured: !business.is_featured })
    .eq('id', businessId);

  if (error) throw error;
}

// Ajoute un établissement aux coups de cœur (persiste en base + position en fin de liste).
export async function addFeatured(businessId: string) {
  const supabase = getSupabase();
  // Prochaine position = max + 1
  const { data: maxRow } = await supabase
    .from('businesses')
    .select('featured_position')
    .eq('is_featured', true)
    .order('featured_position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = ((maxRow?.featured_position as number) ?? 0) + 1;
  const { error } = await supabase
    .from('businesses')
    .update({ is_featured: true, featured_position: nextPos })
    .eq('id', businessId);
  if (error) throw error;
}

// Retire un établissement des coups de cœur (persiste en base).
export async function removeFeatured(businessId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('businesses')
    .update({ is_featured: false, featured_position: null })
    .eq('id', businessId);
  if (error) throw error;
}

// Change l'ordre d'affichage d'un coup de cœur.
export async function setFeaturedPosition(businessId: string, position: number) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('businesses')
    .update({ featured_position: position })
    .eq('id', businessId);
  if (error) throw error;
}
// ============================================================================
// CATÉGORIES — CRUD
// ============================================================================
export async function createCategory(payload: {
  name: string;
  icon: string;
  color: string;
  position?: number;
  parent_id?: string | null;
}) {
  const supabase = getSupabase();

  // Génère le slug à partir du nom
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: payload.name,
      slug,
      icon: payload.icon,
      color: payload.color,
      position: payload.position || 99,
      is_active: true,
      parent_id: payload.parent_id || null,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('audit_logs').insert({
    actor_type: 'superadmin',
    action: 'category.create',
    entity_type: 'category',
    entity_id: data.id,
    changes: { name: payload.name },
  });

  return data;
}

export async function updateCategory(id: string, payload: Partial<{
  name: string;
  icon: string;
  color: string;
  position: number;
  is_active: boolean;
  parent_id: string | null;
}>) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const supabase = getSupabase();

  // Vérifier qu'aucun business n'utilise cette catégorie
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count && count > 0) {
    throw new Error(`Impossible de supprimer : ${count} établissement(s) utilisent cette catégorie.`);
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// PARAMÈTRES PLATEFORME (coordonnées de virement, durée d'essai, etc.)
// ============================================================================
export async function getPlatformSettings(keys?: string[]) {
  const supabase = getSupabase();
  let q = supabase.from('platform_settings').select('key, value, label');
  if (keys && keys.length) q = q.in('key', keys);
  const { data, error } = await q;
  if (error) { console.error('getPlatformSettings:', error); return []; }
  return data || [];
}

export async function setPlatformSetting(key: string, value: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}

// Approuve en lot tous les établissements en attente (validation de masse).
// Renvoie le nombre d'établissements approuvés.
export async function approveAllPending(): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .update({ status: 'approved' })
    .eq('status', 'pending')
    .select('id');
  if (error) throw error;
  return (data || []).length;
}

// ============================================================================
// GÉRANCE myCAMBO — associations importées en masse (managed_by_mycambo)
// ============================================================================

export interface GeranceTenant {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  city: string | null;
  status: string;
  managed_by_mycambo: boolean;
  claimed_at: string | null;
  created_at: string;
  plan_name: string | null;
  business_id: string | null;
  business_slug: string | null;
  business_status: string | null;
}

/**
 * Liste des associations/fiches en gérance myCAMBO (import en masse).
 * Une ligne par tenant géré, enrichie de sa fiche principale et de sa formule.
 */
export async function getGeranceTenants(): Promise<GeranceTenant[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      id, name, slug, email, city, status, managed_by_mycambo, claimed_at, created_at,
      plans(name),
      businesses(id, slug, status)
    `)
    .eq('managed_by_mycambo', true)
    .order('created_at', { ascending: false });

  if (error) { console.error('getGeranceTenants:', error); return []; }

  return (data || []).map((t: any) => {
    const plan = Array.isArray(t.plans) ? t.plans[0] : t.plans;
    const biz = Array.isArray(t.businesses) ? t.businesses[0] : t.businesses;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      email: t.email ?? null,
      city: t.city ?? null,
      status: t.status,
      managed_by_mycambo: t.managed_by_mycambo,
      claimed_at: t.claimed_at ?? null,
      created_at: t.created_at,
      plan_name: plan?.name ?? null,
      business_id: biz?.id ?? null,
      business_slug: biz?.slug ?? null,
      business_status: biz?.status ?? null,
    };
  });
}

/**
 * Statistiques rapides pour l'en-tête de la page Gérance.
 */
export async function getGeranceStats(): Promise<{
  total: number;
  published: number;
  pending: number;
  claimed: number;
  unclaimed: number;
}> {
  const list = await getGeranceTenants();
  return {
    total: list.length,
    published: list.filter((t) => t.business_status === 'approved').length,
    pending: list.filter((t) => t.business_status === 'pending').length,
    claimed: list.filter((t) => t.claimed_at != null).length,
    unclaimed: list.filter((t) => t.claimed_at == null).length,
  };
}

/**
 * Valide MANUELLEMENT la réclamation d'accès d'un partenaire sur une asso en
 * gérance : lie le compte utilisateur au tenant, marque la date de réclamation
 * et sort le tenant de la gérance myCAMBO. Jamais automatique : c'est myCAMBO
 * qui garantit la qualité de la saisie avant de donner l'accès.
 *
 * @param tenantId  tenant en gérance à réclamer
 * @param userId    compte utilisateur (auth) à lier comme propriétaire
 */
export async function claimGeranceAccess(
  tenantId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabase();

  // 1. Lier le compte au tenant (propriétaire) — idempotent
  const { data: existing } = await supabase
    .from('tenant_users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    const { error: linkErr } = await supabase
      .from('tenant_users')
      .insert({ tenant_id: tenantId, user_id: userId, role: 'owner' });
    if (linkErr) {
      console.error('claimGeranceAccess link:', linkErr);
      return { ok: false, error: linkErr.message };
    }
  }

  // 2. Sortir de la gérance + horodater la réclamation
  const { data, error } = await supabase
    .from('tenants')
    .update({ managed_by_mycambo: false, claimed_at: new Date().toISOString() })
    .eq('id', tenantId)
    .select('id');
  if (error) {
    console.error('claimGeranceAccess update:', error);
    return { ok: false, error: error.message };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'Tenant introuvable ou non modifiable.' };
  }

  return { ok: true };
}
