import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import type { Etablissement } from '@/lib/mock-data';

interface EtablissementCardProps {
  etablissement: Etablissement;
  isFeatured?: boolean;
}

export default function EtablissementCard({
  etablissement: e,
  isFeatured = false,
}: EtablissementCardProps) {
  // Extraire l'année "depuis" depuis la description si présente
  // (à terme : champ dédié depuis Supabase)
  const sinceMatch = e.description?.match(/Depuis (\d{4})/);
  const since = sinceMatch ? sinceMatch[1] : null;

  return (
    <Link
      href={`/commerce/${e.slug}`}
      className="group bg-white border border-gris-ligne rounded-lg overflow-hidden hover:shadow-cb-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gris-fond flex-shrink-0">
        <Image
          src={e.image}
          alt={e.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />

        {/* Badge Coup de cœur */}
        {isFeatured && (
          <div className="absolute top-2.5 left-2.5 bg-khmer text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Heart size={9} className="fill-white" />
            Coup de cœur
          </div>
        )}

        {/* Badge catégorie */}
        <span className="absolute top-2.5 right-2.5 bg-white/95 text-marine text-[9px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
          {e.category}
        </span>
      </div>

      {/* Contenu */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-extrabold text-marine text-sm mb-1.5 group-hover:text-marine-light transition-colors line-clamp-1 min-h-[20px]">
          {e.name}
        </h3>

        <div className="flex items-center gap-2 text-[10px] text-gris-texte mb-2 min-h-[16px]">
          <span className="flex items-center gap-1">
            <Star size={11} className="fill-ic-or text-ic-or" />
            <b className="text-ink">{e.rating}</b>
            <span className="text-gris-doux">({e.reviews})</span>
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin size={10} />
            {e.city}
          </span>
        </div>

        <p className="text-[10px] text-gris-texte line-clamp-2 mb-3 leading-relaxed flex-1">
          {e.description}
        </p>

        {/* Footer */}
        <div className="pt-2.5 border-t border-gris-ligne flex items-center justify-between">
          <span className="text-[10px] text-gris-doux">
            {since ? `Depuis ${since}` : e.price || ''}
          </span>
          <ArrowRight
            size={12}
            className="text-marine group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
}