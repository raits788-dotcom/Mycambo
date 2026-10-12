'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

  console.log('🟦 [LAYOUT] RENDER — pathname:', pathname);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      console.log('🟦 [LAYOUT] useEffect START');

      let token: string | null = null;

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const urlToken = url.searchParams.get('impersonate');
        console.log('🟦 [LAYOUT] Token depuis URL:', urlToken);

        if (urlToken) {
          sessionStorage.setItem(TOKEN_KEY, urlToken);
          token = urlToken;
        } else {
          token = sessionStorage.getItem(TOKEN_KEY);
          console.log('🟦 [LAYOUT] Token depuis sessionStorage:', token);
        }
      }

      if (token) {
        console.log('🟦 [LAYOUT] Token trouvé → validation...');
        const tenant = await getImpersonatedTenant();
        console.log('🟦 [LAYOUT] Tenant retourné:', tenant?.name || 'NULL');

        if (cancelled) return;

        if (tenant) {
          console.log('🟦 [LAYOUT] ✅ IMPERSONATION OK —', tenant.name);
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
        console.log('🟦 [LAYOUT] ❌ Token invalide → clear');
        clearImpersonation();
      }

      console.log('🟦 [LAYOUT] Pas de token → vérif session normale');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        console.log('🟦 [LAYOUT] Pas de session → redirect /connexion');
        if (pathname !== '/espace-partenaire/connexion') {
          router.replace('/espace-partenaire/connexion');
        }
        return;
      }

      console.log('🟦 [LAYOUT] ✅ Session normale —', session.user.email);
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

  console.log('🟦 [LAYOUT] RENDER FINAL — isImpersonating:', isImpersonating);

  return (
    <div className="min-h-screen bg-gris-fond">
      {isImpersonating && <ImpersonationBanner />}
      <div className={`flex ${isImpersonating ? 'pt-10' : ''}`}>
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