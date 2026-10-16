'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, User, ChevronDown, Star, LogOut, Heart,
  MessageSquare, Inbox, Building2, LayoutDashboard, Shield, UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import {
  SECTORS, DISCOVER, HUBS, FIXED_LEFT, FIXED_RIGHT,
} from '@/lib/nav-config';
import { createBrowserClient } from '@supabase/ssr';
import { NotificationBell } from '@my-cambo/ui';

interface HeaderUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'partner' | 'admin';
}

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ▼▼▼ DÉTECTION PAGE PUBLIQUE COMMERCE ▼▼▼
  const isPublicCommercePage = pathname?.startsWith('/commerce/') || false;
  // ▲▲▲ FIN DÉTECTION ▲▲▲

  const allItems = [
    ...FIXED_LEFT,
    ...SECTORS,
    ...DISCOVER,
    ...HUBS,
    ...FIXED_RIGHT,
  ];

  // Charge l'utilisateur connecté
  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setMounted(true);
        return;
      }

      const u = session.user;
      const appMeta = u.app_metadata || {};
      let role: HeaderUser['role'] = 'user';

      if (appMeta.role === 'superadmin' || appMeta.role === 'admin') {
        role = 'admin';
      } else {
        const { data: tenantUser } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', u.id)
          .maybeSingle();

        if (tenantUser) role = 'partner';
      }

      setUser({
        id: u.id,
        email: u.email || '',
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Utilisateur',
        role,
      });
      setMounted(true);
    })();
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    setUser(null);
    setAccountOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gris-ligne">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 md:gap-5 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
                className="flex flex-col justify-between w-6 h-4 cursor-pointer flex-shrink-0"
              >
                <span className="block h-0.5 w-full bg-marine rounded" />
                <span className="block h-0.5 w-full bg-marine rounded" />
                <span className="block h-0.5 w-full bg-marine rounded" />
              </button>

              <Link href="/" className="flex items-center flex-shrink-0">
                <img
                  src="/logo-cambo.png"
                  alt="myCAMBO"
                  className="h-14 md:h-20 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <button
                aria-label="Rechercher"
                className="text-marine hover:text-marine-light transition-colors"
              >
                <Search size={20} />
              </button>

              {/* ▼▼▼ SUR PAGE PUBLIQUE : boutons Connexion / Inscription ▼▼▼ */}
              {isPublicCommercePage ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/connexion"
                    className="text-xs font-bold text-marine hover:text-marine-light px-3 py-2"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark transition-colors"
                  >
                    Inscription
                  </Link>
                </div>
              ) : (
                <>
                  {/* NOTIFICATION BELL (si connecté) */}
                  {user && mounted && (
                    <NotificationBell
                      recipientType="user"
                      recipientId={user.id}
                    />
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      aria-label="Mon compte"
                      className={cn(
                        'flex items-center gap-1.5 text-marine hover:text-marine-light transition-colors',
                        user && 'bg-gris-fond hover:bg-gris-ligne rounded-full pl-1 pr-2.5 py-1'
                      )}
                    >
                      {user && mounted ? (
                        <>
                          <span className="w-7 h-7 rounded-full bg-marine text-white flex items-center justify-center text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                            {user.name.split(' ')[0]}
                          </span>
                        </>
                      ) : (
                        <User size={20} />
                      )}
                      <ChevronDown size={14} />
                    </button>

                    {accountOpen && mounted && (
                      <AccountDropdown
                        user={user}
                        onClose={() => setAccountOpen(false)}
                        onLogout={handleLogout}
                      />
                    )}
                  </div>
                </>
              )}
              {/* ▲▲▲ FIN CONDITIONNEL ▲▲▲ */}
            </div>
          </div>
        </div>

        <nav className="bg-marine border-b border-marine-dark">
          <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {allItems.map((item) => (
                <NavItemLink key={item.id} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </nav>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={allItems}
      />
    </>
  );
}

// ============================================================================
// DROPDOWN DU MENU COMPTE
// ============================================================================
function AccountDropdown({
  user, onClose, onLogout,
}: {
  user: HeaderUser | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  if (!user) {
    return (
      <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-50">
        <Link href="/connexion" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <UserCircle size={16} className="text-gris-doux" />
          Connexion
        </Link>
        <Link href="/inscription" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Star size={16} className="text-gris-doux" />
          Créer un compte
        </Link>

        <div className="border-t border-gris-ligne my-1.5" />

        <Link href="/espace-partenaire/connexion" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Building2 size={16} className="text-gris-doux" />
          Espace partenaire
        </Link>
        <Link href="/partenaire" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ic-or font-bold hover:bg-gris-fond" onClick={onClose}>
          <Star size={16} className="fill-ic-or text-ic-or" />
          Devenir partenaire
        </Link>
      </div>
    );
  }

  if (user.role === 'partner') {
    return (
      <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-50">
        <div className="px-4 py-2 border-b border-gris-ligne mb-1">
          <div className="text-xs text-gris-doux">Connecté en tant que</div>
          <div className="text-sm font-bold text-marine truncate">{user.name}</div>
          <div className="text-[10px] text-ic-or font-bold uppercase tracking-wider mt-0.5">Partenaire</div>
        </div>

        <Link href="/espace-partenaire/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <LayoutDashboard size={16} className="text-gris-doux" />
          Vue d&apos;ensemble
        </Link>
        <Link href="/espace-partenaire/etablissements" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Building2 size={16} className="text-gris-doux" />
          Mes établissements
        </Link>
        <Link href="/espace-partenaire/demandes" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Inbox size={16} className="text-gris-doux" />
          Demandes reçues
        </Link>
        <Link href="/espace-partenaire/avis" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Star size={16} className="text-gris-doux" />
          Avis
        </Link>

        <div className="border-t border-gris-ligne my-1.5" />

        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-50">
        <div className="px-4 py-2 border-b border-gris-ligne mb-1">
          <div className="text-xs text-gris-doux">Connecté en tant que</div>
          <div className="text-sm font-bold text-marine truncate">{user.name}</div>
          <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-0.5">Administrateur</div>
        </div>

        <a href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
          <Shield size={16} className="text-gris-doux" />
          Console admin
        </a>

        <div className="border-t border-gris-ligne my-1.5" />

        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 z-50">
      <div className="px-4 py-2 border-b border-gris-ligne mb-1">
        <div className="text-xs text-gris-doux">Connecté en tant que</div>
        <div className="text-sm font-bold text-marine truncate">{user.name}</div>
        <div className="text-[10px] text-marine font-bold uppercase tracking-wider mt-0.5">Utilisateur</div>
      </div>

      <Link href="/mon-compte" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
        <LayoutDashboard size={16} className="text-gris-doux" />
        Mon espace
      </Link>
      <Link href="/mon-compte/favoris" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
        <Heart size={16} className="text-gris-doux" />
        Mes favoris
      </Link>
      <Link href="/mon-compte/avis" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
        <Star size={16} className="text-gris-doux" />
        Mes avis
      </Link>
      <Link href="/mon-compte/demandes" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-marine hover:bg-gris-fond" onClick={onClose}>
        <MessageSquare size={16} className="text-gris-doux" />
        Mes demandes
      </Link>

      <div className="border-t border-gris-ligne my-1.5" />

      <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  );
}

// ============================================================================
// LIEN DE NAVIGATION
// ============================================================================
function NavItemLink({ item, pathname }: { item: any; pathname: string }) {
  const isActive = (() => {
    if (item.href === '/rubrique/hotel' && pathname.startsWith('/rubrique/hotel')) return true;
    if (item.href === '/rubrique/restaurant' && pathname.startsWith('/rubrique/restaurant')) return true;
    if (item.href === '/rubrique/association' && pathname.startsWith('/rubrique/association')) return true;
    if (item.href === '/rubrique/activite' && pathname.startsWith('/rubrique/activite')) return true;
    if (item.href === '/rubrique/shopping' && pathname.startsWith('/rubrique/shopping')) return true;
    if (item.href === '/rubrique/transport' && pathname.startsWith('/rubrique/transport')) return true;
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || pathname.startsWith(item.href + '/');
  })();

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  if (!item.active) {
    return (
      <span className="flex-shrink-0 px-3 md:px-4 py-3 text-xs md:text-sm font-semibold text-white/40 cursor-not-allowed whitespace-nowrap">
        {item.label}
      </span>
    );
  }

  if (hasSubmenu) {
    return (
      <div className="relative group flex-shrink-0">
        <Link
          href={item.href}
          className={cn(
            'relative flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap',
            isActive ? 'text-white' : 'text-white/90 hover:text-white hover:bg-white/10'
          )}
        >
          {item.label}
          <ChevronDown size={12} />
          {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-ic-or rounded-t-full" />}
        </Link>
        <div className="absolute top-full left-0 min-w-[200px] bg-white border border-gris-ligne rounded-md shadow-cb-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {item.submenu.map((sub: any, i: number) => (
            <Link key={i} href={sub.href} className="block px-4 py-2.5 text-sm text-marine hover:bg-gris-fond">
              {sub.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex-shrink-0 px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5',
        item.highlight
          ? 'text-ic-or hover:bg-white/10 font-bold'
          : isActive
            ? 'text-white'
            : 'text-white/90 hover:text-white hover:bg-white/10'
      )}
    >
      {item.highlight && <Star size={14} className="fill-ic-or" />}
      {item.label}
      {isActive && !item.highlight && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-ic-or rounded-t-full" />
      )}
    </Link>
  );
}