'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, Briefcase, Mail, MapPin, Loader2, X } from 'lucide-react';
import { getPartnerRequests } from '@/lib/services';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export default function PartnerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getPartnerRequests();
      setRequests(data);
      setLoading(false);
    })();
  }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.company_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Demandes partenaires</h1>
        <p className="text-sm text-gris-texte">
          {loading ? 'Chargement...' : counts.total + ' demandes · ' + counts.pending + ' en attente'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Total</div>
          <div className="text-2xl font-extrabold text-marine">{counts.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">En attente</div>
          <div className="text-2xl font-extrabold text-orange-600">{counts.pending}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Approuvées</div>
          <div className="text-2xl font-extrabold text-green-600">{counts.approved}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Refusées</div>
          <div className="text-2xl font-extrabold text-red-600">{counts.rejected}</div>
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
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
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
                <th className="text-left px-5 py-3 font-bold">Entreprise</th>
                <th className="text-left px-3 py-3 font-bold">Catégorie</th>
                <th className="text-left px-3 py-3 font-bold">Ville</th>
                <th className="text-left px-3 py-3 font-bold">Date</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gris-texte">Aucune demande.</td></tr>
              ) : filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center"><Briefcase size={16} /></div>
                      <div>
                        <div className="font-bold text-marine">{req.company_name}</div>
                        <div className="text-xs text-gris-texte flex items-center gap-1"><Mail size={10} />{req.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{req.category || '—'}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{req.city || '—'}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[req.status]}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSelected(req)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine"><Eye size={14} /></button>
                      {req.status === 'pending' && (
                        <>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100"><CheckCircle2 size={14} /></button>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"><XCircle size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-gris-ligne">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-marine/10 text-marine flex items-center justify-center"><Briefcase size={20} /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-marine">{selected.company_name}</h2>
                  <div className="flex items-center gap-3 text-xs text-gris-texte mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Mail size={11} />{selected.email}</span>
                    {selected.city && <span className="flex items-center gap-1"><MapPin size={11} />{selected.city}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center text-gris-texte"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Catégorie</div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-marine/10 text-marine">{selected.category || '—'}</span>
              </div>
              {selected.phone && (
                <div>
                  <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Téléphone</div>
                  <div className="text-sm text-marine">{selected.phone}</div>
                </div>
              )}
              {selected.message && (
                <div>
                  <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Message</div>
                  <div className="text-sm text-gris-texte bg-gris-fond rounded-lg p-4">{selected.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}