import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const JOURS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

/**
 * Formate le champ `hours` (jsonb) de façon lisible.
 * Retourne null si aucun horaire exploitable n'est renseigné
 * (objet vide {}, tableau vide, ou valeurs vides) — pour ne jamais
 * afficher "{}" sur la fiche publique.
 */
export function formatHours(hours: unknown): string | null {
  if (hours == null) return null;
  if (typeof hours === 'string') {
    const s = hours.trim();
    return s.length ? s : null;
  }
  if (Array.isArray(hours)) {
    const parts = hours
      .map((h) => (typeof h === 'string' ? h.trim() : ''))
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  }
  if (typeof hours === 'object') {
    const entries = Object.entries(hours as Record<string, unknown>)
      .map(([k, v]) => {
        const val =
          v == null
            ? ''
            : typeof v === 'string'
              ? v.trim()
              : typeof v === 'object'
                ? Object.values(v as Record<string, unknown>)
                    .filter(Boolean)
                    .join(' - ')
                : String(v);
        if (!val) return null;
        const jour = JOURS[k.toLowerCase()] || k;
        return `${jour} : ${val}`;
      })
      .filter(Boolean);
    return entries.length ? entries.join(' · ') : null;
  }
  return null;
}