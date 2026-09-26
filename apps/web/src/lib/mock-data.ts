// ============================================================================
// DONNÉES DE DÉMO — myCAMBO
// À terme : chargées depuis Supabase
// ============================================================================

export type Etablissement = {
  slug: string;
  name: string;
  category: string;
  city: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  price?: string;
};

export type CategorieRubrique = {
  icon: string;
  label: string;
  count: number;
};

// ===== ÉTABLISSEMENTS PAR TYPE =====
export const ETABLISSEMENTS: Record<string, Etablissement[]> = {
  hotel: [
    {
      slug: 'angkor-palace-resort',
      name: 'Angkor Palace Resort',
      category: 'Resort',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=85&w=800&auto=format&fit=crop',
      description: "Resort 5 étoiles à 5 minutes des temples d'Angkor.",
      rating: 4.8,
      reviews: 142,
      price: '120 $/nuit',
    },
    {
      slug: 'jaya-house-riverside',
      name: 'Jaya House River Park',
      category: 'Hôtel boutique',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=85&w=800&auto=format&fit=crop',
      description: 'Hôtel boutique élégant en bord de rivière.',
      rating: 4.9,
      reviews: 89,
      price: '95 $/nuit',
    },
    {
      slug: 'white-mansion',
      name: 'The White Mansion',
      category: 'Hôtel',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=85&w=800&auto=format&fit=crop',
      description: 'Charme colonial au cœur de la capitale.',
      rating: 4.7,
      reviews: 76,
      price: '110 $/nuit',
    },
    {
      slug: 'koh-rong-sokha',
      name: 'Koh Rong Sokha',
      category: 'Resort',
      city: 'Koh Rong',
      image:
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=85&w=800&auto=format&fit=crop',
      description: "Resort de plage sur l'île paradisiaque.",
      rating: 4.6,
      reviews: 204,
      price: '180 $/nuit',
    },
    {
      slug: 'villa-kampot-riverside',
      name: 'Villa Kampot Riverside',
      category: 'Villa',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=85&w=800&auto=format&fit=crop',
      description: 'Villa coloniale en bord de rivière.',
      rating: 4.7,
      reviews: 58,
      price: '85 $/nuit',
    },
    {
      slug: 'battambang-bamboo',
      name: 'Bamboo Guesthouse',
      category: 'Guesthouse',
      city: 'Battambang',
      image:
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=85&w=800&auto=format&fit=crop',
      description: 'Guesthouse conviviale dans la campagne.',
      rating: 4.5,
      reviews: 92,
      price: '35 $/nuit',
    },
    {
      slug: 'phnom-penh-hostel',
      name: 'Urban Hostel Phnom Penh',
      category: 'Hostel',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=85&w=800&auto=format&fit=crop',
      description: 'Auberge moderne pour voyageurs.',
      rating: 4.4,
      reviews: 128,
      price: '12 $/nuit',
    },
    {
      slug: 'kep-sea-view',
      name: 'Kep Sea View',
      category: 'Hôtel',
      city: 'Kep',
      image:
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=85&w=800&auto=format&fit=crop',
      description: 'Vue mer, cuisine locale, ambiance familiale.',
      rating: 4.6,
      reviews: 64,
      price: '65 $/nuit',
    },
    {
      slug: 'sokha-siem-reap',
      name: 'Sokha Siem Reap Resort',
      category: 'Resort',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=85&w=800&auto=format&fit=crop',
      description: 'Grand resort avec spa et piscines.',
      rating: 4.5,
      reviews: 187,
      price: '135 $/nuit',
    },
  ],

  restaurant: [
    {
      slug: 'khmer-kitchen',
      name: 'Khmer Kitchen',
      category: 'Khmer',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=85&w=800&auto=format&fit=crop',
      description: 'Cuisine khmère authentique dans une ambiance chaleureuse.',
      rating: 4.7,
      reviews: 312,
      price: '8-15 $',
    },
    {
      slug: 'malis-restaurant',
      name: 'Malis Restaurant',
      category: 'Khmer',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=85&w=800&auto=format&fit=crop',
      description: 'Haute cuisine khmère raffinée.',
      rating: 4.8,
      reviews: 245,
      price: '15-30 $',
    },
    {
      slug: 'cuisine-wat-damnak',
      name: 'Cuisine Wat Damnak',
      category: 'Gastronomique',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?q=85&w=800&auto=format&fit=crop',
      description: 'Menu dégustation avec produits locaux.',
      rating: 4.9,
      reviews: 178,
      price: '35 $',
    },
    {
      slug: 'friends-restaurant',
      name: 'Friends Restaurant',
      category: 'Fusion',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=85&w=800&auto=format&fit=crop',
      description: 'Restaurant solidaire formant des jeunes défavorisés.',
      rating: 4.8,
      reviews: 289,
      price: '10-20 $',
    },
    {
      slug: 'khmer-bbq',
      name: 'Khmer BBQ House',
      category: 'BBQ',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=85&w=800&auto=format&fit=crop',
      description: 'Grillades khmères conviviales.',
      rating: 4.5,
      reviews: 156,
      price: '8-18 $',
    },
    {
      slug: 'cafe-kampot',
      name: 'Kampot Café',
      category: 'Café',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=85&w=800&auto=format&fit=crop',
      description: 'Café de spécialité dans une maison coloniale.',
      rating: 4.6,
      reviews: 98,
      price: '3-8 $',
    },
    {
      slug: 'kep-crab-market',
      name: 'Marché aux crabes de Kep',
      category: 'Street food',
      city: 'Kep',
      image:
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=85&w=800&auto=format&fit=crop',
      description: 'Crabes frais face au golfe de Thaïlande.',
      rating: 4.7,
      reviews: 221,
      price: '10-25 $',
    },
    {
      slug: 'lotus-bar',
      name: 'Lotus Bar',
      category: 'Bar',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=85&w=800&auto=format&fit=crop',
      description: 'Rooftop avec vue sur la capitale.',
      rating: 4.4,
      reviews: 187,
      price: '5-15 $',
    },
    {
      slug: 'mango-rain',
      name: 'Mango Rain',
      category: 'Fusion',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=85&w=800&auto=format&fit=crop',
      description: 'Cuisine fusion asiatique et occidentale.',
      rating: 4.5,
      reviews: 143,
      price: '12-25 $',
    },
  ],

  association: [
    {
      slug: 'jardin-ayravady',
      name: "Le Jardin d'Ayravady",
      category: 'Éducation',
      city: 'Kep',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
      description: 'École 100% gratuite dédiée aux langues et au sport à Kep.',
      rating: 4.8,
      reviews: 24,
    },
    {
      slug: 'au-dela-les-rizieres',
      name: 'Au-Delà Les Rizières',
      category: 'Éducation',
      city: 'Kep',
      image: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
      description: "Centre socio-éducatif pour les enfants du village d'O'Krassar.",
      rating: 4.7,
      reviews: 18,
    },
    {
      slug: 'friends-international',
      name: 'Friends International',
      category: 'Humanitaire',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=800&auto=format&fit=crop',
      description: 'Réinsertion des jeunes en précarité par la formation.',
      rating: 4.9,
      reviews: 87,
    },
    {
      slug: 'pse-pour-un-sourire',
      name: "PSE — Pour un Sourire d'Enfant",
      category: 'Éducation',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
      description: 'Scolarisation et formation professionnelle des enfants.',
      rating: 5.0,
      reviews: 156,
    },
    {
      slug: 'angkor-hospital',
      name: 'Angkor Hospital for Children',
      category: 'Santé',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1584515933487-779824d29309?q=85&w=800&auto=format&fit=crop',
      description: 'Soins gratuits pour les enfants cambodgiens.',
      rating: 4.9,
      reviews: 134,
    },
    {
      slug: 'elephant-valley',
      name: 'Elephant Valley Project',
      category: 'Animaux',
      city: 'Mondulkiri',
      image:
        'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=85&w=800&auto=format&fit=crop',
      description: 'Sanctuaire pour éléphants retraités.',
      rating: 4.8,
      reviews: 198,
    },
    {
      slug: 'cambodia-children-fund',
      name: 'Cambodia Children Fund',
      category: 'Humanitaire',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
      description: 'Soutien scolaire et santé pour enfants ruraux.',
      rating: 4.7,
      reviews: 65,
    },
    {
      slug: 'wildlife-alliance',
      name: 'Wildlife Alliance',
      category: 'Environnement',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=85&w=800&auto=format&fit=crop',
      description: 'Protection de la faune et des forêts.',
      rating: 4.8,
      reviews: 102,
    },
    {
      slug: 'green-umbrella',
      name: 'Green Umbrella',
      category: 'Éducation',
      city: 'Battambang',
      image:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
      description: 'École et centre pour enfants défavorisés.',
      rating: 4.6,
      reviews: 48,
    },
    {
      slug: 'sea-shepherd',
      name: 'Sea Shepherd Cambodia',
      category: 'Environnement',
      city: 'Koh Rong',
      image:
        'https://images.unsplash.com/photo-1560275619-4662e36fa65c?q=85&w=800&auto=format&fit=crop',
      description: 'Protection des océans et des côtes.',
      rating: 4.5,
      reviews: 72,
    },
    {
      slug: 'krousar-thmey',
      name: 'Krousar Thmey',
      category: 'Humanitaire',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
      description: 'Aide aux enfants défavorisés et handicapés.',
      rating: 4.8,
      reviews: 91,
    },
  ],

  activite: [
    {
      slug: 'angkor-tour',
      name: 'Angkor Sunrise Tour',
      category: 'Temple',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=85&w=800&auto=format&fit=crop',
      description: 'Tour privé au lever du soleil sur Angkor Wat.',
      rating: 4.9,
      reviews: 234,
      price: '35 $',
    },
    {
      slug: 'tonle-sap-cruise',
      name: 'Tonlé Sap Floating Village',
      category: 'Croisière',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1548013146-72479768bada?q=85&w=800&auto=format&fit=crop',
      description: 'Découverte des villages flottants.',
      rating: 4.6,
      reviews: 178,
      price: '25 $',
    },
    {
      slug: 'cooking-class',
      name: 'Khmer Cooking Class',
      category: 'Cuisine',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=85&w=800&auto=format&fit=crop',
      description: "Apprenez à cuisiner l'amok et le lok lak.",
      rating: 4.8,
      reviews: 145,
      price: '30 $',
    },
    {
      slug: 'koh-rong-diving',
      name: 'Koh Rong Diving',
      category: 'Plongée',
      city: 'Koh Rong',
      image:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=85&w=800&auto=format&fit=crop',
      description: 'Plongée dans les eaux turquoise.',
      rating: 4.7,
      reviews: 89,
      price: '75 $',
    },
    {
      slug: 'ratanakiri-trek',
      name: 'Ratanakiri Jungle Trek',
      category: 'Trek',
      city: 'Ratanakiri',
      image:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?q=85&w=800&auto=format&fit=crop',
      description: 'Trek de 2 jours dans la jungle.',
      rating: 4.9,
      reviews: 67,
      price: '120 $',
    },
    {
      slug: 'yoga-retreat',
      name: 'Kampot Yoga Retreat',
      category: 'Bien-être',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=85&w=800&auto=format&fit=crop',
      description: 'Retraite yoga au bord de la rivière.',
      rating: 4.8,
      reviews: 52,
      price: '90 $',
    },
    {
      slug: 'apsara-show',
      name: 'Apsara Dance Show',
      category: 'Culture',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=85&w=800&auto=format&fit=crop',
      description: 'Spectacle de danse traditionnelle khmère.',
      rating: 4.7,
      reviews: 189,
      price: '25 $',
    },
    {
      slug: 'mekong-kayak',
      name: 'Mékong Kayak',
      category: 'Aventure',
      city: 'Kratie',
      image:
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=85&w=800&auto=format&fit=crop',
      description: 'Kayak sur le Mékong et dauphins.',
      rating: 4.6,
      reviews: 74,
      price: '45 $',
    },
    {
      slug: 'battambang-bamboo-train',
      name: 'Bamboo Train Battambang',
      category: 'Aventure',
      city: 'Battambang',
      image:
        'https://images.unsplash.com/photo-1598887142487-3c854d51eabb?q=85&w=800&auto=format&fit=crop',
      description: 'Balade sur le fameux train de bambou.',
      rating: 4.5,
      reviews: 156,
      price: '15 $',
    },
  ],

  shopping: [
    {
      slug: 'artisans-angkor',
      name: "Artisans d'Angkor",
      category: 'Artisanat',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?q=85&w=800&auto=format&fit=crop',
      description: 'Atelier de sculpture sur bois et pierre.',
      rating: 4.9,
      reviews: 267,
      price: '20-500 $',
    },
    {
      slug: 'golden-silk',
      name: 'Golden Silk',
      category: 'Soie',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=85&w=800&auto=format&fit=crop',
      description: 'Soie khmère tissée à la main.',
      rating: 4.8,
      reviews: 134,
      price: '30-300 $',
    },
    {
      slug: 'kampot-pepper',
      name: 'La Plantation Kampot',
      category: 'Poivre',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=85&w=800&auto=format&fit=crop',
      description: 'Poivre de Kampot IGP, visite et dégustation.',
      rating: 4.9,
      reviews: 189,
      price: '8-50 $',
    },
    {
      slug: 'friends-shop',
      name: "Friends 'n' Stuff",
      category: 'Artisanat équitable',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1483721310020-03333e577078?q=85&w=800&auto=format&fit=crop',
      description: 'Boutique solidaire, artisanat local.',
      rating: 4.8,
      reviews: 156,
      price: '5-80 $',
    },
    {
      slug: 'russian-market',
      name: 'Marché Russe',
      category: 'Marché',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=85&w=800&auto=format&fit=crop',
      description: 'Marché coloré de la capitale.',
      rating: 4.4,
      reviews: 302,
      price: 'Variable',
    },
    {
      slug: 'night-market-sr',
      name: 'Night Market Siem Reap',
      category: 'Marché',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=85&w=800&auto=format&fit=crop',
      description: 'Marché de nuit, souvenirs et street food.',
      rating: 4.6,
      reviews: 421,
      price: 'Variable',
    },
    {
      slug: 'silk-island',
      name: 'Silk Island',
      category: 'Soie',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1610901157620-340856d0a50f?q=85&w=800&auto=format&fit=crop',
      description: 'Île de tisserands au bord du Mékong.',
      rating: 4.7,
      reviews: 98,
      price: '15-200 $',
    },
    {
      slug: 'rehab-craft',
      name: 'Rehab Craft',
      category: 'Artisanat équitable',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=85&w=800&auto=format&fit=crop',
      description: 'Artisanat créé par des artisans en réinsertion.',
      rating: 4.7,
      reviews: 87,
      price: '10-100 $',
    },
    {
      slug: 'made-in-cambodia',
      name: 'Made in Cambodia Market',
      category: 'Marché',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=85&w=800&auto=format&fit=crop',
      description: 'Marché de créateurs locaux.',
      rating: 4.8,
      reviews: 145,
      price: '5-150 $',
    },
  ],

  transport: [
    {
      slug: 'giant-ibis',
      name: 'Giant Ibis Transport',
      category: 'Bus',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=85&w=800&auto=format&fit=crop',
      description: 'Compagnie de bus confortable.',
      rating: 4.6,
      reviews: 234,
      price: '15-25 $',
    },
    {
      slug: 'mekong-express',
      name: 'Mekong Express',
      category: 'Bus',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=85&w=800&auto=format&fit=crop',
      description: 'Bus climatisés avec wifi.',
      rating: 4.5,
      reviews: 189,
      price: '12-22 $',
    },
    {
      slug: 'royal-railway',
      name: 'Royal Railway Cambodia',
      category: 'Train',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=85&w=800&auto=format&fit=crop',
      description: 'Trains rénovés, lent mais pittoresque.',
      rating: 4.3,
      reviews: 156,
      price: '8-15 $',
    },
    {
      slug: 'passapp',
      name: 'PassApp',
      category: 'Tuk-tuk',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=85&w=800&auto=format&fit=crop',
      description: 'Application de tuk-tuk et moto.',
      rating: 4.7,
      reviews: 412,
      price: '1-5 $',
    },
    {
      slug: 'grab-cambodia',
      name: 'Grab Cambodia',
      category: 'VTC',
      city: 'Phnom Penh',
      image:
        'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=85&w=800&auto=format&fit=crop',
      description: 'VTC international, moto et voiture.',
      rating: 4.6,
      reviews: 534,
      price: '2-10 $',
    },
    {
      slug: 'moto-rental-sr',
      name: 'Moto Rental Siem Reap',
      category: 'Location',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1558980664-10ea5dc7e6f3?q=85&w=800&auto=format&fit=crop',
      description: 'Location de scooters et motos.',
      rating: 4.5,
      reviews: 123,
      price: '8-15 $/jour',
    },
    {
      slug: 'boat-koh-rong',
      name: 'Speed Boat Koh Rong',
      category: 'Bateau',
      city: 'Sihanoukville',
      image:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=85&w=800&auto=format&fit=crop',
      description: 'Liaisons rapides vers les îles.',
      rating: 4.4,
      reviews: 245,
      price: '20-30 $',
    },
    {
      slug: 'angkor-transfer',
      name: 'Angkor Private Transfer',
      category: 'Transfert',
      city: 'Siem Reap',
      image:
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=85&w=800&auto=format&fit=crop',
      description: 'Transferts privés aéroport et ville.',
      rating: 4.8,
      reviews: 78,
      price: '15-40 $',
    },
    {
      slug: 'bus-kampot-express',
      name: 'Kampot Express',
      category: 'Bus',
      city: 'Kampot',
      image:
        'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=85&w=800&auto=format&fit=crop',
      description: 'Liaisons Phnom Penh ↔ Kampot.',
      rating: 4.5,
      reviews: 134,
      price: '10-15 $',
    },
  ],
};

