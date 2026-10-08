'use client';

import { Users, Loader2 } from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerEquipePage() {
  const { tenant, loading } = useCurrentTenant();

  if (loading) {
    return <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>;
  }

  if (!tenant) return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Mon équipe</h1>
        <p className="text-sm text-gris-texte">Les membres qui gèrent vos établissements.</p>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
        <Users size={32} className="text-gris-doux mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Aucun membre pour l&apos;instant.</p>
        <p className="text-xs text-gris-doux mt-1">Invitez vos collaborateurs à rejoindre l&apos;équipe.</p>
      </div>
    </>
  );
}