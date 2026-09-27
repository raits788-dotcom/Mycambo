'use client';

import { Plus, Shield, UserCog, Eye, Mail, Edit3, Trash2 } from 'lucide-react';

type Role = 'superadmin' | 'admin' | 'moderator';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin: string;
  initials: string;
}

const MOCK_ADMINS: AdminUser[] = [
  { id: 'a1', name: 'Super Admin', email: 'admin@mycambo.app', role: 'superadmin', lastLogin: '2025-02-15 09:23', initials: 'SA' },
  { id: 'a2', name: 'Sophie Martin', email: 'sophie@mycambo.app', role: 'admin', lastLogin: '2025-02-14 16:11', initials: 'SM' },
  { id: 'a3', name: 'Pierre Durand', email: 'pierre@mycambo.app', role: 'moderator', lastLogin: '2025-02-13 11:08', initials: 'PD' },
];

const ROLE_STYLES: Record<Role, { label: string; style: string; icon: React.ElementType }> = {
  superadmin: { label: 'Super-admin', style: 'bg-red-100 text-red-700', icon: Shield },
  admin: { label: 'Administrateur', style: 'bg-purple-100 text-purple-700', icon: UserCog },
  moderator: { label: 'Modérateur', style: 'bg-blue-100 text-blue-700', icon: Eye },
};

const PERMISSIONS = [
  { name: 'Gérer les administrateurs', roles: ['superadmin'] },
  { name: 'Configurer la plateforme', roles: ['superadmin'] },
  { name: 'Valider les partenaires', roles: ['superadmin', 'admin'] },
  { name: 'Suspendre des comptes', roles: ['superadmin', 'admin'] },
  { name: 'Modérer les avis', roles: ['superadmin', 'admin', 'moderator'] },
  { name: 'Signaler du contenu', roles: ['superadmin', 'admin', 'moderator'] },
];

export default function RolesPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Rôles & permissions
          </h1>
          <p className="text-sm text-gris-texte">
            {MOCK_ADMINS.length} administrateurs · Gestion des accès à la console.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark">
          <Plus size={15} />
          Inviter un admin
        </button>
      </div>

      {/* Liste admins */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm mb-6">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Administrateurs actifs</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-bold">Utilisateur</th>
              <th className="text-left px-3 py-3 font-bold">Rôle</th>
              <th className="text-left px-3 py-3 font-bold">Dernière connexion</th>
              <th className="text-right px-6 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {MOCK_ADMINS.map((admin) => {
              const roleConfig = ROLE_STYLES[admin.role];
              const RoleIcon = roleConfig.icon;
              return (
                <tr key={admin.id} className="hover:bg-gris-fond/50">
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
                  <td className="px-3 py-4">
                    <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ' + roleConfig.style}>
                      <RoleIcon size={10} />
                      {roleConfig.label}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-xs text-gris-texte">{admin.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine">
                        <Edit3 size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matrice permissions */}
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
              <th className="text-center px-3 py-3 font-bold">Modérateur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {PERMISSIONS.map((perm) => (
              <tr key={perm.name} className="hover:bg-gris-fond/50">
                <td className="px-6 py-4 font-medium text-marine">{perm.name}</td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('superadmin') ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gris-doux">—</span>}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('admin') ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gris-doux">—</span>}
                </td>
                <td className="px-3 py-4 text-center">
                  {perm.roles.includes('moderator') ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gris-doux">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}