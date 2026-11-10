// ============================================================================
// Mapping clé d'icône (base) → composant lucide, pour les commodités.
// Les clés correspondent à category_amenities.icon_key.
// Un composant React ne peut pas vivre en base : on mappe ici.
// ============================================================================

import {
  Snowflake, Briefcase, CreditCard, Languages, Calendar, Clock, Route, Plane,
  Users, Wifi, Sun, Package, Leaf, Scissors, ParkingSquare, Hand, Flame, Key,
  Home, Clipboard, Video, Waves, Coffee, Utensils, Accessibility, Heart,
  Handshake, Compass, Info,
} from 'lucide-react';

export const AMENITY_ICONS: Record<string, typeof Info> = {
  snowflake: Snowflake,
  briefcase: Briefcase,
  'credit-card': CreditCard,
  languages: Languages,
  calendar: Calendar,
  clock: Clock,
  route: Route,
  plane: Plane,
  users: Users,
  wifi: Wifi,
  sun: Sun,
  package: Package,
  leaf: Leaf,
  scissors: Scissors,
  parking: ParkingSquare,
  hand: Hand,
  flame: Flame,
  key: Key,
  home: Home,
  clipboard: Clipboard,
  video: Video,
  waves: Waves,
  coffee: Coffee,
  utensils: Utensils,
  accessibility: Accessibility,
  heart: Heart,
  handshake: Handshake,
  compass: Compass,
  // anciennes clés (rétrocompat 0007)
  menu: Utensils,
  shopping: Package,
  bike: Route,
  target: Calendar,
  hotel: Home,
};

export const DEFAULT_AMENITY_ICON = Info;
