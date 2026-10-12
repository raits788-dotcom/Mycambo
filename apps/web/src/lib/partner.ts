// ============================================================================
// TYPES PARTENAIRES
// ============================================================================
// Ces types servent aux composants de l'espace partenaire (avis à modérer,
// notifications, refus d'avis). Les données viendront des tables :
//   - reviews (avis à modérer)
//   - contact_messages (notifications de demandes)
//   - audit_logs (notifications système)
// ============================================================================

// ─── Avis à modérer ─────────────────────────────────────────────────────
export interface PartnerReviewToModerate {
  id: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'published' | 'rejected';
  businessName: string;
  businessSlug: string;
  reply?: string;
  repliedAt?: string;
}

// ─── Catégories de refus d'avis ─────────────────────────────────────────
export type RejectionCategory =
  | 'inappropriate'
  | 'spam'
  | 'fake'
  | 'off_topic'
  | 'insulting'
  | 'other';

export const REJECTION_CATEGORIES: Record<
  RejectionCategory,
  { label: string; description: string }
> = {
  inappropriate: {
    label: 'Contenu inapproprié',
    description: 'Langage vulgaire, contenu choquant',
  },
  spam: {
    label: 'Spam ou publicité',
    description: 'Message promotionnel non sollicité',
  },
  fake: {
    label: 'Faux avis',
    description: 'Avis non authentique ou frauduleux',
  },
  off_topic: {
    label: 'Hors sujet',
    description: 'Ne concerne pas votre établissement',
  },
  insulting: {
    label: 'Insultant',
    description: 'Attaque personnelle envers le personnel',
  },
  other: {
    label: 'Autre motif',
    description: 'Précisez la raison ci-dessous',
  },
};

// ─── Notifications partenaire ───────────────────────────────────────────
export type PartnerNotificationType = 'review' | 'request' | 'system' | 'subscription';

export interface PartnerNotification {
  id: string;
  type: PartnerNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}