'use client';

import { Filter, X } from 'lucide-react';

interface Filters {
  city?: string;
  level?: string;
  labels?: string[];
  priceRange?: string;
  rating?: number;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cities: string[];
  labels: any[];
}

export default function FiltersBar({ filters, onChange, cities, labels }: Props) {
  const LEVELS = [
    { id: '', label: 'Tous niveaux' },
    { id: 'verifie', label: '🥉 Vérifié (Bronze)' },
    { id: 'premium', label: '🥈 Premium (Silver)' },
    { id: 'exception', label: '🥇 Exception (Gold)' },
    { id: 'legende', label: '💎 Légende (Platine)' },
  ];

  const hasFilters =
    filters.city ||
    filters.level ||
    (filters.labels && filters.labels.length > 0);

  const toggleLabel = (labelCode: string) => {
    const current = filters.labels || [];
    const updated = current.includes(labelCode)
      ? current.filter((l) => l !== labelCode)
      : [...current, labelCode];
    onChange({ ...filters, labels: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-6 shadow-cb-sm">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-gris-doux" />
        <span className="text-xs font-bold text-gris-texte uppercase tracking-wider">
          Filtres
        </span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Ville */}
        <div>
          <label className="block text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">
            Ville
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-1">
            Niveau de vérification
          </label>
          <select
            value={filters.level || ''}
            onChange={(e) => onChange({ ...filters, level: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sous-labels */}
      {labels.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gris-ligne">
          <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-2">
            Labels
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => {
              const active = (filters.labels || []).includes(l.code);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLabel(l.code)}
                  className={
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ' +
                    (active
                      ? 'text-white'
                      : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
                  }
                  style={active ? { backgroundColor: l.color || '#1B3A6B' } : {}}
                >
                  {l.icon} {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}