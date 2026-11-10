'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

export interface Filters {
  city?: string;
  level?: string;
  labels?: string[];
  subcategory?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cities: string[];
  labels: any[];
  subcategories?: { id: string; name: string; icon?: string; count?: number }[];
}

const LEVELS = [
  { id: '', label: 'Tous niveaux' },
  { id: 'verifie', label: '🥉 Bronze' },
  { id: 'premium', label: '🥈 Silver' },
  { id: 'exception', label: '🥇 Gold' },
  { id: 'legende', label: '💎 Platine' },
];

/**
 * Barre de filtre COMPACTE (commune en esprit avec l'annuaire).
 * - Ligne 1 : ville + niveau + labels + bouton "Plus de filtres" + reset.
 * - Repli : sous-catégories (spécifiques à la rubrique).
 */
export default function FiltersBar({ filters, onChange, cities, labels, subcategories = [] }: Props) {
  const [open, setOpen] = useState(false);

  const hasFilters =
    filters.city ||
    filters.level ||
    filters.subcategory ||
    (filters.labels && filters.labels.length > 0);

  const toggleLabel = (labelCode: string) => {
    const current = filters.labels || [];
    const updated = current.includes(labelCode)
      ? current.filter((l) => l !== labelCode)
      : [...current, labelCode];
    onChange({ ...filters, labels: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-gris-ligne p-3 mb-6 shadow-cb-sm">
      {/* Ligne compacte : ville + niveau + labels + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filters.city || ''}
          onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
          className="px-3 py-2 text-xs font-bold rounded-full border border-gris-ligne bg-white text-gris-texte focus:border-marine focus:outline-none"
        >
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.level || ''}
          onChange={(e) => onChange({ ...filters, level: e.target.value || undefined })}
          className="px-3 py-2 text-xs font-bold rounded-full border border-gris-ligne bg-white text-gris-texte focus:border-marine focus:outline-none"
        >
          {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>

        {/* Labels en pills compactes */}
        {labels.map((l) => {
          const active = (filters.labels || []).includes(l.code);
          return (
            <button
              key={l.id}
              onClick={() => toggleLabel(l.code)}
              className={
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ' +
                (active ? 'text-white border-transparent' : 'bg-white text-gris-texte border-dashed border-gris-ligne hover:border-marine')
              }
              style={active ? { backgroundColor: l.color || '#1B3A6B' } : {}}
            >
              {l.icon} {l.name}
            </button>
          );
        })}

        {/* Plus de filtres (sous-catégories) */}
        {subcategories.length > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-marine hover:underline"
          >
            <SlidersHorizontal size={13} />
            {open ? 'Moins de filtres' : 'Plus de filtres'}
          </button>
        )}

        {hasFilters && (
          <button
            onClick={() => onChange({})}
            className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:underline font-bold"
          >
            <X size={11} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Repli : sous-catégories spécifiques à la rubrique */}
      {open && subcategories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dashed border-gris-ligne">
          <div className="text-[10px] font-bold text-gris-doux uppercase tracking-wider mb-2">
            Sous-catégorie
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ ...filters, subcategory: undefined })}
              className={
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all ' +
                (!filters.subcategory ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
              }
            >
              Toutes
            </button>
            {subcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ ...filters, subcategory: s.id })}
                className={
                  'px-3 py-1.5 rounded-full text-xs font-bold transition-all ' +
                  (filters.subcategory === s.id ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
                }
              >
                {s.icon} {s.name}
                {s.count !== undefined && <span className="ml-1 opacity-60">({s.count})</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
