'use client';

import {
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Download,
  Calendar,
  MapPin,
} from 'lucide-react';

const KPIS = [
  { label: 'Visiteurs uniques (30j)', value: '24 580', delta: '+15%', icon: Users, color: 'text-blue-600' },
  { label: 'Pages vues (30j)', value: '85 240', delta: '+22%', icon: Eye, color: 'text-purple-600' },
  { label: 'Clics fiches commerces', value: '12 340', delta: '+8%', icon: MousePointerClick, color: 'text-orange-600' },
  { label: 'Demandes partenaires', value: '23', delta: '+45%', icon: TrendingUp, color: 'text-green-600' },
];

const TOP_CATEGORIES = [
  { name: 'Restaurants', clicks: 3240, percent: 85 },
  { name: 'Hôtels', clicks: 2890, percent: 76 },
  { name: 'Activités', clicks: 2140, percent: 56 },
  { name: 'Associations', clicks: 1580, percent: 41 },
  { name: 'Shopping', clicks: 1120, percent: 29 },
];

const TOP_CITIES = [
  { name: 'Phnom Penh', visitors: 9840, percent: 92 },
  { name: 'Siem Reap', visitors: 7120, percent: 66 },
  { name: 'Kampot', visitors: 2340, percent: 22 },
  { name: 'Battambang', visitors: 1890, percent: 18 },
  { name: 'Koh Rong', visitors: 1450, percent: 13 },
];

const MONTHLY = [40, 55, 48, 70, 62, 85, 78, 92, 88, 75, 95, 100];
const MONTHS = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'];

export default function StatsPage() {
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
              <div className="text-xs text-green-600">▲ {kpi.delta} vs période précédente</div>
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