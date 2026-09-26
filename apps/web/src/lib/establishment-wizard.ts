// ============================================================================
// WIZARD D'AJOUT D'ÉTABLISSEMENT
// ============================================================================

export type EstablishmentType =
  | 'association'
  | 'hotel'
  | 'restaurant'
  | 'activite'
  | 'boutique'
  | 'transport'
  | 'autre';

export const ESTABLISHMENT_TYPES: Record<
  EstablishmentType,
  { label: string; icon: string; description: string; categories: string[] }
> = {
  association: {
    label: 'Association / ONG',
    icon: '❤️',
    description: 'Projet social, humanitaire, éducatif',
    categories: ['Humanitaire', 'Éducation', 'Environnement', 'Animaux', 'Santé', 'Social'],
  },
  hotel: {
    label: 'Hôtel / Hébergement',
    icon: '🏨',
    description: 'Hôtel, guesthouse, resort, villa',
    categories: ['Hôtels', 'Guesthouses', 'Resorts', 'Hostels', 'Villas', "Chambres d'hôtes"],
  },
  restaurant: {
    label: 'Restaurant / Bar',
    icon: '🍜',
    description: 'Restaurant, café, bar, street food',
    categories: ['Khmers', 'Internationaux', 'Cafés', 'Bars', 'Street food', 'Asiatique'],
  },
  activite: {
    label: 'Activité / Tour',
    icon: '🛶',
    description: 'Excursions, guides, expériences',
    categories: ['Temples', 'Trek', 'Plage', 'Croisière', 'Cuisine', 'Bien-être'],
  },
  boutique: {
    label: 'Boutique / Artisanat',
    icon: '🧵',
    description: 'Commerce, artisanat, souvenirs',
    categories: ['Soie', 'Sculpture', 'Poivre', 'Artisanat équitable', 'Marchés'],
  },
  transport: {
    label: 'Transport',
    icon: '🛺',
    description: 'Tuk-tuk, location, transferts',
    categories: ['Bus', 'Train', 'Tuk-tuk', 'Bateau', 'Location'],
  },
  autre: {
    label: 'Autre',
    icon: '🏢',
    description: 'Autre type d\'établissement',
    categories: ['Autre'],
  },
};

// ===== Photos typées =====
export type PhotoSlot = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

export const PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: 'facade',
    label: 'Devanture / Façade',
    description: 'Photo de l\'extérieur de votre établissement',
    required: true,
  },
  {
    id: 'interior',
    label: 'Intérieur principal',
    description: 'La pièce ou l\'espace principal',
    required: true,
  },
  {
    id: 'activity',
    label: 'Activité / Service',
    description: 'Votre activité en action',
    required: false,
  },
  {
    id: 'team',
    label: 'Équipe / Ambiance',
    description: 'Votre équipe ou l\'ambiance',
    required: false,
  },
  {
    id: 'other',
    label: 'Autre',
    description: 'Photo supplémentaire',
    required: false,
  },
];

// ===== Types de données du wizard =====
export type WizardData = {
  // Étape 1
  type: EstablishmentType | '';

  // Étape 2
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  foundedYear: string;
  website: string;

  // Étape 3
  address: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;

  // Étape 4 — Légal
  registrationNumber: string;
  legalRepresentative: string;
  legalFunction: string;
  documents: UploadedFile[];

  // Étape 4 — Photos
  photos: Record<string, UploadedFile | null>;

  // Étape 4 — Certifications
  certifyAccuracy: boolean;
  acceptTerms: boolean;
};

export type UploadedFile = {
  name: string;
  size: number;
  url: string; // dataURL pour la démo
  type: string;
};

export const WIZARD_INITIAL_DATA: WizardData = {
  type: '',
  name: '',
  category: '',
  shortDescription: '',
  longDescription: '',
  foundedYear: '',
  website: '',
  address: '',
  city: '',
  province: '',
  latitude: '',
  longitude: '',
  registrationNumber: '',
  legalRepresentative: '',
  legalFunction: '',
  documents: [],
  photos: {
    facade: null,
    interior: null,
    activity: null,
    team: null,
    other: null,
  },
  certifyAccuracy: false,
  acceptTerms: false,
};

// ===== Validation par étape =====
export function validateStep(
  step: number,
  data: WizardData
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (step === 1) {
    if (!data.type) errors.push('Sélectionnez un type d\'établissement.');
  }

  if (step === 2) {
    if (!data.name.trim()) errors.push('Le nom est obligatoire.');
    if (!data.category) errors.push('La catégorie est obligatoire.');
    if (!data.shortDescription.trim())
      errors.push('La description courte est obligatoire.');
  }

  if (step === 3) {
    if (!data.address.trim()) errors.push('L\'adresse est obligatoire.');
    if (!data.city.trim()) errors.push('La ville est obligatoire.');
  }

  if (step === 4) {
    if (!data.registrationNumber.trim())
      errors.push('Le numéro d\'enregistrement est obligatoire.');
    if (!data.legalRepresentative.trim())
      errors.push('Le représentant légal est obligatoire.');
    if (data.documents.length === 0)
      errors.push('Au moins un document justificatif est requis.');
    if (!data.photos.facade) errors.push('La photo de devanture est obligatoire.');
    if (!data.photos.interior) errors.push('La photo d\'intérieur est obligatoire.');
    if (!data.certifyAccuracy) errors.push('Vous devez certifier les informations.');
    if (!data.acceptTerms) errors.push('Vous devez accepter les CGU.');
  }

  return { ok: errors.length === 0, errors };
}