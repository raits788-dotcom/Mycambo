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
