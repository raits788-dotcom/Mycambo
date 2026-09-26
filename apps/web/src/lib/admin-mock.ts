// ============================================================================
// DONNÉES ADMIN (mock)
// ============================================================================

export type AdminRole = 'superadmin' | 'admin' | 'moderator';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: AdminRole;
  createdAt: string;
};

export const ADMIN_ROLES: Record<
  AdminRole,
  { label: string; color: string; permissions: string[] }
> = {
  superadmin: {
    label: 'Super-admin',
    color: 'bg-red-100 text-red-700',
    permissions: [
      'Gérer les administrateurs',
      'Configurer la plateforme',
      'Suspendre des comptes',
      'Valider les partenaires',
    ],
  },
  admin: {
    label: 'Administrateur',
    color: 'bg-purple-100 text-purple-700',
    permissions: [
      'Valider les partenaires',
      'Modérer les avis',
      'Suspendre des établissements',
    ],
  },
  moderator: {
    label: 'Modérateur',
    color: 'bg-blue-100 text-blue-700',
    permissions: ['Modérer les avis', 'Signaler du contenu'],
  },
};

// Admin de démo
export const MOCK_ADMIN: AdminUser = {
  id: 'admin_1',
  email: 'admin@mycambo.app',
  name: 'Admin myCAMBO',
  initials: 'AM',
  role: 'superadmin',
  createdAt: '2024-01-01',
};

const ADMIN_SESSION_KEY = 'mycambo_admin_session';

export function loginAdminMock(
  email: string,
  password: string
): { ok: boolean; error?: string; admin?: AdminUser } {
  if (typeof window === 'undefined') return { ok: false, error: 'Erreur' };

  if (email.toLowerCase() !== MOCK_ADMIN.email) {
    return { ok: false, error: 'Email ou mot de passe incorrect.' };
  }
  if (password !== 'admin1234') {
    return { ok: false, error: 'Email ou mot de passe incorrect.' };
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(MOCK_ADMIN));
  return { ok: true, admin: MOCK_ADMIN };
}

export function getCurrentAdmin(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}