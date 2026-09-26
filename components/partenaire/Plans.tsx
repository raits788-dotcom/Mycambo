import Link from 'next/link';
import { PARTNER_PLANS } from '@/lib/partner-data';
import { cn } from '@/lib/utils';

interface PlansProps {
  compact?: boolean;
}

export default function Plans({ compact = false }: PlansProps) {
  return (
    <section
      id="formules"
      className={cn('bg-white', compact ? 'py-10' : 'py-16')}
    >
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        {!compact && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-marine" />
              <span className="text-xs uppercase tracking-[0.3em] text-marine font-bold">
                Nos formules
              </span>
              <span className="h-px w-10 bg-marine" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-marine mb-4">
              Adaptées à votre activité
            </h2>
          </div>
        )}

        {/* Grille des formules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PARTNER_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-lg flex flex-col bg-white',
                plan.popular
                  ? 'border-2 border-marine shadow-cb-lg'
                  : 'border border-gris-ligne'
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-marine text-white text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap z-10">
                  Le plus choisi
                </span>
              )}

              <div className={cn(compact ? 'p-4' : 'p-6')}>
                <h3 className="text-base font-extrabold text-marine mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className={cn(
                      'font-extrabold text-marine',
                      compact ? 'text-2xl' : 'text-3xl'
                    )}
                  >
                    {plan.price}
                  </span>
                </div>
                <div className="text-[11px] text-gris-texte mb-4">
                  {plan.detail}
                </div>

                <ul
                  className={cn(
                    'flex-1',
                    compact ? 'space-y-1.5 mb-4' : 'space-y-2 mb-6'
                  )}
                >
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-start gap-2 text-gris-texte',
                        compact ? 'text-[11px]' : 'text-sm'
                      )}
                    >
                      <span className="text-ic-vert flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/partenaire/demande"
                  className={cn(
                    'block text-center rounded-full font-bold transition-colors',
                    compact ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm',
                    plan.popular
                      ? 'bg-marine text-white hover:bg-marine-dark'
                      : 'bg-gris-fond text-marine hover:bg-marine hover:text-white'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gris-doux mt-6">
          Besoin d&apos;une formule Entreprise sur mesure ?{' '}
          <Link
            href="/partenaire/demande"
            className="text-marine hover:underline font-bold"
          >
            Contactez-nous
          </Link>
        </p>
      </div>
    </section>
  );
}
