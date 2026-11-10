'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import EtablissementCard from './EtablissementCard';
import CommonFilterBar, { type CommonFilterValue, type FilterOption } from '@/components/shared/CommonFilterBar';
import { getLabelCatalog } from '@/lib/levels';
import { getCities, type City } from '@/lib/cities';
import { getAmenitiesForCategory } from '@/lib/amenities';

const EMPTY_FILTER: CommonFilterValue = {
  q: '', city: '', level: '', labels: [], subcategory: '', amenities: [], priceRange: '',
};
const LEVELS = [
  { id: '', label: 'Tous niveaux' },
  { id: 'verifie', label: '🥉 Bronze' },
  { id: 'premium', label: '🥈 Silver' },
  { id: 'exception', label: '🥇 Gold' },
  { id: 'legende', label: '💎 Platine' },
];

interface Props {
  typeSlug?: string;
  // Si fourni, la rubrique est une catégorie PARENTE : on affiche les
  // établissements de toutes ces sous-catégories (au lieu du seul typeSlug).
  childSlugs?: string[];
  initialData?: any[];
}

export default function EtablissementGrid({ typeSlug, childSlugs, initialData }: Props) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [labelCatalog, setLabelCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommonFilterValue>(EMPTY_FILTER);
  const [cityList, setCityList] = useState<City[]>([]);
  const [amenityOpts, setAmenityOpts] = useState<FilterOption[]>([]);

  // Villes officielles (table cities) au lieu de celles extraites des fiches.
  useEffect(() => { getCities().then(setCityList); }, []);

  // Commodités de la famille (filtres spécifiques repliés).
  useEffect(() => {
    if (!typeSlug) return;
    getAmenitiesForCategory(typeSlug).then((list) =>
      setAmenityOpts(list.map((a) => ({ id: a.key, label: a.label })))
    );
  }, [typeSlug]);

  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  // Un resto/café propose un filtre de prix.
  const showPrice = ['restaurant', 'cafe'].includes(typeSlug || '');

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase
        .from('businesses')
        .select(`
          id, slug, name, description, city, photos, tenant_id, services, price_range,
          categories!inner(name, slug, icon, color),
          tenants!inner(id, name, verification_level)
        `)
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (childSlugs && childSlugs.length > 0) {
        // Rubrique parente : établissements de toutes les sous-catégories.
        query = query.in('categories.slug', childSlugs);
      } else if (typeSlug) {
        query = query.eq('categories.slug', typeSlug);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.error('getBusinesses:', error);
        setLoading(false);
        return;
      }

      const tenantIds = [...new Set((rows || []).map((b: any) => b.tenant_id))];
      const { data: allLabels } = await supabase
        .from('tenant_labels')
        .select('tenant_id, label:label_catalog(*)')
        .in('tenant_id', tenantIds);

      const labelsByTenant: Record<string, any[]> = {};
      (allLabels || []).forEach((l: any) => {
        if (!labelsByTenant[l.tenant_id]) labelsByTenant[l.tenant_id] = [];
        if (l.label) labelsByTenant[l.tenant_id].push(l.label);
      });

      const enriched = (rows || []).map((b: any) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        city: b.city,
        image: b.photos?.[0],
        typeLabel: b.categories?.name,
        categorySlug: b.categories?.slug,
        categoryName: b.categories?.name,
        categoryIcon: b.categories?.icon,
        level: b.tenants?.verification_level || 'inscrit',
        labels: labelsByTenant[b.tenant_id] || [],
        services: b.services || {},        // jsonb { clé: true }
        priceRange: b.price_range || '',
      }));

      setBusinesses(enriched);

      const catalog = await getLabelCatalog();
      setLabelCatalog(catalog);

      setLoading(false);
    })();
  }, [typeSlug, childSlugs?.join(',')]);

  // Villes proposées = table cities (noms officiels).
  const cities = useMemo(() => cityList.map((c) => c.name), [cityList]);

  // Sous-catégories disponibles (avec compteur)
  const subcategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon?: string; count: number }>();
    businesses.forEach((b) => {
      if (!b.categorySlug) return;
      const existing = map.get(b.categorySlug);
      if (existing) existing.count += 1;
      else map.set(b.categorySlug, {
        id: b.categorySlug,
        name: b.categoryName || b.categorySlug,
        icon: b.categoryIcon,
        count: 1,
      });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [businesses]);

  // Filtrage (une seule valeur CommonFilterValue).
  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (filter.q) {
        const s = filter.q.toLowerCase();
        const matchSearch =
          b.name.toLowerCase().includes(s) ||
          (b.city || '').toLowerCase().includes(s) ||
          (b.description || '').toLowerCase().includes(s);
        if (!matchSearch) return false;
      }
      if (filter.city) {
        const bc = norm(b.city || '');
        const fc = norm(filter.city);
        if (!bc.includes(fc) && !fc.includes(bc)) return false;
      }
      if (filter.level && b.level !== filter.level) return false;
      if (filter.subcategory && b.categorySlug !== filter.subcategory) return false;
      if (filter.priceRange && b.priceRange !== filter.priceRange) return false;

      if (filter.labels.length > 0) {
        const codes = b.labels.map((l: any) => l.code);
        if (!filter.labels.every((code) => codes.includes(code))) return false;
      }
      // Commodités : l'établissement doit avoir TOUTES les commodités cochées.
      if (filter.amenities.length > 0) {
        const svc = b.services || {};
        if (!filter.amenities.every((k) => svc[k] === true)) return false;
      }
      return true;
    });
  }, [businesses, filter]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <CommonFilterBar
        value={filter}
        onChange={setFilter}
        resultCount={filtered.length}
        cities={cities}
        levels={LEVELS}
        labels={labelCatalog.map((l: any) => ({ id: l.code, label: l.name, icon: l.icon, color: l.color }))}
        subcategories={subcategories.map((s) => ({ id: s.id, label: s.name, icon: s.icon, count: s.count }))}
        amenities={amenityOpts}
        showPrice={showPrice}
      />

      <div className="mb-4" />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
          <p className="text-sm text-gris-texte">Aucun établissement trouvé.</p>
          <p className="text-xs text-gris-doux mt-1">
            Essayez de modifier vos filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <EtablissementCard key={b.id} etablissement={b} />
          ))}
        </div>
      )}
    </>
  );
}