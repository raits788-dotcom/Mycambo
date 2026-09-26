import HeroCarousel from '@/components/home/HeroCarousel';
import CoupDeCoeurCarousel from '@/components/home/CoupDeCoeurCarousel';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'hotel',       label: 'Hôtels',         emoji: '🏨', href: '/rubrique/hotel',       active: true },
  { id: 'restaurant',  label: 'Restaurants',    emoji: '🍜', href: '/rubrique/restaurant',  active: true },
  { id: 'association', label: 'Associations',   emoji: '❤️', href: '/rubrique/association', active: true },
  { id: 'activite',    label: 'Activités',      emoji: '🛶', href: '/rubrique/activite',    active: false },
  { id: 'shopping',    label: 'Shopping',       emoji: '🧵', href: '/rubrique/shopping',    active: false },
  { id: 'transport',   label: 'Transports',     emoji: '🛺', href: '/rubrique/transport',   active: false },
  { id: 'vente',       label: 'Annonces',       emoji: '📢', href: '/vente',                active: true },
  { id: 'emploi',      label: 'Emploi',         emoji: '💼', href: '/emploi',               active: true },
];

export default function HomePage() {
  return (
    <>
      {/* ===== 1. HERO CARROUSEL ===== */}
      <HeroCarousel />

      {/* ===== 2. CHIFFRES CLÉS ===== */}
      <section className="bg-marine text-white py-6">
        <div className="max-w-wrap mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { n: '280+', l: 'Adresses vérifiées' },
              { n: '25', l: 'Provinces couvertes' },
              { n: '15', l: 'Expériences uniques' },
              { n: '100%', l: 'Local & authentique' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-extrabold">{s.n}</div>
                <div className="text-xs md:text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. CATÉGORIES ===== */}
      <section className="max-w-wrap mx-auto px-4 md:px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-px w-8 bg-marine" />
          <span className="text-xs uppercase tracking-[0.25em] text-marine font-bold">
            Explorer
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-marine tracking-tight mb-8">
          Parcourir le Cambodge
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const content = (
              <>
                <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <div className="font-extrabold text-marine text-sm md:text-base">
                  {cat.label}
                </div>
                {!cat.active && (
                  <div className="text-[10px] text-gris-doux mt-1 uppercase tracking-wider">
                    Bientôt
                  </div>
                )}
              </>
            );

            return cat.active ? (
              <Link
                key={cat.id}
                href={cat.href}
                className="group bg-white border border-gris-ligne rounded-lg p-6 text-center hover:border-marine hover:shadow-cb-md hover:-translate-y-1 transition-all duration-300"
              >
                {content}
              </Link>
            ) : (
              <div
                key={cat.id}
                className="bg-gris-fond border border-gris-ligne rounded-lg p-6 text-center opacity-50 cursor-not-allowed"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 4. COUPS DE CŒUR EN CARROUSEL ===== */}
      <section className="bg-gris-fond">
        <CoupDeCoeurCarousel />
      </section>

      {/* ===== 5. BANDEAU PARTENAIRE COMPACT ===== */}
      <section className="max-w-wrap mx-auto px-4 md:px-6 py-16">
        <div className="relative rounded-xl overflow-hidden bg-marine text-white p-8 md:p-12">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/70 font-bold mb-4">
              Vous êtes un commerce ?
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
              Faites découvrir votre savoir-faire sur myCAMBO
            </h2>
            <p className="text-white/80 leading-relaxed mb-6">
              Hôtel, restaurant, atelier, boutique, association — rejoignez la
              plateforme et rencontrez des milliers de voyageurs et d&apos;habitants.
            </p>
            <Link
              href="/devenir-partenaire"
              className="inline-flex items-center gap-2 bg-white text-marine font-bold px-6 py-3 rounded-full hover:bg-ic-or hover:text-marine-dark transition-colors"
            >
              Devenir partenaire →
            </Link>
            <p className="text-xs text-white/50 mt-4">
              Sans engagement · Validation sous 48 h
            </p>
          </div>
        </div>
      </section>
    </>
  );
}