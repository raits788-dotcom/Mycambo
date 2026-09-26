'use client';

import Link from 'next/link';
import {
  Heart,
  Users,
  Mail,
  Target,
  Clock,
  CheckCircle2,
  Eye,
  XCircle,
  Info,
} from 'lucide-react';
import {
  MOCK_USER_REQUESTS,
  REQUEST_STATUS_LABELS,
  timeAgo,
  type UserRequestType,
  type UserRequestStatus,
} from '@/lib/user-mock';

const TYPE_CONFIG: Record<
  UserRequestType,
  { icon: typeof Heart; color: string; bg: string }
> = {
  donation: { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
  volunteer: { icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
  contact: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' },
  contribution: { icon: Target, color: 'text-orange-600', bg: 'bg-orange-100' },
};

const STATUS_ICONS: Record<UserRequestStatus, typeof Clock> = {
  sent: Clock,
  read: Eye,
  accepted: CheckCircle2,
  refused: XCircle,
};

export default function DemandesPage() {
  const pendingCount = MOCK_USER_REQUESTS.filter(
    (r) => r.status === 'sent'
  ).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mes demandes
        </h1>
        <p className="text-sm text-gris-texte">
          {MOCK_USER_REQUESTS.length} demande
          {MOCK_USER_REQUESTS.length > 1 ? 's' : ''} envoyée
          {MOCK_USER_REQUESTS.length > 1 ? 's' : ''}
          {pendingCount > 0 && (
            <>
              {' · '}
              <span className="text-orange-600 font-bold">
                {pendingCount} en attente de lecture
              </span>
            </>
          )}
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Ces demandes ont été <b>envoyées par vous</b>. L&apos;association
          vous contactera directement pour les finaliser.
        </p>
      </div>

      {MOCK_USER_REQUESTS.length > 0 ? (
        <div className="space-y-3">
          {MOCK_USER_REQUESTS.map((req) => {
            const typeConfig = TYPE_CONFIG[req.type];
            const statusConfig = REQUEST_STATUS_LABELS[req.status];
            const TypeIcon = typeConfig.icon;
            const StatusIcon = STATUS_ICONS[req.status];

            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-gris-ligne p-5"
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}
                  >
                    <TypeIcon size={20} className={typeConfig.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div className="min-w-0">
                        <div className="font-bold text-marine text-sm">
                          {req.typeLabel}
                        </div>
                        <Link
                          href={`/commerce/${req.associationSlug}`}
                          className="text-xs text-gris-texte hover:text-marine transition-colors"
                        >
                          {req.associationName}
                        </Link>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${statusConfig.color} flex-shrink-0`}
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

                {/* Contexte utilisateur */}
                <div className="mt-3 ml-15 pl-1">
                  <p className="text-xs text-gris-doux italic">
                    {req.context}
                  </p>
                </div>

                {/* Statut + date */}
                <div className="pt-3 mt-3 border-t border-gris-ligne flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] text-gris-doux flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(req.createdAt)}
                  </span>
                  <span className="text-[10px] text-gris-doux italic">
                    {statusConfig.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Mail size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucune demande pour le moment
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Vos promesses de don, candidatures bénévole ou messages
            apparaîtront ici.
          </p>
          <Link
            href="/rubrique/association"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Découvrir les associations
          </Link>
        </div>
      )}
    </>
  );
}