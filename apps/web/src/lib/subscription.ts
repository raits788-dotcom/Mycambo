import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type PlanId = string;

export interface SubscriptionPlan {
  id: string;
  slug: string;
  label: string;
  price: number;
  priceYearly: number | null;
  features: string[];
  popular?: boolean;
  period: 'free' | 'monthly' | 'yearly';
  maxBusinesses: number;
}

export interface Subscription {
  planId: string;
  status: 'active' | 'expiring' | 'expired' | 'past_due' | 'canceled';
  startedAt: string;
  endsAt: string;
  autoRenew: boolean;
  nextBillingDate: string | null;
  paymentMethod: string | null;
}

export const SUBSCRIPTION_STATUS_CONFIG = {
  active:   { label: 'Actif',          color: 'bg-green-100 text-green-700',   icon: 'fa-circle-check' },
  expiring: { label: 'Expire bientôt', color: 'bg-orange-100 text-orange-700', icon: 'fa-clock' },
  expired:  { label: 'Expiré',         color: 'bg-gray-100 text-gray-700',     icon: 'fa-circle-xmark' },
  past_due: { label: 'En retard',      color: 'bg-red-100 text-red-700',       icon: 'fa-triangle-exclamation' },
  canceled: { label: 'Annulé',         color: 'bg-gray-100 text-gray-500',     icon: 'fa-ban' },
} as const;

// ═══════════════════════════════════════════════════════════
// FORMULES (lecture BDD)
// ═══════════════════════════════════════════════════════════

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const [plansRes, versionsRes, featuresRes] = await Promise.all([
    supabase().from('plans').select('*').eq('is_active', true).eq('audience', 'business').order('position'),
    supabase().from('plan_versions').select('*').eq('status', 'current'),
    supabase().from('plan_features').select('*').eq('is_active', true),
  ]);

  return (plansRes.data || []).map((p: any) => {
    const v = (versionsRes.data || []).find((ver: any) => ver.plan_id === p.id);
    const featureIds = v?.feature_ids || [];
    const features = (featuresRes.data || [])
      .filter((f: any) => featureIds.includes(f.id))
      .map((f: any) => f.label);

    const price = Number(v?.price_monthly ?? p.price_monthly ?? 0);

    return {
      id: p.id,
      slug: p.slug,
      label: p.name,
      price,
      priceYearly: v?.price_yearly ? Number(v.price_yearly) : null,
      features,
      popular: p.slug === 'pro',
      period: price === 0 ? 'free' : 'monthly',
      maxBusinesses: v?.max_businesses ?? p.max_businesses ?? 1,
    };
  });
}

export async function getPlanById(planId: string): Promise<SubscriptionPlan | null> {
  const plans = await getSubscriptionPlans();
  return plans.find((p) => p.id === planId || p.slug === planId) || null;
}

// ═══════════════════════════════════════════════════════════
// ABONNEMENT D'UN ÉTABLISSEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Récupère l'abonnement d'un établissement.
 *
 * Logique de priorité :
 * 1. Cherche une souscription active liée au business (`business_id`)
 * 2. Sinon, cherche une souscription active liée au tenant (`tenant_id`)
 * 3. Sinon, utilise le plan par défaut du business (`businesses.plan_id`)
 * 4. Sinon, utilise le plan par défaut du tenant (`tenants.plan_id`)
 * 5. Sinon, retourne null (formule Découverte implicite)
 */
export async function getSubscription(businessSlug: string): Promise<Subscription | null> {
  const client = supabase();

  // 1. Récupère le business avec son plan_id
  const { data: business } = await client
    .from('businesses')
    .select('id, tenant_id, plan_id')
    .eq('slug', businessSlug)
    .maybeSingle();

  if (!business) return null;

  // 2. Cherche une souscription active liée au BUSINESS
  const { data: subByBusiness } = await client
    .from('subscriptions')
    .select('*, plans(name, slug)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subByBusiness) {
    return {
      planId: subByBusiness.plan_id,
      status: subByBusiness.status || 'active',
      startedAt: subByBusiness.current_period_start,
      endsAt: subByBusiness.current_period_end,
      autoRenew: true,
      nextBillingDate: subByBusiness.current_period_end,
      paymentMethod: null,
    };
  }

  // 3. Cherche une souscription active liée au TENANT
  const { data: subByTenant } = await client
    .from('subscriptions')
    .select('*, plans(name, slug)')
    .eq('tenant_id', business.tenant_id)
    .is('business_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subByTenant) {
    return {
      planId: subByTenant.plan_id,
      status: subByTenant.status || 'active',
      startedAt: subByTenant.current_period_start,
      endsAt: subByTenant.current_period_end,
      autoRenew: true,
      nextBillingDate: subByTenant.current_period_end,
      paymentMethod: null,
    };
  }

  // 4. Fallback : utiliser le plan par défaut du business
  if (business.plan_id) {
    const now = new Date();
    const inOneMonth = new Date(now);
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);

    return {
      planId: business.plan_id,
      status: 'active',
      startedAt: now.toISOString(),
      endsAt: inOneMonth.toISOString(),
      autoRenew: true,
      nextBillingDate: inOneMonth.toISOString(),
      paymentMethod: null,
    };
  }

  // 5. Aucun abonnement trouvé → formule Découverte implicite
  return null;
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}