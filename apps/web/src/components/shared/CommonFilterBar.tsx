'use client';

// ============================================================================
// Barre de filtre COMMUNE — partagée entre l'annuaire et les rubriques.
// Purement présentielle : reçoit l'état + les callbacks + les listes.
// La logique de filtrage reste propre à chaque page (données différentes),
// mais l'UI et le comportement sont identiques partout.
// ============================================================================

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface CommonFilterValue {
  q: string;
  city: string;          // '' = toutes
  level: string;         // '' = tous
  labels: string[];
  subcategory: string;   // '' = toutes (id ou slug selon la page)
  amenities: string[];   // commodités cochées (clés)
  priceRange: string;    // '' / '€' / '€€' / '€€€'
}

export interface FilterOption { id: string; label: string; icon?: string; count?: number; color?: string }

interface Props {
  value: CommonFilterValue;
  onChange: (v: CommonFilterValue) => void;
  resultCount: number;

  cities: string[];
  levels: { id: string; label: string }[];
  labels: FilterOption[];          // labels éditoriaux (coup de cœur, vérifié…)
  // Filtres spécifiques (repliés) :
  subcategories?: FilterOption[];  // sous-catégories (rubrique)
  amenities?: FilterOption[];      // commodités de la catégorie
  showPrice?: boolean;             // gamme de prix (resto/café…)

  searchPlaceholder?: string;
}

const PRICES = ['€', '€€', '€€€'];

export default function CommonFilterBar({
  value, onChange, resultCount,
  cities, levels, labels,
  subcategories = [], amenities = [], showPrice = false,
  searchPlaceholder = 'Rechercher un établissement, une ville, un service…',
}: Props) {
  const [open, setOpen] = useState(false);

  const set = (patch: Partial<CommonFilterValue>) => onChange({ ...value, ...patch });
  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const hasAdvanced = subcategories.length > 0 || amenities.length > 0 || showPrice;
  const active =
    value.city || value.level || value.subcategory || value.priceRange ||
    value.labels.length || value.amenities.length;

  return (
    <div className="bg-white rounded-xl border border-gris-ligne p-3 shadow-cb-sm">
      {/* Ligne 1 : recherche + ville + niveau + compteur */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            value={value.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne bg-gris-fond focus:border-marine focus:outline-none"
          />
        </div>
        <select value={value.city} onChange={(e) => set({ city: e.target.value })}
          className="px-3 py-2.5 text-xs font-bold rounded-lg border border-gris-ligne bg-white text-gris-texte focus:border-marine focus:outline-none">
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={value.level} onChange={(e) => set({ level: e.target.value })}
          className="px-3 py-2.5 text-xs font-bold rounded-lg border border-gris-ligne bg-white text-gris-texte focus:border-marine focus:outline-none">
          {levels.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <span className="ml-auto text-xs text-gris-doux font-bold whitespace-nowrap">
          {resultCount} résultat{resultCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Ligne 2 : labels + bouton plus de filtres.
          (Les pills de TYPE d'établissement restent gérées par la page appelante
          — annuaire — car elles pilotent aussi le groupement des résultats.) */}
      <div className="flex items-center gap-1.5 flex-wrap mt-2">
        {labels.map((l) => {
          const on = value.labels.includes(l.id);
          return (
            <button key={l.id} onClick={() => set({ labels: toggle(value.labels, l.id) })}
              className={'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ' +
                (on ? 'text-white border-transparent' : 'bg-white text-gris-texte border-dashed border-gris-ligne hover:border-marine')}
              style={on ? { backgroundColor: l.color || '#D9A441', color: '#1a1a1a' } : {}}>
              {l.icon} {l.label}
            </button>
          );
        })}
        {hasAdvanced && (
          <button onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-marine hover:underline">
            <SlidersHorizontal size={13} /> {open ? 'Moins de filtres' : 'Plus de filtres'}
          </button>
        )}
        {active ? (
          <button onClick={() => onChange({ q: value.q, city: '', level: '', labels: [], subcategory: '', amenities: [], priceRange: '' })}
            className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:underline font-bold">
            <X size={11} /> Réinitialiser
          </button>
        ) : null}
      </div>

      {/* Repli : filtres spécifiques par catégorie */}
      {open && hasAdvanced && (
        <div className="mt-3 pt-3 border-t border-dashed border-gris-ligne space-y-3">
          {subcategories.length > 0 && (
            <Group title="Sous-catégorie">
              <Pill on={value.subcategory === ''} onClick={() => set({ subcategory: '' })}>Toutes</Pill>
              {subcategories.map((s) => (
                <Pill key={s.id} on={value.subcategory === s.id} onClick={() => set({ subcategory: s.id })}>
                  {s.icon} {s.label}{s.count !== undefined && <span className="opacity-60 ml-1">({s.count})</span>}
                </Pill>
              ))}
            </Group>
          )}
          {amenities.length > 0 && (
            <Group title="Services">
              {amenities.map((a) => (
                <Pill key={a.id} on={value.amenities.includes(a.id)} onClick={() => set({ amenities: toggle(value.amenities, a.id) })}>
                  {a.label}
                </Pill>
              ))}
            </Group>
          )}
          {showPrice && (
            <Group title="Gamme de prix">
              {PRICES.map((p) => (
                <Pill key={p} on={value.priceRange === p} onClick={() => set({ priceRange: value.priceRange === p ? '' : p })}>
                  {p}
                </Pill>
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gris-doux uppercase tracking-wider mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={'px-3 py-1.5 rounded-full text-xs font-bold transition-all ' +
        (on ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')}>
      {children}
    </button>
  );
}
