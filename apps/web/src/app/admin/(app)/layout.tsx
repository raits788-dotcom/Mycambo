'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCurrentAdmin } from '@/lib/admin-mock';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (!admin) {
      router.replace(
        `/admin/connexion?redirect=${encodeURIComponent(pathname)}`
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
      <AdminTopBar />

      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <AdminSidebar />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}