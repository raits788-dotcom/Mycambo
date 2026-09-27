'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  MoreHorizontal,
  Store,
  MapPin,
  Building2,
} from 'lucide-react';

interface Establishment {
  id: string;
  name: string;
  category: string;
  tenant: string;
  city: string;
  status: 'approved' | 'pending' | 'suspended';
  isFeatured: boolean;
  createdAt: string;
}

const MOCK_ESTABLISHMENTS: Establishment[] = [
  { id: 'e1', name: 'Le Bistro Khmer — Daun Penh', category: 'Restaurant', tenant: 'Le Bistro Khmer', city: 'Phnom Penh', status: 'approved', isFeatured: true, createdAt: '2024-11-20' },
  { id: 'e2', name: 'Sokha Spa — Riverside', category: 'Spa', tenant: 'Sokha Spa & Massage', city: 'Siem Reap', status: 'approved', isFeatured: true, createdAt: '2024-12-05' },
  { id: 'e3', name: 'Angkor Travel Co.', category: 'Activité', tenant: 'Angkor Travel Co.', city: 'Siem Reap', status: 'approved', isFeatured: false, createdAt: '2024-10-15' },
  { id: 'e4', name: 'Green Umbrella HQ', category: 'Association', tenant: 'Green Umbrella', city: 'Phnom Penh', status: 'approved', isFeatured: false, createdAt: '2024-09-22' },
  { id: 'e5', name: 'Kampot Pepper Farm', category: 'Shopping', tenant: 'Kampot Pepper Farm', city: 'Kampot', status: 'pending', isFeatured: false, createdAt: '2025-01-10' },
  { id: 'e6', name: 'Tonle Sap Cruises', category: 'Activité', tenant: 'Tonle Sap Cruises', city: 'Siem Reap', status: 'pending', isFeatured: false, createdAt: '2025-01-12' },
  { id: 'e7', name: 'Khmer Ceramics — Atelier', category: 'Shopping', tenant: 'Khmer Ceramics Center', city: 'Siem Reap', status: 'suspended', isFeatured: false, createdAt: '2024-08-10' },
  { id: 'e8', name: 'Phnom Penh Food Tours', category: 'Activité', tenant: 'Phnom Penh Food Tours', city: 'Phnom Penh', status: 'approved', isFeatured: true, createdAt: '2024-11-30' },
  { id: 'e9', name: 'Le Bistro Khmer — BKK1', category: 'Restaurant', tenant: 'Le Bistro Khmer', city: 'Phnom Penh', status: 'approved', isFeatured: false, createdAt: '2024-12-01' },
  { id: 'e10', name: 'Le Bistro Khmer Express', category: 'Restaurant', tenant: 'Le Bistro Khmer', city: 'Phnom Penh', status: 'pending', isFeatured: false, createdAt: '2025-01-05' },
];

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  approved: 'Publié',
  pending: 'En attente',
  suspended: 'Suspendu',
};

export default function EstablishmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Establishment['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

  const categories = Array.from(new Set(MOCK_ESTABLISHMENTS.map((e) => e.category)));

  const filtered = MOCK_ESTABLISHMENTS.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.tenant.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const counts = {
    total: MOCK_ESTABLISHMENTS.length,
    approved: MOCK_ESTABLISHMENTS.filter((e) => e.status === 'approved').length,
    pending: MOCK_ESTABLISHMENTS.filter((e) => e.status === 'pending').length,
    suspended: MOCK_ESTABLISHMENTS.filter((e) => e.status === 'suspended').length,
    featured: MOCK_ESTABLISHMENTS.filter((e) => e.isFeatured).length,
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Établissements
          </h1>
          <p className="text-sm text-gris-texte">
            {counts.total} établissements · {counts.featured} coups de cœur
          </p>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Publiés</div>
          <div className="text-2xl font-extrabold text-green-600">{counts.approved}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">En attente</div>
          <div className="text-2xl font-extrabold text-orange-600">{counts.pending}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Suspendus</div>
          <div className="text-2xl font-extrabold text-red-600">{counts.suspended}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Coups de cœur</div>
          <div className="text-2xl font-extrabold text-marine">{counts.featured}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher par nom, tenant, ville..."
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
            <option value="approved">Publié</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendu</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5 focus:border-marine focus:outline-none"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-bold">Établissement</th>
              <th className="text-left px-3 py-3 font-bold">Catégorie</th>
              <th className="text-left px-3 py-3 font-bold">Tenant</th>
              <th className="text-left px-3 py-3 font-bold">Ville</th>
              <th className="text-left px-3 py-3 font-bold">Statut</th>
              <th className="text-center px-3 py-3 font-bold">⭐</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gris-texte">
                  Aucun établissement ne correspond à ces filtres.
                </td>
              </tr>
            ) : (
              filtered.map((est) => (
                <tr key={est.id} className="hover:bg-gris-fond/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                        <Store size={16} />
                      </div>
                      <div className="font-bold text-marine truncate max-w-[200px]">{est.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte">{est.category}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-gris-texte text-xs">
                      <Building2 size={11} />
                      <span className="truncate max-w-[120px]">{est.tenant}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1 text-gris-texte text-xs">
                      <MapPin size={11} />
                      {est.city}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[est.status]}>
                      {STATUS_LABELS[est.status]}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button
                      className={
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors ' +
                        (est.isFeatured
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gris-doux hover:bg-gris-fond')
                      }
                      title={est.isFeatured ? 'Retirer du coup de cœur' : 'Marquer coup de cœur'}
                    >
                      <Star size={14} fill={est.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={'/etablissements/' + est.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors"
                        title="Voir"
                      >
                        <Eye size={14} />
                      </Link>
                      {est.status === 'pending' && (
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                          title="Approuver"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {est.status === 'approved' && (
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                          title="Suspendre"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      {est.status === 'suspended' && (
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                          title="Réactiver"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
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
        <div>{filtered.length} sur {MOCK_ESTABLISHMENTS.length} établissements</div>
      </div>
    </>
  );
}