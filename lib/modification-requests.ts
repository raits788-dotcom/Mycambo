// ============================================================================
// DEMANDES DE MODIFICATION (mock — localStorage)
// ============================================================================

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

const STORAGE_KEY = 'mycambo_modification_requests';

export const MODIFICATION_FIELD_LABELS: Record<ModificationField, string> = {
  name: "Nom de l'établissement",
  category: 'Catégorie',
  address: 'Adresse',
  city: 'Ville',
  legal: 'Informations légales',
  registration_number: "Numéro d'enregistrement",
};

export function getModificationRequests(): ModificationRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRequestsByEstablishment(
  slug: string
): ModificationRequest[] {
  return getModificationRequests()
    .filter((r) => r.establishmentSlug === slug)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addModificationRequest(
  data: Omit<ModificationRequest, 'id' | 'createdAt' | 'status'>
): ModificationRequest {
  const all = getModificationRequests();
  const request: ModificationRequest = {
    ...data,
    id: 'mod_' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  all.push(request);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return request;
}

export function getPendingRequestsCountForEstablishment(
  slug: string
): number {
  return getModificationRequests().filter(
    (r) => r.establishmentSlug === slug && r.status === 'pending'
  ).length;
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