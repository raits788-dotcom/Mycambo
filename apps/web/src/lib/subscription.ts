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

export async function getSubscription(businessSlug: string): Promise<Subscription | null> {
  // 1. Récupère le business
  const { data: business } = await supabase()
    .from('businesses')
    .select('id, tenant_id')
    .eq('slug', businessSlug)
    .maybeSingle();

  if (!business) return null;

  // 2. Récupère son abonnement actif
  const { data: sub } = await supabase()
    .from('subscriptions')
    .select('*, plans(name, slug)')
    .eq('tenant_id', business.tenant_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return null;

  return {
    planId: sub.plan_id,
    status: sub.status || 'active',
    startedAt: sub.current_period_start,
    endsAt: sub.current_period_end,
    autoRenew: true,
    nextBillingDate: sub.current_period_end,
    paymentMethod: null,
  };
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}