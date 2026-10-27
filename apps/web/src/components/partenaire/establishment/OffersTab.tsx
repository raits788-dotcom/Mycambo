'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Tag, Plus, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import {
  getOffersForBusiness,
  createOffer,
  toggleOffer,
  deleteOffer,
} from '@/lib/services';

interface OffersTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type Offer = {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
};

const EMPTY_FORM = {
  title: '',
  description: '',
  discount: '',
  valid_from: '',
  valid_to: '',
};

export default function OffersTab({ establishment, onUpdate }: OffersTabProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getOffersForBusiness(establishment.id);
      setOffers((data as Offer[]) || []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishment.id]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createOffer({
        business_id: establishment.id,
        tenant_id: establishment.tenant_id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        discount: form.discount.trim() || undefined,
        valid_from: form.valid_from || undefined,
        valid_to: form.valid_to || undefined,
      });
      setForm(EMPTY_FORM);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de créer l'offre.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (offer: Offer) => {
    try {
      await toggleOffer(offer.id, !offer.is_active);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de modifier l'offre.");
    }
  };

  const handleDelete = async (offer: Offer) => {
    if (!confirm(`Supprimer l'offre « ${offer.title} » ?`)) return;
    try {
      await deleteOffer(offer.id);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de supprimer l'offre.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-extrabold text-marine text-base mb-1">
          Offres du moment
        </h2>
        <p className="text-xs text-gris-texte">
          Créez des offres promotionnelles mises en avant sur votre fiche
          publique.
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <form
        onSubmit={handleCreate}
        className="mb-6 border border-gris-ligne rounded-xl p-5 bg-gris-fond"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
            <Tag size={18} />
          </div>
          <h3 className="font-bold text-marine text-sm">Nouvelle offre</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-marine mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Happy hour tous les vendredis"
              className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-marine mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              placeholder="Détails de l'offre..."
              className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-marine mb-1">
              Remise
            </label>
            <input
              type="text"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder='Ex : "-20%"'
              className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-marine mb-1">
                Début
              </label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) =>
                  setForm({ ...form, valid_from: e.target.value })
                }
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-marine mb-1">
                Fin
              </label>
              <input
                type="date"
                value={form.valid_to}
                onChange={(e) =>
                  setForm({ ...form, valid_to: e.target.value })
                }
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 flex justify-end border-t border-gris-ligne">
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
          >
            <Plus size={14} />
            {saving ? 'Ajout...' : "Ajouter l'offre"}
          </button>
        </div>
      </form>

      {/* Liste des offres */}
      {loading ? (
        <div className="text-center py-12 bg-gris-fond rounded-lg">
          <p className="text-sm text-gris-texte">Chargement des offres...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 bg-gris-fond rounded-lg">
          <Tag size={40} className="text-gris-ligne mx-auto mb-3" />
          <p className="text-sm text-gris-texte">
            Aucune offre pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={cn(
                'flex items-start gap-4 p-5 rounded-xl border-2 transition-all',
                offer.is_active
                  ? 'border-marine bg-marine/5'
                  : 'border-gris-ligne'
              )}
            >
              <div className="w-11 h-11 rounded-lg bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
                <Tag size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-marine text-sm">
                    {offer.title}
                  </span>
                  {offer.discount && (
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      {offer.discount}
                    </span>
                  )}
                </div>
                {offer.description && (
                  <p className="text-xs text-gris-texte mb-1">
                    {offer.description}
                  </p>
                )}
                {(offer.valid_from || offer.valid_to) && (
                  <p className="text-xs text-gris-texte">
                    {offer.valid_from && <>Du {offer.valid_from}</>}
                    {offer.valid_to && <> au {offer.valid_to}</>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Interrupteur actif/inactif */}
                <button
                  type="button"
                  onClick={() => handleToggle(offer)}
                  role="switch"
                  aria-checked={offer.is_active}
                  title={offer.is_active ? 'Désactiver' : 'Activer'}
                  className={cn(
                    'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
                    offer.is_active ? 'bg-marine' : 'bg-gris-ligne'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                      offer.is_active && 'translate-x-4'
                    )}
                  />
                </button>

                {/* Supprimer */}
                <button
                  type="button"
                  onClick={() => handleDelete(offer)}
                  title="Supprimer"
                  className="text-gris-texte hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Les offres désactivées ne sont pas visibles sur votre fiche publique.
        </p>
      </div>
    </div>
  );
}
