'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PartnerSidebar from '@/components/partenaire/PartnerSidebar';
import PartnerTopBar from '@/components/partenaire/PartnerTopBar';
import ImpersonationBanner from '@/components/partenaire/ImpersonationBanner';
import { getImpersonateToken, getImpersonatedTenant, clearImpersonation } from '@/lib/impersonation';
import { createBrowserClient } from '@supabase/ssr';

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Vérifie impersonation en priorité
      const token = getImpersonateToken();
      if (token) {
        const tenant = await getImpersonatedTenant();
        if (cancelled) return;

        if (tenant) {
          setIsImpersonating(true);
          setAuthorized(true);
          setChecking(false);
          return;
        }
        // Token invalide → on nettoie et on continue
        clearImpersonation();
      }

      // 2. Vérifie la session normale via getSession (plus fiable)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        // Pas de session → redirection UNE SEULE FOIS
        if (pathname !== '/espace-partenaire/connexion') {
          router.replace('/espace-partenaire/connexion');
        }
        return;
      }

      // Session OK
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

  return (
    <div className="flex min-h-screen bg-gris-fond">
      {isImpersonating && <ImpersonationBanner />}
      <PartnerSidebar />
      <div className={`flex-1 flex flex-col min-w-0 ${isImpersonating ? 'pt-10' : ''}`}>
        <PartnerTopBar />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}