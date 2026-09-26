import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: {
    default: 'Console admin · myCAMBO',
    template: '%s · Console admin · myCAMBO',
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}