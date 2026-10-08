'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface PhotosTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

export default function PhotosTab({ establishment, onUpdate }: PhotosTabProps) {
  const [photos, setPhotos] = useState<string[]>(establishment.photos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const limit = establishment.photos_limit ?? 5;
  const remaining = limit - photos.length;

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${establishment.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('business-photos')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      console.error('upload error:', uploadErr);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('business-photos')
      .getPublicUrl(filename);

    return publicUrl;
  };

  const handleAdd = async (file: File) => {
    if (photos.length >= limit) {
      alert(`Limite atteinte (${limit} photos).`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 5 Mo.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Format non supporté.');
      return;
    }

    setUploading(true);
    setError('');
    const url = await uploadFile(file);
    if (url) {
      setPhotos((prev) => [...prev, url]);
    } else {
      setError('Erreur lors de l\'upload.');
    }
    setUploading(false);
  };

  const handleRemove = (index: number) => {
    if (!confirm('Retirer cette photo ?')) return;
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const ok = await updateEstablishment(establishment.id, { photos });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-marine">Photos de l&apos;établissement</h2>
          <p className="text-xs text-gris-texte mt-1">
            {photos.length} / {limit} photos · {remaining} restante{remaining > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden border border-gris-ligne group"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {photos.length < limit && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gris-ligne hover:border-marine cursor-pointer flex flex-col items-center justify-center text-gris-texte hover:text-marine transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAdd(file);
                e.target.value = '';
              }}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 size={24} className="animate-spin mb-2" />
            ) : (
              <Upload size={24} className="mb-2" />
            )}
            <span className="text-xs font-bold">
              {uploading ? 'Upload...' : 'Ajouter une photo'}
            </span>
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          ✅ Photos enregistrées
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gris-ligne">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? 'Enregistrement...' : 'Enregistrer les photos'}
        </button>
      </div>
    </div>
  );
}