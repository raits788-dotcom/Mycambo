'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Sparkles, Phone, Clock, Settings } from 'lucide-react';
import type { WizardData, DemandeEstablishment } from '../page';
import { useWizardLang } from '../WizardLangContext';
import { getCategoryTree, type CategoryFamily } from '@/lib/categories';
import { getAmenitiesForCategory, type Amenity } from '@/lib/amenities';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const PRICE_RANGES = ['€', '€€', '€€€'];
const LANGUAGES = ['Français', 'Anglais', 'Khmer', 'Chinois'];

export default function Step3Details({ data, updateData }: Props) {
  const { t } = useWizardLang();
  const [open, setOpen] = useState<number>(0);

  // Table category_id -> slug (pour résoudre la sous-catégorie choisie).
  const [idToSlug, setIdToSlug] = useState<Record<string, string>>({});
  // Commodités chargées par slug de sous-catégorie (cache local).
  const [amenitiesBySlug, setAmenitiesBySlug] = useState<Record<string, Amenity[]>>({});

  // Charge l'arbre des catégories une fois pour la table id->slug.
  useEffect(() => {
    (async () => {
      const tree: CategoryFamily[] = await getCategoryTree();
      const map: Record<string, string> = {};
      for (const fam of tree) {
        map[fam.id] = fam.slug;
        for (const child of fam.children) map[child.id] = child.slug;
      }
      setIdToSlug(map);
    })();
  }, []);

  // Charge les commodités pour chaque sous-catégorie sélectionnée.
  useEffect(() => {
    (async () => {
      for (const est of data.establishments) {
        const slug = est.category_id ? idToSlug[est.category_id] : '';
        if (slug && !amenitiesBySlug[slug]) {
          const list = await getAmenitiesForCategory(slug);
          setAmenitiesBySlug((prev) => ({ ...prev, [slug]: list }));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.establishments, idToSlug]);

  const patch = (index: number, updates: Partial<DemandeEstablishment>) => {
    const updated = [...data.establishments];
    updated[index] = { ...updated[index], ...updates };
    updateData({ establishments: updated });
  };

  const toggleInArray = (index: number, field: 'services' | 'languages', value: string) => {
    const current = data.establishments[index][field] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    patch(index, { [field]: next } as Partial<DemandeEstablishment>);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          ✨ {t.s3_title}
        </h2>
        <p className="text-xs text-gris-texte">
          {t.s3_subtitle_1}<strong>{t.s3_subtitle_bold}</strong>{t.s3_subtitle_2}
        </p>
      </div>

      {data.establishments.map((est, index) => {
        const isOpen = open === index;
        const estSlug = est.category_id ? idToSlug[est.category_id] : '';
        const amenities = (estSlug && amenitiesBySlug[estSlug]) || [];
        return (
          <div key={index} className="border border-gris-ligne rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : index)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-gris-fond text-left"
            >
              {isOpen ? <ChevronDown size={16} className="text-marine" /> : <ChevronRight size={16} className="text-gris-doux" />}
              <span className="text-sm font-bold text-marine">{est.name || t.s2_est_hash(index + 1)}</span>
              <span className="ml-auto text-[10px] text-gris-doux">{est.category || ''}</span>
            </button>

            {isOpen && (
              <div className="p-4 space-y-5">
                {/* Descriptif */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-marine uppercase mb-2">
                    <Sparkles size={12} /> {t.s3_descr}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text" value={est.tagline}
                      onChange={(e) => patch(index, { tagline: e.target.value })}
                      placeholder={t.s3_tagline_ph}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <textarea
                      value={est.description}
                      onChange={(e) => patch(index, { description: e.target.value })}
                      placeholder={t.s3_description_ph}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Contact & horaires */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-marine uppercase mb-2">
                    <Phone size={12} /> {t.s3_contact}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="tel" value={est.public_phone}
                      onChange={(e) => patch(index, { public_phone: e.target.value })}
                      placeholder={t.s3_public_phone_ph}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <input
                      type="email" value={est.public_email}
                      onChange={(e) => patch(index, { public_email: e.target.value })}
                      placeholder={t.s3_public_email_ph}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                    />
                    <div className="md:col-span-2 relative">
                      <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                      <input
                        type="text" value={est.hours}
                        onChange={(e) => patch(index, { hours: e.target.value })}
                        placeholder={t.s3_hours_ph}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white focus:border-marine focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Services & équipements */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-marine uppercase mb-2">
                    <Settings size={12} /> {t.s3_services}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {amenities.length === 0 && (
                      <span className="text-xs text-gris-doux italic">
                        {estSlug ? '—' : 'Choisissez une sous-catégorie à l\'étape précédente.'}
                      </span>
                    )}
                    {amenities.map((a) => {
                      // On stocke la CLÉ (a.key), on affiche le LIBELLÉ (a.label).
                      const on = (est.services || []).includes(a.key);
                      return (
                        <button
                          key={a.key} type="button"
                          onClick={() => toggleInArray(index, 'services', a.key)}
                          className={'text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ' +
                            (on ? 'bg-marine text-white border-marine' : 'bg-white text-gris-texte border-gris-ligne hover:border-marine')}
                        >
                          {on ? '✓ ' : ''}{a.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">{t.s3_price_label}</label>
                      <div className="flex gap-1.5">
                        {PRICE_RANGES.map((p) => (
                          <button
                            key={p} type="button"
                            onClick={() => patch(index, { price_range: est.price_range === p ? '' : p })}
                            className={'text-sm font-bold px-4 py-1.5 rounded-lg border transition-colors ' +
                              (est.price_range === p ? 'bg-marine text-white border-marine' : 'bg-white text-gris-texte border-gris-ligne hover:border-marine')}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">{t.s3_languages_label}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LANGUAGES.map((l) => {
                          const on = (est.languages || []).includes(l);
                          return (
                            <button
                              key={l} type="button"
                              onClick={() => toggleInArray(index, 'languages', l)}
                              className={'text-xs font-bold px-2.5 py-1.5 rounded-full border transition-colors ' +
                                (on ? 'bg-marine text-white border-marine' : 'bg-white text-gris-texte border-gris-ligne hover:border-marine')}
                            >
                              {on ? '✓ ' : ''}{t.s3_language_names[l] || l}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-blue-600 text-lg">💡</span>
        <p className="text-xs text-blue-800">
          {t.s3_tip}
        </p>
      </div>
    </div>
  );
}
