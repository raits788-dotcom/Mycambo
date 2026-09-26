import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gastronomie khmère',
  description:
    'Amok, Lok Lak, Kuy Teav, poivre de Kampot… Découvrez la cuisine khmère et où la déguster.',
};

const PLATS = [
  {
    icon: '🥘',
    title: 'Amok',
    desc: 'Curry khmère à la noix de coco.',
    color: 'bg-ic-orange',
  },
  {
    icon: '🥩',
    title: 'Lok Lak',
    desc: 'Bœuf sauté, sauce poivre citron.',
    color: 'bg-ic-rose',
  },
  {
    icon: '🍜',
    title: 'Kuy Teav',
    desc: 'Soupe de nouilles du matin.',
    color: 'bg-ic-bleu',
  },
  {
    icon: '🍚',
    title: 'Bai Sach Chrouk',
    desc: 'Porc grillé sur riz, petit-déj.',
    color: 'bg-ic-violet',
  },
  {
    icon: '🐟',
    title: 'Prahok',
    desc: 'Pâte de poisson fermentée.',
    color: 'bg-ic-cyan',
  },
  {
    icon: '🌶️',
    title: 'Poivre de Kampot',
    desc: "L'or noir du Cambodge.",
    color: 'bg-ic-vert',
  },
];

export default function GastronomiePage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1559314809-0d155014e29e?q=85&w=2400&auto=format&fit=crop"
        alt="Cuisine khmère"
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
                Gastronomie
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Saveurs
              <br />
              <span className="text-ic-or">khmères.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Amok, Lok Lak, Kuy Teav — la cuisine cambodgienne marie épices,
              herbes fraîches et produits du Mékong.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Recettes authentiques
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Adresses locales
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Plats emblématiques
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATS.map((p) => (
                <Link
                  key={p.title}
                  href={`/rubrique/restaurant`}
                  className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
