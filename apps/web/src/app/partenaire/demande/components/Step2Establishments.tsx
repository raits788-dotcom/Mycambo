'use client';

import { Plus, Trash2, MapPin } from 'lucide-react';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export default function Step2Establishments({ data, updateData }: Props) {
  const MAX_ESTABLISHMENTS = 3;

  const addEstablishment = () => {
    if (data.establishments.length >= MAX_ESTABLISHMENTS) return;
    updateData({
      establishments: [
        ...data.establishments,
        { name: '', address: '', city: data.city || '' },
      ],
    });
  };

  const removeEstablishment = (index: number) => {
    if (data.establishments.length === 1) return;
    updateData({
      establishments: data.establishments.filter((_, i) => i !== index),
    });
  };

  const updateEstablishment = (
    index: number,
    field: 'name' | 'address' | 'city',
    value: string
  ) => {
    const updated = [...data.establishments];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ establishments: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          🏢 Vos établissements
        </h2>
        <p className="text-xs text-gris-texte">
          Déclarez vos établissements (max 3). Vous pourrez en ajouter d&apos;autres plus tard depuis votre espace.
        </p>
      </div>

      <div className="space-y-4">
        {data.establishments.map((est, index) => (
          <div
            key={index}
            className="bg-gris-fond rounded-lg p-4 border border-gris-ligne"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-marine uppercase tracking-wider">
                Établissement #{index + 1}
              </span>
              {data.establishments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEstablishment(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={est.name}
                  onChange={(e) => updateEstablishment(index, 'name', e.target.value)}
                  placeholder="Ex : Le Bistro Khmer — Daun Penh"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={est.address}
                  onChange={(e) => updateEstablishment(index, 'address', e.target.value)}
                  placeholder="12 Street 240, Daun Penh"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
                  Ville *
                </label>
                <div className="relative">
                  <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                  <input
                    type="text"
                    value={est.city}
                    onChange={(e) => updateEstablishment(index, 'city', e.target.value)}
                    placeholder="Phnom Penh"
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.establishments.length < MAX_ESTABLISHMENTS && (
        <button
          type="button"
          onClick={addEstablishment}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold border-2 border-dashed border-gris-ligne text-marine py-3 rounded-lg hover:border-marine hover:bg-marine/5 transition-all"
        >
          <Plus size={16} />
          Ajouter un établissement ({data.establishments.length}/{MAX_ESTABLISHMENTS})
        </button>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-blue-600 text-lg">💡</span>
        <p className="text-xs text-blue-800">
          Vous pourrez ajouter d&apos;autres établissements depuis votre espace
          partenaire après validation de votre compte. Chaque établissement
          supplémentaire peut bénéficier d&apos;une formule d&apos;abonnement.
        </p>
      </div>
    </div>
  );
}