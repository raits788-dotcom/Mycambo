// ============================================================================
// Configuration de la navigation myCAMBO
// ============================================================================

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  active: boolean;
  highlight?: boolean;
  submenu?: NavSubItem[];
};

export type NavSubItem = {
  label: string;
  href: string;
};

// ===== Rubriques commerces (annuaire) =====
export const SECTORS: NavItem[] = [
  {
    id: 'hotel',
    label: 'Hôtels',
    icon: 'Hotel',
    href: '/rubrique/hotel',
    active: true,
  },
  {
    id: 'restaurant',
    label: 'Restaurants',
    icon: 'UtensilsCrossed',
    href: '/rubrique/restaurant',
    active: true,
  },
  {
    id: 'association',
    label: 'Associations',
    icon: 'HeartHandshake',
    href: '/rubrique/association',
    active: true,
  },
];

// ===== Découvrir (hub touristique) =====
export const DISCOVER: NavItem[] = [
  {
    id: 'decouvrir',
    label: 'Découvrir',
    icon: 'Compass',
    href: '/decouvrir',
    active: true,
  },
];

// ===== Hubs transverses =====
export const HUBS: NavItem[] = [
  {
    id: 'annuaire',
    label: 'Annuaire',
    icon: 'BookOpen',
    href: '/annuaire',
    active: true,
  },
  {
    id: 'annonces',
    label: 'Annonces',
    icon: 'Tag',
    href: '/annonces',
    active: true,
    // Sous-menu au survol (desktop)
    submenu: [
      { label: 'Toutes les annonces', href: '/annonces' },
      { label: 'Emploi', href: '/emploi' },
    ],
  },
  {
    id: 'createurs',
    label: 'Créateurs',
    icon: 'Video',
    href: '/influenceurs',
    active: true,
  },
];

// ===== Liens fixes =====
export const FIXED_LEFT: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: 'House', href: '/', active: true },
];

export const FIXED_RIGHT: NavItem[] = [
  {
    id: 'partenaire',
    label: 'Partenaire',
    icon: 'Star',
    href: '/partenaire',
    active: true,
    highlight: true,
  },
];

// ===== Sous-menu Découvrir =====
export const DISCOVER_SUBNAV = [
  { label: "Vue d'ensemble", href: '/decouvrir' },
  { label: 'Régions', href: '/decouvrir/regions' },
  { label: 'Culture', href: '/decouvrir/culture' },
  { label: 'Activités', href: '/decouvrir/activites' },
  { label: 'Transports', href: '/decouvrir/transports' },
  { label: 'Shopping', href: '/decouvrir/shopping' },
  { label: 'Gastronomie', href: '/decouvrir/gastronomie' },
  { label: 'Pratique', href: '/decouvrir/pratique' },
];

// ===== Sous-menu Annonces (comme Découvrir / Partenaire) =====
export const ANNONCES_SUBNAV = [
  { label: 'Toutes les annonces', href: '/annonces' },
  { label: 'Emploi', href: '/emploi' },
];

// ===== Limite d'items dans la barre principale =====
export const NAV_LIMIT = 9;