// ===== CATÉGORIES PAR TYPE =====
export type CategorieRubrique = {
  icon: string;
  label: string;
};

export const CATEGORIES_RUBRIQUE: Record<string, CategorieRubrique[]> = {
  hotel: [
    { icon: '🏨', label: 'Hôtels' },
    { icon: '🛏️', label: 'Guesthouses' },
    { icon: '🌴', label: 'Resorts' },
    { icon: '🎒', label: 'Hostels' },
    { icon: '🏡', label: 'Villas' },
    { icon: '☕', label: "Chambres d'hôtes" },
  ],
  restaurant: [
    { icon: '🍜', label: 'Khmers' },
    { icon: '🌏', label: 'Internationaux' },
    { icon: '☕', label: 'Cafés' },
    { icon: '🍸', label: 'Bars' },
    { icon: '🥖', label: 'Street food' },
    { icon: '🍣', label: 'Asiatique' },
  ],
  association: [
    { icon: '❤️', label: 'Humanitaire' },
    { icon: '🎓', label: 'Éducation' },
    { icon: '🌿', label: 'Environnement' },
    { icon: '🐘', label: 'Animaux' },
    { icon: '🏥', label: 'Santé' },
    { icon: '🤝', label: 'Social' },
  ],
  activite: [
    { icon: '🏛️', label: 'Temples' },
    { icon: '🥾', label: 'Trek' },
    { icon: '🏖️', label: 'Plage' },
    { icon: '🚤', label: 'Croisière' },
    { icon: '🍳', label: 'Cuisine' },
    { icon: '🧘', label: 'Bien-être' },
  ],
  shopping: [
    { icon: '🧵', label: 'Soie' },
    { icon: '🗿', label: 'Sculpture' },
    { icon: '🌶️', label: 'Poivre' },
    { icon: '🤝', label: 'Artisanat équitable' },
    { icon: '🏪', label: 'Marchés' },
    { icon: '💎', label: 'Pierres précieuses' },
  ],
  transport: [
    { icon: '✈️', label: 'Vols' },
    { icon: '🚌', label: 'Bus' },
    { icon: '🚆', label: 'Train' },
    { icon: '🛺', label: 'Tuk-tuk' },
    { icon: '🚤', label: 'Bateau' },
    { icon: '🛵', label: 'Location' },
  ],
};
// ============================================================================
// AVIS (mock — sera migré vers Supabase)
// ============================================================================

