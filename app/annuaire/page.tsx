import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annuaire',
  description:
    "L'annuaire myCAMBO : hôtels, restaurants, associations, boutiques et services au Cambodge.",
};

const CATEGORIES = [
  {
    icon: '🏨',
    title: 'Hôtels',
    desc: 'Hôtels, guesthouses, resorts.',
    color: 'bg-ic-bleu',
    href: '/rubrique/hotel',
    count: '42+',
  },
  {
    icon: '🍜',
    title: 'Restaurants',
    desc: 'Khmers, internationaux, cafés.',
    color: 'bg-ic-orange',
    href: '/rubrique/restaurant',
    count: '87+',
  },
  {
    icon: '❤️',
    title: 'Associations',
    desc: 'ONG, projets sociaux, bénévolat.',
    color: 'bg-ic-rose',
    href: '/rubrique/association',
    count: '23+',
  },
  {
    icon: '🛶',
    title: 'Activités',
    desc: 'Tours, guides, expériences.',
    color: 'bg-ic-vert',
    href: '/rubrique/activite',
    count: '31+',
    coming: true,
  },
  {
    icon: '🧵',
    title: 'Shopping',
    desc: 'Boutiques, artisanat, soie.',
    color: 'bg-ic-violet',
    href: '/rubrique/shopping',
    count: '26+',
    coming: true,
  },
  {
    icon: '🛺',
    title: 'Transports',
    desc: 'Tuk-tuk, location, transferts.',
    color: 'bg-ic-cyan',
    href: '/rubrique/transport',
    count: '14+',
    coming: true,
  },
];

export default function AnnuairePage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1565668314564-9d1bebb0a1db?q=85&w=2400&auto=format&fit=crop"
        alt="Cambodge"
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
                Annuaire
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Toutes les
              <br />
              <span className="text-ic-or">bonnes adresses.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Plus de 280 adresses vérifiées : hôtels, restaurants,
              associations, boutiques et services au Cambodge.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Vérifiées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Mises à jour
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Contact direct
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Explorer par catégorie
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => {
                const content = (
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${c.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      <span>{c.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5 flex items-center gap-1.5">
                        {c.title}
                        {c.coming && (
                          <span className="text-[8px] font-bold bg-white/15 px-1.5 py-0.5 rounded text-white/70">
                            BIENTÔT
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {c.desc}
                      </p>
                      <div className="text-[10px] text-ic-or font-bold mt-1">
                        {c.count} adresses
                      </div>
                    </div>
                  </div>
                );

                return c.coming ? (
                  <div
                    key={c.title}
                    className="bg-white/5 border border-white/10 rounded-lg p-3.5 opacity-60 cursor-not-allowed"
                  >
                    {content}
                  </div>
                ) : (
                  <Link
                    key={c.title}
                    href={c.href}
                    className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
