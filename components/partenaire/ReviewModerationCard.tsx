'use client';

import { Star, Check, MessageSquare, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  REJECTION_CATEGORIES,
  type PartnerReviewToModerate,
} from '@/lib/partner-mock';
import { timeAgo } from '@/lib/user-mock';

interface ReviewModerationCardProps {
  review: PartnerReviewToModerate;
  onPublish: () => void;
  onRefuse: () => void;
  onReply: () => void;
}

export default function ReviewModerationCard({
  review,
  onPublish,
  onRefuse,
  onReply,
}: ReviewModerationCardProps) {
  const isPending = review.status === 'pending';
  const isPublished = review.status === 'published';
  const isRejectedPending = review.status === 'rejected_pending_admin';
  const isRejectedFinal = review.status === 'rejected_by_org_final';
  const isForced = review.status === 'forced_by_admin';
  const isAutoRejected = review.status === 'auto_rejected';

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-5',
        isPending && 'border-gris-ligne',
        isPublished && 'border-green-200',
        isRejectedPending && 'border-yellow-300',
        isRejectedFinal && 'border-red-200',
        isForced && 'border-green-300',
        isAutoRejected && 'border-red-300 bg-red-50/30'
      )}
    >
      {/* En-tête auteur */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-marine text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {review.author_initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-bold text-marine text-sm">
                {review.author_name}
              </div>
              <div className="text-xs text-gris-doux">
                {timeAgo(review.created_at)} · {review.visit_type}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={13}
                  className={
                    n <= review.rating
                      ? 'fill-ic-or text-ic-or'
                      : 'text-gris-ligne'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="ml-13">
        <h3 className="font-bold text-marine text-sm mb-1.5">
          {review.title}
        </h3>
        <p className="text-sm text-gris-texte leading-relaxed">
          {review.content}
        </p>
      </div>

      {/* Bandeau auto_rejected */}
      {isAutoRejected && review.auto_rejection_reason && (
        <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <b>Rejeté automatiquement</b>
            <br />
            {review.auto_rejection_reason}
          </div>
        </div>
      )}

      {/* Bandeau rejected_pending_admin */}
      {isRejectedPending && review.rejection_reason && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-yellow-700" />
            <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">
              En attente de validation admin
            </span>
          </div>
          <div className="text-xs text-yellow-800 leading-relaxed">
            <b>Catégorie :</b>{' '}
            {review.rejection_category
              ? REJECTION_CATEGORIES[review.rejection_category].label
              : ''}
            <br />
            <b>Motif :</b> {review.rejection_reason}
          </div>
        </div>
      )}

      {/* Bandeau rejected final */}
      {isRejectedFinal && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-xs text-red-800">
            <b>Refus confirmé par myCAMBO.</b> L&apos;avis ne sera pas publié.
          </div>
        </div>
      )}

      {/* Bandeau forced_by_admin */}
      {isForced && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-800">
            <b>Publié par l&apos;équipe myCAMBO</b> malgré votre refus.
          </div>
        </div>
      )}

      {/* Réponse de l'association */}
      {review.org_response && (isPublished || isForced) && (
        <div className="mt-4 bg-gris-fond border-l-2 border-marine rounded-r-md p-3">
          <div className="text-[10px] font-bold text-marine uppercase tracking-wider mb-1">
            Votre réponse
          </div>
          <p className="text-xs text-gris-texte leading-relaxed">
            {review.org_response}
          </p>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gris-ligne">
          <button
            onClick={onPublish}
            className="text-xs font-bold bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center gap-1.5"
          >
            <Check size={12} />
            Publier
          </button>
          <button
            onClick={onReply}
            className="text-xs font-bold bg-gris-fond text-gris-texte px-4 py-2 rounded-full hover:bg-gris-ligne transition-colors flex items-center gap-1.5"
          >
            <MessageSquare size={12} />
            Répondre et publier
          </button>
          <button
            onClick={onRefuse}
            className="text-xs font-bold bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5"
          >
            <XCircle size={12} />
            Refuser
          </button>
        </div>
      )}

      {(isPublished || isForced) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gris-ligne">
          <button
            onClick={onReply}
            className="text-xs font-bold bg-gris-fond text-gris-texte px-4 py-2 rounded-full hover:bg-gris-ligne transition-colors flex items-center gap-1.5"
          >
            <MessageSquare size={12} />
            {review.org_response ? 'Modifier ma réponse' : 'Répondre'}
          </button>
        </div>
      )}
    </div>
  );
}