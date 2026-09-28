'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Share2,
  Star,
  Facebook,
  Instagram,
} from 'lucide-react';
import CommerceTabs from '@/components/commerce/CommerceTabs';
import AssociationActionsBar from '@/components/association/AssociationActionsBar';
import StatsBlock from '@/components/commerce/StatsBlock';
import {
  getRatingStats,
  getAssociationEnriched,
  ETABLISSEMENTS,
} from '@/lib/mock-data';

export default function CommercePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [commerce, setCommerce] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // 1. Cherche dans le localStorage (données partenaire)
    try {
      const stored = localStorage.getItem('mycambo_partner_establishments');
      if (stored) {
        const list = JSON.parse(stored);
        const found = list.find((e: any) => e.slug === slug);
        if (found) {
          // Normalise les données
          setCommerce({
            ...found,
            typeLabel: found.typeLabel || 'Établissement',
            rating: found.rating || 0,
            reviews: found.reviewsCount || 0,
            gallery: found.photos || [],
            image:
              found.photos?.[0] ||
              'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=1600&auto=format&fit=crop',
            amenities: found.amenities || [],
            mission: found.mission,
            impact: found.impact,
            project: found.project,
            howToHelp: found.howToHelp,
          });
          setMounted(true);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Si pas trouvé dans localStorage, cherche dans les données mock
    const mockEtab = ETABLISSEMENTS[slug] || [];
const foundMock: any = Object.values(ETABLISSEMENTS)
  .flat()
  .find((e: any) => e.slug === slug);

    if (foundMock) {
      // Données mock basiques
      setCommerce({
        slug,
        name: foundMock.name,
        type: foundMock.type || 'association',
        typeLabel: 'Association',
        category: foundMock.category,
        city: foundMock.city,
        address: '',
        phone: '',
        website: '',
        hours: '',
        description: foundMock.description,
        longDescription: foundMock.description,
        image: foundMock.image,
        gallery: [],
        rating: foundMock.rating,
        reviews: foundMock.reviews || foundMock.reviewsCount || 0,
        price: '',
        amenities: [],
      });
    }

    setMounted(true);
  }, [slug]);

  if (!mounted) {
    return (
      <div className="p-20 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-marine mb-3">
          Établissement introuvable
        </h1>
        <p className="text-gris-texte mb-6">
          Cette fiche n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/annuaire"
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors"
        >
          Retour à l&apos;annuaire
        </Link>
      </div>
    );
  }

  const isAssociation = commerce.type === 'association';
  const stats = isAssociation ? getRatingStats(slug) : null;
  const enriched = isAssociation ? getAssociationEnriched(slug) : null;

  return (
    <>
      {/* HERO */}
      <section className="relative h-[240px] md:h-[280px] overflow-hidden">
        <Image
          src={commerce.image}
          alt={commerce.name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/30" />

        <div className="absolute top-4 right-4 md:right-12 z-20 flex gap-2">
          <button
            aria-label="Enregistrer"
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Heart size={17} />
          </button>
          <button
            aria-label="Partager"
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="absolute inset-0 flex items-end z-10">
          <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 pb-5 w-full">
            <div className="text-white">
              <div className="flex items-center gap-2 text-xs text-white/85 mb-2 flex-wrap">
                <span className="bg-ic-or text-marine-dark font-bold px-2.5 py-1 rounded-full">
                  {commerce.typeLabel}
                </span>
                <span>{commerce.category}</span>
                {commerce.foundedYear && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>Depuis {commerce.foundedYear}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-2">
                {commerce.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                {commerce.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-ic-or text-ic-or" />
                    <b className="text-base">{commerce.rating}</b>
                    <span className="text-white/70">
                      ({commerce.reviews} avis)
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {commerce.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          <div>
            <CommerceTabs
              commerce={commerce}
              isAssociation={isAssociation}
              stats={stats}
              enriched={enriched}
            />
          </div>

          <aside className="lg:sticky lg:top-[180px] self-start space-y-4">
            <div className="bg-white border border-gris-ligne rounded-lg p-5 shadow-cb-sm">
              <div className="text-base font-extrabold text-marine mb-4">
                {isAssociation
                  ? '💛 Nous soutenir'
                  : commerce.price || 'Contact'}
              </div>

              {isAssociation ? (
                <div className="mb-5">
                  <AssociationActionsBar
                    associationSlug={slug}
                    associationName={commerce.name}
donationLink={(enriched as any)?.donation_link}
                    variant="sidebar"
                  />
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  <button className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm">
                    Contacter
                  </button>
                  <button className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm">
                    Voir sur la carte
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gris-ligne space-y-3 text-sm text-gris-texte">
                {commerce.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      size={15}
                      className="text-gris-doux mt-0.5 flex-shrink-0"
                    />
                    <span>{commerce.address}</span>
                  </div>
                )}
                {commerce.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-gris-doux flex-shrink-0" />
                    <a
                      href={`tel:${commerce.phone}`}
                      className="hover:text-marine"
                    >
                      {commerce.phone}
                    </a>
                  </div>
                )}
                {commerce.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} className="text-gris-doux flex-shrink-0" />
                    <a
                      href={`https://${commerce.website}`}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-marine truncate"
                    >
                      {commerce.website}
                    </a>
                  </div>
                )}
                {commerce.hours && (
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-gris-doux flex-shrink-0" />
                    <span>{commerce.hours}</span>
                  </div>
                )}
              </div>

              {isAssociation && enriched?.stats && (
                <StatsBlock
                  slug={slug}
                  initialViews={enriched.stats.views}
                  initialSupports={enriched.stats.supports}
                />
              )}
            </div>

            <div className="text-[11px] text-gris-doux text-center">
              Ces informations sont fournies par l&apos;établissement.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
