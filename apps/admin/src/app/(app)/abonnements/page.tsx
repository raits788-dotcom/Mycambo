'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Download,
  Eye,
  CalendarPlus,
  XCircle,
  RefreshCw,
  Building2,
  AlertCircle,
} from 'lucide-react';

type SubStatus = 'active' | 'expiring' | 'expired' | 'past_due';

interface Subscription {
  id: string;
  tenant: string;
  tenantId: string;
  plan: string;
  planPrice: number;
  periodStart: string;
  periodEnd: string;
  status: SubStatus;
  paymentMethod: string;
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', tenant: 'Le Bistro Khmer', tenantId: 't1', plan: 'Pro', planPrice: 39, periodStart: '2025-02-15', periodEnd: '2025-03-15', status: 'active', paymentMethod: 'ABA PayWay' },
  { id: 's2', tenant: 'Sokha Spa & Massage', tenantId: 't2', plan: 'Essentiel', planPrice: 15, periodStart: '2025-02-10', periodEnd: '2025-03-10', status: 'active', paymentMethod: 'Wing' },
  { id: 's3', tenant: 'Angkor Travel Co.', tenantId: 't3', plan: 'Business', planPrice: 79, periodStart: '2025-02-05', periodEnd: '2025-03-05', status: 'expiring', paymentMethod: 'Bakong' },
  { id: 's4', tenant: 'Green Umbrella', tenantId: 't4', plan: 'Essentiel', planPrice: 15, periodStart: '2025-02-01', periodEnd: '2025-03-01', status: 'active', paymentMethod: 'ABA PayWay' },
  { id: 's5', tenant: 'Kampot Pepper Farm', tenantId: 't5', plan: 'Pro', planPrice: 39, periodStart: '2025-01-20', periodEnd: '2025-02-20', status: 'past_due', paymentMethod: 'ABA PayWay' },
  { id: 's6', tenant: 'Tonle Sap Cruises', tenantId: 't6', plan: 'Découverte', planPrice: 0, periodStart: '2025-01-15', periodEnd: '2025-02-15', status: 'expired', paymentMethod: '—' },
  { id: 's7', tenant: 'Khmer Ceramics Center', tenantId: 't7', plan: 'Pro', planPrice: 39, periodStart: '2025-02-12', periodEnd: '2025-03-12', status: 'active', paymentMethod: 'Stripe' },
  { id: 's8', tenant: 'Phnom Penh Food Tours', tenantId: 't8', plan: 'Business', planPrice: 79, periodStart: '2025-02-08', periodEnd: '2025-03-08', status: 'active', paymentMethod: 'ABA PayWay' },
];

