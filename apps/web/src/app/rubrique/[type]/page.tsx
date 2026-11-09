import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FeaturedCarousel from '@/components/rubrique/FeaturedCarousel';
import EtablissementGrid from '@/components/rubrique/EtablissementGrid';
import CategorySubNav from '@/components/rubrique/CategorySubNav';
import { getCategoryWithChildren } from '@/lib/categories';

const SECTEURS: Record<
  string,
  {
    label: string;
    singular: string;
    icon: string;
    color: string;
    image: string;
    intro: string;
  }
> = {
  hotel: {
    label: 'Hôtels',
    singular: 'hôtel',
    icon: '🏨',
    color: 'bg-ic-bleu',
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=85&w=2400&auto=format&fit=crop',
    intro: 'Hôtels, guesthouses, resorts et hébergements au Cambodge.',
  },
  restaurant: {
    label: 'Restaurants',
    singular: 'restaurant',
    icon: '🍜',
    color: 'bg-ic-orange',
    image:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=85&w=2400&auto=format&fit=crop',
    intro: 'Restaurants khmers, internationaux, cafés et bars.',
  },
  association: {
    label: 'Associations',
    singular: 'association',
    icon: '❤️',
    color: 'bg-ic-rose',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=2400&auto=format&fit=crop',
    intro: 'ONG, projets sociaux et associations au Cambodge.',
  },
  activite: {
    label: 'Activités',
    singular: 'activité',
    icon: '🛶',
    color: 'bg-ic-vert',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=85&w=2400&auto=format&fit=crop',
    intro: 'Tours, guides et expériences au Cambodge.',
  },
  shopping: {
    label: 'Shopping',
    singular: 'boutique',
    icon: '🧵',
    color: 'bg-ic-violet',
    image:
      'https://images.unsplash.com/photo-1653959864991-c828b72c82a8?q=85&w=2400&auto=format&fit=crop',
    intro: 'Boutiques, artisanat, soie et créateurs.',
  },
  transport: {
    label: 'Transports',
    singular: 'transport',
    icon: '🛺',
    color: 'bg-ic-cyan',
    image:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?q=85&w=2400&auto=format&fit=crop',
    intro: 'Tuk-tuk, location, transferts et transports.',
  },
  'autres-commerces': {
    label: 'Autres commerces',
    singular: 'commerce',
    icon: '🏬',
    color: 'bg-ic-violet',
    image:
      'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=85&w=2400&auto=format&fit=crop',
    intro: 'Cafés, boutiques, spas, loisirs, immobilier, transport et plus.',
  },
};

// Image/couleur de hero par défaut si la catégorie n'a pas d'entrée dans SECTEURS
// (nouvelles sous-catégories créées en console). Le reste (label, intro) vient
// de la base de données.
const DEFAULT_HERO = {
  color: 'bg-marine',
  image:
    'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=85&w=2400&auto=format&fit=crop',
};

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const data = await getCategoryWithChildren(type);
  if (data) return { title: data.category.name };
  const secteur = SECTEURS[type];
  if (!secteur) return { title: 'Rubrique introuvable' };
  return { title: secteur.label, description: secteur.intro };
}

export default async function RubriquePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { cat } = await searchParams;

  // Catégorie + enfants depuis la base (source de vérité).
  const data = await getCategoryWithChildren(type);
  // Fallback visuel : images/couleurs de hero (ou défaut générique).
  const secteur = SECTEURS[type];

  // Introuvable nulle part -> 404.
  if (!data && !secteur) notFound();

  // Libellés : la base prime, sinon SECTEURS.
  const label = data?.category.name || secteur?.label || type;
  const intro =
    secteur?.intro ||
    (data && data.children.length > 0
      ? `Explorez nos ${label.toLowerCase()} par catégorie.`
      : `Découvrez nos ${label.toLowerCase()}.`);
  const heroImage = secteur?.image || DEFAULT_HERO.image;

  // Rubrique parente = a des enfants. On affiche la sous-barre + on agrège.
  const children = data?.children || [];
  const isParent = children.length > 0;
  const childSlugs = children.map((c) => c.slug);

  // Sous-catégorie sélectionnée via ?cat= (doit appartenir au parent).
  const selectedChild =
    cat && childSlugs.includes(cat) ? cat : undefined;

  // Slugs effectivement filtrés :
  //  - sous-catégorie choisie -> uniquement elle
  //  - parent sans sélection  -> tous les enfants
  //  - feuille simple         -> le type lui-même (via typeSlug)
  const effectiveChildSlugs = selectedChild
    ? [selectedChild]
    : isParent
    ? childSlugs
    : undefined;

  return (
    <>
      {/* ===== SOUS-BARRE DES SOUS-CATÉGORIES (rubrique parente) ===== */}
      {/* Placée AVANT le hero pour coller sous la nav, comme la sous-barre Découvrir. */}
      {isParent && (
        <CategorySubNav
          parentSlug={type}
          children={children.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
        />
      )}

      {/* ===== HERO ===== */}
      <section className="relative text-white overflow-hidden">
        <Image
          src={heroImage}
          alt={label}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/90 to-marine-dark/95" />

        <div className="relative z-10 max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-12 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-center min-h-[420px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-white/40" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-white/75 font-bold">
                  {label}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.08] mb-4">
                Les meilleurs
                <br />
                <span className="text-ic-or">
                  {label.toLowerCase()}.
                </span>
              </h1>

              <p className="text-sm text-white/85 leading-relaxed mb-6 max-w-sm">
                {intro}
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href="#resultats"
                  className="inline-flex items-center gap-2 bg-white text-marine font-bold px-4 py-2.5 rounded-full hover:bg-white/90 transition-colors text-sm"
                >
                  Voir toutes les adresses
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/75">
                <span className="flex items-center gap-1.5">
                  <span className="text-ic-vert">✓</span> Vérifiées
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-ic-vert">✓</span> Mises à jour
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <FeaturedCarousel type={type} childSlugs={effectiveChildSlugs} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== GRILLE D'ÉTABLISSEMENTS (avec filtres intégrés) ===== */}
      <section id="resultats" className="bg-gris-fond py-8">
        <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
          <EtablissementGrid
            typeSlug={isParent ? undefined : type}
            childSlugs={effectiveChildSlugs}
          />
        </div>
      </section>
    </>
  );
}