// ============================================================================
// PROTECTION ANTI-SPAM
// ----------------------------------------------------------------------------
// Honeypot + Validation temporelle + Rate limiting (localStorage)
// ============================================================================

// ===== Honeypot =====
export const HONEYPOT_FIELD_NAME = 'website';
export const HONEYPOT_STYLE = {
  position: 'absolute',
  left: '-9999px',
  opacity: 0,
  pointerEvents: 'none',
} as const;

export function checkHoneypot(value: string | null | undefined): boolean {
  // Doit être vide. Si rempli → bot détecté.
  return !value || value.trim() === '';
}

// ===== Validation temporelle =====
const MIN_FILL_TIME_MS = 3000; // 3 secondes minimum

export function startFormTimer(): number {
  return Date.now();
}

export function isFormFilledTooFast(startTime: number): boolean {
  return Date.now() - startTime < MIN_FILL_TIME_MS;
}

// ===== Rate Limiting (localStorage) =====
const RATE_LIMIT_PREFIX = 'mycambo_ratelimit_';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

function getRateLimitEntry(key: string): RateLimitEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RATE_LIMIT_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as RateLimitEntry;
    // Si expiré, on reset
    if (Date.now() > entry.resetAt) {
      localStorage.removeItem(RATE_LIMIT_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setRateLimitEntry(key: string, entry: RateLimitEntry): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RATE_LIMIT_PREFIX + key, JSON.stringify(entry));
}

/**
 * Vérifie si une action est autorisée selon une limite.
 * @param key Clé unique (ex: 'signup', 'login')
 * @param maxAttempts Nombre max d'essais
 * @param windowMs Fenêtre de temps en ms
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const entry = getRateLimitEntry(key);

  if (!entry) {
    setRateLimitEntry(key, {
      count: 1,
      resetAt: Date.now() + windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterMs: entry.resetAt - Date.now(),
    };
  }

  entry.count += 1;
  setRateLimitEntry(key, entry);
  return { allowed: true };
}

/**
 * Rate limiting spécifique : inscription (3 / heure)
 */
export function checkSignupRateLimit() {
  return checkRateLimit('signup', 3, 60 * 60 * 1000);
}

/**
 * Rate limiting spécifique : connexion (5 essais / heure)
 */
export function checkLoginRateLimit() {
  return checkRateLimit('login', 5, 60 * 60 * 1000);
}

/**
 * Rate limiting spécifique : demande partenaire (2 / heure)
 */
export function checkPartnerRequestRateLimit() {
  return checkRateLimit('partner_request', 2, 60 * 60 * 1000);
}

/**
 * Formate le temps d'attente en message lisible
 */
export function formatRetryAfter(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} heure${hours > 1 ? 's' : ''}`;
}