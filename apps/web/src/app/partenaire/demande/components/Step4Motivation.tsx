'use client';

import { MessageSquare } from 'lucide-react';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const HOW_FOUND_OPTIONS = [
  'Recherche Google',
  'Réseaux sociaux',
  'Recommandation',
  'Bouche à oreille',
  'Publicité',
  'Autre',
];

export default function Step4Motivation({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          <MessageSquare size={18} /> Votre motivation
        </h2>
        <p className="text-xs text-gris-texte">
          Parlez-nous de votre projet et de ce que vous attendez de MyCambo.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          Pourquoi souhaitez-vous rejoindre MyCambo ? *
        </label>
        <textarea
          value={data.motivation}
          onChange={(e) => updateData({ motivation: e.target.value })}
          rows={6}
          placeholder="Décrivez votre activité, ce qui vous distingue, et ce que vous attendez de la plateforme..."
          className="w-full px-4 py-3 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
        />
        <div className="flex justify-between text-[10px] text-gris-doux mt-1">
          <span>Minimum 50 caractères</span>
          <span className={data.motivation.length >= 50 ? 'text-green-600' : 'text-gris-doux'}>
            {data.motivation.length} caractères
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          Comment nous avez-vous connus ?
        </label>
        <select
          value={data.how_found_us}
          onChange={(e) => updateData({ how_found_us: e.target.value })}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
        >
          <option value="">— Choisir —</option>
          {HOW_FOUND_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-amber-600 text-lg">💡</span>
        <p className="text-xs text-amber-800">
          <b>Astuce :</b> un dossier complet et bien rédigé est traité plus rapidement.
          Prenez le temps de nous expliquer votre projet.
        </p>
      </div>
    </div>
  );
}