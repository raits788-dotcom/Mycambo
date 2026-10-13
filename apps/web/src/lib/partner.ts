// ============================================================================
// TYPES PARTENAIRES
// ============================================================================
// Ces types servent aux composants de l'espace partenaire (avis à modérer,
// notifications, refus d'avis). Les données viendront des tables :
//   - reviews (avis à modérer)
//   - contact_messages (notifications de demandes)
//   - audit_logs (notifications système)
// ============================================================================

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

// ─── Avis à modérer ─────────────────────────────────────────────────────
export interface PartnerReviewToModerate {
  id: string;
  authorName: string;
  authorInitials: string;
  author_initial?: string;
  author_name?: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  createdAt?: string;
  visit_type?: string;
  org_response?: string | null;
  status:
    | 'pending'
    | 'published'
    | 'rejected'
    | 'rejected_pending_admin'
    | 'rejected_by_org_final'
    | 'forced_by_admin'
    | 'auto_rejected';
  businessName: string;
  businessSlug: string;
  reply?: string;
  repliedAt?: string;
  rejection_reason?: string;
  rejection_category?: RejectionCategory;
  auto_rejection_reason?: string;
}

// ─── Notifications partenaire ───────────────────────────────────────────
export type PartnerNotificationType =
  | 'review'
  | 'request'
  | 'system'
  | 'subscription';

export interface PartnerNotification {
  id: string;
  type: PartnerNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}