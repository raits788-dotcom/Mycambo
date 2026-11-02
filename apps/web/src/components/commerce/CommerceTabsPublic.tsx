'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Info, Image as ImageIcon, Gift, Star, Lock, BarChart3, X, Target, Clock, Users, HandHeart, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReviewsSection from '@/components/avis/ReviewsSection';
import ProjectsSection from '@/components/association/ProjectsSection';
import SupportSection from '@/components/association/SupportSection';

// Message affiché quand un onglet existe mais n'a pas encore de contenu.
// L'onglet reste visible pour que le visiteur sache qu'il existe ; une info
// saisie côté partenaire apparaît alors automatiquement ici.
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="text-center py-12 text-gris-doux">
      <div className="opacity-40 flex justify-center mb-3">{icon}</div>
      <p className="text-sm text-gris-texte">{title}</p>
      {sub && <p className="text-xs text-gris-doux mt-1">{sub}</p>}
    </div>
  );
}
const SERVICE_LABELS: Record<string, string> = {
  menu: 'Menu',
  reservations: 'Réservations',
  shipping: 'Livraison',
  donations: 'Dons',
  volunteers: 'Bénévolat',
  projects: 'Projets',
  rooms: 'Chambres',
  offers: 'Offres promotionnelles',
  tours: 'Tours / Activités',
  products: 'Produits',
};

type TabId = 'info' | 'photos' | 'services' | 'projects' | 'support' | 'history' | 'team' | 'impact' | 'jobs' | 'reviews';

export interface PublicJob {
  id: string;
  title: string;
  contract_type?: string | null;
  location?: string | null;
  salary?: string | null;
  description?: string | null;
}

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
  // Onglet piloté par le parent (optionnel) + callbacks de soutien.
  activeTab?: TabId;
  onTabChange?: (t: TabId) => void;
  onDonate?: () => void;
  onVolunteer?: () => void;
  // Offres d'emploi + candidature (si la formule les autorise).
  jobs?: PublicJob[];
  canReceiveApplications?: boolean;
  onApply?: (job: PublicJob) => void;
}

