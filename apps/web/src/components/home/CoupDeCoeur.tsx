import Image from 'next/image';
import Link from 'next/link';
import { featuredBusinesses } from '@/lib/mock-data';
import SectionTitle from '@/components/ui/SectionTitle';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { MapPin } from 'lucide-react';

export default function CoupDeCoeur() {
  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionTitle
          eyebrow="Coups de cœur du mois"
          title="Nos adresses chouchous"
          description="Sélectionnées par notre équipe pour leur authenticité et leur engagement."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredBusinesses.map((b) => (
            <Link key={b.id} href={`/commerce/${b.slug}`}>
              <Card className="h-full">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {b.label === 'coup-de-coeur' && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="gold">❤️ Coup de cœur</Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="text-xs uppercase tracking-wider text-gold-dark mb-2">
                    {b.category}
                  </div>
                  <h3 className="font-serif text-2xl text-ink mb-2">
                    {b.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-ink/60 mb-4">
                    <MapPin size={14} />
                    <span>{b.city}</span>
                  </div>
                  <p className="text-sm text-ink/70 leading-relaxed line-clamp-3">
                    {b.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}