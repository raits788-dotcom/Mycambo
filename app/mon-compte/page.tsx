'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  MessageSquare,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { getCurrentUserMock, type MockUser } from '@/lib/auth-mock';
import {
  MOCK_USER_FAVORITES,
  MOCK_USER_REVIEWS,
  MOCK_USER_REQUESTS,
  REQUEST_STATUS_LABELS,
  getPendingReviewsCount,
  getNewRequestsCount,
  timeAgo,
} from '@/lib/user-mock';

export default function MonComptePage() {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUserMock());
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'vous';

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-sm text-gris-texte">
          Retrouvez votre activité sur myCAMBO.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        <Link
          href="/mon-compte/favoris"
          className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Heart size={14} className="text-red-500" />
            Favoris
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">
            {MOCK_USER_FAVORITES.length}
          </div>
          <div className="text-[10px] text-gris-doux">
            Adresses sauvegardées
          </div>
        </Link>

        <Link
          href="/mon-compte/avis"
          className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Star size={14} className="text-ic-or" />
            Mes avis
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">
            {MOCK_USER_REVIEWS.length}
          </div>
          <div className="text-[10px] text-gris-doux">
            {getPendingReviewsCount() > 0 ? (
              <span className="text-ic-or">
                {getPendingReviewsCount()} en attente
              </span>
            ) : (
              'Tous publiés'
            )}
          </div>
        </Link>

        <Link
          href="/mon-compte/demandes"
          className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <MessageSquare size={14} className="text-marine" />
            Mes demandes
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">
            {MOCK_USER_REQUESTS.length}
          </div>
          <div className="text-[10px] text-gris-doux">
            {getNewRequestsCount() > 0 ? (
              <span className="text-ic-vert">
                {getNewRequestsCount()} en attente
              </span>
            ) : (
              'Toutes traitées'
            )}
          </div>
        </Link>
      </div>

      {/* Favoris récents */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-500" />
            <h2 className="font-bold text-marine">Favoris récents</h2>
          </div>
          <Link
            href="/mon-compte/favoris"
            className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {MOCK_USER_FAVORITES.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {MOCK_USER_FAVORITES.slice(0, 2).map((fav) => (
              <Link
                key={fav.id}
                href={`/commerce/${fav.slug}`}
                className="px-5 py-4 flex items-center gap-4 hover:bg-gris-fond transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gris-fond">
                  <img
                    src={fav.image}
                    alt={fav.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine truncate">
                    {fav.name}
                  </div>
                  <div className="text-xs text-gris-texte">
                    {fav.typeLabel} · {fav.city}
                  </div>
                </div>
                <div className="text-xs flex items-center gap-1 text-gris-texte">
                  <Star size={12} className="fill-ic-or text-ic-or" />
                  {fav.rating}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucun favori pour le moment.
          </div>
        )}
      </div>

      {/* Derniers avis */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-ic-or" />
            <h2 className="font-bold text-marine">Mes derniers avis</h2>
          </div>
          <Link
            href="/mon-compte/avis"
            className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {MOCK_USER_REVIEWS.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {MOCK_USER_REVIEWS.slice(0, 2).map((rev) => (
              <div key={rev.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="text-sm font-bold text-marine">
                    {rev.associationName}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={11}
                        className={
                          n <= rev.rating
                            ? 'fill-ic-or text-ic-or'
                            : 'text-gris-ligne'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gris-texte line-clamp-2">
                  &ldquo;{rev.content}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rev.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {rev.status === 'published' ? 'Publié' : 'En attente'}
                  </span>
                  <span className="text-[10px] text-gris-doux">
                    {timeAgo(rev.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucun avis pour le moment.
          </div>
        )}
      </div>

      {/* Dernières demandes */}
      <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Mes dernières demandes</h2>
          </div>
          <Link
            href="/mon-compte/demandes"
            className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {MOCK_USER_REQUESTS.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {MOCK_USER_REQUESTS.slice(0, 2).map((req) => {
              const statusConfig = REQUEST_STATUS_LABELS[req.status];
              return (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                    <div className="text-sm font-bold text-marine">
                      {req.typeLabel}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-xs text-gris-texte">
                    {req.associationName} · {req.summary}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(req.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucune demande pour le moment.
          </div>
        )}
      </div>
    </>
  );
}