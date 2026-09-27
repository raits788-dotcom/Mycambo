'use client';

import { useState } from 'react';
import {
  Plus,
  Package,
  Check,
  Edit3,
  Trash2,
  Power,
  Users,
  DollarSign,
  X,
  Save,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  maxBusinesses: number;
  features: string[];
  isActive: boolean;
  position: number;
}

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-decouverte',
    name: 'Découverte',
    slug: 'decouverte',
    priceMonthly: 0,
    priceYearly: 0,
    maxBusinesses: 1,
    features: ['Fiche basique', 'Sans mise en avant', 'Support email'],
    isActive: true,
    position: 1,
  },
  {
    id: 'plan-essentiel',
    name: 'Essentiel',
    slug: 'essentiel',
    priceMonthly: 15,
    priceYearly: 150,
    maxBusinesses: 1,
    features: ['Fiche complète', 'Photos illimitées', 'Horaires', '1 label', 'Support email'],
    isActive: true,
    position: 2,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    slug: 'pro',
    priceMonthly: 39,
    priceYearly: 390,
    maxBusinesses: 3,
    features: ['Tout Essentiel', '3 établissements', 'Mise en avant catégorie', 'Statistiques', 'Agenda'],
    isActive: true,
    position: 3,
  },
  {
    id: 'plan-business',
    name: 'Business',
    slug: 'business',
    priceMonthly: 79,
    priceYearly: 790,
    maxBusinesses: 10,
    features: ['Tout Pro', '10 établissements', 'Coup de cœur possible', 'Bannière', 'Priorité support'],
    isActive: true,
    position: 4,
  },
  {
    id: 'plan-entreprise',
    name: 'Entreprise',
    slug: 'entreprise',
    priceMonthly: 199,
    priceYearly: 1990,
    maxBusinesses: 999,
    features: ['Tout Business', 'Établissements illimités', 'Multi-sites', 'API', 'Account manager'],
    isActive: false,
    position: 5,
  },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleToggleActive = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer définitivement cette formule ?\n\nLes tenants actuels devront être migrés.')) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingPlan) return;
    setPlans((prev) =>
      prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    );
    setEditingPlan(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Formules d&apos;abonnement
          </h1>
          <p className="text-sm text-gris-texte">
            {plans.length} formules · {plans.filter((p) => p.isActive).length} actives
          </p>
        </div>
        <button
          onClick={() => {
            const newPlan: Plan = {
              id: 'plan-' + Date.now(),
              name: 'Nouvelle formule',
              slug: 'nouvelle-formule',
              priceMonthly: 0,
              priceYearly: 0,
              maxBusinesses: 1,
              features: [],
              isActive: false,
              position: plans.length + 1,
            };
            setEditingPlan(newPlan);
          }}
          className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors"
        >
          <Plus size={15} />
          Nouvelle formule
        </button>
      </div>

      {/* Grille de formules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={
              'bg-white rounded-xl border-2 p-6 transition-all ' +
              (plan.isActive
                ? 'border-gris-ligne hover:border-marine'
                : 'border-dashed border-gris-ligne opacity-60')
            }
          >
            {/* En-tête carte */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-marine/10 text-marine flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-marine">{plan.name}</h3>
                  <div className="text-[10px] text-gris-doux font-mono">{plan.slug}</div>
                </div>
              </div>
              <span
                className={
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ' +
                  (plan.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gris-fond text-gris-texte')
                }
              >
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Prix */}
            <div className="mb-4 pb-4 border-b border-gris-ligne">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-marine">
                  {plan.priceMonthly === 0 ? 'Gratuit' : plan.priceMonthly + ' $'}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="text-xs text-gris-texte">/ mois</span>
                )}
              </div>
              {plan.priceYearly > 0 && (
                <div className="text-xs text-gris-texte mt-1">
                  ou <span className="font-bold text-marine">{plan.priceYearly} $</span> / an
                  <span className="ml-1 text-green-600">(-17%)</span>
                </div>
              )}
            </div>

            {/* Quota */}
            <div className="flex items-center gap-2 text-xs text-gris-texte mb-4">
              <Users size={12} />
              {plan.maxBusinesses >= 999 ? 'Établissements illimités' : plan.maxBusinesses + ' établissement' + (plan.maxBusinesses > 1 ? 's' : '')}
            </div>

            {/* Features */}
            <ul className="space-y-1.5 mb-5 min-h-[120px]">
              {plan.features.length === 0 ? (
                <li className="text-xs text-gris-doux italic">Aucune fonctionnalité</li>
              ) : (
                plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gris-texte">
                    <Check size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))
              )}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gris-ligne">
              <button
                onClick={() => setEditingPlan(plan)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-marine text-white hover:bg-marine-dark transition-colors"
              >
                <Edit3 size={12} />
                Éditer
              </button>
              <button
                onClick={() => handleToggleActive(plan.id)}
                className={
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors ' +
                  (plan.isActive
                    ? 'text-orange-600 hover:bg-orange-100'
                    : 'text-green-600 hover:bg-green-100')
                }
                title={plan.isActive ? 'Désactiver' : 'Activer'}
              >
                <Power size={14} />
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal édition */}
      {editingPlan && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingPlan(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gris-ligne">
              <h2 className="text-lg font-extrabold text-marine">
                {plans.find((p) => p.id === editingPlan.id) ? 'Éditer la formule' : 'Nouvelle formule'}
              </h2>
              <button
                onClick={() => setEditingPlan(null)}
                className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center text-gris-texte"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corps */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editingPlan.slug}
                    onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                    Prix mensuel ($)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                    Prix annuel ($)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.priceYearly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                    Max établissements
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxBusinesses}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxBusinesses: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Fonctionnalités (une par ligne)
                </label>
                <textarea
                  rows={6}
                  value={editingPlan.features.join('\n')}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      features: e.target.value.split('\n').filter((f) => f.trim() !== ''),
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono"
                  placeholder="Fiche complète&#10;Photos illimitées&#10;..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingPlan.isActive}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-marine cursor-pointer">
                  Formule active (visible sur le site public)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gris-ligne bg-gris-fond">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2.5 text-sm font-bold text-gris-texte hover:text-marine transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors"
              >
                <Save size={14} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}