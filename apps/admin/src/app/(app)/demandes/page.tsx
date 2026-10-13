'use client';

import { useState, useEffect } from 'react';
import {
  Search, Filter, Eye, CheckCircle2, XCircle, Briefcase, Mail, MapPin,
  Loader2, X, Building2, Phone, Globe, Image as ImageIcon,
  AlertTriangle, FileText, ExternalLink, Calendar, Trash2,
} from 'lucide-react';
import {
  getPartnerRequests,
  approvePartnerRequest,
  rejectPartnerRequest,
  deletePartnerRequest,
} from '@/lib/services';

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

function getCompletenessColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

function getCompletenessBg(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function PartnerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [photoZoom, setPhotoZoom] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const reload = async () => {
    setLoading(true);
    const data = await getPartnerRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (!confirm(`Approuver la demande de "${selected.company_name}" ?\n\nCela va :\n1. Créer le tenant\n2. Envoyer un email au partenaire avec lien de création de compte`)) return;

    setProcessing(true);
    try {
      const result = await approvePartnerRequest(selected.id);
      alert('✅ Demande approuvée !\n\nTenant créé : ' + (result.tenant_slug || ''));
      setSelected(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectionReason.trim()) {
      alert('Veuillez saisir un motif de refus.');
      return;
    }

    setProcessing(true);
    try {
      await rejectPartnerRequest(selected.id, rejectionReason);
      alert('❌ Demande refusée. Email envoyé au partenaire.');
      setSelected(null);
      setRejectionModal(false);
      setRejectionReason('');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (deleteConfirmText !== 'SUPPRIMER') {
      alert('Tapez exactement SUPPRIMER pour confirmer.');
      return;
    }

    setDeleting(true);
    try {
      await deletePartnerRequest(selected.id);
      alert('✅ Demande supprimée définitivement.');
      setSelected(null);
      setDeleteModal(false);
      setDeleteConfirmText('');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const mapsUrl = (address: string, city: string) => {
    const query = [address, city].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Demandes partenaires
        </h1>
        <p className="text-sm text-gris-texte">
          {loading ? 'Chargement...' : `${counts.total} demandes · ${counts.pending} en attente`}
        </p>
      </div>

      {/* Stats */}
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

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
          >
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gris-texte">Aucune demande.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Entreprise</th>
                <th className="text-left px-3 py-3 font-bold">Catégorie</th>
                <th className="text-left px-3 py-3 font-bold">Ville</th>
                <th className="text-left px-3 py-3 font-bold">Complétude</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-marine">{req.company_name}</div>
                        <div className="text-xs text-gris-texte flex items-center gap-1">
                          <Mail size={10} />{req.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{req.category || '—'}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{req.city || '—'}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[60px] h-1.5 bg-gris-fond rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCompletenessBg(req.completeness_score || 0)}`}
                          style={{ width: `${req.completeness_score || 0}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${getCompletenessColor(req.completeness_score || 0)}`}>
                        {req.completeness_score || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[req.status]}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelected(req)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine"
                        title="Voir détails"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── MODALE DÉTAIL ─── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gris-ligne bg-white z-10 rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-marine">{selected.company_name}</h2>
                <p className="text-xs text-gris-texte mt-1">
                  {selected.email} · {selected.city || '—'}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              {/* Score de complétude */}
              <div className="bg-gris-fond rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-marine">Score de complétude</span>
                  <span className={`text-xl font-extrabold ${getCompletenessColor(selected.completeness_score || 0)}`}>
                    {selected.completeness_score || 0}%
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getCompletenessBg(selected.completeness_score || 0)}`}
                    style={{ width: `${selected.completeness_score || 0}%` }}
                  />
                </div>
              </div>

              {/* Informations légales */}
              <section>
                <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                  <Building2 size={14} /> Informations légales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gris-fond rounded-lg p-4">
                  <InfoRow label="Raison sociale" value={selected.legal_name} />
                  <InfoRow label="N° enregistrement" value={selected.registration_number} mono />
                  <InfoRow label="Représentant légal" value={selected.legal_representative_name} />
                  <InfoRow label="Téléphone représentant" value={selected.legal_representative_phone} />
                  <InfoRow label="Catégorie" value={selected.category} />
                  <InfoRow label="Ville" value={selected.city} />
                </div>
              </section>

              {/* Établissements déclarés */}
              {selected.establishments && selected.establishments.length > 0 && (
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <Briefcase size={14} /> Établissements déclarés ({selected.establishments.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.establishments.map((est: any, i: number) => (
                      <div key={i} className="bg-gris-fond rounded-lg p-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-marine/10 text-marine flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-marine">{est.name}</div>
                          {est.address && <div className="text-xs text-gris-texte">{est.address}</div>}
                          {est.city && <div className="text-xs text-gris-texte">{est.city}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Photos */}
              <section>
                <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                  <ImageIcon size={14} /> Photos du dossier
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <PhotoCard
                    label="Façade"
                    url={selected.photo_exterior_url}
                    required
                    onClick={() => selected.photo_exterior_url && setPhotoZoom(selected.photo_exterior_url)}
                  />
                  <PhotoCard
                    label="Intérieur"
                    url={selected.photo_interior_url}
                    required
                    onClick={() => selected.photo_interior_url && setPhotoZoom(selected.photo_interior_url)}
                  />
                  <PhotoCard
                    label="Pièce d'identité"
                    url={selected.photo_representative_id_url}
                    onClick={() => selected.photo_representative_id_url && setPhotoZoom(selected.photo_representative_id_url)}
                  />
                </div>
              </section>

              {/* Contact & Localisation */}
              <section>
                <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                  <MapPin size={14} /> Contact & Localisation
                </h3>
                <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                  {selected.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-marine flex-shrink-0" />
                      <a href={`tel:${selected.phone}`} className="text-sm text-marine font-bold hover:underline">
                        {selected.phone}
                      </a>
                      <span className="text-[10px] text-gris-doux ml-2">← Appeler pour vérifier</span>
                    </div>
                  )}
                  {selected.city && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-marine flex-shrink-0 mt-0.5" />
                      <a
                        href={mapsUrl(selected.establishments?.[0]?.address || '', selected.city)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-marine font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Voir sur Google Maps <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                  {selected.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-marine flex-shrink-0" />
                      <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-marine hover:underline truncate">
                        {selected.website_url}
                      </a>
                    </div>
                  )}
                  {selected.facebook_url && (
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-blue-600 flex-shrink-0" />
                      <a href={selected.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                        {selected.facebook_url}
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* Motivation */}
              {selected.motivation && (
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <FileText size={14} /> Motivation
                  </h3>
                  <div className="bg-gris-fond rounded-lg p-4 text-sm text-gris-texte whitespace-pre-line">
                    {selected.motivation}
                  </div>
                </section>
              )}

              {/* Récap enregistrement */}
              <div className="text-xs text-gris-doux flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> Reçue le {new Date(selected.created_at).toLocaleString('fr-FR')}
                </span>
                {selected.email_verified && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 size={11} /> Email vérifié
                  </span>
                )}
                {selected.accepts_terms && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 size={11} /> CGU acceptées
                  </span>
                )}
              </div>
            </div>

            {/* ─── FOOTER ACTIONS ─── */}
            <div className="flex justify-between gap-3 p-6 border-t border-gris-ligne bg-white sticky bottom-0 rounded-b-2xl shrink-0 flex-wrap">
              {/* Bouton supprimer (à gauche) */}
              <button
                onClick={() => setDeleteModal(true)}
                disabled={processing || deleting}
                className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                title="Supprimer définitivement"
              >
                <Trash2 size={12} />
                Supprimer
              </button>

              {/* Actions principales (à droite) */}
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectionModal(true)}
                    disabled={processing}
                    className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Refuser
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {processing ? 'Traitement...' : 'Approuver'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALE REFUS ─── */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-marine">Refuser la demande</h3>
                <p className="text-xs text-gris-texte">Le partenaire recevra cet email.</p>
              </div>
            </div>

            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Motif du refus *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex : Numéro d'enregistrement invalide, photos non conformes..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectionModal(false); setRejectionReason(''); }}
                className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex items-center gap-2 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALE SUPPRESSION ─── */}
      {deleteModal && selected && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-marine">Supprimer la demande</h3>
                <p className="text-xs text-gris-texte">Action irréversible</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-red-800">
                ⚠️ Cette action va <b>définitivement supprimer</b> la demande de :
                <br />
                <b className="text-marine">{selected.company_name}</b> ({selected.email})
                <br />
                <br />
                Cette action est <b>irréversible</b>. Les données seront perdues.
              </p>
            </div>

            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Tapez <span className="text-red-600 font-mono">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="SUPPRIMER"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-red-500 focus:outline-none font-mono mb-5"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
                className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText !== 'SUPPRIMER'}
                className="flex items-center gap-2 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ZOOM PHOTO ─── */}
      {photoZoom && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPhotoZoom(null)}
        >
          <img src={photoZoom} alt="Zoom" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function InfoRow({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">{label}</div>
      <div className={'text-sm text-marine ' + (mono ? 'font-mono' : '')}>
        {value || <span className="text-gris-doux italic">Non renseigné</span>}
      </div>
    </div>
  );
}

function PhotoCard({ label, url, required, onClick }: {
  label: string; url: string | null; required?: boolean; onClick: () => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {url ? (
        <button
          onClick={onClick}
          className="block w-full aspect-square rounded-lg overflow-hidden border border-gris-ligne hover:border-marine transition-colors"
        >
          <img src={url} alt={label} className="w-full h-full object-cover" />
        </button>
      ) : (
        <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gris-ligne flex items-center justify-center text-gris-doux">
          <XCircle size={20} />
        </div>
      )}
    </div>
  );
}