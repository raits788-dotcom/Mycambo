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

// ============================================================================
// Stats RÉELLES d'un établissement (remplace les données factices du StatsTab).
// Toutes les valeurs viennent de la base, spécifiques à l'établissement.
// ============================================================================

export type PeriodKey = '7d' | '30d' | '1y';
export type DayPoint = { label: string; views: number; supports: number; reviews: number };

export interface EstablishmentStats {
  totals: {
    views: number;
    supports: number;   // 'support' events (pertinent surtout pour associations)
    reviews: number;    // avis approuvés
    favorites: number;
    avgRating: number | null;
  };
  series: DayPoint[];   // série temporelle pour le graphe (selon la période)
}

// Début de période (UTC) pour une clé donnée.
function periodStart(period: PeriodKey): Date {
  const d = new Date();
  if (period === '7d') d.setDate(d.getDate() - 6);
  else if (period === '30d') d.setDate(d.getDate() - 29);
  else d.setFullYear(d.getFullYear() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getEstablishmentStats(
  businessId: string,
  period: PeriodKey = '7d'
): Promise<EstablishmentStats> {
  const client = sb();
  const since = periodStart(period).toISOString();

  // Événements de la période (vues + soutiens), avec leur date.
  const { data: events } = await client
    .from('business_events')
    .select('event_type, created_at')
    .eq('business_id', businessId)
    .gte('created_at', since);

  // Avis approuvés (note moyenne + total).
  const { data: reviews } = await client
    .from('reviews')
    .select('rating, created_at, status')
    .eq('business_id', businessId)
    .eq('status', 'approved');

  // Favoris.
  const { count: favCount } = await client
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);

  const evs = events || [];
  const revs = reviews || [];

  const viewsTotalPeriod = evs.filter((e) => e.event_type === 'view').length;
  const supportsTotalPeriod = evs.filter((e) => e.event_type === 'support').length;
  const ratings = revs.map((r) => r.rating).filter((n): n is number => typeof n === 'number');
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Série temporelle.
  const series = buildSeries(period, evs, revs);

  return {
    totals: {
      views: viewsTotalPeriod,
      supports: supportsTotalPeriod,
      reviews: revs.length,
      favorites: favCount || 0,
      avgRating,
    },
    series,
  };
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function buildSeries(
  period: PeriodKey,
  events: { event_type: string; created_at: string }[],
  reviews: { created_at: string }[]
): DayPoint[] {
  const start = periodStart(period);
  const buckets: DayPoint[] = [];
  const keyOf: (d: Date) => string =
    period === '1y'
      ? (d) => `${d.getFullYear()}-${d.getMonth()}`
      : (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  // Prépare les buckets dans l'ordre.
  const index = new Map<string, number>();
  if (period === '1y') {
    for (let i = 0; i < 12; i++) {
      const d = new Date(start); d.setMonth(start.getMonth() + i);
      const k = keyOf(d);
      index.set(k, buckets.length);
      buckets.push({ label: MONTH_LABELS[d.getMonth()], views: 0, supports: 0, reviews: 0 });
    }
  } else {
    const days = period === '7d' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = keyOf(d);
      index.set(k, buckets.length);
      const label = period === '7d' ? DAY_LABELS[d.getDay()] : `${d.getDate()}`;
      buckets.push({ label, views: 0, supports: 0, reviews: 0 });
    }
  }

  for (const e of events) {
    const i = index.get(keyOf(new Date(e.created_at)));
    if (i === undefined) continue;
    if (e.event_type === 'view') buckets[i].views++;
    else if (e.event_type === 'support') buckets[i].supports++;
  }
  for (const r of reviews) {
    const i = index.get(keyOf(new Date(r.created_at)));
    if (i !== undefined) buckets[i].reviews++;
  }
  return buckets;
}
