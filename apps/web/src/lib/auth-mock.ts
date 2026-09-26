// ============================================================================
// AUTHENTIFICATION (mock)
// ============================================================================

export type UserRole = 'user' | 'partner' | 'admin';

export type MockUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailConfirmed: boolean;
  createdAt: string;
};

export type MockPartner = {
  id: string;
  email: string;
  name: string;              // Nom entreprise
  initials: string;          // "GU"
  role: 'partner';
  emailConfirmed: boolean;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
};

const USERS_KEY = 'mycambo_mock_users';
const PARTNERS_KEY = 'mycambo_mock_partners';
const SESSION_KEY = 'mycambo_mock_session';
const TOKENS_KEY = 'mycambo_mock_tokens';

// ============================================================================
// PARTENAIRES (mock)
// ============================================================================

// Partenaire de démo
const DEMO_PARTNER: MockPartner = {
  id: 'partner_green_umbrella',
  email: 'sokha@greenumbrella-kh.org',
  name: 'Green Umbrella',
  initials: 'GU',
  role: 'partner',
  emailConfirmed: true,
  status: 'active',
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
};

function getPartners(): MockPartner[] {
  if (typeof window === 'undefined') return [DEMO_PARTNER];
  try {
    const raw = localStorage.getItem(PARTNERS_KEY);
    if (!raw) {
      localStorage.setItem(PARTNERS_KEY, JSON.stringify([DEMO_PARTNER]));
      return [DEMO_PARTNER];
    }
    const stored = JSON.parse(raw) as MockPartner[];
    // S'assure que DEMO_PARTNER est toujours présent
    if (!stored.some((p) => p.email === DEMO_PARTNER.email)) {
      stored.push(DEMO_PARTNER);
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(stored));
    }
    return stored;
  } catch {
    return [DEMO_PARTNER];
  }
}

export function loginPartnerMock(
  email: string,
  password: string
): { ok: boolean; error?: string; partner?: MockPartner } {
  if (typeof window === 'undefined') return { ok: false, error: 'Erreur' };

  const partners = getPartners();
  const partner = partners.find((p) => p.email === email.toLowerCase());
  if (!partner) {
    return { ok: false, error: 'Email ou mot de passe incorrect.' };
  }
  if (!partner.emailConfirmed) {
    return {
      ok: false,
      error: "Votre email n'est pas encore confirmé.",
    };
  }
  if (partner.status === 'pending') {
    return {
      ok: false,
      error:
        'Votre compte partenaire est en attente de validation par notre équipe.',
    };
  }
  if (partner.status === 'suspended') {
    return {
      ok: false,
      error: 'Votre compte partenaire a été suspendu.',
    };
  }

  // Mot de passe mock : "demo1234"
  if (password !== 'demo1234') {
    return { ok: false, error: 'Email ou mot de passe incorrect.' };
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(partner));
  return { ok: true, partner };
}

export function getCurrentPartnerMock(): MockPartner | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.role !== 'partner') return null;
    return session as MockPartner;
  } catch {
    return null;
  }
}

// ============================================================================
// UTILISATEURS (mock)
// ============================================================================

export function getUsers(): MockUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}

export function signupMock(data: {
  name: string;
  email: string;
  password: string;
}): { ok: boolean; error?: string; requiresEmailConfirmation?: boolean } {
  if (typeof window === 'undefined') return { ok: false, error: 'Erreur' };

  const users = getUsers();
  const partners = getPartners();

  // Vérifie l'unicité globale (user + partner)
  if (
    users.some((u) => u.email === data.email.toLowerCase()) ||
    partners.some((p) => p.email === data.email.toLowerCase())
  ) {
    return { ok: false, error: 'Un compte existe déjà avec cet email.' };
  }

  const user: MockUser = {
    id: 'u_' + Date.now(),
    email: data.email.toLowerCase(),
    name: data.name,
    role: 'user',
    emailConfirmed: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const token = 'tok_' + Math.random().toString(36).slice(2);
  const tokens = getTokens();
  tokens[token] = {
    userId: user.id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));

  console.log('📧 Email de confirmation envoyé à', data.email);
  console.log('🔗 Lien : /confirmer-email?token=' + token);

  return { ok: true, requiresEmailConfirmation: true };
}

export function confirmEmailMock(token: string): {
  ok: boolean;
  error?: string;
} {
  if (typeof window === 'undefined') return { ok: false, error: 'Erreur' };

  const tokens = getTokens();
  const entry = tokens[token];
  if (!entry) return { ok: false, error: 'Lien invalide ou déjà utilisé.' };
  if (Date.now() > entry.expiresAt) {
    return { ok: false, error: 'Lien expiré.' };
  }

  const users = getUsers();
  const user = users.find((u) => u.id === entry.userId);
  if (!user) return { ok: false, error: 'Utilisateur introuvable.' };

  user.emailConfirmed = true;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  delete tokens[token];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));

  return { ok: true };
}

export function loginMock(
  email: string,
  password: string
): { ok: boolean; error?: string; user?: MockUser } {
  if (typeof window === 'undefined') return { ok: false, error: 'Erreur' };

  const users = getUsers();
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) return { ok: false, error: 'Email ou mot de passe incorrect.' };
  if (!user.emailConfirmed) {
    return {
      ok: false,
      error: "Votre email n'est pas encore confirmé.",
    };
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}

// ============================================================================
// SESSION
// ============================================================================

export function getCurrentUserMock(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.role !== 'user') return null;
    return session as MockUser;
  } catch {
    return null;
  }
}

export function getCurrentSession(): MockUser | MockPartner | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutMock(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ===== Utilitaires =====
function getTokens(): Record<string, { userId: string; expiresAt: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}