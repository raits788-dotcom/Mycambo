'use client';

import { useState } from 'react';
import { HandHeart, Loader2 } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface Props {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type Option = { type: string; enabled: boolean; description?: string; url?: string };

// Les façons de soutenir possibles, avec leur présentation.
const SUPPORT_TYPES: {
  type: string;
  label: string;
  emoji: string;
  hint: string;
  group: 'essentiel' | 'specifique';
  hasUrl?: boolean;
  hasDescription?: boolean;
}[] = [
  // Soutiens essentiels — pertinents pour toute association (pré-activés).
  { type: 'don', label: 'Faire un don', emoji: '❤️', group: 'essentiel', hint: 'Promesse de don ponctuel ou mensuel (mise en relation).' },
  { type: 'benevolat', label: 'Devenir bénévole', emoji: '🙋', group: 'essentiel', hint: 'Recevoir des candidatures de bénévoles.' },
  { type: 'adhesion', label: 'Adhérer', emoji: '🎟️', group: 'essentiel', hint: 'Devenir membre de l’association.', hasUrl: true },
  // Soutiens spécifiques — selon l'association (à activer si concerné).
  { type: 'parrainage', label: 'Parrainer un enfant', emoji: '👶', group: 'specifique', hint: 'Soutien régulier d’un enfant.', hasDescription: true },
  { type: 'mecenat', label: 'Mécénat entreprise', emoji: '🏢', group: 'specifique', hint: 'Partenariat d’entreprise, défiscalisation.', hasDescription: true },
  { type: 'boutique', label: 'Boutique solidaire', emoji: '🛍️', group: 'specifique', hint: 'Produits vendus au profit de l’association.', hasUrl: true },
];

const ESSENTIELS_DEFAUT = ['don', 'benevolat', 'adhesion'];

export default function SupportEditor({ establishment, onUpdate }: Props) {
  const initial: Option[] = Array.isArray((establishment as any).support_options)
    ? ((establishment as any).support_options as Option[])
    : [];
  // Si la fiche n'a jamais été configurée, on pré-active les essentiels.
  const jamaisConfigure = initial.length === 0;

  const [opts, setOpts] = useState<Record<string, Option>>(() => {
    const map: Record<string, Option> = {};
    SUPPORT_TYPES.forEach((t) => {
      const found = initial.find((o) => o.type === t.type);
      map[t.type] = found || {
        type: t.type,
        enabled: jamaisConfigure && ESSENTIELS_DEFAUT.includes(t.type),
      };
    });
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (type: string) =>
    setOpts((p) => ({ ...p, [type]: { ...p[type], enabled: !p[type].enabled } }));
  const setField = (type: string, field: 'description' | 'url', v: string) =>
    setOpts((p) => ({ ...p, [type]: { ...p[type], [field]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = Object.values(opts).map((o) => ({
        type: o.type,
        enabled: o.enabled,
        ...(o.description ? { description: o.description } : {}),
        ...(o.url ? { url: o.url } : {}),
      }));
      await updateEstablishment(establishment.id, {
        // @ts-ignore — colonne jsonb support_options
        support_options: clean,
      });
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Erreur lors de l'enregistrement : " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <HandHeart size={18} className="text-marine" />
        <h2 className="font-extrabold text-marine text-base">Nous soutenir</h2>
      </div>
      <p className="text-xs text-gris-texte mb-4">
        Activez les façons d&apos;aider votre association. Elles apparaîtront dans
        l&apos;onglet « Nous soutenir » de votre fiche publique.
      </p>

      {(['essentiel', 'specifique'] as const).map((grp) => (
        <div key={grp} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-marine">
              {grp === 'essentiel' ? 'Soutiens essentiels' : 'Soutiens spécifiques'}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                grp === 'essentiel'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {grp === 'essentiel' ? 'recommandés' : 'si concerné'}
            </span>
          </div>

          <div className="space-y-2.5">
            {SUPPORT_TYPES.filter((t) => t.group === grp).map((t) => {
              const o = opts[t.type];
              return (
                <div
                  key={t.type}
                  className={`border-2 rounded-xl p-4 transition-colors ${
                    o.enabled ? 'border-marine bg-marine/5' : 'border-gris-ligne'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={o.enabled}
                      onChange={() => toggle(t.type)}
                      className="w-4 h-4 accent-marine mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-marine text-sm">
                        {t.emoji} {t.label}
                      </div>
                      <div className="text-xs text-gris-texte">{t.hint}</div>
                    </div>
                  </label>

                  {o.enabled && (t.hasUrl || t.hasDescription) && (
                    <div className="mt-3 pl-7 space-y-2">
                      {t.hasDescription && (
                        <textarea
                          value={o.description || ''}
                          onChange={(e) => setField(t.type, 'description', e.target.value)}
                          placeholder="Précisions (optionnel) : montant, conditions…"
                          rows={2}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none resize-none"
                        />
                      )}
                      {t.hasUrl && (
                        <input
                          value={o.url || ''}
                          onChange={(e) => setField(t.type, 'url', e.target.value)}
                          placeholder="Lien (optionnel) : page d'adhésion, boutique…"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Rappel projets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 mb-2">
        <i className="fas fa-bullseye text-marine mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Vos <strong>projets</strong> se gèrent dans l&apos;onglet « Nos projets ».
          Ils apparaissent automatiquement sur votre fiche dès que vous en créez un.
        </p>
      </div>

      <div className="pt-4 mt-4 flex justify-end border-t border-gris-ligne">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Enregistrement…
            </>
          ) : saved ? (
            <>
              <i className="fas fa-check" /> Enregistré
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
