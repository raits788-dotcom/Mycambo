'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReviewsSection from '@/components/avis/ReviewsSection';
import AssociationValues from './AssociationValues';
import AssociationActions from './AssociationActions';
import AssociationTeam from './AssociationTeam';
import AssociationPhotos from './AssociationPhotos';
import { ContributeProjectButton } from '@/components/association/AssociationActionsBar';
import DonateModal from '@/components/association/DonateModal';
import VolunteerModal from '@/components/association/VolunteerModal';
import ContactModal from '@/components/association/ContactModal';
import { cn } from '@/lib/utils';
import type {
  getRatingStats,
  AssociationEnriched,
  DonationLink,
} from '@/lib/mock-data';

type ModalType =
  | 'donate'
  | 'volunteer'
  | 'contact'
  | 'contact-partnership'
  | 'contact-other'
  | null;

interface Commerce {
  slug: string;
  name: string;
  category: string;
  longDescription: string;
  gallery: string[];
  amenities: string[];
  mission?: string;
  impact?: { label: string; value: string }[];
  project?: {
    title: string;
    description: string;
    progress: number;
    goal: string;
    current: string;
  };
  howToHelp?: {
    icon: string;
    title: string;
    description: string;
    action?: 'donate' | 'volunteer' | 'contact-partnership' | 'contact-other';
  }[];
  founded_year?: string;
}

interface CommerceTabsProps {
  commerce: Commerce;
  isAssociation: boolean;
  stats: ReturnType<typeof getRatingStats> | null;
  enriched: AssociationEnriched | null;
}

