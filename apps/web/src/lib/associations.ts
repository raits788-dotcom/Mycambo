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
// STUB — incrementSupports (à brancher sur stats plus tard)
// ═══════════════════════════════════════════════════════════
export function incrementSupports(_slug: string): number {
  // TODO: brancher sur la table stats
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('stats-updated'));
  }
  return 0;
}