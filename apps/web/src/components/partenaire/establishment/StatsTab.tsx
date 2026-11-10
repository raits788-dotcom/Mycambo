'use client';

import { useEffect, useState } from 'react';
import { Eye, Heart, Star, TrendingUp, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import {
  getEstablishmentStats,
  type EstablishmentStats,
  type PeriodKey,
} from '@/lib/stats-tracker';
import { getPlanPermissionsFromDB } from '@/lib/plan-permissions';
import { createBrowserClient } from '@supabase/ssr';

interface StatsTabProps {
  establishment: StoredEstablishment;
}

// Une métrique affichable. `assoOnly` = pertinente seulement pour les
// associations (soutiens/dons). `needsDetail` = fait partie du détail débloqué
// par la formule (graphe/évolution) — les totaux de base restent visibles.
type MetricDef = {
  key: 'views' | 'reviews' | 'favorites' | 'supports';
  label: string;
  icon: typeof Eye;
  color: string;
  assoOnly?: boolean;
};

// NB : "Favoris" n'est pas affiché côté partenaire — la RLS de `favorites`
// (user_id = auth.uid()) empêche d'en compter le total de façon fiable sans
// ouvrir les données. À rajouter plus tard via une vue agrégée sécurisée.
const METRICS: MetricDef[] = [
  { key: 'views',     label: 'Vues',     icon: Eye,   color: 'text-marine' },
  { key: 'reviews',   label: 'Avis',     icon: Star,  color: 'text-ic-or' },
  { key: 'supports',  label: 'Soutiens', icon: Heart, color: 'text-red-500', assoOnly: true },
];

export default function StatsTab({ establishment }: StatsTabProps) {
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const [stats, setStats] = useState<EstablishmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [canShowStats, setCanShowStats] = useState(false); // détail (graphe) débloqué ?
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const isAssociation = (establishment.categories?.slug || '').toLowerCase().includes('asso')
    || (establishment.categories?.name || '').toLowerCase().includes('association');

  // Permissions de formule (détail des stats).
  useEffect(() => {
    (async () => {
      try {
        const sb = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: tenant } = await sb
          .from('tenants')
          .select('plans(slug)')
          .eq('id', establishment.tenant_id)
          .single();
        const slug = (tenant as any)?.plans?.slug || 'decouverte';
        const perms = await getPlanPermissionsFromDB(slug);
        setCanShowStats(!!perms.canShowStats);
      } catch {
        setCanShowStats(false);
      }
    })();
  }, [establishment.tenant_id]);

  // Date de création de l'établissement.
  useEffect(() => {
    setCreatedAt(establishment.created_at || null);
  }, [establishment]);

  // Vraies stats (rechargées à chaque changement de période).
  useEffect(() => {
    let active = true;
    setLoading(true);
    getEstablishmentStats(establishment.id, period).then((s) => {
      if (active) { setStats(s); setLoading(false); }
    });
    return () => { active = false; };
  }, [establishment.id, period]);

  // Métriques visibles = celles qui s'appliquent au type d'établissement.
  // (On n'enlève PAS de totaux selon la formule : Découverte voit déjà les
  // totaux ; seul le détail/graphe est réservé. Facile d'en ajouter d'autres.)
  const visibleMetrics = METRICS.filter((m) => !m.assoOnly || isAssociation);

  const maxViews = Math.max(1, ...(stats?.series || []).map((d) => d.views));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-extrabold text-marine text-base mb-1">
          Statistiques de {establishment.name}
        </h2>
        <p className="text-xs text-gris-texte">
          Suivez l&apos;activité réelle de votre établissement sur myCAMBO.
          {createdAt && (
            <> · Sur myCAMBO depuis le{' '}
              <b className="text-ink">
                {new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </b>
            </>
          )}
        </p>
      </div>

      {/* Filtres période */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['7d', '30d', '1y'] as PeriodKey[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'text-xs font-bold rounded-full px-4 py-2 transition-colors border',
              period === p
                ? 'bg-marine text-white border-marine'
                : 'bg-white border-gris-ligne text-gris-texte hover:border-marine'
            )}
          >
            {p === '7d' && '7 derniers jours'}
            {p === '30d' && '30 derniers jours'}
            {p === '1y' && '12 derniers mois'}
          </button>
        ))}
      </div>

      {/* KPI cards — vraies valeurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {visibleMetrics.map((m) => {
          const Icon = m.icon;
          const val = loading || !stats ? null : stats.totals[m.key];
          return (
            <div key={m.key} className="bg-white rounded-lg border border-gris-ligne p-4">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
                <Icon size={14} className={m.color} />
                {m.label}
              </div>
              <div className="text-2xl font-extrabold text-marine">
                {val === null ? '…' : val.toLocaleString('fr-FR')}
              </div>
              {m.key === 'reviews' && stats?.totals.avgRating != null && (
                <div className="text-[10px] text-gris-doux mt-1">
                  note moyenne {stats.totals.avgRating.toFixed(1)}/5
                </div>
              )}
              {m.key === 'views' && (
                <div className="text-[10px] text-gris-doux mt-1">
                  {period === '7d' ? '7 derniers jours' : period === '30d' ? '30 derniers jours' : '12 derniers mois'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graphique d'évolution — réservé aux formules qui débloquent le détail */}
      {canShowStats ? (
        <div className="bg-white rounded-lg border border-gris-ligne p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <div className="font-bold text-marine text-sm">Évolution des vues</div>
              <div className="text-xs text-gris-texte">
                {period === '7d' && 'Sur les 7 derniers jours'}
                {period === '30d' && 'Sur les 30 derniers jours'}
                {period === '1y' && 'Sur les 12 derniers mois'}
              </div>
            </div>
            <TrendingUp size={16} className="text-green-600" />
          </div>

          <div className="flex items-end justify-between gap-1 h-40">
            {(stats?.series || []).map((d, i) => {
              const heightPct = (d.views / maxViews) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-marine opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.views}
                  </div>
                  <div className="w-full bg-gris-fond rounded-t-md relative flex items-end h-full">
                    <div
                      className="w-full bg-marine rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPct}%`, minHeight: d.views > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className="text-[9px] font-bold text-gris-doux">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
          <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-blue-900 text-sm mb-1">
              Évolution détaillée réservée aux formules supérieures
            </div>
            <div className="text-xs text-blue-800 leading-relaxed">
              Vous voyez déjà vos totaux réels ci-dessus. Passez à une formule
              supérieure pour le graphe d&apos;évolution et les statistiques détaillées.
            </div>
            <Link href="/partenaire/formules" className="inline-block text-xs font-bold text-blue-900 hover:underline mt-2">
              Voir les formules →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
