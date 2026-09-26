'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  Clock,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Info,
  ChevronDown,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_USER_REVIEWS,
  REVIEW_STATUS_CONFIG,
  getReviewCounts,
  timeAgo,
  type UserReviewStatus,
} from '@/lib/user-mock';
import WriteReviewModal from '@/components/mon-compte/WriteReviewModal';

export default function AvisPage() {
  const counts = getReviewCounts();
  const [showLegend, setShowLegend] = useState(false);
  const [writeModal, setWriteModal] = useState<{
    associationName: string;
    associationSlug: string;
  } | null>(null);

  const [reviews, setReviews] = useState(MOCK_USER_REVIEWS);

  const handleSubmitReview = (data: {
    rating: number;
    title: string;
    content: string;
  }) => {
    if (!writeModal) return;

    // Met à jour l'avis "accepted" en "pending"
    setReviews((prev) =>
      prev.map((r) =>
        r.associationSlug === writeModal.associationSlug &&
        r.status === 'accepted'
          ? {
              ...r,
              rating: data.rating,
              title: data.title,
              content: data.content,
              status: 'pending' as UserReviewStatus,
              createdAt: new Date().toISOString(),
            }
          : r
      )
    );
    setWriteModal(null);
  };

  // Légende
  const legendItems: { status: UserReviewStatus; show: boolean }[] = [
    { status: 'pending', show: true },
    { status: 'accepted', show: true },
    { status: 'published', show: true },
    { status: 'auto_rejected', show: true },
    { status: 'rejected_pending_admin', show: true },
    { status: 'forced_by_admin', show: true },
  ];

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mes avis
        </h1>
        <p className="text-sm text-gris-texte">
          {counts.total} avis
          {counts.pending > 0 && (
            <>
              {' · '}
              <span className="text-orange-600 font-bold">
                {counts.pending} en attente
              </span>
            </>
          )}
          {counts.accepted > 0 && (
            <>
              {' · '}
              <span className="text-purple-600 font-bold">
                {counts.accepted} à écrire
              </span>
            </>
          )}
          {counts.rejected > 0 && (
            <>
              {' · '}
              <span className="text-red-600 font-bold">
                {counts.rejected} refusé{counts.rejected > 1 ? 's' : ''}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Bandeau légende */}
      <div className="bg-white border border-gris-ligne rounded-lg mb-6 overflow-hidden">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gris-fond transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="text-marine" />
            <span className="font-bold text-marine text-sm">
              Comprendre les statuts d&apos;avis
            </span>
          </div>
          <ChevronDown
            size={16}
            className={cn(
              'text-gris-doux transition-transform',
              showLegend && 'rotate-180'
            )}
          />
        </button>

        {showLegend && (
          <div className="px-5 pb-5 pt-2 border-t border-gris-ligne">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {legendItems
                .filter((i) => i.show)
                .map((item) => {
                  const config = REVIEW_STATUS_CONFIG[item.status];
                  return (
                    <div key={item.status} className="flex items-start gap-3">
                      <div
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 flex-shrink-0 ${config.color}`}
                      >
                        {config.icon} {config.label}
                      </div>
                      <span className="text-xs text-gris-texte leading-relaxed">
                        {config.description}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Liste des avis */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const config = REVIEW_STATUS_CONFIG[rev.status];
            const isAccepted = rev.status === 'accepted';
            const isPublished =
              rev.status === 'published' || rev.status === 'forced_by_admin';

            return (
              <div
                key={rev.id}
                className={cn(
                  'bg-white rounded-lg border p-5',
                  isAccepted
                    ? 'border-purple-300 shadow-sm'
                    : 'border-gris-ligne'
                )}
              >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="min-w-0">
                    <Link
                      href={`/commerce/${rev.associationSlug}`}
                      className="font-extrabold text-marine text-base hover:text-marine-light transition-colors"
                    >
                      {rev.associationName}
                    </Link>
                    <div className="text-xs text-gris-doux mt-0.5">
                      {rev.visitType} · {timeAgo(rev.createdAt)}
                    </div>
                  </div>

                  {!isAccepted && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={
                            n <= rev.rating
                              ? 'fill-ic-or text-ic-or'
                              : 'text-gris-ligne'
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {isAccepted ? (
                  /* ===== Avis à écrire ===== */
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <PenLine
                        size={18}
                        className="text-purple-600 flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-purple-800 text-sm mb-1">
                          Vous pouvez écrire votre avis !
                        </div>
                        <p className="text-xs text-purple-700 leading-relaxed mb-3">
                          L&apos;association a accepté votre demande. Partagez
                          votre expérience avec la communauté myCAMBO.
                        </p>
                        <button
                          onClick={() =>
                            setWriteModal({
                              associationName: rev.associationName,
                              associationSlug: rev.associationSlug,
                            })
                          }
                          className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                        >
                          <PenLine size={12} />
                          Écrire mon avis
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===== Avis normal ===== */
                  <>
                    <h3 className="font-bold text-marine text-sm mb-2">
                      {rev.title}
                    </h3>
                    <p className="text-sm text-gris-texte leading-relaxed mb-4">
                      {rev.content}
                    </p>

                    {/* Motif de refus */}
                    {rev.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="text-xs text-red-800 leading-relaxed">
                          <b>Motif :</b> {rev.rejectionReason}
                        </div>
                      </div>
                    )}

                    {/* Réponse association */}
                    {rev.orgResponse && isPublished && (
                      <div className="bg-gris-fond border-l-2 border-marine rounded-r-md p-3 mb-4">
                        <div className="text-[10px] font-bold text-marine uppercase tracking-wider mb-1">
                          Réponse de l&apos;association
                        </div>
                        <p className="text-xs text-gris-texte leading-relaxed">
                          {rev.orgResponse}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Statut + actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gris-ligne flex-wrap gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${config.color}`}
                  >
                    {config.icon} {config.label}
                  </span>

                  {isPublished && (
                    <Link
                      href={`/commerce/${rev.associationSlug}`}
                      className="text-xs font-bold text-marine hover:underline"
                    >
                      Voir sur la fiche →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Star size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun avis pour le moment
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Partagez votre expérience sur les associations que vous avez
            découvertes.
          </p>
          <Link
            href="/rubrique/association"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Découvrir les associations
          </Link>
        </div>
      )}

      {/* Modale d'écriture */}
      {writeModal && (
        <WriteReviewModal
          associationName={writeModal.associationName}
          associationSlug={writeModal.associationSlug}
          onClose={() => setWriteModal(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </>
  );
}