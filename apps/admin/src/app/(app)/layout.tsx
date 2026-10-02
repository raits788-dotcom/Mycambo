'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';
import { getCurrentAdmin } from '@/lib/auth';

// Rôles autorisés à accéder à la console admin
const ADMIN_ROLES = [
  'superadmin',
  'admin',
  'moderator',
  'editor',
  'content_manager',
  'finance',
];

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getCurrentAdmin();

      if (!user) {
        // Non connecté → redirection vers connexion admin
        router.replace(
          `/connexion?redirect=${encodeURIComponent(pathname)}`
        );
        return;
      }

      // Vérifier que le rôle est autorisé
      if (!ADMIN_ROLES.includes(user.role)) {
        // Connecté mais pas autorisé → redirection vers site public
        window.location.href = 'https://mycambo.net';
        return;
      }

      setAuthorized(true);
      setChecking(false);
    })();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gris-fond">
        <Loader2 size={24} className="text-marine animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gris-fond">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}