'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Download,
  Calendar,
  MapPin,
} from 'lucide-react';

// Les icônes des KPI restent côté code ; les valeurs viennent de la base.
const KPI_META = [
  { key: 'views_30d', label: 'Pages vues (30j)', icon: Eye, color: 'text-purple-600' },
  { key: 'clicks_30d', label: 'Clics fiches commerces (30j)', icon: MousePointerClick, color: 'text-orange-600' },
  { key: 'requests_30d', label: 'Demandes partenaires (30j)', icon: TrendingUp, color: 'text-green-600' },
  { key: 'establishments', label: 'Établissements publiés', icon: Users, color: 'text-blue-600' },
] as const;

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.rpc('admin_stats');
        if (data && !data.error) setStats(data);
      } catch {
        /* laisse stats à null : l'UI affiche des tirets */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (n: number | undefined) =>
    typeof n === 'number' ? n.toLocaleString('fr-FR') : '—';

  // KPI à partir des données base
  const KPIS = KPI_META.map((m) => ({
    label: m.label,
    value: fmt(stats?.[m.key]),
    icon: m.icon,
    color: m.color,
  }));

  // Top catégories / villes (normalisés en %)
  const rawCats = (stats?.top_categories || []) as { name: string; count: number }[];
  const maxCat = Math.max(1, ...rawCats.map((c) => c.count));
  const TOP_CATEGORIES = rawCats.map((c) => ({
    name: c.name,
    clicks: c.count,
    percent: Math.round((c.count / maxCat) * 100),
  }));

  const rawCities = (stats?.top_cities || []) as { name: string; count: number }[];
  const maxCity = Math.max(1, ...rawCities.map((c) => c.count));
  const TOP_CITIES = rawCities.map((c) => ({
    name: c.name,
    visitors: c.count,
    percent: Math.round((c.count / maxCity) * 100),
  }));

  // Courbe mensuelle (hauteurs normalisées 0-100)
  const rawMonthly = (stats?.monthly || []) as { mois: string; views: number }[];
  const maxM = Math.max(1, ...rawMonthly.map((m) => m.views));
  const MONTHLY = rawMonthly.map((m) => Math.round((m.views / maxM) * 100));
  const MONTHS = rawMonthly.map((m) => m.mois.slice(5)); // "MM"

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Statistiques
          </h1>
          <p className="text-sm text-gris-texte">
            Vue globale de l&apos;activité de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5">
            <option>30 derniers jours</option>
            <option>7 derniers jours</option>
            <option>90 derniers jours</option>
            <option>12 derniers mois</option>
          </select>
          <button className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine">
            <Download size={14} />
            Exporter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
                <Icon size={14} className={kpi.color} />
                {kpi.label}
              </div>
              <div className="text-3xl font-extrabold text-marine mb-1">{kpi.value}</div>
              <div className="text-xs text-gris-doux">sur les 30 derniers jours</div>
            </div>
          );
        })}
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-6 shadow-cb-sm">
        <h2 className="font-bold text-marine mb-4">Évolution des visites — 12 mois</h2>
        <div className="flex items-end gap-2 h-52">
          {MONTHLY.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={'w-full rounded-t ' + (i >= 9 ? 'bg-marine' : 'bg-marine/25')} style={{ height: h + '%' }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gris-doux mt-2">
          {MONTHS.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Top catégories + villes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Catégories */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-5">
            <MousePointerClick size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Top catégories (clics)</h2>
          </div>
          <ul className="space-y-4">
            {TOP_CATEGORIES.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-marine">{c.name}</span>
                  <span className="text-gris-texte">{c.clicks.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gris-fond rounded-full overflow-hidden">
                  <div className="h-full bg-marine rounded-full" style={{ width: c.percent + '%' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Villes */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Top villes (visiteurs)</h2>
          </div>
          <ul className="space-y-4">
            {TOP_CITIES.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-marine">{c.name}</span>
                  <span className="text-gris-texte">{c.visitors.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gris-fond rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: c.percent + '%' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}