'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { MOCK_USER_FAVORITES, timeAgo } from '@/lib/user-mock';

export default function FavorisPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mes favoris
        </h1>
        <p className="text-sm text-gris-texte">
          {MOCK_USER_FAVORITES.length} adresse
          {MOCK_USER_FAVORITES.length > 1 ? 's' : ''} sauvegardée
          {MOCK_USER_FAVORITES.length > 1 ? 's' : ''}.
        </p>
      </div>

      {MOCK_USER_FAVORITES.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_USER_FAVORITES.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-lg border border-gris-ligne overflow-hidden hover:shadow-cb-md transition-shadow"
            >
              <Link href={`/commerce/${fav.slug}`} className="block">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={fav.image}
                    alt={fav.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 text-marine text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {fav.typeLabel}
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/commerce/${fav.slug}`}>
                  <h3 className="font-extrabold text-marine text-base mb-1 hover:text-marine-light transition-colors line-clamp-1">
                    {fav.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-3 text-xs text-gris-texte mb-3">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-ic-or text-ic-or" />
                    <b className="text-ink">{fav.rating}</b>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {fav.city}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gris-ligne">
                  <span className="text-[10px] text-gris-doux">
                    Ajouté {timeAgo(fav.addedAt)}
                  </span>
                  <button
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 size={12} />
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Heart size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun favori pour le moment
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Ajoutez des adresses à vos favoris pour les retrouver facilement.
          </p>
          <Link
            href="/annuaire"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Explorer l&apos;annuaire
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}