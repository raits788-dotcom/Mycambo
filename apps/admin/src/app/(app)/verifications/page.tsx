'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, Loader2, Eye, Award, Mail, MapPin, Clock,
  CheckCircle2, XCircle, ExternalLink, Phone, Globe, Image as ImageIcon,
  AlertTriangle, X, FileText, Building2, Inbox,
} from 'lucide-react';
import {
  getPendingVerifications, changeVerificationLevel,
  getSubmittedVerifications, approveVerification, rejectVerification,
} from '@/lib/services';
import { createClient } from '@/lib/supabase';

interface VerificationDetail {
  id: string;
  tenant_id: string;
  legal_name: string | null;
  registration_number: string | null;
  legal_representative_name: string | null;
  legal_address: string | null;
  business_license_number: string | null;
  tax_number: string | null;
  photo_exterior_url: string | null;
  photo_interior_url: string | null;
  photo_id_representative_url: string | null;
  photo_business_license_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  google_maps_url: string | null;
  status: string;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  submission_count: number;
  last_submitted_at: string | null;
  tenant?: any;
}

export default function VerificationsPage() {
  const [tab, setTab] = useState<'submitted' | 'inscrits'>('submitted');
  const [submitted, setSubmitted] = useState<any[]>([]);
  const [inscrits, setInscrits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'submitted' | 'inscrit' | null>(null);
  const [photoZoom, setPhotoZoom] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const reload = async () => {
    setLoading(true);
    const [s, i] = await Promise.all([
      getSubmittedVerifications(),
      getPendingVerifications(),
    ]);
    setSubmitted(s);
    setInscrits(i);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleOpen = (data: any, type: 'submitted' | 'inscrit') => {
    setSelected(data);
    setSelectedType(type);
    setReviewerNotes('');
  };

  // ─── Actions pour dossiers SOUMIS ───
  const handleApproveSubmitted = async () => {
    if (!selected || !selectedType) return;
    if (!confirm(`Approuver le dossier de "${selected.tenant?.name}" ?\n\nLe tenant passera en niveau Vérifié (Bronze).`)) return;

    setProcessing(selected.id);
    try {
      await approveVerification(selected.id, selected.tenant_id, reviewerNotes || undefined);
      setSelected(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectSubmitted = async () => {
    if (!selected || !selectedType) return;
    const reason = prompt('Raison du refus (visible par le partenaire) :');
    if (!reason) return;

    setProcessing(selected.id);
    try {
      await rejectVerification(selected.id, reason);
      setSelected(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  // ─── Actions pour tenants INSCRITS ───
  const handleApproveInscrit = async () => {
    if (!selected) return;
    if (!confirm(`Approuver "${selected.name}" au niveau Vérifié (Bronze) ?`)) return;

    setProcessing(selected.id);
    try {
      await changeVerificationLevel(selected.id, 'verifie', reviewerNotes || 'Approbation initiale');
      setSelected(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectInscrit = async () => {
    if (!selected) return;
    const reason = prompt('Raison du refus ?');
    if (!reason) return;
    alert(`Refus enregistré : ${reason}\n(à implémenter : statut rejected)`);
  };

  const mapsUrl = (address: string | null, city: string | null) => {
    const query = [address, city].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Vérifications
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez les demandes de vérification et les nouveaux inscrits.
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
          onClick={() => setTab('inscrits')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'inscrits' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Clock size={14} /> Inscrits en attente
          {inscrits.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {inscrits.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB DOSSIERS SOUMIS ─── */}
      {tab === 'submitted' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong className="block mb-1">Dossiers en révision</strong>
              Ces partenaires ont complété leur dossier. Vérifiez les informations légales, les photos et appelez pour confirmer.
              Un dossier complet = gage de sérieux pour l&apos;annuaire MyCambo.
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
              <Loader2 size={24} className="text-marine animate-spin mx-auto" />
            </div>
          ) : submitted.length === 0 ? (
            <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Aucun dossier en attente. Bravo !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm hover:shadow-cb-md transition-all"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-marine">{v.tenant?.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                          <Award size={10} /> Dossier soumis
                        </span>
                        {v.submission_count > 1 && (
                          <span className="text-[10px] text-gris-doux">
                            Révision #{v.submission_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {v.tenant?.email}
                        </span>
                        {v.tenant?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {v.tenant.city}
                          </span>
                        )}
                        <span className="text-gris-doux">
                          Soumis {v.last_submitted_at ? new Date(v.last_submitted_at).toLocaleDateString('fr-FR') : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpen(v, 'submitted')}
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
        </>
      )}

      {/* ─── TAB INSCRITS ─── */}
      {tab === 'inscrits' && (
        <>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-800">
              <strong className="block mb-1">Nouveaux inscrits — à vérifier</strong>
              Ces partenaires viennent de s&apos;inscrire. Ils ne sont pas visibles publiquement tant que vous ne les avez pas validés.
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
              <Loader2 size={24} className="text-marine animate-spin mx-auto" />
            </div>
          ) : inscrits.length === 0 ? (
            <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Aucun inscrit en attente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inscrits.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm hover:shadow-cb-md transition-all"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-marine">{t.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          <Award size={10} /> Inscrit
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {t.email}
                        </span>
                        {t.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {t.city}
                          </span>
                        )}
                        <span className="text-gris-doux">
                          Inscrit le {new Date(t.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpen(t, 'inscrit')}
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
        </>
      )}

      {/* ─── MODALE EXAMEN ─── */}
      {selected && selectedType && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">

            <div className="flex items-center justify-between p-6 border-b border-gris-ligne sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-extrabold text-marine">
                  {selectedType === 'submitted' ? selected.tenant?.name : selected.name}
                </h2>
                <p className="text-xs text-gris-texte mt-1">
                  {selectedType === 'submitted' ? selected.tenant?.email : selected.email}
                </p>
              </div>
              <button
                onClick={() => { setSelected(null); setSelectedType(null); }}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {selectedType === 'inscrit' ? (
              <div className="p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Ce tenant vient de s&apos;inscrire. Il n&apos;a pas encore soumis de dossier de vérification.
                    Vous pouvez l&apos;approuver directement s&apos;il est sérieux, ou attendre qu&apos;il complète son dossier.
                  </p>
                </div>

                <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                  <div className="text-xs text-gris-texte">
                    <strong>Email :</strong> {selected.email}
                  </div>
                  {selected.phone && (
                    <div className="text-xs text-gris-texte">
                      <strong>Téléphone :</strong>{' '}
                      <a href={`tel:${selected.phone}`} className="text-marine font-bold hover:underline">
                        {selected.phone}
                      </a>
                    </div>
                  )}
                  {selected.city && (
                    <div className="text-xs text-gris-texte">
                      <strong>Ville :</strong> {selected.city}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-2">Notes internes</label>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gris-ligne">
                  <button
                    onClick={handleRejectInscrit}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Refuser
                  </button>
                  <button
                    onClick={handleApproveInscrit}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === selected.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    Approuver
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">

                {/* Informations légales */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <Building2 size={14} /> Informations légales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow label="Raison sociale" value={selected.legal_name} />
                    <InfoRow label="N° enregistrement" value={selected.registration_number} mono />
                    <InfoRow label="Représentant légal" value={selected.legal_representative_name} />
                    <InfoRow label="N° licence commerciale" value={selected.business_license_number} mono />
                    <InfoRow label="N° fiscal" value={selected.tax_number} mono />
                    <InfoRow label="Adresse légale" value={selected.legal_address} />
                  </div>
                </section>

                {/* Photos */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <ImageIcon size={14} /> Photos du dossier
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <PhotoCard label="Extérieure" url={selected.photo_exterior_url} required onClick={() => selected.photo_exterior_url && setPhotoZoom(selected.photo_exterior_url)} />
                    <PhotoCard label="Intérieure" url={selected.photo_interior_url} required onClick={() => selected.photo_interior_url && setPhotoZoom(selected.photo_interior_url)} />
                    <PhotoCard label="Pièce d'identité" url={selected.photo_id_representative_url} onClick={() => selected.photo_id_representative_url && setPhotoZoom(selected.photo_id_representative_url)} />
                    <PhotoCard label="Licence" url={selected.photo_business_license_url} onClick={() => selected.photo_business_license_url && setPhotoZoom(selected.photo_business_license_url)} />
                  </div>
                </section>

                {/* Contacts & Maps */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <MapPin size={14} /> Contacts & localisation
                  </h3>

                  <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-marine flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-gris-texte">
                          {selected.tenant?.address || '—'}, {selected.tenant?.city || '—'}
                        </div>
                        <a
                          href={mapsUrl(selected.tenant?.address, selected.tenant?.city)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-marine font-bold hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Ouvrir dans Google Maps <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    {selected.tenant?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-marine flex-shrink-0" />
                        <a href={`tel:${selected.tenant.phone}`} className="text-sm text-marine font-bold hover:underline">
                          {selected.tenant.phone}
                        </a>
                        <span className="text-[10px] text-gris-doux ml-2">← Appeler pour vérifier</span>
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

                {/* Checklist */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Checklist
                  </h3>
                  <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                    <CheckItem checked={!!selected.legal_name} label="Raison sociale fournie" />
                    <CheckItem checked={!!selected.registration_number} label="Numéro d'enregistrement fourni" />
                    <CheckItem checked={!!selected.legal_representative_name} label="Représentant légal identifié" />
                    <CheckItem checked={!!selected.photo_exterior_url} label="Photo extérieure" />
                    <CheckItem checked={!!selected.photo_interior_url} label="Photo intérieure" />
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <FileText size={14} /> Notes internes (optionnel)
                  </h3>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Observations..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
                  />
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gris-ligne">
                  <button
                    onClick={handleRejectSubmitted}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Refuser
                  </button>
                  <button
                    onClick={handleApproveSubmitted}
                    disabled={processing === selected.id}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === selected.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    Approuver & publier
                  </button>
                </div>
              </div>
            )}
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

// ─── Composants helpers ──────────────────────────────────────────────
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

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {checked ? (
        <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
      ) : (
        <XCircle size={14} className="text-red-500 flex-shrink-0" />
      )}
      <span className={'text-xs ' + (checked ? 'text-marine' : 'text-gris-doux')}>{label}</span>
    </div>
  );
}