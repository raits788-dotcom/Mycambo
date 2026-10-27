// ============================================================================
// DEMANDES DE MODIFICATION (Supabase)
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

const sb = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export type ModificationField =
  | 'name'
  | 'category'
  | 'address'
  | 'city'
  | 'legal'
  | 'registration_number';

export type ModificationStatus = 'pending' | 'approved' | 'rejected';

export type ModificationRequest = {
  id: string;
  establishmentSlug: string;
  field: ModificationField;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  reason: string;
  status: ModificationStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
};

export const MODIFICATION_FIELD_LABELS: Record<ModificationField, string> = {
  name: "Nom de l'établissement",
  category: 'Catégorie',
  address: 'Adresse',
  city: 'Ville',
  legal: 'Informations légales',
  registration_number: "Numéro d'enregistrement",
};

// ----------------------------------------------------------------------------
// Mapping colonnes Supabase (snake_case) -> type de retour (camelCase).
// Table `modification_requests` : id, business_id, tenant_id, requested_by,
// field, current_value, new_value, reason, status, reviewed_by, reviewed_at,
// created_at. Les champs historiques fieldLabel et rejectionReason ne sont pas
// stockés : fieldLabel est reconstruit depuis MODIFICATION_FIELD_LABELS, et
// rejectionReason laissé vide, pour conserver la MÊME forme de retour.
// ----------------------------------------------------------------------------
type ModificationRequestRow = {
  id: string;
  business_id: string | null;
  tenant_id: string | null;
  requested_by: string | null;
  field: ModificationField;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  status: ModificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

function mapRow(row: ModificationRequestRow): ModificationRequest {
  return {
    id: row.id,
    establishmentSlug: row.business_id ?? '',
    field: row.field,
    fieldLabel: MODIFICATION_FIELD_LABELS[row.field] ?? '',
    oldValue: row.old_value ?? '',
    newValue: row.new_value ?? '',
    reason: row.reason ?? '',
    status: row.status,
    rejectionReason: undefined,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export async function getModificationRequests(): Promise<ModificationRequest[]> {
  const { data, error } = await sb()
    .from('modification_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as ModificationRequestRow[]).map(mapRow);
}

// NOTE: filtre désormais par business_id (passez un businessId).
export async function getRequestsByEstablishment(
  businessId: string
): Promise<ModificationRequest[]> {
  const { data, error } = await sb()
    .from('modification_requests')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as ModificationRequestRow[]).map(mapRow);
}

export async function addModificationRequest(
  data: Omit<ModificationRequest, 'id' | 'createdAt' | 'status'>
): Promise<ModificationRequest> {
  const { data: inserted, error } = await sb()
    .from('modification_requests')
    .insert({
      business_id: data.establishmentSlug,
      field: data.field,
      old_value: data.oldValue,
      new_value: data.newValue,
      reason: data.reason,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error || !inserted) {
    throw error ?? new Error('Insertion modification_request échouée');
  }
  return mapRow(inserted as ModificationRequestRow);
}

export async function getPendingRequestsCountForEstablishment(
  businessId: string
): Promise<number> {
  const { count, error } = await sb()
    .from('modification_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'pending');
  if (error || count === null) return 0;
  return count;
}

export const MODIFICATION_STATUS_CONFIG: Record<
  ModificationStatus,
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
