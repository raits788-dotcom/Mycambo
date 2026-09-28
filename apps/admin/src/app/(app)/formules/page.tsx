'use client';

import { useState, useEffect } from 'react';
import { Package, Check, Power, Loader2 } from 'lucide-react';
import { getPlans } from '@/lib/services';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getPlans();
      setPlans(data);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Formules d&apos;abonnement</h1>
        <p className="text-sm text-gris-texte">
          {loading ? 'Chargement...' : plans.length + ' formules · ' + plans.filter((p) => p.is_active).length + ' actives'}
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
          <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Chargement des formules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id} className={'bg-white rounded-xl border-2 p-6 ' + (plan.is_active ? 'border-gris-ligne hover:border-marine' : 'border-dashed border-gris-ligne opacity-60')}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-marine/10 text-marine flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-marine">{plan.name}</h3>
                    <div className="text-[10px] text-gris-doux font-mono">{plan.slug}</div>
                  </div>
                </div>
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ' + (plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4 pb-4 border-b border-gris-ligne">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-marine">
                    {Number(plan.price_monthly) === 0 ? 'Gratuit' : plan.price_monthly + ' $'}
                  </span>
                  {Number(plan.price_monthly) > 0 && <span className="text-xs text-gris-texte">/ mois</span>}
                </div>
                {plan.price_yearly && Number(plan.price_yearly) > 0 && (
                  <div className="text-xs text-gris-texte mt-1">
                    ou <span className="font-bold text-marine">{plan.price_yearly} $</span> / an
                  </div>
                )}
              </div>

              <div className="text-xs text-gris-texte mb-4">
                {plan.max_businesses >= 999 ? 'Établissements illimités' : plan.max_businesses + ' établissement' + (plan.max_businesses > 1 ? 's' : '')}
              </div>

              <ul className="space-y-1.5 mb-5 min-h-[120px]">
                {(plan.features || []).length === 0 ? (
                  <li className="text-xs text-gris-doux italic">Aucune fonctionnalité</li>
                ) : (plan.features || []).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gris-texte">
                    <Check size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-4 border-t border-gris-ligne">
                <button className="flex-1 text-xs font-bold py-2 rounded-lg bg-marine text-white hover:bg-marine-dark">Éditer</button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100"><Power size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}