'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadedFile, PhotoSlot } from '@/lib/establishment-wizard';

interface PhotoUploadSlotProps {
  slot: PhotoSlot;
  photo: UploadedFile | null;
  isMain?: boolean;
  onChange: (file: UploadedFile | null) => void;
}

export default function PhotoUploadSlot({
  slot,
  photo,
  isMain = false,
  onChange,
}: PhotoUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        name: file.name,
        size: file.size,
        url: reader.result as string,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        className={cn(
          'relative aspect-[4/3] rounded-lg overflow-hidden border-2',
          photo
            ? isMain
              ? 'border-marine'
              : 'border-gris-ligne'
            : 'bg-gris-fond border-dashed border-gris-ligne cursor-pointer hover:border-marine'
        )}
        onClick={() => !photo && inputRef.current?.click()}
      >
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={slot.label}
              fill
              className="object-cover"
              sizes="200px"
              unoptimized
            />

            {isMain && (
              <div className="absolute top-2 left-2 bg-marine text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                Principale
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Retirer la photo"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Upload size={20} className="text-gris-doux mb-1" />
            <div className="text-[10px] text-gris-doux font-bold">
              {slot.required ? 'Ajouter *' : 'Ajouter'}
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      <div className="text-[10px] text-gris-texte mt-1.5 flex items-center gap-1">
        <span>📸 {slot.label}</span>
        {slot.required && <span className="text-red-500">*</span>}
        {photo && <span className="text-green-600 font-bold ml-auto">✓</span>}
      </div>
    </div>
  );
}