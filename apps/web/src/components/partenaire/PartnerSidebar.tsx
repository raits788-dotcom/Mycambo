'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Store, Inbox, Star, BarChart3,
  Users, User, Settings, Loader2,
} from 'lucide-react';
import { cn } from '@my-cambo/utils';
import { useCurrentTenant } from '@/lib/use-current-tenant';

const NAV_ITEMS = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard, href: '/espace-partenaire/dashboard' },
  { id: 'etablissements', label: 'Mes établissements', icon: Store, href: '/espace-partenaire/etablissements' },
  { id: 'demandes', label: 'Demandes reçues', icon: Inbox, href: '/espace-partenaire/demandes' },
  { id: 'avis', label: 'Avis', icon: Star, href: '/espace-partenaire/avis' },
  { id: 'statistiques', label: 'Statistiques', icon: BarChart3, href: '/espace-partenaire/statistiques' },
];

const ACCOUNT_ITEMS = [
  { id: 'equipe', label: 'Mon équipe', icon: Users, href: '/espace-partenaire/equipe' },
  { id: 'profil', label: 'Mon profil', icon: User, href: '/espace-partenaire/profil' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/espace-partenaire/parametres' },
];

function getInitials(name: string): string {
  if (!name) return '??';
  return name.split(/\s+/).map((w) => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function PartnerSidebar() {
  const pathname = usePathname();
  const { tenant, loading } = useCurrentTenant();

  const initials = tenant ? getInitials(tenant.name) : '??';

  return (
    <aside className="w-64 bg-white border-r border-gris-ligne flex flex-col shrink-0 min-h-screen">
      {/* Bloc identité */}
      <div className="p-4 border-b border-gris-ligne">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gris-fond flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-gris-doux" />
            </div>
            <div className="text-xs text-gris-doux">Chargement...</div>
          </div>
        ) : tenant ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-khmer text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-marine truncate">{tenant.name}</div>
              <div className="text-[10px] text-rice flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rice" />
                Vérifiée
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gris-doux">Aucun tenant</div>
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5 mb-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-marine text-white font-bold'
                    : 'text-gris-texte hover:bg-gris-fond hover:text-marine'
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-gris-ligne pt-4 space-y-0.5">
          {ACCOUNT_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-marine text-white font-bold'
                    : 'text-gris-texte hover:bg-gris-fond hover:text-marine'
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}