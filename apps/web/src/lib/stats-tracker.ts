// ============================================================================
// STATS TRACKER (mock — localStorage)
// ----------------------------------------------------------------------------
// Comptabilise les vues et soutiens par établissement.
// À migrer vers Supabase plus tard.
// ============================================================================

const VIEW_PREFIX = 'mycambo_viewed_';      // Empêche de compter plusieurs fois par session
const VIEWS_KEY = 'mycambo_views_';         // Compteur de vues
const SUPPORTS_KEY = 'mycambo_supports_';   // Compteur de soutiens

// ===== Vues =====
// Incrémente UNE SEULE FOIS par session (grâce à sessionStorage)
export function incrementViews(slug: string): number {
  if (typeof window === 'undefined') return 0;

  const viewedKey = VIEW_PREFIX + slug;
  const alreadyViewed = sessionStorage.getItem(viewedKey);

  if (alreadyViewed) {
    // Déjà vu dans cette session → retourne la valeur actuelle sans incrémenter
    return getViews(slug);
  }

  // Nouvelle vue dans cette session
  sessionStorage.setItem(viewedKey, '1');
  const viewsKey = VIEWS_KEY + slug;
  const current = Number(localStorage.getItem(viewsKey) || 0);
  const next = current + 1;
  localStorage.setItem(viewsKey, String(next));
  return next;
}

export function getViews(slug: string): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(VIEWS_KEY + slug) || 0);
}

// ===== Soutiens =====
export function incrementSupports(slug: string): number {
  if (typeof window === 'undefined') return 0;

  const key = SUPPORTS_KEY + slug;
  const current = Number(localStorage.getItem(key) || 0);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function getSupports(slug: string): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(SUPPORTS_KEY + slug) || 0);
}

// ===== Initialisation (si jamais vu) =====
// Permet de partir de valeurs de départ (mock) au premier chargement
export function initStatsIfEmpty(
  slug: string,
  initialViews: number,
  initialSupports: number
): void {
  if (typeof window === 'undefined') return;

  const viewsKey = VIEWS_KEY + slug;
  const supportsKey = SUPPORTS_KEY + slug;

  if (!localStorage.getItem(viewsKey)) {
    localStorage.setItem(viewsKey, String(initialViews));
  }
  if (!localStorage.getItem(supportsKey)) {
    localStorage.setItem(supportsKey, String(initialSupports));
  }
}