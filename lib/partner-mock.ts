// ============================================================================
// DONNÉES PARTENAIRE (mock)
// ----------------------------------------------------------------------------
// À migrer vers Supabase plus tard.
// ============================================================================

export type PartnerStatus = 'pending' | 'active' | 'suspended';

export type Partner = {
  id: string;
  email: string;
  name: string;              // Nom entreprise
  initials: string;          // "GU" pour Green Umbrella
  status: PartnerStatus;
  createdAt: string;
  donationLink?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type PartnerEstablishment = {
  slug: string;
  name: string;
  type: 'association' | 'hotel' | 'restaurant' | 'activite' | 'shopping' | 'transport';
  typeLabel: string;
  city: string;
  status: 'draft' | 'pending' | 'approved' | 'suspended';
  rating: number;
  reviewsCount: number;
  views: number;
  supports: number;
};

export type PartnerRequest = {
  id: string;
  type: 'donation' | 'volunteer' | 'contact' | 'contribution';
  typeLabel: string;
  icon: string;
  color: string;
  author_name: string;
  author_email: string;
  summary: string;
  details?: string;
  created_at: string;
  status: 'new' | 'treated' | 'refused';
};

export type PartnerReview = {
  id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  title: string;
  content: string;
  visit_type: string;
  created_at: string;
  status: 'pending' | 'published';
};

// ===== DONNÉES DE DÉMO =====

export const MOCK_PARTNER: Partner = {
  id: 'p1',
  email: 'sokha@greenumbrella-kh.org',
  name: 'Green Umbrella',
  initials: 'GU',
  status: 'active',
  createdAt: '2024-01-15',
  contactPhone: '+855 12 345 678',
  contactEmail: 'contact@greenumbrella-kh.org',
};

export const MOCK_PARTNER_ESTABLISHMENTS: PartnerEstablishment[] = [
  {
    slug: 'green-umbrella',
    name: 'Green Umbrella',
    type: 'association',
    typeLabel: 'Association',
    city: 'Takeo',
    status: 'approved',
    rating: 4.6,
    reviewsCount: 12,
    views: 1245,
    supports: 87,
  },
  {
    slug: 'jardin-ayravady',
    name: "Le Jardin d'Ayravady",
    type: 'association',
    typeLabel: 'Association',
    city: 'Kep',
    status: 'approved',
    rating: 4.8,
    reviewsCount: 24,
    views: 890,
    supports: 62,
  },
];

export const MOCK_PARTNER_REQUESTS: PartnerRequest[] = [
  {
    id: 'r1',
    type: 'donation',
    typeLabel: 'Demande de don',
    icon: 'fa-heart',
    color: 'red',
    author_name: 'Marie Dupont',
    author_email: 'marie@email.com',
    summary: '50 $ / mois',
    details: 'Je souhaite soutenir vos programmes éducatifs.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'r2',
    type: 'volunteer',
    typeLabel: 'Candidature bénévole',
    icon: 'fa-hands-helping',
    color: 'green',
    author_name: 'Sokha Chen',
    author_email: 'sokha@email.com',
    summary: 'Du 15/04 au 30/06',
    details: "J'ai 3 mois de disponibilité, expérience en enseignement.",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'r3',
    type: 'contact',
    typeLabel: 'Message — Partenariat',
    icon: 'fa-envelope',
    color: 'blue',
    author_name: 'Paul Martin',
    author_email: 'paul@email.com',
    summary: 'Proposition de collaboration',
    details: 'Nous souhaitons financer votre projet de construction.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'r4',
    type: 'donation',
    typeLabel: 'Demande de don',
    icon: 'fa-heart',
    color: 'red',
    author_name: 'Sophie Legrand',
    author_email: 'sophie@email.com',
    summary: '100 $ ponctuel',
    details: 'Pour votre projet de construction de salles.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'treated',
  },
];

export const MOCK_PARTNER_REVIEWS: PartnerReview[] = [
  {
    id: 'rev1',
    author_name: 'Sophie Legrand',
    author_initial: 'S',
    rating: 5,
    title: 'Excellent séjour',
    content: "J'ai passé 2 semaines, tout était parfait. Bravo à toute l'équipe !",
    visit_type: 'Bénévolat',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'rev2',
    author_name: 'Paul Dubois',
    author_initial: 'P',
    rating: 4,
    title: 'Bonne expérience',
    content: 'Accueil chaleureux, cadre superbe.',
    visit_type: 'Visite',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
];

// ===== FONCTIONS UTILITAIRES =====

export function getPartnerRequestsByStatus(status: 'new' | 'treated' | 'refused') {
  return MOCK_PARTNER_REQUESTS.filter((r) => r.status === status);
}

export function getPartnerReviewsByStatus(status: 'pending' | 'published') {
  return MOCK_PARTNER_REVIEWS.filter((r) => r.status === status);
}

export function getTotalViews(): number {
  return MOCK_PARTNER_ESTABLISHMENTS.reduce((sum, e) => sum + e.views, 0);
}

export function getTotalSupports(): number {
  return MOCK_PARTNER_ESTABLISHMENTS.reduce((sum, e) => sum + e.supports, 0);
}

export function getAverageRating(): number {
  const total = MOCK_PARTNER_ESTABLISHMENTS.reduce(
    (sum, e) => sum + e.rating * e.reviewsCount,
    0
  );
  const count = MOCK_PARTNER_ESTABLISHMENTS.reduce(
    (sum, e) => sum + e.reviewsCount,
    0
  );
  return count > 0 ? total / count : 0;
}

export function getTotalReviews(): number {
  return MOCK_PARTNER_ESTABLISHMENTS.reduce(
    (sum, e) => sum + e.reviewsCount,
    0
  );
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}
// ============================================================================
// MODÉRATION DES AVIS — CÔTÉ ASSOCIATION
// ============================================================================

export type ReviewModerationStatus =
  | 'pending'                  // En attente de décision
  | 'published'                // Publié
  | 'rejected_pending_admin'   // Refusé, en attente du super-admin
  | 'rejected_by_org_final'    // Refus confirmé par le super-admin
  | 'forced_by_admin'          // Forcé par le super-admin
  | 'auto_rejected';           // Rejeté automatiquement

export type RejectionCategory =
  | 'hateful_content'
  | 'false_information'
  | 'spam_advertising'
  | 'platform_rules'
  | 'other';

export const REJECTION_CATEGORIES: Record<
  RejectionCategory,
  { label: string; description: string }
> = {
  hateful_content: {
    label: 'Contenu inapproprié',
    description: 'Propos haineux, insultes, menaces.',
  },
  false_information: {
    label: 'Informations erronées',
    description: 'Informations fausses ou mensongères.',
  },
  spam_advertising: {
    label: 'Spam / publicité',
    description: 'Contenu promotionnel déguisé.',
  },
  platform_rules: {
    label: 'Non-respect des règles',
    description: 'Enfreint la charte éditoriale de myCAMBO.',
  },
  other: {
    label: 'Autre motif',
    description: 'Précisez la raison ci-dessous.',
  },
};

export type PartnerReviewToModerate = {
  id: string;
  associationSlug: string;
  author_name: string;
  author_initial: string;
  author_email: string;
  rating: number;
  title: string;
  content: string;
  visit_type: string;
  visit_date: string;
  created_at: string;
  status: ReviewModerationStatus;
  // Si refusé
  rejection_category?: RejectionCategory;
  rejection_reason?: string;
  rejection_date?: string;
  // Si réponse
  org_response?: string;
  // Si rejeté auto
  auto_rejection_reason?: string;
};

// ===== AVIS À MODÉRER (mock) =====
export const MOCK_PARTNER_REVIEWS_TO_MODERATE: PartnerReviewToModerate[] = [
  {
    id: 'pmr1',
    associationSlug: 'green-umbrella',
    author_name: 'Sophie Legrand',
    author_initial: 'S',
    author_email: 'sophie@email.com',
    rating: 5,
    title: 'Excellent séjour',
    content:
      "J'ai passé 2 semaines au sein de votre école, tout était parfait. Les enfants sont adorables et l'équipe très professionnelle. Bravo !",
    visit_type: 'Bénévolat',
    visit_date: '2025-03-01',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'pmr2',
    associationSlug: 'green-umbrella',
    author_name: 'Paul Dubois',
    author_initial: 'P',
    author_email: 'paul@email.com',
    rating: 4,
    title: 'Bonne expérience',
    content:
      'Accueil chaleureux, cadre superbe. Quelques petits soucis logistiques mais rien de grave.',
    visit_type: 'Visite',
    visit_date: '2025-02-15',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'pmr3',
    associationSlug: 'green-umbrella',
    author_name: 'Marie Dupont',
    author_initial: 'M',
    author_email: 'marie@email.com',
    rating: 2,
    title: 'Un peu déçu',
    content:
      'Le programme de bénévolat manque de structure. Les horaires changent sans prévenir.',
    visit_type: 'Bénévolat',
    visit_date: '2025-01-20',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'pmr4',
    associationSlug: 'green-umbrella',
    author_name: 'Lin Mey',
    author_initial: 'L',
    author_email: 'lin@email.com',
    rating: 5,
    title: 'Magnifique',
    content:
      "Une expérience humaine incroyable. Je recommande vivement.",
    visit_type: 'Don',
    visit_date: '2025-02-01',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    org_response:
      'Merci Lin pour votre générosité et vos encouragements !',
  },
  {
    id: 'pmr5',
    associationSlug: 'jardin-ayravady',
    author_name: 'Thomas Bernard',
    author_initial: 'T',
    author_email: 'thomas@email.com',
    rating: 3,
    title: 'Correct sans plus',
    content:
      "L'école est bien mais l'organisation laisse à désirer par moments.",
    visit_type: 'Visite',
    visit_date: '2025-02-10',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'pmr6',
    associationSlug: 'green-umbrella',
    author_name: 'Anonymous User',
    author_initial: 'A',
    author_email: 'anon@email.com',
    rating: 1,
    title: 'Contenu supprimé',
    content: 'Contenu supprimé — propos inappropriés détectés.',
    visit_type: 'Visite',
    visit_date: '2025-03-05',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'auto_rejected',
    auto_rejection_reason: 'Contenu inapproprié (insultes)',
  },
];

// ===== HELPERS =====
export function getReviewsByStatus(
  status?: ReviewModerationStatus
): PartnerReviewToModerate[] {
  if (!status) return MOCK_PARTNER_REVIEWS_TO_MODERATE;
  return MOCK_PARTNER_REVIEWS_TO_MODERATE.filter((r) => r.status === status);
}

export function getReviewsToModerateCount(): number {
  return MOCK_PARTNER_REVIEWS_TO_MODERATE.filter((r) => r.status === 'pending')
    .length;
}

export function getReviewsByAssociation(slug: string) {
  return MOCK_PARTNER_REVIEWS_TO_MODERATE.filter(
    (r) => r.associationSlug === slug
  );
}
// ============================================================================
// ÉQUIPE PARTENAIRE (multi-utilisateurs)
// ============================================================================

export type PartnerTeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor';
  joinedAt: string;
  avatarInitial: string;
};

export const PARTNER_ROLES: Record<
  PartnerTeamMember['role'],
  { label: string; description: string; color: string }
> = {
  owner: {
    label: 'Propriétaire',
    description: 'Accès complet + facturation',
    color: 'bg-purple-100 text-purple-700',
  },
  admin: {
    label: 'Administrateur',
    description: 'Gestion complète sauf facturation',
    color: 'bg-blue-100 text-blue-700',
  },
  editor: {
    label: 'Éditeur',
    description: 'Modification des fiches uniquement',
    color: 'bg-gray-100 text-gray-700',
  },
};

export const MOCK_PARTNER_TEAM: PartnerTeamMember[] = [
  {
    id: 'tm1',
    name: 'Sokha Chen',
    email: 'sokha@greenumbrella-kh.org',
    role: 'owner',
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    avatarInitial: 'S',
  },
  {
    id: 'tm2',
    name: 'Marie Dupont',
    email: 'marie@greenumbrella-kh.org',
    role: 'admin',
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    avatarInitial: 'M',
  },
  {
    id: 'tm3',
    name: 'Thomas Bernard',
    email: 'thomas@greenumbrella-kh.org',
    role: 'editor',
    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    avatarInitial: 'T',
  },
];

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type PartnerNotification = {
  id: string;
  type: 'review' | 'request' | 'system' | 'subscription';
  title: string;
  description: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export const MOCK_PARTNER_NOTIFICATIONS: PartnerNotification[] = [
  {
    id: 'n1',
    type: 'review',
    title: 'Nouvel avis à modérer',
    description: 'Sophie Legrand a laissé un avis 5★ sur Green Umbrella.',
    link: '/espace-partenaire/avis',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    type: 'request',
    title: 'Nouvelle demande de don',
    description: 'Marie Dupont propose 50 $ / mois pour Green Umbrella.',
    link: '/espace-partenaire/demandes',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    type: 'review',
    title: 'Refus validé par myCAMBO',
    description: 'Votre refus concernant l\'avis de Paul Martin a été validé.',
    link: '/espace-partenaire/avis',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    type: 'subscription',
    title: 'Votre abonnement arrive à échéance',
    description: 'Il reste 15 jours avant la prochaine facturation.',
    link: '/espace-partenaire/parametres',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getUnreadNotificationsCount(): number {
  return MOCK_PARTNER_NOTIFICATIONS.filter((n) => !n.isRead).length;
}
// ============================================================================
// STATISTIQUES (mock)
// ============================================================================

export type StatsDataPoint = {
  label: string;
  views: number;
  supports: number;
  reviews: number;
};

export const MOCK_STATS_7_DAYS: StatsDataPoint[] = [
  { label: 'Lun', views: 120, supports: 8, reviews: 1 },
  { label: 'Mar', views: 145, supports: 12, reviews: 2 },
  { label: 'Mer', views: 132, supports: 6, reviews: 0 },
  { label: 'Jeu', views: 178, supports: 15, reviews: 3 },
  { label: 'Ven', views: 201, supports: 18, reviews: 2 },
  { label: 'Sam', views: 189, supports: 14, reviews: 1 },
  { label: 'Dim', views: 165, supports: 10, reviews: 1 },
];

export const MOCK_STATS_30_DAYS = [
  { label: 'S1', views: 890, supports: 62, reviews: 8 },
  { label: 'S2', views: 1045, supports: 78, reviews: 12 },
  { label: 'S3', views: 1210, supports: 95, reviews: 15 },
  { label: 'S4', views: 1140, supports: 87, reviews: 11 },
];

export const MOCK_STATS_1_YEAR = [
  { label: 'Jan', views: 3200, supports: 180, reviews: 28 },
  { label: 'Fév', views: 3450, supports: 210, reviews: 32 },
  { label: 'Mar', views: 4120, supports: 245, reviews: 41 },
  { label: 'Avr', views: 3890, supports: 220, reviews: 35 },
  { label: 'Mai', views: 4200, supports: 260, reviews: 44 },
  { label: 'Jun', views: 3780, supports: 235, reviews: 38 },
  { label: 'Jul', views: 3980, supports: 250, reviews: 40 },
  { label: 'Aoû', views: 4150, supports: 265, reviews: 45 },
  { label: 'Sep', views: 4350, supports: 285, reviews: 48 },
  { label: 'Oct', views: 4620, supports: 305, reviews: 52 },
  { label: 'Nov', views: 4890, supports: 320, reviews: 55 },
  { label: 'Déc', views: 5240, supports: 350, reviews: 62 },
];

// ============================================================================
// DEMANDES DÉTAILLÉES (mock)
// ============================================================================

export type PartnerRequestDetail = {
  id: string;
  type: 'donation' | 'volunteer' | 'contact' | 'contribution';
  typeLabel: string;
  icon: string;
  color: 'red' | 'green' | 'blue' | 'orange';
  status: 'new' | 'read' | 'treated' | 'refused';
  author_name: string;
  author_email: string;
  author_phone?: string;
  associationSlug: string;
  associationName: string;
  summary: string;
  details?: string;
  amount?: string;
  frequency?: string;
  dates?: { start: string; end: string };
  subject?: string;
  created_at: string;
};

export const MOCK_PARTNER_REQUESTS_DETAILED: PartnerRequestDetail[] = [
  {
    id: 'pr1',
    type: 'donation',
    typeLabel: 'Promesse de don',
    icon: 'fa-heart',
    color: 'red',
    status: 'new',
    author_name: 'Marie Dupont',
    author_email: 'marie.dupont@email.com',
    author_phone: '+855 12 345 678',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    summary: '50 $ / mois',
    details:
      'Je souhaite soutenir vos programmes éducatifs de manière régulière.',
    amount: '50 $',
    frequency: 'mensuel',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr2',
    type: 'volunteer',
    typeLabel: 'Candidature bénévole',
    icon: 'fa-hands-helping',
    color: 'green',
    status: 'new',
    author_name: 'Sokha Chen',
    author_email: 'sokha.chen@email.com',
    author_phone: '+855 92 123 456',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    summary: 'Du 15/04 au 30/06',
    details:
      "J'ai 3 mois de disponibilité, expérience en enseignement de l'anglais. J'ai déjà été bénévole dans une école au Vietnam.",
    dates: { start: '2025-04-15', end: '2025-06-30' },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr3',
    type: 'contact',
    typeLabel: 'Message',
    icon: 'fa-envelope',
    color: 'blue',
    status: 'new',
    author_name: 'Paul Martin',
    author_email: 'paul.martin@email.com',
    associationSlug: 'jardin-ayravady',
    associationName: "Le Jardin d'Ayravady",
    summary: 'Sujet : Partenariat',
    details:
      "Nous sommes une entreprise française et souhaitons financer votre projet de construction de salles. Pouvons-nous échanger ?",
    subject: 'Partenariat',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr4',
    type: 'donation',
    typeLabel: 'Promesse de don',
    icon: 'fa-heart',
    color: 'red',
    status: 'treated',
    author_name: 'Sophie Legrand',
    author_email: 'sophie.legrand@email.com',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    summary: '100 $ ponctuel',
    details: 'Pour votre projet de construction de salles de classe.',
    amount: '100 $',
    frequency: 'unique',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr5',
    type: 'contact',
    typeLabel: 'Message',
    icon: 'fa-envelope',
    color: 'blue',
    status: 'treated',
    author_name: 'Jean Moreau',
    author_email: 'jean.moreau@email.com',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    summary: 'Sujet : Information générale',
    details: 'Bonjour, j\'aimerais connaître vos horaires d\'ouverture.',
    subject: 'Information générale',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr6',
    type: 'volunteer',
    typeLabel: 'Candidature bénévole',
    icon: 'fa-hands-helping',
    color: 'green',
    status: 'refused',
    author_name: 'Marc Petit',
    author_email: 'marc.petit@email.com',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    summary: 'Du 01/05 au 15/05',
    details: 'Disponible pour 2 semaines, compétences en construction.',
    dates: { start: '2025-05-01', end: '2025-05-15' },
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// ÉTABLISSEMENTS DÉTAILLÉS
// ============================================================================

export type PartnerEstablishmentDetail = {
  slug: string;
  name: string;
  type: string;
  typeLabel: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  shortDescription: string;
  longDescription: string;
  status: 'draft' | 'pending' | 'approved' | 'suspended';
  rating: number;
  reviewsCount: number;
  views: number;
  supports: number;
  photosCount: number;
  photosLimit: number;
  createdAt: string;
};

export const MOCK_PARTNER_ESTABLISHMENTS_DETAILED: PartnerEstablishmentDetail[] = [
  {
    slug: 'green-umbrella',
    name: 'Green Umbrella',
    type: 'association',
    typeLabel: 'Association',
    category: 'Éducation',
    city: 'Takeo',
    address: 'Putsor, Takeo',
    phone: '+855 12 345 678',
    email: 'contact@greenumbrella-kh.org',
    website: 'www.greenumbrella-kh.org',
    hours: 'Lun-Ven 8h-17h',
    shortDescription:
      'École maternelle pour enfants défavorisés à Putsor, province de Takeo.',
    longDescription:
      "Green Umbrella est une association cambodgienne fondée en 2012 qui œuvre pour offrir une éducation précoce de qualité aux enfants de 4 à 6 ans de la communauté de Putsor, dans la province de Takeo.",
    status: 'approved',
    rating: 4.6,
    reviewsCount: 12,
    views: 1245,
    supports: 87,
    photosCount: 5,
    photosLimit: 5,
    createdAt: '2024-01-15',
  },
  {
    slug: 'jardin-ayravady',
    name: "Le Jardin d'Ayravady",
    type: 'association',
    typeLabel: 'Association',
    category: 'Éducation',
    city: 'Kep',
    address: 'Kep, Cambodge',
    phone: '+855 15 95 00 12',
    email: 'contact@enseignement-solidaire.org',
    website: 'enseignement-solidaire.org',
    hours: 'Lun-Ven 8h-17h',
    shortDescription:
      "École 100% gratuite dédiée à l'apprentissage des langues et du sport à Kep.",
    longDescription:
      "Fondée en 2009, Le Jardin d'Ayravady (JDA) est une école 100% gratuite soutenue par l'association française Enseignement Solidaire.",
    status: 'approved',
    rating: 4.8,
    reviewsCount: 24,
    views: 890,
    supports: 62,
    photosCount: 5,
    photosLimit: 5,
    createdAt: '2024-03-20',
  },
];

// ============================================================================
// HELPERS DEMANDES
// ============================================================================

export function getRequestsByStatus(
  status?: PartnerRequestDetail['status']
): PartnerRequestDetail[] {
  if (!status) return MOCK_PARTNER_REQUESTS_DETAILED;
  return MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === status);
}

export function getNewRequestsCountDetailed(): number {
  return MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === 'new')
    .length;
}

export function getEstablishmentBySlug(slug: string) {
  return MOCK_PARTNER_ESTABLISHMENTS_DETAILED.find((e) => e.slug === slug);
}