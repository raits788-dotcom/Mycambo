// ============================================================================
// Commodités par catégorie — source UNIQUE (table category_amenities)
// ----------------------------------------------------------------------------
// Lue par : le wizard (étape Détails), l'éditeur partenaire (onglet Services)
// et la fiche publique (onglet Services). Zéro divergence.
//
// businesses.services reste un jsonb { "<amenity_key>": true }. Les clés sont
// celles de category_amenities.amenity_key.
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

export type Amenity = {
  key: string;
  label: string;
  icon_key: string | null;
};

// Réduit un slug de catégorie (ou sous-catégorie) à sa FAMILLE de commodités.
// Les familles de seed : transport, cafe, shopping, spa, immobilier, activite,
// hotel, restaurant, association.
export function familyForAmenities(slug: string | null | undefined): string {
  if (!slug) return '';
  const s = slug.toLowerCase();
  // Sous-catégories préfixées → famille
  if (s.startsWith('hotel')) return 'hotel';
  if (s.startsWith('resto') || s === 'restaurant') return 'restaurant';
  if (s.startsWith('asso') || s === 'association') return 'association';
  // Familles directes de "autres-commerces"
  if (['transport', 'cafe', 'shopping', 'spa', 'immobilier', 'activite'].includes(s)) return s;
  // Variantes de nommage éventuelles
  if (s.includes('transport') || s.includes('location')) return 'transport';
  if (s.includes('cafe') || s.includes('café') || s.includes('salon')) return 'cafe';
  if (s.includes('boutique') || s.includes('shop')) return 'shopping';
  if (s.includes('spa') || s.includes('bien')) return 'spa';
  if (s.includes('immo')) return 'immobilier';
  if (s.includes('activit') || s.includes('loisir')) return 'activite';
  return s; // dernier recours : tel quel (pourra ne rien renvoyer)
}

// Charge les commodités actives d'une famille, triées par position.
export async function getAmenitiesForFamily(familySlug: string): Promise<Amenity[]> {
  if (!familySlug) return [];
  try {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await sb
      .from('category_amenities')
      .select('amenity_key, label, icon_key')
      .eq('category_slug', familySlug)
      .eq('is_active', true)
      .order('position');
    return (data || []).map((r: { amenity_key: string; label: string; icon_key: string | null }) => ({
      key: r.amenity_key,
      label: r.label,
      icon_key: r.icon_key,
    }));
  } catch {
    return [];
  }
}

// Résout la famille depuis un slug de catégorie puis charge ses commodités.
export async function getAmenitiesForCategory(categorySlug: string | null | undefined): Promise<Amenity[]> {
  return getAmenitiesForFamily(familyForAmenities(categorySlug));
}
