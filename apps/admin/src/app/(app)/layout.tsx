import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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