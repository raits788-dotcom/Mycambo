'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { getPlanPermissionsFromDB, getPlanPermissions, type PlanPermissions } from '@/lib/plan-permissions';
import InfoTab from './InfoTab';
import PhotosTab from './PhotosTab';
import ServicesTab from './ServicesTab';
import StatsTab from './StatsTab';
import SubscriptionTab from './SubscriptionTab';
import ReviewsTab from './ReviewsTab';
import RequestsTab from './RequestsTab';
import OffersTab from './OffersTab';
import JobsTab from './JobsTab';
import ReservationsTab from './ReservationsTab';
import ProjectsEditor from './ProjectsEditor';
import HistoryEditor from './HistoryEditor';
import TeamPublicEditor from './TeamPublicEditor';
import ImpactEditor from './ImpactEditor';
import SupportEditor from './SupportEditor';

type TabId =
  | 'info' | 'photos' | 'services' | 'projects' | 'support' | 'history' | 'team' | 'impact'
  | 'stats' | 'reviews' | 'requests' | 'subscription' | 'offers' | 'jobs' | 'reservations';

interface EstablishmentTabsProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

function isAssociation(est: StoredEstablishment): boolean {
  const name = est.categories?.name?.toLowerCase() || '';
  return name.includes('association');
}

export default function EstablishmentTabs({
  establishment,
  onUpdate,
}: EstablishmentTabsProps) {
  // Onglet actif persisté par établissement : évite de retomber sur
  // "Informations" après un enregistrement qui recharge l'établissement.
  const storageKey = `mycambo_esttab_${establishment.id}`;
  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === 'undefined') return 'info';
    try {
      return (sessionStorage.getItem(storageKey) as TabId) || 'info';
    } catch {
      return 'info';
    }
  });
  const [perms, setPerms] = useState<PlanPermissions>(() => getPlanPermissions('decouverte'));

  const selectTab = (id: TabId) => {
    setTab(id);
    try { sessionStorage.setItem(storageKey, id); } catch { /* ignore */ }
  };

  // Charge les permissions de la formule active de l'établissement.
  useEffect(() => {
    (async () => {
      try {
        const sb = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await sb
          .from('subscriptions')
          .select('plans(slug)')
          .eq('business_id', establishment.id)
          .maybeSingle();
        const slug = (data?.plans as any)?.slug || 'decouverte';
        setPerms(await getPlanPermissionsFromDB(slug));
      } catch {
        /* garde Découverte par défaut */
      }
    })();
  }, [establishment.id]);

  const asso = isAssociation(establishment);

  const tabs = [
    { id: 'info' as TabId, label: 'Informations', icon: 'fa-pencil', show: true },
    { id: 'photos' as TabId, label: 'Photos', icon: 'fa-images', show: true },
    { id: 'services' as TabId, label: asso ? 'Nos actions' : 'Services', icon: 'fa-gift', show: true },
    // Onglets dédiés — associations uniquement
    { id: 'projects' as TabId, label: 'Nos projets', icon: 'fa-bullseye', show: asso },
    { id: 'support' as TabId, label: 'Nous soutenir', icon: 'fa-hand-holding-heart', show: asso },
    { id: 'history' as TabId, label: 'Notre histoire', icon: 'fa-clock-rotate-left', show: asso },
    { id: 'team' as TabId, label: 'Notre équipe', icon: 'fa-users', show: asso },
    { id: 'impact' as TabId, label: 'Notre impact', icon: 'fa-chart-column', show: asso },
    // Communs
    { id: 'offers' as TabId, label: 'Offres', icon: 'fa-bullhorn', show: perms.canPublishOffers },
    { id: 'reservations' as TabId, label: 'Réservations', icon: 'fa-calendar-check', show: perms.canReceiveReservations },
    { id: 'jobs' as TabId, label: 'Emploi', icon: 'fa-briefcase', show: perms.canReceiveApplications },
    { id: 'stats' as TabId, label: 'Statistiques', icon: 'fa-chart-line', show: true },
    { id: 'reviews' as TabId, label: 'Avis', icon: 'fa-star', show: true },
    { id: 'requests' as TabId, label: 'Demandes', icon: 'fa-inbox', show: true },
    { id: 'subscription' as TabId, label: 'Abonnement', icon: 'fa-credit-card', show: true },
  ].filter((t) => t.show);

  // Si l'onglet persisté n'est plus visible (ex. plus une asso), revenir à info.
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) selectTab('info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asso, perms]);

  return (
    <>
      <div className="flex items-center gap-1 border-b border-gris-ligne mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
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
        {tab === 'info' && <InfoTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'photos' && <PhotosTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'services' && <ServicesTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'projects' && <ProjectsEditor establishment={establishment} />}
        {tab === 'support' && <SupportEditor establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'history' && <HistoryEditor establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'team' && <TeamPublicEditor establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'impact' && <ImpactEditor establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'offers' && <OffersTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'reservations' && <ReservationsTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'jobs' && <JobsTab establishment={establishment} onUpdate={onUpdate} />}
        {tab === 'stats' && <StatsTab establishment={establishment} />}
        {tab === 'reviews' && <ReviewsTab establishment={establishment} />}
        {tab === 'requests' && <RequestsTab establishment={establishment} />}
        {tab === 'subscription' && <SubscriptionTab establishment={establishment} />}
      </div>
    </>
  );
}
