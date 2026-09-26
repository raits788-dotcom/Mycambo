'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PARTNER_FAQ } from '@/lib/partner-data';
import { cn } from '@/lib/utils';

interface FAQProps {
  compact?: boolean;
}

export default function FAQ({ compact = false }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={cn('bg-white', compact ? 'py-10' : 'py-16')}>
      <div
        className={cn(
          'mx-auto px-4 md:px-6',
          compact ? 'max-w-3xl' : 'max-w-3xl'
        )}
      >
        {!compact && (
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-marine" />
              <span className="text-xs uppercase tracking-[0.3em] text-marine font-bold">
                Questions fréquentes
              </span>
              <span className="h-px w-10 bg-marine" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-marine">
              Vous avez des questions ?
            </h2>
          </div>
        )}

        <div className={cn(compact ? 'space-y-2' : 'space-y-3')}>
          {PARTNER_FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="bg-gris-fond border border-gris-ligne rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(
                    'w-full flex items-center justify-between text-left hover:bg-white/40 transition-colors',
                    compact ? 'px-4 py-3' : 'p-5'
                  )}
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      'font-bold text-marine pr-3',
                      compact ? 'text-sm' : 'text-base'
                    )}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'text-marine flex-shrink-0 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div
                    className={cn(
                      'text-gris-texte leading-relaxed border-t border-gris-ligne bg-white',
                      compact ? 'px-4 py-3 text-xs' : 'px-5 py-4 text-sm'
                    )}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
