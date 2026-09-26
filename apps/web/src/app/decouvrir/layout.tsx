import DiscoverSubNav from '@/components/layout/DiscoverSubNav';

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DiscoverSubNav />
      {children}
    </>
  );
}
