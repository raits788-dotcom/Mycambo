'use client';

import { useState } from 'react';
import {
  Heart,
  Users,
  Target,
  Hotel,
  UtensilsCrossed,
  Compass,
  ShoppingBag,
  Bike,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface ServicesTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type ServiceKey =
  | 'donations'
  | 'volunteers'
  | 'projects'
  | 'reservations'
  | 'menu'
  | 'rooms'
  | 'offers'
  | 'shipping'
  | 'tours'
  | 'products';

type Service = {
  key: ServiceKey;
  label: string;
  description: string;
  icon: typeof Heart;
  color: string;
};

// ===== Services par type d'établissement =====
const SERVICES_BY_TYPE: Record<string, Service[]> = {
  association: [
    {
      key: 'donations',
      label: 'Dons',
      description: 'Recevoir des promesses de don',
      icon: Heart,
      color: 'text-red-500 bg-red-100',
    },
    {
      key: 'volunteers',
      label: 'Bénévolat',
      description: 'Recevoir des candidatures bénévoles',
      icon: Users,
      color: 'text-green-600 bg-green-100',
    },
    {
      key: 'projects',
      label: 'Projets',
      description: 'Présenter vos projets en cours',
      icon: Target,
      color: 'text-orange-600 bg-orange-100',
    },
  ],
  hotel: [
    {
      key: 'rooms',
      label: 'Chambres',
      description: 'Afficher vos chambres et tarifs',
      icon: Hotel,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      key: 'reservations',
      label: 'Réservations',
      description: 'Recevoir des demandes de réservation',
      icon: Target,
      color: 'text-green-600 bg-green-100',
    },
    {
      key: 'offers',
      label: 'Offres promotionnelles',
      description: 'Créer des offres spéciales',
      icon: Heart,
      color: 'text-red-500 bg-red-100',
    },
  ],
  restaurant: [
    {
      key: 'menu',
      label: 'Menu',
      description: 'Afficher votre menu et vos plats',
      icon: UtensilsCrossed,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      key: 'reservations',
      label: 'Réservations',
      description: 'Recevoir des demandes de réservation',
      icon: Target,
      color: 'text-green-600 bg-green-100',
    },
    {
      key: 'shipping',
      label: 'Livraison',
      description: 'Proposer la livraison ou à emporter',
      icon: Bike,
      color: 'text-blue-600 bg-blue-100',
    },
  ],
  activite: [
    {
      key: 'tours',
      label: 'Tours / Activités',
      description: 'Présenter vos activités et horaires',
      icon: Compass,
      color: 'text-green-600 bg-green-100',
    },
    {
      key: 'reservations',
      label: 'Réservations',
      description: 'Recevoir des demandes de réservation',
      icon: Target,
      color: 'text-blue-600 bg-blue-100',
    },
  ],
  boutique: [
    {
      key: 'products',
      label: 'Produits',
      description: 'Afficher vos produits en vente',
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      key: 'shipping',
      label: 'Livraison',
      description: 'Proposer la livraison',
      icon: Bike,
      color: 'text-blue-600 bg-blue-100',
    },
  ],
};

export default function ServicesTab({
  establishment,
  onUpdate,
}: ServicesTabProps) {
  const services = SERVICES_BY_TYPE[establishment.type] || [];

  const [active, setActive] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    services.forEach((s) => {
      initial[s.key] = false;
    });
    return initial;
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key: ServiceKey) => {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateEstablishment(establishment.slug, {
      // @ts-ignore
      services: active,
    });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-gris-fond rounded-lg">
        <Info size={40} className="text-gris-ligne mx-auto mb-3" />
        <p className="text-sm text-gris-texte">
          Aucun service disponible pour ce type d&apos;établissement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-extrabold text-marine text-base mb-1">
          Services de votre établissement
        </h2>
        <p className="text-xs text-gris-texte">
          Activez les services que vous souhaitez proposer sur votre fiche
          publique. Certains services dépendent de votre formule d&apos;abonnement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const isActive = active[service.key];

          return (
            <button
              key={service.key}
              onClick={() => toggle(service.key)}
              className={cn(
                'text-left flex items-start gap-4 p-5 rounded-lg border-2 transition-all',
                isActive
                  ? 'border-marine bg-marine/5'
                  : 'border-gris-ligne hover:border-marine/50'
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
                  service.color
                )}
              >
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold text-marine text-sm">
                    {service.label}
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isActive
                        ? 'bg-marine border-marine'
                        : 'border-gris-ligne'
                    )}
                  >
                    {isActive && (
                      <i className="fas fa-check text-white text-[10px]" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gris-texte">
                  {service.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Certains services avancés (réservations, offres) peuvent nécessiter
          une formule Pro ou supérieure.
        </p>
      </div>

      {/* Save */}
      <div className="pt-4 mt-6 flex justify-end gap-3 border-t border-gris-ligne">
        <button
          onClick={handleSave}
          disabled={saved}
          className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
        >
          {saved ? (
            <>
              <i className="fas fa-check" /> Enregistré
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Enregistrer les services
            </>
          )}
        </button>
      </div>
    </div>
  );
}