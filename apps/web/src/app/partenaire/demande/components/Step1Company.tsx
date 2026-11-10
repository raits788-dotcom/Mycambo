'use client';

import { Building2, Mail, Phone, AlertCircle, CheckCircle2, Heart, Handshake, ShoppingBag, User, Landmark, GraduationCap } from 'lucide-react';
import type { WizardData } from '../page';
import { useWizardLang } from '../WizardLangContext';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

// ─── Types de structure ───────────────────────────────────────────────────
// id + icône + logique de registration ; libellés/descriptions via i18n (t.s1_types).
const STRUCTURE_TYPES = [
  { id: 'company', icon: Building2, requiresRegistration: true, registrationAuthority: 'MoC (Ministère du Commerce)' },
  { id: 'ngo', icon: Heart, requiresRegistration: true, registrationAuthority: 'MoI (Ministère de l\'Intérieur)' },
  { id: 'association', icon: Handshake, requiresRegistration: false, registrationAuthority: null },
  { id: 'commercial', icon: ShoppingBag, requiresRegistration: false, registrationAuthority: null },
  { id: 'individual', icon: User, requiresRegistration: false, registrationAuthority: null },
  { id: 'public', icon: Landmark, requiresRegistration: false, registrationAuthority: null },
  { id: 'school', icon: GraduationCap, requiresRegistration: false, registrationAuthority: null },
] as const;

export default function Step1Company({ data, updateData }: Props) {
  const { t } = useWizardLang();
  const selectedStructure = STRUCTURE_TYPES.find((s) => s.id === data.structure_type);
  const requiresRegistration = selectedStructure?.requiresRegistration ?? false;
  const selectedTypeLabel = selectedStructure
    ? t.s1_types[selectedStructure.id as keyof typeof t.s1_types].label
    : '';

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
          <Building2 size={18} /> {t.s1_title}
        </h2>
        <p className="text-xs text-gris-texte">
          {t.s1_subtitle}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 1 — Type de structure (PREMIER CHAMP)
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          {t.s1_type_label}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STRUCTURE_TYPES.map((s) => {
            const Icon = s.icon;
            const isSelected = data.structure_type === s.id;
            const typeT = t.s1_types[s.id as keyof typeof t.s1_types];
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
                      {typeT.label}
                    </span>
                    {isSelected && <CheckCircle2 size={12} className="text-marine" />}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-0.5">{typeT.description}</div>
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
                <b>{t.s1_reg_required_1}</b>{t.s1_reg_required_2(selectedTypeLabel.toLowerCase(), selectedStructure?.registrationAuthority || '')}
              </span>
            ) : (
              <span className="text-amber-800">
                <b>{t.s1_reg_reinforced_1}</b> {t.s1_reg_reinforced_2}<b>{t.s1_reg_reinforced_id}</b>{t.s1_reg_reinforced_mid}<b>{t.s1_reg_reinforced_photos}</b>{t.s1_reg_reinforced_end}
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
              {t.s1_legal_name_label}
            </label>
            <input
              type="text"
              value={data.legal_name}
              onChange={(e) => updateData({ legal_name: e.target.value })}
              placeholder={t.s1_legal_name_ph}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
            <p className="text-[10px] text-gris-doux mt-1">
              {t.s1_legal_name_help}
            </p>
          </div>

          {/* Champ N° enregistrement — affiché UNIQUEMENT si requis */}
          {requiresRegistration && (
            <>
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  {t.s1_authority_label}
                </label>
                <input
                  type="text"
                  value={data.registration_authority || ''}
                  onChange={(e) => updateData({ registration_authority: e.target.value })}
                  placeholder={t.s1_authority_ph}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  {t.s1_reg_number_label}
                </label>
                <input
                  type="text"
                  value={data.registration_number}
                  onChange={(e) => updateData({ registration_number: e.target.value })}
                  placeholder={t.s1_reg_number_ph}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
                />
              </div>
            </>
          )}

          {/* Si PAS requis, on garde le champ optionnel */}
          {!requiresRegistration && data.structure_type && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                {t.s1_reg_number_opt_label}
              </label>
              <input
                type="text"
                value={data.registration_number}
                onChange={(e) => updateData({ registration_number: e.target.value })}
                placeholder={t.s1_reg_number_opt_ph}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              {t.s1_rep_label}
            </label>
            <input
              type="text"
              value={data.legal_representative_name}
              onChange={(e) => updateData({ legal_representative_name: e.target.value })}
              placeholder={t.s1_rep_ph}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              {t.s1_rep_phone_label}
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="tel"
                value={data.legal_representative_phone}
                onChange={(e) => updateData({ legal_representative_phone: e.target.value })}
                placeholder={t.s1_rep_phone_ph}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              {t.s1_email_label}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder={t.s1_email_ph}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              {t.s1_phone_label}
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
                placeholder={t.s1_phone_ph}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gris-ligne">
        <p className="text-xs text-gris-texte">
          <b className="text-marine">{t.s1_next_hint_label}</b>{t.s1_next_hint}
        </p>
      </div>
    </div>
  );
}