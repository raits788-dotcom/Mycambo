import Image from 'next/image';
import type { Metadata } from 'next';
import SectionSubNav from '@/components/layout/SectionSubNav';
import AnnuaireExplorer from '@/components/annuaire/AnnuaireExplorer';

// Sous-barre de l'annuaire : raccourcis vers les grandes familles.
const ANNUAIRE_LINKS = [
  { label: 'Hôtels', href: '/rubrique/hotel', icon: '🏨' },
  { label: 'Restaurants', href: '/rubrique/restaurant', icon: '🍜' },
  { label: 'Associations', href: '/rubrique/association', icon: '🤝' },
  { label: 'Autres commerces', href: '/rubrique/autres-commerces', icon: '🏬' },
];

export const metadata: Metadata = {
  title: 'Annuaire',
  description:
    "L'annuaire myCAMBO : hôtels, restaurants, associations, boutiques et services au Cambodge.",
};


export default function AnnuairePage() {
  return (
    <>
      <SectionSubNav basePath="/annuaire" links={ANNUAIRE_LINKS} allLabel="Tout" />

      {/* Hero compact */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1565668314564-9d1bebb0a1db?q=85&w=2400&auto=format&fit=crop"
          alt="Cambodge"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/85 to-marine-dark/90" />
        <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-white/40" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">Annuaire</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-[1.08] mb-3">
            Toutes les <span className="text-ic-or">bonnes adresses.</span>
          </h1>
          <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-xl mb-4">
            Tous les établissements vérifiés du Cambodge : hôtels, restaurants,
            associations, boutiques et services. Cherchez, filtrez, trouvez.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
            <span className="flex items-center gap-1.5"><span className="text-ic-vert">✓</span> Vérifiées</span>
            <span className="flex items-center gap-1.5"><span className="text-ic-vert">✓</span> Mises à jour</span>
            <span className="flex items-center gap-1.5"><span className="text-ic-vert">✓</span> Contact direct</span>
          </div>
        </div>
      </section>

      {/* Annuaire interactif : recherche + filtres + groupé par catégorie */}
      <div className="bg-gris-fond">
        <AnnuaireExplorer />
      </div>
    </>
  );
}
