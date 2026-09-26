'use client';

import { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  Mail,
  Target,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  X,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_PARTNER_REQUESTS_DETAILED,
  type PartnerRequestDetail,
} from '@/lib/partner-mock';
import { timeAgo } from '@/lib/user-mock';

type FilterStatus = 'all' | 'new' | 'read' | 'treated' | 'refused';
type FilterType = 'all' | 'donation' | 'volunteer' | 'contact' | 'contribution';

const TYPE_ICONS = {
  donation: Heart,
  volunteer: Users,
  contact: Mail,
  contribution: Target,
};

const TYPE_COLORS = {
  donation: { color: 'text-red-500', bg: 'bg-red-100' },
  volunteer: { color: 'text-green-600', bg: 'bg-green-100' },
  contact: { color: 'text-blue-600', bg: 'bg-blue-100' },
  contribution: { color: 'text-orange-600', bg: 'bg-orange-100' },
};

const STATUS_CONFIG = {
  new: {
    label: 'Nouveau',
    color: 'bg-orange-100 text-orange-700',
    icon: Clock,
  },
  read: { label: 'Vue', color: 'bg-blue-100 text-blue-700', icon: Eye },
  treated: {
    label: 'Traitée',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  refused: {
    label: 'Refusée',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

export default function DemandesPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedRequest, setSelectedRequest] =
    useState<PartnerRequestDetail | null>(null);

  const counts = useMemo(
    () => ({
      all: MOCK_PARTNER_REQUESTS_DETAILED.length,
      new: MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === 'new').length,
      read: MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === 'read').length,
      treated: MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === 'treated').length,
      refused: MOCK_PARTNER_REQUESTS_DETAILED.filter((r) => r.status === 'refused').length,
    }),
    []
  );

  const typeCounts = useMemo(
    () => ({
      all: MOCK_PARTNER_REQUESTS_DETAILED.length,
      donation: MOCK_PARTNER_REQUESTS_DETAILED.filter(
        (r) => r.type === 'donation'
      ).length,
      volunteer: MOCK_PARTNER_REQUESTS_DETAILED.filter(
        (r) => r.type === 'volunteer'
      ).length,
      contact: MOCK_PARTNER_REQUESTS_DETAILED.filter(
        (r) => r.type === 'contact'
      ).length,
      contribution: MOCK_PARTNER_REQUESTS_DETAILED.filter(
        (r) => r.type === 'contribution'
      ).length,
    }),
    []
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_PARTNER_REQUESTS_DETAILED];
    if (filterStatus !== 'all') list = list.filter((r) => r.status === filterStatus);
    if (filterType !== 'all') list = list.filter((r) => r.type === filterType);
    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filterStatus, filterType]);

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Demandes reçues
        </h1>
        <p className="text-sm text-gris-texte">
          {counts.all} demande{counts.all > 1 ? 's' : ''} au total
          {counts.new > 0 && (
            <>
              {' · '}
              <span className="text-orange-600 font-bold">
                {counts.new} nouvelle{counts.new > 1 ? 's' : ''}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 mb-3">
        <FilterPill
          active={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
          label="Toutes"
          count={counts.all}
        />
        <FilterPill
          active={filterStatus === 'new'}
          onClick={() => setFilterStatus('new')}
          label="Nouvelles"
          count={counts.new}
          icon={<Clock size={12} />}
        />
        <FilterPill
          active={filterStatus === 'treated'}
          onClick={() => setFilterStatus('treated')}
          label="Traitées"
          count={counts.treated}
        />
        <FilterPill
          active={filterStatus === 'refused'}
          onClick={() => setFilterStatus('refused')}
          label="Refusées"
          count={counts.refused}
        />
      </div>

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill
          active={filterType === 'all'}
          onClick={() => setFilterType('all')}
          label="Tous types"
          count={typeCounts.all}
        />
        <FilterPill
          active={filterType === 'donation'}
          onClick={() => setFilterType('donation')}
          label="Promesses de don"
          count={typeCounts.donation}
          icon={<Heart size={12} className="text-red-500" />}
        />
        <FilterPill
          active={filterType === 'volunteer'}
          onClick={() => setFilterType('volunteer')}
          label="Bénévolat"
          count={typeCounts.volunteer}
          icon={<Users size={12} className="text-green-600" />}
        />
        <FilterPill
          active={filterType === 'contact'}
          onClick={() => setFilterType('contact')}
          label="Messages"
          count={typeCounts.contact}
          icon={<Mail size={12} className="text-blue-600" />}
        />
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((req) => {
            const Icon = TYPE_ICONS[req.type];
            const typeConfig = TYPE_COLORS[req.type];
            const statusConfig = STATUS_CONFIG[req.status];
            const StatusIcon = statusConfig.icon;

            return (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={cn(
                  'w-full text-left bg-white rounded-lg border p-5 transition-all hover:shadow-cb-md',
                  req.status === 'new'
                    ? 'border-orange-200'
                    : 'border-gris-ligne'
                )}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
                      typeConfig.bg
                    )}
                  >
                    <Icon size={20} className={typeConfig.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-bold text-marine text-sm">
                          {req.typeLabel}
                        </div>
                        <div className="text-xs text-gris-texte">
                          {req.author_name} · {req.associationName}
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 flex-shrink-0',
                          statusConfig.color
                        )}
                      >
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="text-xs text-gris-texte mt-2 font-medium">
                      {req.summary}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gris-ligne flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] text-gris-doux flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(req.created_at)}
                  </span>
                  <span className="text-[10px] font-bold text-marine flex items-center gap-1">
                    Voir le détail
                    <ExternalLink size={10} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Inbox size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucune demande
          </h2>
          <p className="text-sm text-gris-texte">
            Les demandes correspondant à vos filtres apparaîtront ici.
          </p>
        </div>
      )}

      {/* Modale détail */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}

