// ===== Données de la page /devenir-partenaire =====
// À terme : brancher sur la table `plans` de Supabase (module 🅱️)

export const PARTNER_ADVANTAGES = [
  {
    icon: 'fa-eye',
    color: 'bg-ic-bleu',
    title: 'Visibilité maximale',
    desc: "Des milliers de voyageurs et d'habitants découvrent votre commerce chaque mois sur myCAMBO.",
  },
  {
    icon: 'fa-heart',
    color: 'bg-ic-rose',
    title: 'Mise en avant',
    desc: 'Coups de cœur éditoriaux, badge vérifié, mise en avant dans votre catégorie.',
  },
  {
    icon: 'fa-chart-line',
    color: 'bg-ic-vert',
    title: 'Statistiques en direct',
    desc: 'Vues, clics téléphone, site web, itinéraires. Vous pilotez vos résultats en temps réel.',
  },
  {
    icon: 'fa-users',
    color: 'bg-ic-violet',
    title: 'Équipe collaborative',
    desc: 'Plusieurs comptes pour gérer vos commerces sous un même abonnement.',
  },
];

export const PARTNER_STEPS = [
  {
    number: 1,
    title: 'Déposez votre demande',
    desc: 'Remplissez le formulaire ci-dessous. Cela prend 2 minutes. Nous étudions chaque demande.',
  },
  {
    number: 2,
    title: 'Nous validons sous 48h',
    desc: 'Notre équipe vérifie vos informations et vous envoie vos identifiants par email.',
  },
  {
    number: 3,
    title: 'Votre fiche est en ligne',
    desc: 'Complétez votre fiche, ajoutez vos photos et commencez à recevoir des clients.',
  },
];

export type Plan = {
  id: string;
  name: string;
  price: string;
  detail: string;
  features: string[];
  popular?: boolean;
  cta: string;
};

export const PARTNER_PLANS: Plan[] = [
  {
    id: 'decouverte',
    name: 'Découverte',
    price: 'Gratuit',
    detail: 'Pour se faire connaître',
    features: [
      'Fiche établissement de base',
      "Jusqu'à 5 photos",
      "Visible dans l'annuaire",
      'Contact direct client',
      'Badge « Nouveau »',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: '15 $',
    detail: '/ mois · 1 commerce',
    features: [
      'Fiche enrichie',
      "Jusqu'à 15 photos",
      'Description longue',
      'Badge « Vérifié »',
      'Statistiques de vues',
      'Réseaux sociaux liés',
      'Support par email',
    ],
    cta: 'Choisir Essentiel',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '39 $',
    detail: '/ mois · 3 commerces',
    popular: true,
    features: [
      "Tout l'Essentiel +",
      '3 commerces inclus',
      'Offres promotionnelles',
      'Réservations en ligne',
      'Menu / chambres / services',
      'Statistiques avancées',
      'Mise en avant catégorie',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: '79 $',
    detail: '/ mois · 10 commerces',
    features: [
      'Tout le Pro +',
      '10 commerces inclus',
      'Coup de cœur éditorial',
      "Bannière page d'accueil",
      'Équipe multi-utilisateurs',
      'Accompagnement dédié',
      'Account manager',
    ],
    cta: 'Choisir Business',
  },
];

export const COMPARISON_TABLE = {
  headers: ['Fonctionnalité', 'Découverte', 'Essentiel', 'Pro', 'Business'],
  rows: [
    { label: 'Nombre de commerces', values: ['1', '1', '3', '10'] },
    { label: 'Photos', values: ['5', '15', '50', 'Illimité'] },
    { label: 'Vidéos', values: ['—', '1', '5', 'Illimité'] },
    { label: 'Description longue', values: ['—', '✓', '✓', '✓'] },
    { label: 'Réseaux sociaux', values: ['—', '✓', '✓', '✓'] },
    { label: 'Badge vérifié', values: ['—', '✓', '✓', '✓'] },
    {
      label: 'Statistiques',
      values: ['—', 'Basique', 'Avancées', 'Complètes'],
    },
    { label: 'Offres promotionnelles', values: ['—', '—', '✓', '✓'] },
    { label: 'Réservations en ligne', values: ['—', '—', '✓', '✓'] },
    { label: 'Menu / chambres / services', values: ['—', '—', '✓', '✓'] },
    { label: 'Mise en avant catégorie', values: ['—', '—', '✓', '✓'] },
    { label: 'Coup de cœur éditorial', values: ['—', '—', '—', '✓'] },
    { label: "Bannière page d'accueil", values: ['—', '—', '—', '✓'] },
    { label: 'Équipe multi-utilisateurs', values: ['—', '—', '—', '✓'] },
    {
      label: 'Support',
      values: ['Communauté', 'Email', 'Prioritaire', 'Dédié'],
    },
  ],
};

export const PARTNER_FAQ = [
  {
    q: 'Combien de temps pour être validé ?',
    a: 'Chaque demande est étudiée manuellement. Comptez 48h ouvrées en moyenne. Vous recevez un email dès que votre compte est activé.',
  },
  {
    q: 'Puis-je gérer plusieurs commerces ?',
    a: 'Oui. Selon votre formule, vous pouvez gérer de 1 à 10 commerces (voire plus en Entreprise) depuis un seul compte. Chaque commerce a sa propre fiche et son propre abonnement.',
  },
  {
    q: 'Comment se passe le paiement ?',
    a: 'Nous acceptons les paiements par ABA PayWay, Wing et QR code Bakong (les principaux canaux cambodgiens). Les paiements internationaux sont possibles via carte bancaire.',
  },
  {
    q: 'Y a-t-il un engagement ?',
    a: 'Non. Toutes nos formules sont sans engagement. Vous pouvez changer de formule ou résilier à tout moment depuis votre espace partenaire.',
  },
  {
    q: 'Que se passe-t-il si je résilie ?',
    a: 'Votre fiche reste visible dans la formule Découverte (gratuite). Vous conservez toutes vos données si vous revenez plus tard.',
  },
  {
    q: 'Puis-je mettre en avant un événement ?',
    a: "Oui, avec les formules Pro et Business, vous pouvez créer des offres promotionnelles et des événements mis en avant sur votre fiche et dans l'agenda.",
  },
];
