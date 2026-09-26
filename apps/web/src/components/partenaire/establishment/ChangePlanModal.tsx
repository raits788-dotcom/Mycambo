'use client';

import { useState } from 'react';
import { X, Check, Info, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SUBSCRIPTION_PLANS,
  type PlanId,
} from '@/lib/subscription-mock';

interface ChangePlanModalProps {
  currentPlanId: PlanId;
  establishmentName: string;
  onClose: () => void;
  onConfirm: (newPlanId: PlanId) => void;
}

export default function ChangePlanModal({
  currentPlanId,
  establishmentName,
  onClose,
  onConfirm,
}: ChangePlanModalProps) {
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Filtre : on ne propose pas la formule Association (réservée)
  const plans = SUBSCRIPTION_PLANS.filter((p) => p.id !== 'association');

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(selected);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {confirmed ? (
          /* ===== Confirmation ===== */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-3">
              Demande envoyée !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6 max-w-md mx-auto">
              Votre demande de changement de formule pour{' '}
              <b className="text-marine">{establishmentName}</b> a bien été
              transmise.
              <br />
              Vous recevrez une confirmation après validation par notre équipe.
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ===== Choix de la formule ===== */
          <div className="p-8">
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Changer de formule
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Formule actuelle pour{' '}
              <b className="text-marine">{establishmentName}</b> :{' '}
              <b className="text-marine">
                {SUBSCRIPTION_PLANS.find((p) => p.id === currentPlanId)?.label ||
                  'Formule'}
              </b>
            </p>

            {/* Grille des formules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan) => {
                const isSelected = selected === plan.id;
                const isCurrent = currentPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => !isCurrent && setSelected(plan.id)}
                    disabled={isCurrent}
                    className={cn(
                      'relative text-left border-2 rounded-lg p-5 transition-all',
                      isCurrent && 'opacity-60 cursor-not-allowed',
                      !isCurrent && isSelected && 'border-marine ring-1 ring-marine bg-marine/5',
                      !isCurrent && !isSelected && 'border-gris-ligne hover:border-marine/50'
                    )}
                  >
                    {plan.popular && !isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ic-or text-marine-dark text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                        Recommandé
                      </span>
                    )}

                    {isCurrent && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold bg-gris-fond text-gris-texte px-2 py-0.5 rounded-full">
                        Actuelle
                      </span>
                    )}

                    <div className="font-extrabold text-marine text-base mb-1">
                      {plan.label}
                    </div>
                    <div className="text-2xl font-extrabold text-marine mb-3">
                      {plan.price} $
                      <span className="text-xs font-normal text-gris-doux">
                        /mois
                      </span>
                    </div>

                    <ul className="text-xs text-gris-texte space-y-1.5 mb-4">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check
                            size={11}
                            className="text-green-600 flex-shrink-0 mt-0.5"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div
                      className={cn(
                        'w-full text-center font-bold py-2 rounded-full text-xs transition-colors',
                        isSelected
                          ? 'bg-marine text-white'
                          : 'bg-gris-fond text-marine'
                      )}
                    >
                      {isCurrent
                        ? 'Formule actuelle'
                        : isSelected
                        ? '✓ Sélectionnée'
                        : 'Choisir'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-2">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Le changement prendra effet après <b>validation par myCAMBO</b>{' '}
                et <b>paiement de la première facture</b>. Le prélèvement
                s&apos;effectue selon vos préférences (ABA PayWay, Wing, carte).
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-6 py-3 hover:border-marine transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selected}
                className="inline-flex items-center gap-2 bg-marine text-white font-bold rounded-full px-6 py-3 hover:bg-marine-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                Confirmer le changement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}