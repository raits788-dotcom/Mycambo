'use client';

import { useState } from 'react';
import {
  Plus,
  Users,
  Mail,
  Crown,
  Shield,
  Pencil,
  MoreVertical,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_PARTNER_TEAM,
  PARTNER_ROLES,
  type PartnerTeamMember,
} from '@/lib/partner-mock';
import { timeAgo } from '@/lib/user-mock';

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
};

export default function EquipePage() {
  const [members, setMembers] = useState(MOCK_PARTNER_TEAM);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    if (!confirm('Retirer ce collaborateur ?')) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setOpenMenu(null);
  };

  const handleChangeRole = (id: string, role: PartnerTeamMember['role']) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
    setOpenMenu(null);
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Mon équipe
          </h1>
          <p className="text-sm text-gris-texte">
            {members.length} membre{members.length > 1 ? 's' : ''} dans votre équipe.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-sm"
        >
          <Plus size={14} />
          Inviter un collaborateur
        </button>
      </div>

      {/* Info rôles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <b>3 niveaux d&apos;accès :</b>
            <ul className="mt-2 space-y-1">
              <li>
                <b>Propriétaire</b> : accès complet, seule personne à pouvoir
                gérer la facturation et supprimer le compte.
              </li>
              <li>
                <b>Administrateur</b> : gestion complète sauf facturation.
              </li>
              <li>
                <b>Éditeur</b> : modification des fiches uniquement.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
        <div className="divide-y divide-gris-ligne">
          {members.map((member) => {
            const roleConfig = PARTNER_ROLES[member.role];
            const RoleIcon = ROLE_ICONS[member.role];
            const isOwner = member.role === 'owner';

            return (
              <div
                key={member.id}
                className="px-5 py-4 flex items-center gap-4 flex-wrap"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-marine text-white flex items-center justify-center font-bold flex-shrink-0">
                  {member.avatarInitial}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-marine text-sm">
                      {member.name}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                        roleConfig.color
                      )}
                    >
                      <RoleIcon size={10} />
                      {roleConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gris-texte mt-0.5">
                    <Mail size={11} />
                    {member.email}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-0.5">
                    Membre depuis {timeAgo(member.joinedAt)}
                  </div>
                </div>

                {/* Menu actions */}
                {!isOwner && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === member.id ? null : member.id)
                      }
                      className="w-9 h-9 rounded-full hover:bg-gris-fond flex items-center justify-center transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical size={16} className="text-gris-texte" />
                    </button>

                    {openMenu === member.id && (
                      <div className="absolute top-full right-0 mt-1 min-w-[220px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-20">
                        <div className="px-3 py-1.5 text-[10px] text-gris-doux uppercase tracking-wider font-bold">
                          Changer le rôle
                        </div>
                        {(['admin', 'editor'] as const).map((role) => {
                          const RoleIconItem = ROLE_ICONS[role];
                          const config = PARTNER_ROLES[role];
                          const isCurrent = member.role === role;

                          return (
                            <button
                              key={role}
                              onClick={() => handleChangeRole(member.id, role)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-marine hover:bg-gris-fond text-left"
                            >
                              <RoleIconItem
                                size={14}
                                className="text-gris-doux"
                              />
                              <span className="flex-1">
                                {config.label}
                              </span>
                              {isCurrent && (
                                <Check size={12} className="text-green-600" />
                              )}
                            </button>
                          );
                        })}

                        <div className="border-t border-gris-ligne my-1" />

                        <button
                          onClick={() => handleRemove(member.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        >
                          <X size={14} />
                          Retirer de l&apos;équipe
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modale d'invitation */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(data) => {
            console.log('📧 Invitation envoyée :', data);
            setShowInviteModal(false);
          }}
        />
      )}

      {/* Overlay pour fermer le menu */}
      {openMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenu(null)}
        />
      )}
    </>
  );
}

// ===== Modale d'invitation =====
function InviteMemberModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (data: { email: string; role: string }) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PartnerTeamMember['role']>('editor');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || email.length < 5) {
      setError('Adresse email invalide.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onInvite({ email, role });
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="w-14 h-14 rounded-full bg-marine/10 flex items-center justify-center mb-5">
            <Users size={26} className="text-marine" />
          </div>

          <h3 className="text-2xl font-extrabold text-marine mb-2">
            Inviter un collaborateur
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Un email d&apos;invitation sera envoyé. La personne pourra rejoindre
            votre équipe en cliquant sur le lien.
          </p>

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
            >
              Adresse email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborateur@email.com"
              required
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>

          {/* Rôle */}
          <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
            Rôle *
          </label>
          <div className="space-y-2 mb-5">
            {(['admin', 'editor'] as const).map((r) => {
              const config = PARTNER_ROLES[r];
              const RoleIcon = ROLE_ICONS[r];
              const isSelected = role === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-all flex items-start gap-3',
                    isSelected
                      ? 'border-marine bg-marine/5 ring-1 ring-marine'
                      : 'border-gris-ligne hover:border-marine/50'
                  )}
                >
                  <RoleIcon
                    size={16}
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      isSelected ? 'text-marine' : 'text-gris-doux'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-marine mb-0.5">
                      {config.label}
                    </div>
                    <div className="text-xs text-gris-texte">
                      {config.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-bold border border-gris-ligne text-marine rounded-full py-3 hover:border-marine transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-marine text-white font-bold rounded-full py-3 hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {submitting ? (
                'Envoi...'
              ) : (
                <>
                  <Mail size={14} />
                  Envoyer l&apos;invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}