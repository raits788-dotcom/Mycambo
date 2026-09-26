'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import EtablissementCard from './EtablissementCard';
import FiltersBar, { type Filters } from './FiltersBar';

export interface Etablissement {
  slug: string;
  name: string;
  category: string;
  city: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  isFeatured?: boolean;
  createdAt?: string;
}

interface EtablissementGridProps {
  etablissements: Etablissement[];
  categoriesFeatured?: string[];
  title: string;
  subtitle?: string;
  /** URL vers laquelle pointer pour "Tout voir" (sans le paramètre cat) */
  clearFilterHref?: string;
}

export default function EtablissementGrid({
  etablissements,
  categoriesFeatured = [],
  title,
  subtitle,
  clearFilterHref,
}: EtablissementGridProps) {
  const [filters, setFilters] = useState<Filters>({
    sort: 'rating-desc',
    ratingMin: null,
    city: null,
    onlyFeatured: false,
  });

  // Liste des villes disponibles
  const cities = useMemo(() => {
    const set = new Set(etablissements.map((e) => e.city));
    return Array.from(set).sort();
  }, [etablissements]);

  // Comptage des coups de cœur
  const featuredCount = etablissements.filter(
    (e) => e.isFeatured || categoriesFeatured.includes(e.slug)
  ).length;

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = [...etablissements];

    if (filters.onlyFeatured) {
      list = list.filter(
        (e) => e.isFeatured || categoriesFeatured.includes(e.slug)
      );
    }

    if (filters.ratingMin !== null) {
      list = list.filter((e) => e.rating >= filters.ratingMin!);
    }

    if (filters.city) {
      list = list.filter((e) => e.city === filters.city);
    }

    switch (filters.sort) {
      case 'rating-desc':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        list.sort((a, b) => a.rating - b.rating);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    return list;
  }, [etablissements, filters, categoriesFeatured]);

  const hasActiveFilter =
    filters.ratingMin !== null ||
    filters.city !== null ||
    filters.onlyFeatured ||
    filters.sort !== 'rating-desc';

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        cities={cities}
        featuredCount={featuredCount}
        totalCount={filtered.length}
        hasActiveFilter={hasActiveFilter}
      />

      <section className="py-8">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-marine">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gris-texte mt-1">{subtitle}</p>
              )}
            </div>

            {clearFilterHref && (
              <Link
                href={clearFilterHref}
                className="text-xs font-bold border border-gris-ligne rounded-full px-4 py-2 text-marine hover:border-marine flex items-center gap-2 transition-colors"
              >
                <X size={12} />
                Tout voir
              </Link>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((e) => (
                <EtablissementCard
                  key={e.slug}
                  etablissement={e}
                  isFeatured={
                    e.isFeatured || categoriesFeatured.includes(e.slug)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gris-fond rounded-lg">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-bold text-marine mb-2">
                Aucun résultat
              </p>
              <p className="text-xs text-gris-texte mb-5">
                Essayez d&apos;ajuster vos filtres
              </p>
              <button
                onClick={() =>
                  setFilters({
                    sort: 'rating-desc',
                    ratingMin: null,
                    city: null,
                    onlyFeatured: false,
                  })
                }
                className="text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}