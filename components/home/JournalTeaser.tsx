import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/lib/mock-data';
import SectionTitle from '@/components/ui/SectionTitle';

export default function JournalTeaser() {
  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionTitle
          eyebrow="Le journal"
          title="Histoires & découvertes"
          description="Réflexions, guides et portraits pour aller plus loin que les guides classiques."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((a) => (
            <Link key={a.id} href={`/journal/${a.slug}`} className="group">
              <article>
                <div className="relative h-56 overflow-hidden rounded-lg mb-4">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gold-dark mb-3">
                  <span>{a.category}</span>
                  <span className="h-px w-4 bg-gold" />
                  <span className="text-ink/50">{a.date}</span>
                </div>
                <h3 className="font-serif text-xl text-ink mb-2 group-hover:text-gold-dark transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed">
                  {a.excerpt}
                </p>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/journal"
            className="link-underline text-sm uppercase tracking-widest text-gold-dark font-medium"
          >
            Tous les articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
