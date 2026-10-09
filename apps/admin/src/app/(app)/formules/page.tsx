'use client';

import { useState, useEffect } from 'react';
import {
  Package, Check, Loader2, Plus, Edit3, Trash2, ListChecks, Power,
} from 'lucide-react';
import {
  getPlansWithCurrentVersion, deletePlan, updatePlan,
  getPlanFeatures, createPlanFeature, updatePlanFeature, deletePlanFeature,
} from '@/lib/services';
import PlanVersionModal from '@/components/PlanVersionModal';

type TabId = 'plans' | 'features';

export default function PlansPage() {
  const [tab, setTab] = useState<TabId>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  const reload = async () => {
    setLoading(true);
    const [p, f] = await Promise.all([getPlansWithCurrentVersion(), getPlanFeatures()]);
    setPlans(p);
    setFeatures(f);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleTogglePlan = async (plan: any) => {
    if (!confirm(`Voulez-vous ${plan.is_active ? 'désactiver' : 'activer'} "${plan.name}" ?`)) return;
    try {
      await updatePlan(plan.id, { is_active: !plan.is_active });
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    }
  };

  const handleDeletePlan = async (plan: any) => {
    if (!confirm(`Supprimer définitivement la formule "${plan.name}" et toutes ses versions ?`)) return;
    try {
      await deletePlan(plan.id);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    }
  };

  const handleDeleteFeature = async (feature: any) => {
    if (!confirm(`Supprimer la fonctionnalité "${feature.label}" du catalogue ?`)) return;
    try {
      await deletePlanFeature(feature.id);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Formules d&apos;abonnement
          </h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : `${plans.length} formules · ${features.length} fonctionnalités`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button
          onClick={() => setTab('plans')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'plans' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Package size={14} /> Formules
        </button>
        <button
          onClick={() => setTab('features')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'features' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <ListChecks size={14} /> Catalogue fonctionnalités
        </button>
      </div>

      {/* ─── Onglet FORMULES ─── */}
      {tab === 'plans' && (
        <>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
            >
              <Plus size={15} /> Nouvelle formule
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
              <Loader2 size={24} className="text-marine animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const v = plan.current_version;
                return (
                  <div
                    key={plan.id}
                    className={
                      'bg-white rounded-xl border-2 p-6 transition-all ' +
                      (plan.is_active ? 'border-gris-ligne hover:border-marine' : 'border-dashed border-gris-ligne opacity-60')
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-extrabold text-marine">{plan.name}</h3>
                        {v && <div className="text-[10px] text-gris-doux font-mono">v{v.version}</div>}
                      </div>
                      <span className={
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ' +
                        (plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')
                      }>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gris-ligne">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-marine">
                          {Number(v?.price_monthly ?? plan.price_monthly) === 0 ? 'Gratuit' : (v?.price_monthly ?? plan.price_monthly) + ' $'}
                        </span>
                        {Number(v?.price_monthly ?? plan.price_monthly) > 0 && <span className="text-xs text-gris-texte">/ mois</span>}
                      </div>
                      {v?.price_yearly > 0 && (
                        <div className="text-xs text-gris-texte mt-1">
                          ou <span className="font-bold text-marine">{v.price_yearly} $</span> / an
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gris-texte mb-4">
                      {(v?.max_businesses ?? plan.max_businesses) >= 999
                        ? 'Établissements illimités'
                        : `${v?.max_businesses ?? plan.max_businesses} établissement${(v?.max_businesses ?? plan.max_businesses) > 1 ? 's' : ''}`}
                    </div>

                    <ul className="space-y-1.5 mb-5 min-h-[100px]">
                      {(plan.features_details || []).length === 0 ? (
                        <li className="text-xs text-gris-doux italic">Aucune fonctionnalité</li>
                      ) : plan.features_details.slice(0, 5).map((f: any) => (
                        <li key={f.id} className="flex items-start gap-2 text-xs text-gris-texte">
                          <Check size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                          {f.label}
                        </li>
                      ))}
                      {(plan.features_details || []).length > 5 && (
                        <li className="text-xs text-gris-doux italic pl-5">
                          +{plan.features_details.length - 5} autres...
                        </li>
                      )}
                    </ul>

                    <div className="flex items-center gap-2 pt-4 border-t border-gris-ligne">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="flex-1 text-xs font-bold py-2 rounded-lg bg-marine text-white hover:bg-marine-dark flex items-center justify-center gap-1"
                      >
                        <Edit3 size={12} /> Nouvelle version
                      </button>
                      <button
                        onClick={() => handleTogglePlan(plan)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100"
                        title={plan.is_active ? 'Désactiver' : 'Activer'}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Onglet CATALOGUE ─── */}
      {tab === 'features' && (
        <>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => { setEditingFeature(null); setShowFeatureModal(true); }}
              className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
            >
              <Plus size={15} /> Nouvelle fonctionnalité
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
            {loading ? (
              <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Label</th>
                    <th className="text-left px-3 py-3 font-bold">Code</th>
                    <th className="text-left px-3 py-3 font-bold">Catégorie</th>
                    <th className="text-left px-3 py-3 font-bold">Limite</th>
                    <th className="text-left px-3 py-3 font-bold">Statut</th>
                    <th className="text-right px-5 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-ligne">
                  {features.map((f) => (
                    <tr key={f.id} className="hover:bg-gris-fond/50">
                      <td className="px-5 py-3 font-bold text-marine">{f.label}</td>
                      <td className="px-3 py-3 text-xs font-mono text-gris-texte">{f.code}</td>
                      <td className="px-3 py-3 text-xs text-gris-texte">{f.category}</td>
                      <td className="px-3 py-3 text-xs text-gris-texte">
                        {f.metadata?.max ? `${f.metadata.max} ${f.metadata.unit || ''}` : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={
                          'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                          (f.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')
                        }>
                          {f.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingFeature(f); setShowFeatureModal(true); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(f)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showCreate && (
        <PlanVersionModal onClose={() => setShowCreate(false)} onSaved={reload} />
      )}

      {editingPlan && (
        <PlanVersionModal plan={editingPlan} onClose={() => setEditingPlan(null)} onSaved={reload} />
      )}

      {showFeatureModal && (
        <FeatureEditModal
          feature={editingFeature}
          onClose={() => { setShowFeatureModal(false); setEditingFeature(null); }}
          onSaved={reload}
        />
      )}
    </>
  );
}

// ─── Modal édition feature ─────────────────────────────────────────────────
function FeatureEditModal({
  feature, onClose, onSaved,
}: {
  feature?: any; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!feature;
  const [form, setForm] = useState({
    code: feature?.code || '',
    label: feature?.label || '',
    description: feature?.description || '',
    category: feature?.category || 'general',
    max: feature?.metadata?.max ?? '',
    unit: feature?.metadata?.unit || '',
    is_active: feature?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIES = ['visibility', 'media', 'businesses', 'team', 'analytics', 'support', 'integration', 'communication', 'general'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const metadata: Record<string, unknown> = {};
      if (form.max !== '' && form.max !== null) metadata.max = Number(form.max);
      if (form.unit) metadata.unit = form.unit;

      const payload = {
        label: form.label,
        description: form.description,
        category: form.category,
        metadata,
        is_active: form.is_active,
      };

      if (isEdit) {
        await updatePlanFeature(feature.id, payload);
      } else {
        await createPlanFeature({
          code: form.code,
          label: form.label,
          description: form.description,
          category: form.category,
          metadata,
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-marine">
            {isEdit ? 'Éditer la fonctionnalité' : 'Nouvelle fonctionnalité'}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            ✕
          </button>
        </div>

        {!isEdit && (
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Code technique *</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/[^a-z0-9_]/g, '_') })} placeholder="ex: photos_unlimited" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne font-mono" />
            <div className="text-[10px] text-gris-doux mt-1">Minuscules + underscores uniquement</div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Label *</label>
          <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="ex: Photos illimitées" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Description</label>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne resize-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Catégorie *</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Limite max</label>
            <input type="number" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} placeholder="ex: 5" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Unité</label>
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ex: photos" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Fonctionnalité active
        </label>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <button type="submit" disabled={saving} className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la fonctionnalité'}
        </button>
      </form>
    </div>
  );
}