'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Loader2, Eye, Mail, MapPin, Clock, CheckCircle2, XCircle,
  X, Award, Inbox, History, Bell, Send, FileText, Store, Building2, ExternalLink,
} from 'lucide-react';
import {
  getSubmittedVerifications,
  getPendingVerifications,
  getVerificationHistoryList,
  remindTenantToSubmitVerification,
  approveVerification,
  rejectVerification,
} from '@/lib/services';

type TabId = 'submitted' | 'pending' | 'history';

export default function VerificationsPage() {
  const [tab, setTab] = useState<TabId>('submitted');
  const [submitted, setSubmitted] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const reload = async () => {
    setLoading(true);
    const [s, p, h] = await Promise.all([
      getSubmittedVerifications(),
      getPendingVerifications(),
      getVerificationHistoryList(),
    ]);
    setSubmitted(s);
    setPending(p);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleApprove = async (v: any) => {
    const name = v.business?.name || v.tenant?.name;
    if (!confirm(`Approuver le dossier de "${name}" ?\n\nCela le passera au niveau Vérifié (Bronze).`)) return;
    setProcessing(v.id);
    try {
      await approveVerification(v.id, v.business_id || v.tenant_id);
      setSelected(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectionReason.trim()) return;
    setProcessing(selected.id);
    try {
      await rejectVerification(selected.id, rejectionReason);
      setSelected(null);
      setRejectionModal(false);
      setRejectionReason('');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReminder = async (b: any) => {
    setSendingReminder(b.id);
    try {
      await remindTenantToSubmitVerification(b.tenant_id, b.id, b.email);
      alert(`✅ Email de relance envoyé au tenant et à l'établissement`);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSendingReminder(null);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Vérifications
        </h1>
        <p className="text-sm text-gris-texte">
          Contrôle qualité des fiches établissements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button
          onClick={() => setTab('submitted')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'submitted' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Inbox size={14} /> Dossiers soumis
          {submitted.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {submitted.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('pending')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'pending' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Clock size={14} /> En attente de dossier
          {pending.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'history' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <History size={14} /> Historique
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ONGLET 1 — DOSSIERS SOUMIS
          ═══════════════════════════════════════════════════════════ */}
      {tab === 'submitted' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong className="block mb-1">Dossiers en révision</strong>
              Ces établissements ont complété leur dossier. Vérifiez les informations,
              les photos et appelez pour confirmer avant d&apos;approuver.
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
              <Loader2 size={24} className="text-marine animate-spin mx-auto" />
            </div>
          ) : submitted.length === 0 ? (
            <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Aucun dossier en attente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.map((v) => {
                const businessName = v.business?.name || v.tenant?.name;
                const businessEmail = v.business?.email || v.tenant?.email;
                const businessCity = v.business?.city || v.tenant?.city;
                return (
                  <div key={v.id} className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                        <Store size={20} />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-marine">{businessName}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                            <Award size={10} /> Dossier soumis
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                          {businessEmail && <span className="flex items-center gap-1"><Mail size={11} /> {businessEmail}</span>}
                          {businessCity && <span className="flex items-center gap-1"><MapPin size={11} /> {businessCity}</span>}
                          <span className="text-gris-doux">
                            Soumis {v.last_submitted_at ? new Date(v.last_submitted_at).toLocaleDateString('fr-FR') : '—'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(v)}
                        className="flex items-center gap-2 bg-marine text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-marine-dark"
                      >
                        <Eye size={12} /> Examiner
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ONGLET 2 — EN ATTENTE DE DOSSIER
          ═══════════════════════════════════════════════════════════ */}
      {tab === 'pending' && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Bell size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong className="block mb-1">En attente de dossier</strong>
              Ces établissements sont actifs mais n&apos;ont pas encore soumis
              leur dossier de vérification. Relancez-les pour qu&apos;ils complètent.
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
              <Loader2 size={24} className="text-marine animate-spin mx-auto" />
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Tous les établissements ont soumis leur dossier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((b) => (
                <div key={b.id} className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Store size={20} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-marine">{b.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          En attente
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                        {b.email && <span className="flex items-center gap-1"><Mail size={11} /> {b.email}</span>}
                        {b.city && <span className="flex items-center gap-1"><MapPin size={11} /> {b.city}</span>}
                        <span className="text-gris-doux">
                          Inscrit le {new Date(b.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {/* ▼▼▼ LIEN VERS LE TENANT ▼▼▼ */}
                      {b.tenants && (
                        <div className="mt-2 flex items-center gap-2">
                          <Building2 size={11} className="text-gris-doux" />
                          <Link
                            href={`/tenants/${b.tenant_id}`}
                            className="text-xs font-bold text-marine hover:underline inline-flex items-center gap-1"
                          >
                            {b.tenants.name}
                            <ExternalLink size={10} />
                          </Link>
                        </div>
                      )}
                      {/* ▲▲▲ FIN LIEN ▲▲▲ */}
                    </div>
                    <button
                      onClick={() => handleReminder(b)}
                      disabled={sendingReminder === b.id}
                      className="flex items-center gap-2 bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-amber-700 disabled:opacity-50"
                    >
                      {sendingReminder === b.id ? (
                        <><Loader2 size={12} className="animate-spin" /> Envoi...</>
                      ) : (
                        <><Send size={12} /> Relancer</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ONGLET 3 — HISTORIQUE
          ═══════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <>
          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
            {loading ? (
              <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center text-gris-texte text-sm">
                Aucun historique pour le moment.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Établissement</th>
                    <th className="text-left px-3 py-3 font-bold">Tenant</th>
                    <th className="text-left px-3 py-3 font-bold">Statut</th>
                    <th className="text-left px-3 py-3 font-bold">Date</th>
                    <th className="text-left px-3 py-3 font-bold">Motif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-ligne">
                  {history.map((h) => {
                    const businessName = h.business?.name || '—';
                    const tenantName = h.tenant?.name || '—';
                    const tenantId = h.tenant?.id;
                    return (
                      <tr key={h.id} className="hover:bg-gris-fond/50">
                        <td className="px-5 py-3 font-bold text-marine">{businessName}</td>
                        <td className="px-3 py-3 text-xs text-gris-texte">
                          {tenantId ? (
                            <Link href={`/tenants/${tenantId}`} className="hover:underline inline-flex items-center gap-1">
                              {tenantName}
                              <ExternalLink size={10} />
                            </Link>
                          ) : tenantName}
                        </td>
                        <td className="px-3 py-3">
                          <span className={
                            'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                            (h.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                          }>
                            {h.status === 'approved' ? '✓ Approuvé' : '✗ Refusé'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gris-texte">
                          {h.reviewed_at ? new Date(h.reviewed_at).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gris-texte">
                          {h.rejection_reason || h.reviewer_notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modale détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gris-ligne bg-white rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-marine">
                  {selected.business?.name || selected.tenant?.name}
                </h2>
                <p className="text-xs text-gris-texte mt-1">
                  {selected.business?.email || selected.tenant?.email}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-gris-fond rounded-lg p-4 text-center">
                <FileText size={32} className="text-gris-doux mx-auto mb-2" />
                <p className="text-sm text-gris-texte">
                  Détails du dossier à examiner
                </p>
                <p className="text-xs text-gris-doux mt-1">
                  (Utiliser le modal détaillé avec photos)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gris-ligne bg-white rounded-b-2xl shrink-0">
              <button
                onClick={() => setRejectionModal(true)}
                disabled={processing === selected.id}
                className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={14} /> Refuser
              </button>
              <button
                onClick={() => handleApprove(selected)}
                disabled={processing === selected.id}
                className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
              >
                {processing === selected.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                Approuver (Bronze)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale refus */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="font-bold text-marine mb-4">Refuser le dossier</h3>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Motif du refus *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex : Photos non conformes, n° d'enregistrement invalide..."
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
                disabled={!rejectionReason.trim() || processing === selected?.id}
                className="flex items-center gap-2 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle size={14} /> Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}