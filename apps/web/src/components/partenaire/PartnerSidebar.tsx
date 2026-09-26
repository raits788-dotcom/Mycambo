'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Inbox,
  Star,
  BarChart3,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_PARTNER,
  getPartnerRequestsByStatus,
  getPartnerReviewsByStatus,
} from '@/lib/partner-mock';
import { Users } from 'lucide-react';
const NAV_ITEMS = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard, href: '/espace-partenaire/dashboard' },
  { id: 'etablissements', label: 'Mes établissements', icon: Building2, href: '/espace-partenaire/etablissements' },
  { id: 'demandes', label: 'Demandes reçues', icon: Inbox, href: '/espace-partenaire/demandes', badge: 'requests' },
  { id: 'avis', label: 'Avis', icon: Star, href: '/espace-partenaire/avis', badge: 'reviews' },
  { id: 'statistiques', label: 'Statistiques', icon: BarChart3, href: '/espace-partenaire/statistiques' },
];

const NAV_ITEMS_BOTTOM = [
  { id: 'equipe', label: 'Mon équipe', icon: Users, href: '/espace-partenaire/equipe' },
  { id: 'profil', label: 'Mon profil', icon: User, href: '/espace-partenaire/profil' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/espace-partenaire/parametres' },
];

export default function PartnerSidebar() {
  const pathname = usePathname();

  const newRequestsCount = getPartnerRequestsByStatus('new').length;
  const pendingReviewsCount = getPartnerReviewsByStatus('pending').length;

  const getBadge = (badgeType?: string) => {
    if (badgeType === 'requests' && newRequestsCount > 0) {
      return (
        <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
          {newRequestsCount}
        </span>
      );
    }
    if (badgeType === 'reviews' && pendingReviewsCount > 0) {
      return (
        <span className="ml-auto bg-ic-or text-marine-dark text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
          {pendingReviewsCount}
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
            ? 'bg-marine text-white font-bold'
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
      <div className="px-3 py-3 mb-3 border-b border-gris-ligne">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-khmer text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {MOCK_PARTNER.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-marine text-sm truncate">
              {MOCK_PARTNER.name}
            </div>
            <div className="text-[10px] text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Vérifiée
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5">
        {NAV_ITEMS.map(renderItem)}
      </nav>

      <div className="border-t border-gris-ligne my-3" />

      <nav className="space-y-0.5">
        {NAV_ITEMS_BOTTOM.map(renderItem)}
      </nav>
    </aside>
  );
}