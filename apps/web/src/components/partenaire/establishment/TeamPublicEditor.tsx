'use client';

import { useRef, useState } from 'react';
import { Users, Plus, Trash2, Loader2, Camera } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';
import { uploadPhoto } from '@/lib/upload-photo';

interface Props {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type Member = { name: string; role: string; photo_url?: string };

export default function TeamPublicEditor({ establishment, onUpdate }: Props) {
  const initial: Member[] = Array.isArray((establishment as any).public_team)
    ? ((establishment as any).public_team as Member[])
    : [];
  const [items, setItems] = useState<Member[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const add = () => setItems((p) => [...p, { name: '', role: '', photo_url: '' }]);
  const remove = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const change = (i: number, field: keyof Member, v: string) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: v } : it)));

  const handlePhoto = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const url = await uploadPhoto(establishment.id, file, 'team');
      change(i, 'photo_url', url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = items.filter((it) => it.name.trim() && it.role.trim());
      await updateEstablishment(establishment.id, {
        // @ts-ignore — colonne jsonb public_team
        public_team: clean,
      });
      setItems(clean);
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Erreur lors de l'enregistrement : " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Users size={18} className="text-marine" />
        <h2 className="font-extrabold text-marine text-base">Notre équipe</h2>
      </div>
      <p className="text-xs text-gris-texte mb-4">
        Présentez les personnes de votre association (nom, rôle, photo).
        Affiché publiquement. Laissez vide pour masquer l&apos;onglet.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={i} className="border border-gris-ligne rounded-xl p-3 flex gap-3">
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => fileRefs.current[i]?.click()}
                className="w-14 h-14 rounded-full bg-gris-fond flex items-center justify-center overflow-hidden relative"
                title="Changer la photo"
              >
                {uploadingIdx === i ? (
                  <Loader2 size={18} className="animate-spin text-marine" />
                ) : it.photo_url ? (
                  <img src={it.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={18} className="text-gris-doux" />
                )}
              </button>
              <input
                ref={(el) => { fileRefs.current[i] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(i, f);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <input
                value={it.name}
                onChange={(e) => change(i, 'name', e.target.value)}
                placeholder="Nom"
                className="w-full px-2.5 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
              <input
                value={it.role}
                onChange={(e) => change(i, 'role', e.target.value)}
                placeholder="Rôle (ex. Présidente)"
                className="w-full px-2.5 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
            </div>
            <button
              onClick={() => remove(i)}
              className="text-gris-doux hover:text-red-500 p-1 self-start"
              title="Retirer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-marine hover:text-marine-dark"
      >
        <Plus size={14} /> Ajouter un membre
      </button>

      <div className="pt-4 mt-4 flex justify-end border-t border-gris-ligne">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Enregistrement…
            </>
          ) : saved ? (
            <>
              <i className="fas fa-check" /> Enregistré
            </>
          ) : (
            <>
              <i className="fas fa-save" /> Enregistrer l&apos;équipe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
