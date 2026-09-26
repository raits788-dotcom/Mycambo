// ============================================================================
// DEMANDES DE SUPPRESSION (mock — localStorage)
// ============================================================================

export type DeletionReason =
  | 'closed'
  | 'change_activity'
  | 'creation_error'
  | 'other';

export type DeletionStatus = 'pending' | 'approved' | 'rejected';

export const DELETION_REASONS: Record<
  DeletionReason,
  { label: string; description: string }
> = {
  closed: {
    label: 'Établissement fermé',
    description: 'L\'établissement a cessé son activité.',
  },
  change_activity: {
    label: 'Changement d\'activité',
    description: 'L\'activité a changé, la fiche n\'est plus adaptée.',
  },
  creation_error: {
    label: 'Erreur de création',
    description: 'La fiche a été créée par erreur.',
  },
  other: {
    label: 'Autre motif',
    description: 'Précisez votre demande ci-dessous.',
  },
};

export type DeletionRequest = {
  id: string;
  establishmentSlug: string;
  establishmentName: string;
  reason: DeletionReason;
  customReason?: string;
  status: DeletionStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  archivedAt?: string;
};

const STORAGE_KEY = 'mycambo_deletion_requests';

export function getDeletionRequests(): DeletionRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDeletionRequestBySlug(
  slug: string
): DeletionRequest | null {
  const requests = getDeletionRequests();
  return (
    requests.find(
      (r) => r.establishmentSlug === slug && r.status === 'pending'
    ) || null
  );
}

export function addDeletionRequest(
  data: Omit<DeletionRequest, 'id' | 'createdAt' | 'status'>
): DeletionRequest {
  const all = getDeletionRequests();
  const request: DeletionRequest = {
    ...data,
    id: 'del_' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  all.push(request);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return request;
}

export const DELETION_STATUS_CONFIG: Record<
  DeletionStatus,
  { label: string; color: string; icon: string }
> = {
  pending: {
    label: 'En attente',
    color: 'bg-orange-100 text-orange-700',
    icon: 'fa-clock',
  },
  approved: {
    label: 'Validée',
    color: 'bg-green-100 text-green-700',
    icon: 'fa-circle-check',
  },
  rejected: {
    label: 'Refusée',
    color: 'bg-red-100 text-red-700',
    icon: 'fa-xmark',
  },
};