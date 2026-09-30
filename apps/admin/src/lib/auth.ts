import { createClient } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Connexion admin via Supabase Auth
 * @param email
 * @param password
 * @returns { success, error?, user? }
 */
export async function signInAdmin(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Utilisateur introuvable' };
  }

  // Vérifie que c'est bien un superadmin
  const role = data.user.app_metadata?.role;
  if (role !== 'superadmin') {
    await supabase.auth.signOut();
    return { success: false, error: 'Accès refusé (pas SuperAdmin)' };
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email || '',
      role: role,
    },
  };
}

/**
 * Déconnexion admin
 */
export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
  document.cookie = 'mycambo_admin_session=; path=/; max-age=0';
}

/**
 * Récupère la session courante (côté client)
 */
export async function getAdminSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}
/**
 * Récupère l'utilisateur admin actuel (côté client)
 */
export async function getCurrentAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  
  return {
    id: data.user.id,
    email: data.user.email || '',
    role: (data.user.app_metadata?.role as string) || 'user',
    initials: (data.user.email || 'XX').substring(0, 2).toUpperCase(),
  };
}

/**
 * Retourne les initiales à partir d'un email ou nom
 */
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return 'XX';
  const cleaned = nameOrEmail.split('@')[0];
  const parts = cleaned.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.substring(0, 2).toUpperCase();
}

/**
 * Nom d'affichage court à partir d'un email
 */
export function getDisplayName(email: string): string {
  if (!email) return 'Admin';
  const name = email.split('@')[0];
  return name
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}