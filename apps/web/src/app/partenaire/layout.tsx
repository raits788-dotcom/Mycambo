import PartnerSubNav from '@/components/layout/PartnerSubNav';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PartnerSubNav />
      {children}
    </>
  );
}