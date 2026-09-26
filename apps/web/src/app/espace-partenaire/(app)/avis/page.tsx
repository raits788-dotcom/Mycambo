'use client';

import { useState, useMemo } from 'react';
import { Star, Inbox, Check, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReviewModerationCard from '@/components/partenaire/ReviewModerationCard';
import ReviewRefuseModal from '@/components/partenaire/ReviewRefuseModal';
import {
  MOCK_PARTNER_REVIEWS_TO_MODERATE,
  type PartnerReviewToModerate,
  type ReviewModerationStatus,
  type RejectionCategory,
} from '@/lib/partner-mock';

type FilterType = 'all' | 'pending' | 'published' | 'rejected' | 'auto_rejected';

export default function PartnerAvisPage() {
  const [reviews, setReviews] = useState(MOCK_PARTNER_REVIEWS_TO_MODERATE);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [refuseModal, setRefuseModal] = useState<PartnerReviewToModerate | null>(
    null
  );

  // Comptages
  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      published: reviews.filter(
        (r) => r.status === 'published' || r.status === 'forced_by_admin'
      ).length,
      rejected: reviews.filter(
        (r) =>
          r.status === 'rejected_pending_admin' ||
          r.status === 'rejected_by_org_final'
      ).length,
      auto_rejected: reviews.filter((r) => r.status === 'auto_rejected').length,
    }),
    [reviews]
  );

  // Filtrage
  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    if (filter === 'published')
      return reviews.filter(
        (r) => r.status === 'published' || r.status === 'forced_by_admin'
      );
    if (filter === 'rejected')
      return reviews.filter(
        (r) =>
          r.status === 'rejected_pending_admin' ||
          r.status === 'rejected_by_org_final'
      );
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  // ===== Actions =====

  const handlePublish = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, status: 'published' as ReviewModerationStatus }
          : r
      )
    );
  };

  const handleRefuse = (reviewId: string, data: {
    category: RejectionCategory;
    reason: string;
  }) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'rejected_pending_admin' as ReviewModerationStatus,
              rejection_category: data.category,
              rejection_reason: data.reason,
              rejection_date: new Date().toISOString(),
            }
          : r
      )
    );
    setRefuseModal(null);
    console.log('📩 Refus envoyé au super-admin :', {
      reviewId,
      ...data,
    });
  };

  const handleReply = (reviewId: string) => {
    const reply = prompt('Votre réponse à cet avis :');
    if (!reply) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, org_response: reply, status: 'published' as ReviewModerationStatus }
          : r
      )
    );
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Avis reçus
        </h1>
        <p className="text-sm text-gris-texte">
          Modérez les avis laissés sur vos établissements.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
          label="À modérer"
          count={counts.pending}
          icon={<Inbox size={12} />}
          color="text-orange-600"
        />
        <FilterButton
          active={filter === 'published'}
          onClick={() => setFilter('published')}
          label="Publiés"
          count={counts.published}
          icon={<Check size={12} />}
          color="text-green-600"
        />
        <FilterButton
          active={filter === 'rejected'}
          onClick={() => setFilter('rejected')}
          label="Refusés"
          count={counts.rejected}
          icon={<XCircle size={12} />}
          color="text-red-600"
        />
        <FilterButton
          active={filter === 'auto_rejected'}
          onClick={() => setFilter('auto_rejected')}
          label="Rejetés auto"
          count={counts.auto_rejected}
          icon={<AlertTriangle size={12} />}
          color="text-red-600"
        />
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Tous"
          count={counts.all}
          color="text-marine"
        />
      </div>

      {/* Avis */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <ReviewModerationCard
              key={rev.id}
              review={rev}
              onPublish={() => handlePublish(rev.id)}
              onRefuse={() => setRefuseModal(rev)}
              onReply={() => handleReply(rev.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Star size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun avis dans cette catégorie
          </h2>
          <p className="text-sm text-gris-texte">
            Les avis correspondants apparaîtront ici.
          </p>
        </div>
      )}

      {/* Modale de refus */}
      {refuseModal && (
        <ReviewRefuseModal
          authorName={refuseModal.author_name}
          reviewTitle={refuseModal.title}
          onClose={() => setRefuseModal(null)}
          onSubmit={(data) => handleRefuse(refuseModal.id, data)}
        />
      )}
    </>
  );
}

// ===== Bouton de filtre =====
function FilterButton({
  active,
  onClick,
  label,
  count,
  icon,
  color = 'text-marine',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
  color?: string;
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