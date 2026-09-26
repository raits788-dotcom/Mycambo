import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Infos pratiques Cambodge',
  description:
    "Quand venir, visa, monnaie, santé, sécurité, internet — tout ce qu'il faut savoir avant de partir au Cambodge.",
};

const PRATIQUE = [
  {
    icon: '🌤️',
    title: 'Quand venir',
    desc: 'Saisons, météo, meilleure période.',
    color: 'bg-ic-orange',
  },
  {
    icon: '📘',
    title: 'Visa',
    desc: "e-visa, à l'arrivée, extension.",
    color: 'bg-ic-bleu',
  },
  {
    icon: '💵',
    title: 'Monnaie',
    desc: 'USD + Riel (KHR), taux, retraits.',
    color: 'bg-ic-vert',
  },
  {
    icon: '🏥',
    title: 'Santé',
    desc: 'Hôpitaux, vaccins, urgences.',
    color: 'bg-ic-rose',
  },
  {
    icon: '🛡️',
    title: 'Sécurité',
    desc: 'Conseils, numéros utiles.',
    color: 'bg-ic-violet',
  },
  {
    icon: '📱',
    title: 'Internet & SIM',
    desc: 'Opérateurs, couverture, wifi.',
    color: 'bg-ic-cyan',
  },
];

export default function PratiquePage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=85&w=2400&auto=format&fit=crop"
        alt="Temple Cambodge"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />

      <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
                Pratique
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Bien préparer
              <br />
              <span className="text-ic-or">son voyage.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Quand venir, visa, monnaie, santé, sécurité — tout ce qu&apos;il
              faut savoir avant de partir au Cambodge.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Infos à jour
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Conseils locaux
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Infos essentielles
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRATIQUE.map((p) => (
                <div
                  key={p.title}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${p.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      <span>{p.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5">
                        {p.title}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
