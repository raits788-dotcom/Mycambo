import { PARTNER_STEPS } from '@/lib/partner-data';
import { cn } from '@/lib/utils';

interface StepsProps {
  compact?: boolean;
}

export default function Steps({ compact = false }: StepsProps) {
  return (
    <section className={cn('bg-gris-fond', compact ? 'py-10' : 'py-16')}>
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className={cn('text-center mb-8', !compact && 'mb-12')}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-marine" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-marine font-bold">
              Comment ça marche
            </span>
            <span className="h-px w-8 bg-marine" />
          </div>
          <h2
            className={cn(
              'font-extrabold text-marine',
              compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
            )}
          >
            En ligne en 3 étapes
          </h2>
        </div>

        {/* Version compacte : ligne horizontale discrète */}
        {compact ? (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {PARTNER_STEPS.map((step, idx) => (
              <div
                key={step.number}
                className="relative bg-white rounded-lg p-5 border border-gris-ligne flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-marine text-white flex items-center justify-center font-extrabold flex-shrink-0">
                  {step.number}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-marine text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gris-texte leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* Flèche entre les étapes (desktop) */}
                {idx < PARTNER_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-gris-ligne">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Version classique */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PARTNER_STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 rounded-full bg-marine text-white flex items-center justify-center mx-auto mb-5 text-xl font-extrabold">
                  {step.number}
                </div>
                <h3 className="font-extrabold text-marine mb-3 text-lg">
                  {step.title}
                </h3>
                <p className="text-sm text-gris-texte leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
