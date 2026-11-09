'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Globe } from 'lucide-react';
import type { WizardData, DemandeEstablishment } from '../page';
import { getCategoryTree, type CategoryFamily } from '@/lib/categories';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const EMPTY: DemandeEstablishment = {
  name: '', family_slug: '', category_id: '', category: '',
  city: '', address: '', website_url: '', facebook_url: '', google_maps_url: '',
  tagline: '', description: '', public_phone: '', public_email: '',
  hours: '', services: [], price_range: '', languages: [],
};

export default function Step2Establishments({ data, updateData }: Props) {
  const MAX_ESTABLISHMENTS = 3;
  const [tree, setTree] = useState<CategoryFamily[]>([]);

  useEffect(() => { getCategoryTree().then(setTree); }, []);

  const addEstablishment = () => {
    if (data.establishments.length >= MAX_ESTABLISHMENTS) return;
    updateData({ establishments: [...data.establishments, { ...EMPTY }] });
  };

  const removeEstablishment = (index: number) => {
    if (data.establishments.length === 1) return;
    updateData({ establishments: data.establishments.filter((_, i) => i !== index) });
  };

  const patch = (index: number, updates: Partial<DemandeEstablishment>) => {
    const updated = [...data.establishments];
    updated[index] = { ...updated[index], ...updates };
    updateData({ establishments: updated });
  };

  // Changement de famille : réinitialise la sous-catégorie.
  const onFamily = (index: number, familySlug: string) => {
    patch(index, { family_slug: familySlug, category_id: '', category: '' });
  };

  // Changement de sous-catégorie : stocke id + libellé (+ slug via category).
  const onSubcat = (index: number, catId: string, family: CategoryFamily) => {
    const child = family.children.find((c) => c.id === catId);
    patch(index, { category_id: catId, category: child?.slug || '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          🏢 Vos établissements
        </h2>
        <p className="text-xs text-gris-texte">
          Déclarez votre (ou vos) établissement(s) (max 3). Chacun a sa
          catégorie, sa ville et son adresse. Vous pourrez en ajouter d&apos;autres
          plus tard depuis votre espace.
        </p>
      </div>

      <div className="space-y-4">
        {data.establishments.map((est, index) => {
          const family = tree.find((f) => f.slug === est.family_slug);
          return (
            <div key={index} className="bg-gris-fond rounded-lg p-4 border border-gris-ligne">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-marine uppercase tracking-wider">
                  Établissement #{index + 1}
                </span>
                {data.establishments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEstablishment(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Nom *</label>
                  <input
                    type="text"
                    value={est.name}
                    onChange={(e) => patch(index, { name: e.target.value })}
                    placeholder="Ex : Le Bistro Khmer — Daun Penh"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                  />
                </div>

                {/* Catégorie en 2 niveaux */}
                <div>
                  <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Famille *</label>
                  <select
                    value={est.family_slug}
                    onChange={(e) => onFamily(index, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                  >
                    <option value="">— Choisir —</option>
                    {tree.map((f) => (
                      <option key={f.id} value={f.slug}>{f.icon ? f.icon + ' ' : ''}{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Sous-catégorie *</label>
                  <select
                    value={est.category_id}
                    onChange={(e) => family && onSubcat(index, e.target.value, family)}
                    disabled={!family || family.children.length === 0}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none disabled:opacity-60"
                  >
                    <option value="">{family ? '— Choisir —' : '— Choisissez d\'abord une famille —'}</option>
                    {(family?.children || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.icon ? c.icon + ' ' : ''}{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Ville *</label>
                  <div className="relative">
                    <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                    <input
                      type="text"
                      value={est.city}
                      onChange={(e) => patch(index, { city: e.target.value })}
                      placeholder="Phnom Penh"
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Adresse</label>
                  <input
                    type="text"
                    value={est.address}
                    onChange={(e) => patch(index, { address: e.target.value })}
                    placeholder="12 Street 240, Daun Penh"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                  />
                </div>

                {/* Présence en ligne par établissement */}
                <div className="md:col-span-2 pt-2 border-t border-gris-ligne">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gris-texte uppercase mb-2">
                    <Globe size={11} /> Présence en ligne (optionnel)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="url" value={est.website_url}
                      onChange={(e) => patch(index, { website_url: e.target.value })}
                      placeholder="Site web"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <input
                      type="url" value={est.facebook_url}
                      onChange={(e) => patch(index, { facebook_url: e.target.value })}
                      placeholder="Facebook"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <input
                      type="url" value={est.google_maps_url}
                      onChange={(e) => patch(index, { google_maps_url: e.target.value })}
                      placeholder="Google Maps"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.establishments.length < MAX_ESTABLISHMENTS && (
        <button
          type="button"
          onClick={addEstablishment}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold border-2 border-dashed border-gris-ligne text-marine py-3 rounded-lg hover:border-marine hover:bg-marine/5 transition-all"
        >
          <Plus size={16} />
          Ajouter un établissement ({data.establishments.length}/{MAX_ESTABLISHMENTS})
        </button>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-blue-600 text-lg">💡</span>
        <p className="text-xs text-blue-800">
          Vous pourrez ajouter d&apos;autres établissements depuis votre espace
          partenaire après validation de votre compte. Chaque établissement
          supplémentaire peut bénéficier d&apos;une formule d&apos;abonnement.
        </p>
      </div>
    </div>
  );
}
