'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DISCOVER_SUBNAV } from '@/lib/nav-config';

export default function DiscoverSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[72px] md:top-[112px] z-30 bg-gris-fond border-b border-gris-ligne">
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {DISCOVER_SUBNAV.map((item) => {
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
        </div>
      </div>
    </div>
  );
}
