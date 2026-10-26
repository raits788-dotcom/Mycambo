// ============================================================================
// STATS TRACKER — Supabase (table business_events)
// ----------------------------------------------------------------------------
// Comptabilise les vues et soutiens par établissement.
// Chaque interaction = une ligne dans business_events ; les totaux sont des count.
// sessionStorage ne sert QU'À éviter de compter deux vues dans la même session
// (anti-doublon côté client) — ce n'est pas du stockage de données métier.
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

const sb = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const SEEN_PREFIX = 'mycambo_viewed_'; // anti-doublon de vue par session

// Compte les événements d'un type pour un établissement (par id).
async function countEvents(businessId: string, type: string): Promise<number> {
  const { count } = await sb()
    .from('business_events')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', type);
  return count || 0;
}

// Enregistre un événement.
async function logEvent(businessId: string, type: string): Promise<void> {
  await sb().from('business_events').insert({ business_id: businessId, event_type: type });
}

// ===== Vues =====
// Incrémente UNE SEULE FOIS par session (anti-doublon via sessionStorage).
export async function incrementViews(businessId: string): Promise<number> {
  if (typeof window !== 'undefined') {
    const seenKey = SEEN_PREFIX + businessId;
    if (sessionStorage.getItem(seenKey)) {
      return getViews(businessId); // déjà vu cette session
    }
    sessionStorage.setItem(seenKey, '1');
  }
  await logEvent(businessId, 'view');
  return getViews(businessId);
}

export async function getViews(businessId: string): Promise<number> {
  return countEvents(businessId, 'view');
}

// ===== Soutiens =====
export async function incrementSupports(businessId: string): Promise<number> {
  await logEvent(businessId, 'support');
  return getSupports(businessId);
}

export async function getSupports(businessId: string): Promise<number> {
  return countEvents(businessId, 'support');
}
