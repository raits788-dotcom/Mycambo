'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Compass, Plus, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { id: 'accueil', label: 'Accueil', href: '/', Icon: House },
  { id: 'explorer', label: 'Explorer', href: '/rubrique/hotel', Icon: Compass },
  { id: 'publier', label: 'Publier', href: '/partenaire', Icon: Plus },
  { id: 'favoris', label: 'Favoris', href: '#', Icon: Heart },
  { id: 'profil', label: 'Profil', href: '/connexion', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gris-ligne md:hidden">
      <div className="flex justify-around items-stretch">
        {items.map(({ id, label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 flex-1 text-[10px] font-semibold transition-colors',
                isActive ? 'text-marine' : 'text-gris-doux hover:text-marine'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
