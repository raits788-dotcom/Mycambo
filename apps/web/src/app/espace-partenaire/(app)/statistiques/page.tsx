'use client';

import { BarChart3, Loader2 } from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerStatsPage() {
  const { tenant, loading } = useCurrentTenant();

  if (loading) {
    return <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>;
  }

  if (!tenant) return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Statistiques</h1>
        <p className="text-sm text-gris-texte">Vos performances.</p>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
        <BarChart3 size={32} className="text-gris-doux mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Les statistiques arrivent bientôt.</p>
        <p className="text-xs text-gris-doux mt-1">Vues, clics, conversions seront affichés ici.</p>
      </div>
    </>
  );
}