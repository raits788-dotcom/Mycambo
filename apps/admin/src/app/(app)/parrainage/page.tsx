'use client';

import { useState, useEffect } from 'react';
import {
  Gift, Settings, ListChecks, Loader2, Plus, Edit3, Trash2, Save,
} from 'lucide-react';
import {
  getReferralSettings, updateReferralSettings,
  getReferralTiers, createReferralTier, updateReferralTier, deleteReferralTier,
  getReferrals, getReferralsStats,
} from '@/lib/services';

type TabId = 'overview' | 'tiers' | 'settings';

export default function ParrainagePage() {
  const [tab, setTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, qualified: 0, cancelled: 0 });
  const [tiers, setTiers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ enabled: true, referee_discount_percent: 10 });
  const [editingTier, setEditingTier] = useState<any>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const reload = async () => {
    setLoading(true);
    const [r, s, t, conf] = await Promise.all([
      getReferrals(),
      getReferralsStats(),
      getReferralTiers(),
      getReferralSettings(),
    ]);
    setReferrals(r);
    setStats(s);
    setTiers(t);
    setSettings(conf);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateReferralSettings({
        enabled: settings.enabled,
        referee_discount_percent: Number(settings.referee_discount_percent),
      });
      setSavedMsg('Paramètres enregistrés');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteTier = async (tier: any) => {
    if (!confirm(`Supprimer le palier "${tier.referrals_required} filleuls" ?`)) return;
    try {
      await deleteReferralTier(tier.id);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Parrainage
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez le programme de parrainage et les récompenses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button
          onClick={() => setTab('overview')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'overview' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Gift size={14} /> Vue d&apos;ensemble
        </button>
        <button
          onClick={() => setTab('tiers')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'tiers' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <ListChecks size={14} /> Paliers
        </button>
        <button
          onClick={() => setTab('settings')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' +
            (tab === 'settings' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')
          }
        >
          <Settings size={14} /> Configuration
        </button>
      </div>

      {/* ─── ONGLET VUE D'ENSEMBLE ─── */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="text-xs text-gris-texte mb-2">Total parrainages</div>
              <div className="text-3xl font-extrabold text-marine">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="text-xs text-gris-texte mb-2">En attente</div>
              <div className="text-3xl font-extrabold text-orange-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="text-xs text-gris-texte mb-2">Qualifiés</div>
              <div className="text-3xl font-extrabold text-green-600">{stats.qualified}</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="text-xs text-gris-texte mb-2">Annulés</div>
              <div className="text-3xl font-extrabold text-red-600">{stats.cancelled}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
            <div className="px-6 py-4 border-b border-gris-ligne">
              <h2 className="font-bold text-marine">Historique des parrainages</h2>
            </div>
            {loading ? (
              <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center text-gris-texte text-sm">Aucun parrainage pour l&apos;instant.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Parrain</th>
                    <th className="text-left px-3 py-3 font-bold">Filleul</th>
                    <th className="text-left px-3 py-3 font-bold">Code</th>
                    <th className="text-left px-3 py-3 font-bold">Statut</th>
                    <th className="text-left px-3 py-3 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-ligne">
                  {referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-gris-fond/50">
                      <td className="px-5 py-3 font-bold text-marine">{r.referrer?.name || '—'}</td>
                      <td className="px-3 py-3 text-gris-texte">{r.referred?.name || '—'}</td>
                      <td className="px-3 py-3 text-xs font-mono text-gris-texte">{r.code}</td>
                      <td className="px-3 py-3">
                        <span className={
                          'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                          (r.status === 'pending' ? 'bg-orange-100 text-orange-700'
                            : r.status === 'qualified' ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700')
                        }>
                          {r.status === 'pending' ? 'En attente' : r.status === 'qualified' ? 'Qualifié' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gris-texte">
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ─── ONGLET PALIERS ─── */}
      {tab === 'tiers' && (
        <>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => { setEditingTier(null); setShowTierModal(true); }}
              className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
            >
              <Plus size={15} /> Nouveau palier
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
            {loading ? (
              <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3 font-bold">Ordre</th>
                    <th className="text-left px-3 py-3 font-bold">Filleuls requis</th>
                    <th className="text-left px-3 py-3 font-bold">Récompense</th>
                    <th className="text-left px-3 py-3 font-bold">Badge</th>
                    <th className="text-left px-3 py-3 font-bold">Statut</th>
                    <th className="text-right px-5 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-ligne">
                  {tiers.map((t) => (
                    <tr key={t.id} className="hover:bg-gris-fond/50">
                      <td className="px-5 py-3 font-bold text-marine">{t.tier_order}</td>
                      <td className="px-3 py-3 text-gris-texte">{t.referrals_required}</td>
                      <td className="px-3 py-3 font-bold text-marine">
                        {t.reward_type === 'discount_percent'
                          ? `-${t.reward_value}% sur prochaine facture`
                          : `${t.reward_value} mois offerts`}
                      </td>
                      <td className="px-3 py-3">
                        {t.badge_name ? (
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: t.badge_color || '#666' }}
                          >
                            {t.badge_name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={
                          'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                          (t.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')
                        }>
                          {t.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingTier(t); setShowTierModal(true); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTier(t)}
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

      {/* ─── ONGLET CONFIGURATION ─── */}
      {tab === 'settings' && (
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm max-w-2xl space-y-5">
          <h2 className="font-bold text-marine mb-2">Configuration du parrainage</h2>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-gris-ligne cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="font-bold text-sm text-marine">Parrainage activé</div>
              <div className="text-xs text-gris-texte">Autoriser les partenaires à parrainer d&apos;autres partenaires</div>
            </div>
          </label>

          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Remise filleul (% sur sa 1ère facture)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.referee_discount_percent}
              onChange={(e) => setSettings({ ...settings, referee_discount_percent: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne"
            />
            <div className="text-[10px] text-gris-doux mt-1">
              Ex : 10 = le filleul a 10% de réduction sur sa première facture
            </div>
          </div>

          {savedMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              ✅ {savedMsg}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gris-ligne">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
            >
              {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {showTierModal && (
        <TierEditModal
          tier={editingTier}
          onClose={() => { setShowTierModal(false); setEditingTier(null); }}
          onSaved={reload}
        />
      )}
    </>
  );
}

// ─── Modal édition palier ─────────────────────────────────────────────────
function TierEditModal({
  tier, onClose, onSaved,
}: {
  tier?: any; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!tier;
  const [form, setForm] = useState({
    tier_order: tier?.tier_order ?? 1,
    referrals_required: tier?.referrals_required ?? 3,
    reward_type: tier?.reward_type ?? 'discount_percent',
    reward_value: tier?.reward_value ?? 10,
    badge_name: tier?.badge_name || '',
    badge_color: tier?.badge_color || '#C0C0C0',
    is_active: tier?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        tier_order: Number(form.tier_order),
        referrals_required: Number(form.referrals_required),
        reward_type: form.reward_type as 'discount_percent' | 'free_months',
        reward_value: Number(form.reward_value),
        badge_name: form.badge_name || undefined,
        badge_color: form.badge_color || undefined,
        is_active: form.is_active,
      };
      if (isEdit) await updateReferralTier(tier.id, payload);
      else await createReferralTier(payload);
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
            {isEdit ? 'Éditer le palier' : 'Nouveau palier'}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Ordre</label>
            <input type="number" min="1" value={form.tier_order} onChange={(e) => setForm({ ...form, tier_order: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Filleuls requis</label>
            <input type="number" min="1" value={form.referrals_required} onChange={(e) => setForm({ ...form, referrals_required: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Type de récompense</label>
          <select value={form.reward_type} onChange={(e) => setForm({ ...form, reward_type: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne">
            <option value="discount_percent">Remise % sur prochaine facture</option>
            <option value="free_months">Mois offerts</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
            {form.reward_type === 'discount_percent' ? 'Pourcentage de remise (%)' : 'Nombre de mois offerts'}
          </label>
          <input type="number" min="0" value={form.reward_value} onChange={(e) => setForm({ ...form, reward_value: Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Badge (optionnel)</label>
            <input value={form.badge_name} onChange={(e) => setForm({ ...form, badge_name: e.target.value })} placeholder="ex: Ambassadeur Bronze" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Couleur badge</label>
            <input type="color" value={form.badge_color} onChange={(e) => setForm({ ...form, badge_color: e.target.value })} className="w-full h-10 rounded-lg border border-gris-ligne" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Palier actif
        </label>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <button type="submit" disabled={saving} className="w-full bg-marine text-white font-bold py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le palier'}
        </button>
      </form>
    </div>
  );
}