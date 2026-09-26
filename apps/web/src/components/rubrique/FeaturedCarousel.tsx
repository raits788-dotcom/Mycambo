'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { ETABLISSEMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface FeaturedCarouselProps {
  type: string;
}

const ROTATION_MS = 5000;

export default function FeaturedCarousel({ type }: FeaturedCarouselProps) {
  const etablissements = ETABLISSEMENTS[type] || [];
  const sorted = [...etablissements].sort((a, b) => b.rating - a.rating);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sorted.length);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [sorted.length]);

  if (sorted.length === 0) return null;

  const goPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + sorted.length) % sorted.length);
  const goNext = () =>
    setCurrentIndex((prev) => (prev + 1) % sorted.length);

  const visible = [0, 1, 2].map(
    (i) => sorted[(currentIndex + i) % sorted.length]
  );

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Heart size={18} className="fill-khmer text-khmer" />
          <span className="text-[13px] uppercase tracking-[0.3em] text-white/90 font-bold">
            Coups de cœur
          </span>
        </div>

        {sorted.length > 1 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goPrev}
              aria-label="Précédent"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              aria-label="Suivant"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ===== Cartes — HAUTEUR FIXE pour uniformiser ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {visible.map((e, i) => (
          <Link
            key={`${e.slug}-${currentIndex}-${i}`}
            href={`/commerce/${e.slug}`}
            className={cn(
              'group bg-white/95 backdrop-blur-md rounded-xl overflow-hidden border border-white/40',
              'hover:-translate-y-1 hover:shadow-2xl transition-all duration-500',
              'flex flex-col h-[400px]',   // ← HAUTEUR FIXE
              i > 0 && 'hidden md:block'
            )}
          >
            {/* Image */}
            <div className="relative aspect-[3/2] overflow-hidden flex-shrink-0">
              <Image
                src={e.image}
                alt={e.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Badge Cœur seul */}
              <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-khmer flex items-center justify-center shadow-lg">
                <Heart size={16} className="fill-white text-white" />
              </div>

              {/* Badge catégorie */}
              <span className="absolute top-3 right-3 bg-white/95 text-marine text-[9px] font-extrabold uppercase tracking-normal px-2.5 py-1.5 rounded-full shadow-md whitespace-nowrap">
                {e.category}
              </span>
            </div>

            {/* Contenu */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-marine text-sm mb-2 group-hover:text-marine-light transition-colors line-clamp-1 min-h-[20px]">
                {e.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-gris-texte mb-2.5 min-h-[18px]">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-ic-or text-ic-or" />
                  <b className="text-ink text-xs">{e.rating}</b>
                  <span className="text-gris-doux text-[10px]">
                    ({e.reviews})
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[10px] truncate">
                  <MapPin size={11} />
                  {e.city}
                </span>
              </div>

              {e.price && (
                <div className="pt-2.5 border-t border-gris-ligne text-sm font-extrabold text-marine mt-auto">
                  {e.price}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pastilles */}
      {sorted.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Aller au coup de cœur ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentIndex
                  ? 'w-7 bg-white'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}