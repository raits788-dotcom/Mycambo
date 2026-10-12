'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Search } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import EtablissementCard from './EtablissementCard';
import FiltersBar from './FiltersBar';
import { getLabelCatalog } from '@/lib/levels';

interface Props {
  typeSlug?: string;
  initialData?: any[];
}

export default function EtablissementGrid({ typeSlug, initialData }: Props) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [labelCatalog, setLabelCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    city?: string;
    level?: string;
    labels?: string[];
  }>({});

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Charge les établissements approuvés
      let query = supabase
        .from('businesses')
        .select(`
          id, slug, name, description, city, photos, tenant_id,
          categories!inner(name, slug, icon),
          tenants!inner(id, name, verification_level)
        `)
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (typeSlug) {
        query = query.eq('categories.slug', typeSlug);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.error('getBusinesses:', error);
        setLoading(false);
        return;
      }

      // 2. Charge les labels de tous les tenants
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

      // 3. Fusionne
      const enriched = (rows || []).map((b: any) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        city: b.city,
        image: b.photos?.[0],
        typeLabel: b.categories?.name,
        categorySlug: b.categories?.slug,
        level: b.tenants?.verification_level || 'inscrit',
        labels: labelsByTenant[b.tenant_id] || [],
      }));

      setBusinesses(enriched);

      // 4. Charge le catalogue de labels pour les filtres
      const catalog = await getLabelCatalog();
      setLabelCatalog(catalog);

      setLoading(false);
    })();
  }, [typeSlug]);

  // Liste des villes disponibles
  const cities = useMemo(() => {
    return [...new Set(businesses.map((b) => b.city).filter(Boolean))].sort();
  }, [businesses]);

  // Filtrage
  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      // Recherche texte
      if (search) {
        const s = search.toLowerCase();
        const matchSearch =
          b.name.toLowerCase().includes(s) ||
          (b.city || '').toLowerCase().includes(s) ||
          (b.description || '').toLowerCase().includes(s);
        if (!matchSearch) return false;
      }

      // Ville
      if (filters.city && b.city !== filters.city) return false;

      // Niveau
      if (filters.level && b.level !== filters.level) return false;

      // Labels (tous les labels sélectionnés doivent être présents)
      if (filters.labels && filters.labels.length > 0) {
        const businessLabelCodes = b.labels.map((l: any) => l.code);
        const hasAllLabels = filters.labels.every((code) =>
          businessLabelCodes.includes(code)
        );
        if (!hasAllLabels) return false;
      }

      return true;
    });
  }, [businesses, search, filters]);

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
      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
        <input
          type="text"
          placeholder="Rechercher un établissement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-full border border-gris-ligne focus:border-marine focus:outline-none bg-white"
        />
      </div>

      {/* Filtres */}
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        cities={cities}
        labels={labelCatalog}
      />

      {/* Résultats */}
      <div className="mb-4 text-xs text-gris-texte">
        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        {businesses.length !== filtered.length && ` sur ${businesses.length}`}
      </div>

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