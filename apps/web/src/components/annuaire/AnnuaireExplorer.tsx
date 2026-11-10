'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Search } from 'lucide-react';
import { getCities, type City } from '@/lib/cities';

// Niveaux de vérification (filtre générique).
const LEVELS = [
  { slug: 'all', label: 'Tous niveaux' },
  { slug: 'inscrit', label: 'Inscrit' },
  { slug: 'verifie', label: 'Vérifié' },
  { slug: 'premium', label: 'Premium' },
];

type Estab = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string | null;
  photo: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryIcon: string | null;
  familySlug: string;   // slug de la catégorie racine
  familyName: string;
  familyIcon: string;
  level: string;
};

const FAMILIES = [
  { slug: 'hotel', label: 'Hôtels', icon: '🏨' },
  { slug: 'restaurant', label: 'Restaurants', icon: '🍜' },
  { slug: 'association', label: 'Associations', icon: '🤝' },
  { slug: 'autres-commerces', label: 'Autres commerces', icon: '🏬' },
];

export default function AnnuaireExplorer() {
  const [items, setItems] = useState<Estab[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [family, setFamily] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  const [cityList, setCityList] = useState<City[]>([]);

  // Villes officielles (table cities, comme le wizard) — fini les villes
  // incohérentes extraites des fiches ("Pnhom penh kampot").
  useEffect(() => { getCities().then(setCityList); }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );

      // 1) catégories : pour mapper chaque établissement à sa famille racine
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, icon, parent_id');
      const byId = new Map<string, any>((cats || []).map((c: any) => [c.id, c]));
      const rootOf = (cat: any): any => {
        let cur = cat;
        while (cur?.parent_id && byId.has(cur.parent_id)) cur = byId.get(cur.parent_id);
        return cur;
      };

      // 2) établissements publiés
      const { data: rows } = await supabase
        .from('businesses')
        .select(`
          id, slug, name, description, city, photos,
          categories(id, name, slug, icon, parent_id),
          tenants!inner(verification_level)
        `)
        .eq('status', 'approved')
        .order('name', { ascending: true });

      const mapped: Estab[] = (rows || []).map((b: any) => {
        const cat = b.categories;
        const root = cat ? rootOf(cat) : null;
        const famMeta = FAMILIES.find((f) => f.slug === root?.slug);
        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          description: b.description,
          city: b.city,
          photo: b.photos?.[0] || null,
          categoryName: cat?.name || null,
          categorySlug: cat?.slug || null,
          categoryIcon: cat?.icon || null,
          familySlug: root?.slug || 'autres-commerces',
          familyName: famMeta?.label || root?.name || 'Autres commerces',
          familyIcon: famMeta?.icon || root?.icon || '🏬',
          level: b.tenants?.verification_level || 'inscrit',
        };
      });

      setItems(mapped);
      setLoading(false);
    })();
  }, []);

  // Normalise une ville pour un matching souple (casse/espaces/accents).
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const cityNeedle = city !== 'all' ? norm(city) : '';
    return items.filter((i) => {
      if (family !== 'all' && i.familySlug !== family) return false;
      // Ville : match souple (la fiche "Pnhom penh kampot" matche "Kampot"/"Phnom Penh").
      if (cityNeedle) {
        const c = norm(i.city || '');
        if (!c.includes(cityNeedle) && !cityNeedle.includes(c)) return false;
      }
      if (level !== 'all' && (i.level || 'inscrit') !== level) return false;
      if (needle) {
        const hay = `${i.name} ${i.city || ''} ${i.categoryName || ''} ${i.description || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [items, q, family, city, level]);

  // Groupe les résultats par famille (dans l'ordre FAMILIES)
  const groups = useMemo(() => {
    return FAMILIES
      .map((f) => ({ ...f, list: filtered.filter((i) => i.familySlug === f.slug) }))
      .filter((g) => g.list.length > 0);
  }, [filtered]);

  return (
    <div className="max-w-wrap mx-auto px-4 md:px-6 py-8">
      {/* Recherche + filtres */}
      <div className="bg-white border border-gris-ligne rounded-2xl p-4 md:p-5 shadow-cb-sm mb-6">
        <div className="flex items-center gap-3 bg-gris-fond border border-gris-ligne rounded-xl px-4 py-3 mb-3">
          <Search size={18} className="text-gris-doux" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un établissement, une ville, un service…"
            className="flex-1 bg-transparent text-sm text-ink outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFamily('all')}
            className={'text-xs font-bold px-3.5 py-2 rounded-full border transition-colors ' +
              (family === 'all' ? 'bg-marine text-white border-marine' : 'bg-white text-gris-texte border-gris-ligne hover:border-marine')}
          >
            Tout
          </button>
          {FAMILIES.map((f) => (
            <button
              key={f.slug}
              onClick={() => setFamily(f.slug)}
              className={'text-xs font-bold px-3.5 py-2 rounded-full border transition-colors flex items-center gap-1.5 ' +
                (family === f.slug ? 'bg-marine text-white border-marine' : 'bg-white text-gris-texte border-gris-ligne hover:border-marine')}
            >
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-full border border-gris-ligne bg-white text-gris-texte"
          >
            <option value="all">Toutes les villes</option>
            {cityList.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-full border border-gris-ligne bg-white text-gris-texte"
          >
            {LEVELS.map((l) => <option key={l.slug} value={l.slug}>{l.label}</option>)}
          </select>
          <span className="ml-auto text-xs text-gris-doux font-bold">
            {loading ? '…' : `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gris-texte text-sm">Chargement de l&apos;annuaire…</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-gris-texte text-sm">Aucun établissement ne correspond à votre recherche.</div>
      ) : (
        groups.map((g) => (
          <section key={g.slug} className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-gris-fond flex items-center justify-center text-base">{g.icon}</span>
              <h2 className="text-base font-extrabold text-marine">{g.label}</h2>
              <span className="text-[11px] text-gris-doux font-bold bg-gris-fond border border-gris-ligne rounded-full px-2.5 py-0.5">
                {g.list.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {g.list.map((e) => (
                <Link
                  key={e.id}
                  href={`/commerce/${e.slug}`}
                  className="flex gap-3 items-center bg-white border border-gris-ligne rounded-xl p-3 hover:border-marine transition-colors"
                >
                  <div
                    className="w-13 h-13 rounded-lg bg-gris-fond bg-cover bg-center flex-shrink-0 flex items-center justify-center text-xl"
                    style={e.photo ? { backgroundImage: `url(${e.photo})`, width: 52, height: 52 } : { width: 52, height: 52 }}
                  >
                    {!e.photo && (e.categoryIcon || g.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-marine truncate">{e.name}</div>
                    {e.description && (
                      <div className="text-xs text-gris-texte line-clamp-1">{e.description}</div>
                    )}
                    <div className="text-[10.5px] text-gris-doux flex gap-2 mt-0.5">
                      {e.city && <span>📍 {e.city}</span>}
                      {e.categoryName && <span>{e.categoryIcon || ''} {e.categoryName}</span>}
                    </div>
                  </div>
                  <span className="text-gris-doux text-lg flex-shrink-0">›</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
