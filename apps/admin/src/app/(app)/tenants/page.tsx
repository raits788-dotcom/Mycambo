'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { getTenants } from '@/lib/services';

interface Tenant {
  id: string;
  name: string;
  email: string;
  city: string | null;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  plans: { name: string } | null;
}

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

const PLAN_COLORS: Record<string, string> = {
  Découverte: 'bg-gris-fond text-gris-texte',
  Essentiel: 'bg-blue-100 text-blue-700',
  Pro: 'bg-purple-100 text-purple-700',
  Business: 'bg-orange-100 text-orange-700',
  Entreprise: 'bg-red-100 text-red-700',
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Tenant['status']>('all');

  useEffect(() => {
    (async () => {
      const data = await getTenants();
      setTenants(data as Tenant[]);
      setLoading(false);
    })();
  }, []);

  const filtered = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.city || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Tenants
          </h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : tenants.length + ' partenaires · ' + tenants.filter((t) => t.status === 'active').length + ' actifs'}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors">
          <Plus size={15} />
          Nouveau tenant
        </button>
      </div>

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
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
            <p className="text-sm text-gris-texte">Chargement des tenants...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Partenaire</th>
                <th className="text-left px-3 py-3 font-bold">Ville</th>
                <th className="text-left px-3 py-3 font-bold">Formule</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gris-texte">
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
                    <td className="px-3 py-4 text-gris-texte">{tenant.city || '—'}</td>
                    <td className="px-3 py-4">
                      <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (PLAN_COLORS[tenant.plans?.name || ''] || 'bg-gris-fond text-gris-texte')}>
                        {tenant.plans?.name || 'Aucune'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[tenant.status]}>
                        {STATUS_LABELS[tenant.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={'/tenants/' + tenant.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors" title="Voir">
                          <Eye size={14} />
                        </Link>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-purple-100 hover:text-purple-700 transition-colors" title="Impersonate">
                          <Shield size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-orange-100 hover:text-orange-700 transition-colors" title="Reset MDP">
                          <KeyRound size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-gris-fond transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-5 text-xs text-gris-texte">
        {filtered.length} sur {tenants.length} tenants
      </div>
    </>
  );
}