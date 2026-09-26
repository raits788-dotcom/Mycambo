import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emploi au Cambodge',
  description:
    "Offres d'emploi au Cambodge : hôtellerie, restauration, ONG, business, freelance.",
};

const SECTEURS = [
  {
    icon: '🏨',
    title: 'Hôtellerie',
    desc: 'Réception, cuisine, housekeeping.',
    color: 'bg-ic-bleu',
    href: '/emploi?secteur=hotellerie',
  },
  {
    icon: '🍽️',
    title: 'Restauration',
    desc: 'Serveurs, chefs, barmen.',
    color: 'bg-ic-orange',
    href: '/emploi?secteur=restauration',
  },
  {
    icon: '❤️',
    title: 'ONG & Associations',
    desc: 'Missions, coordination.',
    color: 'bg-ic-rose',
    href: '/emploi?secteur=ong',
  },
  {
    icon: '💼',
    title: 'Business',
    desc: 'Marketing, vente, admin.',
    color: 'bg-ic-violet',
    href: '/emploi?secteur=business',
  },
  {
    icon: '💻',
    title: 'Freelance',
    desc: 'Dev, design, rédaction.',
    color: 'bg-ic-cyan',
    href: '/emploi?secteur=freelance',
  },
  {
    icon: '🎓',
    title: 'Éducation',
    desc: 'Professeurs, formateurs.',
    color: 'bg-ic-vert',
    href: '/emploi?secteur=education',
  },
];

export default function EmploiPage() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1659067306106-84c978b51526?q=85&w=2400&auto=format&fit=crop"
        alt="Travail au Cambodge"
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
                Emploi
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-4">
              Trouvez votre
              <br />
              <span className="text-ic-or">prochain poste.</span>
            </h1>

            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 max-w-md">
              Offres d&apos;emploi et de freelance au Cambodge : hôtellerie,
              restauration, ONG, business et plus.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/emploi/publier"
                className="inline-flex items-center gap-2 bg-white text-marine font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Publier une offre
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Employeurs vérifiés
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-ic-vert">✓</span> Candidature directe
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
              Parcourir par secteur
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SECTEURS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-3.5 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-md ${s.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      <span>{s.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm mb-0.5">
                        {s.title}
                      </h3>
                      <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                        {s.desc}
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