export default function CommerceTabs({
  commerce,
  isAssociation,
  stats,
  enriched,
}: CommerceTabsProps) {
  const [tab, setTab] = useState('about');
  const [modal, setModal] = useState<ModalType>(null);

  const associationTabs = [
    { id: 'about', label: 'À propos' },
    { id: 'impact', label: 'Notre impact' },
    { id: 'actions', label: 'Nos actions' },
    { id: 'team', label: 'Notre équipe' },
    { id: 'photos', label: 'Photos' },
    { id: 'reviews', label: `Avis (${stats?.total || 0})` },
    { id: 'help', label: 'Comment aider' },
  ];

  const standardTabs = [
    { id: 'about', label: 'À propos' },
    { id: 'photos', label: 'Photos' },
    { id: 'amenities', label: 'Équipements' },
  ];

  const tabs = isAssociation ? associationTabs : standardTabs;

  return (
    <>
      <div className="flex items-center gap-1 border-b border-gris-ligne mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors',
              tab === t.id
                ? 'text-marine border-marine'
                : 'text-gris-texte border-transparent hover:text-marine hover:border-marine/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {/* ============ ASSOCIATION ============ */}

        {isAssociation && tab === 'about' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-extrabold text-marine mb-4">
                Notre mission
              </h2>
              <p className="text-gris-texte leading-relaxed">
                {commerce.mission || commerce.longDescription}
              </p>
            </div>

            {enriched?.founded_year && (
              <div className="bg-gris-fond rounded-lg p-5 flex items-center gap-4">
                <div className="text-3xl">📅</div>
                <div>
                  <div className="text-sm text-gris-texte">Fondée en</div>
                  <div className="text-xl font-extrabold text-marine">
                    {enriched.founded_year}
                  </div>
                </div>
              </div>
            )}

            {enriched?.values && enriched.values.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-marine mb-4">
                  Nos valeurs
                </h3>
                <AssociationValues values={enriched.values} />
              </div>
            )}

            <div>
              <h3 className="text-lg font-extrabold text-marine mb-3">
                Notre histoire
              </h3>
              <p className="text-gris-texte leading-relaxed">
                {commerce.longDescription}
              </p>
            </div>
          </div>
        )}

        {isAssociation && tab === 'impact' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-6">
              Notre impact
            </h2>

            {commerce.impact && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {commerce.impact.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gris-fond rounded-lg p-4 text-center"
                  >
                    <div className="text-3xl font-extrabold text-marine mb-1">
                      {item.value}
                    </div>
                    <div className="text-xs text-gris-texte">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {commerce.project && (
              <div className="bg-white border border-gris-ligne rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-ic-or text-marine-dark px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Projet en cours
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-marine mb-2">
                  {commerce.project.title}
                </h3>
                <p className="text-sm text-gris-texte leading-relaxed mb-5">
                  {commerce.project.description}
                </p>

                <div className="mb-2">
                  <div className="h-3 bg-gris-fond rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ic-or to-ic-vert rounded-full transition-all duration-500"
                      style={{ width: `${commerce.project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gris-texte">
                    <b className="text-marine">
                      {commerce.project.current}
                    </b>{' '}
                    récoltés sur {commerce.project.goal}
                  </span>
                  <span className="font-extrabold text-marine">
                    {commerce.project.progress}%
                  </span>
                </div>

                <div className="mt-5">
                  <ContributeProjectButton
                    associationSlug={commerce.slug}
                    associationName={commerce.name}
                    projectTitle={commerce.project.title}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {isAssociation && tab === 'actions' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-extrabold text-marine">
                Nos actions sur le terrain
              </h2>
            </div>

            {enriched?.actions && enriched.actions.length > 0 ? (
              <AssociationActions actions={enriched.actions} />
            ) : (
              <div className="text-center py-12 bg-gris-fond rounded-lg">
                <p className="text-sm text-gris-texte">
                  Aucune action à afficher pour le moment.
                </p>
              </div>
            )}
          </div>
        )}

        {isAssociation && tab === 'team' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-6">
              Notre équipe
            </h2>

            {enriched?.team && enriched.team.length > 0 ? (
              <AssociationTeam team={enriched.team} />
            ) : (
              <div className="text-center py-12 bg-gris-fond rounded-lg">
                <p className="text-sm text-gris-texte">
                  Aucun membre à afficher pour le moment.
                </p>
              </div>
            )}
          </div>
        )}

        {isAssociation && tab === 'photos' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-6">
              Photos
            </h2>

            {enriched?.photos && enriched.photos.length > 0 ? (
              <AssociationPhotos
                photos={enriched.photos}
                limit={enriched.photos_limit || 5}
              />
            ) : (
              <div className="text-center py-12 bg-gris-fond rounded-lg">
                <p className="text-sm text-gris-texte">
                  Aucune photo pour le moment.
                </p>
              </div>
            )}
          </div>
        )}

        {isAssociation && tab === 'reviews' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-6">
              Avis de la communauté
            </h2>
            <ReviewsSection
              associationSlug={commerce.slug}
              associationName={commerce.name}
              isLoggedIn={false}
            />
          </div>
        )}

        {/* ===== Comment aider ===== */}
        {isAssociation && tab === 'help' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-6">
              Comment nous aider
            </h2>

            {commerce.howToHelp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commerce.howToHelp.map((item, i) => {
                  const handleClick = () => {
                    switch (item.action) {
                      case 'donate':
                        setModal('donate');
                        break;
                      case 'volunteer':
                        setModal('volunteer');
                        break;
                      case 'contact-partnership':
                        setModal('contact-partnership');
                        break;
                      case 'contact-other':
                        setModal('contact-other');
                        break;
                      default:
                        setModal('contact');
                    }
                  };

                  return (
                    <button
                      key={i}
                      onClick={handleClick}
                      className="group bg-white border border-gris-ligne rounded-lg p-5 text-left hover:border-marine hover:shadow-cb-md hover:-translate-y-0.5 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="text-3xl">{item.icon}</div>
                        <span className="text-gris-doux group-hover:text-marine group-hover:translate-x-1 transition-all text-lg">
                          →
                        </span>
                      </div>
                      <h3 className="font-extrabold text-marine mb-2 group-hover:text-marine-light transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gris-texte leading-relaxed">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 bg-gradient-to-br from-marine to-marine-dark rounded-lg p-6 text-white">
              <h3 className="text-lg font-extrabold mb-2">
                🙋 Rejoignez notre équipe
              </h3>
              <p className="text-sm text-white/85 leading-relaxed mb-4">
                Nous accueillons des bénévoles toute l&apos;année, pour 2 semaines
                minimum. Logement et repas fournis.
              </p>
              <button
                onClick={() => setModal('volunteer')}
                className="bg-white text-marine font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Nous contacter
              </button>
            </div>
          </div>
        )}

        {/* ============ AUTRES ============ */}

        {!isAssociation && tab === 'about' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-3">
              À propos
            </h2>
            <p className="text-gris-texte leading-relaxed">
              {commerce.longDescription}
            </p>
          </div>
        )}

        {!isAssociation && tab === 'photos' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-4">
              Photos
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {commerce.gallery.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${commerce.name} ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAssociation && tab === 'amenities' && (
          <div>
            <h2 className="text-xl font-extrabold text-marine mb-4">
              Équipements & services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commerce.amenities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gris-texte"
                >
                  <span className="text-ic-vert">✓</span> {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALES ===== */}
      {modal === 'donate' && (
        <DonateModal
          associationSlug={commerce.slug}
          associationName={commerce.name}
          donationLink={enriched?.donation_link as DonationLink | null}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'volunteer' && (
        <VolunteerModal
          associationSlug={commerce.slug}
          associationName={commerce.name}
          onClose={() => setModal(null)}
        />
      )}
      {(modal === 'contact' ||
        modal === 'contact-partnership' ||
        modal === 'contact-other') && (
        <ContactModal
          associationSlug={commerce.slug}
          associationName={commerce.name}
          initialSubject={
            modal === 'contact-partnership'
              ? 'Partenariat'
              : modal === 'contact-other'
              ? 'Autre'
              : 'Information générale'
          }
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}