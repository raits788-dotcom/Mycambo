import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}