// ===== Pill de filtre =====
function FilterPill({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-bold rounded-full px-4 py-2 transition-colors flex items-center gap-2 border',
        active
          ? 'bg-marine text-white border-marine'
          : 'bg-white border-gris-ligne text-gris-texte hover:border-marine'
      )}
    >
      {icon}
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

// ===== Modale détail =====
function RequestDetailModal({
  request,
  onClose,
}: {
  request: PartnerRequestDetail;
  onClose: () => void;
}) {
  const Icon = TYPE_ICONS[request.type];
  const typeConfig = TYPE_COLORS[request.type];

  const handleAction = (action: 'treated' | 'refused' | 'contact') => {
    if (action === 'contact') {
      window.location.href = `mailto:${request.author_email}?subject=Réponse à votre ${request.typeLabel.toLowerCase()}`;
      return;
    }
    console.log(`Marquer comme ${action} :`, request.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        <div className="p-8">
          {/* En-tête */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gris-ligne">
            <div
              className={cn(
                'w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0',
                typeConfig.bg
              )}
            >
              <Icon size={26} className={typeConfig.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gris-doux mb-1">
                {timeAgo(request.created_at)}
              </div>
              <h3 className="text-2xl font-extrabold text-marine mb-1">
                {request.typeLabel}
              </h3>
              <div className="text-sm text-gris-texte">
                {request.associationName}
              </div>
            </div>
          </div>

          {/* Auteur */}
          <div className="mb-6">
            <div className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Auteur de la demande
            </div>
            <div className="bg-gris-fond rounded-lg p-4">
              <div className="font-bold text-marine text-sm mb-2">
                {request.author_name}
              </div>
              <div className="space-y-1.5 text-xs text-gris-texte">
                <div className="flex items-center gap-2">
                  <Mail size={12} />
                  <a
                    href={`mailto:${request.author_email}`}
                    className="hover:text-marine"
                  >
                    {request.author_email}
                  </a>
                </div>
                {request.author_phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} />
                    <a
                      href={`tel:${request.author_phone}`}
                      className="hover:text-marine"
                    >
                      {request.author_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="mb-6">
            <div className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Détails
            </div>

            {request.amount && (
              <div className="mb-3">
                <span className="text-xs text-gris-doux">Montant :</span>{' '}
                <span className="font-bold text-marine">
                  {request.amount}{' '}
                  {request.frequency && (
                    <span className="text-xs font-normal text-gris-texte">
                      ({request.frequency})
                    </span>
                  )}
                </span>
              </div>
            )}

            {request.dates && (
              <div className="mb-3">
                <span className="text-xs text-gris-doux">Dates :</span>{' '}
                <span className="font-bold text-marine">
                  Du {new Date(request.dates.start).toLocaleDateString('fr-FR')}{' '}
                  au {new Date(request.dates.end).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {request.subject && (
              <div className="mb-3">
                <span className="text-xs text-gris-doux">Sujet :</span>{' '}
                <span className="font-bold text-marine">{request.subject}</span>
              </div>
            )}

            {request.details && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-800 leading-relaxed">
                  {request.details}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gris-ligne">
            <div className="text-xs font-bold text-ink mb-3 uppercase tracking-wider">
              Actions
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAction('treated')}
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2.5 rounded-full hover:bg-green-600 transition-colors text-sm"
              >
                <CheckCircle2 size={14} />
                Marquer comme traitée
              </button>
              <button
                onClick={() => handleAction('contact')}
                className="inline-flex items-center gap-2 bg-marine text-white font-bold px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-sm"
              >
                <Mail size={14} />
                Répondre par email
              </button>
              <button
                onClick={() => handleAction('refused')}
                className="inline-flex items-center gap-2 border border-gris-ligne text-gris-texte font-bold px-4 py-2.5 rounded-full hover:border-red-300 hover:text-red-600 transition-colors text-sm"
              >
                <XCircle size={14} />
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}