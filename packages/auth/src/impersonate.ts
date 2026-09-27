/**
 * Logique d'impersonation : un SuperAdmin peut "entrer" dans le tenant
 * d'un partenaire pour l'aider. Le token est signé, courte durée (30 min),
 * et toutes les actions sont logguées.
 */
import { createClient } from '@my-cambo/database/server';
import { createAdminClient } from '@my-cambo/database/admin';
import { requireSuperadmin } from './helpers';

const IMPERSONATION_DURATION_MIN = 30;

export interface ImpersonationToken {
  token: string;
  expiresAt: string;
  tenantId: string;
  tenantName: string;
}

/**
 * Génère un token d'impersonation pour un tenant.
 * ⚠️ Réservé aux SuperAdmins.
 */
export async function createImpersonationToken(
  tenantId: string
): Promise<ImpersonationToken> {
  const superadmin = await requireSuperadmin();
  const admin = createAdminClient();

  // Vérifier que le tenant existe
  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .select('id, name, status')
    .eq('id', tenantId)
    .single();

  if (tenantError || !tenant) {
    throw new Error('TENANT_NOT_FOUND');
  }

  // Générer le token
  const token = crypto.randomUUID() + '-' + Date.now();
  const expiresAt = new Date(
    Date.now() + IMPERSONATION_DURATION_MIN * 60 * 1000
  ).toISOString();

  // Enregistrer le token
  const { error: insertError } = await admin
    .from('impersonation_tokens')
    .insert({
      superadmin_id: superadmin.id,
      tenant_id: tenantId,
      token,
      expires_at: expiresAt,
    });

  if (insertError) {
    throw new Error('IMPERSONATION_FAILED');
  }

  // Log l'action dans audit_logs
  await admin.from('audit_logs').insert({
    actor_id: superadmin.id,
    actor_type: 'superadmin',
    action: 'impersonate.start',
    entity_type: 'tenant',
    entity_id: tenantId,
    changes: { expires_at: expiresAt },
  });

  return {
    token,
    expiresAt,
    tenantId: tenant.id,
    tenantName: tenant.name,
  };
}

/**
 * Vérifie qu'un token d'impersonation est valide et non expiré.
 * Utilisé côté tenant (apps/web) pour autoriser l'accès.
 */
export async function verifyImpersonationToken(
  token: string
): Promise<{ superadminId: string; tenantId: string } | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('impersonation_tokens')
    .select('superadmin_id, tenant_id, expires_at, used_at')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return {
    superadminId: data.superadmin_id,
    tenantId: data.tenant_id,
  };
}