export type ReviewStatus =
  | 'pending'
  | 'published'
  | 'rejected_by_org_final'
  | 'forced_by_admin';

export type ReviewRequestStatus = 'requested' | 'accepted' | 'rejected_by_org';

export type VisitType = 'Bénévolat' | 'Don' | 'Visite' | 'Événement' | 'Autre';

export type Review = {
  id: string;
  association_slug: string;
  author_name: string;
  author_initial: string;
  rating: number; // 1-5
  title: string;
  content: string;
  visit_type: VisitType;
  visit_date: string; // ISO date
  status: ReviewStatus;
  org_response?: string;
  org_response_date?: string;
  rejection_reason?: string;
  created_at: string;
  published_at?: string;
};

export type ReviewRequest = {
  id: string;
  association_slug: string;
  author_name: string;
  visit_type: VisitType;
  visit_date: string;
  motivation: string;
  status: ReviewRequestStatus;
  created_at: string;
};

// ===== AVIS DE DÉMO =====

export const MOCK_REVIEWS: Review[] = [
  // Green Umbrella (12 avis — on en montre 5)
  {
    id: 'r1',
    association_slug: 'green-umbrella',
    author_name: 'Marie Dupont',
    author_initial: 'M',
    rating: 5,
    title: 'Super association',
    content:
      "J'ai passé 3 mois en tant que bénévole, l'équipe est très impliquée et les enfants sont adorables. Une expérience humaine inoubliable.",
    visit_type: 'Bénévolat',
    visit_date: '2025-02-15',
    status: 'published',
    org_response:
      'Merci infiniment Marie pour votre soutien et votre énergie ! Vous nous manquez déjà.',
    org_response_date: '2025-02-18',
    created_at: '2025-02-16',
    published_at: '2025-02-18',
  },
  {
    id: 'r2',
    association_slug: 'green-umbrella',
    author_name: 'Sokha Chen',
    author_initial: 'S',
    rating: 4,
    title: 'Belle mission',
    content:
      'Association très sérieuse, communication claire. Petit bémol sur les horaires parfois flexibles.',
    visit_type: 'Don',
    visit_date: '2025-01-20',
    status: 'published',
    org_response:
      'Merci Sokha pour ce retour constructif. Nous travaillons à améliorer notre organisation.',
    org_response_date: '2025-01-22',
    created_at: '2025-01-21',
    published_at: '2025-01-22',
  },
  {
    id: 'r3',
    association_slug: 'green-umbrella',
    author_name: 'Thomas Bernard',
    author_initial: 'T',
    rating: 5,
    title: 'Excellent travail',
    content:
      "Les enfants sont vraiment encadrés avec bienveillance. Bravo à toute l'équipe.",
    visit_type: 'Visite',
    visit_date: '2024-12-10',
    status: 'published',
    created_at: '2024-12-11',
    published_at: '2024-12-12',
  },
  {
    id: 'r4',
    association_slug: 'green-umbrella',
    author_name: 'Lin Mey',
    author_initial: 'L',
    rating: 5,
    title: 'Recommandé',
    content:
      "Transparence sur l'utilisation des dons, je recommande vivement cette association.",
    visit_type: 'Don',
    visit_date: '2024-11-05',
    status: 'published',
    created_at: '2024-11-06',
    published_at: '2024-11-07',
  },
  {
    id: 'r5',
    association_slug: 'green-umbrella',
    author_name: 'Pierre Martin',
    author_initial: 'P',
    rating: 3,
    title: 'Correct',
    content:
      "L'accueil était bon mais le programme de bénévolat mériterait plus de structure.",
    visit_type: 'Bénévolat',
    visit_date: '2024-10-15',
    status: 'published',
    org_response:
      'Merci Pierre pour ce retour. Nous améliorons constamment notre programme bénévole.',
    org_response_date: '2024-10-18',
    created_at: '2024-10-16',
    published_at: '2024-10-18',
  },

  // Friends International
  {
    id: 'r6',
    association_slug: 'friends-international',
    author_name: 'Sarah Kim',
    author_initial: 'S',
    rating: 5,
    title: 'Excellente cause',
    content:
      'Cette ONG fait un travail remarquable pour la réinsertion des jeunes. Une référence au Cambodge.',
    visit_type: 'Visite',
    visit_date: '2025-03-01',
    status: 'published',
    created_at: '2025-03-02',
    published_at: '2025-03-03',
  },
  {
    id: 'r7',
    association_slug: 'friends-international',
    author_name: 'Michel Leclerc',
    author_initial: 'M',
    rating: 5,
    title: 'Confiance totale',
    content: 'Nous donnons régulièrement, la transparence est exemplaire.',
    visit_type: 'Don',
    visit_date: '2025-02-10',
    status: 'published',
    created_at: '2025-02-11',
    published_at: '2025-02-12',
  },
  {
    id: 'r8',
    association_slug: 'friends-international',
    author_name: 'Nary Sok',
    author_initial: 'N',
    rating: 4,
    title: 'Bon travail',
    content: 'Équipe très professionnelle, belle mission.',
    visit_type: 'Bénévolat',
    visit_date: '2025-01-15',
    status: 'published',
    created_at: '2025-01-16',
    published_at: '2025-01-18',
  },

  // PSE
  {
    id: 'r9',
    association_slug: 'pse-pour-un-sourire',
    author_name: 'Anne Rousseau',
    author_initial: 'A',
    rating: 5,
    title: 'Incontournable',
    content:
      'PSE fait un travail incroyable pour les enfants défavorisés. À soutenir absolument.',
    visit_type: 'Visite',
    visit_date: '2025-02-20',
    status: 'published',
    created_at: '2025-02-21',
    published_at: '2025-02-22',
  },
  {
    id: 'r10',
    association_slug: 'pse-pour-un-sourire',
    author_name: 'Jean Moreau',
    author_initial: 'J',
    rating: 5,
    title: 'Remarquable',
    content:
      "J'ai visité leurs centres, la qualité de l'encadrement est exceptionnelle.",
    visit_type: 'Visite',
    visit_date: '2025-01-25',
    status: 'published',
    created_at: '2025-01-26',
    published_at: '2025-01-28',
  },

  // En attente de modération (pas encore publiés)
  {
    id: 'r11',
    association_slug: 'green-umbrella',
    author_name: 'Sophie Legrand',
    author_initial: 'S',
    rating: 5,
    title: 'Excellent séjour',
    content:
      "J'ai passé 2 semaines, tout était parfait. Bravo à toute l'équipe !",
    visit_type: 'Bénévolat',
    visit_date: '2025-03-10',
    status: 'pending',
    created_at: '2025-03-12',
  },
  {
    id: 'r12',
    association_slug: 'green-umbrella',
    author_name: 'Paul Dubois',
    author_initial: 'P',
    rating: 4,
    title: 'Bonne expérience',
    content: 'Accueil chaleureux, cadre superbe.',
    visit_type: 'Visite',
    visit_date: '2025-03-08',
    status: 'pending',
    created_at: '2025-03-10',
  },
];

