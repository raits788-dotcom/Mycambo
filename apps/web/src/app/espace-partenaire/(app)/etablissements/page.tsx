'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Store, Eye, Heart, Star, Loader2, MapPin } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function EstablishmentsPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantLoading || !tenant) return;

    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, icon)')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (!error) setBusinesses(data || []);
      setLoading(false);
    })();
  }, [tenant, tenantLoading]);

  if (tenantLoading || loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-12 text-center text-gris-texte">
        Aucun tenant associé.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Mes établissements
          </h1>
          <p className="text-sm text-gris-texte">
            {businesses.length} établissement{businesses.length > 1 ? 's' : ''} sous votre compte
          </p>
        </div>
        <Link
          href="/espace-partenaire/etablissements/nouveau"
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
        >
          <Plus size={15} />
          Ajouter un établissement
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
          <Store size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte mb-4">Aucun établissement pour l&apos;instant.</p>
          <Link
            href="/espace-partenaire/etablissements/nouveau"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
          >
            <Plus size={15} />
            Créer mon premier établissement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gris-ligne p-5 flex flex-wrap items-center gap-4 shadow-cb-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                <Store size={22} />
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-marine">{b.name}</h3>
                  <span
                    className={
                      'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                      (b.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700')
                    }
                  >
                    {b.status === 'approved'
                      ? 'Publié'
                      : b.status === 'pending'
                      ? 'En attente'
                      : 'Suspendu'}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                  {b.categories?.name && <span>{b.categories.name}</span>}
                  {b.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {b.city}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gris-texte">
                <span className="flex items-center gap-1">
                  <Eye size={12} /> 0
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} /> 0
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} /> —
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/espace-partenaire/etablissements/${b.slug}`}
                  className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark"
                >
                  Gérer
                </Link>
                <a
                  href={`/commerce/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine"
                >
                  Voir public ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}