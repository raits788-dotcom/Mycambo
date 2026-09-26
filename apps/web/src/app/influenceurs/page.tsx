import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créateurs',
  description:
    'Découvrez les créateurs de contenu qui font vivre le Cambodge : vidéastes, photographes, blogueurs.',
};

const CREATEURS = [
  {
    name: 'Sok Travel',
    desc: 'Vidéos de voyage à travers le Cambodge.',
    icon: '🎥',
    color: 'bg-ic-rose',
  },
  {
    name: 'Khmer Foodie',
    desc: 'La cuisine khmère, recette par recette.',
    icon: '🍜',
    color: 'bg-ic-orange',
  },
  {
    name: 'Angkor Lens',
    desc: 'Photographie des temples et paysages.',
    icon: '📷',
    color: 'bg-ic-bleu',
  },
  {
    name: 'Vanna Lifestyle',
    desc: 'Vie quotidienne à Phnom Penh.',
    icon: '✨',
    color: 'bg-ic-violet',
  },
  {
    name: 'Trek Cambodia',
    desc: 'Randonnées et nature sauvage.',
    icon: '🥾',
    color: 'bg-ic-vert',
  },
  {
    name: 'Kampot Diaries',
    desc: 'La côte sud et ses trésors.',
    icon: '🌊',
    color: 'bg-ic-cyan',
  },
];

export default function InfluenceursPage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=85&w=2400&auto=format&fit=crop"
        alt="Créateurs Cambodge"
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
                Créateurs
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Ceux qui racontent
              <br />
              <span className="text-ic-or">le Cambodge.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Vidéastes, photographes, blogueurs — découvrez les créateurs qui
              partagent leur vision du Cambodge.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/influenceurs/rejoindre"
                className="inline-flex items-center gap-2 bg-white text-marine font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Devenir créateur
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Contenus vérifiés
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Partenariats possibles
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Créateurs en vedette
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CREATEURS.map((c) => (
                <div
                  key={c.name}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${c.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      <span>{c.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5 truncate">
                        {c.name}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {c.desc}
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
