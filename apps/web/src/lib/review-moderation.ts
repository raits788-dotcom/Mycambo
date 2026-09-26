// ============================================================================
// MODÉRATION AUTOMATIQUE DES AVIS
// ----------------------------------------------------------------------------
// Filtre de premier niveau : détection de propos inappropriés.
// ⚠️ Ne remplace pas la modération humaine, c'est un filtre préliminaire.
// ============================================================================

// ===== Types =====
export type ModerationResult = {
  ok: boolean;
  reason?: string;
  category?:
    | 'hateful_content'
    | 'insults'
    | 'threats'
    | 'spam'
    | 'too_short'
    | 'suspicious_links';
};

// ===== Catégories de rejet =====
export const MODERATION_LABELS: Record<
  NonNullable<ModerationResult['category']>,
  string
> = {
  hateful_content: 'Contenu inapproprié (propos haineux)',
  insults: 'Contenu inapproprié (insultes)',
  threats: 'Contenu inapproprié (menaces)',
  spam: 'Spam / publicité déguisée',
  too_short: 'Contenu trop court',
  suspicious_links: 'Liens suspects',
};

// ===== Listes de mots (version courte pour la démo) =====
// ⚠️ En production : liste étendue (500+ mots) + analyse sémantique

const HATEFUL_WORDS = [
  // Propos racistes / haineux (version édulcorée pour la démo)
  'race de',
  'sale race',
  'sous-race',
  'sale arabe',
  'sale noir',
  'sale blanc',
  'sale juif',
  'sale asiatique',
  // Extensible selon les besoins
];

const INSULT_WORDS = [
  // Insultes communes (version édulcorée)
  'connard',
  'connasse',
  'salaud',
  'salope',
  'enculé',
  'enculer',
  'pute',
  'bâtard',
  'idiot',
  'imbécile',
  'débile',
  'nul à chier',
  'nul a chier',
  'merdique',
  'fdp',
  'ntm',
];

const THREAT_WORDS = [
  // Menaces (version édulcorée)
  'je vais te tuer',
  'je vais le tuer',
  'je vais vous tuer',
  'je vais te frapper',
  'je vais te casser',
  'tu vas mourir',
  'vous allez mourir',
];

// ===== Regex =====
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const PHONE_REGEX = /(\+?\d[\s\-.]?){8,}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// ===== Constantes =====
const MIN_LENGTH = 20;
const MAX_LINKS = 2;
const MAX_PHONES = 1;
const MAX_EMAILS = 1;

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

export function moderateReviewContent(
  title: string,
  content: string
): ModerationResult {
  const fullText = `${title} ${content}`.toLowerCase();

  // ===== 1. Contenu trop court =====
  if (content.trim().length < MIN_LENGTH) {
    return {
      ok: false,
      category: 'too_short',
      reason: `Le contenu doit contenir au moins ${MIN_LENGTH} caractères.`,
    };
  }

  // ===== 2. Propos haineux =====
  for (const word of HATEFUL_WORDS) {
    if (fullText.includes(word)) {
      return {
        ok: false,
        category: 'hateful_content',
        reason: 'Le contenu contient des propos inappropriés.',
      };
    }
  }

  // ===== 3. Insultes =====
  for (const word of INSULT_WORDS) {
    // Recherche en tant que mot entier pour éviter les faux positifs
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    if (regex.test(fullText)) {
      return {
        ok: false,
        category: 'insults',
        reason: 'Le contenu contient des insultes.',
      };
    }
  }

  // ===== 4. Menaces =====
  for (const word of THREAT_WORDS) {
    if (fullText.includes(word)) {
      return {
        ok: false,
        category: 'threats',
        reason: 'Le contenu contient des menaces.',
      };
    }
  }

  // ===== 5. Liens suspects (spam) =====
  const links = content.match(URL_REGEX) || [];
  if (links.length > MAX_LINKS) {
    return {
      ok: false,
      category: 'suspicious_links',
      reason: `Le contenu contient trop de liens (${links.length}).`,
    };
  }

  // ===== 6. Téléphones (spam) =====
  const phones = content.match(PHONE_REGEX) || [];
  if (phones.length > MAX_PHONES) {
    return {
      ok: false,
      category: 'spam',
      reason: 'Le contenu contient trop de numéros de téléphone.',
    };
  }

  // ===== 7. Emails (spam) =====
  const emails = content.match(EMAIL_REGEX) || [];
  if (emails.length > MAX_EMAILS) {
    return {
      ok: false,
      category: 'spam',
      reason: 'Le contenu contient trop d\'adresses email.',
    };
  }

  // ===== 8. Casse excessive (spam) =====
  const upperCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[A-Za-z]/g) || []).length;
  if (letterCount > 20 && upperCount / letterCount > 0.7) {
    return {
      ok: false,
      category: 'spam',
      reason: 'Le contenu est écrit en majuscules de manière excessive.',
    };
  }

  // ===== OK =====
  return { ok: true };
}

// ===== Utilitaire =====
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}