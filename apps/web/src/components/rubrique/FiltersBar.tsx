'use client';

import { Star, Heart, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption =
  | 'rating-desc'
  | 'rating-asc'
  | 'name-asc'
  | 'recent';

export interface Filters {
  sort: SortOption;
  ratingMin: number | null;
  city: string | null;
  onlyFeatured: boolean;
}

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cities: string[];
  featuredCount: number;
  totalCount: number;
  hasActiveFilter: boolean;
}

export default function FiltersBar({
  filters,
  onChange,
  cities,
  featuredCount,
  totalCount,
  hasActiveFilter,
}: FiltersBarProps) {
  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="bg-white border-b border-gris-ligne py-3 sticky top-[160px] z-20">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tri */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gris-doux" />
            <select
              value={filters.sort}
              onChange={(e) =>
                update({ sort: e.target.value as SortOption })
              }
              className="text-xs border border-gris-ligne rounded-lg px-3 py-2 font-semibold text-marine outline-none focus:border-marine cursor-pointer"
            >
              <option value="rating-desc">Trier : Note ↓</option>
              <option value="rating-asc">Trier : Note ↑</option>
              <option value="name-asc">Trier : Nom (A-Z)</option>
              <option value="recent">Trier : Plus récent</option>
            </select>
          </div>

          {/* Note minimum */}
          <select
            value={filters.ratingMin ?? ''}
            onChange={(e) =>
              update({
                ratingMin: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="text-xs border border-gris-ligne rounded-lg px-3 py-2 font-semibold text-gris-texte outline-none focus:border-marine cursor-pointer"
          >
            <option value="">Toutes les notes</option>
            <option value="4.5">⭐ 4.5 et plus</option>
            <option value="4">⭐ 4 et plus</option>
            <option value="3">⭐ 3 et plus</option>
          </select>

          {/* Ville */}
          <select
            value={filters.city ?? ''}
            onChange={(e) =>
              update({ city: e.target.value || null })
            }
            className="text-xs border border-gris-ligne rounded-lg px-3 py-2 font-semibold text-gris-texte outline-none focus:border-marine cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Filtre Coups de cœur */}
          <button
            onClick={() => update({ onlyFeatured: !filters.onlyFeatured })}
            className={cn(
              'text-xs rounded-lg px-3 py-2 font-semibold flex items-center gap-2 transition-colors border',
              filters.onlyFeatured
                ? 'bg-ic-or text-marine-dark border-ic-or'
                : 'bg-white border-gris-ligne text-gris-texte hover:text-marine hover:border-marine'
            )}
          >
            <Heart
              size={12}
              className={cn(
                filters.onlyFeatured ? 'fill-marine-dark' : 'fill-khmer text-khmer'
              )}
            />
            Coups de cœur
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                filters.onlyFeatured
                  ? 'bg-white/40 text-marine-dark'
                  : 'bg-gris-fond text-gris-doux'
              )}
            >
              {featuredCount}
            </span>
            {filters.onlyFeatured && <X size={10} />}
          </button>

          {/* Compteur + bouton tout voir */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gris-doux">
              <b className="text-marine">{totalCount}</b>{' '}
              résultat{totalCount > 1 ? 's' : ''}
            </span>

            {hasActiveFilter && (
              <button
                onClick={() =>
                  onChange({
                    sort: 'rating-desc',
                    ratingMin: null,
                    city: null,
                    onlyFeatured: false,
                  })
                }
                className="text-xs font-bold border border-gris-ligne rounded-full px-3.5 py-1.5 text-marine hover:border-marine flex items-center gap-1.5 transition-colors"
              >
                <X size={11} />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}