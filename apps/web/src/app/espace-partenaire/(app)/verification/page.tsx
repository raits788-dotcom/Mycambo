'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, Upload, Loader2, Check, AlertCircle, Info,
  Building2, FileText, Phone, Globe, ExternalLink, Image as ImageIcon,
} from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';
import {
  getTenantVerification,
  uploadVerificationPhoto,
  submitTenantVerification,
  type TenantVerification,
} from '@/lib/verification';

export default function VerificationPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [verification, setVerification] = useState<TenantVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    legal_name: '',
    registration_number: '',
    legal_representative_name: '',
    legal_address: '',
    business_license_number: '',
    tax_number: '',
    website_url: '',
    facebook_url: '',
    google_maps_url: '',
    photo_exterior_url: '',
    photo_interior_url: '',
    photo_id_representative_url: '',
    photo_business_license_url: '',
  });

  useEffect(() => {
    if (tenantLoading || !tenant) return;
    (async () => {
      const v = await getTenantVerification(tenant.id);
      if (v) {
        setVerification(v);
        setForm({
          legal_name: v.legal_name || '',
          registration_number: v.registration_number || '',
          legal_representative_name: v.legal_representative_name || '',
          legal_address: v.legal_address || '',
          business_license_number: v.business_license_number || '',
          tax_number: v.tax_number || '',
          website_url: v.website_url || '',
          facebook_url: v.facebook_url || '',
          google_maps_url: v.google_maps_url || '',
          photo_exterior_url: v.photo_exterior_url || '',
          photo_interior_url: v.photo_interior_url || '',
          photo_id_representative_url: v.photo_id_representative_url || '',
          photo_business_license_url: v.photo_business_license_url || '',
        });
      }
      setLoading(false);
    })();
  }, [tenant, tenantLoading]);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'exterior' | 'interior' | 'id' | 'license'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploading(slot);
    setError('');
    const url = await uploadVerificationPhoto(tenant.id, file, slot);
    setUploading(null);

    if (url) {
      const key = slot === 'exterior' ? 'photo_exterior_url'
        : slot === 'interior' ? 'photo_interior_url'
        : slot === 'id' ? 'photo_id_representative_url'
        : 'photo_business_license_url';
      setForm((prev) => ({ ...prev, [key]: url }));
    } else {
      setError('Erreur lors de l\'upload.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    // Validation
    if (!form.legal_name || !form.registration_number || !form.legal_representative_name) {
      setError('Veuillez remplir toutes les informations légales obligatoires.');
      return;
    }
    if (!form.photo_exterior_url || !form.photo_interior_url) {
      setError('Les photos extérieure et intérieure sont obligatoires.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitTenantVerification({
        tenant_id: tenant.id,
        ...form,
      });
      setSaved(true);
      const v = await getTenantVerification(tenant.id);
      setVerification(v);
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (tenantLoading || loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (!tenant) {
    return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;
  }

  const status = verification?.status || 'incomplete';

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Vérification MyCambo
        </h1>
        <p className="text-sm text-gris-texte">
          Complétez votre dossier pour être visible dans l&apos;annuaire.
        </p>
      </div>

      {/* Statut */}
      {status === 'submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong className="block mb-1">Dossier soumis</strong>
            Votre dossier est en cours d&apos;examen par l&apos;équipe MyCambo. Vous serez notifié par email.
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <strong className="block mb-1">✅ Vérification approuvée</strong>
            Votre établissement est désormais visible dans l&apos;annuaire MyCambo.
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <strong className="block mb-1">Vérification refusée</strong>
            {verification?.rejection_reason || 'Motif non précisé.'}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations légales */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <h2 className="font-bold text-marine flex items-center gap-2 mb-4">
            <Building2 size={16} /> Informations légales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Raison sociale *
              </label>
              <input
                type="text"
                required
                value={form.legal_name}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
                placeholder="Ex: Bistro Khmer Co., Ltd"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Numéro d&apos;enregistrement *
              </label>
              <input
                type="text"
                required
                value={form.registration_number}
                onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                placeholder="MOC-XXXXX"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Représentant légal *
              </label>
              <input
                type="text"
                required
                value={form.legal_representative_name}
                onChange={(e) => setForm({ ...form, legal_representative_name: e.target.value })}
                placeholder="Nom complet"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Adresse légale
              </label>
              <input
                type="text"
                value={form.legal_address}
                onChange={(e) => setForm({ ...form, legal_address: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                N° licence commerciale
              </label>
              <input
                type="text"
                value={form.business_license_number}
                onChange={(e) => setForm({ ...form, business_license_number: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Numéro fiscal (VAT/TIN)
              </label>
              <input
                type="text"
                value={form.tax_number}
                onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Photos obligatoires */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <h2 className="font-bold text-marine flex items-center gap-2 mb-4">
            <ImageIcon size={16} /> Photos obligatoires
          </h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2">
            <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Les photos doivent être <strong>récentes (&lt; 6 mois)</strong>, nettes, et montrer clairement l&apos;enseigne et l&apos;intérieur de l&apos;établissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhotoUpload
              label="📸 Photo extérieure (façade)"
              description="Façade visible avec enseigne"
              url={form.photo_exterior_url}
              uploading={uploading === 'exterior'}
              onUpload={(e) => handleUpload(e, 'exterior')}
              onRemove={() => setForm({ ...form, photo_exterior_url: '' })}
              required
            />

            <PhotoUpload
              label="📸 Photo intérieure"
              description="Intérieur de l'établissement"
              url={form.photo_interior_url}
              uploading={uploading === 'interior'}
              onUpload={(e) => handleUpload(e, 'interior')}
              onRemove={() => setForm({ ...form, photo_interior_url: '' })}
              required
            />

            <PhotoUpload
              label="🪪 Pièce d'identité du représentant"
              description="CIN ou Passeport (optionnel)"
              url={form.photo_id_representative_url}
              uploading={uploading === 'id'}
              onUpload={(e) => handleUpload(e, 'id')}
              onRemove={() => setForm({ ...form, photo_id_representative_url: '' })}
            />

            <PhotoUpload
              label="📄 Licence commerciale"
              description="Document officiel (optionnel)"
              url={form.photo_business_license_url}
              uploading={uploading === 'license'}
              onUpload={(e) => handleUpload(e, 'license')}
              onRemove={() => setForm({ ...form, photo_business_license_url: '' })}
            />
          </div>
        </div>

        {/* Présence en ligne */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <h2 className="font-bold text-marine flex items-center gap-2 mb-4">
            <Globe size={16} /> Présence en ligne (optionnel)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">Site web</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">Facebook</label>
              <input
                type="url"
                value={form.facebook_url}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                Lien Google Maps
              </label>
              <input
                type="url"
                value={form.google_maps_url}
                onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ Dossier soumis ! L&apos;équipe MyCambo va l&apos;examiner sous 48h.
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting || status === 'approved'}
            className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            {submitting ? 'Envoi...' : status === 'submitted' ? 'Renvoyer pour examen' : 'Soumettre pour vérification'}
          </button>
        </div>
      </form>
    </>
  );
}

// ─── Composant Photo Upload ──────────────────────────────────────────────
function PhotoUpload({
  label, description, url, uploading, onUpload, onRemove, required,
}: {
  label: string;
  description: string;
  url: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
        {label} {required && '*'}
      </label>
      <p className="text-[10px] text-gris-doux mb-3">{description}</p>

      {url ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-gris-ligne group">
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="aspect-video rounded-lg border-2 border-dashed border-gris-ligne hover:border-marine cursor-pointer flex flex-col items-center justify-center text-gris-texte hover:text-marine transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 size={20} className="animate-spin mb-2" />
          ) : (
            <Upload size={20} className="mb-2" />
          )}
          <span className="text-xs font-bold">
            {uploading ? 'Upload...' : 'Ajouter une photo'}
          </span>
        </label>
      )}
    </div>
  );
}