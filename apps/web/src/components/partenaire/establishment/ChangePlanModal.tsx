'use client';

import { useState, useEffect } from 'react';
import { X, Check, Info, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSubscriptionPlans, type SubscriptionPlan } from '@/lib/subscription';
import { createOrUpdateSubscription } from '@/lib/services';

interface ChangePlanModalProps {
  currentPlanId: string;
  establishmentName: string;
  establishmentId: string;
  tenantId: string;
  onClose: () => void;
  onConfirm: (newPlanId: string) => void;
}

export default function ChangePlanModal({
  currentPlanId,
  establishmentName,
  establishmentId,
  tenantId,
  onClose,
  onConfirm,
}: ChangePlanModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [blocking, setBlocking] = useState<any[]>([]);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getSubscriptionPlans();
      setPlans(p);
      setLoading(false);
    })();
  }, []);

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    setBlocking([]);
    setPaymentRef(null);

    try {
      const plan = plans.find((p) => p.id === selected);
      // Abonnement ANNUEL : le prix affiché est mensuel, on facture 12 mois.
      const annualAmount = (plan?.price || 0) * 12;
      const res = await createOrUpdateSubscription({
        businessId: establishmentId,
        tenantId: tenantId,
        planId: selected,
        planSlug: (plan as any)?.slug || '',
        amount: annualAmount,
      });

      // Downgrade bloqué : on affiche les dépassements à corriger.
      if (res.blocked && res.blocked.length) {
        setBlocking(res.blocked);
        return;
      }
      if (res.error) {
        alert('Erreur : ' + res.error);
        return;
      }

      // Souscription enregistrée EN ATTENTE DE PAIEMENT : on montre la référence.
      setPaymentRef(res.paymentRef || null);
      setConfirmed(true);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto" />
          </div>
        ) : confirmed ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-3">Formule changée !</h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6 max-w-md mx-auto">
              Votre demande pour <b className="text-marine">{establishmentName}</b> est enregistrée.
              Elle sera active <b>dès réception et validation de votre paiement</b> par myCAMBO.
            </p>

            <div className="bg-gris-fond rounded-xl p-5 text-left text-sm space-y-2 mb-6">
              <div className="font-bold text-marine">Paiement par virement (abonnement annuel)</div>
              <p className="text-gris-texte">
                Effectuez votre virement ABA / Wing puis indiquez la référence ci-dessous.
                Votre établissement sera mis en ligne dès validation.
              </p>
              {paymentRef && (
                <div className="bg-white border border-gris-ligne rounded-lg px-3 py-2 font-mono text-marine">
                  Référence : <b>{paymentRef}</b>
                </div>
              )}
              <p className="text-xs text-gris-doux">
                Bénéficiaire : myCAMBO · ABA 000 123 456 · Wing 012 345 678 · mentionnez la référence.
              </p>
            </div>
          </div>
        ) : blocking.length > 0 ? (
          <div className="p-8">
            <h3 className="text-2xl font-extrabold text-rouge-khmer mb-2">
              Changement impossible
            </h3>
            <p className="text-sm text-gris-texte mb-5">
              Cette formule est plus limitée que votre contenu actuel. Corrigez les points
              suivants avant de pouvoir y passer :
            </p>
            <ul className="space-y-2 mb-6">
              {blocking.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gris-texte">
                  <span className="text-rouge-khmer mt-0.5">●</span>
                  <span>{b.message}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setBlocking([])}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Retour
            </button>
          </div>
        ) : (
          <div className="p-8">
            <h3 className="text-2xl font-extrabold text-marine mb-2">Changer de formule</h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Formule actuelle pour <b className="text-marine">{establishmentName}</b> :{' '}
              <b className="text-marine">{plans.find((p) => p.id === currentPlanId || p.slug === currentPlanId)?.label || 'Formule'}</b>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan) => {
                const isSelected = selected === plan.id;
                const isCurrent = currentPlanId === plan.id || currentPlanId === plan.slug;

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

                    <div className="font-extrabold text-marine text-base mb-1">{plan.label}</div>
                    <div className="text-2xl font-extrabold text-marine mb-3">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price} $`}
                      {plan.price > 0 && <span className="text-xs font-normal text-gris-doux">/mois</span>}
                    </div>

                    <ul className="text-xs text-gris-texte space-y-1.5 mb-4">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check size={11} className="text-green-600 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className={cn(
                      'w-full text-center font-bold py-2 rounded-full text-xs transition-colors',
                      isSelected ? 'bg-marine text-white' : 'bg-gris-fond text-marine'
                    )}>
                      {isCurrent ? 'Formule actuelle' : isSelected ? '✓ Sélectionnée' : 'Choisir'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-2">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Le changement prendra effet après <b>validation par myCAMBO</b> et <b>paiement de la première facture</b>.
              </p>
            </div>

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
                disabled={!selected || confirming}
                className="inline-flex items-center gap-2 bg-marine text-white font-bold rounded-full px-6 py-3 hover:bg-marine-dark transition-colors text-sm disabled:opacity-50"
              >
                {confirming ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {confirming ? 'Enregistrement...' : 'Confirmer le changement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}