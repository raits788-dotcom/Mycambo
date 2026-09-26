'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ESTABLISHMENT_TYPES,
  type EstablishmentType,
} from '@/lib/establishment-wizard';

interface WizardStep1TypeProps {
  value: EstablishmentType | '';
  onChange: (type: EstablishmentType) => void;
}

export default function WizardStep1Type({
  value,
  onChange,
}: WizardStep1TypeProps) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-marine mb-1">
        Quel type d&apos;établissement ?
      </h2>
      <p className="text-xs text-gris-texte mb-6">
        Choisissez la catégorie qui correspond le mieux à votre activité.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(ESTABLISHMENT_TYPES) as EstablishmentType[]).map(
          (key) => {
            const type = ESTABLISHMENT_TYPES[key];
            const isSelected = value === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={cn(
                  'relative flex items-start gap-4 p-5 rounded-lg border-2 text-left transition-all',
                  isSelected
                    ? 'border-marine bg-marine/5 ring-1 ring-marine'
                    : 'border-gris-ligne hover:border-marine/50 hover:bg-gris-fond'
                )}
              >
                <div className="text-3xl flex-shrink-0">{type.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-marine text-sm mb-0.5">
                    {type.label}
                  </div>
                  <div className="text-xs text-gris-texte">
                    {type.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-marine text-white flex items-center justify-center">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}