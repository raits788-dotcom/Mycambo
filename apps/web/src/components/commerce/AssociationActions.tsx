'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssociationAction } from '@/lib/mock-data';

interface AssociationActionsProps {
  actions: AssociationAction[];
}

const STATUS_LABEL = {
  actif: { label: 'En cours', class: 'bg-ic-vert text-white' },
  termine: { label: 'Terminé', class: 'bg-gris-doux text-white' },
  prevu: { label: 'À venir', class: 'bg-ic-or text-marine-dark' },
};

type Filter = 'toutes' | 'actif' | 'termine' | 'prevu';

export default function AssociationActions({
  actions,
}: AssociationActionsProps) {
  const [filter, setFilter] = useState<Filter>('toutes');

  const filtered =
    filter === 'toutes'
      ? actions
      : actions.filter((a) => a.status === filter);

  const counts = {
    toutes: actions.length,
    actif: actions.filter((a) => a.status === 'actif').length,
    termine: actions.filter((a) => a.status === 'termine').length,
    prevu: actions.filter((a) => a.status === 'prevu').length,
  };

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { id: 'toutes', label: 'Toutes' },
            { id: 'actif', label: 'En cours' },
            { id: 'prevu', label: 'À venir' },
            { id: 'termine', label: 'Terminées' },
          ] as { id: Filter; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-colors',
              filter === f.id
                ? 'bg-marine text-white'
                : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
            )}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((action) => {
            const st = STATUS_LABEL[action.status];
            return (
              <article
                key={action.id}
                className="bg-white border border-gris-ligne rounded-lg overflow-hidden hover:shadow-cb-md transition-shadow"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={action.image}
                    alt={action.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span
                    className={cn(
                      'absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full',
                      st.class
                    )}
                  >
                    {st.label}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-extrabold text-marine text-base mb-2">
                    {action.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gris-doux mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {action.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {action.date}
                    </span>
                  </div>

                  <p className="text-sm text-gris-texte leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gris-fond rounded-lg">
          <p className="text-sm text-gris-texte">
            Aucune action dans cette catégorie.
          </p>
        </div>
      )}
    </div>
  );
}