'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, X, Check, GripVertical,
} from 'lucide-react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from '@/lib/services';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  is_active: boolean;
  parent_id: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    icon: '🏷️',
    color: '#1B3A6B',
    position: 99,
  });
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditing(category);
      setForm({
        name: category.name,
        icon: category.icon,
        color: category.color,
        position: category.position,
      });
    } else {
      setEditing(null);
      setForm({ name: '', icon: '🏷️', color: '#1B3A6B', position: 99 });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing('save');
    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }
      setShowModal(false);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) return;
    setProcessing(category.id);
    try {
      await deleteCategory(category.id);
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleActive = async (category: Category) => {
    setProcessing(category.id);
    try {
      await updateCategory(category.id, { is_active: !category.is_active });
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Catégories
          </h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : `${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark"
        >
          <Plus size={15} /> Nouvelle catégorie
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
            <p className="text-sm text-gris-texte">Chargement...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gris-texte text-sm">
            Aucune catégorie. Cliquez sur &quot;Nouvelle catégorie&quot; pour en créer une.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold w-12"></th>
                <th className="text-left px-3 py-3 font-bold">Icône</th>
                <th className="text-left px-3 py-3 font-bold">Nom</th>
                <th className="text-left px-3 py-3 font-bold">Couleur</th>
                <th className="text-left px-3 py-3 font-bold">Position</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gris-fond/50">
                  <td className="px-5 py-4 text-gris-doux"><GripVertical size={14} /></td>
                  <td className="px-3 py-4">
                    <span className="text-2xl">{cat.icon}</span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-bold text-marine">{cat.name}</div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-gris-ligne"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-mono text-gris-texte">{cat.color}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{cat.position}</td>
                  <td className="px-3 py-4">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      disabled={processing === cat.id}
                      className={
                        'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ' +
                        (cat.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
                      }
                    >
                      {cat.is_active ? '✓ Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={processing === cat.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50"
                        title="Supprimer"
                      >
                        {processing === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-marine">
                {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                    Icône *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2 text-2xl text-center rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                    maxLength={2}
                    placeholder="🏷️"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                    placeholder="Ex: Cafés"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                    Couleur *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gris-ligne cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                  <p className="text-[10px] text-gris-doux mt-1">
                    Plus petit = affiché en premier
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing === 'save'}
                  className="flex-1 bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing === 'save' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {processing === 'save' ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}