'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Building2,
  RefreshCw,
  DollarSign,
} from 'lucide-react';

type PayStatus = 'paid' | 'pending' | 'failed' | 'refunded';
type PayMethod = 'aba' | 'wing' | 'bakong' | 'stripe';

interface Payment {
  id: string;
  date: string;
  tenant: string;
  tenantId: string;
  amount: number;
  method: PayMethod;
  ref: string;
  status: PayStatus;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '2025-02-15', tenant: 'Le Bistro Khmer', tenantId: 't1', amount: 39, method: 'aba', ref: 'ABA-20250215-8821', status: 'paid' },
  { id: 'p2', date: '2025-02-14', tenant: 'Phnom Penh Food Tours', tenantId: 't8', amount: 79, method: 'aba', ref: 'ABA-20250214-7734', status: 'paid' },
  { id: 'p3', date: '2025-02-13', tenant: 'Sokha Spa & Massage', tenantId: 't2', amount: 15, method: 'wing', ref: 'WG-20250213-4412', status: 'paid' },
  { id: 'p4', date: '2025-02-12', tenant: 'Angkor Travel Co.', tenantId: 't3', amount: 79, method: 'bakong', ref: 'BK-20250212-9001', status: 'paid' },
  { id: 'p5', date: '2025-02-11', tenant: 'Green Umbrella', tenantId: 't4', amount: 15, method: 'aba', ref: 'ABA-20250211-3355', status: 'paid' },
  { id: 'p6', date: '2025-02-10', tenant: 'Kampot Pepper Farm', tenantId: 't5', amount: 39, method: 'aba', ref: 'ABA-20250210-1122', status: 'failed' },
  { id: 'p7', date: '2025-02-09', tenant: 'Khmer Ceramics Center', tenantId: 't7', amount: 39, method: 'stripe', ref: 'ST-20250209-7788', status: 'paid' },
  { id: 'p8', date: '2025-02-08', tenant: 'Tonle Sap Cruises', tenantId: 't6', amount: 0, method: 'aba', ref: '—', status: 'pending' },
  { id: 'p9', date: '2025-02-07', tenant: 'Le Bistro Khmer', tenantId: 't1', amount: 39, method: 'aba', ref: 'ABA-20250207-5566', status: 'refunded' },
];

const STATUS_STYLES: Record<PayStatus, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gris-fond text-gris-texte',
};

const STATUS_LABELS: Record<PayStatus, string> = {
  paid: 'Payé',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const METHOD_LABELS: Record<PayMethod, string> = {
  aba: 'ABA PayWay',
  wing: 'Wing',
  bakong: 'Bakong',
  stripe: 'Stripe',
};

const METHOD_COLORS: Record<PayMethod, string> = {
  aba: 'bg-blue-100 text-blue-700',
  wing: 'bg-green-100 text-green-700',
  bakong: 'bg-red-100 text-red-700',
  stripe: 'bg-purple-100 text-purple-700',
};

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PayStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PayMethod>('all');

  const filtered = MOCK_PAYMENTS.filter((p) => {
    const matchSearch =
      p.tenant.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = MOCK_PAYMENTS.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = MOCK_PAYMENTS.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalFailed = MOCK_PAYMENTS.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Paiements
          </h1>
          <p className="text-sm text-gris-texte">
            Journal des transactions · {MOCK_PAYMENTS.length} paiements
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine transition-colors">
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <CheckCircle2 size={14} className="text-green-600" />
            Total encaissé
          </div>
          <div className="text-2xl font-extrabold text-green-600">{totalPaid} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Clock size={14} className="text-orange-600" />
            En attente
          </div>
          <div className="text-2xl font-extrabold text-orange-600">{totalPending} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <XCircle size={14} className="text-red-600" />
            Échoués
          </div>
          <div className="text-2xl font-extrabold text-red-600">{totalFailed} $</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher par tenant, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
          >
            <option value="all">Tous statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
          >
            <option value="all">Toutes méthodes</option>
            <option value="aba">ABA PayWay</option>
            <option value="wing">Wing</option>
            <option value="bakong">Bakong</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-bold">Date</th>
              <th className="text-left px-3 py-3 font-bold">Tenant</th>
              <th className="text-left px-3 py-3 font-bold">Référence</th>
              <th className="text-left px-3 py-3 font-bold">Méthode</th>
              <th className="text-right px-3 py-3 font-bold">Montant</th>
              <th className="text-left px-3 py-3 font-bold">Statut</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gris-fond/50">
                <td className="px-5 py-4 text-xs text-gris-texte">{p.date}</td>
                <td className="px-3 py-4">
                  <Link href={'/tenants/' + p.tenantId} className="flex items-center gap-2 font-bold text-marine hover:underline">
                    <Building2 size={12} />
                    <span className="truncate max-w-[140px]">{p.tenant}</span>
                  </Link>
                </td>
                <td className="px-3 py-4 text-xs font-mono text-gris-texte">{p.ref}</td>
                <td className="px-3 py-4">
                  <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + METHOD_COLORS[p.method]}>
                    {METHOD_LABELS[p.method]}
                  </span>
                </td>
                <td className="px-3 py-4 text-right font-bold text-marine">{p.amount} $</td>
                <td className="px-3 py-4">
                  <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[p.status]}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {p.status === 'failed' && (
                    <button className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:bg-orange-100 px-2 py-1 rounded-lg">
                      <RefreshCw size={11} />
                      Relancer
                    </button>
                  )}
                  {p.status === 'paid' && (
                    <button className="text-[11px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
                      Rembourser
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}