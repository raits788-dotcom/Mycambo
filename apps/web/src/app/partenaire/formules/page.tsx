'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Sparkles, Heart, Building2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function FormulesPubliquesPage() {
  const [audience, setAudience] = useState<'business' | 'association'>('business');
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const [plansRes, versionsRes, featuresRes] = await Promise.all([
        supabase.from('plans').select('*').eq('is_active', true).order('position'),
        supabase.from('plan_versions').select('*').eq('status', 'current'),
        supabase.from('plan_features').select('*').eq('is_active', true),
      ]);

      const merged = (plansRes.data || []).map((p: any) => {
        const v = (versionsRes.data || []).find((ver: any) => ver.plan_id === p.id);
        const featureIds = v?.feature_ids || [];
        const details = (featuresRes.data || []).filter((f: any) => featureIds.includes(f.id));
        return { ...p, version: v, features_details: details };
      });

      setPlans(merged);
      setFeatures(featuresRes.data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = plans.filter((p) => (p.audience || 'business') === audience);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-b from-marine to-marine-dark text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Choisissez la formule qui booste votre activité
          </h1>
          <p className="text-sm md:text-base opacity-90">
            Toutes nos formules incluent une validation manuelle par l&apos;équipe MyCambo.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Sélecteur d'audience */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-cb-md flex">
            <button
              onClick={() => setAudience('business')}
              className={
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ' +
                (audience === 'business'
                  ? 'bg-marine text-white'
                  : 'text-gris-texte hover:text-marine')
              }
            >
              <Building2 size={14} /> Commerces
            </button>
            <button
              onClick={() => setAudience('association')}
              className={
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ' +
                (audience === 'association'
                  ? 'bg-khmer text-white'
                  : 'text-gris-texte hover:text-marine')
              }
            >
              <Heart size={14} /> Associations
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gris-texte">
            Aucune formule disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {filtered.map((plan) => {
              const isFree = Number(plan.version?.price_monthly || plan.price_monthly) === 0;
              const isPopular = plan.slug === 'pro';
              return (
                <div
                  key={plan.id}
                  className={
                    'bg-white rounded-2xl border-2 p-6 relative transition-all hover:shadow-cb-md ' +
                    (isPopular ? 'border-marine' : 'border-gris-ligne')
                  }
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-marine text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles size={10} className="inline mr-1" />
                      Populaire
                    </span>
                  )}

                  <h3 className="text-lg font-extrabold text-marine mb-2">{plan.name}</h3>

                  <div className="mb-4 pb-4 border-b border-gris-ligne">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-marine">
                        {isFree ? 'Gratuit' : `${plan.version?.price_monthly || plan.price_monthly} $`}
                      </span>
                      {!isFree && <span className="text-xs text-gris-texte">/ mois</span>}
                    </div>
                    {!isFree && plan.version?.price_yearly > 0 && (
                      <div className="text-xs text-gris-texte mt-1">
                        ou <strong className="text-marine">{plan.version.price_yearly} $</strong> / an
                        <span className="text-green-600 font-bold ml-1">
                          (-{Math.round((1 - plan.version.price_yearly / (plan.version.price_monthly * 12)) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gris-texte mb-4">
                    {plan.version?.max_businesses >= 999
                      ? 'Établissements illimités'
                      : `${plan.version?.max_businesses || plan.max_businesses} établissement${(plan.version?.max_businesses || plan.max_businesses) > 1 ? 's' : ''}`}
                  </div>

                  <ul className="space-y-1.5 mb-5 min-h-[180px]">
                    {(plan.features_details || []).slice(0, 8).map((f: any) => (
                      <li key={f.id} className="flex items-start gap-2 text-xs text-gris-texte">
                        <Check size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                        {f.label}
                      </li>
                    ))}
                    {(plan.features_details || []).length > 8 && (
                      <li className="text-xs text-gris-doux italic pl-5">
                        +{plan.features_details.length - 8} autres
                      </li>
                    )}
                  </ul>

                  <Link
                    href={
                      isFree
                        ? `/inscription?plan=${plan.id}`
                        : `/inscription?plan=${plan.id}`
                    }
                    className={
                      'block text-center text-sm font-bold py-3 rounded-full transition-colors ' +
                      (isPopular
                        ? 'bg-marine text-white hover:bg-marine-dark'
                        : isFree
                        ? 'border-2 border-marine text-marine hover:bg-marine hover:text-white'
                        : 'bg-marine text-white hover:bg-marine-dark')
                    }
                  >
                    {isFree ? 'Commencer gratuitement' : 'Choisir cette formule'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Info parrainage */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white text-center mb-12">
          <h3 className="text-xl font-extrabold mb-2">🎁 Programme de parrainage</h3>
          <p className="text-sm opacity-90 mb-4 max-w-2xl mx-auto">
            Parrainez d&apos;autres partenaires et gagnez des récompenses :
            -10% sur votre prochaine facture dès 3 filleuls, jusqu&apos;à 1 an offert avec le badge Ambassadeur Gold.
          </p>
          <Link
            href="/inscription"
            className="inline-block bg-white text-purple-700 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/90"
          >
            Créer un compte
          </Link>
        </div>

        {/* Méthodes de paiement */}
        <div className="text-center pb-12">
          <p className="text-xs text-gris-doux mb-3">Moyens de paiement acceptés</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-gris-texte bg-white border border-gris-ligne px-4 py-2 rounded-lg">
              ABA PayWay
            </span>
            <span className="text-xs font-bold text-gris-texte bg-white border border-gris-ligne px-4 py-2 rounded-lg">
              Wing
            </span>
            <span className="text-xs font-bold text-gris-texte bg-white border border-gris-ligne px-4 py-2 rounded-lg">
              Bakong / KHQR
            </span>
          </div>
        </div>
      </div>
    </>
  );
}