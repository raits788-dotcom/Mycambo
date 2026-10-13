'use client';

import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, AlertCircle, CheckCircle2, Heart, Handshake, ShoppingBag, User, Landmark, GraduationCap } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

// ─── Types de structure ───────────────────────────────────────────────────
const STRUCTURE_TYPES = [
  {
    id: 'company',
    label: 'Entreprise enregistrée',
    icon: Building2,
    description: 'Société avec enregistrement MoC',
    requiresRegistration: true,
    registrationAuthority: 'MoC (Ministère du Commerce)',
  },
  {
    id: 'ngo',
    label: 'ONG',
    icon: Heart,
    description: 'Organisation non gouvernementale',
    requiresRegistration: true,
    registrationAuthority: 'MoI (Ministère de l\'Intérieur)',
  },
  {
    id: 'association',
    label: 'Association',
    icon: Handshake,
    description: 'Association locale ou communautaire',
    requiresRegistration: false,
    registrationAuthority: null,
  },
  {
    id: 'commercial',
    label: 'Activité commerciale',
    icon: ShoppingBag,
    description: 'Petit commerce, boutique, restaurant familial',
    requiresRegistration: false,
    registrationAuthority: null,
  },
  {
    id: 'individual',
    label: 'Activité individuelle',
    icon: User,
    description: 'Freelance, artisan, guide',
    requiresRegistration: false,
    registrationAuthority: null,
  },
  {
    id: 'public',
    label: 'Établissement public',
    icon: Landmark,
    description: 'Administration, service public',
    requiresRegistration: false,
    registrationAuthority: null,
  },
  {
    id: 'school',
    label: 'Établissement scolaire',
    icon: GraduationCap,
    description: 'École, centre de formation',
    requiresRegistration: false,
    registrationAuthority: null,
  },
] as const;

export default function Step1Company({ data, updateData }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const selectedStructure = STRUCTURE_TYPES.find((s) => s.id === data.structure_type);
  const requiresRegistration = selectedStructure?.requiresRegistration ?? false;

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('position');
      setCategories(cats || []);
      setLoadingCats(false);
    })();
  }, []);

  // ─── Sélection du type de structure ─────────────────────────────────────
  const handleStructureChange = (structureId: string) => {
    const structure = STRUCTURE_TYPES.find((s) => s.id === structureId);
    updateData({
      structure_type: structureId,
      registration_authority: structure?.registrationAuthority || '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          <Building2 size={18} /> Votre structure
        </h2>
        <p className="text-xs text-gris-texte">
          Commençons par identifier votre type de structure.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 1 — Type de structure (PREMIER CHAMP)
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          Type de structure *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STRUCTURE_TYPES.map((s) => {
            const Icon = s.icon;
            const isSelected = data.structure_type === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStructureChange(s.id)}
                className={
                  'text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 ' +
                  (isSelected
                    ? 'border-marine bg-marine/5'
                    : 'border-gris-ligne hover:border-marine/50 hover:bg-gris-fond')
                }
              >
                <div
                  className={
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ' +
                    (isSelected ? 'bg-marine text-white' : 'bg-gris-fond text-marine')
                  }
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={'font-bold text-sm ' + (isSelected ? 'text-marine' : 'text-gris-texte')}>
                      {s.label}
                    </span>
                    {isSelected && <CheckCircle2 size={12} className="text-marine" />}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-0.5">{s.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 2 — Info sur la vérification selon le type
          ═══════════════════════════════════════════════════════════ */}
      {data.structure_type && (
        <div className={
          'rounded-lg p-3 flex items-start gap-2 ' +
          (requiresRegistration
            ? 'bg-red-50 border border-red-200'
            : 'bg-amber-50 border border-amber-200')
        }>
          <AlertCircle size={14} className={requiresRegistration ? 'text-red-600' : 'text-amber-600'} />
          <div className="text-xs">
            {requiresRegistration ? (
              <span className="text-red-800">
                <b>N° d&apos;enregistrement obligatoire.</b> En tant que {selectedStructure?.label.toLowerCase()},
                vous devez fournir votre numéro délivré par {selectedStructure?.registrationAuthority}.
              </span>
            ) : (
              <span className="text-amber-800">
                <b>Vérification renforcée.</b> Ce type de structure ne nécessite pas de N° d&apos;enregistrement.
                Une <b>pièce d&apos;identité</b> et des <b>photos de l&apos;activité</b> seront demandées pour validation.
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 3 — Informations générales
          ═══════════════════════════════════════════════════════════ */}
      <div className="pt-4 border-t border-gris-ligne space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Nom commercial / Raison sociale *
            </label>
            <input
              type="text"
              value={data.legal_name}
              onChange={(e) => updateData({ legal_name: e.target.value })}
              placeholder="Ex : Bistro Khmer Co., Ltd"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>

          {/* Champ N° enregistrement — affiché UNIQUEMENT si requis */}
          {requiresRegistration && (
            <>
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  Autorité d&apos;enregistrement *
                </label>
                <input
                  type="text"
                  value={data.registration_authority || ''}
                  onChange={(e) => updateData({ registration_authority: e.target.value })}
                  placeholder="Ex : MoC"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  N° d&apos;enregistrement *
                </label>
                <input
                  type="text"
                  value={data.registration_number}
                  onChange={(e) => updateData({ registration_number: e.target.value })}
                  placeholder="MOC-2024-XXXX"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
                />
              </div>
            </>
          )}

          {/* Si PAS requis, on garde le champ optionnel */}
          {!requiresRegistration && data.structure_type && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                N° d&apos;enregistrement (optionnel)
              </label>
              <input
                type="text"
                value={data.registration_number}
                onChange={(e) => updateData({ registration_number: e.target.value })}
                placeholder="Si vous en avez un, sinon laissez vide"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Représentant légal *
            </label>
            <input
              type="text"
              value={data.legal_representative_name}
              onChange={(e) => updateData({ legal_representative_name: e.target.value })}
              placeholder="Nom complet"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Téléphone du représentant *
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="tel"
                value={data.legal_representative_phone}
                onChange={(e) => updateData({ legal_representative_phone: e.target.value })}
                placeholder="+855 12 345 678"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="contact@exemple.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Catégorie *
            </label>
            <select
              value={data.category}
              onChange={(e) => updateData({ category: e.target.value })}
              disabled={loadingCats}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            >
              <option value="">— Choisir une catégorie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Ville *
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="text"
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
                placeholder="Phnom Penh"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 4 — Présence en ligne
          ═══════════════════════════════════════════════════════════ */}
      <div className="pt-4 border-t border-gris-ligne">
        <h3 className="font-bold text-marine text-sm mb-3 flex items-center gap-2">
          <Globe size={14} /> Présence en ligne (optionnel)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Site web
            </label>
            <input
              type="url"
              value={data.website_url}
              onChange={(e) => updateData({ website_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Facebook
            </label>
            <input
              type="url"
              value={data.facebook_url}
              onChange={(e) => updateData({ facebook_url: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Google Maps
            </label>
            <input
              type="url"
              value={data.google_maps_url}
              onChange={(e) => updateData({ google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}