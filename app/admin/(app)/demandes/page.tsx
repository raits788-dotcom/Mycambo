'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/user-mock';

type RequestStatus = 'pending' | 'accepted' | 'rejected';

type PartnerRequest = {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  business_name: string;
  sector_id: string;
  city: string;
  province?: string;
  description?: string;
  status: RequestStatus;
  createdAt: string;
  rejection_reason?: string;
};

const MOCK_REQUESTS: PartnerRequest[] = [
  {
    id: 'r1',
    contact_name: 'Sokha Chen',
    contact_email: 'sokha@email.com',
    contact_phone: '+855 12 345 678',
    business_name: 'Angkor Boutique Hotel',
    sector_id: 'hotel',
    city: 'Siem Reap',
    description:
      'Hôtel boutique 20 chambres au centre de Siem Reap. Souhaite rejoindre myCAMBO.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2',
    contact_name: 'Marie Dupont',
    contact_email: 'marie@email.com',
    contact_phone: '+855 92 987 654',
    business_name: 'Khmer Kitchen',
    sector_id: 'restaurant',
    city: 'Phnom Penh',
    description: 'Restaurant khmer authentique ouvert depuis 2018.',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r3',
    contact_name: 'Paul Martin',
    contact_email: 'paul@email.com',
    business_name: 'Tuk-Tuk Express',
    sector_id: 'transport',
    city: 'Siem Reap',
    description: 'Service de tuk-tuk pour touristes.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r4',
    contact_name: 'Jean Moreau',
    contact_email: 'jean@email.com',
    business_name: 'Fake Hotel',
    sector_id: 'hotel',
    city: 'Sihanoukville',
    description: 'Aucune information fournie.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: 'Informations incomplètes, pas de site web ni d\'adresse vérifiable.',
  },
];

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected';

export default function AdminDemandesPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [mounted, setMounted] = useState(false);
  const [examineId, setExamineId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const handleAccept = (id: string) => {
    if (!confirm('Accepter cette demande ? Un email sera envoyé au partenaire.'))
      return;
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
    );
  };

  const handleReject = (id: string) => {
    const reason = prompt('Motif du refus :');
    if (!reason) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected', rejection_reason: reason }
          : r
      )
    );
  };

  const current = examineId
    ? requests.find((r) => r.id === examineId)
    : null;

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  const sectorLabels: Record<string, string> = {
    hotel: 'Hôtel',
    restaurant: 'Restaurant',
    association: 'Association',
    activite: 'Activité',
    shopping: 'Shopping',
    transport: 'Transport',
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Demandes de partenariat
        </h1>
        <p className="text-sm text-gris-texte">
          Examinez les demandes d&apos;inscription des nouveaux partenaires.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterBtn
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
          label="À examiner"
          count={counts.pending}
          color="text-orange-600"
          icon={<Clock size={12} />}
        />
        <FilterBtn
          active={filter === 'accepted'}
          onClick={() => setFilter('accepted')}
          label="Acceptées"
          count={counts.accepted}
          color="text-green-600"
          icon={<Check size={12} />}
        />
        <FilterBtn
          active={filter === 'rejected'}
          onClick={() => setFilter('rejected')}
          label="Refusées"
          count={counts.rejected}
          color="text-red-600"
          icon={<X size={12} />}
        />
        <FilterBtn
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Toutes"
          count={counts.all}
        />
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={cn(
                'bg-white rounded-lg border p-5 transition-shadow hover:shadow-cb-md',
                r.status === 'pending'
                  ? 'border-2 border-orange-200'
                  : r.status === 'rejected'
                  ? 'border-gris-ligne opacity-75'
                  : 'border-gris-ligne'
              )}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-lg bg-gris-fond flex items-center justify-center text-2xl flex-shrink-0">
                  {r.sector_id === 'hotel' && '🏨'}
                  {r.sector_id === 'restaurant' && '🍜'}
                  {r.sector_id === 'association' && '❤️'}
                  {r.sector_id === 'activite' && '🛶'}
                  {r.sector_id === 'shopping' && '🧵'}
                  {r.sector_id === 'transport' && '🛺'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-marine text-base">
                      {r.business_name}
                    </h3>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5',
                        r.status === 'pending'
                          ? 'bg-orange-100 text-orange-700'
                          : r.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {r.status === 'pending' && (
                        <>
                          <Clock size={10} /> À examiner
                        </>
                      )}
                      {r.status === 'accepted' && (
                        <>
                          <Check size={10} /> Acceptée
                        </>
                      )}
                      {r.status === 'rejected' && (
                        <>
                          <X size={10} /> Refusée
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gris-texte mb-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />
                      {sectorLabels[r.sector_id] || r.sector_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {r.city}
                    </span>
                    <span className="text-gris-doux">
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-gris-texte space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={11} className="text-gris-doux" />
                      {r.contact_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="text-gris-doux" />
                      {r.contact_email}
                    </div>
                    {r.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={11} className="text-gris-doux" />
                        {r.contact_phone}
                      </div>
                    )}
                  </div>

                  {r.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2 text-[11px] text-red-800">
                      <b>Motif du refus :</b> {r.rejection_reason}
                    </div>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReject(r.id)}
                      className="text-xs font-bold border border-red-200 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <X size={12} />
                      Refuser
                    </button>
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="text-xs font-bold bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Check size={12} />
                      Accepter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Inbox size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucune demande
          </h2>
          <p className="text-sm text-gris-texte">
            Aucune demande dans cette catégorie.
          </p>
        </div>
      )}
    </>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
  count,
  icon,
  color,
}: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-bold rounded-full px-4 py-2 transition-colors flex items-center gap-2 border',
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-white border-gris-ligne text-gris-texte hover:border-marine'
      )}
    >
      {icon && <span className={active ? 'text-white' : color}>{icon}</span>}
      {label}
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
          active ? 'bg-white/20' : 'bg-gris-fond'
        )}
      >
        {count}
      </span>
    </button>
  );
}