// ===== DEMANDES EN COURS (pour modération côté association) =====

export const MOCK_REVIEW_REQUESTS: ReviewRequest[] = [
  {
    id: 'req1',
    association_slug: 'green-umbrella',
    author_name: 'Julie Martin',
    visit_type: 'Bénévolat',
    visit_date: '2025-03-01',
    motivation:
      "J'ai passé un mois formidable avec l'équipe, je souhaite partager mon expérience.",
    status: 'requested',
    created_at: '2025-03-15',
  },
  {
    id: 'req2',
    association_slug: 'green-umbrella',
    author_name: 'David Nguyen',
    visit_type: 'Don',
    visit_date: '2025-02-28',
    motivation: 'Je suis donateur régulier et voudrais laisser un avis.',
    status: 'requested',
    created_at: '2025-03-14',
  },
];

// ===== FONCTIONS UTILITAIRES =====

export function getReviewsForAssociation(slug: string): Review[] {
  return MOCK_REVIEWS.filter(
    (r) => r.association_slug === slug && r.status === 'published'
  );
}

export function getRatingStats(slug: string) {
  const reviews = getReviewsForAssociation(slug);
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: [0, 0, 0, 0, 0], // [5⭐, 4⭐, 3⭐, 2⭐, 1⭐]
    };
  }
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / total;
  const distribution = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );
  return { average, total, distribution };
}

