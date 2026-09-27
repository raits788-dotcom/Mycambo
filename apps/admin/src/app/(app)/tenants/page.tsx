'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Shield,
  KeyRound,
  Building2,
  MoreHorizontal,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: 'Découverte' | 'Essentiel' | 'Pro' | 'Business' | 'Entreprise';
  businesses: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  city: string;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'Le Bistro Khmer', email: 'contact@bistro-khmer.com', plan: 'Pro', businesses: 3, status: 'active', createdAt: '2024-11-15', city: 'Phnom Penh' },
  { id: 't2', name: 'Sokha Spa & Massage', email: 'hello@sokha-spa.kh', plan: 'Essentiel', businesses: 1, status: 'active', createdAt: '2024-12-02', city: 'Siem Reap' },
  { id: 't3', name: 'Angkor Travel Co.', email: 'info@angkor-travel.com', plan: 'Business', businesses: 5, status: 'active', createdAt: '2024-10-08', city: 'Siem Reap' },
  { id: 't4', name: 'Green Umbrella', email: 'sokha@greenumbrella-kh.org', plan: 'Essentiel', businesses: 2, status: 'active', createdAt: '2024-09-20', city: 'Phnom Penh' },
  { id: 't5', name: 'Kampot Pepper Farm', email: 'visit@kampot-pepper.kh', plan: 'Pro', businesses: 1, status: 'pending', createdAt: '2025-01-10', city: 'Kampot' },
  { id: 't6', name: 'Tonle Sap Cruises', email: 'booking@tonlesap-cruises.com', plan: 'Découverte', businesses: 1, status: 'pending', createdAt: '2025-01-12', city: 'Siem Reap' },
  { id: 't7', name: 'Khmer Ceramics Center', email: 'ceramics@khmercenter.org', plan: 'Pro', businesses: 2, status: 'suspended', createdAt: '2024-08-05', city: 'Siem Reap' },
  { id: 't8', name: 'Phnom Penh Food Tours', email: 'book@pp-foodtours.kh', plan: 'Business', businesses: 4, status: 'active', createdAt: '2024-11-28', city: 'Phnom Penh' },
];

const PLAN_COLORS: Record<Tenant['plan'], string> = {
  Découverte: 'bg-gris-fond text-gris-texte',
  Essentiel: 'bg-blue-100 text-blue-700',
  Pro: 'bg-purple-100 text-purple-700',
  Business: 'bg-orange-100 text-orange-700',
  Entreprise: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<Tenant['status'], string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<Tenant['status'], string> = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
};

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Tenant['status']>('all');
  const [planFilter, setPlanFilter] = useState<'all' | Tenant['plan']>('all');

  const filtered = MOCK_TENANTS.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPlan = planFilter === 'all' || t.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Tenants
          </h1>
          <p className="text-sm text-gris-texte">
            {MOCK_TENANTS.length} partenaires · {MOCK_TENANTS.filter((t) => t.status === 'active').length} actifs
          </p>
        </div>
        <button className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors">
          <Plus size={15} />
          Nouveau tenant
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, ville..."
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
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5 focus:border-marine focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendu</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5 focus:border-marine focus:outline-none"
          >
            <option value="all">Toutes formules</option>
            <option value="Découverte">Découverte</option>
            <option value="Essentiel">Essentiel</option>
            <option value="Pro">Pro</option>
            <option value="Business">Business</option>
            <option value="Entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-bold">Partenaire</th>
              <th className="text-left px-3 py-3 font-bold">Ville</th>
              <th className="text-left px-3 py-3 font-bold">Formule</th>
              <th className="text-center px-3 py-3 font-bold">Étab.</th>
              <th className="text-left px-3 py-3 font-bold">Statut</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gris-texte">
                  Aucun tenant ne correspond à ces filtres.
                </td>
              </tr>
            ) : (
              filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gris-fond/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-marine truncate">{tenant.name}</div>
                        <div className="text-xs text-gris-texte truncate">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte">{tenant.city}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + PLAN_COLORS[tenant.plan]}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center font-bold text-marine">
                    {tenant.businesses}
                  </td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_COLORS[tenant.status]}>
                      {STATUS_LABELS[tenant.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={'/tenants/' + tenant.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors"
                        title="Voir la fiche"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-purple-100 hover:text-purple-700 transition-colors"
                        title="Impersonate (entrer dans le tenant)"
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        title="Reset mot de passe admin"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-gris-fond transition-colors"
                        title="Plus"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-xs text-gris-texte">
        <div>{filtered.length} sur {MOCK_TENANTS.length} tenants</div>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-gris-ligne hover:bg-gris-fond">Précédent</button>
          <button className="px-3 py-1.5 rounded-lg bg-marine text-white">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-gris-ligne hover:bg-gris-fond">2</button>
          <button className="px-3 py-1.5 rounded-lg border border-gris-ligne hover:bg-gris-fond">Suivant</button>
        </div>
      </div>
    </>
  );
}