'use client';

import { useState } from 'react';
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface Props {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type Item = { year: string; text: string };

export default function HistoryEditor({ establishment, onUpdate }: Props) {
  const initial: Item[] = Array.isArray((establishment as any).history)
    ? ((establishment as any).history as Item[])
    : [];
  const [items, setItems] = useState<Item[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const add = () => setItems((p) => [...p, { year: '', text: '' }]);
  const remove = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const change = (i: number, field: keyof Item, v: string) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: v } : it)));

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = items.filter((it) => it.year.trim() && it.text.trim());
      await updateEstablishment(establishment.id, {
        // @ts-ignore — colonne jsonb history
        history: clean,
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
    <div className="mt-8 pt-6 border-t border-gris-ligne">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={18} className="text-marine" />
        <h2 className="font-extrabold text-marine text-base">Notre histoire</h2>
      </div>
      <p className="text-xs text-gris-texte mb-4">
        Frise chronologique affichée publiquement (année + événement). Laissez
        vide pour masquer l&apos;onglet.
      </p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              value={it.year}
              onChange={(e) => change(i, 'year', e.target.value)}
              placeholder="Année"
              className="w-24 px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
            />
            <textarea
              value={it.text}
              onChange={(e) => change(i, 'text', e.target.value)}
              placeholder="Ce qui s'est passé cette année-là…"
              rows={2}
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none resize-none"
            />
            <button
              onClick={() => remove(i)}
              className="text-gris-doux hover:text-red-500 p-2"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-marine hover:text-marine-dark"
      >
        <Plus size={14} /> Ajouter une étape
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
              <i className="fas fa-save" /> Enregistrer l&apos;histoire
            </>
          )}
        </button>
      </div>
    </div>
  );
}
