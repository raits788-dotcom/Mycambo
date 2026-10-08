'use client';

import { Star, Loader2 } from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerAvisPage() {
  const { tenant, loading } = useCurrentTenant();

  if (loading) {
    return <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>;
  }

  if (!tenant) return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Avis</h1>
        <p className="text-sm text-gris-texte">Les avis de vos clients.</p>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
        <Star size={32} className="text-gris-doux mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Aucun avis pour l&apos;instant.</p>
        <p className="text-xs text-gris-doux mt-1">Les avis apparaîtront au fur et à mesure.</p>
      </div>
    </>
  );
}