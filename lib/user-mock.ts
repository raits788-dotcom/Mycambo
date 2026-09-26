// ============================================================================
// DONNÉES UTILISATEUR (mock)
// ============================================================================

export type UserFavorite = {
  id: string;
  slug: string;
  name: string;
  type: string;
  typeLabel: string;
  city: string;
  image: string;
  rating: number;
  addedAt: string;
};

// ============================================================================
// STATUTS D'AVIS — 10 STATUTS COMPLETS
// ============================================================================

export type UserReviewStatus =
  | 'requested'                 // Demande envoyée à l'association
  | 'accepted'                  // Acceptée, l'utilisateur peut écrire
  | 'rejected_by_org'           // Refusée avant écriture
  | 'pending'                   // Avis écrit, en attente de l'association
  | 'auto_rejected'             // Rejeté automatiquement (anti-spam)
  | 'published'                 // Publié par l'association
  | 'rejected_pending_admin'    // Refusé par l'asso, en attente admin
  | 'rejected_by_org_final'     // Refus confirmé par l'admin
  | 'forced_by_admin'           // Publié par myCAMBO
  | 'expired';                  // Demande expirée

export const REVIEW_STATUS_CONFIG: Record<
  UserReviewStatus,
  {
    label: string;
    color: string;
    description: string;
    icon: string;
  }
> = {
  requested: {
    label: 'Demande envoyée',
    color: 'bg-blue-100 text-blue-700',
    description: "En attente de réponse de l'association.",
    icon: '📤',
  },
  accepted: {
    label: 'Demande acceptée',
    color: 'bg-purple-100 text-purple-700',
    description: "Vous pouvez maintenant écrire votre avis.",
    icon: '✏️',
  },
  rejected_by_org: {
    label: 'Demande refusée',
    color: 'bg-gray-100 text-gray-700',
    description: "L'association n'a pas donné suite.",
    icon: '🚫',
  },
  pending: {
    label: 'En attente de validation',
    color: 'bg-orange-100 text-orange-700',
    description: "Votre avis est en attente de validation.",
    icon: '⏳',
  },
  auto_rejected: {
    label: 'Rejeté automatiquement',
    color: 'bg-red-100 text-red-700',
    description:
      'Votre avis contient des propos inappropriés ou du spam.',
    icon: '⚠️',
  },
  published: {
    label: 'Publié',
    color: 'bg-green-100 text-green-700',
    description: 'Visible publiquement sur myCAMBO.',
    icon: '✅',
  },
  rejected_pending_admin: {
    label: 'Refus en cours d\'examen',
    color: 'bg-yellow-100 text-yellow-800',
    description:
      "L'association a refusé. L'équipe myCAMBO examine la demande.",
    icon: '🟡',
  },
  rejected_by_org_final: {
    label: 'Refus confirmé',
    color: 'bg-red-100 text-red-700',
    description: "Refus confirmé par l'équipe myCAMBO.",
    icon: '❌',
  },
  forced_by_admin: {
    label: 'Publié par myCAMBO',
    color: 'bg-green-100 text-green-700',
    description:
      "Publié par l'équipe myCAMBO malgré le refus de l'association.",
    icon: '⚖️',
  },
  expired: {
    label: 'Demande expirée',
    color: 'bg-gray-100 text-gray-700',
    description: "Vous n'avez pas répondu dans le délai imparti.",
    icon: '⌛',
  },
};

// ============================================================================
// AVIS UTILISATEUR
// ============================================================================

export type UserReview = {
  id: string;
  associationName: string;
  associationSlug: string;
  rating: number;
  title: string;
  content: string;
  visitType: string;
  createdAt: string;
  status: UserReviewStatus;
  /** Motif de refus (rempli si refusé) */
  rejectionReason?: string;
  /** Catégorie de refus (rempli si refusé) */
  rejectionCategory?: string;
  /** Réponse de l'association (si publié) */
  orgResponse?: string;
};

// ============================================================================
// DEMANDES (dons, bénévolat, contact)
// ============================================================================

export type UserRequestType =
  | 'donation'
  | 'volunteer'
  | 'contact'
  | 'contribution';

export type UserRequestStatus = 'sent' | 'read' | 'accepted' | 'refused';

export type UserRequest = {
  id: string;
  type: UserRequestType;
  typeLabel: string;
  context: string;
  associationName: string;
  associationSlug: string;
  summary: string;
  createdAt: string;
  status: UserRequestStatus;
};

export const REQUEST_TYPE_LABELS: Record<
  UserRequestType,
  { label: string; context: string }
