'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  'Entreprise',
  'Établissements',
  'Photos',
  'Motivation',
  'Vérification',
];

export default function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-marine text-white ring-4 ring-marine/20',
                    !isCompleted && !isCurrent && 'bg-gris-fond text-gris-doux'
                  )}
                >
                  {isCompleted ? <Check size={16} /> : step}
                </div>
                <div
                  className={cn(
                    'text-[10px] md:text-xs font-bold mt-2 text-center',
                    isCurrent ? 'text-marine' : 'text-gris-texte'
                  )}
                >
                  {STEP_LABELS[i]}
                </div>
              </div>

              {step < totalSteps && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 md:mx-2 transition-colors',
                    isCompleted ? 'bg-green-500' : 'bg-gris-ligne'
                  )}
                  style={{ alignSelf: 'flex-start', marginTop: '20px' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gris-texte mt-6">
        Étape <b className="text-marine">{currentStep}</b> sur {totalSteps}
      </div>
    </div>
  );
}