export function getPendingReviews(slug: string): Review[] {
  return MOCK_REVIEWS.filter(
    (r) => r.association_slug === slug && r.status === 'pending'
  );
}

export function getPendingRequests(slug: string): ReviewRequest[] {
  return MOCK_REVIEW_REQUESTS.filter(
    (r) => r.association_slug === slug && r.status === 'requested'
  );
}
// ============================================================================
// ASSOCIATION — Contenu enrichi (mock)
// ============================================================================

export type AssociationValue = {
  icon: string;
  title: string;
  description: string;
};

export type AssociationAction = {
  id: string;
  title: string;
  location: string;
  status: 'actif' | 'termine' | 'prevu';
  description: string;
  image: string;
  date: string;
};

export type AssociationTeamMember = {
  id: string;
  role: 'bureau' | 'terrain' | 'benevole';
  name: string;
  position: string;
  photo?: string;
};

export type AssociationPhoto = {
  url: string;
  caption: string;
};

export type AssociationEnriched = {
  slug: string;
  logo?: string;
  founded_year?: string;
  values?: AssociationValue[];
  actions?: AssociationAction[];
  team?: AssociationTeamMember[];
  photos?: AssociationPhoto[];
  photos_limit?: number;
  social?: {
    facebook?: string;
    instagram?: string;
  };
  stats?: {
    views: number;
    supports: number;
  };
};

// ===== DONNÉES ENRICHIES PAR ASSOCIATION =====

