'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Shield, KeyRound, Mail, Phone, MapPin, Building2,
  CreditCard, CheckCircle2, XCircle, Clock, Store, Loader2,
} from 'lucide-react';
import {
  getTenant, getTenantBusinesses, getTenantPayments, getTenantSubscription,
  startImpersonation, resetTenantAdminPassword,
} from '@/lib/services';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
};

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, b, p, s] = await Promise.all([
        getTenant(id),
        getTenantBusinesses(id),
        getTenantPayments(id),
        getTenantSubscription(id),
      ]);
      setTenant(t);
      setBusinesses(b);
      setPayments(p);
      setSubscription(s);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-12 text-center">
        <p className="text-gris-texte mb-4">Tenant introuvable.</p>
        <Link href="/tenants" className="text-marine font-bold hover:underline">
          ← Retour aux tenants
        </Link>
      </div>
    );
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0);

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const data = await startImpersonation(tenant.id);
      const webBaseUrl = process.env.NEXT_PUBLIC_WEB_URL
        || (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')
          ? window.location.origin.replace('-3001.', '-3000.')
          : 'http://localhost:3000');
      const tenantUrl = `${webBaseUrl}/espace-partenaire/dashboard?impersonate=${data.token}`;
      window.open(tenantUrl, '_blank');
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setImpersonating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Envoyer un email de réinitialisation à ' + tenant.email + ' ?')) return;
    setResetting(true);
    try {
      const res = await resetTenantAdminPassword(tenant.id);
      alert('✅ Email envoyé à ' + res.email);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Link href="/tenants" className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-4">
        <ArrowLeft size={14} />
        Retour aux tenants
      </Link>

      <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-6 shadow-cb-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-marine/10 text-marine flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-marine mb-1">{tenant.name}</h1>
              <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                <span className="flex items-center gap-1"><Mail size={12} />{tenant.email}</span>
                {tenant.phone && <span className="flex items-center gap-1"><Phone size={12} />{tenant.phone}</span>}
                {tenant.city && <span className="flex items-center gap-1"><MapPin size={12} />{tenant.city}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={'inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[tenant.status]}>
                  {STATUS_LABELS[tenant.status]}
                </span>
                <span className="text-[11px] text-gris-doux">
                  Inscrit le {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleImpersonate}
              disabled={impersonating}
              className="flex items-center gap-2 bg-purple-600 text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-purple-700 disabled:opacity-50"
            >
              <Shield size={14} />
              {impersonating ? 'Ouverture...' : 'Entrer dans le tenant'}
            </button>
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine disabled:opacity-50"
            >
              <KeyRound size={14} />
              {resetting ? 'Envoi...' : 'Reset MDP admin'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Abonnement en cours</h2>
          </div>
          {subscription ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gris-texte">Formule</span>
                <span className="font-bold text-marine">{subscription.plans?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gris-texte">Prix mensuel</span>
                <span className="font-bold text-marine">{subscription.plans?.price_monthly || 0} $</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gris-texte">Prochaine échéance</span>
                <span className="font-bold text-marine">
                  {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-gris-ligne">
                <div className="text-xs text-gris-texte mb-2">
                  Total encaissé ({payments.filter((p) => p.status === 'paid').length} paiements)
                </div>
                <div className="text-2xl font-extrabold text-marine">{totalPaid} $</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gris-texte">Aucun abonnement.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Adresse</h2>
          </div>
          <div className="text-sm text-gris-texte">
            {tenant.address || '—'}
            <br />
            {tenant.city || '—'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <Store size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Établissements</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gris-texte">Total</span>
              <span className="font-bold text-marine">{businesses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Publiés</span>
              <span className="font-bold text-green-600">
                {businesses.filter((b) => b.status === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">En attente</span>
              <span className="font-bold text-orange-600">
                {businesses.filter((b) => b.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne mb-6 overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Établissements liés</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-bold">Nom</th>
              <th className="text-left px-3 py-3 font-bold">Catégorie</th>
              <th className="text-left px-3 py-3 font-bold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {businesses.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-gris-texte">Aucun établissement.</td></tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 font-medium text-marine">{b.name}</td>
                <td className="px-3 py-4 text-gris-texte">{b.categories?.name || '—'}</td>
                <td className="px-3 py-4">
                  <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (STATUS_STYLES[b.status] || '')}>
                    {b.status === 'approved' ? 'Publié' : b.status === 'pending' ? 'En attente' : 'Suspendu'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Historique des paiements</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-bold">Date</th>
              <th className="text-left px-3 py-3 font-bold">Méthode</th>
              <th className="text-right px-3 py-3 font-bold">Montant</th>
              <th className="text-left px-6 py-3 font-bold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {payments.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gris-texte">Aucun paiement.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 text-gris-texte">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString('fr-FR') : new Date(p.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-3 py-4 text-marine font-medium">{p.method}</td>
                <td className="px-3 py-4 text-right font-bold text-marine">{p.amount} $</td>
                <td className="px-6 py-4">
                  <span className={
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                    (p.status === 'paid' ? 'bg-green-100 text-green-700'
                      : p.status === 'failed' ? 'bg-red-100 text-red-700'
                      : p.status === 'refunded' ? 'bg-gris-fond text-gris-texte'
                      : 'bg-orange-100 text-orange-700')
                  }>
                    {p.status === 'paid' && <CheckCircle2 size={10} />}
                    {p.status === 'failed' && <XCircle size={10} />}
                    {p.status === 'pending' && <Clock size={10} />}
                    {p.status === 'paid' ? 'Payé' : p.status === 'failed' ? 'Échoué' : p.status === 'refunded' ? 'Remboursé' : 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}