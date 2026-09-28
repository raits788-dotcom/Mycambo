'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Filter, CheckCircle2, XCircle, Clock, Download,
  Building2, RefreshCw, Loader2,
} from 'lucide-react';
import { getPayments } from '@/lib/services';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gris-fond text-gris-texte',
};
const STATUS_LABELS: Record<string, string> = {
  paid: 'Payé',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
};
const METHOD_LABELS: Record<string, string> = {
  aba: 'ABA PayWay',
  wing: 'Wing',
  bakong: 'Bakong',
  stripe: 'Stripe',
  manual: 'Manuel',
};
const METHOD_COLORS: Record<string, string> = {
  aba: 'bg-blue-100 text-blue-700',
  wing: 'bg-green-100 text-green-700',
  bakong: 'bg-red-100 text-red-700',
  stripe: 'bg-purple-100 text-purple-700',
  manual: 'bg-gris-fond text-gris-texte',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const data = await getPayments();
      setPayments(data);
      setLoading(false);
    })();
  }, []);

  const filtered = payments.filter((p) => {
    const matchSearch = (p.tenants?.name || '').toLowerCase().includes(search.toLowerCase()) || (p.gateway_ref || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const totalFailed = payments.filter((p) => p.status === 'failed').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Paiements</h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : payments.length + ' paiements'}
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine">
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2"><CheckCircle2 size={14} className="text-green-600" />Total encaissé</div>
          <div className="text-2xl font-extrabold text-green-600">{totalPaid} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2"><Clock size={14} className="text-orange-600" />En attente</div>
          <div className="text-2xl font-extrabold text-orange-600">{totalPending} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2"><XCircle size={14} className="text-red-600" />Échoués</div>
          <div className="text-2xl font-extrabold text-red-600">{totalFailed} $</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input type="text" placeholder="Rechercher par tenant, référence..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5">
            <option value="all">Tous statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5">
            <option value="all">Toutes méthodes</option>
            <option value="aba">ABA PayWay</option>
            <option value="wing">Wing</option>
            <option value="bakong">Bakong</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" /><p className="text-sm text-gris-texte">Chargement...</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Date</th>
                <th className="text-left px-3 py-3 font-bold">Tenant</th>
                <th className="text-left px-3 py-3 font-bold">Référence</th>
                <th className="text-left px-3 py-3 font-bold">Méthode</th>
                <th className="text-right px-3 py-3 font-bold">Montant</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gris-texte">Aucun paiement.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4 text-xs text-gris-texte">{new Date(p.paid_at || p.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4">
                    <Link href={'/tenants/' + p.tenants?.id} className="flex items-center gap-2 font-bold text-marine hover:underline">
                      <Building2 size={12} />
                      <span className="truncate max-w-[140px]">{p.tenants?.name || '—'}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-xs font-mono text-gris-texte">{p.gateway_ref || '—'}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (METHOD_COLORS[p.method] || '')}>
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right font-bold text-marine">{p.amount} $</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (STATUS_STYLES[p.status] || '')}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}