export const ASSOCIATIONS_ENRICHED: Record<string, AssociationEnriched> = {
  'jardin-ayravady': {
    slug: 'jardin-ayravady',
    founded_year: '2009',

    values: [
      {
        icon: '📚',
        title: 'Éducation gratuite',
        description:
          'École 100% gratuite, accessible à tous les enfants de Kep sans condition.',
      },
      {
        icon: '⚽',
        title: 'Sport & épanouissement',
        description:
          "Le jeu et le sport comme vecteurs d'apprentissage et de confiance en soi.",
      },
      {
        icon: '🌍',
        title: 'Langues étrangères',
        description:
          "Anglais et français enseignés pour élargir les opportunités d'avenir.",
      },
      {
        icon: '🤝',
        title: 'Engagement solidaire',
        description:
          "Soutenue par l'association française Enseignement Solidaire depuis sa création.",
      },
    ],

    actions: [
      {
        id: 'jda1',
        title: 'Cours de langues',
        location: 'Kep',
        status: 'actif',
        description:
          'Cours d\'anglais et de français dispensés à près de 70 enfants chaque jour.',
        image:
          'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2009',
      },
      {
        id: 'jda2',
        title: 'Programme sportif',
        location: 'Kep',
        status: 'actif',
        description:
          'Football, volley-ball, arts martiaux et activités physiques pour tous les élèves.',
        image:
          'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2010',
      },
      {
        id: 'jda3',
        title: 'Accueil quotidien',
        location: 'Kep',
        status: 'actif',
        description:
          'Un cadre sûr et bienveillant pour les enfants, avec repas et soutien scolaire.',
        image:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        date: 'Quotidien',
      },
      {
        id: 'jda4',
        title: 'Projet d\'amélioration des infrastructures',
        location: 'Kep',
        status: 'actif',
        description:
          "Rénovation des salles de classe et amélioration de l'accès à l'eau potable.",
        image:
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=85&w=800&auto=format&fit=crop',
        date: 'En cours',
      },
    ],

    team: [
      {
        id: 'jdat1',
        role: 'bureau',
        name: 'Sokphal NGO-SISOWATH',
        position: 'Fondateur et Directeur',
      },
      {
        id: 'jdat2',
        role: 'terrain',
        name: 'Seyha CHHIM',
        position: 'Responsable sportif',
      },
      {
        id: 'jdat3',
        role: 'terrain',
        name: 'EL Mustava',
        position: "Professeur d'anglais et de khmer",
      },
      {
        id: 'jdat4',
        role: 'benevole',
        name: 'Bénévoles internationaux',
        position: '+250 bénévoles depuis 2009',
      },
    ],

    photos: [
      {
        url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        caption: 'Les enfants dans la classe de langues',
      },
      {
        url: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=85&w=800&auto=format&fit=crop',
        caption: 'Entraînement de football',
      },
      {
        url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        caption: 'Pause déjeuner à l\'école',
      },
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
        caption: 'Activités éducatives',
      },
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=800&auto=format&fit=crop',
        caption: 'Jeux dans la cour',
      },
    ],
    photos_limit: 5,

    social: {
      facebook: 'https://facebook.com/EnseignementSolidaire',
      instagram: 'https://instagram.com/enseignement_solidaire',
    },

    stats: {
      views: 890,
      supports: 62,
    },

    donation_link: {
      url: 'https://enseignement-solidaire.org/faire-un-don/',
      label: 'Donner via Enseignement Solidaire',
      platform: 'direct',
      description: 'Don en ligne sécurisé (HelloAsso)',
    },
  },

  'au-dela-les-rizieres': {
    slug: 'au-dela-les-rizieres',
    founded_year: '2018',

    values: [
      {
        icon: '👧',
        title: 'Au service des enfants',
        description:
          "100% des fonds collectés sont dédiés aux actions sur le terrain, au bénéfice des enfants.",
      },
      {
        icon: '🎭',
        title: 'Épanouissement créatif',
        description:
          "Ateliers artistiques, théâtre, jeux : l'enfant au cœur du projet.",
      },
      {
        icon: '🌾',
        title: 'Ancrage local',
        description:
          "Impliqué dans le village d'O'Krassar, dans la province de Kep.",
      },
      {
        icon: '💛',
        title: 'Gestion désintéressée',
        description:
          "Aucun frais de structure : les dons vont directement au centre.",
      },
    ],

    actions: [
      {
        id: 'adlr1',
        title: 'Centre socio-éducatif',
        location: "O'Krassar, Kep",
        status: 'actif',
        description:
          'Accueil quotidien des enfants du village : cours, activités, goûters.',
        image:
          'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2018',
      },
      {
        id: 'adlr2',
        title: 'Ateliers théâtre et arts',
        location: "O'Krassar",
        status: 'actif',
        description:
          'Immersion théâtre, expression scénique, création artistique pour les enfants.',
        image:
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
        date: 'Régulier',
      },
      {
        id: 'adlr3',
        title: 'Sorties pédagogiques',
        location: 'Province de Kep',
        status: 'actif',
        description:
          'Visites de la plantation de poivre de Kampot, événements culturels, découvertes.',
        image:
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=85&w=800&auto=format&fit=crop',
        date: 'Régulier',
      },
      {
        id: 'adlr4',
        title: 'Célébrations culturelles',
        location: 'Kep',
        status: 'actif',
        description:
          'Participation aux fêtes locales : Nouvel An chinois, fêtes khmères…',
        image:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        date: 'Annuel',
      },
    ],

    team: [
      {
        id: 'adlrt1',
        role: 'bureau',
        name: 'Bureau de l\'association',
        position: 'Association française Au-Delà Les Rizières',
      },
      {
        id: 'adlrt2',
        role: 'terrain',
        name: 'Équipe du centre',
        position: "Encadrants à O'Krassar",
      },
      {
        id: 'adlrt3',
        role: 'benevole',
        name: 'Bénévoles en mission',
        position: 'Engagement de 1 à 6 mois',
      },
    ],

    photos: [
      {
        url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        caption: 'Le centre socio-éducatif',
      },
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
        caption: 'Atelier théâtre',
      },
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=85&w=800&auto=format&fit=crop',
        caption: 'Sortie à la plantation de poivre',
      },
      {
        url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        caption: 'Activités avec les enfants',
      },
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=800&auto=format&fit=crop',
        caption: 'Jeux collectifs',
      },
    ],
    photos_limit: 5,

    social: {
      facebook: 'https://facebook.com/audelalesrizieres',
      instagram: 'https://instagram.com/audelalesrizieres',
    },

    stats: {
      views: 540,
      supports: 38,
    },

    donation_link: {
      url: 'https://audelalesrizieres.org/faire-un-don/',
      label: 'Donner via Au-Delà Les Rizières',
      platform: 'direct',
      description: 'Don en ligne sécurisé — déductible à 66%',
    },
  },
  
  'green-umbrella': {
    slug: 'green-umbrella',
    founded_year: '2012',

    values: [
      {
        icon: '🎓',
        title: 'Éducation précoce',
        description:
          "Programme d'éducation maternelle pour les enfants de 4 à 6 ans de la communauté de Putsor.",
      },
      {
        icon: '🤝',
        title: 'Engagement communautaire',
        description:
          'Formation des enseignants et implication des familles dans la scolarité.',
      },
      {
        icon: '🌱',
        title: 'Durabilité',
        description:
          "Développement de projets à long terme pour l'autonomie de la communauté.",
      },
      {
        icon: '🇰🇭',
        title: 'Ancrage local',
        description:
          "Association enregistrée au Ministère de l'Intérieur du Royaume du Cambodge.",
      },
    ],

    actions: [
      {
        id: 'gu1',
        title: 'École maternelle Karuna Kumar',
        location: 'Putsor, Takeo',
        status: 'actif',
        description:
          '128 enfants de 4 à 6 ans scolarisés dans les classes K1 et K2.',
        image:
          'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2012',
      },
      {
        id: 'gu2',
        title: 'Programme Jeunesse',
        location: 'Takeo',
        status: 'actif',
        description:
          'Soutien à 76 anciens élèves poursuivant leurs études au lycée.',
        image:
          'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2018',
      },
      {
        id: 'gu3',
        title: 'Projet Nutrition',
        location: 'Putsor, Takeo',
        status: 'actif',
        description:
          'Distribution de repas équilibrés et éducation nutritionnelle pour les élèves.',
        image:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        date: 'Continu',
      },
      {
        id: 'gu4',
        title: 'Bibliothèque communautaire',
        location: 'Kampong Cham',
        status: 'actif',
        description:
          'Accès aux livres pour les élèves et la communauté locale.',
        image:
          'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2015',
      },
      {
        id: 'gu5',
        title: 'Centre de santé communautaire',
        location: 'Putsor, Takeo',
        status: 'actif',
        description: 'Soins de santé de base et prévention pour les familles.',
        image:
          'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2016',
      },
    ],

    team: [
      {
        id: 'gut1',
        role: 'bureau',
        name: 'Venerable Sokrath Hour',
        position: 'Fondateur',
      },
      {
        id: 'gut2',
        role: 'terrain',
        name: 'Dany Hour',
        position: 'Enseignante principale',
      },
      {
        id: 'gut3',
        role: 'terrain',
        name: 'Équipe locale',
        position: '5 enseignants et 2 coordinateurs',
      },
      {
        id: 'gut4',
        role: 'benevole',
        name: 'Bénévoles internationaux',
        position: 'Universités de Taïwan, Singapour',
      },
    ],

    photos: [
      {
        url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        caption: 'Les enfants dans la classe de maternelle',
      },
      {
        url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
        caption: "Repas du midi à l'école",
      },
      {
        url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        caption: 'Activités éducatives',
      },
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
        caption: 'Bibliothèque communautaire',
      },
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=800&auto=format&fit=crop',
        caption: 'Récréation dans la cour',
      },
    ],
    photos_limit: 5,

    social: {
      facebook: 'https://facebook.com/greenumbrella',
      instagram: 'https://instagram.com/greenumbrella',
    },

    stats: {
      views: 1245,
      supports: 87,
    },

    donation_link: {
      url: 'https://greenumbrella-kh.org/donate/',
      label: 'Donner via notre site',
      platform: 'direct',
      description: 'Virement bancaire ou PayPal',
    },
  },

  'pse-pour-un-sourire': {
    slug: 'pse-pour-un-sourire',
    founded_year: '1995',

    values: [
      {
        icon: '🎓',
        title: "Éducation d'excellence",
        description:
          'Offrir la meilleure éducation aux enfants les plus pauvres, comme à nos propres enfants.',
      },
      {
        icon: '💼',
        title: 'Formation professionnelle',
        description:
          '94% des diplômés ont un emploi 3 mois après leur sortie de formation.',
      },
      {
        icon: '👨‍👩‍👧',
        title: 'Aide aux familles',
        description:
          'Accompagnement des familles pour sortir durablement de la misère.',
      },
      {
        icon: '🇰🇭',
        title: 'Acteur local',
        description: '650 employés cambodgiens, direction locale depuis 2021.',
      },
    ],

    actions: [
      {
        id: 'pse1',
        title: 'École maternelle et primaire',
        location: 'Phnom Penh',
        status: 'actif',
        description:
          'Scolarisation de 6 779 enfants et étudiants en moyenne chaque année.',
        image:
          'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 1995',
      },
      {
        id: 'pse2',
        title: 'Centre de formation professionnelle',
        location: 'Phnom Penh',
        status: 'actif',
        description:
          'Formations qualifiantes : cuisine, couture, informatique, audiovisuel.',
        image:
          'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2000',
      },
      {
        id: 'pse3',
        title: 'Programme alimentaire',
        location: 'Phnom Penh',
        status: 'actif',
        description:
          'Distribution de repas quotidiens et soutien nutritionnel.',
        image:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        date: 'Continu',
      },
      {
        id: 'pse4',
        title: "École des métiers de l'audiovisuel",
        location: 'Phnom Penh',
        status: 'actif',
        description: "Formation aux métiers du cinéma et de l'image.",
        image:
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2010',
      },
    ],

    team: [
      {
        id: 'pset1',
        role: 'bureau',
        name: 'Geoffroy Bazin',
        position: 'Président',
      },
      {
        id: 'pset2',
        role: 'bureau',
        name: 'Leakhena des Pallières',
        position: 'Directrice au Cambodge',
      },
      {
        id: 'pset3',
        role: 'terrain',
        name: 'Équipe locale',
        position: '650 employés cambodgiens',
      },
      {
        id: 'pset4',
        role: 'benevole',
        name: '500 bénévoles',
        position: 'Réseau international de soutien',
      },
    ],

    photos: [
      {
        url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        caption: "Les enfants de PSE à l'école",
      },
      {
        url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
        caption: 'Atelier de formation professionnelle',
      },
      {
        url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=800&auto=format&fit=crop',
        caption: 'Distribution des repas',
      },
    ],
    photos_limit: 5,

    social: {
      facebook: 'https://facebook.com/pse.ong',
      instagram: 'https://instagram.com/pse_ong',
    },

    stats: {
      views: 3420,
      supports: 256,
    },

    donation_link: {
      url: 'https://www.pse.ong/faire-un-don/',
      label: 'Donner via PSE',
      platform: 'direct',
      description: 'Don en ligne sécurisé ou parrainage',
    },
  },

  'friends-international': {
    slug: 'friends-international',
    founded_year: '1994',

    values: [
      {
        icon: '❤️',
        title: 'Dignité',
        description:
          'Chaque enfant et jeune mérite respect, protection et soutien.',
      },
      {
        icon: '🎓',
        title: 'Formation',
        description:
          'Apprendre un métier pour se reconstruire et devenir autonome.',
      },
      {
        icon: '🌏',
        title: 'Communauté',
        description:
          'Agir avec les familles et les communautés pour un changement durable.',
      },
      {
        icon: '🛡️',
        title: 'Protection',
        description:
          'Mouvement ChildSafe pour protéger les enfants dans le tourisme.',
      },
    ],

    actions: [
      {
        id: 'fi1',
        title: 'Restaurant-école Romdeng',
        location: 'Phnom Penh',
        status: 'actif',
        description: 'Formation en cuisine et service pour jeunes défavorisés.',
        image:
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2009',
      },
      {
        id: 'fi2',
        title: "Boutique solidaire Friends 'n' Stuff",
        location: 'Phnom Penh',
        status: 'actif',
        description: 'Vente de créations artisanales au profit des programmes.',
        image:
          'https://images.unsplash.com/photo-1483721310020-03333e577078?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2001',
      },
      {
        id: 'fi3',
        title: "Centre d'accueil de jour",
        location: 'Phnom Penh',
        status: 'actif',
        description: 'Accueil, repas et scolarisation pour enfants des rues.',
        image:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 1994',
      },
      {
        id: 'fi4',
        title: 'Mouvement ChildSafe',
        location: 'International',
        status: 'actif',
        description:
          "Réseau d'acteurs du tourisme engagés pour la protection des enfants.",
        image:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=800&auto=format&fit=crop',
        date: 'Depuis 2004',
      },
    ],

    team: [
      {
        id: 'fit1',
        role: 'bureau',
        name: 'Sébastien Marot',
        position: 'Fondateur et Directeur Exécutif',
      },
      {
        id: 'fit2',
        role: 'terrain',
        name: 'Équipe locale',
        position: 'Éducateurs et travailleurs sociaux',
      },
      {
        id: 'fit3',
        role: 'benevole',
        name: 'Bénévoles internationaux',
        position: 'Programmes de soutien',
      },
    ],

    photos: [
      {
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=800&auto=format&fit=crop',
        caption: 'Accueil du centre de jour',
      },
      {
        url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=800&auto=format&fit=crop',
        caption: 'Atelier de formation',
      },
      {
        url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=800&auto=format&fit=crop',
        caption: 'Restaurant-école Romdeng',
      },
    ],
    photos_limit: 5,

    social: {
      facebook: 'https://facebook.com/friendsinternational',
      instagram: 'https://instagram.com/friendsinternational',
    },

    stats: {
      views: 2340,
      supports: 156,
    },

    donation_link: {
      url: 'https://friends-international.org/donate/',
      label: 'Donner via notre site',
      platform: 'direct',
      description: 'Don en ligne sécurisé',
    },
  },
};

