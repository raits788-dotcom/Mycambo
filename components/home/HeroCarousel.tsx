'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ===== Tes 7 images 16:9, en pleine résolution =====
const SLIDES = [
  {
    image:
      'https://images.unsplash.com/photo-1565668314564-9d1bebb0a1db?q=85&w=2400&auto=format&fit=crop',
    alt: 'Angkor Wat, Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1653959864991-c828b72c82a8?q=85&w=2400&auto=format&fit=crop',
    alt: 'Temple khmer, Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1645623981264-f58aa0c68ac0?q=85&w=2400&auto=format&fit=crop',
    alt: 'Temple bouddhiste, Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1659067306106-84c978b51526?q=85&w=2400&auto=format&fit=crop',
    alt: 'Paysage du Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1562314535-94451e9f0031?q=85&w=2400&auto=format&fit=crop',
    alt: 'Moines bouddhistes, Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1763214904257-1ff410d023f7?q=85&w=2400&auto=format&fit=crop',
    alt: 'Temple, Cambodge',
  },
  {
    image:
      'https://images.unsplash.com/photo-1770850994573-2ac1784b345b?q=85&w=2400&auto=format&fit=crop',
    alt: 'Paysage khmer, Cambodge',
  },
];

const DURATION = 6000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const t = setTimeout(next, DURATION);
    return () => clearTimeout(t);
  }, [current, next]);

  return (
    <section className="relative h-[75vh] min-h-[560px] max-h-[820px] overflow-hidden">
      {/* ===== Images en fondu ===== */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === current ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={i === 0}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
        </div>
      ))}

      {/* ===== Overlay pour lisibilité du texte ===== */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/25 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent z-10 pointer-events-none" />

      {/* ===== Contenu ===== */}
      <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
        <div className="max-w-wrap mx-auto px-4 md:px-6 w-full">
          <div className="max-w-2xl pointer-events-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-white/60" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/80 font-bold">
                Royaume du Cambodge
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Le Cambodge
              <br />
              <span className="text-ic-or">se dévoile.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-xl">
              Un pays de temples millénaires, d&apos;artisans au savoir-faire
              rare, de saveurs uniques et d&apos;hospitalité légendaire.
              Rencontrez ceux qui font vivre le Cambodge.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                href="/rubrique/hotel"
                size="lg"
                className="bg-white text-marine hover:bg-white/90"
              >
                Explorer le pays
              </Button>
              <Button
                href="/partenaire"
                variant="ghost"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:border-white"
              >
                Devenir partenaire
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Flèches ===== */}
      <button
        onClick={prev}
        aria-label="Image précédente"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white items-center justify-center transition-all"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        aria-label="Image suivante"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white items-center justify-center transition-all"
      >
        <ChevronRight size={22} />
      </button>

      {/* ===== Pastilles ===== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className={cn(
              'transition-all duration-300 rounded-full',
              i === current
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  );
}
