'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Heart, Star, MessageSquare, User, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import {
  getUserFavorites,
  getUserReviews,
  getUserRequests,
  getPendingReviewsCount,
  getNewRequestsCount,
} from '@/lib/user';

const NAV_ITEMS = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard, href: '/mon-compte' },
  { id: 'favoris', label: 'Mes favoris', icon: Heart, href: '/mon-compte/favoris', badge: 'favorites' },
  { id: 'avis', label: 'Mes avis', icon: Star, href: '/mon-compte/avis', badge: 'reviews' },
  { id: 'demandes', label: 'Mes demandes', icon: MessageSquare, href: '/mon-compte/demandes', badge: 'requests' },
];

const NAV_ITEMS_BOTTOM = [
  { id: 'profil', label: 'Mon profil', icon: User, href: '/mon-compte/profil' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/mon-compte/parametres' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({
    favorites: 0, reviews: 0, requests: 0,
    pendingReviews: 0, newRequests: 0,
  });

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const u = session.user;

      const [favorites, reviews, requests, pending, newReq] = await Promise.all([
        getUserFavorites(u.id),
        getUserReviews(u.id),
        getUserRequests(u.email || ''),
        getPendingReviewsCount(u.id),
        getNewRequestsCount(u.email || ''),
      ]);

      setCounts({
        favorites: favorites.length,
        reviews: reviews.length,
        requests: requests.length,
        pendingReviews: pending,
        newRequests: newReq,
      });
    })();
  }, [pathname]);

  const getBadge = (badgeType?: string) => {
    if (badgeType === 'favorites' && counts.favorites > 0) {
      return <span className="ml-auto bg-gris-fond text-gris-texte text-[10px] px-1.5 py-0.5 rounded-full font-bold">{counts.favorites}</span>;
    }
    if (badgeType === 'reviews' && counts.reviews > 0) {
      const pending = counts.pendingReviews > 0;
      return <span className={cn('ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold', pending ? 'bg-ic-or text-marine-dark' : 'bg-gris-fond text-gris-texte')}>{counts.reviews}</span>;
    }
    if (badgeType === 'requests' && counts.requests > 0) {
      const newOnes = counts.newRequests > 0;
      return <span className={cn('ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold', newOnes ? 'bg-ic-vert text-white' : 'bg-gris-fond text-gris-texte')}>{counts.requests}</span>;
    }
    return null;
  };

  const renderItem = (item: typeof NAV_ITEMS[0]) => {
    const Icon = item.icon;
    const isActive = item.href === '/mon-compte'
      ? pathname === '/mon-compte'
      : pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
          isActive ? 'bg-marine text-white font-bold' : 'text-gris-texte hover:bg-gris-fond hover:text-marine'
        )}
      >
        <Icon size={16} className="flex-shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {getBadge((item as any).badge)}
      </Link>
    );
  };

  return (
    <aside className="bg-white rounded-lg border border-gris-ligne p-3 h-fit lg:sticky lg:top-[180px]">
      <nav className="space-y-0.5">{NAV_ITEMS.map(renderItem)}</nav>
      <div className="border-t border-gris-ligne my-3" />
      <nav className="space-y-0.5">{NAV_ITEMS_BOTTOM.map(renderItem)}</nav>
    </aside>
  );
}