'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, UserCog, Eye, Mail, Edit3, Trash2, Loader2 } from 'lucide-react';

type Role = 'superadmin' | 'admin' | 'moderator' | 'editor' | 'content_manager' | 'finance';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin: string | null;
  initials: string;
  mfa_enabled: boolean;
}

const ROLE_STYLES: Record<Role, { label: string; style: string; icon: React.ElementType }> = {
  superadmin: { label: 'Super-admin', style: 'bg-red-100 text-red-700', icon: Shield },
  admin: { label: 'Administrateur', style: 'bg-purple-100 text-purple-700', icon: UserCog },
  moderator: { label: 'Modérateur', style: 'bg-blue-100 text-blue-700', icon: Eye },
  editor: { label: 'Éditeur', style: 'bg-green-100 text-green-700', icon: Edit3 },
  content_manager: { label: 'Gestionnaire contenu', style: 'bg-yellow-100 text-yellow-700', icon: Edit3 },
  finance: { label: 'Finance', style: 'bg-orange-100 text-orange-700', icon: UserCog },
};

const PERMISSIONS = [
  { name: 'Gérer les administrateurs', roles: ['superadmin'] },
  { name: 'Configurer la plateforme', roles: ['superadmin'] },
  { name: 'Valider les partenaires', roles: ['superadmin', 'admin'] },
  { name: 'Suspendre des comptes', roles: ['superadmin', 'admin'] },
  { name: 'Gérer les paiements', roles: ['superadmin', 'admin', 'finance'] },
  { name: 'Publier du contenu', roles: ['superadmin', 'admin', 'content_manager'] },
  { name: 'Modérer les avis', roles: ['superadmin', 'admin', 'moderator'] },
  { name: 'Signaler du contenu', roles: ['superadmin', 'admin', 'moderator'] },
];

function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return 'XX';
  const cleaned = nameOrEmail.split('@')[0];
  const parts = cleaned.split(/[._\-\s]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.substring(0, 2).toUpperCase();
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Jamais';
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RolesPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Variables Supabase manquantes');
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/list-admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur de chargement');
        }

        const enriched: AdminUser[] = (result.admins || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          role: a.role as Role,
          lastLogin: a.lastLogin,
          initials: getInitials(a.name || a.email),
          mfa_enabled: a.mfa_enabled === true,
        }));

        setAdmins(enriched);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les administrateurs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Rôles &amp; permissions
          </h1>
          <p className="text-sm text-gris-texte">
            {loading
              ? 'Chargement...'
              : `${admins.length} administrateur${admins.length > 1 ? 's' : ''} · Gestion des accès à la console.`}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark">
          <Plus size={15} />
          Inviter un admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Liste admins */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm mb-6">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Administrateurs actifs</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
            <p className="text-sm text-gris-texte">Chargement des admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gris-texte">Aucun administrateur trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Utilisateur</th>
                <th className="text-left px-3 py-3 font-bold">Rôle</th>
                <th className="text-left px-3 py-3 font-bold">MFA</th>
                <th className="text-left px-3 py-3 font-bold">Dernière connexion</th>
                <th className="text-right px-6 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {admins.map((admin) => {
                const roleConfig = ROLE_STYLES[admin.role] || ROLE_STYLES.admin;
                const RoleIcon = roleConfig.icon;
                return (
                  <tr key={admin.id} className="hover:bg-gris-fond/50">
                    {/* Utilisateur */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                          {admin.initials}
                        </div>
                        <div>
                          <div className="font-bold text-marine">{admin.name}</div>
                          <div className="text-xs text-gris-texte flex items-center gap-1">
                            <Mail size={10} />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="px-3 py-4">
                      <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ' + roleConfig.style}>
                        <RoleIcon size={10} />
                        {roleConfig.label}
                      </span>
                    </td>

                    {/* MFA */}
                    <td className="px-3 py-4">
                      {admin.mfa_enabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                          🔐 Activée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700">
                          ⚠️ Sans MFA
                        </span>
                      )}
                    </td>

                    {/* Dernière connexion */}
                    <td className="px-3 py-4 text-xs text-gris-texte">
                      {formatDate(admin.lastLogin)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine"
                          title="Éditer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Matrice des permissions */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Matrice des permissions</h2>
          <p className="text-xs text-gris-texte mt-1">Ce que chaque rôle peut faire.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-bold">Permission</th>
              <th className="text-center px-3 py-3 font-bold">Super-admin</th>
              <th className="text-center px-3 py-3 font-bold">Admin</th>
              <th className="text-center px-3 py-3 font-bold">Finance</th>
              <th className="text-center px-3 py-3 font-bold">Content</th>
              <th className="text-center px-3 py-3 font-bold">Modérateur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {PERMISSIONS.map((perm) => (
              <tr key={perm.name} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 font-medium text-marine">{perm.name}</td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('superadmin') ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gris-doux">—</span>
                  )}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('admin') ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gris-doux">—</span>
                  )}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('finance') ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gris-doux">—</span>
                  )}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('content_manager') ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gris-doux">—</span>
                  )}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('moderator') ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gris-doux">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}