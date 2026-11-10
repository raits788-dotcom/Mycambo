'use client';

// ============================================================================
// /inscription — DÉSACTIVÉE (sécurité)
// ----------------------------------------------------------------------------
// Cette page créait auparavant un compte partenaire + un tenant SANS validation,
// ce qui contournait le process « aucune fiche publiée automatiquement » et
// ouvrait une faille d'accès. Un compte partenaire ne peut désormais exister
// QUE via une demande approuvée manuellement par myCAMBO.
//
// La page redirige donc vers la demande de partenariat. Le compte VISITEUR
// (favoris, avis) sera un flux dédié ultérieur, avec vérification email.
// ============================================================================

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Store, Sparkles } from 'lucide-react';

export default function InscriptionPage() {
  return (
    <div className="min-h-screen bg-gris-fond py-10 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-6"
        >
          <ArrowLeft size={14} />
          Retour à l&apos;accueil
        </Link>

        <div className="bg-white rounded-2xl border border-gris-ligne p-8 shadow-cb-md text-center">
          <div className="w-16 h-16 rounded-full bg-marine/10 text-marine flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={30} />
          </div>

          <h1 className="text-2xl font-extrabold text-marine mb-2">
            Rejoindre myCAMBO
          </h1>
          <p className="text-sm text-gris-texte mb-6 leading-relaxed">
            Pour garantir la qualité de l&apos;annuaire, chaque établissement est
            validé manuellement par notre équipe. L&apos;inscription se fait via une
            demande de partenariat.
          </p>

          <Link
            href="/partenaire/demande"
            className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark flex items-center justify-center gap-2 mb-3"
          >
            <Store size={16} />
            Faire une demande de partenariat
          </Link>

          <Link
            href="/espace-partenaire/connexion"
            className="w-full border border-gris-ligne text-marine font-bold py-3 rounded-full hover:bg-gris-fond flex items-center justify-center gap-2"
          >
            Déjà partenaire ? Se connecter
          </Link>

          <div className="mt-6 pt-6 border-t border-gris-ligne">
            <p className="text-xs text-gris-doux flex items-center justify-center gap-1.5">
              <Sparkles size={12} />
              Un compte visiteur (favoris, avis) arrive prochainement.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-center text-gris-doux mt-6">
          🔒 Validation manuelle par l&apos;équipe myCAMBO · Un email = un seul compte
        </p>
      </div>
    </div>
  );
}
