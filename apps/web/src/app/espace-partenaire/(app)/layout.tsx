'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PartnerTopBar from '@/components/partenaire/PartnerTopBar';
import PartnerSidebar from '@/components/partenaire/PartnerSidebar';
import { getCurrentPartnerMock } from '@/lib/auth-mock';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const partner = getCurrentPartnerMock();
    if (!partner) {
      router.replace(
        `/espace-partenaire/connexion?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }
    setChecking(false);
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gris-texte">Vérification...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerTopBar />

      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <PartnerSidebar />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}