'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { getReviewsForBusiness } from '@/lib/services';

interface ReviewsTabProps {
  establishment: StoredEstablishment;
}

export default function ReviewsTab({ establishment }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getReviewsForBusiness(establishment.id);
      setReviews(data);
      setLoading(false);
    })();
  }, [establishment.id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gris-fond rounded-lg">
        <Star size={40} className="text-gris-ligne mx-auto mb-3" />
        <p className="text-sm text-gris-texte">
          Aucun avis pour cet établissement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Star size={16} className="text-marine" />
        <h2 className="font-bold text-marine">
          Avis ({reviews.length})
        </h2>
      </div>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg border border-gris-ligne p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="font-bold text-marine">
                {review.author_name || 'Anonyme'}
              </div>
              <div className="text-xs text-gris-doux">
                {new Date(review.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  className={n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gris-ligne'}
                />
              ))}
            </div>
          </div>

          {review.title && (
            <h3 className="font-bold text-marine text-sm mb-1">{review.title}</h3>
          )}
          <p className="text-sm text-gris-texte leading-relaxed">
            {review.content || review.text}
          </p>

          {review.org_response && (
            <div className="mt-3 bg-gris-fond border-l-2 border-marine rounded-r p-3">
              <div className="text-xs font-bold text-marine mb-1">Votre réponse</div>
              <p className="text-sm text-gris-texte">{review.org_response}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}