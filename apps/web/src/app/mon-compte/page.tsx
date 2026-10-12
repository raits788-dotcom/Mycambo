'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, MessageSquare, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import {
  getUserFavorites,
  getUserReviews,
  getUserRequests,
  timeAgo,
  type CurrentUser,
  type UserFavorite,
  type UserReview,
  type UserRequest,
} from '@/lib/user';

export default function MonComptePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const u = session.user;
      setUser({
        id: u.id,
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Utilisateur',
        email: u.email || '',
        created_at: u.created_at,
      });

      const [f, r, req] = await Promise.all([
        getUserFavorites(u.id),
        getUserReviews(u.id),
        getUserRequests(u.email || ''),
      ]);
      setFavorites(f);
      setReviews(r);
      setRequests(req);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Vous devez être connecté.</p>
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
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
        <Link href="/mon-compte/favoris" className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Heart size={14} className="text-red-500" /> Favoris
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">{favorites.length}</div>
          <div className="text-[10px] text-gris-doux">Adresses sauvegardées</div>
        </Link>

        <Link href="/mon-compte/avis" className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Star size={14} className="text-ic-or" /> Mes avis
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">{reviews.length}</div>
          <div className="text-[10px] text-gris-doux">
            {pendingReviews > 0
              ? <span className="text-ic-or">{pendingReviews} en attente</span>
              : 'Tous publiés'}
          </div>
        </Link>

        <Link href="/mon-compte/demandes" className="bg-white rounded-lg border border-gris-ligne p-4 hover:border-marine transition-colors">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <MessageSquare size={14} className="text-marine" /> Mes demandes
          </div>
          <div className="text-2xl font-extrabold text-marine mb-1">{requests.length}</div>
          <div className="text-[10px] text-gris-doux">
            {pendingRequests > 0
              ? <span className="text-ic-vert">{pendingRequests} en attente</span>
              : 'Toutes traitées'}
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
          <Link href="/mon-compte/favoris" className="text-xs font-bold text-marine hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {favorites.slice(0, 2).map((fav) => (
              <Link
                key={fav.id}
                href={`/commerce/${fav.business_slug}`}
                className="px-5 py-4 flex items-center gap-4 hover:bg-gris-fond transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gris-fond">
                  {fav.business_image ? (
                    <img src={fav.business_image} alt={fav.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gris-doux text-[10px]">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine truncate">{fav.business_name}</div>
                  <div className="text-xs text-gris-texte">{fav.business_city}</div>
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
          <Link href="/mon-compte/avis" className="text-xs font-bold text-marine hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {reviews.slice(0, 2).map((rev) => (
              <div key={rev.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="text-sm font-bold text-marine">{rev.business_name}</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={11} className={n <= rev.rating ? 'fill-ic-or text-ic-or' : 'text-gris-ligne'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gris-texte line-clamp-2">&ldquo;{rev.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rev.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {rev.status === 'published' ? 'Publié' : 'En attente'}
                  </span>
                  <span className="text-[10px] text-gris-doux">{timeAgo(rev.created_at)}</span>
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
          <Link href="/mon-compte/demandes" className="text-xs font-bold text-marine hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {requests.slice(0, 2).map((req) => {
              const labels: Record<string, { label: string; color: string }> = {
                pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
                accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
                declined: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
                completed: { label: 'Terminée', color: 'bg-blue-100 text-blue-700' },
              };
              const st = labels[req.status] || labels.pending;
              return (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                    <div className="text-sm font-bold text-marine">{req.business_name}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-gris-doux mt-1 flex items-center gap-1">
                    <Clock size={10} />{timeAgo(req.created_at)}
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