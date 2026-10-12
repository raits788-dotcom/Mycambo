'use client';

import { useState, useEffect } from 'react';
import {
  HardDrive, Loader2, AlertTriangle, Check, Edit3, X, Save,
  Image as ImageIcon, FileText, TrendingUp, RefreshCw,
} from 'lucide-react';
import {
  getStorageSettings,
  updateStorageSetting,
  getStorageUsage,
  getStorageAlerts,
} from '@/lib/services';

const BUCKET_ICONS: Record<string, any> = {
  'business-photos': ImageIcon,
  'verification-docs': FileText,
  'partner-docs': FileText,
};

export default function StoragePage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    max_size_kb: 0,
    allowed_formats: [] as string[],
    recommended_width: 1200,
    recommended_height: 800,
    description: '',
  });

  const reload = async () => {
    setLoading(true);
    const [s, a] = await Promise.all([
      getStorageSettings(),
      getStorageAlerts(),
    ]);
    setSettings(s);
    setAlerts(a);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleCheckUsage = async () => {
    setCheckingUsage(true);
    try {
      const result = await getStorageUsage();
      setUsage(result);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setCheckingUsage(false);
    }
  };

  const handleEdit = (setting: any) => {
    setEditing(setting);
    setForm({
      max_size_kb: Math.round(setting.max_size_bytes / 1024),
      allowed_formats: setting.allowed_formats || [],
      recommended_width: setting.recommended_width || 1200,
      recommended_height: setting.recommended_height || 800,
      description: setting.description || '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateStorageSetting({
        bucket_name: editing.bucket_name,
        max_size_bytes: form.max_size_kb * 1024,
        allowed_formats: form.allowed_formats,
        recommended_width: form.recommended_width,
        recommended_height: form.recommended_height,
        description: form.description,
      });
      setEditing(null);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFormat = (fmt: string) => {
    setForm((prev) => ({
      ...prev,
      allowed_formats: prev.allowed_formats.includes(fmt)
        ? prev.allowed_formats.filter((f) => f !== fmt)
        : [...prev.allowed_formats, fmt],
    }));
  };

  const ALL_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'svg'];

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            💾 Configuration du stockage
          </h1>
          <p className="text-sm text-gris-texte">
            Gérez les limites de taille et les formats acceptés par bucket.
          </p>
        </div>
        <button
          onClick={handleCheckUsage}
          disabled={checkingUsage}
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark disabled:opacity-50"
        >
          {checkingUsage ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {checkingUsage ? 'Vérification...' : 'Vérifier l\'usage'}
        </button>
      </div>

      {/* Bloc usage global */}
      {usage && (
        <div className={`rounded-xl p-5 mb-6 border-2 ${
          parseFloat(usage.percentage) >= 95 ? 'bg-red-50 border-red-200'
          : parseFloat(usage.percentage) >= 80 ? 'bg-orange-50 border-orange-200'
          : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className={
              parseFloat(usage.percentage) >= 95 ? 'text-red-600'
              : parseFloat(usage.percentage) >= 80 ? 'text-orange-600'
              : 'text-green-600'
            } />
            <div>
              <div className="font-bold text-marine">Utilisation actuelle</div>
              <div className="text-xs text-gris-texte">
                {usage.total_size_mb} MB · {usage.file_count} fichiers
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-3xl font-extrabold ${
                parseFloat(usage.percentage) >= 95 ? 'text-red-600'
                : parseFloat(usage.percentage) >= 80 ? 'text-orange-600'
                : 'text-green-600'
              }`}>
                {usage.percentage}%
              </div>
              <div className="text-xs text-gris-texte">de 1 GB (Supabase Free)</div>
            </div>
          </div>

          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                parseFloat(usage.percentage) >= 95 ? 'bg-red-500'
                : parseFloat(usage.percentage) >= 80 ? 'bg-orange-500'
                : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, parseFloat(usage.percentage))}%` }}
            />
          </div>

          {parseFloat(usage.percentage) >= 80 && (
            <div className="mt-3 text-xs text-orange-800 flex items-center gap-2">
              <AlertTriangle size={12} />
              Vous approchez de la limite Supabase. Pensez à migrer vers Cloudflare R2 (10 GB gratuits).
            </div>
          )}
        </div>
      )}

      {/* Liste des buckets */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
            <Loader2 size={24} className="text-marine animate-spin mx-auto" />
          </div>
        ) : (
          settings.map((s) => {
            const Icon = BUCKET_ICONS[s.bucket_name] || HardDrive;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-12 h-12 rounded-xl bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="font-bold text-marine mb-1 font-mono text-sm">
                      {s.bucket_name}
                    </div>
                    <div className="text-xs text-gris-texte mb-2">
                      {s.description || 'Pas de description'}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs">
                      <span className="flex items-center gap-1 text-gris-texte">
                        <HardDrive size={11} />
                        Taille max : <b className="text-marine">{(s.max_size_bytes / 1024).toFixed(0)} KB</b>
                      </span>
                      <span className="flex items-center gap-1 text-gris-texte">
                        Formats : <b className="text-marine">{(s.allowed_formats || []).join(', ').toUpperCase()}</b>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(s)}
                    className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-xs px-4 py-2 rounded-full hover:border-marine"
                  >
                    <Edit3 size={12} /> Modifier
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Historique des alertes */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne">
            <h2 className="font-bold text-marine">Historique des alertes</h2>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {alerts.map((a) => (
              <li key={a.id} className="px-6 py-3 flex items-center gap-4">
                <AlertTriangle size={16} className={a.threshold === 95 ? 'text-red-500' : 'text-orange-500'} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-marine">
                    Seuil {a.threshold}% atteint · {a.percentage}%
                  </div>
                  <div className="text-xs text-gris-texte">
                    {new Date(a.notified_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modale édition */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-marine">Modifier la config</h2>
                <p className="text-xs text-gris-texte font-mono">{editing.bucket_name}</p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  Taille max (KB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10240"
                  value={form.max_size_kb}
                  onChange={(e) => setForm({ ...form, max_size_kb: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
                <div className="text-[10px] text-gris-doux mt-1">
                  Recommandé : 512 KB · Max conseillé : 5 MB (5120 KB)
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  Formats acceptés
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_FORMATS.map((fmt) => {
                    const active = form.allowed_formats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => toggleFormat(fmt)}
                        className={
                          'px-3 py-1.5 rounded-full text-xs font-bold transition-all ' +
                          (active
                            ? 'bg-marine text-white'
                            : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
                        }
                      >
                        {active && '✓ '}
                        {fmt.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                    Largeur recommandée (px)
                  </label>
                  <input
                    type="number"
                    value={form.recommended_width}
                    onChange={(e) => setForm({ ...form, recommended_width: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                    Hauteur recommandée (px)
                  </label>
                  <input
                    type="number"
                    value={form.recommended_height}
                    onChange={(e) => setForm({ ...form, recommended_height: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gris-ligne">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-marine text-white font-bold rounded-full px-5 py-2.5 hover:bg-marine-dark disabled:opacity-50 text-sm"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}