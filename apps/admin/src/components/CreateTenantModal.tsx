'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createTenant, getPlans } from '@/lib/services';

// Valeurs autorisées par la contrainte SQL check_tenant_structure_type
const STRUCTURE_TYPES = [
  { value: 'commercial', label: 'Commerce' },
  { value: 'company', label: 'Entreprise' },
  { value: 'association', label: 'Association' },
  { value: 'ngo', label: 'ONG' },
  { value: 'individual', label: 'Individuel' },
  { value: 'public', label: 'Public' },
  { value: 'school', label: 'École' },
  { value: 'temple', label: 'Temple' },
] as const;

type StructureType = (typeof STRUCTURE_TYPES)[number]['value'];

export default function CreateTenantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    description: '',
    structure_type: 'commercial' as StructureType,
    plan_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTenant({
        ...form,
        plan_id: form.plan_id || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between sticky top-0 bg-white pb-3 border-b border-gris-ligne z-10">
          <h2 className="text-lg font-extrabold text-marine">Nouveau tenant</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── TYPE DE STRUCTURE ─── */}
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
            Type de structure *
          </label>
          <select
            required
            value={form.structure_type}
            onChange={(e) =>
              setForm({ ...form, structure_type: e.target.value as StructureType })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            {STRUCTURE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* ─── INFORMATIONS GÉNÉRALES ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
              Nom *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="Ex : Hôtel Angkor"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="contact@exemple.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
              Téléphone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="+855 ..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
              Ville
            </label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="Phnom Penh"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
            Adresse
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="Street 123, Sangkat..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
            placeholder="En une phrase, présentez l'établissement..."
          />
        </div>

        {/* ─── FORMULE ─── */}
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
            Formule initiale
          </label>
          <select
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            <option value="">— Aucune —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.price_monthly} $)
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gris-doux mt-1">
            La formule peut être modifiée plus tard depuis la fiche du tenant.
          </p>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Création...' : 'Créer le tenant'}
          </button>
        </div>
      </form>
    </div>
  );
}