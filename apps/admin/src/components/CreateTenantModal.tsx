'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createTenant, getPlans } from '@/lib/services';

export default function CreateTenantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', address: '', plan_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getPlans().then(setPlans); }, []);

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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-marine">Nouveau tenant</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Nom *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Téléphone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Ville</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Adresse</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Formule</label>
          <select value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne">
            <option value="">— Aucune —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.price_monthly} $)</option>
            ))}
          </select>
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Création...' : 'Créer le tenant'}
        </button>
      </form>
    </div>
  );
}