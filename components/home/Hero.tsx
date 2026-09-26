import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const cities = ['Siem Reap', 'Phnom Penh', 'Kampot', 'Kep', 'Battambang'];

export default function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Image de fond */}
      <Image
        src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1920&q=80"
        alt="Temples d'Angkor au lever du soleil"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink/80" />
      <div className="absolute inset-0 bg-kbach-pattern opacity-30" />

      {/* Contenu */}
      <div className="relative z-10 text-center text-ivory px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-12 bg-gold" />
          <span className="text-xs uppercase tracking-[0.4em] text-gold">
            Bienvenue au Cambodge
          </span>
          <span className="h-px w-12 bg-gold" />
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
          Découvrir le
          <br />
          <span className="text-gold italic">Cambodge</span>,
          <br />
          autrement.
        </h1>

        <p className="text-lg md:text-xl text-ivory/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Culture, adresses authentiques, vie locale. Le Cambodge à travers ceux qui le font vivre.
        </p>

        <Button href="/annuaire" size="lg">
          Explorer l&apos;annuaire
        </Button>

        {/* Villes suggérées */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-ivory/60">
          <span className="text-ivory/40">Destinations :</span>
          {cities.map((city) => (
            <Link
              key={city}
              href={`/annuaire?city=${encodeURIComponent(city)}`}
              className="hover:text-gold transition-colors"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/60 text-xs uppercase tracking-widest flex flex-col items-center gap-2">
        <span>Découvrir</span>
        <span className="h-8 w-px bg-ivory/40 animate-pulse" />
      </div>
    </section>
  );
}