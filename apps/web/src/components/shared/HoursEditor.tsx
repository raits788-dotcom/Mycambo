'use client';

// Éditeur d'horaires structurés (case 24/7 + une plage par jour).
// Réutilisé par le wizard et l'onglet Informations partenaire.

import { DAYS, emptyHours, type StructuredHours, type DayKey } from '@/lib/hours';

interface Props {
  value: StructuredHours | null;
  onChange: (h: StructuredHours) => void;
}

export default function HoursEditor({ value, onChange }: Props) {
  const h = value || emptyHours();

  const setAlways = (always: boolean) => onChange({ ...h, always });

  const setDay = (key: DayKey, patch: Partial<StructuredHours['days'][DayKey]>) =>
    onChange({ ...h, days: { ...h.days, [key]: { ...h.days[key], ...patch } } });

  return (
    <div className="space-y-3">
      {/* 24/7 */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={h.always}
          onChange={(e) => setAlways(e.target.checked)}
          className="w-4 h-4 accent-marine"
        />
        <span className="text-sm font-bold text-marine">Ouvert 24h/24, 7j/7</span>
      </label>

      {/* Détail par jour (masqué si 24/7) */}
      {!h.always && (
        <div className="space-y-1.5">
          {DAYS.map((d) => {
            const day = h.days[d.key];
            return (
              <div key={d.key} className="flex items-center gap-2 flex-wrap">
                <span className="w-20 text-xs font-bold text-gris-texte">{d.label}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!day.closed}
                    onChange={(e) => setDay(d.key, e.target.checked ? { closed: false, open: day.open || '08:00', close: day.close || '18:00' } : { closed: true })}
                    className="w-3.5 h-3.5 accent-marine"
                  />
                  <span className="text-[11px] text-gris-doux">{day.closed ? 'Fermé' : 'Ouvert'}</span>
                </label>
                {!day.closed && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={day.open || '08:00'}
                      onChange={(e) => setDay(d.key, { open: e.target.value })}
                      className="px-2 py-1 text-xs rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <span className="text-gris-doux text-xs">–</span>
                    <input
                      type="time"
                      value={day.close || '18:00'}
                      onChange={(e) => setDay(d.key, { close: e.target.value })}
                      className="px-2 py-1 text-xs rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
