'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Building2,
  Store,
  Star,
  Package,
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  BarChart3,
  ScrollText,
  Users,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@my-cambo/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard, href: '/dashboard' },
      { id: 'demandes', label: 'Demandes', icon: Inbox, href: '/demandes' },
    ],
  },
  {
    title: 'Partenaires',
    items: [
      { id: 'tenants', label: 'Tenants', icon: Building2, href: '/tenants' },
      { id: 'etablissements', label: 'Établissements', icon: Store, href: '/etablissements' },
      { id: 'coups-de-coeur', label: 'Coups de cœur', icon: Star, href: '/coups-de-coeur' },
    ],
  },
  {
    title: 'Monétisation',
    items: [
      { id: 'formules', label: 'Formules', icon: Package, href: '/formules' },
      { id: 'abonnements', label: 'Abonnements', icon: CreditCard, href: '/abonnements' },
      { id: 'paiements', label: 'Paiements', icon: DollarSign, href: '/paiements' },
      { id: 'ca', label: "Chiffre d'affaires", icon: TrendingUp, href: '/abonnements?tab=ca' },
    ],
  },
  {
    title: 'Contenu',
    items: [
      { id: 'cms-pages', label: 'Pages', icon: FileText, href: '/cms' },
      { id: 'cms-carrousel', label: 'Carrousel', icon: ImageIcon, href: '/cms?tab=carrousel' },
    ],
  },
  {
    title: 'Système',
    items: [
      { id: 'statistiques', label: 'Statistiques', icon: BarChart3, href: '/statistiques' },
      { id: 'logs', label: 'Logs & audit', icon: ScrollText, href: '/logs' },
      { id: 'roles', label: 'Rôles', icon: Users, href: '/roles' },
      { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/parametres' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ink text-white flex flex-col shrink-0 min-h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <div className="font-extrabold text-sm">myCAMBO</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">
              Super Admin
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-3 mb-2">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href.split('?')[0] + '/');

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 text-[10px] text-white/40">
        v0.1 · Supabase · Cloudflare
      </div>
    </aside>
  );
}