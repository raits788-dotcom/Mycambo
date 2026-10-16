'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Shield, AlertTriangle, X } from 'lucide-react';
import PartnerSidebar from '@/components/partenaire/PartnerSidebar';
import PartnerTopBar from '@/components/partenaire/PartnerTopBar';
import ImpersonationBanner from '@/components/partenaire/ImpersonationBanner';
import { getImpersonatedTenant, clearImpersonation } from '@/lib/impersonation';
import { createBrowserClient } from '@supabase/ssr';

const TOKEN_KEY = 'mycambo_impersonate_token';

export default function PartnerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [adminBannerDismissed, setAdminBannerDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token: string | null = null;

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const urlToken = url.searchParams.get('impersonate');

        if (urlToken) {
          sessionStorage.setItem(TOKEN_KEY, urlToken);
          token = urlToken;
        } else {
          token = sessionStorage.getItem(TOKEN_KEY);
        }
      }

      // 1. Mode IMPERSONATION (SuperAdmin qui se fait passer pour un tenant)
      if (token) {
        const tenant = await getImpersonatedTenant();
        if (cancelled) return;

        if (tenant) {
          setIsImpersonating(true);
          setAuthorized(true);
          setChecking(false);

          const url = new URL(window.location.href);
          if (url.searchParams.has('impersonate')) {
            url.searchParams.delete('impersonate');
            window.history.replaceState({}, '', url.toString());
          }
          return;
        }
        clearImpersonation();
      }

      // 2. Mode NORMAL (session Supabase)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        if (pathname !== '/espace-partenaire/connexion') {
          router.replace('/espace-partenaire/connexion');
        }
        return;
      }

      // ▼▼▼ DÉTECTION ADMIN (SuperAdmin connecté directement) ▼▼▼
      const role = session.user.app_metadata?.role;
      const isAdmin = role === 'superadmin' || role === 'admin';
      setIsAdminSession(isAdmin);
      // ▲▲▲ FIN DÉTECTION ▲▲▲

      setAuthorized(true);
      setChecking(false);
    })();

    return () => { cancelled = true; };
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gris-fond">
        <Loader2 size={24} className="text-marine animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  const showAdminBanner = isAdminSession && !isImpersonating && !adminBannerDismissed;
  const showImpersonationBanner = isImpersonating;

  return (
    <div className="min-h-screen bg-gris-fond">
      {/* Bandeau violet — Impersonation */}
      {showImpersonationBanner && <ImpersonationBanner />}

      {/* Bandeau jaune — Admin connecté directement */}
      {showAdminBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-400 text-yellow-950 px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertTriangle size={14} />
            MODE ADMIN — Vous êtes connecté en tant que SuperAdmin sur l&apos;espace partenaire
          </div>
          <button
            onClick={() => setAdminBannerDismissed(true)}
            aria-label="Fermer"
            className="flex items-center gap-1 text-xs font-bold bg-yellow-950/10 hover:bg-yellow-950/20 px-3 py-1 rounded-full"
          >
            <X size={12} /> Fermer
          </button>
        </div>
      )}

      <div className={`flex ${(showImpersonationBanner || showAdminBanner) ? 'pt-10' : ''}`}>
        <PartnerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <PartnerTopBar />
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}