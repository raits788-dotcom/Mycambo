'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, CreditCard, Users, Download, Eye,
  CalendarPlus, XCircle, RefreshCw, Building2, AlertCircle, Loader2,
} from 'lucide-react';
import { getSubscriptions } from '@/lib/services';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expiring: 'bg-orange-100 text-orange-700',
  expired: 'bg-gris-fond text-gris-texte',
  past_due: 'bg-red-100 text-red-700',
  canceled: 'bg-gris-fond text-gris-texte',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  expiring: 'Expire bientôt',
  expired: 'Expiré',
  past_due: 'En retard',
  canceled: 'Annulé',
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const data = await getSubscriptions();
      setSubs(data);
      setLoading(false);
    })();
  }, []);

  const filtered = subs.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  const mrr = subs
    .filter((s) => s.status === 'active' || s.status === 'expiring')
    .reduce((sum, s) => sum + Number(s.plans?.price_monthly || 0), 0);
  const arr = mrr * 12;
  const activeCount = subs.filter((s) => s.status === 'active').length;
  const churnRate = 3.2;

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Abonnements</h1>
          <p className="text-sm text-gris-texte">Suivi du MRR, des paiements et du CA récurrent.</p>
        </div>
        <button className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine">
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingUp size={14} className="text-green-600" /> MRR
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{mrr} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingUp size={14} className="text-blue-600" /> ARR
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{arr.toLocaleString()} $</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Users size={14} className="text-purple-600" /> Abonnements actifs
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{activeCount}</div>
          <div className="text-xs text-gris-texte">sur {subs.length} au total</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <TrendingDown size={14} className="text-red-500" /> Churn rate
          </div>
          <div className="text-3xl font-extrabold text-marine mb-1">{churnRate} %</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-gris-doux" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gris-ligne px-3 py-2">
            <option value="all">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="expiring">Expire bientôt</option>
            <option value="past_due">En retard</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
        <div className="text-xs text-gris-texte ml-auto">{filtered.length} sur {subs.length}</div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" /><p className="text-sm text-gris-texte">Chargement...</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Tenant</th>
                <th className="text-left px-3 py-3 font-bold">Formule</th>
                <th className="text-left px-3 py-3 font-bold">Début</th>
                <th className="text-left px-3 py-3 font-bold">Fin</th>
                <th className="text-right px-3 py-3 font-bold">Montant</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gris-texte">Aucun abonnement.</td></tr>
              ) : filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-marine/10 text-marine flex items-center justify-center"><Building2 size={14} /></div>
                      <Link href={'/tenants/' + sub.tenants?.id} className="font-bold text-marine hover:underline truncate max-w-[140px]">
                        {sub.tenants?.name || '—'}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs font-bold">{sub.plans?.name || '—'}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{new Date(sub.current_period_start).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{new Date(sub.current_period_end).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4 text-right font-bold text-marine">
                    {Number(sub.plans?.price_monthly || 0) === 0 ? '—' : sub.plans?.price_monthly + ' $'}
                  </td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (STATUS_STYLES[sub.status] || 'bg-gris-fond text-gris-texte')}>
                      {STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {subs.some((s) => s.status === 'past_due') && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-red-700 text-sm mb-1">
              {subs.filter((s) => s.status === 'past_due').length} abonnement(s) en retard
            </div>
            <div className="text-xs text-red-600">Une relance automatique est envoyée J+3, J+7 et J+14.</div>
          </div>
        </div>
      )}
    </>
  );
}