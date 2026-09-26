import Image from 'next/image';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Advantages from '@/components/partenaire/Advantages';
import Steps from '@/components/partenaire/Steps';
import Plans from '@/components/partenaire/Plans';
import Comparison from '@/components/partenaire/Comparison';
import FAQ from '@/components/partenaire/FAQ';
import PartnerForm from '@/components/partenaire/PartnerForm';

export const metadata: Metadata = {
  title: 'Devenir partenaire',
  description:
    "Rejoignez myCAMBO et faites découvrir votre commerce, votre savoir-faire et vos services à des milliers de voyageurs et d'habitants au Cambodge.",
};

export default function DevenirPartenairePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative h-[60vh] min-h-[440px] max-h-[620px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1659067306106-84c978b51526?q=85&w=2400&auto=format&fit=crop"
          alt="Artisanat et savoir-faire khmer"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/40" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-wrap mx-auto px-4 md:px-6 w-full">
            <div className="max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-10 bg-white/60" />
                <span className="text-xs uppercase tracking-[0.3em] text-white/80 font-bold">
                  Espace partenaires
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-6">
                Faites connaître
                <br />
                <span className="text-ic-or">votre savoir-faire.</span>
              </h1>

              <p className="text-lg text-white/90 leading-relaxed mb-8 max-w-xl">
                Hôtel, restaurant, atelier, boutique, association ou service —
                rejoignez myCAMBO et rencontrez des milliers de voyageurs et
                d&apos;habitants qui cherchent exactement ce que vous proposez.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  href="#demande"
                  size="lg"
                  className="bg-white text-marine hover:bg-white/90"
                >
                  Déposer ma demande
                </Button>
                <Button
                  href="#formules"
                  variant="ghost"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white"
                >
                  Voir les formules
                </Button>
              </div>

              <p className="text-sm text-white/60 mt-6">
                ✓ Sans engagement · Validation sous 48 h
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTIONS ===== */}
      <Advantages />
      <Steps />
      <Plans />
      <Comparison />
      <FAQ />
      <PartnerForm />
    </>
  );
}
