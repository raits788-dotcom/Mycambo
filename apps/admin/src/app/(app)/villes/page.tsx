'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getAllCitiesAdmin, createCity, updateCity, deleteCity } from '@/lib/services';

interface City {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  position: number;
  is_active: boolean;
  count: number;
}

export default function VillesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editProvince, setEditProvince] = useState('');

  const reload = async () => {
    setLoading(true);
    setCities((await getAllCitiesAdmin()) as City[]);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createCity(newName.trim(), newProvince.trim());
      setNewName(''); setNewProvince('');
      await reload();
    } catch (e) { alert('Erreur : ' + (e as Error).message); }
    setSaving(false);
  };

  const startEdit = (c: City) => { setEditId(c.id); setEditName(c.name); setEditProvince(c.province || ''); };
  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateCity(editId, { name: editName.trim(), province: editProvince.trim() });
      setEditId(null);
      await reload();
    } catch (e) { alert('Erreur : ' + (e as Error).message); }
  };

  const toggleActive = async (c: City) => {
    await updateCity(c.id, { is_active: !c.is_active });
    await reload();
  };

  const remove = async (c: City) => {
    if (c.count > 0) {
      alert(`Impossible de supprimer : ${c.count} établissement(s) utilisent cette ville. Désactivez-la plutôt.`);
      return;
    }
    if (!confirm(`Supprimer définitivement « ${c.name} » ?`)) return;
    try { await deleteCity(c.id); await reload(); }
    catch (e) { alert('Erreur : ' + (e as Error).message); }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={20} className="text-marine" />
        <h1 className="text-xl font-extrabold text-marine">Villes &amp; provinces</h1>
      </div>
      <p className="text-sm text-gris-texte mb-6">
        La liste utilisée dans les filtres et le formulaire de demande. Désactivez une ville pour la retirer sans la supprimer.
      </p>

      {/* Ajout */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-6 flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Nom de la ville</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex : Battambang"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[10px] font-bold text-gris-texte uppercase mb-1">Province (optionnel)</label>
          <input value={newProvince} onChange={(e) => setNewProvince(e.target.value)} placeholder="Ex : Battambang"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
        </div>
        <button onClick={add} disabled={saving || !newName.trim()}
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-4 py-2 rounded-lg hover:bg-marine-dark disabled:opacity-50 text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Ajouter
        </button>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gris-doux"><Loader2 size={20} className="animate-spin inline" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-gris-doux border-b border-gris-ligne">
                <th className="text-left px-4 py-3">Ville</th>
                <th className="text-left px-4 py-3">Province</th>
                <th className="text-left px-4 py-3">Établissements</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id} className="border-b border-gris-ligne last:border-0">
                  {editId === c.id ? (
                    <>
                      <td className="px-4 py-2"><input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm rounded border border-gris-ligne focus:border-marine focus:outline-none" /></td>
                      <td className="px-4 py-2"><input value={editProvince} onChange={(e) => setEditProvince(e.target.value)}
                        className="w-full px-2 py-1 text-sm rounded border border-gris-ligne focus:border-marine focus:outline-none" /></td>
                      <td className="px-4 py-2 text-gris-doux">{c.count}</td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2 text-right">
                        <button onClick={saveEdit} className="text-green-600 p-1" title="Enregistrer"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-gris-doux p-1" title="Annuler"><X size={16} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-bold text-marine">{c.name}</td>
                      <td className="px-4 py-3 text-gris-texte">{c.province || '—'}</td>
                      <td className="px-4 py-3 text-gris-texte">{c.count}</td>
                      <td className="px-4 py-3">
                        <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                          (c.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-doux')}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(c)} className="text-marine hover:underline text-xs font-bold mr-2">Éditer</button>
                        <button onClick={() => toggleActive(c)} className="text-gris-texte p-1" title={c.is_active ? 'Désactiver' : 'Activer'}>
                          {c.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => remove(c)} className="text-red-500 p-1" title="Supprimer"><Trash2 size={15} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
