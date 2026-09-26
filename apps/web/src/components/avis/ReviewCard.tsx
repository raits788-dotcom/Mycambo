import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import RatingStars from './RatingStars';
import type { Review } from '@/lib/mock-data';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <article className="bg-white border border-gris-ligne rounded-lg p-5">
      {/* En-tête */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-full bg-marine text-white flex items-center justify-center font-extrabold text-base flex-shrink-0">
          {review.author_initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-extrabold text-marine text-sm">
                {review.author_name}
              </div>
              <div className="text-xs text-gris-doux">
                {timeAgo} · {review.visit_type}
              </div>
            </div>
            <RatingStars value={review.rating} size="sm" />
          </div>
        </div>
      </div>

      {/* Contenu */}
      {review.title && (
        <h4 className="font-extrabold text-marine text-base mb-2">
          {review.title}
        </h4>
      )}
      <p className="text-sm text-gris-texte leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Réponse de l'organisation */}
      {review.org_response && (
        <div className="bg-gris-fond border-l-3 border-marine rounded-r-md p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-marine uppercase tracking-wider">
              Réponse de l&apos;association
            </span>
          </div>
          <p className="text-sm text-gris-texte leading-relaxed">
            {review.org_response}
          </p>
        </div>
      )}
    </article>
  );
}