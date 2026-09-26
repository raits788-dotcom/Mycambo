// ============================================================================
// DOMAINES D'EMAILS JETABLES À BLOQUER
// Liste non exhaustive — peut être étendue
// ============================================================================

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Classiques
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'sharklasers.com',
  'maildrop.cc',
  'fakeinbox.com',
  'mintemail.com',
  'mytemp.email',
  'dispostable.com',
  'mailnesia.com',
  'spam4.me',
  'mohmal.com',
  'tempr.email',
  'emailondeck.com',
  'mailcatch.com',
  'inboxbear.com',
  'spamgourmet.com',
  'mailsac.com',
  'mail.tm',
  'moakt.com',
  'email-fake.com',
  'linshiyouxiang.net',
  'burnermail.io',
  'emailnator.com',
  // Ajoute ici d'autres domaines selon besoin
]);

/**
 * Vérifie si un email appartient à un domaine jetable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Vérifie qu'un email est valide et non jetable
 */
export function isEmailSafe(email: string): {
  ok: boolean;
  error?: string;
} {
  // Format
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { ok: false, error: 'Adresse email invalide.' };
  }

  // Domaine jetable
  if (isDisposableEmail(email)) {
    return {
      ok: false,
      error:
        'Les adresses email jetables ne sont pas autorisées. Merci d\'utiliser une adresse permanente.',
    };
  }

  return { ok: true };
}