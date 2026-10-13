'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2, Lock, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
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
  const [planSlug, setPlanSlug] = useState<string>('decouverte');
  const [planName, setPlanName] = useState<string>('Découverte');
  const [maxPhotos, setMaxPhotos] = useState<number>(0);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Charge la formule du tenant
  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: tenant } = await supabase
        .from('tenants')
        .select('plan_id, plans(slug, name)')
        .eq('id', establishment.tenant_id)
        .single();

      const plan = (tenant as any)?.plans;
      if (plan) {
        setPlanSlug(plan.slug);
        setPlanName(plan.name);
        setMaxPhotos(plan.slug === 'decouverte' ? 0 : plan.slug === 'essentiel' ? 20 : 999);
      }
      setLoadingPlan(false);
    })();
  }, [establishment.tenant_id]);

  const limit = maxPhotos;
  const isLocked = planSlug === 'decouverte';
  const remaining = Math.max(0, limit - photos.length);

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
    if (isLocked) {
      setError('Vous devez passer à une formule supérieure pour ajouter des photos.');
      return;
    }
    if (photos.length >= limit) {
      setError(`Limite atteinte (${limit} photos).`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 MB.');
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

  if (loadingPlan) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Bandeau formule Découverte */}
      {isLocked && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Lock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-900 text-sm mb-1">
              📸 Vos photos sont masquées au public
            </div>
            <div className="text-xs text-amber-800 leading-relaxed">
              Vous êtes sur la formule <b>{planName}</b> qui n&apos;inclut pas les photos publiques.
              Passez à la formule <b>Essentiel</b> (19 $/mois) pour les débloquer immédiatement.
            </div>
            <Link
              href="/partenaire/formules"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline mt-2"
            >
              <Sparkles size={12} />
              Débloquer mes photos →
            </Link>
          </div>
        </div>
      )}

      {/* Info limite */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-marine">Photos de l&apos;établissement</h2>
          <p className="text-xs text-gris-texte mt-1">
            {isLocked
              ? `${photos.length} photo${photos.length > 1 ? 's' : ''} uploadée${photos.length > 1 ? 's' : ''} (masquées du public)`
              : `${photos.length} / ${limit} photos · ${remaining} restante${remaining > 1 ? 's' : ''}`}
          </p>
        </div>
        {!isLocked && (
          <span className="text-[10px] text-gris-doux">
            Formule {planName}
          </span>
        )}
      </div>

      {/* Grille photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden border border-gris-ligne group bg-gris-fond"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className={cn(
                'w-full h-full object-cover',
                isLocked && 'opacity-40 blur-sm'
              )}
            />

            {/* Overlay cadenas si formule Découverte */}
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mb-2 shadow-lg">
                  <Lock size={18} />
                </div>
                <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                  Masquée du public
                </span>
              </div>
            )}

            {/* Bouton supprimer */}
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Slot d'upload — visible si autorisé */}
        {!isLocked && photos.length < limit && (
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

        {/* Slot verrouillé si formule Découverte */}
        {isLocked && photos.length < 1 && (
          <Link
            href="/partenaire/formules"
            className="aspect-square rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Crown size={24} className="mb-2" />
            <span className="text-xs font-bold">Débloquer les photos</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          ✅ Photos enregistrées
        </div>
      )}

      {/* Bouton enregistrer */}
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