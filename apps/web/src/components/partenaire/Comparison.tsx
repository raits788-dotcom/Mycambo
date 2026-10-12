'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';

interface ComparisonProps {
  compact?: boolean;
}

export default function Comparison({ compact = false }: ComparisonProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const [plansRes, versionsRes, featuresRes] = await Promise.all([
        supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .eq('audience', 'business')
          .order('position'),
        supabase.from('plan_versions').select('*').eq('status', 'current'),
        supabase.from('plan_features').select('*').eq('is_active', true).order('position'),
      ]);

      const merged = (plansRes.data || []).map((p: any) => {
        const v = (versionsRes.data || []).find((ver: any) => ver.plan_id === p.id);
        return { ...p, version: v, feature_ids: v?.feature_ids || [] };
      });

      setPlans(merged);
      setFeatures(featuresRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <section className={cn('bg-gris-fond', compact ? 'py-10' : 'py-16')}>
        <div className="max-w-wrap mx-auto px-4 md:px-6 text-center">
          <Loader2 size={24} className="text-marine animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  // Regroupe les features par catégorie
  const grouped = features.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  const CATEGORY_LABELS: Record<string, string> = {
    visibility: 'Visibilité',
    media: 'Médias',
    businesses: 'Établissements',
    team: 'Équipe',
    analytics: 'Statistiques',
    support: 'Support',
    integration: 'Intégrations',
    communication: 'Communication',
    general: 'Général',
  };

  return (
    <section className={cn('bg-gris-fond', compact ? 'py-10' : 'py-16')}>
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-marine mb-2">
            Comparatif détaillé
          </h2>
          <p className="text-sm text-gris-texte">
            Tout ce qui est inclus dans chaque formule
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gris-ligne bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-marine text-white">
                <th className={cn('px-3 md:px-4 text-left text-sm font-bold', compact ? 'py-3' : 'py-4')}>
                  Fonctionnalité
                </th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className={cn('px-3 md:px-4 text-center text-sm font-bold', compact ? 'py-3' : 'py-4')}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([category, catFeatures], catIdx) => (
                <>
                  <tr key={`cat-${category}`} className="bg-marine/5">
                    <td
                      colSpan={plans.length + 1}
                      className="px-3 md:px-4 py-2 text-xs font-bold uppercase tracking-wider text-marine"
                    >
                      {CATEGORY_LABELS[category] || category}
                    </td>
                  </tr>
                  {(catFeatures as any[]).map((f, i) => (
                    <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gris-fond/50'}>
                      <td className={cn('px-3 md:px-4 text-sm text-ink font-medium', compact ? 'py-2' : 'py-3')}>
                        {f.label}
                        {f.metadata?.max && (
                          <span className="text-[10px] text-gris-doux ml-2">
                            (max {f.metadata.max} {f.metadata.unit})
                          </span>
                        )}
                      </td>
                      {plans.map((p) => {
                        const has = p.feature_ids.includes(f.id);
                        return (
                          <td
                            key={p.id}
                            className={cn('px-3 md:px-4 text-center', compact ? 'py-2' : 'py-3')}
                          >
                            {has ? (
                              <span className="text-ic-vert font-bold text-base">✓</span>
                            ) : (
                              <span className="text-gris-doux">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}