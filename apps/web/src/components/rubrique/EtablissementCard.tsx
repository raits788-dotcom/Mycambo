'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { LevelBadge, SubLabels } from '@/components/ui/LevelBadge';

interface Props {
  etablissement: {
    id?: string;
    slug: string;
    name: string;
    typeLabel?: string;
    category?: string;
    city?: string;
    image?: string;
    rating?: number;
    reviews?: number;
    description?: string;
    level?: string;
    labels?: any[];
  };
}

export default function EtablissementCard({ etablissement: e }: Props) {
  return (
    <Link
      href={`/commerce/${e.slug}`}
      className="group bg-white rounded-xl border border-gris-ligne overflow-hidden hover:border-marine hover:shadow-cb-md transition-all"
    >
      <div className="relative aspect-[4/3] bg-gris-fond overflow-hidden">
        {e.image ? (
          <Image
            src={e.image}
            alt={e.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gris-doux text-xs">
            Pas de photo
          </div>
        )}

        {/* Badge niveau en haut à droite */}
        <div className="absolute top-3 right-3 z-10">
          <LevelBadge level={e.level} size="sm" showLabel={false} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {e.typeLabel && (
            <span className="text-[10px] font-bold text-marine uppercase tracking-wider">
              {e.typeLabel}
            </span>
          )}
        </div>

        <h3 className="font-bold text-marine text-base leading-tight mb-1 line-clamp-1">
          {e.name}
        </h3>

        {e.city && (
          <div className="flex items-center gap-1 text-xs text-gris-texte mb-2">
            <MapPin size={11} />
            {e.city}
          </div>
        )}

        {/* Sous-labels */}
        {e.labels && e.labels.length > 0 && (
          <div className="mb-3">
            <SubLabels labels={e.labels.slice(0, 3)} size="sm" />
          </div>
        )}

        {e.description && (
          <p className="text-xs text-gris-texte line-clamp-2 mb-3">
            {e.description}
          </p>
        )}

        {e.rating !== undefined && e.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-gris-texte pt-3 border-t border-gris-ligne">
            <Star size={11} className="fill-ic-or text-ic-or" />
            <b className="text-marine">{e.rating}</b>
            <span className="text-gris-doux">({e.reviews || 0})</span>
          </div>
        )}
      </div>
    </Link>
  );
}