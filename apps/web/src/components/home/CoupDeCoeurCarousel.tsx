'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Heart } from 'lucide-react';
import { useRef } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';

const FEATURED = [
  {
    id: 1,
    slug: 'angkor-palace-resort',
    name: 'Angkor Palace Resort',
    category: 'Hôtel',
    city: 'Siem Reap',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    description:
      'Resort 5 étoiles au cœur de Siem Reap, à 5 minutes des temples.',
  },
  {
    id: 2,
    slug: 'khmer-kitchen',
    name: 'Khmer Kitchen',
    category: 'Restaurant',
    city: 'Phnom Penh',
    image:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    description:
      'Cuisine khmère authentique, produits locaux et ambiance chaleureuse.',
  },
  {
    id: 3,
    slug: 'friends-international',
    name: 'Friends International',
    category: 'Association',
    city: 'Phnom Penh',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    description:
      "Réinsertion des jeunes en précarité par la formation et l'artisanat.",
  },
  {
    id: 4,
    slug: 'kep-crab-market',
    name: 'Kep Crab Market',
    category: 'Restaurant',
    city: 'Kep',
    image:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
    description:
      'Le fameux marché aux crabes de Kep, face au golfe de Thaïlande.',
  },
  {
    id: 5,
    slug: 'kampot-pepper-farm',
    name: 'Kampot Pepper Farm',
    category: 'Savoir-faire',
    city: 'Kampot',
    image:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    description:
      'Visite des plantations de poivre de Kampot, reconnu mondialement.',
  },
  {
    id: 6,
    slug: 'tonle-sap-floating',
    name: 'Villages flottants du Tonlé Sap',
    category: 'Activité',
    city: 'Siem Reap',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    description: "La vie sur l'eau du plus grand lac d'Asie du Sud-Est.",
  },
];

export default function CoupDeCoeurCarousel() {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scroller.current) return;
    const amount = scroller.current.clientWidth * 0.8;
    scroller.current.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="max-w-wrap mx-auto px-4 md:px-6 py-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <SectionTitle
          eyebrow="Coups de cœur du mois"
          title="Nos adresses chouchous"
          description="Sélectionnées par notre équipe pour leur authenticité et leur engagement."
        />
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Précédent"
            className="w-10 h-10 rounded-full border border-gris-ligne hover:border-marine hover:bg-marine hover:text-white text-marine flex items-center justify-center transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Suivant"
            className="w-10 h-10 rounded-full border border-gris-ligne hover:border-marine hover:bg-marine hover:text-white text-marine flex items-center justify-center transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {FEATURED.map((item) => (
          <Link
            key={item.id}
            href={`/commerce/${item.slug}`}
            className="group flex-shrink-0 w-[280px] md:w-[300px] snap-start bg-white rounded-lg overflow-hidden border border-gris-ligne hover:shadow-cb-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 280px, 300px"
              />
              {/* Badge */}
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-marine text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                {item.category}
              </span>
              {/* Cœur */}
              <button
                onClick={(e) => e.preventDefault()}
                aria-label="Ajouter aux favoris"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-gris-doux hover:text-khmer transition-colors"
              >
                <Heart size={14} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-5">
              <h3 className="font-extrabold text-marine text-base mb-2 group-hover:text-marine-light transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gris-texte mb-3">
                <MapPin size={13} />
                <span>{item.city}</span>
              </div>
              <p className="text-sm text-gris-texte leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/coups-de-coeur"
          className="text-sm font-bold text-marine hover:underline"
        >
          Voir tous les coups de cœur →
        </Link>
      </div>
    </section>
  );
}
