import Link from 'next/link';
import type { Metadata } from 'next';
import { Eye, Heart, Star, Inbox, Building2, ArrowUp } from 'lucide-react';
import {
  MOCK_PARTNER,
  MOCK_PARTNER_ESTABLISHMENTS,
  getPartnerRequestsByStatus,
  getPartnerReviewsByStatus,
  getTotalViews,
  getTotalSupports,
  getAverageRating,
  getTotalReviews,
  timeAgo,
} from '@/lib/partner-mock';

export const metadata: Metadata = {
  title: "Vue d'ensemble",
};

export default function PartnerDashboardPage() {
  const newRequests = getPartnerRequestsByStatus('new');
  const pendingReviews = getPartnerReviewsByStatus('pending');
  const totalViews = getTotalViews();
  const totalSupports = getTotalSupports();
  const avgRating = getAverageRating();
  const totalReviews = getTotalReviews();

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Bonjour {MOCK_PARTNER.name} 👋
        </h1>
        <p className="text-sm text-gris-texte">
          Voici l&apos;activité de vos établissements.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Eye size={14} className="text-marine" />
            Vues ce mois
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {totalViews.toLocaleString('fr-FR')}
          </div>
          <div className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
            <ArrowUp size={10} />
            +12% vs mois dernier
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Heart size={14} className="text-red-500" />
            Soutiens
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {totalSupports}
          </div>
          <div className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
            <ArrowUp size={10} />
            +5 cette semaine
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Star size={14} className="text-ic-or" />
            Note moyenne
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {avgRating.toFixed(1)}
          </div>
          <div className="text-[10px] text-gris-doux mt-1">
            {totalReviews} avis publiés
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gris-ligne p-4">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Inbox size={14} className="text-orange-500" />
            Demandes
          </div>
          <div className="text-2xl font-extrabold text-marine">
            {newRequests.length}
          </div>
          <div className="text-[10px] text-orange-500 mt-1">
            En attente
          </div>
        </div>
      </div>

      {/* Demandes récentes */}
      <div className="bg-white rounded-lg border border-gris-ligne mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Demandes récentes</h2>
            {newRequests.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {newRequests.length}
              </span>
            )}
          </div>
          <Link
            href="/espace-partenaire/demandes"
            className="text-xs font-bold text-marine hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {newRequests.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {newRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="px-5 py-4 flex items-center gap-4 flex-wrap"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    req.color === 'red'
                      ? 'bg-red-100 text-red-600'
                      : req.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Heart size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine truncate">
                    {req.author_name} — {req.typeLabel}
                  </div>
                  <div className="text-xs text-gris-texte">
                    {req.summary} · {timeAgo(req.created_at)}
                  </div>
                </div>
                <Link
                  href="/espace-partenaire/demandes"
                  className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark transition-colors"
                >
                  Voir
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucune nouvelle demande.
          </div>
        )}
      </div>

      {/* Avis à modérer */}
      <div className="bg-white rounded-lg border border-gris-ligne mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-ic-or" />
            <h2 className="font-bold text-marine">Avis à modérer</h2>
            {pendingReviews.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingReviews.length} en attente
              </span>
            )}
          </div>
          <Link
            href="/espace-partenaire/avis"
            className="text-xs font-bold text-marine hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {pendingReviews.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {pendingReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-marine text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {review.author_initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-sm font-bold text-marine">
                        {review.author_name}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={12}
                            className={
                              n <= review.rating
                                ? 'fill-ic-or text-ic-or'
                                : 'text-gris-ligne'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gris-doux">
                      {timeAgo(review.created_at)} · {review.visit_type}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gris-texte ml-12 line-clamp-2">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucun avis à modérer.
          </div>
        )}
      </div>

      {/* Mes établissements */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Mes établissements</h2>
          </div>
          <Link
            href="/espace-partenaire/etablissements"
            className="text-xs font-bold text-marine hover:underline"
          >
            Gérer →
          </Link>
        </div>

        <div className="divide-y divide-gris-ligne">
          {MOCK_PARTNER_ESTABLISHMENTS.map((e) => (
            <div
              key={e.slug}
              className="px-5 py-4 flex items-center gap-4 flex-wrap"
            >
              <div className="w-10 h-10 rounded-lg bg-gris-fond flex items-center justify-center flex-shrink-0 text-lg">
                🏫
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-marine truncate">
                  {e.name}
                </div>
                <div className="text-xs text-gris-texte">
                  {e.typeLabel} · {e.city}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  e.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {e.status === 'approved' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}