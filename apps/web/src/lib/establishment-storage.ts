// ============================================================================
// STOCKAGE DES ÉTABLISSEMENTS PARTENAIRE (localStorage)
// ----------------------------------------------------------------------------
// Mock en attendant Supabase. Fusionne :
//   • Les établissements de démo (mock)
//   • Les établissements créés par le partenaire (localStorage)
// ============================================================================

import {
  MOCK_PARTNER_ESTABLISHMENTS_DETAILED,
  type PartnerEstablishmentDetail,
} from './partner-mock';

const STORAGE_KEY = 'mycambo_partner_establishments';
const ARCHIVE_KEY = 'mycambo_archived_establishments';

// ============================================================================
// TYPES
// ============================================================================

export type EstablishmentStatus =
  | 'draft'      // Brouillon
  | 'pending'    // En attente de validation
  | 'approved'   // Publié
  | 'rejected'   // Refusé par myCAMBO
  | 'suspended'; // Suspendu

export type StoredEstablishment = PartnerEstablishmentDetail & {
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  photos?: string[];
  documents?: {
    name: string;
    url: string;
    size: number;
  }[];
};

export type ArchivedEstablishment = StoredEstablishment & {
  archivedAt: string;
  archivedReason: string;
  archivedBy: 'user' | 'admin';
};

// ============================================================================
// LECTURE
// ============================================================================

export function getStoredEstablishments(): StoredEstablishment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEstablishment[]) : [];
  } catch {
    return [];
  }
}

export function getPartnerEstablishments(): StoredEstablishment[] {
  const stored = getStoredEstablishments();
  const deletedSlugs = getDeletedSlugs();
  const storedSlugs = new Set(stored.map((e) => e.slug));

  // 1. Mock : exlut les slugs supprimés ET ceux déjà dans le localStorage
  const mockItems = MOCK_PARTNER_ESTABLISHMENTS_DETAILED.filter(
    (e) => !storedSlugs.has(e.slug) && !deletedSlugs.includes(e.slug)
  );

  // 2. localStorage : exlut aussi les supprimés
  const storedFiltered = stored.filter(
    (e) => !deletedSlugs.includes(e.slug)
  );

  return [...mockItems, ...storedFiltered];
}

export function getEstablishmentBySlug(
  slug: string
): StoredEstablishment | null {
  const all = getPartnerEstablishments();
  return all.find((e) => e.slug === slug) || null;
}

// ============================================================================
// ÉCRITURE
// ============================================================================

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = getPartnerEstablishments().map((e) => e.slug);
  let slug = base;
  let counter = 1;
  while (existing.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export function addEstablishment(
  data: Omit<StoredEstablishment, 'createdAt'> & { createdAt?: string }
): StoredEstablishment {
  const all = getStoredEstablishments();
  const newEstablishment: StoredEstablishment = {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
  };
  all.push(newEstablishment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newEstablishment;
}

export function updateEstablishment(
  slug: string,
  updates: Partial<StoredEstablishment>
): StoredEstablishment | null {
  const all = getStoredEstablishments();
  const index = all.findIndex((e) => e.slug === slug);

  if (index === -1) {
    const mockItem = MOCK_PARTNER_ESTABLISHMENTS_DETAILED.find(
      (e) => e.slug === slug
    );
    if (!mockItem) return null;

    const copy = { ...mockItem, ...updates } as StoredEstablishment;
    all.push(copy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return copy;
  }

  all[index] = { ...all[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteEstablishment(slug: string): boolean {
  const all = getStoredEstablishments();
  const filtered = all.filter((e) => e.slug !== slug);

  // Si l'établissement était dans le mock, on doit le "bloquer" en marquant
  // une suppression locale. On utilise une liste de slugs supprimés.
  if (filtered.length === all.length) {
    // Il était dans le mock → on l'ajoute aux "supprimés" pour qu'il n'apparaisse plus
    const deletedSlugs = getDeletedSlugs();
    if (!deletedSlugs.includes(slug)) {
      deletedSlugs.push(slug);
      localStorage.setItem(
        'mycambo_deleted_slugs',
        JSON.stringify(deletedSlugs)
      );
    }
    return true;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

function getDeletedSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('mycambo_deleted_slugs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// ARCHIVAGE
// ============================================================================

export function getArchivedEstablishments(): ArchivedEstablishment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function archiveEstablishment(
  slug: string,
  reason: string
): boolean {
  const establishment = getEstablishmentBySlug(slug);
  if (!establishment) return false;

  const archived: ArchivedEstablishment = {
    ...establishment,
    status: 'suspended',
    archivedAt: new Date().toISOString(),
    archivedReason: reason,
    archivedBy: 'user',
  };

  const all = getArchivedEstablishments();
  all.push(archived);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(all));

  return deleteEstablishment(slug);
}

export function restoreEstablishment(slug: string): boolean {
  const archived = getArchivedEstablishments();
  const found = archived.find((e) => e.slug === slug);
  if (!found) return false;

  const { archivedAt, archivedReason, archivedBy, ...restored } = found;
  const active = getStoredEstablishments();
  active.push({ ...restored, status: 'pending' });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(active));

  const updated = archived.filter((e) => e.slug !== slug);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));

  return true;
}

// ============================================================================
// HELPERS DE STATUT
// ============================================================================

export const STATUS_CONFIG: Record<
  EstablishmentStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  draft: {
    label: 'Brouillon',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: 'fa-pencil',
  },
  pending: {
    label: 'En attente de validation',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: 'fa-clock',
  },
  approved: {
    label: 'Publié',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: 'fa-circle-check',
  },
  rejected: {
    label: 'Refusé',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: 'fa-xmark',
  },
  suspended: {
    label: 'Suspendu',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: 'fa-pause',
  },
};

export function getStatusConfig(status: EstablishmentStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
}

// ============================================================================
// STATISTIQUES
// ============================================================================

export function getTotalViews(): number {
  return getPartnerEstablishments().reduce(
    (sum, e) => sum + (e.views || 0),
    0
  );
}

export function getTotalSupports(): number {
  return getPartnerEstablishments().reduce(
    (sum, e) => sum + (e.supports || 0),
    0
  );
}

export function getTotalReviews(): number {
  return getPartnerEstablishments().reduce(
    (sum, e) => sum + (e.reviewsCount || 0),
    0
  );
}

export function getTotalEstablishments(): number {
  return getPartnerEstablishments().length;
}

export function getPendingEstablishmentsCount(): number {
  return getPartnerEstablishments().filter((e) => e.status === 'pending')
    .length;
}