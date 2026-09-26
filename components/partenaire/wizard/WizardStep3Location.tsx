'use client';

import { MapPin, Locate } from 'lucide-react';
import type { WizardData } from '@/lib/establishment-wizard';

interface WizardStep3LocationProps {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function WizardStep3Location({
  data,
  onChange,
}: WizardStep3LocationProps) {
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas disponible sur votre navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
      },
      () => {
        alert('Impossible d\'obtenir votre position.');
      }
    );
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-marine mb-1">Localisation</h2>
      <p className="text-xs text-gris-texte mb-6">
        Où se trouve votre établissement ?
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
            Adresse *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Ex : Putsor, Takeo"
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
              Ville *
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Ex : Takeo"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
              Province
            </label>
            <input
              type="text"
              value={data.province}
              onChange={(e) => onChange({ province: e.target.value })}
              placeholder="Ex : Takeo"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-black uppercase tracking-wider">
              Coordonnées GPS (optionnel)
            </label>
            <button
              type="button"
              onClick={handleGeolocate}
              className="text-[11px] font-bold text-marine hover:underline flex items-center gap-1.5"
            >
              <Locate size={12} />
              Utiliser ma position
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={data.latitude}
              onChange={(e) => onChange({ latitude: e.target.value })}
              placeholder="Latitude"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={data.longitude}
              onChange={(e) => onChange({ longitude: e.target.value })}
              placeholder="Longitude"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-2">
          <MapPin size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Plus tard, vous pourrez ajouter une carte interactive sur votre fiche.
          </p>
        </div>
      </div>
    </div>
  );
}