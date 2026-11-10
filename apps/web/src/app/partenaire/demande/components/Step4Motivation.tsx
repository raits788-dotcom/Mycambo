'use client';

import { MessageSquare } from 'lucide-react';
import type { WizardData } from '../page';
import { useWizardLang } from '../WizardLangContext';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

// Valeurs stockées en base (inchangées) ; libellés traduits à l'affichage.
const HOW_FOUND_OPTIONS = [
  'Recherche Google',
  'Réseaux sociaux',
  'Recommandation',
  'Bouche à oreille',
  'Publicité',
  'Autre',
];

export default function Step4Motivation({ data, updateData }: Props) {
  const { t } = useWizardLang();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          <MessageSquare size={18} /> {t.s5_title}
        </h2>
        <p className="text-xs text-gris-texte">
          {t.s5_subtitle}
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          {t.s5_motivation_label}
        </label>
        <textarea
          value={data.motivation}
          onChange={(e) => updateData({ motivation: e.target.value })}
          rows={6}
          placeholder={t.s5_motivation_ph}
          className="w-full px-4 py-3 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
        />
        <div className="flex justify-between text-[10px] text-gris-doux mt-1">
          <span>{t.s5_min_chars}</span>
          <span className={data.motivation.length >= 50 ? 'text-green-600' : 'text-gris-doux'}>
            {t.s5_chars(data.motivation.length)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          {t.s5_how_found_label}
        </label>
        <select
          value={data.how_found_us}
          onChange={(e) => updateData({ how_found_us: e.target.value })}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
        >
          <option value="">{t.s2_choose}</option>
          {HOW_FOUND_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{t.s5_how_found_options[opt] || opt}</option>
          ))}
        </select>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-amber-600 text-lg">💡</span>
        <p className="text-xs text-amber-800">
          <b>{t.s5_tip_label}</b>{t.s5_tip}
        </p>
      </div>
    </div>
  );
}