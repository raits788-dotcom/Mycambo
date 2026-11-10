// ============================================================================
// Horaires structurés — remplace la saisie libre ("Ouvert 7/7 hours 24h/24h").
// Stocké dans businesses.hours (jsonb). Rétrocompatible : si c'est une string
// (ancien format libre), on l'affiche telle quelle.
// ============================================================================

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Lundi', short: 'Lun' },
  { key: 'tue', label: 'Mardi', short: 'Mar' },
  { key: 'wed', label: 'Mercredi', short: 'Mer' },
  { key: 'thu', label: 'Jeudi', short: 'Jeu' },
  { key: 'fri', label: 'Vendredi', short: 'Ven' },
  { key: 'sat', label: 'Samedi', short: 'Sam' },
  { key: 'sun', label: 'Dimanche', short: 'Dim' },
];

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// Un jour : fermé, ou une plage open–close (format "HH:MM").
export interface DayHours {
  closed: boolean;
  open?: string;   // "08:00"
  close?: string;  // "18:00"
}

export interface StructuredHours {
  always: boolean;                       // ouvert 24h/24, 7j/7
  days: Record<DayKey, DayHours>;
}

export function emptyHours(): StructuredHours {
  const days = {} as Record<DayKey, DayHours>;
  for (const d of DAYS) days[d.key] = { closed: true };
  return { always: false, days };
}

// Reconnaît le format structuré (vs ancienne string libre).
export function isStructured(h: unknown): h is StructuredHours {
  return !!h && typeof h === 'object' && 'always' in (h as any) && 'days' in (h as any);
}

// Parse ce qui vient de la base en StructuredHours (ou null si libre/absent).
export function parseHours(h: unknown): StructuredHours | null {
  if (isStructured(h)) return h;
  return null;
}

// Affichage lisible pour la fiche publique.
export function displayHours(h: unknown): string | null {
  if (h == null) return null;

  // Format structuré.
  if (isStructured(h)) {
    if (h.always) return 'Ouvert 24h/24, 7j/7';
    const parts: string[] = [];
    // Regroupe les jours consécutifs identiques.
    let runStart = -1;
    const sig = (d: DayHours) => (d.closed ? 'closed' : `${d.open || ''}-${d.close || ''}`);
    for (let i = 0; i <= DAYS.length; i++) {
      const cur = i < DAYS.length ? sig(h.days[DAYS[i].key]) : '__end__';
      const prev = runStart >= 0 ? sig(h.days[DAYS[runStart].key]) : null;
      if (prev !== null && cur !== prev) {
        const from = DAYS[runStart].short;
        const to = DAYS[i - 1].short;
        const label = runStart === i - 1 ? from : `${from}–${to}`;
        const dh = h.days[DAYS[runStart].key];
        if (!dh.closed) parts.push(`${label} ${dh.open}–${dh.close}`);
        runStart = i;
      } else if (prev === null) {
        runStart = i;
      }
    }
    return parts.length ? parts.join(' · ') : 'Fermé';
  }

  // Ancien format libre (string) : affiché tel quel (rétrocompat).
  if (typeof h === 'string') {
    const s = h.trim();
    return s.length ? s : null;
  }
  return null;
}
