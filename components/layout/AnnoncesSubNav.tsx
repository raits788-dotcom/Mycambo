'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ANNONCES_SUBNAV } from '@/lib/nav-config';

export default function AnnoncesSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[72px] md:top-[112px] z-30 bg-gris-fond border-b border-gris-ligne">
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {ANNONCES_SUBNAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-shrink-0 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-ic-or border-ic-or'
                    : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {/* CTA à droite */}
          <div className="ml-auto pl-4 flex-shrink-0">
            <Link
              href="/annonces/publier"
              className="inline-flex items-center gap-2 bg-marine text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-marine-dark transition-colors whitespace-nowrap"
            >
              Déposer une annonce
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}