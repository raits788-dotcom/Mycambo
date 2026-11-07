'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { getImpersonatedTenant } from '@/lib/impersonation';

// Rappel compact de complétude affiché sur le dashboard.
// Charge les établissements du tenant, calcule un % simple de complétude,
// et pointe vers la fiche la moins complète.
type Row = { slug: string; name: string; pct: number };

function simplePct(e: any): number {
  // Heuristique légère cohérente avec le guide détaillé.
  const checks = [
    !!(e.name),
    !!(e.long_description || e.description),
    Array.isArray(e.photos) && e.photos.length > 0,
    !!(e.phone || e.email || e.website),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function CompletionReminder() {
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        // Tenant courant (réel ou impersoné)
        const imp = await getImpersonatedTenant();
        let tenantId = (imp as any)?.id || null;
        if (!tenantId) {
          const { data: { user } } = await sb.auth.getUser();
          if (user) {
            const { data: tu } = await sb
              .from('tenant_users')
              .select('tenant_id')
              .eq('user_id', user.id)
              .limit(1)
              .maybeSingle();
            tenantId = (tu as any)?.tenant_id || null;
          }
        }
        if (!tenantId) return;

        const { data } = await sb
          .from('businesses')
          .select('slug, name, description, long_description, photos, phone, email, website')
          .eq('tenant_id', tenantId);

        const rows: Row[] = (data || []).map((e: any) => ({
          slug: e.slug, name: e.name, pct: simplePct(e),
        }));
        // La fiche la moins complète (si une au moins est incomplète)
        const worst = rows.filter((r) => r.pct < 100).sort((a, b) => a.pct - b.pct)[0];
        if (worst) setRow(worst);
      } catch {
        /* silencieux */
      }
    })();
  }, []);

  if (!row) return null;

  const remaining = Math.max(1, Math.round((100 - row.pct) / 25)); // approx items restants

  return (
    <Link
      href={`/espace-partenaire/etablissements/${row.slug}`}
      className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-xl px-4 py-3.5 mb-6 hover:shadow-cb-sm transition-shadow"
    >
      <div
        className="w-12 h-12 rounded-full shrink-0 grid place-items-center"
        style={{ background: `conic-gradient(#1f9d55 ${row.pct}%, #e8edf3 0)` }}
      >
        <div className="w-9 h-9 rounded-full bg-white grid place-items-center text-[11px] font-extrabold text-marine">
          {row.pct}%
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-marine truncate">
          Complétez « {row.name} »
        </div>
        <div className="text-xs text-gris-doux">
          {remaining} élément{remaining > 1 ? 's' : ''} pour une fiche de qualité
        </div>
      </div>
      <span className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full whitespace-nowrap">
        Compléter →
      </span>
    </Link>
  );
}
