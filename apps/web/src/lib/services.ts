import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ============================================================================
// SOUSCRIPTIONS — Création / Mise à jour
// ============================================================================

// Vérifie si un tenant peut passer à une formule (contrôle downgrade).
// Renvoie { ok, blocking } : si ok=false, blocking liste les dépassements à corriger.
export async function canSwitchPlan(
  tenantId: string,
  planSlug: string
): Promise<{ ok: boolean; blocking: any[]; error?: string }> {
  const { data, error } = await supabase().rpc('can_switch_plan', {
    p_tenant: tenantId,
    p_plan_slug: planSlug,
  });
  if (error) return { ok: false, blocking: [], error: error.message };
  return { ok: !!data?.ok, blocking: data?.blocking || [], error: data?.error };
}

// Crée/met à jour une souscription : la formule n'est PAS active tant que
// myCAMBO n'a pas validé le paiement manuel. Abonnement ANNUEL.
// Un downgrade qui dépasse les limites de la nouvelle formule est refusé.
export async function createOrUpdateSubscription(payload: {
  businessId: string;
  tenantId: string;
  planId: string;
  planSlug: string;
  amount: number;
}): Promise<{ subscriptionId?: string; paymentRef?: string; blocked?: any[]; error?: string }> {
  const client = supabase();

  // Contrôle downgrade : si le tenant dépasse les limites de la formule visée, on refuse.
  const check = await canSwitchPlan(payload.tenantId, payload.planSlug);
  if (!check.ok) {
    return { blocked: check.blocking, error: check.error };
  }

  const now = new Date();
  // Référence de paiement unique (affichée au partenaire pour son virement)
  const paymentRef =
    'CAMBO-' + now.getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  // Souscription existante pour ce business ?
  const { data: existing } = await client
    .from('subscriptions')
    .select('id')
    .eq('business_id', payload.businessId)
    .maybeSingle();

  let subscriptionId: string;

  if (existing) {
    // On enregistre la formule demandée mais en attente de paiement (pas active).
    const { error } = await client
      .from('subscriptions')
      .update({
        plan_id: payload.planId,
        status: 'pending_payment',
        updated_at: now.toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw error;
    subscriptionId = existing.id;
  } else {
    const { data: sub, error } = await client
      .from('subscriptions')
      .insert({
        tenant_id: payload.tenantId,
        business_id: payload.businessId,
        plan_id: payload.planId,
        status: 'pending_payment',
        current_period_start: now.toISOString(),
        current_period_end: now.toISOString(), // fixé à +1 an à la validation du paiement
      })
      .select()
      .single();
    if (error) throw error;
    subscriptionId = sub.id;
  }

  // Paiement manuel en attente de validation par myCAMBO.
  await client.from('payments').insert({
    tenant_id: payload.tenantId,
    business_id: payload.businessId,
    subscription_id: subscriptionId,
    amount: payload.amount,
    currency: 'USD',
    method: 'manual',
    status: 'pending',
    reference: paymentRef,
  });

  return { subscriptionId, paymentRef };
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

// ============================================================================
// VALIDATION MANUELLE DU PAIEMENT (superadmin)
// ============================================================================
// Valide un paiement manuel : le paiement passe "paid", la souscription
// devient "active" pour 1 an, et le tenant est activé.
export async function validateManualPayment(
  paymentId: string
): Promise<{ ok: boolean; error?: string; validUntil?: string }> {
  const { data, error } = await supabase().rpc('validate_manual_payment', {
    p_payment: paymentId,
  });
  if (error) return { ok: false, error: error.message };
  if (data?.ok) return { ok: true, validUntil: data.valid_until };
  return { ok: false, error: data?.error || 'Validation impossible' };
}

// Liste des paiements en attente de validation (pour la console superadmin).
export async function getPendingPayments() {
  const { data, error } = await supabase()
    .from('payments')
    .select('id, tenant_id, business_id, amount, currency, reference, proof_url, created_at')
    .eq('method', 'manual')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getPendingPayments:', error);
    return [];
  }
  return data || [];
}
