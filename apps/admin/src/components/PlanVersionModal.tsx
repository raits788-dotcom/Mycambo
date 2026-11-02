'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ArrowUp, AlertTriangle, Save, FilePlus2 } from 'lucide-react';
import {
  getPlanOptionCatalog,
  createPlanWithVersion,
  createNewPlanVersion,
  updateCurrentPlanVersion,
  type PlanOption,
} from '@/lib/services';

// Construit l'objet `permissions` (ce que lit la fiche publique) à partir des
// valeurs réglées pour chaque option du catalogue.
function buildPermissions(
  catalog: PlanOption[],
  values: Record<string, any>
): Record<string, unknown> {
  const perms: Record<string, unknown> = {};
  for (const opt of catalog) {
    const v = values[opt.code];
    perms[opt.permission_key] = v;
    // Un toggle lié passe à vrai dès que l'option number/select est "active".
    if (opt.linked_toggle) {
      if (opt.control_type === 'number') {
        perms[opt.linked_toggle] = Number(v) > 0;
      } else if (opt.control_type === 'select') {
        perms[opt.linked_toggle] = v && v !== 'none';
      }
    }
  }
  return perms;
}

export default function PlanVersionModal({
  plan, audience, onClose, onSaved,
}: {
  plan?: any; audience?: 'business' | 'association'; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!plan;
  const currentVersion = plan?.current_version;
  const currentPerms: Record<string, any> =
    currentVersion?.permissions || plan?.permissions || {};

  const [catalog, setCatalog] = useState<PlanOption[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [form, setForm] = useState({
    name: plan?.name || '',
    price_monthly: currentVersion?.price_monthly ?? plan?.price_monthly ?? 0,
    price_yearly: currentVersion?.price_yearly ?? plan?.price_yearly ?? 0,
    max_businesses: currentVersion?.max_businesses ?? plan?.max_businesses ?? 1,
    trial_days: currentVersion?.trial_days ?? plan?.trial_days ?? 0,
    notes: '',
    migrate: false,
  });
  // Valeur réglée par option (code -> valeur).
  const [values, setValues] = useState<Record<string, any>>({});
  const [mode, setMode] = useState<'edit' | 'newversion'>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const cat = await getPlanOptionCatalog();
      setCatalog(cat);
      // Initialise chaque option : valeur courante de la formule, sinon défaut.
      const init: Record<string, any> = {};
      for (const opt of cat) {
        const cur = currentPerms[opt.permission_key];
        init[opt.code] = cur !== undefined && cur !== null ? cur : opt.default_value;
      }
      setValues(init);
      setLoadingCat(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setVal = (code: string, v: any) =>
    setValues((p) => ({ ...p, [code]: v }));

  // Regroupe les options par group_label en conservant l'ordre.
  const groups: Record<string, PlanOption[]> = {};
  for (const opt of catalog) {
    (groups[opt.group_label] = groups[opt.group_label] || []).push(opt);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const permissions = buildPermissions(catalog, values);
      if (!isEdit) {
        const newPlanId = await createPlanWithVersion({
          name: form.name,
          price_monthly: Number(form.price_monthly),
          price_yearly: Number(form.price_yearly) || null,
          max_businesses: Number(form.max_businesses),
          trial_days: Number(form.trial_days),
          feature_ids: [],
          audience: audience || 'business',
        });
        // createPlanWithVersion ne pose pas les permissions : on les applique
        // en éditant la version courante tout juste créée.
        if (newPlanId) {
          await updateCurrentPlanVersion({
            plan_id: newPlanId,
            price_monthly: Number(form.price_monthly),
            price_yearly: Number(form.price_yearly) || null,
            max_businesses: Number(form.max_businesses),
            permissions,
            features: [],
            apply_existing: false,
          });
        }
      } else if (mode === 'edit') {
        await updateCurrentPlanVersion({
          plan_id: plan.id,
          price_monthly: Number(form.price_monthly),
          price_yearly: Number(form.price_yearly) || null,
          max_businesses: Number(form.max_businesses),
          permissions,
          features: currentVersion?.features ?? plan?.features ?? [],
          apply_existing: form.migrate,
        });
      } else {
        await createNewPlanVersion({
          plan_id: plan.id,
          price_monthly: Number(form.price_monthly),
          price_yearly: Number(form.price_yearly) || null,
          max_businesses: Number(form.max_businesses),
          trial_days: Number(form.trial_days),
          permissions,
          features: currentVersion?.features ?? plan?.features ?? [],
          notes: form.notes || undefined,
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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-marine">
              {isEdit ? `Formule ${plan.name}` : 'Nouvelle formule'}
            </h2>
            {isEdit && currentVersion && (
              <p className="text-xs text-gris-texte mt-1">
                Version courante : v{currentVersion.version}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Choix du mode (édition) */}
        {isEdit && (
          <div className="flex gap-2 p-1 bg-gris-fond rounded-xl">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-colors ${
                mode === 'edit' ? 'bg-white text-marine shadow-sm' : 'text-gris-texte'
              }`}
            >
              <Save size={13} /> Modifier cette version
            </button>
            <button
              type="button"
              onClick={() => setMode('newversion')}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-colors ${
                mode === 'newversion' ? 'bg-white text-marine shadow-sm' : 'text-gris-texte'
              }`}
            >
              <FilePlus2 size={13} /> Nouvelle version
            </button>
          </div>
        )}

        {isEdit && mode === 'newversion' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <ArrowUp size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Une nouvelle version <strong>archive</strong> l&apos;actuelle. Les abonnements
              en cours gardent leur version sauf si vous cochez la migration.
            </p>
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Nom *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        )}

        {/* Base */}
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
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Max établ.</label>
            <input type="number" min="1" value={form.max_businesses} onChange={(e) => setForm({ ...form, max_businesses: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Essai (j)</label>
            <input type="number" min="0" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        {/* Options du catalogue, groupées */}
        {loadingCat ? (
          <div className="py-8 text-center"><Loader2 size={20} className="animate-spin text-marine mx-auto" /></div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groups).map(([groupLabel, opts]) => (
              <div key={groupLabel}>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-marine mb-2 pb-1 border-b border-gris-ligne">
                  {groupLabel}
                </div>
                <div className="space-y-2">
                  {opts.map((opt) => {
                    const v = values[opt.code];
                    const active =
                      opt.control_type === 'toggle' ? !!v
                      : opt.control_type === 'number' ? Number(v) > 0
                      : v && v !== 'none';
                    return (
                      <div
                        key={opt.code}
                        className={`border-2 rounded-xl p-3 transition-colors ${
                          active ? 'border-marine bg-marine/5' : 'border-gris-ligne'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {opt.control_type === 'toggle' ? (
                            <input
                              type="checkbox"
                              checked={!!v}
                              onChange={(e) => setVal(opt.code, e.target.checked)}
                              className="w-4 h-4 accent-marine"
                            />
                          ) : (
                            <span className="text-base">{opt.emoji}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-marine text-sm">
                              {opt.control_type === 'toggle' && opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
                            </div>
                            {opt.description && (
                              <div className="text-xs text-gris-doux">{opt.description}</div>
                            )}
                          </div>

                          {opt.control_type === 'number' && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={opt.min_value ?? 0}
                                max={opt.max_value ?? undefined}
                                value={v ?? 0}
                                onChange={(e) => setVal(opt.code, Number(e.target.value))}
                                className="w-20 px-2 py-1.5 text-sm rounded-lg border border-gris-ligne text-right"
                              />
                              {opt.unit && <span className="text-xs text-gris-doux">{opt.unit}</span>}
                            </div>
                          )}

                          {opt.control_type === 'select' && (
                            <select
                              value={v ?? ''}
                              onChange={(e) => setVal(opt.code, e.target.value)}
                              className="px-2 py-1.5 text-sm rounded-lg border border-gris-ligne bg-white max-w-[220px]"
                            >
                              {opt.options.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes + migration (édition) */}
        {isEdit && (
          <div className="space-y-3">
            {mode === 'newversion' && (
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Notes de version (interne)</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex : révision des quotas photos" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
              </div>
            )}

            <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-orange-200 bg-orange-50 cursor-pointer">
              <input type="checkbox" checked={form.migrate} onChange={(e) => setForm({ ...form, migrate: e.target.checked })} className="mt-0.5" />
              <div>
                <div className="text-sm font-bold text-orange-800 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Appliquer aussi aux établissements qui ont déjà cette formule
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  Sinon, seuls les nouveaux abonnés obtiennent ces réglages.
                </div>
              </div>
            </label>
          </div>
        )}

        {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <button
          type="submit"
          disabled={saving || loadingCat}
          className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...'
            : !isEdit ? 'Créer la formule'
            : mode === 'edit' ? 'Enregistrer les modifications'
            : 'Créer la nouvelle version'}
        </button>
      </form>
    </div>
  );
}
