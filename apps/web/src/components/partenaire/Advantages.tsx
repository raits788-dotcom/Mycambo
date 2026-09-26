import { PARTNER_ADVANTAGES } from '@/lib/partner-data';
import { cn } from '@/lib/utils';

interface AdvantagesProps {
  compact?: boolean;
}

export default function Advantages({ compact = false }: AdvantagesProps) {
  return (
    <section className={compact ? 'py-10' : 'py-16'}>
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        {/* En-tête */}
        <div className={cn('text-center mb-8', !compact && 'mb-12')}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-marine" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-marine font-bold">
              Pourquoi nous rejoindre
            </span>
            <span className="h-px w-8 bg-marine" />
          </div>
          <h2
            className={cn(
              'font-extrabold text-marine mb-2',
              compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
            )}
          >
            Ce que vous apporte myCAMBO
          </h2>
          <p className="text-sm text-gris-texte max-w-xl mx-auto">
            Nous mettons tout en œuvre pour faire connaître votre commerce et
            vous apporter des clients qualifiés.
          </p>
        </div>

        {/* Cartes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {PARTNER_ADVANTAGES.map((adv, i) => (
            <div
              key={i}
              className={cn(
                'bg-white rounded-lg border border-gris-ligne hover:shadow-cb-md hover:-translate-y-0.5 transition-all',
                compact ? 'p-4 md:p-5' : 'p-6 shadow-cb-sm'
              )}
            >
              <div
                className={cn(
                  'rounded-lg flex items-center justify-center text-white mb-3',
                  adv.color,
                  compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'
                )}
              >
                <i className={`fas ${adv.icon}`}></i>
              </div>
              <h3
                className={cn(
                  'font-extrabold text-marine mb-1.5',
                  compact ? 'text-sm md:text-base' : 'text-base md:text-lg'
                )}
              >
                {adv.title}
              </h3>
              <p
                className={cn(
                  'text-gris-texte leading-relaxed',
                  compact ? 'text-xs md:text-[13px]' : 'text-sm'
                )}
              >
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
