'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Loader2, Eye, Award, Mail, MapPin, Clock,
  CheckCircle2, XCircle, ExternalLink, Phone, Globe, Image as ImageIcon,
  AlertTriangle, X, FileText, Building2,
} from 'lucide-react';
import {
  getPendingVerifications, changeVerificationLevel,
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
  phone_verified: boolean;
  status: string;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  submission_count: number;
  last_submitted_at: string | null;
}

export default function VerificationsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [verification, setVerification] = useState<VerificationDetail | null>(null);
  const [verifLoading, setVerifLoading] = useState(false);
  const [photoZoom, setPhotoZoom] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const reload = async () => {
    setLoading(true);
    const data = await getPendingVerifications();
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const loadVerification = async (tenantId: string) => {
    setVerifLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('tenant_verifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    setVerification(data);
    setVerifLoading(false);
  };

  const handleOpen = async (tenant: any) => {
    setSelected(tenant);
    setReviewerNotes('');
    await loadVerification(tenant.id);
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (!confirm(`Approuver "${selected.name}" au niveau Vérifié (Bronze) ?`)) return;
    setProcessing(selected.id);
    try {
      await changeVerificationLevel(selected.id, 'verifie', reviewerNotes || 'Approbation initiale');

      // Met à jour le statut de la vérification
      const supabase = createClient();
      await supabase
        .from('tenant_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewerNotes || null,
        })
        .eq('tenant_id', selected.id);

      setSelected(null);
      setVerification(null);
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
      const supabase = createClient();
      await supabase
        .from('tenant_verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
          reviewer_notes: reviewerNotes || null,
        })
        .eq('tenant_id', selected.id);

      setSelected(null);
      setVerification(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
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
          {loading
            ? 'Chargement...'
            : `${tenants.length} tenant${tenants.length > 1 ? 's' : ''} en attente de validation`}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong className="block mb-1">Processus de validation</strong>
          Vérifiez les informations légales, les photos et les coordonnées.
          Appelez le partenaire pour confirmer l&apos;existence de l&apos;établissement.
          Un dossier complet = un gage de sérieux pour l&apos;annuaire MyCambo.
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
          <Loader2 size={24} className="text-marine animate-spin mx-auto" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
          <ShieldCheck size={32} className="text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gris-texte">
            🎉 Aucun dossier en attente. Tout est à jour !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm hover:shadow-cb-md transition-all"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-marine">{tenant.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      <Award size={10} /> Inscrit
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                    <span className="flex items-center gap-1">
                      <Mail size={11} /> {tenant.email}
                    </span>
                    {tenant.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {tenant.city}
                      </span>
                    )}
                    <span className="text-gris-doux">
                      Inscrit le {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpen(tenant)}
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

      {/* ─── MODALE EXAMEN ─── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gris-ligne sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-extrabold text-marine">{selected.name}</h2>
                <p className="text-xs text-gris-texte mt-1">
                  {selected.email} · {selected.city || '—'}
                </p>
              </div>
              <button
                onClick={() => { setSelected(null); setVerification(null); }}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {verifLoading ? (
              <div className="p-12 text-center">
                <Loader2 size={24} className="text-marine animate-spin mx-auto" />
              </div>
            ) : !verification ? (
              <div className="p-12 text-center">
                <AlertTriangle size={32} className="text-orange-500 mx-auto mb-3" />
                <p className="text-sm text-gris-texte">
                  Aucun dossier de vérification soumis par ce partenaire.
                </p>
                <p className="text-xs text-gris-doux mt-1">
                  Le partenaire doit remplir le formulaire depuis son espace.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">

                {/* Informations légales */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <Building2 size={14} /> Informations légales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow label="Raison sociale" value={verification.legal_name} />
                    <InfoRow label="N° enregistrement" value={verification.registration_number} mono />
                    <InfoRow label="Représentant légal" value={verification.legal_representative_name} />
                    <InfoRow label="N° licence commerciale" value={verification.business_license_number} mono />
                    <InfoRow label="N° fiscal" value={verification.tax_number} mono />
                    <InfoRow label="Adresse légale" value={verification.legal_address} />
                  </div>
                </section>

                {/* Photos */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <ImageIcon size={14} /> Photos du dossier
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <PhotoCard
                      label="Extérieure"
                      url={verification.photo_exterior_url}
                      required
                      onClick={() => verification.photo_exterior_url && setPhotoZoom(verification.photo_exterior_url)}
                    />
                    <PhotoCard
                      label="Intérieure"
                      url={verification.photo_interior_url}
                      required
                      onClick={() => verification.photo_interior_url && setPhotoZoom(verification.photo_interior_url)}
                    />
                    <PhotoCard
                      label="Pièce d'identité"
                      url={verification.photo_id_representative_url}
                      onClick={() => verification.photo_id_representative_url && setPhotoZoom(verification.photo_id_representative_url)}
                    />
                    <PhotoCard
                      label="Licence"
                      url={verification.photo_business_license_url}
                      onClick={() => verification.photo_business_license_url && setPhotoZoom(verification.photo_business_license_url)}
                    />
                  </div>
                </section>

                {/* Localisation & contacts */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <MapPin size={14} /> Localisation & contacts
                  </h3>

                  <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-marine flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-gris-texte">{selected.address || '—'}, {selected.city || '—'}</div>
                        <a
                          href={mapsUrl(selected.address, selected.city)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-marine font-bold hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Ouvrir dans Google Maps <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    {selected.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-marine flex-shrink-0" />
                        <a href={`tel:${selected.phone}`} className="text-sm text-marine font-bold hover:underline">
                          {selected.phone}
                        </a>
                        <span className="text-[10px] text-gris-doux ml-2">← Appeler pour vérifier</span>
                      </div>
                    )}

                    {verification.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-marine flex-shrink-0" />
                        <a href={verification.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-marine hover:underline truncate">
                          {verification.website_url}
                        </a>
                      </div>
                    )}

                    {verification.facebook_url && (
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-blue-600 flex-shrink-0" />
                        <a href={verification.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                          {verification.facebook_url}
                        </a>
                      </div>
                    )}
                  </div>
                </section>

                {/* Checklist */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Checklist de validation
                  </h3>
                  <div className="bg-gris-fond rounded-lg p-4 space-y-2">
                    <CheckItem checked={!!verification.legal_name} label="Raison sociale fournie" />
                    <CheckItem checked={!!verification.registration_number} label="Numéro d'enregistrement fourni" />
                    <CheckItem checked={!!verification.legal_representative_name} label="Représentant légal identifié" />
                    <CheckItem checked={!!verification.photo_exterior_url} label="Photo extérieure fournie" />
                    <CheckItem checked={!!verification.photo_interior_url} label="Photo intérieure fournie" />
                    <CheckItem checked={verification.phone_verified} label="Téléphone vérifié par appel" />
                  </div>
                </section>

                {/* Notes reviewer */}
                <section>
                  <h3 className="font-bold text-marine flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                    <FileText size={14} /> Notes internes (optionnel)
                  </h3>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Observations, doutes, points à vérifier..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
                  />
                </section>

                {/* Actions */}
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
      <div className={'text-sm text-marine ' + (mono ? 'font-mono' : '')}>{value || <span className="text-gris-doux italic">Non renseigné</span>}</div>
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