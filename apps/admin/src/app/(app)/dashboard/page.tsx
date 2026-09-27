'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Store,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Inbox,
  Star,
  DollarSign,
} from 'lucide-react';

interface Kpi {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

const KPIS: Kpi[] = [
  { label: 'Partenaires actifs', value: '248', delta: '+12 ce mois', deltaType: 'up', icon: Building2, color: 'text-blue-600' },
  { label: 'Établissements', value: '612', delta: '+28 ce mois', deltaType: 'up', icon: Store, color: 'text-green-600' },
  { label: 'Abonnements actifs', value: '231', delta: '+9 ce mois', deltaType: 'up', icon: CreditCard, color: 'text-purple-600' },
  { label: "Chiffre d'affaires du mois", value: '18 450 $', delta: '-3% vs N-1', deltaType: 'down', icon: TrendingUp, color: 'text-orange-600' },
];

const CHART_DATA = [40, 55, 48, 70, 62, 85, 78, 92, 88, 75, 95, 100];
const MONTHS = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'];

export default function AdminDashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Vue d&apos;ensemble
        </h1>
        <p className="text-sm text-gris-texte">
          État global de la plateforme myCAMBO.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm"
            >
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
                <Icon size={14} className={kpi.color} />
                {kpi.label}
              </div>
              <div className="text-3xl font-extrabold text-marine tracking-tight mb-1">
                {kpi.value}
              </div>
              {kpi.delta && (
                <div
                  className={
                    'text-xs ' +
                    (kpi.deltaType === 'up' ? 'text-green-600' : 'text-red-500')
                  }
                >
                  {kpi.deltaType === 'up' ? '▲' : '▼'} {kpi.delta}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-marine">Chiffre d&apos;affaires — 12 mois</h2>
            <select className="text-xs border border-gris-ligne rounded-lg px-2 py-1 text-gris-texte">
              <option>USD ($)</option>
              <option>KHR (៛)</option>
            </select>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {CHART_DATA.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={
                    'w-full rounded-t transition-all ' +
                    (i >= 9 ? 'bg-marine' : 'bg-marine/25')
                  }
                  style={{ height: h + '%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gris-doux mt-2">
            {MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <h2 className="font-bold text-marine mb-4">Alertes actives</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-marine">3 abonnements expirent</div>
                <div className="text-xs text-gris-texte">Dans les 7 prochains jours</div>
              </div>
            </li>
            <li className="flex gap-3">
              <Inbox size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-marine">5 demandes partenaires</div>
                <div className="text-xs text-gris-texte">En attente de validation</div>
              </div>
            </li>
            <li className="flex gap-3">
              <DollarSign size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-marine">2 paiements échoués</div>
                <div className="text-xs text-gris-texte">ABA PayWay — à relancer</div>
              </div>
            </li>
            <li className="flex gap-3">
              <Star size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-marine">Coups de cœur du mois</div>
                <div className="text-xs text-gris-texte">À sélectionner avant le 28</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Building2, title: 'Gérer les tenants', desc: 'Voir, activer, impersonate', href: '/tenants' },
          { icon: CreditCard, title: 'Suivre les abonnements', desc: 'MRR, ARR, relances', href: '/abonnements' },
          { icon: Store, title: 'Modérer les établissements', desc: 'Valider, mettre en avant', href: '/etablissements' },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl border border-gris-ligne p-5 hover:border-marine hover:shadow-cb-md transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-marine/10 text-marine flex items-center justify-center mb-4 group-hover:bg-marine group-hover:text-white transition-colors">
                <Icon size={20} />
              </div>
              <div className="font-bold text-marine text-sm mb-1">{link.title}</div>
              <div className="text-xs text-gris-texte">{link.desc}</div>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-marine font-bold">
                Ouvrir <ArrowRight size={11} />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}