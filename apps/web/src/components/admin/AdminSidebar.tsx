'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Inbox,
  Star,
  Users,
  Flag,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ADMIN, ADMIN_ROLES } from '@/lib/admin-mock';
import {
  getContentAlerts,
  getActiveSuspensions,
} from '@/lib/suspensions';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    id: 'etablissements',
    label: 'Établissements',
    icon: Building2,
    href: '/admin/etablissements',
    badge: 'alerts',
  },
  {
    id: 'demandes',
    label: 'Demandes',
    icon: Inbox,
    href: '/admin/demandes',
  },
  {
    id: 'avis',
    label: 'Modération avis',
    icon: Star,
    href: '/admin/avis',
  },
  {
    id: 'signalements',
    label: 'Signalements',
    icon: Flag,
    href: '/admin/signalements',
    badge: 'alerts',
  },
  {
    id: 'utilisateurs',
    label: 'Utilisateurs',
    icon: Users,
    href: '/admin/utilisateurs',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const roleConfig = ADMIN_ROLES[MOCK_ADMIN.role];

  const alertsCount = getContentAlerts().filter((a) => !a.reviewed).length;
  const suspensionsCount = getActiveSuspensions().length;

  const getBadge = (badgeType?: string) => {
    if (badgeType === 'alerts' && alertsCount > 0) {
      return (
        <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
          {alertsCount}
        </span>
      );
    }
    return null;
  };

  const renderItem = (item: typeof NAV_ITEMS[0]) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-red-600 text-white font-bold'
            : 'text-gris-texte hover:bg-gris-fond hover:text-marine'
        )}
      >
        <Icon size={16} className="flex-shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {getBadge(item.badge)}
      </Link>
    );
  };

  return (
    <aside className="bg-white rounded-lg border border-gris-ligne p-3 h-fit lg:sticky lg:top-6">
      {/* Bloc identité */}
      <div className="px-3 py-3 mb-3 border-b border-gris-ligne">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            <Shield size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-marine text-sm truncate">
              {MOCK_ADMIN.name}
            </div>
            <span
              className={cn(
                'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5',
                roleConfig.color
              )}
            >
              {roleConfig.label}
            </span>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5">
        {NAV_ITEMS.map(renderItem)}
      </nav>

      <div className="border-t border-gris-ligne my-3" />

      <nav className="space-y-0.5">
        <Link
          href="/admin/parametres"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gris-texte hover:bg-gris-fond hover:text-marine transition-colors"
        >
          <Settings size={16} className="flex-shrink-0" />
          <span>Paramètres</span>
        </Link>
      </nav>

      {/* Stats rapides */}
      <div className="mt-4 pt-4 border-t border-gris-ligne px-3">
        <div className="text-[10px] text-gris-doux uppercase tracking-wider font-bold mb-2">
          Alertes actives
        </div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gris-texte">Contenus signalés</span>
          <b className="text-red-600">{alertsCount}</b>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gris-texte">Fiches suspendues</span>
          <b className="text-orange-600">{suspensionsCount}</b>
        </div>
      </div>
    </aside>
  );
}