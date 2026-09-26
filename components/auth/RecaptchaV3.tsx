'use client';

// ============================================================================
// reCAPTCHA v3 — Placeholder
// ----------------------------------------------------------------------------
// Ce composant NE FAIT RIEN pour l'instant (pas de clé API).
// Il valide automatiquement avec un score de 0.9 (humain).
// À remplacer par le vrai reCAPTCHA quand la clé sera disponible.
// ============================================================================

interface RecaptchaV3Props {
  action: string;
}

export default function RecaptchaV3({ action }: RecaptchaV3Props) {
  // En attendant l'intégration, on ne rend rien.
  // La validation sera faite via `checkRecaptcha()`.
  return null;
}

/**
 * Vérifie le score reCAPTCHA (mock : toujours OK).
 * À remplacer par un appel réel à l'API Google.
 */
export async function checkRecaptcha(
  action: string
): Promise<{ ok: boolean; score: number }> {
  // ⚠️ Placeholder : on retourne toujours un score valide
  // À remplacer par :
  // const token = await grecaptcha.execute(SITE_KEY, { action });
  // const res = await fetch('/api/verify-recaptcha', { ... });
  return { ok: true, score: 0.9 };
}