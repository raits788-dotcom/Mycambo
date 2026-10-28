// ============================================================================
// Équipe du partenaire : membres, invitations, rôles
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type TeamRole = 'owner' | 'editor' | 'viewer';

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Propriétaire',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: 'Accès complet : fiche, équipe, abonnement.',
  editor: 'Édite la fiche (infos, photos, services, projets). Pas l’équipe ni l’abonnement.',
  viewer: 'Lecture seule : consulte demandes et statistiques.',
};

export interface TeamMember {
  id: string;
  user_id: string;
  role: TeamRole;
  email: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  status: string;
  created_at: string;
}

async function callFn(fn: string, body: any) {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('NON_AUTHENTIFIE');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${fn}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    }
  );
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out?.ok) throw new Error(out?.error || `Échec ${fn}`);
  return out;
}

/** Membres actuels du tenant. */
export async function getTeamMembers(tenantId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase()
    .from('tenant_users')
    .select('id, user_id, role, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getTeamMembers:', error); return []; }
  return (data || []).map((m: any) => ({ ...m, email: null }));
}

/** Invitations en attente. */
export async function getTeamInvitations(tenantId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase()
    .from('team_invitations')
    .select('id, email, role, status, created_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) { console.error('getTeamInvitations:', error); return []; }
  return (data || []) as TeamInvitation[];
}

export async function inviteMember(tenantId: string, email: string, role: TeamRole) {
  return callFn('team-invite', { tenant_id: tenantId, email, role });
}

/** Changer le rôle d'un membre (owner uniquement). */
export async function updateMemberRole(memberId: string, role: TeamRole): Promise<boolean> {
  const { data, error } = await supabase()
    .from('tenant_users')
    .update({ role })
    .eq('id', memberId)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Modification refusée.');
  return true;
}

/** Retirer un membre. */
export async function removeMember(memberId: string): Promise<boolean> {
  const { error } = await supabase()
    .from('tenant_users')
    .delete()
    .eq('id', memberId);
  if (error) throw new Error(error.message);
  return true;
}

/** Révoquer une invitation en attente. */
export async function revokeInvitation(invitationId: string): Promise<boolean> {
  const { error } = await supabase()
    .from('team_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);
  if (error) throw new Error(error.message);
  return true;
}
