'use client';

import { useState } from 'react';
import DonateModal from './DonateModal';
import VolunteerModal from './VolunteerModal';
import ContactModal from './ContactModal';
import type { DonationLink } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type ModalType = 'donate' | 'volunteer' | 'contact' | null;

interface AssociationActionsBarProps {
  associationSlug: string;
  associationName: string;
  donationLink?: DonationLink | null;
  variant?: 'sidebar' | 'inline';
}

export default function AssociationActionsBar({
  associationSlug,
  associationName,
  donationLink,
  variant = 'sidebar',
}: AssociationActionsBarProps) {
  const [modal, setModal] = useState<ModalType>(null);

  // ===== Variante SIDEBAR (3 boutons empilés) =====
  if (variant === 'sidebar') {
    return (
      <>
        <div className="space-y-2">
          <button
            onClick={() => setModal('donate')}
            className="w-full bg-khmer text-white font-bold py-3 rounded-full hover:bg-khmer/90 transition-colors text-sm"
          >
            ❤️ Faire un don
          </button>
          <button
            onClick={() => setModal('volunteer')}
            className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm"
          >
            🙋 Devenir bénévole
          </button>
          <button
            onClick={() => setModal('contact')}
            className="w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm"
          >
            ✉️ Nous contacter
          </button>
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
      <button
        onClick={() => setModal('donate')}
        className={cn(
          'w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm'
        )}
      >
        Contribuer
      </button>

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
}: {
  associationSlug: string;
  associationName: string;
  projectTitle: string;
}) {
  const [open, setOpen] = useState(false);
  // Import dynamique pour éviter les erreurs SSR
  const [ContributeModal, setContributeModal] = useState<any>(null);

  const handleClick = async () => {
    if (!ContributeModal) {
      const mod = await import('./ProjectContributionModal');
      setContributeModal(() => mod.default);
    }
    setOpen(true);
  };

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
