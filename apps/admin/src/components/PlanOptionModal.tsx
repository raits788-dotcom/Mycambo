'use client';

import { useState } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { createPlanOption, updatePlanOption, type PlanOption } from '@/lib/services';

// Modale d'ajout / édition d'une option réglable du catalogue de formules.
// Les options "système" (is_system) ne sont pas modifiables en profondeur :
// on ne permet d'éditer que le libellé, la description et la valeur par défaut.
export default function PlanOptionModal({
  option, onClose, onSaved,
}: {
  option?: PlanOption | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!option;
  const isSystem = !!option?.is_system;

  const [form, setForm] = useState({
    code: option?.code || '',
    label: option?.label || '',
    description: option?.description || '',
    emoji: option?.emoji || '',
    group_label: option?.group_label || 'Général',
    permission_key: option?.permission_key || '',
    control_type: (option?.control_type || 'toggle') as 'toggle' | 'number' | 'select',
    unit: option?.unit || '',
    min_value: option?.min_value ?? 0,
    max_value: option?.max_value ?? 999,
    linked_toggle: option?.linked_toggle || '',
    default_bool: option?.default_value === true,
    default_number: typeof option?.default_value === 'number' ? option.default_value : 0,
    default_select: typeof option?.default_value === 'string' ? option.default_value : '',
  });
  const [selectOptions, setSelectOptions] = useState<{ value: string; label: string }[]>(
    option?.options?.length ? option.options : [{ value: '', label: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const defaultValue = () => {
    if (form.control_type === 'toggle') return form.default_bool;
    if (form.control_type === 'number') return Number(form.default_number);
    return form.default_select;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        // Système : seulement champs "doux". Custom : tout sauf code/permission_key.
        await updatePlanOption(option!.id, {
          label: form.label,
          description: form.description,
          emoji: form.emoji,
          group_label: form.group_label,
          ...(isSystem ? {} : {
            unit: form.unit,
            min_value: form.control_type === 'number' ? Number(form.min_value) : null,
            max_value: form.control_type === 'number' ? Number(form.max_value) : null,
            options: form.control_type === 'select'
              ? selectOptions.filter((o) => o.value.trim())
              : [],
          }),
          default_value: defaultValue(),
        });
      } else {
        if (!form.code.trim() || !form.permission_key.trim()) {
          throw new Error('Le code et la clé de permission sont obligatoires.');
        }
        await createPlanOption({
          code: form.code.trim(),
          label: form.label,
          description: form.description || undefined,
          emoji: form.emoji || undefined,
          group_label: form.group_label,
          permission_key: form.permission_key.trim(),
          control_type: form.control_type,
          unit: form.unit || undefined,
          options: form.control_type === 'select'
            ? selectOptions.filter((o) => o.value.trim())
            : [],
          default_value: defaultValue(),
          min_value: form.control_type === 'number' ? Number(form.min_value) : null,
          max_value: form.control_type === 'number' ? Number(form.max_value) : null,
          linked_toggle: form.linked_toggle || null,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-marine">
            {isEdit ? 'Modifier l’option' : 'Nouvelle option réglable'}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {isSystem && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            Option système : le code, la clé de permission et le type de contrôle sont verrouillés.
            Vous pouvez ajuster le libellé, la description et la valeur par défaut.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Libellé *</label>
            <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Emoji</label>
            <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🖼️" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Groupe</label>
            <input value={form.group_label} onChange={(e) => setForm({ ...form, group_label: e.target.value })} placeholder="Médias, Visibilité…" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Code technique {isEdit ? '' : '*'}</label>
            <input required={!isEdit} disabled={isEdit} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: podcasts" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne disabled:bg-gris-fond font-mono" />
          </div>
        </div>

        {!isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Clé de permission *</label>
              <input required value={form.permission_key} onChange={(e) => setForm({ ...form, permission_key: e.target.value })} placeholder="ex: canShowPodcasts" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Type de contrôle</label>
              <select value={form.control_type} onChange={(e) => setForm({ ...form, control_type: e.target.value as any })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-white">
                <option value="toggle">Interrupteur (oui/non)</option>
                <option value="number">Nombre (ex. quantité max)</option>
                <option value="select">Menu déroulant</option>
              </select>
            </div>
          </div>
        )}

        {/* Réglages selon le type */}
        {form.control_type === 'toggle' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.default_bool} onChange={(e) => setForm({ ...form, default_bool: e.target.checked })} className="accent-marine" />
            Activé par défaut
          </label>
        )}

        {form.control_type === 'number' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Défaut</label>
              <input type="number" value={form.default_number} onChange={(e) => setForm({ ...form, default_number: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Min</label>
              <input type="number" disabled={isSystem} value={form.min_value} onChange={(e) => setForm({ ...form, min_value: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne disabled:bg-gris-fond" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Max</label>
              <input type="number" disabled={isSystem} value={form.max_value} onChange={(e) => setForm({ ...form, max_value: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne disabled:bg-gris-fond" />
            </div>
          </div>
        )}

        {form.control_type === 'select' && (
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">Choix du menu</label>
            <div className="space-y-2">
              {selectOptions.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input disabled={isSystem} value={o.value} onChange={(e) => { const n = [...selectOptions]; n[i] = { ...n[i], value: e.target.value }; setSelectOptions(n); }} placeholder="valeur" className="w-1/3 px-2 py-1.5 text-sm rounded-lg border border-gris-ligne font-mono disabled:bg-gris-fond" />
                  <input disabled={isSystem} value={o.label} onChange={(e) => { const n = [...selectOptions]; n[i] = { ...n[i], label: e.target.value }; setSelectOptions(n); }} placeholder="libellé affiché" className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gris-ligne disabled:bg-gris-fond" />
                  {!isSystem && (
                    <button type="button" onClick={() => setSelectOptions(selectOptions.filter((_, x) => x !== i))} className="text-red-500 px-2"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {!isSystem && (
              <button type="button" onClick={() => setSelectOptions([...selectOptions, { value: '', label: '' }])} className="mt-2 text-xs font-bold text-marine flex items-center gap-1">
                <Plus size={13} /> Ajouter un choix
              </button>
            )}
            <div className="mt-3">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Choix par défaut</label>
              <input value={form.default_select} onChange={(e) => setForm({ ...form, default_select: e.target.value })} placeholder="valeur par défaut" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne font-mono" />
            </div>
          </div>
        )}

        {!isEdit && (form.control_type === 'number' || form.control_type === 'select') && (
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
              Interrupteur lié (optionnel)
            </label>
            <input value={form.linked_toggle} onChange={(e) => setForm({ ...form, linked_toggle: e.target.value })} placeholder="ex: canShowPhotos (passe à vrai si > 0)" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne font-mono" />
          </div>
        )}

        {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <button type="submit" disabled={saving} className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l’option'}
        </button>
      </form>
    </div>
  );
}
