'use client';

import { useState } from 'react';
import { BarChart3, Plus, Trash2, Loader2 } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { updateEstablishment } from '@/lib/establishment-storage';

interface Props {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type ImpactItem = { label: string; value: string };

export default function ImpactEditor({ establishment, onUpdate }: Props) {
  const initial: ImpactItem[] = Array.isArray((establishment as any).impact)
    ? ((establishment as any).impact as ImpactItem[])
    : [];
  const [items, setItems] = useState<ImpactItem[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const add = () => setItems((p) => [...p, { label: '', value: '' }]);
  const remove = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));
  const change = (i: number, field: keyof ImpactItem, v: string) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: v } : it)));

  const handleSave = async () => {
    setSaving(true);
    try {
      // On ne garde que les lignes complètes
      const clean = items.filter(
        (it) => it.label.trim() && it.value.trim()
      );
      await updateEstablishment(establishment.id, {
        // @ts-ignore — colonne jsonb impact
        impact: clean,
      });
      setItems(clean);
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(
        "Erreur lors de l'enregistrement de l'impact : " + (e as Error).message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={18} className="text-marine" />
        <h2 className="font-extrabold text-marine text-base">
          Nos chiffres d&apos;impact
        </h2>
      </div>
      <p className="text-xs text-gris-texte mb-4">
        Affichés publiquement dans l&apos;onglet « Notre impact » de votre fiche
        (ex. « Enfants aidés » → « 120 »). Laissez vide pour masquer l&apos;onglet.
      </p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it.label}
              onChange={(e) => change(i, 'label', e.target.value)}
              placeholder="Intitulé (ex. Enfants aidés)"
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
            />
            <input
              value={it.value}
              onChange={(e) => change(i, 'value', e.target.value)}
              placeholder="Valeur (ex. 120)"
              className="w-32 px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
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
        <Plus size={14} /> Ajouter un chiffre
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
              <i className="fas fa-save" /> Enregistrer l&apos;impact
            </>
          )}
        </button>
      </div>
    </div>
  );
}
