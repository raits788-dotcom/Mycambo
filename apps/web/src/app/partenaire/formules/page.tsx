import Image from 'next/image';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Plans from '@/components/partenaire/Plans';
import Comparison from '@/components/partenaire/Comparison';

export const metadata: Metadata = {
  title: 'Nos formules',
  description:
    'Découvrez les formules d\'abonnement myCAMBO pour les commerces au Cambodge : Découverte, Essentiel, Pro, Business.',
};

export default function FormulesPage() {
  return (
    <>
      {/* ===== HERO COMPACT avec image de fond ===== */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1645623981264-f58aa0c68ac0?q=85&w=2400&auto=format&fit=crop"
          alt="Temple khmer"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />

        <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-white/40" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
              Formules d&apos;abonnement
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-2 max-w-2xl">
            Choisissez la formule{' '}
            <span className="text-ic-or">qui vous ressemble.</span>
          </h1>

          <p className="text-sm text-white/80 max-w-xl leading-relaxed">
            Un abonnement par établissement. Remises automatiques dès le 2<sup>e</sup> commerce.
            Sans engagement, résiliable à tout moment.
          </p>
        </div>
      </section>

      {/* ===== PLANS (compact) ===== */}
      <Plans compact />

      {/* ===== COMPARATIF ===== */}
      <Comparison />

      {/* ===== CTA FINAL compact ===== */}
      <section className="bg-gris-fond border-t border-gris-ligne">
        <div className="max-w-wrap mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-lg md:text-xl font-extrabold text-marine mb-0.5">
                Une question sur les formules ?
              </h2>
              <p className="text-sm text-gris-texte">
                Consultez notre FAQ ou déposez directement votre demande.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
              <Button href="/partenaire/faq" variant="ghost" size="sm">
                Voir la FAQ
              </Button>
              <Button href="/partenaire/demande" size="sm">
                Déposer ma demande
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}