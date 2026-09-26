'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { AssociationPhoto } from '@/lib/mock-data';

interface AssociationPhotosProps {
  photos: AssociationPhoto[];
  limit?: number;
}

export default function AssociationPhotos({
  photos,
  limit = 5,
}: AssociationPhotosProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      {/* Info quota */}
      <div className="flex items-center justify-between mb-4 text-xs text-gris-doux">
        <span>
          {photos.length} / {limit} photos autorisées
        </span>
        {photos.length >= limit && (
          <span className="text-ic-or font-bold">
            Limite atteinte — Passez à un plan supérieur
          </span>
        )}
      </div>

      {/* Grille */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gris-fond"
            >
              <Image
                src={photo.url}
                alt={photo.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.caption}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gris-fond rounded-lg">
          <p className="text-sm text-gris-texte">Aucune photo pour le moment.</p>
        </div>
      )}

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            aria-label="Fermer"
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors"
          >
            <X size={22} />
          </button>

          <div className="relative max-w-4xl w-full aspect-[4/3]">
            <Image
              src={photos[selected].url}
              alt={photos[selected].caption}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm text-center px-4">
            {photos[selected].caption}
          </div>
        </div>
      )}
    </div>
  );
}