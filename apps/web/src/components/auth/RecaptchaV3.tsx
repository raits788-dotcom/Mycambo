'use client';

// ============================================================================
// reCAPTCHA v3 — intégration réelle (clés en variables d'environnement)
// ----------------------------------------------------------------------------
// Si NEXT_PUBLIC_RECAPTCHA_SITE_KEY est défini, on charge et on exécute le vrai
// reCAPTCHA v3 de Google, et la vérification du token se fait côté serveur via
// /api/verify-recaptcha (qui utilise RECAPTCHA_SECRET_KEY).
// Si la clé n'est PAS configurée, on le signale en console et on laisse passer
// en développement — mais ce n'est plus un faux score silencieux.
// ============================================================================

import { useEffect } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

interface RecaptchaV3Props {
  action: string;
}

// Charge le script Google reCAPTCHA une seule fois.
export default function RecaptchaV3({ action: _action }: RecaptchaV3Props) {
  useEffect(() => {
    if (!SITE_KEY) return;
    if (document.getElementById('recaptcha-v3-script')) return;
    const s = document.createElement('script');
    s.id = 'recaptcha-v3-script';
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);
  return null;
}

/**
 * Vérifie le reCAPTCHA v3 : exécute le challenge côté client puis fait valider
 * le token côté serveur. Retourne { ok, score }.
 */
export async function checkRecaptcha(
  action: string
): Promise<{ ok: boolean; score: number }> {
  // Clé non configurée : on ne bloque pas le dev, mais on le signale clairement.
  if (!SITE_KEY || typeof window === 'undefined' || !window.grecaptcha) {
    console.warn(
      '[reCAPTCHA] Clé non configurée (NEXT_PUBLIC_RECAPTCHA_SITE_KEY). ' +
        'Protection anti-spam INACTIVE — à configurer avant la production.'
    );
    return { ok: true, score: 0 };
  }

  try {
    const token = await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(SITE_KEY, { action })
          .then(resolve)
          .catch(reject);
      });
    });

    // Validation du token côté serveur (le secret ne doit jamais être exposé au client).
    const res = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    const data = await res.json();
    return { ok: !!data.ok, score: data.score ?? 0 };
  } catch (e) {
    console.error('[reCAPTCHA] échec de vérification:', e);
    return { ok: false, score: 0 };
  }
}
