import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ═══════════════════════════════════════════════════════════
// NIVEAUX
// ═══════════════════════════════════════════════════════════
export const LEVELS = {
  inscrit:   { label: 'Inscrit',    badge: 'Inscrit',   color: '#9CA3AF', bg: 'bg-gray-100',   text: 'text-gray-700',   ring: 'ring-gray-300',   priority: 0 },
  verifie:   { label: 'Vérifié',    badge: 'Bronze',    color: '#CD7F32', bg: 'bg-amber-100',  text: 'text-amber-800',  ring: 'ring-amber-300',  priority: 1 },
  premium:   { label: 'Premium',    badge: 'Silver',    color: '#C0C0C0', bg: 'bg-slate-100',  text: 'text-slate-700',  ring: 'ring-slate-400',  priority: 2 },
  exception: { label: 'Exception',  badge: 'Gold',      color: '#FFD700', bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-400', priority: 3 },
  legende:   { label: 'Légende',    badge: 'Platine',   color: '#E5E4E2', bg: 'bg-cyan-100',   text: 'text-cyan-800',   ring: 'ring-cyan-400',   priority: 4 },
} as const;

export type Level = keyof typeof LEVELS;

export function getLevel(level: string | null | undefined): typeof LEVELS[Level] {
  return LEVELS[(level as Level) || 'inscrit'] || LEVELS.inscrit;
}

// ═══════════════════════════════════════════════════════════
// LABELS (sous-labels)
// ═══════════════════════════════════════════════════════════
export async function getLabelCatalog() {
  const { data } = await supabase()
    .from('label_catalog')
    .select('*')
    .eq('is_active', true)
    .order('position');
  return data || [];
}

export async function getTenantLabels(tenantId: string) {
  const { data } = await supabase()
    .from('tenant_labels')
    .select('*, label:label_catalog(*)')
    .eq('tenant_id', tenantId);
  return data || [];
}

export async function getBusinessesWithLabels(businessIds: string[]) {
  if (businessIds.length === 0) return {};
  const { data } = await supabase()
    .from('businesses')
    .select('id, tenant_id, tenants(verification_level, id)')
    .in('id', businessIds);

  if (!data) return {};

  // Récupère les labels de chaque tenant
  const tenantIds = [...new Set(data.map((b: any) => b.tenant_id))];
  const { data: labels } = await supabase()
    .from('tenant_labels')
    .select('tenant_id, label:label_catalog(*)')
    .in('tenant_id', tenantIds);

  const labelsByTenant = (labels || []).reduce((acc: any, l: any) => {
    if (!acc[l.tenant_id]) acc[l.tenant_id] = [];
    acc[l.tenant_id].push(l.label);
    return acc;
  }, {});

  const result: Record<string, { level: string; labels: any[] }> = {};
  data.forEach((b: any) => {
    result[b.id] = {
      level: b.tenants?.verification_level || 'inscrit',
      labels: labelsByTenant[b.tenant_id] || [],
    };
  });

  return result;
}