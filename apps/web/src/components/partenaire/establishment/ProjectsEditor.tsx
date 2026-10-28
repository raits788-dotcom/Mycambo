'use client';

import { useEffect, useState } from 'react';
import { Target, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type AssociationProject,
} from '@/lib/projects';

interface Props {
  establishment: StoredEstablishment;
}

type Draft = {
  id?: string;
  title: string;
  description: string;
  goal_amount: string;
  deadline: string;
};

const EMPTY: Draft = { title: '', description: '', goal_amount: '', deadline: '' };

export default function ProjectsEditor({ establishment }: Props) {
  const [projects, setProjects] = useState<AssociationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    setProjects(await getProjects(establishment.id));
    setLoading(false);
  };

  useEffect(() => { reload(); }, [establishment.id]);

  const startCreate = () => setEditing({ ...EMPTY });
  const startEdit = (p: AssociationProject) =>
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description || '',
      goal_amount: p.goal_amount != null ? String(p.goal_amount) : '',
      deadline: p.deadline || '',
    });

  const handleSave = async () => {
    if (!editing || !editing.title.trim()) {
      alert('Le titre du projet est requis.');
      return;
    }
    setSaving(true);
    try {
      const goal = editing.goal_amount.trim()
        ? Number(editing.goal_amount)
        : null;
      if (editing.id) {
        await updateProject(editing.id, {
          title: editing.title.trim(),
          description: editing.description.trim() || null,
          goal_amount: goal,
          deadline: editing.deadline || null,
        });
      } else {
        await createProject({
          business_id: establishment.id,
          tenant_id: establishment.tenant_id,
          title: editing.title.trim(),
          description: editing.description.trim() || undefined,
          goal_amount: goal,
          deadline: editing.deadline || null,
        });
      }
      setEditing(null);
      await reload();
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: AssociationProject) => {
    if (!confirm(`Supprimer le projet « ${p.title} » ?`)) return;
    try {
      await deleteProject(p.id);
      await reload();
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gris-ligne">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-marine" />
          <h2 className="font-extrabold text-marine text-base">Nos projets</h2>
        </div>
        {!editing && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-marine text-white px-3 py-1.5 rounded-full hover:bg-marine-dark"
          >
            <Plus size={14} /> Nouveau projet
          </button>
        )}
      </div>
      <p className="text-xs text-gris-texte mb-4">
        Présentez vos projets concrets. Le public pourra faire une promesse de
        don fléchée sur chacun (aucun paiement en ligne, mise en relation).
      </p>

      {/* Formulaire création/édition */}
      {editing && (
        <div className="bg-gris-fond rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-marine text-sm">
              {editing.id ? 'Modifier le projet' : 'Nouveau projet'}
            </h3>
            <button onClick={() => setEditing(null)} className="text-gris-doux">
              <X size={16} />
            </button>
          </div>
          <input
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Titre du projet *"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
          />
          <textarea
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            placeholder="Description : objectif, bénéficiaires, usage des dons…"
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gris-texte uppercase mb-1">
                Objectif de collecte ($)
              </label>
              <input
                type="number"
                min="0"
                value={editing.goal_amount}
                onChange={(e) => setEditing({ ...editing, goal_amount: e.target.value })}
                placeholder="Ex. 5000 (optionnel)"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gris-texte uppercase mb-1">
                Échéance
              </label>
              <input
                type="date"
                value={editing.deadline}
                onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setEditing(null)}
              className="text-xs font-bold text-gris-texte px-4 py-2 rounded-full hover:bg-white"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2 rounded-full hover:bg-marine-dark disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="py-8 text-center text-gris-doux">
          <Loader2 className="animate-spin mx-auto" size={20} />
        </div>
      ) : projects.length === 0 && !editing ? (
        <div className="text-center py-8 bg-gris-fond rounded-lg text-sm text-gris-texte">
          Aucun projet pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border border-gris-ligne rounded-xl p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-marine text-sm">{p.title}</div>
                {p.description && (
                  <div className="text-xs text-gris-texte mt-1 line-clamp-2">
                    {p.description}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gris-doux">
                  {p.goal_amount != null && (
                    <span>Objectif : {p.goal_amount} {p.currency}</span>
                  )}
                  {p.deadline && (
                    <span>Échéance : {new Date(p.deadline).toLocaleDateString('fr-FR')}</span>
                  )}
                  <span className={p.status === 'active' ? 'text-green-600' : ''}>
                    {p.status === 'active' ? 'Actif' : p.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(p)}
                  className="text-gris-doux hover:text-marine p-2"
                  title="Modifier"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="text-gris-doux hover:text-red-500 p-2"
                  title="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
