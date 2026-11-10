// ============================================================================
// Villes du Cambodge — lecture publique (table cities, pilotée superadmin).
// Utilisé par le wizard : liste déroulante + option "Autre" (saisie libre).
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

export type City = { name: string; slug: string; province: string | null };

export async function getCities(): Promise<City[]> {
  try {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await sb
      .from('cities')
      .select('name, slug, province')
      .eq('is_active', true)
      .order('position');
    return (data || []) as City[];
  } catch {
    return [];
  }
}