export function getAssociationEnriched(slug: string): AssociationEnriched | null {
  // 1. Cherche dans les données mock connues
  if (ASSOCIATIONS_ENRICHED[slug]) {
    return ASSOCIATIONS_ENRICHED[slug];
  }

  // 2. Retourne un objet par défaut pour les établissements du partenaire
  // (évite que les onglets soient complètement vides)
  return {
    slug,
    values: [],
    actions: [],
    team: [],
    photos: [],
    photos_limit: 5,
    social: {},
    stats: undefined,
  };
}
// ============================================================================
// ASSOCIATION — Liens de don + demandes (mock)
// ============================================================================

export type DonationPlatform =
  | 'helloasso'
  | 'paypal'
  | 'gofundme'
  | 'stripe'
  | 'direct';

export type DonationLink = {
  url: string;
  label: string;
  platform: DonationPlatform;
  description?: string;
};

// ===== AJOUT dans AssociationEnriched =====
// (Cherche l'interface AssociationEnriched existante et ajoute ce champ)
// donation_link?: DonationLink;

// ===== DEMANDES EN MÉMOIRE (simulées) =====

export type DonationRequest = {
  id: string;
  association_slug: string;
  amount: number;
  frequency: 'unique' | 'mensuel';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  anonymous: boolean;
  created_at: string;
};

