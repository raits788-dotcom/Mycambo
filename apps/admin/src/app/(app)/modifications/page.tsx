'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Loader2, CheckCircle2, XCircle, Clock, Mail, Building2,
  Eye, X, AlertTriangle,
} from 'lucide-react';
import {
  getModificationRequests,
  approveModificationRequest,
  rejectModificationRequest,
} from '@/lib/services';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  city: 'Ville',
  address: 'Adresse',
  description: 'Description',
  registration_number: 'N° enregistrement',
  category: 'Catégorie',
};

export default function ModificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  const reload = async () => {
    setLoading(true);
    const data = await getModificationRequests(filterStatus === 'all' ? undefined : filterStatus);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selected) return;
    if (!confirm(`Approuver cette demande de modification ?\n\nChamp : ${FIELD_LABELS[selected.field] || selected.field}\nNouvelle valeur : ${selected.new_value}`)) return;

    setProcessing(selected.id);
    try {
      await approveModificationRequest(selected.id, reviewerNotes || undefined);
      setSelected(null);
      setReviewerNotes('');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    const reason = prompt('Raison du refus (visible par le partenaire) :');
    if (!reason) return;

    setProcessing(selected.id);
    try {
      await rejectModificationRequest(selected.id, reason);
      setSelected(null);
      setReviewerNotes('');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Demandes de modification
          </h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : `${counts.pending} en attente · ${counts.total} au total`}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong className="block mb-1">Workflow de modification</strong>
          Certains champs sensibles (nom, email, catégorie, adresse) ne peuvent pas être modifiés directement par les partenaires.
          Ils doivent passer par une demande que vous validez manuellement.
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'pending', label: 'En attente', count: counts.pending },
          { id: 'approved', label: 'Approuvées', count: counts.approved },
          { id: 'rejected', label: 'Refusées', count: counts.rejected },
          { id: 'all', label: 'Toutes', count: counts.total },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={
              'px-4 py-2 rounded-full text-sm font-bold transition-all ' +
              (filterStatus === f.id
                ? 'bg-marine text-white'
                : 'bg-white border border-gris-ligne text-gris-texte hover:border-marine')
            }
          >
            {f.label} {f.count > 0 && <span className="ml-1 opacity-75">({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
          <Loader2 size={24} className="text-marine animate-spin mx-auto" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
          <FileText size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Aucune demande pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm hover:shadow-cb-md transition-all"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className={
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ' +
                  (r.status === 'pending' ? 'bg-orange-100 text-orange-700'
                    : r.status === 'approved' ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700')
                }>
                  {r.status === 'pending' ? <Clock size={20} /> :
                   r.status === 'approved' ? <CheckCircle2 size={20} /> :
                   <XCircle size={20} />}
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-marine">{r.tenant?.name || '—'}</h3>
                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ' + STATUS_STYLES[r.status]}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>

                  <div className="text-xs text-gris-texte mb-2">
                    <span className="font-bold text-marine">
                      {FIELD_LABELS[r.field] || r.field}
                    </span>
                    {' '}· Demande du {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gris-doux line-through">{r.old_value || '—'}</span>
                    <span className="text-gris-doux">→</span>
                    <span className="font-bold text-marine">{r.new_value}</span>
                  </div>

                  {r.business && (
                    <div className="text-[11px] text-gris-texte mt-1">
                      Sur l&apos;établissement : <strong>{r.business.name}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setSelected(r); setReviewerNotes(''); }}
                    className="flex items-center gap-2 bg-marine text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-marine-dark"
                  >
                    <Eye size={12} /> Examiner
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE EXAMEN */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">

            <div className="flex items-center justify-between p-6 border-b border-gris-ligne">
              <div>
                <h2 className="text-lg font-extrabold text-marine">Demande de modification</h2>
                <p className="text-xs text-gris-texte mt-1">{selected.tenant?.name}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gris-fond rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">Champ concerné</div>
                  <div className="text-sm font-bold text-marine">{FIELD_LABELS[selected.field] || selected.field}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">Valeur actuelle</div>
                  <div className="text-sm text-gris-texte line-through">{selected.old_value || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">Nouvelle valeur demandée</div>
                  <div className="text-sm font-bold text-marine">{selected.new_value}</div>
                </div>
                {selected.reason && (
                  <div>
                    <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">Motif du partenaire</div>
                    <div className="text-sm text-gris-texte italic">« {selected.reason} »</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">Notes internes (optionnel)</label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Observations, raisons de la validation..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
                />
              </div>

              {selected.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gris-ligne">
                  <button
                    onClick={handleReject}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Refuser
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === selected.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    Approuver & appliquer
                  </button>
                </div>
              )}

              {selected.status !== 'pending' && (
                <div className={'rounded-lg p-4 text-sm ' + (selected.status === 'approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>
                  {selected.status === 'approved'
                    ? '✅ Cette demande a été approuvée et appliquée.'
                    : `❌ Refusée : ${selected.rejection_reason || '—'}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}