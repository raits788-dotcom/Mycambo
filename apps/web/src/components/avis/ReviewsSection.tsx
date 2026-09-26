'use client';

import { useState } from 'react';
import { Star, Lock } from 'lucide-react';
import RatingStars from './RatingStars';
import ReviewCard from './ReviewCard';
import ReviewRequestModal from './ReviewRequestModal';
import {
  getReviewsForAssociation,
  getRatingStats,
} from '@/lib/mock-data';

interface ReviewsSectionProps {
  associationSlug: string;
  associationName: string;
  isLoggedIn?: boolean;
}

export default function ReviewsSection({
  associationSlug,
  associationName,
  isLoggedIn = false,
}: ReviewsSectionProps) {
  const reviews = getReviewsForAssociation(associationSlug);
  const stats = getRatingStats(associationSlug);
  const [showModal, setShowModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const visible = reviews.slice(0, visibleCount);
  const hasMore = reviews.length > visibleCount;

  return (
    <>
      <div className="space-y-8">
        {/* ===== STATS ===== */}
        <div className="bg-gris-fond rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
            {/* Note globale */}
            <div className="text-center md:text-left md:pr-8 md:border-r border-gris-ligne">
              <div className="text-5xl font-extrabold text-marine leading-none mb-2">
                {stats.average > 0 ? stats.average.toFixed(1) : '—'}
              </div>
              <RatingStars value={stats.average} size="md" />
              <div className="text-xs text-gris-doux mt-2">
                {stats.total} avis publié{stats.total > 1 ? 's' : ''}
              </div>
            </div>

            {/* Distribution */}
            <div className="space-y-1.5">
              {stats.distribution.map((count, i) => {
                const star = 5 - i;
                const percent =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-marine w-6">
                      {star}★
                    </span>
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ic-or rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gris-doux w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 pt-6 border-t border-gris-ligne text-center">
            {isLoggedIn ? (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
              >
                <Star size={16} />
                Laisser un avis
              </button>
            ) : (
              <a
                href="/connexion"
                className="inline-flex items-center gap-2 border-[1.5px] border-gris-ligne text-marine font-bold px-6 py-3 rounded-full hover:border-marine transition-colors text-sm"
              >
                <Lock size={14} />
                Connectez-vous pour laisser un avis
              </a>
            )}
            <p className="text-[11px] text-gris-doux mt-3">
              Votre avis sera examiné par l&apos;association avant publication.
            </p>
          </div>
        </div>

        {/* ===== LISTE DES AVIS ===== */}
        {reviews.length > 0 ? (
          <>
            <div className="space-y-5">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 3)}
                  className="inline-flex items-center gap-2 border-[1.5px] border-gris-ligne text-marine font-bold px-6 py-3 rounded-full hover:border-marine transition-colors text-sm"
                >
                  Voir plus d&apos;avis ({reviews.length - visibleCount})
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white border border-gris-ligne rounded-lg">
            <Star size={32} className="text-gris-ligne mx-auto mb-3" />
            <p className="text-sm text-gris-texte">
              Aucun avis publié pour le moment.
            </p>
            <p className="text-xs text-gris-doux mt-2">
              Soyez le premier à partager votre expérience !
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ReviewRequestModal
          associationName={associationName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}