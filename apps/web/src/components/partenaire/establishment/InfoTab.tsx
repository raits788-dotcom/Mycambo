'use client';

import { useState } from 'react';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface InfoTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

export default function InfoTab({ establishment, onUpdate }: InfoTabProps) {
  const [form, setForm] = useState({
    short_description: establishment.short_description || '',
    long_description: establishment.long_description || '',
    founded_year: establishment.founded_year?.toString() || '',
    phone: establishment.phone || '',
    whatsapp: establishment.whatsapp || '',
    website: establishment.website || '',
    facebook: establishment.facebook || '',
    instagram: establishment.instagram || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const ok = await updateEstablishment(establishment.id, {
      short_description: form.short_description || null,
      long_description: form.long_description || null,
      founded_year: form.founded_year ? parseInt(form.founded_year, 10) : null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
      facebook: form.facebook || null,
      instagram: form.instagram || null,
    });

    if (!ok) {
      setError('Erreur lors de l\'enregistrement.');
    } else {
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Certains champs (nom, catégorie, adresse) nécessitent une validation par l&apos;équipe myCAMBO.
        </p>
      </div>

      {/* Description courte */}
      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          Description courte
        </label>
        <input
          type="text"
          maxLength={120}
          value={form.short_description}
          onChange={(e) => handleChange('short_description', e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          placeholder="En une phrase, présentez votre établissement"
        />
        <div className="text-[10px] text-gris-doux mt-1">
          {form.short_description.length}/120 caractères
        </div>
      </div>

      {/* Description longue */}
      <div>
        <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
          Description détaillée
        </label>
        <textarea
          rows={5}
          value={form.long_description}
          onChange={(e) => handleChange('long_description', e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
          placeholder="Décrivez votre établissement, votre histoire, vos valeurs..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Année de création
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={form.founded_year}
            onChange={(e) => handleChange('founded_year', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="2015"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="+855 ..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="+855 ..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Site web
          </label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Facebook
          </label>
          <input
            type="url"
            value={form.facebook}
            onChange={(e) => handleChange('facebook', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Instagram
          </label>
          <input
            type="url"
            value={form.instagram}
            onChange={(e) => handleChange('instagram', e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <Check size={14} /> Modifications enregistrées
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gris-ligne">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}