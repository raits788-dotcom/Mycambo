'use client';

import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export default function Step1Company({ data, updateData }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('position');
      setCategories(cats || []);
      setLoadingCats(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          <Building2 size={18} /> Votre entreprise
        </h2>
        <p className="text-xs text-gris-texte">
          Informations légales et coordonnées.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Raison sociale *
          </label>
          <input
            type="text"
            value={data.legal_name}
            onChange={(e) => updateData({ legal_name: e.target.value })}
            placeholder="Ex : Bistro Khmer Co., Ltd"
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            N° d&apos;enregistrement *
          </label>
          <input
            type="text"
            value={data.registration_number}
            onChange={(e) => updateData({ registration_number: e.target.value })}
            placeholder="MOC-2024-XXXX"
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
          />
          <div className="text-[10px] text-gris-doux mt-1">
            Format : MOC-XXXXX (Business Registration)
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Représentant légal *
          </label>
          <input
            type="text"
            value={data.legal_representative_name}
            onChange={(e) => updateData({ legal_representative_name: e.target.value })}
            placeholder="Nom complet"
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Téléphone du représentant *
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
            <input
              type="tel"
              value={data.legal_representative_phone}
              onChange={(e) => updateData({ legal_representative_phone: e.target.value })}
              placeholder="+855 12 345 678"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="contact@exemple.com"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Catégorie *
          </label>
          <select
            value={data.category}
            onChange={(e) => updateData({ category: e.target.value })}
            disabled={loadingCats}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            <option value="">— Choisir une catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Ville *
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
            <input
              type="text"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              placeholder="Phnom Penh"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Présence en ligne */}
      <div className="pt-4 border-t border-gris-ligne">
        <h3 className="font-bold text-marine text-sm mb-3 flex items-center gap-2">
          <Globe size={14} /> Présence en ligne (optionnel)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Site web
            </label>
            <input
              type="url"
              value={data.website_url}
              onChange={(e) => updateData({ website_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Facebook
            </label>
            <input
              type="url"
              value={data.facebook_url}
              onChange={(e) => updateData({ facebook_url: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">
              Google Maps
            </label>
            <input
              type="url"
              value={data.google_maps_url}
              onChange={(e) => updateData({ google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}