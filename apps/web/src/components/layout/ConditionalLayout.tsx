'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes sans header/footer (espaces privés)
  const isPrivateSpace =
    pathname?.startsWith('/espace-partenaire') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/mon-compte');

  if (isPrivateSpace) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}