export type VolunteerRequest = {
  id: string;
  association_slug: string;
  name: string;
  email: string;
  phone?: string;
  start_date: string;
  end_date: string;
  skills?: string;
  motivation: string;
  created_at: string;
};

export type ContactRequest = {
  id: string;
  association_slug: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export type ProjectContributionRequest = {
  id: string;
  association_slug: string;
  project_title: string;
  amount: number;
  name: string;
  email: string;
  message?: string;
  anonymous: boolean;
  created_at: string;
};

// ===== FONCTIONS MOCK (stockage en mémoire pour la session) =====

const _donations: DonationRequest[] = [];
const _volunteers: VolunteerRequest[] = [];
const _contacts: ContactRequest[] = [];
const _contributions: ProjectContributionRequest[] = [];

export function submitDonation(
  data: Omit<DonationRequest, 'id' | 'created_at'>
) {
  const req: DonationRequest = {
    ...data,
    id: 'don_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  _donations.push(req);
  console.log('📥 Demande de don :', req);
  return req;
}

export function submitVolunteer(
  data: Omit<VolunteerRequest, 'id' | 'created_at'>
) {
  const req: VolunteerRequest = {
    ...data,
    id: 'vol_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  _volunteers.push(req);
  console.log('📥 Candidature bénévole :', req);
  return req;
}

export function submitContact(data: Omit<ContactRequest, 'id' | 'created_at'>) {
  const req: ContactRequest = {
    ...data,
    id: 'con_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  _contacts.push(req);
  console.log('📥 Message de contact :', req);
  return req;
}

export function submitContribution(
  data: Omit<ProjectContributionRequest, 'id' | 'created_at'>
) {
  const req: ProjectContributionRequest = {
    ...data,
    id: 'ctr_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  _contributions.push(req);
  console.log('📥 Contribution au projet :', req);
  return req;
}
