'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { LevelBadge, SubLabels } from '@/components/ui/LevelBadge';
import { cn } from '@/lib/utils';

interface FeaturedCarouselProps {
  type: string;
}

const ROTATION_MS = 5000;

export default function FeaturedCarousel({ type }: FeaturedCarouselProps) {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: rows } = await supabase
        .from('businesses')
        .select(`
          id, slug, name, city, photos, tenant_id,
          categories!inner(name, slug),
          tenants!inner(id, verification_level)
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .eq('categories.slug', type)
        .order('featured_position', { ascending: true })
        .limit(6);

      if (!rows) { setLoading(false); return; }

      const tenantIds = [...new Set(rows.map((b: any) => b.tenant_id))];
      const { data: allLabels } = await supabase
        .from('tenant_labels')
        .select('tenant_id, label:label_catalog(*)')
        .in('tenant_id', tenantIds);

      const labelsByTenant: Record<string, any[]> = {};
      (allLabels || []).forEach((l: any) => {
        if (!labelsByTenant[l.tenant_id]) labelsByTenant[l.tenant_id] = [];
        if (l.label) labelsByTenant[l.tenant_id].push(l.label);
      });

      const enriched = rows.map((b: any) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        city: b.city,
        image: b.photos?.[0],
        categoryName: b.categories?.name,
        level: b.tenants?.verification_level || 'inscrit',
        labels: labelsByTenant[b.tenant_id] || [],
      }));

      setItems(enriched);
      setLoading(false);
    })();
  }, [type]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  if (loading || items.length === 0) return null;

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);

  const visible = [0, 1, 2].map((i) => items[(currentIndex + i) % items.length]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Heart size={18} className="fill-khmer text-khmer" />
          <span className="text-[13px] uppercase tracking-[0.3em] text-white/90 font-bold">
            Coups de cœur
          </span>
        </div>

        {items.length > 1 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goPrev}
              aria-label="Précédent"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              aria-label="Suivant"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {visible.map((e, i) => (
          <Link
            key={`${e.slug}-${currentIndex}-${i}`}
            href={`/commerce/${e.slug}`}
            className={cn(
              'group bg-white/95 backdrop-blur-md rounded-xl overflow-hidden border border-white/40',
              'hover:-translate-y-1 hover:shadow-2xl transition-all duration-500',
              'flex flex-col h-[400px]',
              i > 0 && 'hidden md:block'
            )}
          >
            <div className="relative aspect-[3/2] overflow-hidden flex-shrink-0">
              {e.image ? (
                <Image
                  src={e.image}
                  alt={e.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gris-fond flex items-center justify-center text-gris-doux text-xs">
                  Pas de photo
                </div>
              )}

              <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-khmer flex items-center justify-center shadow-lg">
                <Heart size={16} className="fill-white text-white" />
              </div>

              {e.categoryName && (
                <span className="absolute top-3 right-3 bg-white/95 text-marine text-[9px] font-extrabold uppercase tracking-normal px-2.5 py-1.5 rounded-full shadow-md whitespace-nowrap">
                  {e.categoryName}
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-marine text-sm mb-2 group-hover:text-marine-light transition-colors line-clamp-1 min-h-[20px]">
                {e.name}
              </h3>

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <LevelBadge level={e.level} size="sm" />
              </div>

              {e.labels && e.labels.length > 0 && (
                <div className="mb-2">
                  <SubLabels labels={e.labels.slice(0, 2)} size="sm" />
                </div>
              )}

              {e.city && (
                <div className="flex items-center gap-1 text-[10px] text-gris-texte mt-auto pt-2.5 border-t border-gris-ligne">
                  <MapPin size={11} />
                  {e.city}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Aller au coup de cœur ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}