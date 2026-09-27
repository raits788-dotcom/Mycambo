/**
 * Formatage de dates, prix et textes pour My Cambo.
 */

export type Locale = 'fr' | 'en' | 'km';

/**
 * Formate une date selon la locale.
 * Ex: formatDate('2025-01-15', 'fr') → '15 janvier 2025'
 */
export function formatDate(
  date: Date | string,
  locale: Locale = 'fr',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locales: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    km: 'km-KH',
  };
  return new Intl.DateTimeFormat(locales[locale], options).format(d);
}

/**
 * Formate un prix en USD ou KHR.
 * Ex: formatPrice(1234.5, 'USD') → '1 234,50 $'
 *     formatPrice(50000, 'KHR') → '50 000 ៛'
 */
export function formatPrice(
  amount: number,
  currency: 'USD' | 'KHR' = 'USD',
  locale: Locale = 'fr'
): string {
  const locales: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    km: 'km-KH',
  };
  return new Intl.NumberFormat(locales[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(amount);
}

/**
 * Transforme une chaîne en slug URL-friendly.
 * Ex: slugify('Hôtel Angkor Palace') → 'hotel-angkor-palace'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tronque un texte à une longueur donnée.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}
