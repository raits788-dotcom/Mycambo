'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type SubNavLink = {
  label: string;
  href?: string;   // lien direct (ex. /rubrique/hotel)
  cat?: string;    // ou filtre ?cat= sur la page courante
  icon?: string;
};

interface Props {
  // Chemin de base pour les liens en mode ?cat= (ex. '/annuaire').
  basePath: string;
  links: SubNavLink[];
  // Libellé de l'onglet "tout" (ex. "Tout", "Tous"). null = pas d'onglet tout.
  allLabel?: string | null;
}

/**
 * Sous-barre de section générique (Annuaire, Créateurs…), calée sous le header
 * via --header-h comme CategorySubNav / DiscoverSubNav. Scrollable au doigt,
 * adaptée au thème clair/sombre (tokens gris-fond / gris-ligne / marine / or).
 */
export default function SectionSubNav({ basePath, links, allLabel = 'Tout' }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  return (
    <div
      className="sticky z-30 bg-gris-fond border-b border-gris-ligne"
      style={{ top: 'var(--header-h, 72px)' }}
    >
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {allLabel && (
            <Link
              href={basePath}
              className={cn(
                'flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap',
                activeCat === '' && pathname === basePath
                  ? 'text-ic-or border-ic-or'
                  : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
              )}
            >
              {allLabel}
            </Link>
          )}

          {links.map((l) => {
            const href = l.href ?? `${basePath}?cat=${l.cat}`;
            const isActive = l.href
              ? pathname === l.href
              : activeCat === l.cat;
            return (
              <Link
                key={l.label}
                href={href}
                className={cn(
                  'flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5',
                  isActive
                    ? 'text-ic-or border-ic-or'
                    : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
                )}
              >
                {l.icon && <span>{l.icon}</span>}
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
