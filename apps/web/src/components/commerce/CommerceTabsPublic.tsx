'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Info, Image as ImageIcon, Gift, Star, Lock, BarChart3, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReviewsSection from '@/components/avis/ReviewsSection';

type TabId = 'info' | 'photos' | 'services' | 'stats' | 'reviews';

interface Commerce {
  slug: string;
  name: string;
  category?: string;
  longDescription?: string;
  description?: string;
  gallery?: string[];
  amenities?: string[];
  mission?: string;
  impact?: { label: string; value: string }[];
  [key: string]: any;
}

interface Props {
  commerce: Commerce;
  isAssociation: boolean;
  stats: any;
  permissions?: {
    canShowPhotos: boolean;
    canShowDescription: boolean;
    canShowStats: boolean;
    maxPhotos: number;
  };
}

export default function CommerceTabsPublic({
  commerce,
  isAssociation,
  stats,
  permissions,
}: Props) {
  const [tab, setTab] = useState<TabId>('info');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const perms = permissions || {
    canShowPhotos: true,
    canShowDescription: true,
    canShowStats: true,
    maxPhotos: 999,
  };

  const tabs: { id: TabId; label: string; icon: any; locked?: boolean; reason?: string }[] = [
    { id: 'info', label: 'À propos', icon: Info },
    {
      id: 'photos',
      label: `Photos${commerce.gallery && commerce.gallery.length > 0 ? ` (${commerce.gallery.length})` : ''}`,
      icon: ImageIcon,
      locked: !perms.canShowPhotos,
      reason: 'Photos non disponibles pour cet établissement',
    },
    { id: 'services', label: 'Équipements', icon: Gift },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: BarChart3,
      locked: !perms.canShowStats,
      reason: 'Statistiques non disponibles',
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
            <b>Cet établissement est en formule Découverte.</b>
            <br />
            Les photos, description détaillée, horaires et statistiques ne sont pas disponibles.
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

        {/* Onglet Info */}
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

                {commerce.impact && commerce.impact.length > 0 && (
                  <div>
                    <h3 className="font-bold text-marine text-base mb-3">Notre impact</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {commerce.impact.map((item: any, i: number) => (
                        <div key={i} className="bg-gris-fond rounded-lg p-4 text-center">
                          <div className="text-2xl font-extrabold text-marine">{item.value}</div>
                          <div className="text-xs text-gris-texte mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>
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

        {/* Onglet Photos — VUE LECTURE SEULE */}
        {tab === 'photos' && (
          <>
            {perms.canShowPhotos ? (
              commerce.gallery && commerce.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commerce.gallery.map((url: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(i)}
                      className="group aspect-square rounded-lg overflow-hidden bg-gris-fond"
                    >
                      <Image
                        src={url}
                        alt={`${commerce.name} - photo ${i + 1}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gris-texte">
                  Aucune photo disponible pour le moment.
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <Lock size={32} className="text-gris-doux mx-auto mb-3" />
                <p className="text-sm text-gris-texte">
                  Les photos ne sont pas disponibles en formule Découverte.
                </p>
              </div>
            )}

            {/* Lightbox */}
            {selectedPhoto !== null && commerce.gallery && (
              <div
                className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4"
                onClick={() => setSelectedPhoto(null)}
              >
                <button
                  onClick={() => setSelectedPhoto(null)}
                  aria-label="Fermer"
                  className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors"
                >
                  <X size={22} />
                </button>

                <div className="relative max-w-4xl w-full aspect-[4/3]">
                  <Image
                    src={commerce.gallery[selectedPhoto]}
                    alt={`${commerce.name} - photo ${selectedPhoto + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Onglet Services / Équipements */}
        {tab === 'services' && (
          <>
            {commerce.amenities && commerce.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commerce.amenities.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gris-texte">
                    <div className="w-1.5 h-1.5 rounded-full bg-marine flex-shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gris-texte">
                Aucun équipement renseigné pour le moment.
              </div>
            )}
          </>
        )}

        {/* Onglet Stats */}
        {tab === 'stats' && (
          <>
            {perms.canShowStats ? (
              <div className="text-center py-8 text-sm text-gris-texte">
                Les statistiques seront bientôt disponibles.
              </div>
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