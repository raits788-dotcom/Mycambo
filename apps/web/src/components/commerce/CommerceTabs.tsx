'use client';

import { useState } from 'react';
import { Info, Image as ImageIcon, Gift, Star, CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import InfoTab from './InfoTab';
import PhotosTab from './PhotosTab';
import ServicesTab from './ServicesTab';
import StatsTab from './StatsTab';
import SubscriptionTab from './SubscriptionTab';
import ReviewsSection from '@/components/avis/ReviewsSection';

type TabId = 'info' | 'photos' | 'services' | 'stats' | 'reviews' | 'subscription';

interface Commerce {
  slug: string;
  name: string;
  category?: string;
  longDescription?: string;
  gallery?: string[];
  amenities?: string[];
  mission?: string;
  impact?: { label: string; value: string }[];
  project?: any;
  howToHelp?: any[];
  description?: string;
  [key: string]: any;
}

interface Props {
  commerce: Commerce;
  isAssociation: boolean;
  stats: any;
  enriched: any;
  permissions?: {
    canShowPhotos: boolean;
    canShowDescription: boolean;
    canShowHours: boolean;
    canShowSocialLinks: boolean;
    canShowStats: boolean;
    canBeFeatured: boolean;
    maxPhotos: number;
  };
}

export default function CommerceTabs({
  commerce,
  isAssociation,
  stats,
  enriched,
  permissions,
}: Props) {
  const [tab, setTab] = useState<TabId>('info');

  // Permissions par défaut (tout autorisé si non fourni)
  const perms = permissions || {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: true,
    maxPhotos: 999,
  };

  const tabs: { id: TabId; label: string; icon: any; locked?: boolean; reason?: string }[] = [
    { id: 'info', label: 'À propos', icon: Info },
    {
      id: 'photos',
      label: `Photos${commerce.gallery && commerce.gallery.length > 0 ? ` (${commerce.gallery.length})` : ''}`,
      icon: ImageIcon,
      locked: !perms.canShowPhotos,
      reason: 'Formule Découverte : photos masquées',
    },
    { id: 'services', label: 'Équipements', icon: Gift },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: Star,
      locked: !perms.canShowStats,
      reason: 'Formule Découverte : stats masquées',
    },
    { id: 'reviews', label: 'Avis', icon: Star },
  ];

  return (
    <>
      {/* Bandeau informatif si formule Découverte */}
      {!perms.canShowPhotos && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <b>Cette fiche est en formule Découverte.</b>
            <br />
            Les photos, description détaillée, horaires et statistiques ne sont pas disponibles.
            L&apos;établissement doit passer à une formule payante pour les activer.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gris-ligne mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          const isLocked = t.locked;

          return (
            <button
              key={t.id}
              onClick={() => !isLocked && setTab(t.id)}
              disabled={isLocked}
              title={isLocked ? t.reason : ''}
              className={cn(
                'px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2',
                isActive
                  ? 'text-marine border-marine'
                  : isLocked
                    ? 'text-gris-doux border-transparent cursor-not-allowed opacity-50'
                    : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
              )}
            >
              <Icon size={14} />
              {t.label}
              {isLocked && <Lock size={11} />}
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6">

        {/* Onglet Info — description masquée si Découverte */}
        {tab === 'info' && (
          <>
            {perms.canShowDescription ? (
              <div className="space-y-6">
                {(commerce.longDescription || commerce.description) && (
                  <div>
                    <h2 className="font-bold text-marine text-lg mb-3">À propos</h2>
                    <p className="text-sm text-gris-texte leading-relaxed whitespace-pre-line">
                      {commerce.longDescription || commerce.description}
                    </p>
                  </div>
                )}

                {commerce.mission && (
                  <div>
                    <h3 className="font-bold text-marine text-base mb-2">Notre mission</h3>
                    <p className="text-sm text-gris-texte leading-relaxed">{commerce.mission}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock size={32} className="text-gris-doux mx-auto mb-3" />
                <p className="text-sm text-gris-texte">
                  La description détaillée n&apos;est pas disponible en formule Découverte.
                </p>
              </div>
            )}
          </>
        )}

        {/* Onglet Photos */}
        {tab === 'photos' && (
          <>
            {perms.canShowPhotos ? (
              <PhotosTab
                establishment={commerce as any}
                onUpdate={() => {}}
              />
            ) : (
              <div className="text-center py-8">
                <Lock size={32} className="text-gris-doux mx-auto mb-3" />
                <p className="text-sm text-gris-texte">
                  Les photos ne sont pas disponibles en formule Découverte.
                </p>
              </div>
            )}
          </>
        )}

        {/* Onglet Services / Équipements */}
        {tab === 'services' && (
          <ServicesTab
            establishment={commerce as any}
            onUpdate={() => {}}
          />
        )}

        {/* Onglet Stats */}
        {tab === 'stats' && (
          <>
            {perms.canShowStats ? (
              <StatsTab establishment={commerce as any} />
            ) : (
              <div className="text-center py-8">
                <Lock size={32} className="text-gris-doux mx-auto mb-3" />
                <p className="text-sm text-gris-texte">
                  Les statistiques ne sont pas disponibles en formule Découverte.
                </p>
              </div>
            )}
          </>
        )}

        {/* Onglet Avis */}
        {tab === 'reviews' && (
          <ReviewsSection
            associationSlug={commerce.slug}
            associationName={commerce.name}
          />
        )}
      </div>
    </>
  );
}