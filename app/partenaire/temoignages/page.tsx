import Image from 'next/image';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Témoignages',
  description:
    'Découvrez ce que disent les partenaires myCAMBO : hôtels, restaurants, associations et artisans au Cambodge.',
};

const TEMOIGNAGES = [
  {
    name: 'Sokha Chen',
    role: 'Gérant · Hôtel Angkor View',
    city: 'Siem Reap',
    quote:
      'Depuis que nous sommes sur myCAMBO, nos réservations directes ont augmenté de 40 %.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  },
  {
    name: 'Marie Dupont',
    role: 'Fondatrice · Khmer Kitchen',
    city: 'Phnom Penh',
    quote: 'La visibilité auprès des voyageurs francophones est incomparable.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    name: 'Vibol Sok',
    role: 'Directeur · Friends International',
    city: 'Phnom Penh',
    quote:
      'Notre association a gagné en notoriété. Les dons viennent plus facilement.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
];

export default function TemoignagesPage() {
  return (
    <>
      {/* ===== HERO COMPACT avec image de fond ===== */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1763214904257-1ff410d023f7?q=85&w=2400&auto=format&fit=crop"
          alt="Temple khmer"
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
              Témoignages
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-2 max-w-2xl">
            Ils nous font <span className="text-ic-or">confiance.</span>
          </h1>

          <p className="text-sm text-white/80 max-w-xl leading-relaxed">
            Hôtels, restaurants, associations, artisans — découvrez leurs
            retours.
          </p>
        </div>
      </section>

      {/* ===== TÉMOIGNAGES compact ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-wrap mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TEMOIGNAGES.map((t, i) => (
              <div
                key={i}
                className="bg-gris-fond rounded-lg border border-gris-ligne p-5 hover:shadow-cb-md transition-shadow"
              >
                <div className="text-ic-or text-2xl mb-2 font-serif leading-none">
                  &ldquo;
                </div>
                <p className="text-sm text-gris-texte leading-relaxed mb-4 min-h-[60px]">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-gris-ligne">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-marine text-sm truncate">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-gris-doux truncate">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gris-doux mt-6">
            D&apos;autres témoignages arrivent bientôt.
          </p>
        </div>
      </section>

      {/* ===== CTA FINAL compact ===== */}
      <section className="bg-gris-fond border-t border-gris-ligne">
        <div className="max-w-wrap mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-lg md:text-xl font-extrabold text-marine mb-0.5">
                Vous aussi, rejoignez-nous.
              </h2>
              <p className="text-sm text-gris-texte">
                Faites partie des partenaires qui font vivre myCAMBO.
              </p>
            </div>
            <Button
              href="/partenaire/demande"
              size="sm"
              className="flex-shrink-0"
            >
              Déposer ma demande
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
