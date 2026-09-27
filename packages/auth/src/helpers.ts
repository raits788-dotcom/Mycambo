/**
 * Helpers d'authentification My Cambo.
 * Utilise le client Supabase server-side pour récupérer l'utilisateur courant.
 */
import { createClient } from '@my-cambo/database/server';

export type UserRole = 'user' | 'partner' | 'superadmin' | 'admin' | 'moderator';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  tenantRole: string | null;
}

/**
 * Récupère l'utilisateur actuellement connecté (côté serveur).
 * Retourne null si non connecté.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const meta = user.app_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    role: (meta.role as UserRole) || 'user',
    tenantId: (meta.tenant_id as string) || null,
    tenantRole: (meta.tenant_role as string) || null,
  };
}

/**
 * Vérifie que l'utilisateur courant est SuperAdmin.
 * Lance une erreur sinon.
 */
export async function requireSuperadmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  if (user.role !== 'superadmin') throw new Error('FORBIDDEN');
  return user;
}

/**
 * Vérifie que l'utilisateur est connecté (n'importe quel rôle).
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
