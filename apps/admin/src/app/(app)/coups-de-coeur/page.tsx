'use client';

import { useState } from 'react';
import {
  Star,
  GripVertical,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';

interface Featured {
  id: string;
  name: string;
  category: string;
  city: string;
  tenant: string;
  position: number;
  activeFrom: string;
  activeUntil: string;
}

const MOCK_FEATURED: Featured[] = [
  { id: 'f1', name: 'Le Bistro Khmer — Daun Penh', category: 'Restaurant', city: 'Phnom Penh', tenant: 'Le Bistro Khmer', position: 1, activeFrom: '2025-02-01', activeUntil: '2025-02-28' },
  { id: 'f2', name: 'Sokha Spa — Riverside', category: 'Spa', city: 'Siem Reap', tenant: 'Sokha Spa & Massage', position: 2, activeFrom: '2025-02-01', activeUntil: '2025-02-28' },
  { id: 'f3', name: 'Phnom Penh Food Tours', category: 'Activité', city: 'Phnom Penh', tenant: 'Phnom Penh Food Tours', position: 3, activeFrom: '2025-02-01', activeUntil: '2025-02-28' },
];

const AVAILABLE: Featured[] = [
  { id: 'a1', name: 'Angkor Travel Co.', category: 'Activité', city: 'Siem Reap', tenant: 'Angkor Travel Co.', position: 0, activeFrom: '', activeUntil: '' },
  { id: 'a2', name: 'Green Umbrella HQ', category: 'Association', city: 'Phnom Penh', tenant: 'Green Umbrella', position: 0, activeFrom: '', activeUntil: '' },
  { id: 'a3', name: 'Kampot Pepper Farm', category: 'Shopping', city: 'Kampot', tenant: 'Kampot Pepper Farm', position: 0, activeFrom: '', activeUntil: '' },
];

export default function FeaturedPage() {
  const [featured, setFeatured] = useState(MOCK_FEATURED);

  const moveUp = (id: string) => {
    const idx = featured.findIndex((f) => f.id === id);
    if (idx <= 0) return;
    const newList = [...featured];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    newList.forEach((f, i) => (f.position = i + 1));
    setFeatured(newList);
  };

  const moveDown = (id: string) => {
    const idx = featured.findIndex((f) => f.id === id);
    if (idx < 0 || idx >= featured.length - 1) return;
    const newList = [...featured];
    [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    newList.forEach((f, i) => (f.position = i + 1));
    setFeatured(newList);
  };

  const remove = (id: string) => {
    if (confirm('Retirer cet établissement des coups de cœur ?')) {
      setFeatured((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Coups de cœur
        </h1>
        <p className="text-sm text-gris-texte">
          Établissements mis en avant sur la page d&apos;accueil · {featured.length} actifs
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong className="block mb-1">Comment ça marche ?</strong>
          Les coups de cœur apparaissent sur la page d&apos;accueil du site public, dans un carrousel.
          L&apos;ordre ci-dessous définit l&apos;ordre d&apos;affichage (glisser-déposer via les flèches).
          Renouvellement conseillé : chaque mois.
        </div>
      </div>

      {/* Actifs */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm mb-8">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine flex items-center gap-2">
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            Coups de cœur actifs
          </h2>
        </div>
        <ul className="divide-y divide-gris-ligne">
          {featured.map((f, i) => (
            <li key={f.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => moveUp(f.id)}
                  disabled={i === 0}
                  className="text-gris-doux hover:text-marine disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp size={14} />
                </button>
                <div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center font-extrabold text-sm">
                  {f.position}
                </div>
                <button
                  onClick={() => moveDown(f.id)}
                  disabled={i === featured.length - 1}
                  className="text-gris-doux hover:text-marine disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-marine truncate">{f.name}</div>
                <div className="text-xs text-gris-texte">
                  {f.category} · {f.city} · {f.tenant}
                </div>
                <div className="text-[10px] text-gris-doux mt-1">
                  Actif du {f.activeFrom} au {f.activeUntil}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors">
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => remove(f.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                  title="Retirer"
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
          {featured.length === 0 && (
            <li className="px-6 py-12 text-center text-gris-texte text-sm">
              Aucun coup de cœur actif.
            </li>
          )}
        </ul>
      </div>

      {/* Disponibles à ajouter */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Ajouter un établissement</h2>
          <p className="text-xs text-gris-texte mt-1">
            Établissements publiés pouvant être mis en avant.
          </p>
        </div>
        <ul className="divide-y divide-gris-ligne">
          {AVAILABLE.map((a) => (
            <li key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
              <div className="w-9 h-9 rounded-lg bg-gris-fond flex items-center justify-center text-gris-doux">
                <GripVertical size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-marine truncate">{a.name}</div>
                <div className="text-xs text-gris-texte">
                  {a.category} · {a.city} · {a.tenant}
                </div>
              </div>
              <button
                onClick={() => {
                  setFeatured((prev) => [
                    ...prev,
                    { ...a, id: 'f' + Date.now(), position: prev.length + 1, activeFrom: '2025-02-01', activeUntil: '2025-02-28' },
                  ]);
                }}
                className="flex items-center gap-1.5 text-xs font-bold bg-yellow-500 text-white px-3 py-1.5 rounded-full hover:bg-yellow-600 transition-colors"
              >
                <Star size={12} fill="currentColor" />
                Ajouter
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}