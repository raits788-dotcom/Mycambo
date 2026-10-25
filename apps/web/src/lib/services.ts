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
