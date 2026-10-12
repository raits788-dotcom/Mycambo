'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Clock, Check, X, MessageSquare, AlertCircle, Info,
  ChevronDown, PenLine, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { getUserReviews, getReviewCounts, timeAgo, type UserReview } from '@/lib/user';
import WriteReviewModal from '@/components/mon-compte/WriteReviewModal';

type ReviewStatus = 'pending' | 'published' | 'rejected';

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; icon: string; description: string }> = {
  pending: {
    label: 'En modération',
    color: 'bg-orange-100 text-orange-700',
    icon: '⏳',
    description: 'Votre avis est en cours de vérification par l\'équipe MyCambo.',
  },
  published: {
    label: 'Publié',
    color: 'bg-green-100 text-green-700',
    icon: '✓',
    description: 'Votre avis est visible publiquement sur la fiche.',
  },
  rejected: {
    label: 'Refusé',
    color: 'bg-red-100 text-red-700',
    icon: '✗',
    description: 'Votre avis n\'a pas respecté les règles de la communauté.',
  },
};

export default function AvisPage() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [writeModal, setWriteModal] = useState<{ businessName: string; businessSlug: string; businessId: string } | null>(null);

  const reload = async (userId: string) => {
    const [r, c] = await Promise.all([
      getUserReviews(userId),
      getReviewCounts(userId),
    ]);
    setReviews(r);
    setCounts(c);
  };

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      await reload(session.user.id);
      setLoading(false);
    })();
  }, []);

  const handleSubmitReview = async (data: { rating: number; title: string; content: string }) => {
    if (!writeModal) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('reviews').insert({
      business_id: writeModal.businessId,
      author_id: session.user.id,
      author_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
      rating: data.rating,
      text: `${data.title}\n\n${data.content}`,
      status: 'pending',
    });

    await reload(session.user.id);
    setWriteModal(null);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mes avis
        </h1>
        <p className="text-sm text-gris-texte">
          {counts.total} avis
          {counts.pending > 0 && (
            <> · <span className="text-orange-600 font-bold">{counts.pending} en attente</span></>
          )}
          {counts.published > 0 && (
            <> · <span className="text-green-600 font-bold">{counts.published} publié{counts.published > 1 ? 's' : ''}</span></>
          )}
        </p>
      </div>

      {/* Légende */}
      <div className="bg-white border border-gris-ligne rounded-lg mb-6 overflow-hidden">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gris-fond transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="text-marine" />
            <span className="font-bold text-marine text-sm">Comprendre les statuts d&apos;avis</span>
          </div>
          <ChevronDown size={16} className={cn('text-gris-doux transition-transform', showLegend && 'rotate-180')} />
        </button>

        {showLegend && (
          <div className="px-5 pb-5 pt-2 border-t border-gris-ligne">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-start gap-3">
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 flex-shrink-0 ${config.color}`}>
                    {config.icon} {config.label}
                  </div>
                  <span className="text-xs text-gris-texte leading-relaxed">{config.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Liste */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const config = STATUS_CONFIG[rev.status] || STATUS_CONFIG.pending;
            return (
              <div key={rev.id} className="bg-white rounded-lg border border-gris-ligne p-5">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="min-w-0">
                    <Link
                      href={`/commerce/${rev.business_slug}`}
                      className="font-extrabold text-marine text-base hover:text-marine-light transition-colors"
                    >
                      {rev.business_name}
                    </Link>
                    <div className="text-xs text-gris-doux mt-0.5">
                      {timeAgo(rev.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= rev.rating ? 'fill-ic-or text-ic-or' : 'text-gris-ligne'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gris-texte leading-relaxed mb-4 whitespace-pre-line">
                  {rev.text}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gris-ligne flex-wrap gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${config.color}`}>
                    {config.icon} {config.label}
                  </span>

                  {rev.status === 'published' && (
                    <Link
                      href={`/commerce/${rev.business_slug}`}
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
          <h2 className="text-lg font-bold text-marine mb-2">Aucun avis pour le moment</h2>
          <p className="text-sm text-gris-texte mb-6">
            Partagez votre expérience sur les établissements que vous avez découverts.
          </p>
          <Link
            href="/annuaire"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Découvrir l&apos;annuaire
          </Link>
        </div>
      )}

      {writeModal && (
        <WriteReviewModal
          associationName={writeModal.businessName}
          associationSlug={writeModal.businessSlug}
          onClose={() => setWriteModal(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </>
  );
}