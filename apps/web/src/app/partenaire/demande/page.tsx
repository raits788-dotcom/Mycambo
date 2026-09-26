import Image from 'next/image';
import type { Metadata } from 'next';
import PartnerForm from '@/components/partenaire/PartnerForm';

export const metadata: Metadata = {
  title: 'Déposer ma demande',
  description:
    'Déposez votre demande de partenariat myCAMBO. Réponse sous 48h ouvrées.',
};

const STEPS_AFTER = [
  {
    n: 1,
    title: 'Étude de votre demande',
    desc: 'Notre équipe examine votre dossier sous 48h ouvrées.',
  },
  {
    n: 2,
    title: 'Identifiants envoyés',
    desc: "Un email avec un lien d'activation vous est envoyé.",
  },
  {
    n: 3,
    title: 'Fiche en ligne',
    desc: 'Complétez votre profil et recevez vos premiers clients.',
  },
];

export default function DemandePage() {
  return (
    <>
      {/* ===== HERO COMPACT avec image de fond ===== */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1770850994573-2ac1784b345b?q=85&w=2400&auto=format&fit=crop"
          alt="Paysage khmer"
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
              Rejoignez-nous
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-2 max-w-2xl">
            Déposez votre <span className="text-ic-or">demande.</span>
          </h1>

          <p className="text-sm text-white/80 max-w-xl leading-relaxed">
            Remplissez ce formulaire — 2 minutes suffisent. Nous étudions chaque
            demande avec attention.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70 mt-4">
            <span className="flex items-center gap-1.5">
              <span className="text-ic-vert">✓</span> Sans engagement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-ic-vert">✓</span> Validation 48 h
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-ic-vert">✓</span> 100 % gratuit pour
              commencer
            </span>
          </div>
        </div>
      </section>

      {/* ===== FORMULAIRE + ÉTAPES côte à côte (desktop) ===== */}
      <section className="bg-white py-10">
        <div className="max-w-wrap mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
            {/* Formulaire à gauche */}
            <div>
              <PartnerForm compact />
            </div>

            {/* Étapes après envoi à droite */}
            <aside className="hidden lg:block">
              <div className="sticky top-[180px] bg-gris-fond rounded-lg border border-gris-ligne p-5">
                <h3 className="font-extrabold text-marine text-base mb-1">
                  Que se passe-t-il ensuite ?
                </h3>
                <p className="text-xs text-gris-texte mb-5">
                  Votre onboarding en 3 étapes.
                </p>

                <div className="space-y-4">
                  {STEPS_AFTER.map((step) => (
                    <div key={step.n} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-marine text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                        {step.n}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-marine text-sm mb-0.5">
                          {step.title}
                        </div>
                        <div className="text-xs text-gris-texte leading-relaxed">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bloc contact */}
                <div className="mt-6 pt-5 border-t border-gris-ligne">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gris-doux font-bold mb-2">
                    Besoin d&apos;aide ?
                  </div>
                  <a
                    href="mailto:partners@mycambo.app"
                    className="flex items-center gap-2 text-sm text-marine hover:text-marine-light transition-colors mb-2"
                  >
                    <i className="fas fa-envelope text-gris-doux"></i>
                    partners@mycambo.app
                  </a>
                  <a
                    href="https://wa.me/85512345678"
                    className="flex items-center gap-2 text-sm text-marine hover:text-marine-light transition-colors"
                  >
                    <i className="fab fa-whatsapp text-gris-doux"></i>
                    +855 12 345 678
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Étapes en bas sur mobile uniquement */}
          <div className="lg:hidden mt-10 pt-8 border-t border-gris-ligne">
            <h3 className="font-extrabold text-marine text-base mb-4 text-center">
              Que se passe-t-il ensuite ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS_AFTER.map((step) => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-marine text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <div className="font-bold text-marine text-sm mb-0.5">
                      {step.title}
                    </div>
                    <div className="text-xs text-gris-texte leading-relaxed">
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
