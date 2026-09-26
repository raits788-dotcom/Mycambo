'use client';

import { useState, useMemo } from 'react';
import {
  Eye,
  Heart,
  Star,
  TrendingUp,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_STATS_7_DAYS,
  MOCK_STATS_30_DAYS,
  MOCK_STATS_1_YEAR,
  MOCK_PARTNER_ESTABLISHMENTS_DETAILED,
} from '@/lib/partner-mock';

type Period = '7d' | '30d' | '1y';
type Metric = 'views' | 'supports' | 'reviews';

const PERIOD_DATA = {
  '7d': MOCK_STATS_7_DAYS,
  '30d': MOCK_STATS_30_DAYS,
  '1y': MOCK_STATS_1_YEAR,
};

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '1y': '12 derniers mois',
};

const METRIC_LABELS: Record<Metric, { label: string; icon: any; color: string }> = {
  views: { label: 'Vues', icon: Eye, color: 'text-marine' },
  supports: { label: 'Soutiens', icon: Heart, color: 'text-red-500' },
  reviews: { label: 'Avis', icon: Star, color: 'text-ic-or' },
};

export default function StatistiquesPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [metric, setMetric] = useState<Metric>('views');

  const data = PERIOD_DATA[period];

  const stats = useMemo(() => {
    const current = data.reduce(
      (sum, d) => sum + d[metric as keyof typeof d],
      0
    );
    // Simulation évolution : +12% si données récentes
    const evolution = period === '7d' ? 12 : period === '30d' ? 8 : 15;
    return { total: current, evolution };
  }, [data, metric, period]);

  // Max pour dimensionner les barres
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d[metric as keyof typeof d] as number)),
    [data, metric]
  );

  // Totaux par établissement
  const perEstablishment = MOCK_PARTNER_ESTABLISHMENTS_DETAILED;

  return (
    <>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Statistiques
          </h1>
          <p className="text-sm text-gris-texte">
            Suivez l&apos;activité de vos établissements.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 border border-gris-ligne text-marine font-bold px-4 py-2.5 rounded-full hover:border-marine transition-colors text-sm">
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['7d', '30d', '1y'] as Period[]).map((p) => (
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
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {(['views', 'supports', 'reviews'] as Metric[]).map((m) => {
          const config = METRIC_LABELS[m];
          const Icon = config.icon;
          const total = data.reduce(
            (sum, d) => sum + (d[m] as number),
            0
          );
          const isActive = metric === m;

          return (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                'bg-white rounded-lg border p-4 text-left transition-all',
                isActive
                  ? 'border-marine ring-1 ring-marine'
                  : 'border-gris-ligne hover:border-marine/50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gris-texte">
                  <Icon size={14} className={config.color} />
                  {config.label}
                </div>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                  <ArrowUp size={10} />
                  +{stats.evolution}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-marine">
                {total.toLocaleString('fr-FR')}
              </div>
              <div className="text-[10px] text-gris-doux mt-1">
                sur {PERIOD_LABELS[period]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Graphique en barres */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-marine text-base">
              Évolution — {METRIC_LABELS[metric].label}
            </h2>
            <p className="text-xs text-gris-texte">
              {PERIOD_LABELS[period]}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gris-texte">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-green-600 font-bold">
              +{stats.evolution}%
            </span>
            <span>vs période précédente</span>
          </div>
        </div>

        {/* Barres */}
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((d, i) => {
            const value = d[metric as keyof typeof d] as number;
            const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="text-[10px] font-bold text-marine opacity-0 group-hover:opacity-100 transition-opacity">
                  {value.toLocaleString('fr-FR')}
                </div>
                <div className="w-full bg-gris-fond rounded-t-md relative flex items-end h-full">
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all duration-300',
                      metric === 'views' && 'bg-marine',
                      metric === 'supports' && 'bg-red-500',
                      metric === 'reviews' && 'bg-ic-or'
                    )}
                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                  />
                </div>
                <div className="text-[10px] font-bold text-gris-doux">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détail par établissement */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine text-base">
            Détail par établissement
          </h2>
          <p className="text-xs text-gris-texte">
            Activité cumulée sur tous les établissements.
          </p>
        </div>

        <div className="divide-y divide-gris-ligne">
          {perEstablishment.map((e) => (
            <div
              key={e.slug}
              className="px-5 py-4 flex items-center gap-4 flex-wrap"
            >
              <div className="w-12 h-12 rounded-lg bg-gris-fond flex items-center justify-center text-xl flex-shrink-0">
                🏫
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-marine text-sm truncate">
                  {e.name}
                </div>
                <div className="text-xs text-gris-texte">{e.city}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-center">
                <div>
                  <div className="font-extrabold text-marine text-base">
                    {e.views.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-[10px] text-gris-doux">Vues</div>
                </div>
                <div>
                  <div className="font-extrabold text-marine text-base">
                    {e.supports}
                  </div>
                  <div className="text-[10px] text-gris-doux">Soutiens</div>
                </div>
                <div>
                  <div className="font-extrabold text-marine text-base">
                    {e.reviewsCount}
                  </div>
                  <div className="text-[10px] text-gris-doux">Avis</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}