> = {
  donation: {
    label: 'Promesse de don',
    context: 'Vous avez proposé de soutenir cette association.',
  },
  volunteer: {
    label: 'Candidature bénévole',
    context: 'Vous avez postulé pour devenir bénévole.',
  },
  contact: {
    label: 'Message envoyé',
    context: 'Vous avez envoyé un message à cette association.',
  },
  contribution: {
    label: 'Promesse de contribution',
    context: 'Vous avez proposé de financer un projet.',
  },
};

export const REQUEST_STATUS_LABELS: Record<
  UserRequestStatus,
  { label: string; color: string; description: string }
> = {
  sent: {
    label: 'Envoyée',
    color: 'bg-orange-100 text-orange-700',
    description: "En attente de lecture par l'association.",
  },
  read: {
    label: "Vue par l'association",
    color: 'bg-blue-100 text-blue-700',
    description: "L'association a consulté votre demande.",
  },
  accepted: {
    label: 'En cours',
    color: 'bg-green-100 text-green-700',
    description: "L'association vous contactera pour finaliser.",
  },
  refused: {
    label: 'Refusée',
    color: 'bg-red-100 text-red-700',
    description: "L'association n'a pas donné suite.",
  },
};

// ============================================================================
// FAVORIS
// ============================================================================

export const MOCK_USER_FAVORITES: UserFavorite[] = [
  {
    id: 'fav1',
    slug: 'green-umbrella',
    name: 'Green Umbrella',
    type: 'association',
    typeLabel: 'Association',
    city: 'Takeo',
    image:
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
    rating: 4.6,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fav2',
    slug: 'angkor-palace-resort',
    name: 'Angkor Palace Resort',
    type: 'hotel',
    typeLabel: 'Hôtel',
    city: 'Siem Reap',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=85&w=800&auto=format&fit=crop',
    rating: 4.8,
    addedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// AVIS (avec 6 exemples couvrant tous les statuts clés)
// ============================================================================

export const MOCK_USER_REVIEWS: UserReview[] = [
  {
    id: 'rev1',
    associationName: 'Green Umbrella',
    associationSlug: 'green-umbrella',
    rating: 5,
    title: 'Expérience formidable',
    content:
      "J'ai passé 3 mois en tant que bénévole, l'équipe est adorable et l'impact est réel.",
    visitType: 'Bénévolat',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    orgResponse:
      'Merci Marie pour votre engagement, vous nous manquez déjà !',
  },
  {
    id: 'rev2',
    associationName: "Le Jardin d'Ayravady",
    associationSlug: 'jardin-ayravady',
    rating: 5,
    title: 'Super école',
    content:
      'Les enfants sont heureux, les professeurs dévoués. Une belle initiative.',
    visitType: 'Visite',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'rev3',
    associationName: 'Au-Delà Les Rizières',
    associationSlug: 'au-dela-les-rizieres',
    rating: 4,
    title: 'Bonne action',
    content: 'Belle énergie, un peu désorganisé mais très humain.',
    visitType: 'Don',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
  },
  {
    id: 'rev4',
    associationName: 'PSE — Pour un Sourire d\'Enfant',
    associationSlug: 'pse-pour-un-sourire',
    rating: 4,
    title: 'Belle équipe',
    content:
      "J'ai été impressionné par l'organisation, mais quelques points à améliorer.",
    visitType: 'Bénévolat',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'rejected_pending_admin',
    rejectionCategory: 'false_information',
    rejectionReason:
      'Contient des informations inexactes sur nos programmes.',
  },
  {
    id: 'rev5',
    associationName: 'Friends International',
    associationSlug: 'friends-international',
    rating: 2,
    title: 'Contenu inapproprié',
    content:
      'Contenu supprimé — propos inappropriés détectés automatiquement.',
    visitType: 'Visite',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'auto_rejected',
    rejectionReason:
      'Le contenu contient des propos inappropriés ou du spam.',
  },
  {
    id: 'rev6',
    associationName: "Le Jardin d'Ayravady",
    associationSlug: 'jardin-ayravady',
    rating: 5,
    title: 'Super expérience',
    content:
      "Une école formidable, j'y ai passé un mois inoubliable.",
    visitType: 'Bénévolat',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
  },
];

// ============================================================================
// DEMANDES
// ============================================================================

export const MOCK_USER_REQUESTS: UserRequest[] = [
  {
    id: 'req1',
    type: 'donation',
    typeLabel: REQUEST_TYPE_LABELS.donation.label,
    context: REQUEST_TYPE_LABELS.donation.context,
    associationName: 'Green Umbrella',
    associationSlug: 'green-umbrella',
    summary: '50 $ / mois',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
  },
  {
    id: 'req2',
    type: 'volunteer',
    typeLabel: REQUEST_TYPE_LABELS.volunteer.label,
    context: REQUEST_TYPE_LABELS.volunteer.context,
    associationName: "Le Jardin d'Ayravady",
    associationSlug: 'jardin-ayravady',
    summary: 'Du 15/05 au 30/06',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
  },
  {
    id: 'req3',
    type: 'contact',
    typeLabel: REQUEST_TYPE_LABELS.contact.label,
    context: REQUEST_TYPE_LABELS.contact.context,
    associationName: 'Au-Delà Les Rizières',
    associationSlug: 'au-dela-les-rizieres',
    summary: 'Sujet : Partenariat',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'read',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getFavoritesCount() {
  return MOCK_USER_FAVORITES.length;
}

export function getReviewsCount() {
  return MOCK_USER_REVIEWS.length;
}

export function getRequestsCount() {
  return MOCK_USER_REQUESTS.length;
}

export function getPendingReviewsCount() {
  return MOCK_USER_REVIEWS.filter(
    (r) => r.status === 'pending' || r.status === 'accepted'
  ).length;
}

export function getNewRequestsCount() {
  return MOCK_USER_REQUESTS.filter((r) => r.status === 'sent').length;
}

// ===== Statistiques par statut =====
export function getReviewCounts() {
  return {
    total: MOCK_USER_REVIEWS.length,
    published: MOCK_USER_REVIEWS.filter((r) => r.status === 'published').length,
    pending: MOCK_USER_REVIEWS.filter((r) => r.status === 'pending').length,
    accepted: MOCK_USER_REVIEWS.filter((r) => r.status === 'accepted').length,
    rejected: MOCK_USER_REVIEWS.filter(
      (r) =>
        r.status === 'rejected_by_org_final' ||
        r.status === 'rejected_pending_admin' ||
        r.status === 'rejected_by_org'
    ).length,
    autoRejected: MOCK_USER_REVIEWS.filter((r) => r.status === 'auto_rejected')
      .length,
  };
}

// ===== Historique de profil =====
export type ProfileChangeType =
  | 'account_created'
  | 'name_changed'
  | 'password_changed'
  | 'email_change_requested'
  | 'email_changed';

export type ProfileChange = {
  id: string;
  type: ProfileChangeType;
  label: string;
  icon: string;
  color: string;
  oldValue?: string;
  newValue?: string;
  changedBy: 'user' | 'support';
  createdAt: string;
};

export const PROFILE_CHANGE_LABELS: Record<
  ProfileChangeType,
  { label: string; icon: string; color: string }
> = {
  account_created: {
    label: 'Compte créé',
    icon: '🎉',
    color: 'text-green-600',
  },
  name_changed: {
    label: 'Nom modifié',
    icon: '✏️',
    color: 'text-marine',
  },
  password_changed: {
    label: 'Mot de passe modifié',
    icon: '🔒',
    color: 'text-orange-600',
  },
  email_change_requested: {
    label: "Demande de changement d'email",
    icon: '📧',
    color: 'text-blue-600',
  },
  email_changed: {
    label: 'Email modifié',
    icon: '✅',
    color: 'text-green-600',
  },
};

export const MOCK_PROFILE_HISTORY: ProfileChange[] = [
  {
    id: 'h1',
    type: 'account_created',
    label: PROFILE_CHANGE_LABELS.account_created.label,
    icon: PROFILE_CHANGE_LABELS.account_created.icon,
    color: PROFILE_CHANGE_LABELS.account_created.color,
    changedBy: 'user',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const PROFILE_HISTORY_KEY = 'mycambo_profile_history';

export function getProfileHistory(): ProfileChange[] {
  if (typeof window === 'undefined') return MOCK_PROFILE_HISTORY;
  try {
    const raw = localStorage.getItem(PROFILE_HISTORY_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as ProfileChange[];
      return [...MOCK_PROFILE_HISTORY, ...stored];
    }
    return MOCK_PROFILE_HISTORY;
  } catch {
    return MOCK_PROFILE_HISTORY;
  }
}

export function addProfileChange(
  change: Omit<ProfileChange, 'id' | 'createdAt'>
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PROFILE_HISTORY_KEY);
    const stored: ProfileChange[] = raw ? JSON.parse(raw) : [];
    stored.push({
      ...change,
      id: 'h_' + Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(PROFILE_HISTORY_KEY, JSON.stringify(stored));
  } catch {
    // Silencieux
  }
}

// ===== TIME AGO =====
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}