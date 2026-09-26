'use client';

import Link from 'next/link';
import { X, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items: any[];
}

export default function Sidebar({ open, onClose, items }: SidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 bg-ink/50 z-[1999] transition-opacity',
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      />

      <aside
        className={cn(
          'fixed top-0 left-0 w-72 h-screen bg-white z-[2000] shadow-cb-lg transition-transform overflow-y-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-gris-ligne">
          <strong className="text-marine">Menu</strong>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="text-gris-doux hover:text-marine transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="py-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.active ? item.href : '#'}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors',
                  !item.active && 'text-gris-doux cursor-not-allowed',
                  item.active &&
                    !item.highlight &&
                    'text-ink hover:bg-gris-fond hover:text-marine',
                  item.active &&
                    item.highlight &&
                    'text-ic-or hover:bg-ic-or/10 font-bold'
                )}
              >
                {item.highlight && <Star size={14} className="fill-ic-or" />}
                <span className="flex-1">{item.label}</span>
                {!item.active && <Lock size={12} />}
              </Link>
              {item.submenu && item.active && (
                <ul className="pl-5 pb-2">
                  {item.submenu.map((sub: any, i: number) => (
                    <li key={i}>
                      <Link
                        href={sub.href}
                        onClick={onClose}
                        className="block px-5 py-2 text-xs text-gris-texte hover:text-marine hover:bg-gris-fond transition-colors"
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
