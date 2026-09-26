import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Régions du Cambodge',
  description:
    'Siem Reap, Phnom Penh, Kampot, Kep, Battambang, Ratanakiri… Découvrez chaque province du Cambodge.',
};

const REGIONS = [
  {
    name: 'Siem Reap',
    icon: '🏛️',
    color: 'bg-ic-bleu',
    desc: 'Angkor, temples, marché artisanal.',
  },
  {
    name: 'Phnom Penh',
    icon: '🏙️',
    color: 'bg-ic-violet',
    desc: 'Capitale, palais royal, musées.',
  },
  {
    name: 'Kampot',
    icon: '🌿',
    color: 'bg-ic-vert',
    desc: 'Poivre, rivière, charme colonial.',
  },
  {
    name: 'Kep',
    icon: '🦀',
    color: 'bg-ic-rose',
    desc: 'Marché aux crabes, plages calmes.',
  },
  {
    name: 'Battambang',
    icon: '🚂',
    color: 'bg-ic-orange',
    desc: 'Bamboo train, campagne, arts.',
  },
  {
    name: 'Sihanoukville',
    icon: '🏖️',
    color: 'bg-ic-cyan',
    desc: 'Plages, îles, vie nocturne.',
  },
  {
    name: 'Koh Rong',
    icon: '🏝️',
    color: 'bg-ic-bleu',
    desc: 'Île paradisiaque, sable blanc.',
  },
  {
    name: 'Ratanakiri',
    icon: '🌳',
    color: 'bg-ic-vert',
    desc: 'Nature, trek, minorités ethniques.',
  },
  {
    name: 'Mondulkiri',
    icon: '🐘',
    color: 'bg-ic-orange',
    desc: 'Cascades, éléphants, forêt.',
  },
  {
    name: 'Kratie',
    icon: '🐬',
    color: 'bg-ic-cyan',
    desc: 'Dauphins du Mékong, nature.',
  },
];

export default function RegionsPage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=85&w=2400&auto=format&fit=crop"
        alt="Paysage du Cambodge"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />

      <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-14 items-center">
          {/* Pitch gauche */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
                Régions
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              25 provinces,
              <br />
              <span className="text-ic-or">25 visages.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Des temples d&apos;Angkor aux plages de Koh Rong, des rizières aux
              forêts du Ratanakiri, chaque région raconte un Cambodge différent.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Cartes & guides
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Adresses locales
              </span>
            </div>
          </div>

          {/* Grille des régions */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Explorer par province
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REGIONS.map((r) => (
                <Link
                  key={r.name}
                  href={`/rubrique/hotel?city=${r.name}`}
                  className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${r.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      <span>{r.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5">
                        {r.name}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {r.desc}
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
