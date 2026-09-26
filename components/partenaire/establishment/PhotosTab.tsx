'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';
import { PHOTO_SLOTS } from '@/lib/establishment-wizard';

interface PhotosTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

export default function PhotosTab({
  establishment,
  onUpdate,
}: PhotosTabProps) {
  const [photos, setPhotos] = useState<string[]>(
    establishment.photos || []
  );
  const [saved, setSaved] = useState(false);

  const limit = establishment.photosLimit || 5;
  const remaining = limit - photos.length;

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

    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    if (!confirm('Retirer cette photo ?')) return;
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateEstablishment(establishment.slug, {
      photos,
      photosCount: photos.length,
    });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      {/* Info quota */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-sm font-bold text-marine mb-1">
            Photos de votre établissement
          </div>
          <div className="text-xs text-gris-texte">
            {photos.length} / {limit} photos · {remaining} emplacement
            {remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''}
          </div>
        </div>

        {remaining > 0 && (
          <label className="inline-flex items-center gap-2 bg-marine text-white font-bold px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-xs cursor-pointer">
            <Upload size={14} />
            Ajouter une photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAdd(file);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>

      {/* Info slots */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-start gap-2">
        <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <b>Conseil :</b> variez les photos — devanture, intérieur, activité,
          équipe. Les fiches avec 5 photos reçoivent <b>3× plus de vues</b>.
        </p>
      </div>

      {/* Grille de photos */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {photos.map((url, index) => {
            const slot = PHOTO_SLOTS[index];
            const isMain = index === 0;

            return (
              <div key={index}>
                <div
                  className={cn(
                    'relative aspect-[4/3] rounded-lg overflow-hidden border-2',
                    isMain ? 'border-marine' : 'border-gris-ligne'
                  )}
                >
                  <Image
                    src={url}
                    alt={slot ? slot.label : `Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="300px"
                    unoptimized
                  />

                  {isMain && (
                    <div className="absolute top-2 left-2 bg-marine text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Photo principale
                    </div>
                  )}

                  <button
                    onClick={() => handleRemove(index)}
                    aria-label="Supprimer"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="text-[10px] text-gris-texte mt-1.5">
                  📸 {slot ? slot.label : `Photo ${index + 1}`}
                </div>
              </div>
            );
          })}

          {/* Emplacement vide */}
          {remaining > 0 && (
            <div>
              <label className="relative aspect-[4/3] rounded-lg bg-gris-fond border-2 border-dashed border-gris-ligne flex flex-col items-center justify-center cursor-pointer hover:border-marine transition-colors">
                <Upload size={20} className="text-gris-doux mb-1" />
                <div className="text-[10px] text-gris-doux font-bold">
                  Ajouter
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAdd(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {PHOTO_SLOTS[photos.length] && (
                <div className="text-[10px] text-gris-doux mt-1.5">
                  📸 {PHOTO_SLOTS[photos.length].label}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gris-fond rounded-lg mb-6">
          <Upload size={40} className="text-gris-ligne mx-auto mb-3" />
          <p className="text-sm text-gris-texte mb-4">
            Aucune photo pour le moment
          </p>
          <label className="inline-flex items-center gap-2 bg-marine text-white font-bold px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-xs cursor-pointer">
            <Upload size={14} />
            Ajouter ma première photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAdd(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      {/* Save */}
      <div className="pt-4 flex justify-end gap-3 border-t border-gris-ligne">
        <button
          onClick={handleSave}
          disabled={saved}
          className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
        >
          {saved ? (
            <>
              <i className="fas fa-check" /> Enregistré
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Enregistrer les photos
            </>
          )}
        </button>
      </div>
    </div>
  );
}