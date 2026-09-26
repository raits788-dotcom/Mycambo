import AnnoncesSubNav from '@/components/layout/AnnoncesSubNav';

export default function EmploiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnoncesSubNav />
      {children}
    </>
  );
}
