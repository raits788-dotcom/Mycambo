import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: {
    default: 'myCAMBO — Tout le Cambodge dans votre poche',
    template: '%s · myCAMBO',
  },
  description:
    'Plateforme numérique dédiée au Cambodge : annuaire, culture, vie locale, annonces, emploi.',
  icons: { icon: '/logo-cambo.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="pb-16 md:pb-0">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}