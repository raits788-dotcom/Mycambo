'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Check,
  Send,
  AlertCircle,
  Info,
  History,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';
import {
  getRequestsByEstablishment,
  MODIFICATION_STATUS_CONFIG,
  type ModificationField,
} from '@/lib/modification-requests';
import ModificationRequestModal from './ModificationRequestModal';

interface InfoTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

// Champs nécessitant une validation
const LOCKED_FIELDS: Record<
  string,
  { field: ModificationField; label: string }
> = {
  name: { field: 'name', label: "Nom de l'établissement" },
  category: { field: 'category', label: 'Catégorie' },
  address: { field: 'address', label: 'Adresse' },
  city: { field: 'city', label: 'Ville' },
  registrationNumber: {
    field: 'registration_number',
    label: "Numéro d'enregistrement",
  },
};

export default function InfoTab({ establishment, onUpdate }: InfoTabProps) {
  const [form, setForm] = useState({
    shortDescription: establishment.shortDescription || '',
    longDescription: establishment.longDescription || '',
    foundedYear: establishment.foundedYear || '',
    hours: establishment.hours || '',
    phone: establishment.phone || '',
    whatsapp: establishment.whatsapp || '',
    website: establishment.website || '',
    facebook: establishment.facebook || '',
    instagram: establishment.instagram || '',
  });
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<{
    field: ModificationField;
    oldValue: string;
  } | null>(null);
  const [requests, setRequests] = useState(getRequestsByEstablishment(establishment.slug));

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateEstablishment(establishment.slug, {
      shortDescription: form.shortDescription,
      longDescription: form.longDescription,
      hours: form.hours,
      phone: form.phone,
    });

    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  };

  const openRequestModal = (
    field: ModificationField,
    oldValue: string
  ) => {
    setModal({ field, oldValue });
  };

  const getLockedValue = (field: string): string => {
    if (field === 'name') return establishment.name;
    if (field === 'category') return establishment.category;
    if (field === 'address') return establishment.address;
    if (field === 'city') return establishment.city;
    return '';
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
      {/* Légende */}
      <div className="bg-gris-fond rounded-lg p-4 mb-6 flex items-center gap-4 flex-wrap text-xs">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <b className="text-marine">Modifiable librement</b>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-ic-or" />
          <b className="text-marine">Validation admin requise</b>
        </span>
      </div>

      <form onSubmit={handleSave}>
        <div className="space-y-5 max-w-3xl">

          {/* Nom (verrouillé) */}
          <LockedField
            label="Nom de l'établissement"
            value={establishment.name}
            onRequest={() => openRequestModal('name', establishment.name)}
            hint="Modifiable uniquement après validation par myCAMBO."
          />

          {/* Catégorie (verrouillée) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LockedField
              label="Catégorie"
              value={establishment.category}
              onRequest={() =>
                openRequestModal('category', establishment.category)
              }
            />
            <FreeField
              label="Année de création"
              value={form.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
            />
          </div>

          {/* Description courte (libre) */}
          <FreeField
            label="Description courte"
            value={form.shortDescription}
            onChange={(v) => handleChange('shortDescription', v)}
            hint={`${form.shortDescription.length}/160`}
            maxLength={160}
          />

          {/* Description détaillée (libre) */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider flex items-center gap-2">
              Description détaillée
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </label>
            <textarea
              value={form.longDescription}
              onChange={(e) => handleChange('longDescription', e.target.value)}
              rows={5}
              className="w-full border-2 border-green-200 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Horaires + Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FreeField
              label="Horaires d'ouverture"
              value={form.hours}
              onChange={(v) => handleChange('hours', v)}
              placeholder="Ex : Lun-Ven 8h-17h"
            />
            <FreeField
              label="Téléphone"
              value={form.phone}
              onChange={(v) => handleChange('phone', v)}
              placeholder="+855 ..."
            />
          </div>

          {/* Site web + réseaux */}
          <FreeField
            label="Site web"
            value={form.website}
            onChange={(v) => handleChange('website', v)}
            placeholder="www.exemple.com"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FreeField
              label="Facebook"
              value={form.facebook}
              onChange={(v) => handleChange('facebook', v)}
              placeholder="https://facebook.com/..."
            />
            <FreeField
              label="Instagram"
              value={form.instagram}
              onChange={(v) => handleChange('instagram', v)}
              placeholder="https://instagram.com/..."
            />
          </div>

          {/* Adresse (verrouillée) */}
          <LockedField
            label="Adresse"
            value={establishment.address}
            onRequest={() => openRequestModal('address', establishment.address)}
            hint="L'adresse impacte la géolocalisation. Validation requise."
          />

          {/* Ville (verrouillée) */}
          <LockedField
            label="Ville"
            value={establishment.city}
            onRequest={() => openRequestModal('city', establishment.city)}
          />

          {/* Numéro d'enregistrement (verrouillé) */}
          {establishment.registrationNumber && (
            <LockedField
              label="Numéro d'enregistrement légal"
              value={establishment.registrationNumber}
              onRequest={() =>
                openRequestModal(
                  'registration_number',
                  establishment.registrationNumber || ''
                )
              }
            />
          )}

          {/* Save */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gris-ligne">
            <button
              type="button"
              className="text-xs font-bold border border-gris-ligne text-gris-texte px-5 py-2.5 rounded-full hover:border-marine hover:text-marine transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors"
            >
              {saved ? (
                <>
                  <Check size={12} />
                  Enregistré
                </>
              ) : (
                <>
                  <Save size={12} />
                  Enregistrer
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Historique des demandes */}
      {requests.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gris-ligne">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-marine" />
            <h3 className="font-bold text-marine text-sm">
              Mes demandes de modification
            </h3>
            {pendingCount > 0 && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingCount} en attente
              </span>
            )}
          </div>

          <div className="space-y-3">
            {requests.map((req) => {
              const config = MODIFICATION_STATUS_CONFIG[req.status];
              return (
                <div
                  key={req.id}
                  className="bg-gris-fond rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="font-bold text-marine text-sm">
                      {req.fieldLabel}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5',
                        config.color
                      )}
                    >
                      <i className={`fas ${config.icon}`} />
                      {config.label}
                    </span>
                  </div>

                  <div className="text-xs text-gris-texte mb-1">
                    <span className="line-through text-gris-doux">
                      {req.oldValue}
                    </span>{' '}
                    <span className="text-marine font-bold">
                      → {req.newValue}
                    </span>
                  </div>

                  <div className="text-[10px] text-gris-doux">
                    {new Date(req.createdAt).toLocaleDateString('fr-FR')} ·{' '}
                    {req.reason}
                  </div>

                  {req.rejectionReason && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-[10px] text-red-700">
                      <b>Motif du refus :</b> {req.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modale */}
      {modal && (
        <ModificationRequestModal
          establishmentSlug={establishment.slug}
          field={modal.field}
          oldValue={modal.oldValue}
          onClose={() => setModal(null)}
          onSubmitted={() => {
            setModal(null);
            setRequests(getRequestsByEstablishment(establishment.slug));
          }}
        />
      )}
    </>
  );
}

// ===== Champs libres =====
function FreeField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider flex items-center gap-2">
        {label}
        <span className="w-2 h-2 rounded-full bg-green-500" />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border-2 border-green-200 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:outline-none transition-colors"
      />
      {hint && (
        <div className="text-[10px] text-gris-doux mt-1 text-right">{hint}</div>
      )}
    </div>
  );
}

// ===== Champs verrouillés =====
function LockedField({
  label,
  value,
  onRequest,
  hint,
}: {
  label: string;
  value: string;
  onRequest: () => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
        <label className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
          {label}
          <span className="w-2 h-2 rounded-full bg-ic-or" />
        </label>
        <button
          type="button"
          onClick={onRequest}
          className="text-[11px] font-bold text-marine hover:underline flex items-center gap-1"
        >
          <Send size={10} />
          Demander un changement
        </button>
      </div>
      <input
        type="text"
        value={value}
        readOnly
        disabled
        className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm bg-gris-fond text-gris-texte cursor-not-allowed"
      />
      {hint && (
        <p className="text-[10px] text-gris-doux mt-1 flex items-center gap-1">
          <Info size={10} />
          {hint}
        </p>
      )}
    </div>
  );
}