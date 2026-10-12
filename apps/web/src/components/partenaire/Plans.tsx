'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';

interface PlansProps {
  compact?: boolean;
}

export default function Plans({ compact = false }: PlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
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
        supabase.from('plan_features').select('*').eq('is_active', true),
      ]);

      const merged = (plansRes.data || []).map((p: any) => {
        const v = (versionsRes.data || []).find((ver: any) => ver.plan_id === p.id);
        const featureIds = v?.feature_ids || [];
        const details = (featuresRes.data || []).filter((f: any) => featureIds.includes(f.id));
        return {
          ...p,
          version: v,
          features_details: details,
        };
      });

      setPlans(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <section id="formules" className={cn('bg-white', compact ? 'py-10' : 'py-16')}>
        <div className="max-w-wrap mx-auto px-4 md:px-6 text-center">
          <Loader2 size={24} className="text-marine animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="formules" className={cn('bg-white', compact ? 'py-10' : 'py-16')}>
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        {!compact && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-marine" />
              <span className="text-xs uppercase tracking-[0.3em] text-marine font-bold">
                Nos formules
              </span>
              <span className="h-px w-10 bg-marine" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-marine mb-4">
              Adaptées à votre activité
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const v = plan.version;
            const price = Number(v?.price_monthly ?? plan.price_monthly);
            const isFree = price === 0;
            const isPopular = plan.slug === 'pro';

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-lg flex flex-col bg-white',
                  isPopular ? 'border-2 border-marine shadow-cb-lg' : 'border border-gris-ligne'
                )}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-marine text-white text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap z-10">
                    Le plus choisi
                  </span>
                )}

                <div className={cn(compact ? 'p-4' : 'p-6')}>
                  <h3 className="text-base font-extrabold text-marine mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={cn('font-extrabold text-marine', compact ? 'text-2xl' : 'text-3xl')}>
                      {isFree ? 'Gratuit' : `${price} $`}
                    </span>
                    {!isFree && <span className="text-xs text-gris-texte">/mois</span>}
                  </div>
                  <div className="text-[11px] text-gris-texte mb-4">
                    {isFree
                      ? 'Pour se faire connaître'
                      : `1 commerce${(v?.max_businesses || plan.max_businesses) > 1 ? ` · ${v?.max_businesses || plan.max_businesses} établissements` : ''}`}
                  </div>

                  <ul className={cn('flex-1', compact ? 'space-y-1.5 mb-4' : 'space-y-2 mb-6')}>
                    {(plan.features_details || []).slice(0, 8).map((f: any) => (
                      <li
                        key={f.id}
                        className={cn(
                          'flex items-start gap-2 text-gris-texte',
                          compact ? 'text-[11px]' : 'text-sm'
                        )}
                      >
                        <span className="text-ic-vert flex-shrink-0 mt-0.5">✓</span>
                        <span className="leading-tight">{f.label}</span>
                      </li>
                    ))}
                    {(plan.features_details || []).length > 8 && (
                      <li className="text-[11px] text-gris-doux italic pl-5">
                        +{plan.features_details.length - 8} autres
                      </li>
                    )}
                  </ul>

                  <Link
                    href="/partenaire/demande"
                    className={cn(
                      'block text-center rounded-full font-bold transition-colors',
                      compact ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm',
                      isPopular
                        ? 'bg-marine text-white hover:bg-marine-dark'
                        : 'bg-gris-fond text-marine hover:bg-marine hover:text-white'
                    )}
                  >
                    {isFree ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gris-doux mt-6">
          Besoin d&apos;une formule Entreprise sur mesure ?{' '}
          <Link href="/partenaire/demande" className="text-marine hover:underline font-bold">
            Contactez-nous
          </Link>
        </p>
      </div>
    </section>
  );
}