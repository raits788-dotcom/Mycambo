'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { LevelBadge, SubLabels } from '@/components/ui/LevelBadge';

export default function CoupDeCoeurCarousel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Récupère les établissements en coup de cœur
      const { data: rows } = await supabase
        .from('businesses')
        .select(`
          id, slug, name, city, description, photos, tenant_id,
          categories(name, icon),
          tenants!inner(id, name, verification_level)
        `)
        .eq('is_featured', true)
        .eq('status', 'approved')
        .order('featured_position', { ascending: true })
        .limit(6);

      if (!rows) {
        setLoading(false);
        return;
      }

      // 2. Récupère les labels
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

      // 3. Enrichit + trie par niveau (Exception > Gold > Silver > Bronze > Inscrit)
      const priorities: Record<string, number> = {
        legende: 5,
        exception: 4,
        premium: 3,
        verifie: 2,
        inscrit: 1,
      };

      const enriched = rows
        .map((b: any) => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          city: b.city,
          description: b.description,
          image: b.photos?.[0],
          categoryName: b.categories?.name,
          level: b.tenants?.verification_level || 'inscrit',
          labels: labelsByTenant[b.tenant_id] || [],
        }))
        .sort((a, b) => (priorities[b.level] || 0) - (priorities[a.level] || 0));

      setItems(enriched);
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

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-ivory">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-ic-or font-bold mb-1">
              Nos sélections
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-marine">
              Coups de cœur MyCambo
            </h2>
          </div>
          <Link
            href="/annuaire"
            className="text-sm font-bold text-marine hover:underline inline-flex items-center gap-1"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/commerce/${item.slug}`}
              className="group bg-white rounded-xl border border-gris-ligne overflow-hidden hover:border-marine hover:shadow-cb-md transition-all"
            >
              <div className="relative aspect-[4/3] bg-gris-fond overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gris-doux text-xs">
                    Pas de photo
                  </div>
                )}

                <div className="absolute top-3 right-3 z-10">
                  <LevelBadge level={item.level} size="sm" showLabel={false} />
                </div>
              </div>

              <div className="p-4">
                {item.categoryName && (
                  <div className="text-[10px] font-bold text-marine uppercase tracking-wider mb-1">
                    {item.categoryName}
                  </div>
                )}

                <h3 className="font-bold text-marine text-base leading-tight mb-1 line-clamp-1">
                  {item.name}
                </h3>

                {item.city && (
                  <div className="text-xs text-gris-texte mb-2">{item.city}</div>
                )}

                {item.labels && item.labels.length > 0 && (
                  <div className="mb-2">
                    <SubLabels labels={item.labels.slice(0, 2)} size="sm" />
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-gris-texte line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}