import { createClient } from '@supabase/supabase-js';

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  position: number;
  parent_id: string | null;
};

// Client léger lecture seule (catégories = lecture publique via RLS).
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Charge une catégorie par son slug + ses enfants directs (triés par position).
 * Retourne null si la catégorie n'existe pas ou est inactive.
 */
export async function getCategoryWithChildren(
  slug: string
): Promise<{ category: CategoryNode; children: CategoryNode[] } | null> {
  const supabase = publicClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, position, parent_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!category) return null;

  const { data: children } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, position, parent_id')
    .eq('parent_id', category.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  return { category: category as CategoryNode, children: (children || []) as CategoryNode[] };
}

export type CategoryFamily = CategoryNode & { children: CategoryNode[] };

/**
 * Arbre complet des catégories : familles (racines parent_id = null) avec
 * leurs sous-catégories. Sert aux menus déroulants (wizard partenaire, édition,
 * console admin). Accepte un client Supabase existant (côté client) sinon en
 * crée un public.
 */
export async function getCategoryTree(client?: any): Promise<CategoryFamily[]> {
  const supabase = client ?? publicClient();

  const { data: all } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, position, parent_id')
    .eq('is_active', true)
    .order('position', { ascending: true });

  const nodes = (all || []) as CategoryNode[];
  const roots = nodes.filter((c) => !c.parent_id);
  return roots.map((r) => ({
    ...r,
    children: nodes.filter((c) => c.parent_id === r.id),
  }));
}

/**
 * Pour une catégorie donnée (par son slug), retourne de quoi afficher la
 * sous-barre de sa rubrique parente : le slug de la famille, ses sous-catégories
 * et la sous-catégorie active (celle passée). Utilisé sur la fiche établissement
 * pour garder la sous-barre visible, avec l'onglet de l'établissement surligné.
 *
 * - Si le slug est lui-même une famille (parent_id null) → parent = ce slug,
 *   enfants = ses sous-catégories, actif = '' (onglet "Toutes").
 * - Si le slug est une sous-catégorie → parent = sa famille, actif = ce slug.
 * Retourne null si la catégorie n'a pas de sous-barre pertinente.
 */
export async function getFamilyNavForCategory(
  categorySlug: string | null | undefined
): Promise<{ parentSlug: string; children: CategoryNode[]; activeSlug: string } | null> {
  if (!categorySlug) return null;
  const tree = await getCategoryTree();

  // Cas 1 : le slug est une famille.
  const asFamily = tree.find((f) => f.slug === categorySlug);
  if (asFamily) {
    if (asFamily.children.length === 0) return null;
    return { parentSlug: asFamily.slug, children: asFamily.children, activeSlug: '' };
  }

  // Cas 2 : le slug est une sous-catégorie → trouver sa famille.
  for (const fam of tree) {
    const child = fam.children.find((c) => c.slug === categorySlug);
    if (child) {
      return { parentSlug: fam.slug, children: fam.children, activeSlug: child.slug };
    }
  }
  return null;
}
