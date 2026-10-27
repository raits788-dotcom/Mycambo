import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SuperAdmin · myCAMBO',
    template: '%s · SuperAdmin myCAMBO',
  },
  description: 'Console d\'administration myCAMBO',
  icons: { icon: '/favicon.ico' },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}