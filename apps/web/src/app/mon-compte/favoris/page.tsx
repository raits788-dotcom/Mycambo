'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Heart, Star, MapPin, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { getUserFavorites, removeFavorite, timeAgo, type UserFavorite } from '@/lib/user';

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);
      const favs = await getUserFavorites(session.user.id);
      setFavorites(favs);
      setLoading(false);
    })();
  }, []);

  const handleRemove = async (businessId: string) => {
    if (!userId) return;
    if (!confirm('Retirer cette adresse de vos favoris ?')) return;
    await removeFavorite(userId, businessId);
    setFavorites((prev) => prev.filter((f) => f.business_id !== businessId));
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
          Mes favoris
        </h1>
        <p className="text-sm text-gris-texte">
          {favorites.length} adresse{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-lg border border-gris-ligne overflow-hidden hover:shadow-cb-md transition-shadow"
            >
              <Link href={`/commerce/${fav.business_slug}`} className="block">
                <div className="relative aspect-[16/9] overflow-hidden bg-gris-fond">
                  {fav.business_image ? (
                    <Image
                      src={fav.business_image}
                      alt={fav.business_name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gris-doux text-xs">
                      Pas de photo
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/commerce/${fav.business_slug}`}>
                  <h3 className="font-extrabold text-marine text-base mb-1 hover:text-marine-light transition-colors line-clamp-1">
                    {fav.business_name}
                  </h3>
                </Link>

                <div className="flex items-center gap-3 text-xs text-gris-texte mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {fav.business_city}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gris-ligne">
                  <span className="text-[10px] text-gris-doux">
                    Ajouté {timeAgo(fav.created_at)}
                  </span>
                  <button
                    onClick={() => handleRemove(fav.business_id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Heart size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun favori pour le moment
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Ajoutez des adresses à vos favoris pour les retrouver facilement.
          </p>
          <Link
            href="/annuaire"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Explorer l&apos;annuaire
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}