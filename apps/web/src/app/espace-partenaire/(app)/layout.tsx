'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PartnerSidebar from '@/components/partenaire/PartnerSidebar';
import PartnerTopBar from '@/components/partenaire/PartnerTopBar';
import ImpersonationBanner from '@/components/partenaire/ImpersonationBanner';
import { getImpersonateToken, getImpersonatedTenant, clearImpersonation } from '@/lib/impersonation';

export default function PartnerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Vérifie si on est en mode impersonation
      const token = getImpersonateToken();
      if (token) {
        const tenant = await getImpersonatedTenant();
        if (tenant) {
          setIsImpersonating(true);
          setAuthorized(true);
          setChecking(false);
          return;
        } else {
          // Token invalide/expiré
          clearImpersonation();
        }
      }

      // 2. Sinon, vérifie la session partenaire normale
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/espace-partenaire/connexion');
        return;
      }

      setAuthorized(true);
      setChecking(false);
    })();
  }, [router]);

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