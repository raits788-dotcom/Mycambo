'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, Check, X, Info } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export default function Step3Photos({ data, updateData }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    max_size_kb: 256,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  });

  // Charge la config du bucket depuis storage_settings
  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: settings } = await supabase
        .from('storage_settings')
        .select('max_size_bytes, allowed_formats')
        .eq('bucket_name', 'partner-docs')
        .single();

      if (settings) {
        setConfig({
          max_size_kb: Math.round(settings.max_size_bytes / 1024),
          allowed_formats: settings.allowed_formats || ['jpg', 'png', 'pdf'],
        });
      }
    })();
  }, []);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'exterior' | 'interior' | 'id'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validation
    if (file.size > config.max_size_kb * 1024) {
      setError(`Le fichier ne doit pas dépasser ${config.max_size_kb} KB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!config.allowed_formats.includes(ext)) {
      setError(`Format non autorisé. Formats acceptés : ${config.allowed_formats.join(', ').toUpperCase()}`);
      return;
    }

    setUploading(slot);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const filename = `temp/${Date.now()}-${slot}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('partner-docs')
        .upload(filename, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('partner-docs')
        .getPublicUrl(filename);

      const field = slot === 'exterior' ? 'photo_exterior_url'
        : slot === 'interior' ? 'photo_interior_url'
        : 'photo_representative_id_url';

      updateData({ [field]: publicUrl });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (slot: 'exterior' | 'interior' | 'id') => {
    const field = slot === 'exterior' ? 'photo_exterior_url'
      : slot === 'interior' ? 'photo_interior_url'
      : 'photo_representative_id_url';
    updateData({ [field]: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          📸 Preuves visuelles
        </h2>
        <p className="text-xs text-gris-texte">
          Les photos doivent être récentes (&lt; 6 mois), nettes, et montrer clairement l&apos;enseigne et l&apos;intérieur.
        </p>
      </div>

      {/* Info contraintes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <b>Formats acceptés :</b> {config.allowed_formats.join(', ').toUpperCase()}
          <br />
          <b>Taille max :</b> {config.max_size_kb} KB
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PhotoSlot
          label="📸 Photo extérieure *"
          description="Façade visible avec enseigne"
          url={data.photo_exterior_url}
          uploading={uploading === 'exterior'}
          onUpload={(e) => handleUpload(e, 'exterior')}
          onRemove={() => handleRemove('exterior')}
        />

        <PhotoSlot
          label="📸 Photo intérieure *"
          description="Intérieur de l'établissement"
          url={data.photo_interior_url}
          uploading={uploading === 'interior'}
          onUpload={(e) => handleUpload(e, 'interior')}
          onRemove={() => handleRemove('interior')}
        />

        <PhotoSlot
          label="🪪 Pièce d'identité"
          description="CIN ou Passeport du représentant (optionnel)"
          url={data.photo_representative_id_url}
          uploading={uploading === 'id'}
          onUpload={(e) => handleUpload(e, 'id')}
          onRemove={() => handleRemove('id')}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Sous-composant PhotoSlot ─────────────────────────────────────
function PhotoSlot({
  label, description, url, uploading, onUpload, onRemove,
}: {
  label: string;
  description: string;
  url: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
        {label}
      </label>
      <p className="text-[10px] text-gris-doux mb-2">{description}</p>

      {url ? (
        <div className="relative aspect-square rounded-lg overflow-hidden border border-gris-ligne group bg-gris-fond">
          {url.endsWith('.pdf') ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-marine">
              <span className="text-4xl mb-2">📄</span>
              <span className="text-xs font-bold">PDF</span>
            </div>
          ) : (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Check size={12} />
          </div>
        </div>
      ) : (
        <label className="aspect-square rounded-lg border-2 border-dashed border-gris-ligne hover:border-marine cursor-pointer flex flex-col items-center justify-center text-gris-texte hover:text-marine transition-colors">
          <input
            type="file"
            accept={config_formats_accept()}
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 size={22} className="animate-spin mb-2" />
          ) : (
            <Upload size={22} className="mb-2" />
          )}
          <span className="text-xs font-bold">
            {uploading ? 'Upload...' : 'Choisir un fichier'}
          </span>
        </label>
      )}
    </div>
  );
}

function config_formats_accept() {
  return 'image/jpeg,image/png,image/webp,application/pdf';
}