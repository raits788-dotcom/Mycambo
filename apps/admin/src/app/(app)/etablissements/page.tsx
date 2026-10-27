'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, Star, Store, Loader2 } from 'lucide-react';
import { getBusinesses, updateBusinessStatus, toggleFeatured, startImpersonation, approveAllPending } from '@/lib/services';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  approved: 'Publié',
  pending: 'En attente',
  suspended: 'Suspendu',
};

const PLAN_COLORS: Record<string, string> = {
  Découverte: 'bg-gris-fond text-gris-texte',
  Essentiel: 'bg-blue-100 text-blue-700',
  Pro: 'bg-purple-100 text-purple-700',
  Business: 'bg-orange-100 text-orange-700',
  Entreprise: 'bg-red-100 text-red-700',
  Association: 'bg-green-100 text-green-700',
};

function getWebBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WEB_URL) {
    return process.env.NEXT_PUBLIC_WEB_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'admin.mycambo.net') return 'https://dev.mycambo.net';
    if (host.includes('github.dev')) return window.location.origin.replace('-3001.', '-3000.');
  }
  return 'http://localhost:3000';
}

export default function EstablishmentsPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const data = await getBusinesses();
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'suspended') => {
    const action = newStatus === 'approved' ? 'approuver' : 'suspendre';
    if (!confirm(`Confirmer : ${action} cet établissement ?`)) return;
    setProcessing(id);
    try {
      await updateBusinessStatus(id, newStatus);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Approuver TOUS les établissements en attente ? Ils seront publiés sur le site.')) return;
    setProcessing('__all__');
    try {
      const n = await approveAllPending();
      await reload();
      alert(n + ' établissement(s) approuvé(s) et publié(s).');
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    setProcessing(id);
    try {
      await toggleFeatured(id);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleView = async (slug: string, tenantId: string) => {
    setProcessing(`view-${tenantId}`);
    try {
      // 1. Créer un token d'impersonation pour le tenant
      const data = await startImpersonation(tenantId);
      
      // 2. Ouvrir l'URL avec le token
      const webBaseUrl = getWebBaseUrl();
      window.open(
        `${webBaseUrl}/espace-partenaire/etablissements/${slug}?impersonate=${data.token}`,
        '_blank'
      );
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = businesses.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.tenants?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.city || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: businesses.length,
    approved: businesses.filter((e) => e.status === 'approved').length,
    pending: businesses.filter((e) => e.status === 'pending').length,
    suspended: businesses.filter((e) => e.status === 'suspended').length,
    featured: businesses.filter((e) => e.is_featured).length,
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Établissements</h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : counts.total + ' établissements · ' + counts.featured + ' coups de cœur'}
          </p>
        </div>
        {counts.pending > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={processing === '__all__'}
            className="bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
          >
            {processing === '__all__'
              ? 'Validation…'
              : 'Tout approuver (' + counts.pending + ')'}
          </button>
        )}
      </div>

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

      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5">
            <option value="all">Tous statuts</option>
            <option value="approved">Publié</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
            <p className="text-sm text-gris-texte">Chargement...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Établissement</th>
                <th className="text-left px-3 py-3 font-bold">Catégorie</th>
                <th className="text-left px-3 py-3 font-bold">Formule</th>
                <th className="text-left px-3 py-3 font-bold">Tenant</th>
                <th className="text-left px-3 py-3 font-bold">Ville</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-center px-3 py-3 font-bold">⭐</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.map((est) => (
                <tr key={est.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center"><Store size={16} /></div>
                      <div className="font-bold text-marine truncate max-w-[200px]">{est.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte">{est.categories?.name || '—'}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (PLAN_COLORS[est.plans?.name || ''] || 'bg-gris-fond text-gris-texte')}>
                      {est.plans?.name || 'Découverte'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{est.tenants?.name || '—'}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{est.city || '—'}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[est.status]}>
                      {STATUS_LABELS[est.status]}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(est.id)}
                      disabled={processing === est.id}
                      className={'w-8 h-8 rounded-lg flex items-center justify-center ' + (est.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-gris-doux hover:bg-yellow-50 hover:text-yellow-500')}
                    >
                      {processing === est.id ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} fill={est.is_featured ? 'currentColor' : 'none'} />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleView(est.slug, est.tenant_id)}
                        disabled={processing === `view-${est.tenant_id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine disabled:opacity-50"
                        title="Voir dans l'espace partenaire (mode SuperAdmin)"
                      >
                        {processing === `view-${est.tenant_id}` ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                      </button>
                      {est.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(est.id, 'approved')}
                          disabled={processing === est.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 disabled:opacity-50"
                          title="Approuver"
                        >
                          {processing === est.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        </button>
                      )}
                      {est.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(est.id, 'suspended')}
                          disabled={processing === est.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50"
                          title="Suspendre"
                        >
                          {processing === est.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        </button>
                      )}
                      {est.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(est.id, 'approved')}
                          disabled={processing === est.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 disabled:opacity-50"
                          title="Réactiver"
                        >
                          {processing === est.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        </button>
                      )}
                    </div>
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