import { COMPARISON_TABLE } from '@/lib/partner-data';
import { cn } from '@/lib/utils';

interface ComparisonProps {
  compact?: boolean;
}

export default function Comparison({ compact = false }: ComparisonProps) {
  return (
    <section className={cn('bg-gris-fond', compact ? 'py-10' : 'py-16')}>
      <div className="max-w-wrap mx-auto px-4 md:px-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-marine mb-2">
            Comparatif détaillé
          </h2>
          <p className="text-sm text-gris-texte">
            Tout ce qui est inclus dans chaque formule
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gris-ligne bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-marine text-white">
                {COMPARISON_TABLE.headers.map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      'px-3 md:px-4 text-sm font-bold',
                      compact ? 'py-3' : 'py-4',
                      i === 0 ? 'text-left' : 'text-center'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_TABLE.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gris-fond/50'}
                >
                  <td
                    className={cn(
                      'px-3 md:px-4 text-sm text-ink font-medium',
                      compact ? 'py-2' : 'py-3'
                    )}
                  >
                    {row.label}
                  </td>
                  {row.values.map((v, j) => (
                    <td
                      key={j}
                      className={cn(
                        'px-3 md:px-4 text-sm text-center text-gris-texte',
                        compact ? 'py-2' : 'py-3'
                      )}
                    >
                      {v === '✓' ? (
                        <span className="text-ic-vert font-bold">✓</span>
                      ) : v === '—' ? (
                        <span className="text-gris-doux">—</span>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
