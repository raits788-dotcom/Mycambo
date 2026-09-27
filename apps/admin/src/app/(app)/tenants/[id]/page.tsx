'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ScrollText,
  Store,
  AlertCircle,
} from 'lucide-react';

interface TenantDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  plan: string;
  planPrice: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  subscriptionEndsAt: string;
  businesses: Array<{
    id: string;
    name: string;
    category: string;
    status: 'approved' | 'pending' | 'suspended';
  }>;
  payments: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    status: 'paid' | 'failed' | 'pending';
  }>;
  logs: Array<{
    id: string;
    date: string;
    action: string;
    actor: string;
  }>;
}

const MOCK_TENANT: TenantDetail = {
  id: 't1',
  name: 'Le Bistro Khmer',
  email: 'contact@bistro-khmer.com',
  phone: '+855 12 345 678',
  city: 'Phnom Penh',
  address: '12 Street 240, Daun Penh',
  plan: 'Pro',
  planPrice: 39,
  status: 'active',
  createdAt: '2024-11-15',
  subscriptionEndsAt: '2025-03-15',
  businesses: [
    { id: 'b1', name: 'Le Bistro Khmer — Daun Penh', category: 'Restaurant', status: 'approved' },
    { id: 'b2', name: 'Le Bistro Khmer — BKK1', category: 'Restaurant', status: 'approved' },
    { id: 'b3', name: 'Le Bistro Khmer Express', category: 'Restaurant', status: 'pending' },
  ],
  payments: [
    { id: 'p1', date: '2025-02-15', amount: 39, method: 'ABA PayWay', status: 'paid' },
    { id: 'p2', date: '2025-01-15', amount: 39, method: 'ABA PayWay', status: 'paid' },
    { id: 'p3', date: '2024-12-15', amount: 39, method: 'Wing', status: 'paid' },
    { id: 'p4', date: '2024-11-15', amount: 39, method: 'Stripe', status: 'failed' },
  ],
  logs: [
    { id: 'l1', date: '2025-02-15 09:23', action: 'Connexion admin', actor: 'sokha@bistro-khmer.com' },
    { id: 'l2', date: '2025-02-14 16:45', action: 'Établissement créé', actor: 'sokha@bistro-khmer.com' },
    { id: 'l3', date: '2025-02-10 11:12', action: 'Formule changée : Essentiel → Pro', actor: 'SuperAdmin' },
    { id: 'l4', date: '2025-01-15 08:00', action: 'Paiement reçu', actor: 'système' },
  ],
};

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
};

const BIZ_STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};

const PAY_STYLES = {
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-orange-100 text-orange-700',
};

const PAY_LABELS = {
  paid: 'Payé',
  failed: 'Échoué',
  pending: 'En attente',
};

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tenant = MOCK_TENANT;

  const handleImpersonate = () => {
    alert(
      'Impersonation : le SuperAdmin va entrer dans le tenant "' +
        tenant.name +
        '".\n\n' +
        'Cette action sera loguée dans audit_logs.'
    );
    // TODO C.7 : générer token + redirect
  };

  const handleResetPassword = () => {
    if (
      confirm(
        'Réinitialiser le mot de passe admin de ' +
          tenant.name +
          ' ?\n\nUn email sera envoyé à ' +
          tenant.email
      )
    ) {
      alert('✅ Email de réinitialisation envoyé à ' + tenant.email);
    }
  };

  return (
    <>
      {/* Retour */}
      <Link
        href="/tenants"
        className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux tenants
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-6 shadow-cb-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-marine mb-1">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {tenant.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {tenant.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tenant.city}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={
                    'inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ' +
                    STATUS_STYLES[tenant.status]
                  }
                >
                  {STATUS_LABELS[tenant.status]}
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                  {tenant.plan}
                </span>
                <span className="text-[11px] text-gris-doux">
                  Inscrit le {tenant.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleImpersonate}
              className="flex items-center gap-2 bg-purple-600 text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-purple-700 transition-colors"
            >
              <Shield size={14} />
              Entrer dans le tenant
            </button>
            <button
              onClick={handleResetPassword}
              className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine transition-colors"
            >
              <KeyRound size={14} />
              Reset MDP admin
            </button>
          </div>
        </div>
      </div>

      {/* Grille : abonnement + adresse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Abonnement */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Abonnement en cours</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gris-texte">Formule</span>
              <span className="font-bold text-marine">{tenant.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Prix mensuel</span>
              <span className="font-bold text-marine">{tenant.planPrice} $</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Prochaine échéance</span>
              <span className="font-bold text-marine">{tenant.subscriptionEndsAt}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gris-ligne">
              <div className="text-xs text-gris-texte mb-2">
                Total encaissé (4 paiements)
              </div>
              <div className="text-2xl font-extrabold text-marine">156 $</div>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Adresse</h2>
          </div>
          <div className="text-sm text-gris-texte">
            {tenant.address}
            <br />
            {tenant.city}
            <br />
            Cambodge
          </div>
        </div>

        {/* Stats rapides */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-2 mb-4">
            <Store size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Établissements</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gris-texte">Total</span>
              <span className="font-bold text-marine">{tenant.businesses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Publiés</span>
              <span className="font-bold text-green-600">
                {tenant.businesses.filter((b) => b.status === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">En attente</span>
              <span className="font-bold text-orange-600">
                {tenant.businesses.filter((b) => b.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Établissements */}
      <div className="bg-white rounded-xl border border-gris-ligne mb-6 overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
          <h2 className="font-bold text-marine">Établissements liés</h2>
          <Link
            href="/etablissements"
            className="text-xs font-bold text-marine hover:underline"
          >
            Voir tous →
          </Link>
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
            {tenant.businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 font-medium text-marine">{biz.name}</td>
                <td className="px-3 py-4 text-gris-texte">{biz.category}</td>
                <td className="px-3 py-4">
                  <span
                    className={
                      'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                      BIZ_STATUS_STYLES[biz.status]
                    }
                  >
                    {biz.status === 'approved'
                      ? 'Publié'
                      : biz.status === 'pending'
                      ? 'En attente'
                      : 'Suspendu'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paiements */}
      <div className="bg-white rounded-xl border border-gris-ligne mb-6 overflow-hidden shadow-cb-sm">
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
            {tenant.payments.map((p) => (
              <tr key={p.id} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 text-gris-texte">{p.date}</td>
                <td className="px-3 py-4 text-marine font-medium">{p.method}</td>
                <td className="px-3 py-4 text-right font-bold text-marine">
                  {p.amount} $
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                      PAY_STYLES[p.status]
                    }
                  >
                    {p.status === 'paid' && <CheckCircle2 size={10} />}
                    {p.status === 'failed' && <XCircle size={10} />}
                    {p.status === 'pending' && <Clock size={10} />}
                    {PAY_LABELS[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne flex items-center gap-2">
          <ScrollText size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Dernières actions</h2>
        </div>
        <ul className="divide-y divide-gris-ligne">
          {tenant.logs.map((log) => (
            <li key={log.id} className="px-6 py-3 flex items-start gap-3 text-sm">
              <AlertCircle size={14} className="text-gris-doux flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-marine font-medium">{log.action}</div>
                <div className="text-xs text-gris-texte">
                  Par {log.actor} · {log.date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}