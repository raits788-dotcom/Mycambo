'use client';

import Link from 'next/link';
import { Lock, CreditCard, ArrowRight, Check, Sparkles } from 'lucide-react';

export function SubscriptionGate() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-marine to-marine-dark text-white p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Choisissez une formule pour continuer
          </h1>
          <p className="text-sm text-white/80 max-w-md mx-auto">
            Votre compte est créé ! Pour publier vos établissements et accéder à toutes les fonctionnalités,
            choisissez une formule d&apos;abonnement.
          </p>
        </div>

        {/* Contenu */}
        <div className="p-8">

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <b>Vous pouvez commencer gratuitement</b> avec la formule Découverte.
                Vous pourrez passer à une formule supérieure à tout moment.
              </div>
            </div>
          </div>

          {/* Ce que ça débloque */}
          <div className="mb-6">
            <h3 className="font-bold text-marine text-sm mb-3">
              Ce que vous débloquez avec une formule :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Création de vos établissements',
                'Photos et description complète',
                'Visibilité dans l\'annuaire public',
                'Gestion de votre équipe',
                'Statistiques de vues',
                'Gestion des avis clients',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gris-texte">
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gris-fond rounded-lg p-5 text-center">
            <div className="text-xs text-gris-texte mb-4">
              Prêt à démarrer ? Choisissez la formule qui correspond à votre activité.
            </div>
            <Link
              href="/partenaire/formules"
              className="inline-flex items-center gap-2 bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              <CreditCard size={14} />
              Voir les formules
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}