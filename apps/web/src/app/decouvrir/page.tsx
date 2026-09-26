import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Découvrir le Cambodge',
  description:
    'Régions, culture, activités, transports, shopping, gastronomie et infos pratiques pour découvrir le Cambodge.',
};

const SECTIONS = [
  {
    label: 'Régions',
    href: '/decouvrir/regions',
    icon: '📍',
    desc: 'Siem Reap, Phnom Penh, Kampot, Kep, Ratanakiri…',
    color: 'bg-ic-bleu',
  },
  {
    label: 'Culture',
    href: '/decouvrir/culture',
    icon: '🎭',
    desc: 'Histoire khmère, religion, fêtes, arts.',
    color: 'bg-ic-violet',
  },
  {
    label: 'Activités',
    href: '/decouvrir/activites',
    icon: '🎯',
    desc: 'Temples, trek, plage, croisière, cuisine.',
    color: 'bg-ic-orange',
  },
  {
    label: 'Transports',
    href: '/decouvrir/transports',
    icon: '🚌',
    desc: 'Avion, bus, train, tuk-tuk, bateau.',
    color: 'bg-ic-cyan',
  },
  {
    label: 'Shopping',
    href: '/decouvrir/shopping',
    icon: '🛍️',
    desc: 'Soie, sculpture, poivre, artisanat.',
    color: 'bg-ic-rose',
  },
  {
    label: 'Gastronomie',
    href: '/decouvrir/gastronomie',
    icon: '🍜',
    desc: 'Amok, Lok Lak, Kuy Teav et saveurs.',
    color: 'bg-ic-vert',
  },
  {
    label: 'Pratique',
    href: '/decouvrir/pratique',
    icon: '📋',
    desc: 'Saisons, visa, monnaie, santé, sécurité.',
    color: 'bg-ic-or',
  },
];

export default function DecouvrirPage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      {/* ===== Image de fond ===== */}
      <Image
        src="https://images.unsplash.com/photo-1565668314564-9d1bebb0a1db?q=85&w=2400&auto=format&fit=crop"
        alt="Cambodge"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* ===== Overlay bleu marine ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />

      {/* ===== Contenu 2 colonnes ===== */}
      <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ===== Colonne gauche : Pitch ===== */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
                Découvrir
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Le Cambodge
              <br />
              <span className="text-ic-or">se dévoile.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Régions, culture, activités, gastronomie — tout ce qu&apos;il faut
              pour comprendre et vivre le pays.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> 7 rubriques complètes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Contenu local
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Mise à jour régulière
              </span>
            </div>
          </div>

          {/* ===== Colonne droite : Grille des 7 sections ===== */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Explorer par thématique
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SECTIONS.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${section.color} flex items-center justify-center text-white text-base flex-shrink-0`}
                    >
                      <span>{section.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5">
                        {section.label}
                      </h3>
                      <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Dernière carte : voir toutes les rubriques (2×4 = 8 slots, on a 7 sections, on met un lien "Accueil Découvrir" en 8e) */}
              <Link
                href="/decouvrir"
                className="group bg-ic-or/20 backdrop-blur-md border border-ic-or/40 rounded-lg p-3.5 hover:bg-ic-or/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-ic-or flex items-center justify-center text-marine-dark text-base flex-shrink-0 font-bold">
                    ★
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-white text-sm mb-0.5">
                      Tout voir
                    </h3>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      Vue d&apos;ensemble du pays
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
