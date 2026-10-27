import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ============================================================================
// SOUSCRIPTIONS — Création / Mise à jour
// ============================================================================

export async function createOrUpdateSubscription(payload: {
  businessId: string;
  tenantId: string;
  planId: string;
  amount: number;
}) {
  const client = supabase();

  // 1. Vérifier si une souscription existe déjà pour ce business
  const { data: existing } = await client
    .from('subscriptions')
    .select('id')
    .eq('business_id', payload.businessId)
    .maybeSingle();

  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  if (existing) {
    // Mise à jour
    const { error } = await client
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
    await client.from('payments').insert({
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
  const { data: sub, error } = await client
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
  await client.from('payments').insert({
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

export async function sendPasswordResetEmail(email: string) {
  const client = supabase();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/espace-partenaire/changer-mot-de-passe`,
  });
  if (error) throw error;
}

// ============================================================================
// SUPPRESSION DE COMPTE — Demande
// ============================================================================

export async function requestAccountDeletion(payload: {
  tenantId: string;
  reason: string;
}) {
  const client = supabase();

  const { error } = await client.from('deletion_requests').insert({
    tenant_id: payload.tenantId,
    reason: payload.reason,
    status: 'pending',
  });

  if (error) throw error;
}
// ============================================================================
// AVIS — par établissement (business)
// ============================================================================
export async function getReviewsForBusiness(businessId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getReviewsForBusiness:', error);
    return [];
  }
  return data || [];
}

// ============================================================================
// DEMANDES — par établissement (business)
// ============================================================================
export async function getContactMessagesForBusiness(businessId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getContactMessagesForBusiness:', error);
    return [];
  }
  return data || [];
}

// ============================================================================
// FORMULES — Source unique : la table `plans` (remplace PARTNER_PLANS en dur)
// ============================================================================

export type PlanRow = {
  id: string;
  slug: string;
  name: string;
  price_monthly: number;
  price_yearly: number | null;
  max_businesses: number;
  features: string[];
  position: number;
  is_active: boolean;
  popular?: boolean;
};

// Lit les formules actives depuis Supabase, triées par position.
export async function getPlans(): Promise<PlanRow[]> {
  const client = supabase();
  const { data, error } = await client
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });
  if (error) {
    console.error('getPlans:', error);
    return [];
  }
  return (data || []).map((p: Record<string, unknown>) => ({
    ...(p as unknown as PlanRow),
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
  }));
}

// Formate un prix mensuel pour l'affichage ("Gratuit" ou "15 $").
export function formatPlanPrice(priceMonthly: number): string {
  return priceMonthly > 0 ? `${priceMonthly} $` : 'Gratuit';
}

// ============================================================================
// RÉSERVATIONS (hôtel / restaurant) — table reservations
// ============================================================================
export async function submitReservation(payload: {
  business_id: string;
  tenant_id?: string | null;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  party_size?: number;
  date_from?: string;
  date_to?: string;
  time_slot?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase().from('reservations').insert({
    business_id: payload.business_id,
    tenant_id: payload.tenant_id ?? null,
    customer_name: payload.customer_name,
    customer_email: payload.customer_email ?? null,
    customer_phone: payload.customer_phone ?? null,
    party_size: payload.party_size ?? null,
    date_from: payload.date_from ?? null,
    date_to: payload.date_to ?? null,
    time_slot: payload.time_slot ?? null,
    message: payload.message ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ============================================================================
// OFFRES DU MOMENT — table offers
// ============================================================================
export type Offer = {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  valid_from: string | null;
  valid_to: string | null;
};

// Offres actives d'un établissement (pour la fiche publique).
export async function getActiveOffers(businessId: string): Promise<Offer[]> {
  const { data, error } = await supabase()
    .from('offers')
    .select('id, title, description, discount, valid_from, valid_to')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getActiveOffers:', error);
    return [];
  }
  return data || [];
}

// ============================================================================
// EMPLOI — offres d'emploi d'un établissement + candidatures
// ============================================================================
export type JobOffer = {
  id: string;
  title: string;
  description: string | null;
  contract_type: string | null;
  location: string | null;
  salary: string | null;
};

// Offres d'emploi actives d'un établissement (fiche publique).
export async function getJobOffers(businessId: string): Promise<JobOffer[]> {
  const { data, error } = await supabase()
    .from('job_offers')
    .select('id, title, description, contract_type, location, salary')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getJobOffers:', error);
    return [];
  }
  return data || [];
}

// Postuler à une offre.
export async function submitApplication(payload: {
  job_offer_id: string;
  business_id: string;
  tenant_id?: string | null;
  candidate_name: string;
  candidate_email?: string;
  candidate_phone?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase().from('job_applications').insert({
    job_offer_id: payload.job_offer_id,
    business_id: payload.business_id,
    tenant_id: payload.tenant_id ?? null,
    candidate_name: payload.candidate_name,
    candidate_email: payload.candidate_email ?? null,
    candidate_phone: payload.candidate_phone ?? null,
    message: payload.message ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
