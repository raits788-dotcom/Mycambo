import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AddEstablishmentWizard from '@/components/partenaire/AddEstablishmentWizard';

export const metadata: Metadata = {
  title: 'Ajouter un établissement',
};

export default function NouvelEtablissementPage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/espace-partenaire/etablissements"
          className="inline-flex items-center gap-2 text-xs font-bold text-marine hover:underline mb-3"
        >
          <ArrowLeft size={12} />
          Retour à mes établissements
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Ajouter un établissement
        </h1>
        <p className="text-sm text-gris-texte">
          Remplissez les informations ci-dessous. Validation sous 48h.
        </p>
      </div>

      <AddEstablishmentWizard />
    </>
  );
}