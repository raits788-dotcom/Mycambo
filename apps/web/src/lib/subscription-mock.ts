// ============================================================================
// ABONNEMENTS (mock)
// ============================================================================

export type PlanId =
  | 'decouverte'
  | 'essentiel'
  | 'pro'
  | 'business'
  | 'association';

export type SubscriptionPlan = {
  id: PlanId;
  label: string;
  price: number;
  period: 'monthly' | 'yearly' | 'free';
  features: string[];
  popular?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'decouverte',
    label: 'Découverte',
    price: 0,
    period: 'free',
    features: ['Fiche basique', '5 photos', 'Contact direct'],
  },
  {
    id: 'essentiel',
    label: 'Essentiel',
    price: 15,
    period: 'monthly',
    features: [
      '15 photos',
      'Description longue',
      'Réseaux sociaux',
      'Badge vérifié',
      'Statistiques',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 39,
    period: 'monthly',
    popular: true,
    features: [
      '3 établissements',
      'Photos illimitées',
      'Réservations en ligne',
      'Offres promotionnelles',
      'Statistiques avancées',
      'Mise en avant',
    ],
  },
  {
    id: 'business',
    label: 'Business',
    price: 79,
    period: 'monthly',
    features: [
      '10 établissements',
      'Coup de cœur éditorial',
      'Bannière accueil',
      'Équipe multi-utilisateurs',
      'Account manager',
    ],
  },
];

export type EstablishmentSubscription = {
  slug: string;
  planId: PlanId;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  startedAt: string;
  endsAt: string;
  autoRenew: boolean;
  nextBillingDate?: string;
  nextBillingAmount?: number;
  paymentMethod?: string;
  invoices: {
    id: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
  }[];
};

export const MOCK_SUBSCRIPTIONS: Record<string, EstablishmentSubscription> = {
  'green-umbrella': {
    slug: 'green-umbrella',
    planId: 'association',
    status: 'active',
    startedAt: '2025-01-01',
    endsAt: '2025-12-31',
    autoRenew: true,
    paymentMethod: 'Gratuit (Association)',
    invoices: [],
  },
  'jardin-ayravady': {
    slug: 'jardin-ayravady',
    planId: 'association',
    status: 'active',
    startedAt: '2025-03-20',
    endsAt: '2026-03-19',
    autoRenew: true,
    paymentMethod: 'Gratuit (Association)',
    invoices: [],
  },
};

export function getSubscription(
  slug: string
): EstablishmentSubscription | null {
  return MOCK_SUBSCRIPTIONS[slug] || null;
}

export function getDaysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getPlanById(id: PlanId): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) || null;
}

export const SUBSCRIPTION_STATUS_CONFIG: Record<
  EstablishmentSubscription['status'],
  { label: string; color: string; icon: string }
> = {
  active: {
    label: 'Actif',
    color: 'bg-green-100 text-green-700',
    icon: 'fa-circle-check',
  },
  expiring: {
    label: 'Expire bientôt',
    color: 'bg-orange-100 text-orange-700',
    icon: 'fa-clock',
  },
  expired: {
    label: 'Expiré',
    color: 'bg-red-100 text-red-700',
    icon: 'fa-xmark',
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-gray-100 text-gray-700',
    icon: 'fa-ban',
  },
};