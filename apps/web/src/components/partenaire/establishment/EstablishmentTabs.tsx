'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import InfoTab from './InfoTab';
import PhotosTab from './PhotosTab';
import ServicesTab from './ServicesTab';
import StatsTab from './StatsTab';
import SubscriptionTab from './SubscriptionTab';
import ReviewsTab from './ReviewsTab';
import RequestsTab from './RequestsTab';

type TabId = 'info' | 'photos' | 'services' | 'stats' | 'reviews' | 'requests' | 'subscription';

interface EstablishmentTabsProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

export default function EstablishmentTabs({
  establishment,
  onUpdate,
}: EstablishmentTabsProps) {
  const [tab, setTab] = useState<TabId>('info');

  const tabs = [
    { id: 'info' as TabId, label: 'Informations', icon: 'fa-pencil' },
    { id: 'photos' as TabId, label: 'Photos', icon: 'fa-images' },
    { id: 'services' as TabId, label: 'Services', icon: 'fa-gift' },
    { id: 'stats' as TabId, label: 'Statistiques', icon: 'fa-chart-line' },
    { id: 'reviews' as TabId, label: 'Avis', icon: 'fa-star' },
    { id: 'requests' as TabId, label: 'Demandes', icon: 'fa-inbox' },
    {
      id: 'subscription' as TabId,
      label: 'Abonnement',
      icon: 'fa-credit-card',
    },
  ];

  return (
    <>
      <div className="flex items-center gap-1 border-b border-gris-ligne mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2',
              tab === t.id
                ? 'text-marine border-marine'
                : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
            )}
          >
            <i className={`fas ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gris-ligne p-6">
        {tab === 'info' && (
          <InfoTab establishment={establishment} onUpdate={onUpdate} />
        )}
        {tab === 'photos' && (
          <PhotosTab establishment={establishment} onUpdate={onUpdate} />
        )}
        {tab === 'services' && (
          <ServicesTab establishment={establishment} onUpdate={onUpdate} />
        )}
        {tab === 'stats' && <StatsTab establishment={establishment} />}
        {tab === 'reviews' && <ReviewsTab establishment={establishment} />}
        {tab === 'requests' && <RequestsTab establishment={establishment} />}
        {tab === 'subscription' && (
          <SubscriptionTab establishment={establishment} />
        )}
      </div>
    </>
  );
}