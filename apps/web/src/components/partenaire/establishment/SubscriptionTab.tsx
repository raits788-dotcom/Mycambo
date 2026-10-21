'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, CreditCard, Gift, Check, AlertCircle, ArrowUp, FileText, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import {
  getSubscription,
  getDaysRemaining,
  getPlanById,
  SUBSCRIPTION_STATUS_CONFIG,
  type Subscription,
  type SubscriptionPlan,
} from '@/lib/subscription';
import ChangePlanModal from './ChangePlanModal';

interface SubscriptionTabProps {
  establishment: StoredEstablishment;
}

export default function SubscriptionTab({ establishment }: SubscriptionTabProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeModal, setShowChangeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const sub = await getSubscription(establishment.slug);
      setSubscription(sub);
      if (sub?.planId) {
        const p = await getPlanById(sub.planId);
        setPlan(p);
      }
      setLoading(false);
    })();
  }, [establishment.slug]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12 bg-gris-fond rounded-lg">
        <CreditCard size={40} className="text-gris-ligne mx-auto mb-3" />
        <p className="text-sm text-gris-texte mb-4">
          Aucun abonnement actif pour cet établissement.
        </p>
        <button
          onClick={() => setShowChangeModal(true)}
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-xs"
        >
          Voir les formules
        </button>

        {showChangeModal && (
          <ChangePlanModal
            currentPlanId=""
            establishmentName={establishment.name}
            onClose={() => setShowChangeModal(false)}
            onConfirm={() => setShowChangeModal(false)}
          />
        )}
      </div>
    );
  }

  const statusConfig = SUBSCRIPTION_STATUS_CONFIG[subscription.status as keyof typeof SUBSCRIPTION_STATUS_CONFIG] || SUBSCRIPTION_STATUS_CONFIG.active;
  const daysRemaining = getDaysRemaining(subscription.endsAt);
  const isFree = !plan || plan.price === 0;
  const planLabel = plan?.label || 'Découverte';
  const planPrice = plan?.price || 0;

  return (
    <>
      <div className="bg-gradient-to-br from-marine to-marine-light rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2">
              Formule actuelle
            </div>
            <div className="text-3xl font-extrabold mb-2">
              {planLabel}
            </div>
            <div className="text-2xl font-bold text-ic-or">
              {isFree ? 'Gratuit' : `${planPrice} $ / mois`}
            </div>
          </div>
          <span className={cn('text-[10px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5', statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gris-fond rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={15} className="text-marine" />
            <div className="text-xs font-bold text-marine uppercase tracking-wider">
              Période d&apos;abonnement
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gris-texte">Début</span>
              <b className="text-marine">
                {new Date(subscription.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Fin</span>
              <b className="text-marine">
                {new Date(subscription.endsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Jours restants</span>
              <b className={daysRemaining > 30 ? 'text-green-600' : 'text-orange-600'}>
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Renouvellement</span>
              <b className="text-marine">{subscription.autoRenew ? 'Automatique' : 'Manuel'}</b>
            </div>
          </div>
        </div>

        <div className="bg-gris-fond rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-marine" />
            <div className="text-xs font-bold text-marine uppercase tracking-wider">
              Prochaine facturation
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gris-texte">Montant</span>
              <b className="text-marine">{isFree ? 'Gratuit' : `${planPrice} $`}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Date</span>
              <b className="text-marine">
                {isFree ? '—' : subscription.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString('fr-FR')
                  : '—'}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-gris-texte">Moyen</span>
              <b className="text-marine">{subscription.paymentMethod || '—'}</b>
            </div>
          </div>
        </div>
      </div>

      {plan && plan.features.length > 0 && (
        <div className="bg-gris-fond rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={15} className="text-marine" />
            <div className="text-xs font-bold text-marine uppercase tracking-wider">
              Services inclus
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gris-texte">
                <Check size={14} className="text-green-600 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {isFree && plan?.audience === 'association' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <b>Votre établissement est une association.</b> Il bénéficie d&apos;un référencement gratuit à vie sur myCAMBO. Aucune facturation ne sera appliquée.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gris-ligne">
        <button
          onClick={() => setShowChangeModal(true)}
          className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-3 rounded-full hover:bg-marine-dark transition-colors"
        >
          <ArrowUp size={14} />
          {isFree ? 'Choisir une formule' : 'Changer de formule'}
        </button>

        <button
          onClick={() => alert('Fonctionnalité à venir : historique des factures')}
          className="inline-flex items-center gap-2 text-xs font-bold border border-gris-ligne text-marine px-5 py-3 rounded-full hover:border-marine transition-colors"
        >
          <FileText size={14} />
          Voir les factures
        </button>
      </div>

      {showChangeModal && (
        <ChangePlanModal
          currentPlanId={subscription.planId}
          establishmentName={establishment.name}
          onClose={() => setShowChangeModal(false)}
          onConfirm={() => setShowChangeModal(false)}
        />
      )}
    </>
  );
}