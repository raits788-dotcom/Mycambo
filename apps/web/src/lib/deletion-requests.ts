// ============================================================================
// DEMANDES DE SUPPRESSION (Supabase)
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

const sb = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

// ----------------------------------------------------------------------------
// Mapping colonnes Supabase (snake_case) -> type de retour (camelCase)
// La table `deletion_requests` ne porte pas tous les champs historiques
// (establishmentName, customReason, rejectionReason, archivedAt) : on mappe
// ce qui existe (business_id -> establishmentSlug) et on laisse le reste vide
// pour conserver la MÊME forme de retour qu'avant.
// ----------------------------------------------------------------------------
type DeletionRequestRow = {
  id: string;
  business_id: string | null;
  tenant_id: string | null;
  requested_by: string | null;
  reason: DeletionReason;
  status: DeletionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

function mapRow(row: DeletionRequestRow): DeletionRequest {
  return {
    id: row.id,
    establishmentSlug: row.business_id ?? '',
    establishmentName: '',
    reason: row.reason,
    customReason: undefined,
    status: row.status,
    rejectionReason: undefined,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
    archivedAt: undefined,
  };
}

export async function getDeletionRequests(): Promise<DeletionRequest[]> {
  const { data, error } = await sb()
    .from('deletion_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DeletionRequestRow[]).map(mapRow);
}

// NOTE: la fonction historique filtrait par `slug` (establishmentSlug).
// La table Supabase filtre par `business_id` : passez désormais un businessId
// en argument. La signature reste inchangée pour préserver la compatibilité
// d'appel.
export async function getDeletionRequestBySlug(
  businessId: string
): Promise<DeletionRequest | null> {
  const { data, error } = await sb()
    .from('deletion_requests')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return mapRow(data[0] as DeletionRequestRow);
}

export async function addDeletionRequest(
  data: Omit<DeletionRequest, 'id' | 'createdAt' | 'status'>
): Promise<DeletionRequest> {
  const { data: inserted, error } = await sb()
    .from('deletion_requests')
    .insert({
      business_id: data.establishmentSlug,
      reason: data.reason,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error || !inserted) {
    throw error ?? new Error('Insertion deletion_request échouée');
  }
  return mapRow(inserted as DeletionRequestRow);
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
