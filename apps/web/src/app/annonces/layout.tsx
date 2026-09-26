import AnnoncesSubNav from '@/components/layout/AnnoncesSubNav';

export default function AnnoncesLayout({
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