'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type SubCat = {
  slug: string;
  name: string;
  icon?: string | null;
};

interface Props {
  // Slug de la rubrique parente (ex. 'autres-commerces').
  parentSlug: string;
  // Sous-catégories à afficher dans la sous-barre.
  children: SubCat[];
  // Sous-catégorie active imposée (ex. sur une fiche établissement, où il n'y
  // a pas de ?cat= dans l'URL). Prioritaire sur le paramètre d'URL.
  activeSlug?: string;
}

/**
 * Sous-barre scrollable des sous-catégories d'une rubrique parente.
 * Même principe que DiscoverSubNav : défile au doigt sur mobile, pas de
 * menu au survol. La sous-catégorie active est pilotée par ?cat=<slug>.
 */
export default function CategorySubNav({ parentSlug, children, activeSlug }: Props) {
  const searchParams = useSearchParams();
  // Sur une fiche, activeSlug impose la sous-catégorie active ; sinon ?cat=.
  const active = activeSlug ?? (searchParams.get('cat') || '');

  if (!children || children.length === 0) return null;

  return (
    <div
      className="sticky z-30 bg-gris-fond border-b border-gris-ligne"
      style={{ top: 'var(--header-h, 72px)' }}
    >
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {/* Onglet "Toutes" */}
          <Link
            href={`/rubrique/${parentSlug}`}
            className={cn(
              'flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap',
              active === ''
                ? 'text-ic-or border-ic-or'
                : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
            )}
          >
            Toutes
          </Link>

          {children.map((c) => {
            const isActive = active === c.slug;
            return (
              <Link
                key={c.slug}
                href={`/rubrique/${parentSlug}?cat=${c.slug}`}
                className={cn(
                  'flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5',
                  isActive
                    ? 'text-ic-or border-ic-or'
                    : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
                )}
              >
                {c.icon && <span>{c.icon}</span>}
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
