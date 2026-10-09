'use client';

import { useState } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { createPlan, updatePlan } from '@/lib/services';

export default function PlanEditModal({
  plan, onClose, onSaved,
}: {
  plan?: any; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!plan;
  const [form, setForm] = useState({
    name: plan?.name || '',
    price_monthly: plan?.price_monthly ?? 0,
    price_yearly: plan?.price_yearly ?? 0,
    max_businesses: plan?.max_businesses ?? 1,
    trial_days: plan?.trial_days ?? 0,
    is_active: plan?.is_active ?? true,
    features: (plan?.features as string[]) || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const updateFeature = (i: number, v: string) => {
    const f = [...form.features]; f[i] = v; setForm({ ...form, features: f });
  };
  const removeFeature = (i: number) => {
    setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        price_monthly: Number(form.price_monthly),
        price_yearly: Number(form.price_yearly) || null,
        max_businesses: Number(form.max_businesses),
        trial_days: Number(form.trial_days),
        features: form.features.filter((f) => f.trim()),
        is_active: form.is_active,
      };
      if (isEdit) await updatePlan(plan.id, payload);
      else await createPlan(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-marine">
            {isEdit ? 'Éditer la formule' : 'Nouvelle formule'}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Nom *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Prix / mois ($)</label>
            <input type="number" min="0" step="0.01" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Prix / an ($)</label>
            <input type="number" min="0" step="0.01" value={form.price_yearly} onChange={(e) => setForm({ ...form, price_yearly: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Max établissements</label>
            <input type="number" min="1" value={form.max_businesses} onChange={(e) => setForm({ ...form, max_businesses: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Jours d&apos;essai</label>
            <input type="number" min="0" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Formule active
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gris-texte uppercase">Fonctionnalités</label>
            <button type="button" onClick={addFeature} className="text-xs text-marine font-bold flex items-center gap-1 hover:underline">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {form.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  placeholder="Ex: Photos illimitées"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gris-ligne"
                />
                <button type="button" onClick={() => removeFeature(i)} className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la formule'}
        </button>
      </form>
    </div>
  );
}