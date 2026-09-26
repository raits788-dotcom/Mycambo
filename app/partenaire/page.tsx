import Image from 'next/image';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { PARTNER_ADVANTAGES, PARTNER_STEPS } from '@/lib/partner-data';

export const metadata: Metadata = {
  title: 'Devenir partenaire',
  description:
    "Rejoignez myCAMBO et faites découvrir votre commerce, votre savoir-faire et vos services à des milliers de voyageurs et d'habitants au Cambodge.",
};

export default function PartnerHomePage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      {/* ===== Image de fond ===== */}
      <Image
        src="https://images.unsplash.com/photo-1653959864991-c828b72c82a8?q=85&w=2400&auto=format&fit=crop"
        alt="Artisanat et savoir-faire khmer"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* ===== Overlay bleu marine dégradé ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />

      {/* ===== Contenu 2 colonnes ===== */}
      <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ===== Colonne gauche : Pitch ===== */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
                Espace partenaires
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Faites connaître
              <br />
              <span className="text-ic-or">votre savoir-faire.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Hôtel, restaurant, atelier, boutique, association ou service —
              rejoignez myCAMBO et rencontrez des milliers de voyageurs et
              d&apos;habitants.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                href="/partenaire/demande"
                size="md"
                className="bg-white text-marine hover:bg-white/90"
              >
                Déposer ma demande
              </Button>
              <Button
                href="/partenaire/formules"
                variant="ghost"
                size="md"
                className="border-white/40 text-white hover:bg-white/10 hover:border-white"
              >
                Voir les formules
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Sans engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Validation 48 h
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Support dédié
              </span>
            </div>
          </div>

          {/* ===== Colonne droite : Avantages + Étapes ===== */}
          <div className="space-y-6">
            {/* Avantages 2x2 */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
                Ce que vous apporte myCAMBO
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PARTNER_ADVANTAGES.map((adv, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-4 hover:bg-white/15 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-md ${adv.color} flex items-center justify-center text-white text-sm mb-2.5`}
                    >
                      <i className={`fas ${adv.icon}`}></i>
                    </div>
                    <h3 className="font-extrabold text-white text-sm mb-1">
                      {adv.title}
                    </h3>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      {adv.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Étapes en ligne */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
                En ligne en 3 étapes
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PARTNER_STEPS.map((step) => (
                  <div
                    key={step.number}
                    className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3 text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-ic-or text-marine-dark flex items-center justify-center font-extrabold text-xs mx-auto mb-2">
                      {step.number}
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">
                      {step.title.replace('Déposez votre ', '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
