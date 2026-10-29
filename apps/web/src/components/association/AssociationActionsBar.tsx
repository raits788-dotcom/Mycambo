'use client';

import { useState } from 'react';
import DonateModal from './DonateModal';
import VolunteerModal from './VolunteerModal';
import ContactModal from './ContactModal';
import type { DonationLink } from '@/lib/associations';
import { cn } from '@/lib/utils';

type ModalType = 'donate' | 'volunteer' | 'contact' | null;

type SupportOption = { type: string; enabled: boolean; description?: string; url?: string };

interface AssociationActionsBarProps {
  associationSlug: string;
  associationName: string;
  donationLink?: DonationLink | null;
  variant?: 'sidebar' | 'inline';
  services?: Record<string, boolean> | null; // ancien système (fallback)
  supportOptions?: SupportOption[] | null; // ← source unique "Nous soutenir"
  // Si fournis, don/bénévolat délèguent au parent (consolidation dans
  // l'onglet "Nous soutenir") au lieu d'ouvrir les modals internes.
  onDonateClick?: () => void;
  onVolunteerClick?: () => void;
}

export default function AssociationActionsBar({
  associationSlug,
  associationName,
  donationLink,
  variant = 'sidebar',
  services,
  supportOptions,
  onDonateClick,
  onVolunteerClick,
}: AssociationActionsBarProps) {
  const [modal, setModal] = useState<ModalType>(null);

  // Source unique : support_options. Fallback sur l'ancien système services
  // pour les fiches pas encore migrées.
  const opts = supportOptions || [];
  const hasSupport = opts.length > 0;
  const optOn = (type: string) => opts.some((o) => o.type === type && o.enabled);

  const canDonate = hasSupport ? optOn('don') : services?.donations === true;
  const canVolunteer = hasSupport ? optOn('benevolat') : services?.volunteers === true;
  const canContact = true; // Le contact est toujours disponible

  // ===== Variante SIDEBAR (boutons empilés) =====
  if (variant === 'sidebar') {
    return (
      <>
        <div className="space-y-2">
          {canDonate && (
            <button
              onClick={() => (onDonateClick ? onDonateClick() : setModal('donate'))}
              className="w-full bg-khmer text-white font-bold py-3 rounded-full hover:bg-khmer/90 transition-colors text-sm"
            >
              ❤️ Faire un don
            </button>
          )}
          {canVolunteer && (
            <button
              onClick={() => (onVolunteerClick ? onVolunteerClick() : setModal('volunteer'))}
              className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm"
            >
              🙋 Devenir bénévole
            </button>
          )}
          {canContact && (
            <button
              onClick={() => setModal('contact')}
              className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm"
            >
              ✉️ Nous contacter
            </button>
          )}
        </div>

        {/* Modales */}
        {modal === 'donate' && (
          <DonateModal
            associationSlug={associationSlug}
            associationName={associationName}
            donationLink={donationLink}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'volunteer' && (
          <VolunteerModal
            associationSlug={associationSlug}
            associationName={associationName}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'contact' && (
          <ContactModal
            associationSlug={associationSlug}
            associationName={associationName}
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  // ===== Variante INLINE (bouton seul, pour "Contribuer") =====
  return (
    <>
      {canDonate && (
        <button
          onClick={() => setModal('donate')}
          className={cn(
            'w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm'
          )}
        >
          Contribuer
        </button>
      )}

      {modal === 'donate' && (
        <DonateModal
          associationSlug={associationSlug}
          associationName={associationName}
          donationLink={donationLink}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ===== Export d'un hook/bouton séparé pour "Contribuer à ce projet" =====
export function ContributeProjectButton({
  associationSlug,
  associationName,
  projectTitle,
  services,
}: {
  associationSlug: string;
  associationName: string;
  projectTitle: string;
  services?: Record<string, boolean> | null;
}) {
  const [open, setOpen] = useState(false);
  const [ContributeModal, setContributeModal] = useState<any>(null);

  const canContribute = services?.projects === true;

  const handleClick = async () => {
    if (!canContribute) return;
    if (!ContributeModal) {
      const mod = await import('./ProjectContributionModal');
      setContributeModal(() => mod.default);
    }
    setOpen(true);
  };

  if (!canContribute) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
      >
        Contribuer à ce projet
      </button>

      {open && ContributeModal && (
        <ContributeModal
          associationSlug={associationSlug}
          associationName={associationName}
          projectTitle={projectTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}