'use client';

import { useState } from 'react';
import {
  Eye,
  Heart,
  Star,
  TrendingUp,
  ArrowUp,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';

interface StatsTabProps {
  establishment: StoredEstablishment;
}

type Period = '7d' | '30d' | '1y';

const PERIOD_DATA: Record<Period, { label: string; views: number; supports: number; reviews: number }[]> = {
  '7d': [
    { label: 'Lun', views: 120, supports: 8, reviews: 1 },
    { label: 'Mar', views: 145, supports: 12, reviews: 2 },
    { label: 'Mer', views: 132, supports: 6, reviews: 0 },
    { label: 'Jeu', views: 178, supports: 15, reviews: 3 },
    { label: 'Ven', views: 201, supports: 18, reviews: 2 },
    { label: 'Sam', views: 189, supports: 14, reviews: 1 },
    { label: 'Dim', views: 165, supports: 10, reviews: 1 },
  ],
  '30d': [
    { label: 'S1', views: 890, supports: 62, reviews: 8 },
    { label: 'S2', views: 1045, supports: 78, reviews: 12 },
    { label: 'S3', views: 1210, supports: 95, reviews: 15 },
    { label: 'S4', views: 1140, supports: 87, reviews: 11 },
  ],
  '1y': [
    { label: 'Jan', views: 3200, supports: 180, reviews: 28 },
    { label: 'Fév', views: 3450, supports: 210, reviews: 32 },
    { label: 'Mar', views: 4120, supports: 245, reviews: 41 },
    { label: 'Avr', views: 3890, supports: 220, reviews: 35 },
    { label: 'Mai', views: 4200, supports: 260, reviews: 44 },
    { label: 'Jun', views: 3780, supports: 235, reviews: 38 },
  ],
};

export default function StatsTab({ establishment }: StatsTabProps) {
  const [period, setPeriod] = useState<Period>('7d');
  const data = PERIOD_DATA[period];

  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const totalSupports = data.reduce((sum, d) => sum + d.supports, 0);
  const totalReviews = data.reduce((sum, d) => sum + d.reviews, 0);
  const maxViews = Math.max(...data.map((d) => d.views));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-extrabold text-marine text-base mb-1">
          Statistiques de {establishment.name}
        </h2>
        <p className="text-xs text-gris-texte">
          Suivez l&apos;activité de votre établissement sur myCAMBO.
        </p>
      </div>

      {/* Filtres période */}
      <div className="flex flex-wrap gap-2 mb-6">
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
            {p === '7d' && '7 derniers jours'}
            {p === '30d' && '30 derniers jours'}
            {p === '1y' && '12 derniers mois'}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gris-texte">
              <Eye size={14} className="text-marine" />
              Vues
            </div>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <ArrowUp size={10} /> +12%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {totalViews.toLocaleString('fr-FR')}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gris-texte">
              <Heart size={14} className="text-red-500" />
              Soutiens
            </div>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <ArrowUp size={10} /> +8%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {totalSupports}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-gris-texte">
              <Star size={14} className="text-ic-or" />
              Nouveaux avis
            </div>
            <span className="text-[10px] text-gris-doux">12 total</span>
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {totalReviews}
          </div>
        </div>
      </div>

      {/* Graphique */}
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

        <div className="flex items-end justify-between gap-2 h-40">
          {data.map((d, i) => {
            const heightPct = (d.views / maxViews) * 100;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="text-[10px] font-bold text-marine opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.views}
                </div>
                <div className="w-full bg-gris-fond rounded-t-md relative flex items-end h-full">
                  <div
                    className="w-full bg-marine rounded-t-md transition-all duration-300"
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
    </div>
  );
}