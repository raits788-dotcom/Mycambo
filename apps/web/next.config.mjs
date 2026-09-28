/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'jxfdwjwpsqvgczywipff.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/devenir-partenaire', destination: '/partenaire', permanent: true },
      { source: '/devenir-partenaire/:path*', destination: '/partenaire/:path*', permanent: true },
      { source: '/hotels', destination: '/rubrique/hotel', permanent: true },
      { source: '/restaurants', destination: '/rubrique/restaurant', permanent: true },
      { source: '/associations', destination: '/rubrique/association', permanent: true },
      { source: '/vente', destination: '/annonces', permanent: true },
      { source: '/vente/:path*', destination: '/annonces/:path*', permanent: true },
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();