import Link from 'next/link';
import { categories } from '@/lib/mock-data';
import SectionTitle from '@/components/ui/SectionTitle';

export default function Categories() {
  return (
    <section className="py-24 bg-sand/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionTitle
          eyebrow="Explorer"
          title="Parcourir par catégorie"
          description="Plus de 280 adresses vérifiées à travers tout le Cambodge."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/annuaire/${c.slug}`}
              className="group bg-white rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card border border-transparent hover:border-gold/20"
            >
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                {c.icon}
              </div>
              <div className="font-serif text-base text-ink mb-1 group-hover:text-gold-dark transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-ink/50">
                {c.count} adresse{c.count > 1 ? 's' : ''}
              </div>
              <div className="mt-4 text-xs text-gold-dark opacity-0 group-hover:opacity-100 transition-opacity">
                Voir →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}