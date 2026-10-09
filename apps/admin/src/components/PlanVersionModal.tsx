'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ArrowUp, AlertTriangle } from 'lucide-react';
import {
  getPlanFeatures,
  createPlanWithVersion,
  createNewPlanVersion,
  migrateSubscriptionsToCurrentVersion,
} from '@/lib/services';

export default function PlanVersionModal({
  plan, onClose, onSaved,
}: {
  plan?: any; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!plan;
  const currentVersion = plan?.current_version;

  const [features, setFeatures] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: plan?.name || '',
    price_monthly: currentVersion?.price_monthly ?? plan?.price_monthly ?? 0,
    price_yearly: currentVersion?.price_yearly ?? plan?.price_yearly ?? 0,
    max_businesses: currentVersion?.max_businesses ?? plan?.max_businesses ?? 1,
    trial_days: currentVersion?.trial_days ?? plan?.trial_days ?? 0,
    notes: '',
    migrate: false,
  });
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(
    currentVersion?.feature_ids || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlanFeatures().then(setFeatures);
  }, []);

  const toggleFeature = (id: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const groupedFeatures = features.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  const CATEGORY_LABELS: Record<string, string> = {
    visibility: 'Visibilité',
    media: 'Médias',
    businesses: 'Établissements',
    team: 'Équipe',
    analytics: 'Statistiques',
    support: 'Support',
    integration: 'Intégrations',
    communication: 'Communication',
    general: 'Général',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await createNewPlanVersion({
          plan_id: plan.id,
          price_monthly: Number(form.price_monthly),
          price_yearly: Number(form.price_yearly) || null,
          max_businesses: Number(form.max_businesses),
          trial_days: Number(form.trial_days),
          feature_ids: selectedFeatureIds,
          notes: form.notes || undefined,
        });

        if (form.migrate) {
          await migrateSubscriptionsToCurrentVersion(plan.id);
        }
      } else {
        await createPlanWithVersion({
          name: form.name,
          price_monthly: Number(form.price_monthly),
          price_yearly: Number(form.price_yearly) || null,
          max_businesses: Number(form.max_businesses),
          trial_days: Number(form.trial_days),
          feature_ids: selectedFeatureIds,
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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 my-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-marine">
              {isEdit ? 'Nouvelle version de formule' : 'Nouvelle formule'}
            </h2>
            {isEdit && currentVersion && (
              <p className="text-xs text-gris-texte mt-1">
                Version actuelle : v{currentVersion.version} · {currentVersion.price_monthly} $
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {isEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <ArrowUp size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Créer une nouvelle version <strong>archive</strong> l&apos;actuelle.
              Les abonnements en cours <strong>gardent leur prix actuel</strong> sauf si vous cochez la migration ci-dessous.
            </p>
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Nom *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Prix / mois ($)</label>
            <input type="number" min="0" step="0.01" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Prix / an ($)</label>
            <input type="number" min="0" step="0.01" value={form.price_yearly} onChange={(e) => setForm({ ...form, price_yearly: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Max établissements</label>
            <input type="number" min="1" value={form.max_businesses} onChange={(e) => setForm({ ...form, max_businesses: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Essai (jours)</label>
            <input type="number" min="0" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        {/* Fonctionnalités */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-gris-texte uppercase">
              Fonctionnalités ({selectedFeatureIds.length} sélectionnées)
            </label>
          </div>
          <div className="max-h-80 overflow-y-auto border border-gris-ligne rounded-lg p-4 space-y-4">
            {Object.entries(groupedFeatures).map(([cat, feats]) => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-gris-texte uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                <div className="space-y-1.5">
                  {feats.map((f: any) => (
                    <label key={f.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gris-fond/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeatureIds.includes(f.id)}
                        onChange={() => toggleFeature(f.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-marine">{f.label}</div>
                        {f.description && <div className="text-xs text-gris-texte">{f.description}</div>}
                        {f.metadata?.max && (
                          <div className="text-[10px] text-gris-doux mt-0.5">Max : {f.metadata.max} {f.metadata.unit}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isEdit && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Notes de version (interne)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex : Ajout de 3 nouvelles fonctionnalités" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-orange-200 bg-orange-50 cursor-pointer">
              <input type="checkbox" checked={form.migrate} onChange={(e) => setForm({ ...form, migrate: e.target.checked })} className="mt-0.5" />
              <div>
                <div className="text-sm font-bold text-orange-800 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Migrer les abonnements existants vers cette nouvelle version
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  Tous les abonnements actifs basculeront sur le nouveau prix et les nouvelles fonctionnalités.
                </div>
              </div>
            </label>
          </div>
        )}

        {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...' : isEdit ? 'Créer la nouvelle version' : 'Créer la formule'}
        </button>
      </form>
    </div>
  );
}