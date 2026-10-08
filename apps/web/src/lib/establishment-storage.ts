// ============================================================================
// STOCKAGE DES ÉTABLISSEMENTS PARTENAIRE (Supabase)
// ----------------------------------------------------------------------------
// Toutes les fonctions exposent la même API que l'ancienne version localStorage,
// mais lisent et écrivent dans la table `businesses` de Supabase.
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ============================================================================
// TYPES
// ============================================================================

export type EstablishmentStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';

export interface StoredEstablishment {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  photos: string[] | null;
  hours: Record<string, unknown> | null;
  status: 'pending' | 'approved' | 'suspended';
  is_featured: boolean;
  featured_position: number | null;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: { name: string; icon?: string } | null;
  // Extensions locales (jamais utilisées côté BDD, garde la compat)
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  documents?: { name: string; url: string; size: number }[];
}

export type ArchivedEstablishment = StoredEstablishment & {
  archivedAt: string;
  archivedReason: string;
  archivedBy: 'user' | 'admin';
};

// ============================================================================
// LECTURE
// ============================================================================

export async function getStoredEstablishments(): Promise<StoredEstablishment[]> {
  const { data, error } = await supabase()
    .from('businesses')
    .select('*, categories(name, icon)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getStoredEstablishments:', error);
    return [];
  }
  return (data as StoredEstablishment[]) || [];
}

export async function getPartnerEstablishments(
  tenantId: string
): Promise<StoredEstablishment[]> {
  const { data, error } = await supabase()
    .from('businesses')
    .select('*, categories(name, icon)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getPartnerEstablishments:', error);
    return [];
  }
  return (data as StoredEstablishment[]) || [];
}

export async function getEstablishmentBySlug(
  slug: string
): Promise<StoredEstablishment | null> {
  const { data, error } = await supabase()
    .from('businesses')
    .select('*, categories(name, icon)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('getEstablishmentBySlug:', error);
    return null;
  }
  return data as StoredEstablishment | null;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// ÉCRITURE
// ============================================================================

export async function addEstablishment(
  tenantId: string,
  payload: {
    name: string;
    category_id?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    photos?: string[];
  }
): Promise<StoredEstablishment | null> {
  const slug =
    generateSlug(payload.name) +
    '-' +
    Math.random().toString(36).substring(2, 8);

  const { data, error } = await supabase()
    .from('businesses')
    .insert({
      tenant_id: tenantId,
      name: payload.name,
      slug,
      category_id: payload.category_id || null,
      description: payload.description || null,
      address: payload.address || null,
      city: payload.city || null,
      phone: payload.phone || null,
      email: payload.email || null,
      website: payload.website || null,
      photos: payload.photos || [],
      status: 'pending',
    })
    .select()
    .single();
  if (error) {
    console.error('addEstablishment:', error);
    return null;
  }
  return data as StoredEstablishment;
}

export async function updateEstablishment(
  id: string,
  payload: Partial<StoredEstablishment>
): Promise<boolean> {
  const { error } = await supabase()
    .from('businesses')
    .update(payload)
    .eq('id', id);
  if (error) {
    console.error('updateEstablishment:', error);
    return false;
  }
  return true;
}

export async function deleteEstablishment(slug: string): Promise<boolean> {
  const { error } = await supabase()
    .from('businesses')
    .delete()
    .eq('slug', slug);
  if (error) {
    console.error('deleteEstablishment:', error);
    return false;
  }
  return true;
}

// ============================================================================
// ARCHIVES (pas encore en BDD, on retourne des listes vides)
// ============================================================================

export async function getArchivedEstablishments(): Promise<ArchivedEstablishment[]> {
  return [];
}

export async function archiveEstablishment(
  slug: string,
  reason: string,
  by: 'user' | 'admin'
): Promise<boolean> {
  // À implémenter plus tard
  console.warn('archiveEstablishment not implemented yet:', { slug, reason, by });
  return true;
}

export async function restoreEstablishment(slug: string): Promise<boolean> {
  console.warn('restoreEstablishment not implemented yet:', slug);
  return true;
}

// ============================================================================
// STATUTS (config UI)
// ============================================================================

export const STATUS_CONFIG: Record<
  EstablishmentStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Brouillon', color: 'text-gris-texte', bgColor: 'bg-gris-fond' },
  pending: { label: 'En attente', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  approved: { label: 'Publié', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Refusé', color: 'text-red-700', bgColor: 'bg-red-100' },
  suspended: { label: 'Suspendu', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export function getStatusConfig(status: EstablishmentStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

// ============================================================================
// STATS (à connecter plus tard)
// ============================================================================

export async function getTotalViews(tenantId: string): Promise<number> {
  return 0;
}

export async function getTotalSupports(tenantId: string): Promise<number> {
  return 0;
}

export async function getTotalReviews(tenantId: string): Promise<number> {
  return 0;
}

export async function getTotalEstablishments(tenantId: string): Promise<number> {
  const { count } = await supabase()
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  return count || 0;
}

export async function getPendingEstablishmentsCount(
  tenantId: string
): Promise<number> {
  const { count } = await supabase()
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'pending');
  return count || 0;
}