import type { Metadata } from 'next';
import UserSidebar from '@/components/mon-compte/UserSidebar';

export const metadata: Metadata = {
  title: {
    default: 'Mon espace',
    template: '%s · Mon espace · myCAMBO',
  },
};

export default function MonCompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-160px)]">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <UserSidebar />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}