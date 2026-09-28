'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';
import {
  getEstablishmentBySlug,
  type StoredEstablishment,
} from '@/lib/establishment-storage';

export default function ApercuPublicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [establishment, setEstablishment] = useState<StoredEstablishment | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (slug) {
      setEstablishment(getEstablishmentBySlug(slug));
      setMounted(true);
    }
  }, [slug]);

  if (!mounted) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-marine mb-2">
          Établissement introuvable
        </h2>
        <Link
          href="/espace-partenaire/etablissements"
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm mt-4"
        >
          <ArrowLeft size={14} />
          Retour à mes établissements
        </Link>
      </div>
    );
  }

  const heroImage =
    establishment.photos && establishment.photos[0]
      ? establishment.photos[0]
      : 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=1600&auto=format&fit=crop';

  const isAssociation = establishment.type === 'association';

  const tabs = isAssociation
    ? [
        { id: 'about', label: 'À propos' },
        { id: 'impact', label: 'Notre impact' },
        { id: 'actions', label: 'Nos actions' },
        { id: 'team', label: 'Notre équipe' },
        { id: 'photos', label: 'Photos' },
        {
          id: 'reviews',
          label: `Avis (${establishment.reviewsCount || 0})`,
        },
        { id: 'help', label: 'Comment aider' },
      ]
    : [
        { id: 'about', label: 'À propos' },
        { id: 'photos', label: 'Photos' },
        { id: 'amenities', label: 'Équipements' },
      ];

  return (
    <>
      {/* ===== Bandeau d'aperçu ===== */}
      <div className="bg-ic-or text-marine-dark sticky top-0 z-50 shadow-md">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Eye size={18} />
            <div>
              <div className="font-extrabold text-sm">
                Aperçu de votre fiche publique
              </div>
              <div className="text-xs text-marine-dark/70">
                Voici exactement ce que voient les visiteurs.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/espace-partenaire/etablissements/${establishment.slug}`}
              className="text-xs font-bold bg-marine-dark text-white px-4 py-2 rounded-full hover:bg-marine transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={12} />
              Retour à la gestion
            </Link>

            <a
              href={`/commerce/${establishment.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold border border-marine-dark/30 text-marine-dark px-4 py-2 rounded-full hover:bg-white/40 transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink size={12} />
              Ouvrir dans un onglet
            </a>
          </div>
        </div>
      </div>

      {/* ===== Header public ===== */}
      <header className="bg-white border-b border-gris-ligne">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-marine">my</span>
              <span className="text-2xl font-black text-marine">CAMBO</span>
            </div>
            <span className="hidden md:block text-[10px] uppercase tracking-widest text-gris-doux border-l border-gris-ligne pl-3">
              Aperçu
            </span>
          </div>
        </div>
      </header>

      {/* ===== Nav publique simulée ===== */}
      <nav className="bg-marine text-white">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex gap-6 text-sm font-semibold overflow-x-auto scrollbar-hide">
          <span>Accueil</span>
          <span>Hôtels</span>
          <span>Restaurants</span>
          <span className="border-b-2 border-ic-or pb-1">Associations</span>
          <span>Découvrir</span>
          <span>Annuaire</span>
          <span>Annonces</span>
          <span>Créateurs</span>
          <span className="text-ic-or">★ Partenaire</span>
        </div>
      </nav>

      {/* ===== HERO fiche ===== */}
      <section className="relative h-[280px] md:h-[360px] overflow-hidden">
        <Image
          src={heroImage}
          alt={establishment.name}
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
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center"
          >
            <Heart size={17} />
          </button>
          <button
            aria-label="Partager"
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center"
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="absolute inset-0 flex items-end z-10">
          <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 pb-6 w-full">
            <div className="text-white">
              <div className="flex items-center gap-2 text-xs text-white/85 mb-2 flex-wrap">
                <span className="bg-ic-or text-marine-dark font-bold px-2.5 py-1 rounded-full">
                  {establishment.typeLabel}
                </span>
                <span>{establishment.category}</span>
                {(establishment as any).foundedYear && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>Depuis {(establishment as any).foundedYear}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                {establishment.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                {establishment.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-ic-or text-ic-or" />
                    <b className="text-base">{establishment.rating}</b>
                    <span className="text-white/70">
                      ({establishment.reviewsCount} avis)
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {establishment.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contenu ===== */}
      <section className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          {/* Colonne principale */}
          <div>
            <div className="flex items-center gap-1 border-b border-gris-ligne mb-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-marine border-marine'
                      : 'text-gris-texte border-transparent hover:text-marine'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div>
                <h2 className="text-xl font-extrabold text-marine mb-4">
                  À propos
                </h2>
                <p className="text-gris-texte leading-relaxed mb-6">
                  {establishment.longDescription ||
                    establishment.shortDescription}
                </p>

                {establishment.foundedYear && (
                  <div className="bg-gris-fond rounded-lg p-5 flex items-center gap-4">
                    <div className="text-3xl">📅</div>
                    <div>
                      <div className="text-sm text-gris-texte">Fondée en</div>
                      <div className="text-xl font-extrabold text-marine">
                        {establishment.foundedYear}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div>
                <h2 className="text-xl font-extrabold text-marine mb-4">
                  Photos
                </h2>
                {establishment.photos && establishment.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {establishment.photos.map((photo, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <Image
                          src={photo}
                          alt={`${establishment.name} - photo ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gris-fond rounded-lg">
                    <p className="text-sm text-gris-texte">
                      Aucune photo pour le moment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-extrabold text-marine mb-4">
                  Avis des visiteurs
                </h2>
                <div className="text-center py-12 bg-gris-fond rounded-lg">
                  <p className="text-sm text-gris-texte">
                    Les avis seront affichés ici.
                  </p>
                </div>
              </div>
            )}

            {['impact', 'actions', 'team', 'help', 'amenities'].includes(
              activeTab
            ) && (
              <div className="text-center py-12 bg-gris-fond rounded-lg">
                <p className="text-sm text-gris-texte">
                  Cette section sera bientôt disponible.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar publique */}
          <aside className="lg:sticky lg:top-[180px] self-start space-y-4">
            <div className="bg-white border border-gris-ligne rounded-lg p-5 shadow-cb-sm">
              <div className="text-base font-extrabold text-marine mb-4">
                {isAssociation ? '💛 Nous soutenir' : 'Contact'}
              </div>

              {isAssociation ? (
                <div className="space-y-2 mb-5">
                  <button className="w-full bg-khmer text-white font-bold py-3 rounded-full text-sm">
                    ❤️ Faire un don
                  </button>
                  <button className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full text-sm">
                    🙋 Devenir bénévole
                  </button>
                  <button className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full text-sm">
                    ✉️ Nous contacter
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  <button className="w-full bg-marine text-white font-bold py-3 rounded-full text-sm">
                    Contacter
                  </button>
                  <button className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full text-sm">
                    Voir sur la carte
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gris-ligne space-y-3 text-sm text-gris-texte">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-gris-doux mt-0.5" />
                  <span>{establishment.address}</span>
                </div>
                {establishment.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-gris-doux" />
                    <span>{establishment.phone}</span>
                  </div>
                )}
                {establishment.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} className="text-gris-doux" />
                    <span>{establishment.website}</span>
                  </div>
                )}
                {establishment.hours && (
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-gris-doux" />
                    <span>{establishment.hours}</span>
                  </div>
                )}
              </div>
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