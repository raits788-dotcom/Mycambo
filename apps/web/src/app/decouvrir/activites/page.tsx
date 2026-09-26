import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activités au Cambodge',
  description:
    'Temples, trek, plage, croisière, cuisine, yoga, spectacles apsara… Toutes les activités à vivre au Cambodge.',
};

const ACTIVITES = [
  {
    icon: '🏛️',
    title: 'Temples',
    desc: 'Angkor, Bayon, Ta Prohm.',
    color: 'bg-ic-violet',
    href: '/rubrique/activite',
  },
  {
    icon: '🥾',
    title: 'Nature',
    desc: 'Trek, cascades, jungle.',
    color: 'bg-ic-vert',
    href: '/rubrique/activite',
  },
  {
    icon: '🏖️',
    title: 'Plage',
    desc: 'Koh Rong, Kep, Otres.',
    color: 'bg-ic-cyan',
    href: '/rubrique/activite',
  },
  {
    icon: '🚤',
    title: 'Croisière',
    desc: 'Tonlé Sap, Mékong.',
    color: 'bg-ic-bleu',
    href: '/rubrique/activite',
  },
  {
    icon: '🍳',
    title: 'Cuisine',
    desc: 'Cours, marchés, dégustations.',
    color: 'bg-ic-orange',
    href: '/rubrique/restaurant',
  },
  {
    icon: '🧘',
    title: 'Bien-être',
    desc: 'Yoga, massage khmer, méditation.',
    color: 'bg-ic-rose',
    href: '/rubrique/bien-etre',
  },
  {
    icon: '🎭',
    title: 'Culture',
    desc: 'Spectacles apsara, ateliers.',
    color: 'bg-ic-or',
    href: '/rubrique/activite',
  },
  {
    icon: '🛶',
    title: 'Aventure',
    desc: 'Kayak, VTT, tyrolienne.',
    color: 'bg-ic-vert',
    href: '/rubrique/activite',
  },
];

export default function ActivitesPage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1548013146-72479768bada?q=85&w=2400&auto=format&fit=crop"
        alt="Activités Cambodge"
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
                Activités
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Que faire
              <br />
              <span className="text-ic-or">au Cambodge ?</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Des temples d&apos;Angkor aux plages de Koh Rong, en passant par
              les treks du Ratanakiri — voici les expériences à ne pas manquer.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Activités vérifiées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Tous budgets
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Explorer par type
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ACTIVITES.map((a) => (
                <Link
                  key={a.title}
                  href={a.href}
                  className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-md ${a.color} flex items-center justify-center text-sm flex-shrink-0`}
                    >
                      <span>{a.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-xs mb-0.5">
                        {a.title}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {a.desc}
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