export default function CommerceTabsPublic({
  commerce,
  isAssociation,
  stats,
  permissions,
  activeTab,
  onTabChange,
  onDonate,
  onVolunteer,
  jobs = [],
  canReceiveApplications = false,
  onApply,
}: Props) {
  const [internalTab, setInternalTab] = useState<TabId>('info');
  // Si le parent pilote l'onglet, on l'utilise ; sinon état interne.
  const tab = activeTab ?? internalTab;
  const setTab = (t: TabId) => {
    setInternalTab(t);
    onTabChange?.(t);
  };
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const perms = permissions || {
    canShowPhotos: true,
    canShowDescription: true,
    canShowStats: true,
    maxPhotos: 999,
  };

  // Un onglet "Emploi" est proposé dès que la formule autorise les
  // candidatures (même sans offre en cours : message d'attente).
  const showJobsTab = canReceiveApplications;

  // Règle d'affichage : un onglet de contenu reste TOUJOURS visible pour la
  // catégorie à laquelle il appartient, même vide (il affiche alors un message
  // d'attente). Il n'est masqué que s'il n'a aucun sens pour la catégorie
  // (ex. "Nous soutenir" / "Nos projets" hors association).
  const tabs: { id: TabId; label: string; icon: any; locked?: boolean; reason?: string }[] = [
    { id: 'info', label: 'À propos', icon: Info },
    {
      id: 'photos',
      label: `Photos${commerce.gallery && commerce.gallery.length > 0 ? ` (${commerce.gallery.length})` : ''}`,
      icon: ImageIcon,
      locked: !perms.canShowPhotos,
      reason: 'Photos non disponibles pour cet établissement',
    },
    // Commerces : onglet "Services".
    ...(!isAssociation
      ? [{ id: 'services' as TabId, label: 'Services', icon: Gift }]
      : []),
    // --- Onglets propres aux associations : toujours présents (même vides) ---
    ...(isAssociation
      ? [
          { id: 'support' as TabId, label: 'Nous soutenir', icon: HandHeart },
          { id: 'projects' as TabId, label: 'Nos projets', icon: Target },
          { id: 'history' as TabId, label: 'Notre histoire', icon: Clock },
          { id: 'team' as TabId, label: 'Notre équipe', icon: Users },
          { id: 'impact' as TabId, label: 'Notre impact', icon: BarChart3 },
        ]
      : []),
    // Emploi : commun, visible si la formule autorise les candidatures.
    ...(showJobsTab
      ? [{ id: 'jobs' as TabId, label: 'Emploi', icon: Briefcase }]
      : []),
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
                {/* "Notre impact" a son propre onglet : plus de doublon ici. */}
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

        {/* Onglet Nos actions / Services */}
        {tab === 'services' && (
          <>
            {commerce.services && Object.keys(commerce.services).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(commerce.services)
                  .filter(([_, active]) => active === true)
                  .map(([key]) => (
                    <div key={key} className="flex items-center gap-2 text-sm text-gris-texte">
                      <div className="w-1.5 h-1.5 rounded-full bg-marine flex-shrink-0" />
                      {SERVICE_LABELS[key] || key}
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<Gift size={34} />}
                title="Aucun service n'est encore renseigné."
                sub="Cette section sera complétée prochainement."
              />
            )}
          </>
        )}

        {/* Onglet Nos projets (associations) */}
        {tab === 'projects' && isAssociation && commerce.id && (
          <ProjectsSection
            businessId={commerce.id}
            associationSlug={commerce.slug}
            associationName={commerce.name}
          />
        )}

        {/* Onglet Nous soutenir */}
        {tab === 'support' && (
          (commerce.support_options || []).some((o: any) => o.enabled) ? (
            <SupportSection
              options={commerce.support_options || []}
              onDonate={onDonate}
              onVolunteer={onVolunteer}
            />
          ) : (
            <EmptyState
              icon={<HandHeart size={34} />}
              title="Aucune façon de soutenir n'est encore proposée."
              sub="Cette section sera complétée prochainement."
            />
          )
        )}

        {/* Onglet Notre histoire */}
        {tab === 'history' && (
          !commerce.history || commerce.history.length === 0 ? (
            <EmptyState
              icon={<Clock size={34} />}
              title="L'association n'a pas encore partagé son histoire."
              sub="Cette section sera complétée prochainement."
            />
          ) : (
          <div className="relative">
            {(commerce.history || []).map((h: any, i: number) => (
              <div key={i} className="flex gap-4 pb-6 relative">
                {i < (commerce.history?.length || 0) - 1 && (
                  <div className="absolute left-[29px] top-7 bottom-0 w-0.5 bg-gris-ligne" />
                )}
                <div className="flex-shrink-0 w-16 text-right">
                  <span className="font-extrabold text-khmer text-sm">{h.year}</span>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-khmer border-2 border-white" />
                  <p className="text-sm text-gris-texte leading-relaxed">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
          )
        )}

        {/* Onglet Notre équipe */}
        {tab === 'team' && (
          !commerce.public_team || commerce.public_team.length === 0 ? (
            <EmptyState
              icon={<Users size={34} />}
              title="L'équipe n'est pas encore présentée."
              sub="Cette section sera complétée prochainement."
            />
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {(commerce.public_team || []).map((m: any, i: number) => (
              <div key={i} className="text-center">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-marine to-khmer text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-2">
                    {(m.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="font-bold text-marine text-sm">{m.name}</div>
                <div className="text-xs text-gris-doux">{m.role}</div>
              </div>
            ))}
          </div>
          )
        )}

        {/* Onglet Notre impact */}
        {tab === 'impact' && (
          <>
            {commerce.impact && commerce.impact.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commerce.impact.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gris-fond rounded-xl p-5 text-center"
                  >
                    <div className="text-2xl md:text-3xl font-extrabold text-marine">
                      {item.value}
                    </div>
                    <div className="text-xs text-gris-texte mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BarChart3 size={34} />}
                title="Aucun chiffre d'impact n'est encore renseigné."
                sub="Cette section sera complétée prochainement."
              />
            )}
          </>
        )}

        {/* Onglet Emploi */}
        {tab === 'jobs' && (
          jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={34} />}
              title="Aucune offre d'emploi pour le moment."
              sub="Revenez bientôt, de nouvelles offres peuvent être publiées."
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="border border-gris-ligne rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-marine">{j.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gris-doux">
                      {j.contract_type && (
                        <span className="bg-gris-fond px-2 py-0.5 rounded">{j.contract_type}</span>
                      )}
                      {j.location && <span>📍 {j.location}</span>}
                      {j.salary && <span>💰 {j.salary}</span>}
                    </div>
                    {j.description && (
                      <p className="text-sm text-gris-texte mt-2">{j.description}</p>
                    )}
                  </div>
                  {onApply && (
                    <button
                      onClick={() => onApply(j)}
                      className="shrink-0 bg-marine text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-marine-dark transition-colors"
                    >
                      Postuler
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
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