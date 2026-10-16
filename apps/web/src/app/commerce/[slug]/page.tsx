'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin, Phone, Globe, Clock, Heart, Share2, Star, Lock,
} from 'lucide-react';
import CommerceTabsPublic from '@/components/commerce/CommerceTabsPublic';
import AssociationActionsBar from '@/components/association/AssociationActionsBar';
import { LevelBadge, SubLabels } from '@/components/ui/LevelBadge';
import { createBrowserClient } from '@supabase/ssr';
import { getPlanPermissions } from '@/lib/plan-permissions';

export default function CommercePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [commerce, setCommerce] = useState<any>(null);
  const [tenantLevel, setTenantLevel] = useState<string | null>(null);
  const [tenantLabels, setTenantLabels] = useState<any[]>([]);
  const [planSlug, setPlanSlug] = useState<string>('decouverte');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Charge l'établissement + le plan du tenant
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          categories(name, icon, color),
          tenants(
            id, name, verification_level, city, email, plan_id,
            plans(slug, name)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .maybeSingle();

      if (error || !business) {
        setCommerce(null);
        setMounted(true);
        return;
      }

      // 2. Détermine le plan
      const tenantPlan = (business.tenants as any)?.plans?.slug || 'decouverte';
      setPlanSlug(tenantPlan);

      // 3. Formate l'objet commerce
      setCommerce({
        ...business,
        type: business.categories?.name?.toLowerCase() || 'commerce',
        typeLabel: business.categories?.name || 'Établissement',
        category: business.categories?.name,
        city: business.city || (business.tenants as any)?.city,
        image: business.photos?.[0]
          || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=1600&auto=format&fit=crop',
        gallery: business.photos || [],
        description: business.description,
        longDescription: business.long_description,
        rating: 0,
        reviews: 0,
      });

      // 4. Charge le niveau + labels
      setTenantLevel((business.tenants as any)?.verification_level || 'inscrit');

      const { data: labels } = await supabase
        .from('tenant_labels')
        .select('*, label:label_catalog(*)')
        .eq('tenant_id', business.tenant_id);

      setTenantLabels((labels || []).map((l: any) => l.label).filter(Boolean));

      setMounted(true);
    })();
  }, [slug]);

  if (!mounted) {
    return (
      <div className="p-20 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-marine mb-3">
          Établissement introuvable
        </h1>
        <p className="text-gris-texte mb-6">
          Cette fiche n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/annuaire"
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors"
        >
          Retour à l&apos;annuaire
        </Link>
      </div>
    );
  }

  const isAssociation = commerce.type === 'association';
  const permissions = getPlanPermissions(planSlug);

  const visiblePhotos = permissions.canShowPhotos ? commerce.gallery : [];
  const heroImage = permissions.canShowPhotos && commerce.image
    ? commerce.image
    : 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=85&w=1600&auto=format&fit=crop';

  return (
    <>
      {/* HERO */}
      <section className="relative h-[240px] md:h-[280px] overflow-hidden">
        <Image
          src={heroImage}
          alt={commerce.name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/30" />

        <div className="absolute top-4 right-4 md:right-12 z-20 flex gap-2">
          <button
            aria-label="Enregistrer"
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Heart size={17} />
          </button>
          <button
            aria-label="Partager"
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="absolute inset-0 flex items-end z-10">
          <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 pb-5 w-full">
            <div className="text-white">
              <div className="flex items-center gap-2 text-xs text-white/85 mb-2 flex-wrap">
                <span className="bg-ic-or text-marine-dark font-bold px-2.5 py-1 rounded-full">
                  {commerce.typeLabel}
                </span>
                {commerce.city && <span>{commerce.city}</span>}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-2">
                {commerce.name}
              </h1>

              <div className="flex items-center gap-2 flex-wrap mb-2">
                <LevelBadge level={tenantLevel} size="md" />
                {tenantLabels.length > 0 && (
                  <SubLabels labels={tenantLabels} size="sm" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                {commerce.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {commerce.city}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau informatif si formule Découverte */}
      {!permissions.canShowPhotos && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex items-center gap-2">
            <Lock size={14} className="text-blue-600" />
            <p className="text-xs text-blue-800">
              <b>Cette fiche est en formule Découverte.</b> Les photos, description et
              informations détaillées ne sont pas disponibles.
            </p>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <section className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          <div>
            <CommerceTabsPublic
              commerce={{
                ...commerce,
                gallery: visiblePhotos,
              }}
              isAssociation={isAssociation}
              stats={null}
              permissions={permissions}
            />
          </div>

          <aside className="lg:sticky lg:top-[180px] self-start space-y-4">
            <div className="bg-white border border-gris-ligne rounded-lg p-5 shadow-cb-sm">
              <div className="text-base font-extrabold text-marine mb-4">
                {isAssociation ? '💛 Nous soutenir' : 'Contact'}
              </div>

              {isAssociation ? (
                <div className="mb-5">
                  <AssociationActionsBar
                    associationSlug={slug}
                    associationName={commerce.name}
                    donationLink={undefined}
                    variant="sidebar"
                  />
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  <button className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm">
                    Contacter
                  </button>
                  {commerce.city && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        commerce.address || commerce.city
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm text-center"
                    >
                      Voir sur la carte
                    </a>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gris-ligne space-y-3 text-sm text-gris-texte">
                {commerce.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-gris-doux mt-0.5" />
                    <span>{commerce.address}</span>
                  </div>
                )}
                {commerce.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-gris-doux" />
                    <span>{commerce.phone}</span>
                  </div>
                )}
                {commerce.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} className="text-gris-doux" />
                    <span>{commerce.website}</span>
                  </div>
                )}
                {commerce.hours && (
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-gris-doux" />
                    <span>
                      {typeof commerce.hours === 'string'
                        ? commerce.hours
                        : JSON.stringify(commerce.hours)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-gris-doux text-center">
              Ces informations sont fournies par l&apos;établissement.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}