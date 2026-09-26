'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  User as UserIcon,
  Mail,
  Building2,
  Shield,
  Crown,
  Pencil,
  MoreVertical,
  Search,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_ADMIN,
  ADMIN_ROLES,
  type AdminRole,
} from '@/lib/admin-mock';
import { timeAgo } from '@/lib/user-mock';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'partner' | 'admin';
  adminRole?: AdminRole;
  joinedAt: string;
  status: 'active' | 'suspended';
  initials: string;
};

const MOCK_USERS: UserRow[] = [
  {
    id: 'u1',
    name: 'Admin myCAMBO',
    email: 'admin@mycambo.app',
    role: 'admin',
    adminRole: 'superadmin',
    joinedAt: '2024-01-01',
    status: 'active',
    initials: 'AM',
  },
  {
    id: 'u2',
    name: 'Sophie Martin',
    email: 'sophie@mycambo.app',
    role: 'admin',
    adminRole: 'moderator',
    joinedAt: '2024-03-15',
    status: 'active',
    initials: 'SM',
  },
  {
    id: 'u3',
    name: 'Sokha Chen',
    email: 'sokha@greenumbrella-kh.org',
    role: 'partner',
    joinedAt: '2024-01-15',
    status: 'active',
    initials: 'SC',
  },
  {
    id: 'u4',
    name: 'Marie Dupont',
    email: 'marie@email.com',
    role: 'user',
    joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    initials: 'MD',
  },
  {
    id: 'u5',
    name: 'Paul Dubois',
    email: 'paul@email.com',
    role: 'user',
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    initials: 'PD',
  },
];

type FilterRole = 'all' | 'user' | 'partner' | 'admin';

const ROLE_BADGE: Record<
  UserRow['role'],
  { label: string; color: string; icon: typeof Users }
> = {
  user: {
    label: 'Utilisateur',
    color: 'bg-gray-100 text-gray-700',
    icon: UserIcon,
  },
  partner: {
    label: 'Partenaire',
    color: 'bg-blue-100 text-blue-700',
    icon: Building2,
  },
  admin: {
    label: 'Admin',
    color: 'bg-red-100 text-red-700',
    icon: Shield,
  },
};

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [filter, setFilter] = useState<FilterRole>('all');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counts = useMemo(
    () => ({
      all: users.length,
      user: users.filter((u) => u.role === 'user').length,
      partner: users.filter((u) => u.role === 'partner').length,
      admin: users.filter((u) => u.role === 'admin').length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    let list = [...users];
    if (filter !== 'all') list = list.filter((u) => u.role === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );
  }, [users, filter, search]);

  const handleToggleStatus = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const isSuspending = user.status === 'active';
    if (
      !confirm(
        isSuspending
          ? `Suspendre le compte de ${user.name} ?`
          : `Réactiver le compte de ${user.name} ?`
      )
    )
      return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
    setOpenMenu(null);
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Utilisateurs
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez les comptes utilisateurs, partenaires et administrateurs.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg border border-gris-ligne p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full border border-gris-ligne rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <FilterBtn
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="Tous"
              count={counts.all}
            />
            <FilterBtn
              active={filter === 'user'}
              onClick={() => setFilter('user')}
              label="Utilisateurs"
              count={counts.user}
            />
            <FilterBtn
              active={filter === 'partner'}
              onClick={() => setFilter('partner')}
              label="Partenaires"
              count={counts.partner}
            />
            <FilterBtn
              active={filter === 'admin'}
              onClick={() => setFilter('admin')}
              label="Admins"
              count={counts.admin}
            />
          </div>
        </div>
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
          <div className="divide-y divide-gris-ligne">
            {filtered.map((u) => {
              const roleConfig = ROLE_BADGE[u.role];
              const RoleIcon = roleConfig.icon;
              const adminRoleConfig = u.adminRole
                ? ADMIN_ROLES[u.adminRole]
                : null;

              return (
                <div
                  key={u.id}
                  className={cn(
                    'px-5 py-4 flex items-center gap-4 flex-wrap',
                    u.status === 'suspended' && 'opacity-60'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      u.role === 'admin'
                        ? 'bg-red-600 text-white'
                        : u.role === 'partner'
                        ? 'bg-marine text-white'
                        : 'bg-gris-ligne text-marine'
                    )}
                  >
                    {u.initials}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <div className="font-bold text-marine text-sm">
                        {u.name}
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
                      {adminRoleConfig && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                            adminRoleConfig.color
                          )}
                        >
                          {adminRoleConfig.label}
                        </span>
                      )}
                      {u.status === 'suspended' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Suspendu
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gris-texte">
                      <Mail size={11} />
                      {u.email}
                    </div>
                    <div className="text-[10px] text-gris-doux mt-0.5">
                      Inscrit {timeAgo(u.joinedAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === u.id ? null : u.id)
                      }
                      className="w-9 h-9 rounded-full hover:bg-gris-fond flex items-center justify-center transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical size={16} className="text-gris-texte" />
                    </button>

                    {openMenu === u.id && (
                      <div className="absolute top-full right-0 mt-1 min-w-[200px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-20">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                            u.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          )}
                        >
                          {u.status === 'active' ? (
                            <>
                              <X size={14} /> Suspendre le compte
                            </>
                          ) : (
                            <>
                              <Check size={14} /> Réactiver le compte
                            </>
                          )}
                        </button>

                        {u.role === 'admin' && u.id !== MOCK_ADMIN.id && (
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              alert('Changer le rôle admin (à implémenter)');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-marine hover:bg-gris-fond text-left"
                          >
                            <Crown size={14} /> Changer le rôle
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Users size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun utilisateur
          </h2>
          <p className="text-sm text-gris-texte">
            Aucun utilisateur trouvé pour cette recherche.
          </p>
        </div>
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

function FilterBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-bold rounded-full px-4 py-2 transition-colors flex items-center gap-2 border',
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-white border-gris-ligne text-gris-texte hover:border-marine'
      )}
    >
      {label}
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
          active ? 'bg-white/20' : 'bg-gris-fond'
        )}
      >
        {count}
      </span>
    </button>
  );
}