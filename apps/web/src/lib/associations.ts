import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface DonationLink {
  label: string;
  url: string;
  description?: string;
}

export interface AssociationAction {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  status: 'actif' | 'termine' | 'prevu';
}

export interface AssociationTeamMember {
  id: string;
  name: string;
  role: 'bureau' | 'terrain' | 'benevole' | string;
  position?: string;
  photo?: string;
  bio?: string;
}

export interface AssociationPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface AssociationValue {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  business_id?: string;
  author_name: string;
  author_initial: string;
  author_email?: string | null;
  rating: number;
  title: string | null;
  content: string;
  visit_type: string | null;
  org_response: string | null;
  org_response_at?: string | null;
  status: 'pending' | 'published' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface AssociationEnriched {
  founded_year?: number;
  stats?: {
    views: number;
    supports: number;
  };
  donation_link?: DonationLink;
  values?: AssociationValue[];
  actions?: AssociationAction[];
  team?: AssociationTeamMember[];
  photos?: string[];
  photos_limit?: number;
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

// ═══════════════════════════════════════════════════════════
// SOUMISSION DE MESSAGES (contact, don, bénévolat, contribution)
// ═══════════════════════════════════════════════════════════

async function submitMessage(payload: {
  business_id?: string | null;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: 'contact' | 'donation' | 'volunteer' | 'contribution';
}) {
  const { error } = await supabase()
    .from('contact_messages')
    .insert({
      business_id: payload.business_id || null,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      subject: payload.subject,
      message: payload.message,
      source: payload.source,
      status: 'new',
    });

  if (error) {
    console.error('submitMessage error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// WRAPPERS PAR TYPE
// ═══════════════════════════════════════════════════════════

export async function submitContact(payload: {
  association_slug: string;
  business_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return submitMessage({
    business_id: payload.business_id,
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    source: 'contact',
  });
}

export async function submitDonation(payload: {
  association_slug: string;
  business_id?: string;
  amount: number;
  frequency: 'unique' | 'mensuel';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  anonymous: boolean;
}) {
  const subject = `Don ${payload.frequency === 'mensuel' ? 'mensuel' : 'ponctuel'} — ${payload.amount} $`;
  const message = [
    payload.message || '',
    `Montant : ${payload.amount} $`,
    `Fréquence : ${payload.frequency}`,
    payload.phone ? `Téléphone : ${payload.phone}` : '',
  ].filter(Boolean).join('\n');

  return submitMessage({
    business_id: payload.business_id,
    name: payload.anonymous ? 'Anonyme' : payload.name,
    email: payload.email,
    phone: payload.phone,
    subject,
    message,
    source: 'donation',
  });
}

export async function submitContribution(payload: {
  association_slug: string;
  business_id?: string;
  project_title: string;
  amount: number;
  name: string;
  email: string;
  message?: string;
  anonymous: boolean;
}) {
  const subject = `Contribution projet — ${payload.project_title}`;
  const message = [
    payload.message || '',
    `Projet : ${payload.project_title}`,
    `Montant : ${payload.amount} $`,
  ].filter(Boolean).join('\n');

  return submitMessage({
    business_id: payload.business_id,
    name: payload.anonymous ? 'Anonyme' : payload.name,
    email: payload.email,
    subject,
    message,
    source: 'contribution',
  });
}

export async function submitVolunteer(payload: {
  association_slug: string;
  business_id?: string;
  name: string;
  email: string;
  phone?: string;
  start_date: string;
  end_date: string;
  skills?: string;
  motivation: string;
}) {
  const subject = `Candidature bénévole du ${payload.start_date} au ${payload.end_date}`;
  const message = [
    payload.motivation,
    '',
    `Dates : ${payload.start_date} → ${payload.end_date}`,
    payload.skills ? `Compétences : ${payload.skills}` : '',
    payload.phone ? `Téléphone : ${payload.phone}` : '',
  ].filter(Boolean).join('\n');

  return submitMessage({
    business_id: payload.business_id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    subject,
    message,
    source: 'volunteer',
  });
}

// ═══════════════════════════════════════════════════════════
// incrementSupports — branché sur le vrai tracker Supabase (business_events)
// ═══════════════════════════════════════════════════════════
export async function incrementSupports(businessId: string): Promise<number> {
  const { incrementSupports: track } = await import('@/lib/stats-tracker');
  const n = await track(businessId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('stats-updated'));
  }
  return n;
}

// ═══════════════════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════════════════

export async function getReviewsForAssociation(businessIdOrSlug: string): Promise<Review[]> {
  const supabaseClient = supabase();

  let businessId = businessIdOrSlug;

  if (businessIdOrSlug.includes('-') && businessIdOrSlug.length < 40) {
    const { data: business } = await supabaseClient
      .from('businesses')
      .select('id')
      .eq('slug', businessIdOrSlug)
      .maybeSingle();
    if (business) businessId = business.id;
  }

  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getReviewsForAssociation:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    business_id: r.business_id,
    author_name: r.author_name || 'Anonyme',
    author_initial: r.author_initial || (r.author_name || 'A').charAt(0).toUpperCase(),
    author_email: r.author_email || null,
    rating: r.rating,
    title: r.title || null,
    content: r.content || r.text || '',
    visit_type: r.visit_type || null,
    org_response: r.org_response || null,
    org_response_at: r.org_response_at || null,
    status: r.status || 'published',
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function getRatingStats(businessIdOrSlug: string): Promise<RatingStats> {
  const reviews = await getReviewsForAssociation(businessIdOrSlug);

  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: 0 })),
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / total;

  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return { average, total, distribution };
}