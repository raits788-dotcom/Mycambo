'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Loader2,
  Plus,
  Trash2,
  Mail,
  Shield,
  X,
  Clock,
} from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';
import {
  getTeamMembers,
  getTeamInvitations,
  inviteMember,
  updateMemberRole,
  removeMember,
  revokeInvitation,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type TeamMember,
  type TeamInvitation,
  type TeamRole,
} from '@/lib/team';

const ROLE_STYLES: Record<TeamRole, string> = {
  owner: 'bg-marine text-white',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gris-fond text-gris-texte',
};

export default function PartnerEquipePage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [busy, setBusy] = useState(false);

  const reload = async (tenantId: string) => {
    setLoading(true);
    const [m, inv] = await Promise.all([
      getTeamMembers(tenantId),
      getTeamInvitations(tenantId),
    ]);
    setMembers(m);
    setInvitations(inv);
    setLoading(false);
  };

  useEffect(() => {
    if (tenant?.id) reload(tenant.id);
  }, [tenant?.id]);

  if (tenantLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }
  if (!tenant) {
    return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    try {
      await inviteMember(tenant.id, inviteEmail.trim(), inviteRole);
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('editor');
      await reload(tenant.id);
      alert('Invitation envoyée par email.');
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRole = async (m: TeamMember, role: TeamRole) => {
    if (m.role === 'owner') return;
    try {
      await updateMemberRole(m.id, role);
      await reload(tenant.id);
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    }
  };

  const handleRemove = async (m: TeamMember) => {
    if (m.role === 'owner') {
      alert("Le propriétaire ne peut pas être retiré.");
      return;
    }
    if (!confirm('Retirer ce membre de l’équipe ?')) return;
    try {
      await removeMember(m.id);
      await reload(tenant.id);
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    }
  };

  const handleRevoke = async (inv: TeamInvitation) => {
    if (!confirm('Annuler cette invitation ?')) return;
    try {
      await revokeInvitation(inv.id);
      await reload(tenant.id);
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Mon équipe</h1>
          <p className="text-sm text-gris-texte">
            Invitez des collaborateurs avec des accès adaptés à leur rôle.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-bold bg-marine text-white px-4 py-2.5 rounded-full hover:bg-marine-dark flex-shrink-0"
        >
          <Plus size={16} /> Inviter
        </button>
      </div>

      {/* Rappel des rôles */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {(['owner', 'editor', 'viewer'] as TeamRole[]).map((r) => (
          <div key={r} className="bg-white border border-gris-ligne rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-marine" />
              <span className="font-bold text-marine text-sm">{ROLE_LABELS[r]}</span>
            </div>
            <p className="text-xs text-gris-texte">{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Loader2 size={22} className="text-marine animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Membres */}
          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gris-ligne text-xs font-bold text-gris-texte uppercase">
              Membres ({members.length})
            </div>
            {members.length === 0 ? (
              <div className="p-8 text-center text-sm text-gris-texte">
                <Users size={28} className="text-gris-ligne mx-auto mb-2" />
                Aucun membre.
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gris-ligne last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-marine/10 flex items-center justify-center text-marine font-bold text-xs flex-shrink-0">
                      {ROLE_LABELS[m.role].charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-marine">
                        Membre · {ROLE_LABELS[m.role]}
                      </div>
                      <div className="text-[11px] text-gris-doux">
                        Depuis le {new Date(m.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.role !== 'owner' ? (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => handleRole(m, e.target.value as TeamRole)}
                          className="text-xs border border-gris-ligne rounded-lg px-2 py-1.5 focus:border-marine outline-none"
                        >
                          <option value="editor">Éditeur</option>
                          <option value="viewer">Lecteur</option>
                        </select>
                        <button
                          onClick={() => handleRemove(m)}
                          className="text-gris-doux hover:text-red-500 p-1.5"
                          title="Retirer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${ROLE_STYLES.owner}`}>
                        Propriétaire
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Invitations en attente */}
          {invitations.length > 0 && (
            <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden">
              <div className="px-4 py-3 border-b border-gris-ligne text-xs font-bold text-gris-texte uppercase">
                Invitations en attente ({invitations.length})
              </div>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gris-ligne last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock size={16} className="text-orange-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-marine truncate">{inv.email}</div>
                      <div className="text-[11px] text-gris-doux">
                        {ROLE_LABELS[inv.role]} · invité le{' '}
                        {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(inv)}
                    className="text-xs font-bold text-gris-texte hover:text-red-500 px-2 py-1.5"
                  >
                    Annuler
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modale invitation */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-marine text-base">Inviter un collaborateur</h2>
              <button onClick={() => setInviteOpen(false)} className="text-gris-doux">
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-bold text-gris-texte uppercase mb-1.5">
              Email
            </label>
            <div className="relative mb-4">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collaborateur@email.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
            </div>

            <label className="block text-xs font-bold text-gris-texte uppercase mb-1.5">
              Rôle
            </label>
            <div className="space-y-2 mb-5">
              {(['editor', 'viewer'] as TeamRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    inviteRole === r ? 'border-marine bg-marine/5' : 'border-gris-ligne hover:border-marine/40'
                  }`}
                >
                  <div className="font-bold text-marine text-sm">{ROLE_LABELS[r]}</div>
                  <div className="text-xs text-gris-texte">{ROLE_DESCRIPTIONS[r]}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setInviteOpen(false)}
                disabled={busy}
                className="text-xs font-bold text-gris-texte px-4 py-2.5 rounded-full hover:bg-gris-fond"
              >
                Annuler
              </button>
              <button
                onClick={handleInvite}
                disabled={busy || !inviteEmail.trim()}
                className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark disabled:opacity-60"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Envoyer l&apos;invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