const STATUS_STYLES: Record<SubStatus, string> = {
  active: 'bg-green-100 text-green-700',
  expiring: 'bg-orange-100 text-orange-700',
  expired: 'bg-gris-fond text-gris-texte',
  past_due: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<SubStatus, string> = {
  active: 'Actif',
  expiring: 'Expire bientôt',
  expired: 'Expiré',
  past_due: 'En retard',
};

const CHART_DATA = [
  { month: 'Oct', value: 1240 },
  { month: 'Nov', value: 1580 },
  { month: 'Déc', value: 1720 },
  { month: 'Jan', value: 1980 },
  { month: 'Fév', value: 2340 },
  { month: 'Mar', value: 2480 },
  { month: 'Avr', value: 2380 },
  { month: 'Mai', value: 2650 },
  { month: 'Juin', value: 2810 },
  { month: 'Juil', value: 2720 },
  { month: 'Août', value: 3120 },
  { month: 'Sep', value: 3480 },
];

const MAX_CHART = Math.max(...CHART_DATA.map((d) => d.value));

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<'subscriptions' | 'revenue'>('subscriptions');
  const [statusFilter, setStatusFilter] = useState<'all' | SubStatus>('all');

  const filtered = MOCK_SUBSCRIPTIONS.filter(
    (s) => statusFilter === 'all' || s.status === statusFilter
  );

  // Calcul MRR / ARR
  const mrr = MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'active' || s.status === 'expiring').reduce(
    (sum, s) => sum + s.planPrice,
    0
  );
  const arr = mrr * 12;
  const activeCount = MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'active').length;
  const churnRate = 3.2; // en %

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Abonnements
          </h1>
          <p className="text-sm text-gris-texte">
            Suivi du MRR, des paiements et du chiffre d&apos;affaires récurrent.
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine transition-colors">
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingUp size={14} className="text-green-600" />
            MRR (Revenu mensuel)
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{mrr} $</div>
          <div className="text-xs text-green-600">▲ +8.2% vs mois dernier</div>
        </div>

        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingUp size={14} className="text-blue-600" />
            ARR (Revenu annuel)
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{arr.toLocaleString()} $</div>
          <div className="text-xs text-green-600">▲ +12% vs N-1</div>
        </div>

        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Users size={14} className="text-purple-600" />
            Abonnements actifs
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{activeCount}</div>
          <div className="text-xs text-gris-texte">sur {MOCK_SUBSCRIPTIONS.length} au total</div>
        </div>

        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingDown size={14} className="text-red-500" />
            Churn rate
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{churnRate} %</div>
          <div className="text-xs text-red-500">▲ +0.5 pt ce mois</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button
          onClick={() => setTab('subscriptions')}
          className={
            'px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' +
            (tab === 'subscriptions'
              ? 'border-marine text-marine'
              : 'border-transparent text-gris-texte hover:text-marine')
          }
        >
          Abonnements en cours
        </button>
        <button
          onClick={() => setTab('revenue')}
          className={
            'px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' +
            (tab === 'revenue'
              ? 'border-marine text-marine'
              : 'border-transparent text-gris-texte hover:text-marine')
          }
        >
          Chiffre d&apos;affaires
        </button>
      </div>

      {tab === 'subscriptions' && (
        <>
          {/* Filtres */}
          <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-gris-doux" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="text-sm rounded-lg border border-gris-ligne px-3 py-2 focus:border-marine focus:outline-none"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actif</option>
                <option value="expiring">Expire bientôt</option>
                <option value="past_due">En retard</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <div className="text-xs text-gris-texte ml-auto">
              {filtered.length} sur {MOCK_SUBSCRIPTIONS.length}
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
            <table className="w-full text-sm">
              <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-bold">Tenant</th>
                  <th className="text-left px-3 py-3 font-bold">Formule</th>
                  <th className="text-left px-3 py-3 font-bold">Début</th>
                  <th className="text-left px-3 py-3 font-bold">Fin</th>
                  <th className="text-left px-3 py-3 font-bold">Paiement</th>
                  <th className="text-right px-3 py-3 font-bold">Montant</th>
                  <th className="text-left px-3 py-3 font-bold">Statut</th>
                  <th className="text-right px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-ligne">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gris-fond/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} />
                        </div>
                        <Link
                          href={'/tenants/' + sub.tenantId}
                          className="font-bold text-marine hover:underline truncate max-w-[140px]"
                        >
                          {sub.tenant}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-gris-texte text-xs font-bold">{sub.plan}</td>
                    <td className="px-3 py-4 text-gris-texte text-xs">{sub.periodStart}</td>
                    <td className="px-3 py-4 text-gris-texte text-xs">{sub.periodEnd}</td>
                    <td className="px-3 py-4 text-gris-texte text-xs">{sub.paymentMethod}</td>
                    <td className="px-3 py-4 text-right font-bold text-marine">
                      {sub.planPrice === 0 ? '—' : sub.planPrice + ' $'}
                    </td>
                    <td className="px-3 py-4">
                      <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[sub.status]}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={'/tenants/' + sub.tenantId}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors"
                          title="Voir le tenant"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                          title="Prolonger 1 mois"
                        >
                          <CalendarPlus size={14} />
                        </button>
                        {sub.status === 'past_due' && (
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                            title="Relancer le paiement"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                          title="Annuler l'abonnement"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'revenue' && (
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-marine mb-1">Chiffre d&apos;affaires — 12 mois</h2>
              <p className="text-xs text-gris-texte">Total : 28 490 $ sur la période</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-marine" />
                <span className="text-gris-texte">Encaissé</span>
              </div>
            </div>
          </div>

          {/* Graphique */}
          <div className="flex items-end gap-2 h-64 mb-3">
            {CHART_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-marine opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.value} $
                </div>
                <div
                  className={
                    'w-full rounded-t transition-all ' +
                    (i >= 9 ? 'bg-marine' : 'bg-marine/30')
                  }
                  style={{ height: (d.value / MAX_CHART) * 100 + '%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gris-doux">
            {CHART_DATA.map((d) => (
              <span key={d.month} className="flex-1 text-center">{d.month}</span>
            ))}
          </div>

          {/* Détails */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gris-ligne">
            <div>
              <div className="text-xs text-gris-texte mb-1">Meilleur mois</div>
              <div className="text-lg font-extrabold text-marine">Sept. · 3 480 $</div>
            </div>
            <div>
              <div className="text-xs text-gris-texte mb-1">Moyenne mensuelle</div>
              <div className="text-lg font-extrabold text-marine">2 374 $</div>
            </div>
            <div>
              <div className="text-xs text-gris-texte mb-1">Croissance</div>
              <div className="text-lg font-extrabold text-green-600">+180%</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerte paiements en retard */}
      {MOCK_SUBSCRIPTIONS.some((s) => s.status === 'past_due') && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-red-700 text-sm mb-1">
              {MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'past_due').length} abonnement(s) en retard de paiement
            </div>
            <div className="text-xs text-red-600">
              Ces tenants risquent la suspension. Une relance automatique est envoyée J+3, J+7 et J+14.
            </div>
          </div>
          <button className="text-xs font-bold text-red-700 bg-white border border-red-300 px-3 py-1.5 rounded-full hover:bg-red-50">
            Tout relancer
          </button>
        </div>
      )}
    </>
  );
}