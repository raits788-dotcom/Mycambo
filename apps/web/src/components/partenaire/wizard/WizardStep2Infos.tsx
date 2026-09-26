'use client';

import {
  ESTABLISHMENT_TYPES,
  type EstablishmentType,
  type WizardData,
} from '@/lib/establishment-wizard';

interface WizardStep2InfosProps {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function WizardStep2Infos({
  data,
  onChange,
}: WizardStep2InfosProps) {
  const categories =
    data.type && data.type !== ''
      ? ESTABLISHMENT_TYPES[data.type as EstablishmentType].categories
      : [];

  return (
    <div>
      <h2 className="text-xl font-extrabold text-marine mb-1">
        Informations générales
      </h2>
      <p className="text-xs text-gris-texte mb-6">
        Ces informations apparaîtront sur votre fiche publique.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
            Nom de l&apos;établissement *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex : Green Umbrella"
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
              Catégorie *
            </label>
            <select
              value={data.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            >
              <option value="">— Choisir —</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
              Année de création
            </label>
            <input
              type="text"
              value={data.foundedYear}
              onChange={(e) => onChange({ foundedYear: e.target.value })}
              placeholder="Ex : 2012"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
            Description courte *
          </label>
          <input
            type="text"
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            placeholder="Une phrase qui résume votre établissement"
            maxLength={160}
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
          />
          <div className="text-[10px] text-gris-doux mt-1 text-right">
            {data.shortDescription.length}/160
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
            Description détaillée
          </label>
          <textarea
            value={data.longDescription}
            onChange={(e) => onChange({ longDescription: e.target.value })}
            placeholder="Présentez votre établissement, son histoire, sa mission..."
            rows={5}
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
            Site web
          </label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="www.exemple.com"
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}