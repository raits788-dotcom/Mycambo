'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, Info } from 'lucide-react';
import {
  addModificationRequest,
  type ModificationField,
  MODIFICATION_FIELD_LABELS,
} from '@/lib/modification-requests';

interface ModificationRequestModalProps {
  establishmentSlug: string;
  field: ModificationField;
  oldValue: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ModificationRequestModal({
  establishmentSlug,
  field,
  oldValue,
  onClose,
  onSubmitted,
}: ModificationRequestModalProps) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fieldLabel = MODIFICATION_FIELD_LABELS[field];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newValue.trim()) {
      setError('Veuillez saisir la nouvelle valeur.');
      return;
    }
    if (newValue.trim() === oldValue.trim()) {
      setError('La nouvelle valeur est identique à l\'ancienne.');
      return;
    }
    if (reason.trim().length < 20) {
      setError(
        'Merci de fournir un motif détaillé (20 caractères minimum).'
      );
      return;
    }

    setSubmitting(true);

    addModificationRequest({
      establishmentSlug,
      field,
      fieldLabel,
      oldValue,
      newValue: newValue.trim(),
      reason: reason.trim(),
    });

    setTimeout(() => {
      setSubmitting(false);
      onSubmitted();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="w-14 h-14 rounded-full bg-ic-or/15 flex items-center justify-center mb-5">
            <Send size={24} className="text-ic-or" />
          </div>

          <h3 className="text-2xl font-extrabold text-marine mb-2">
            Demander un changement
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Champ concerné : <b className="text-marine">{fieldLabel}</b>
          </p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Valeur actuelle
              </label>
              <input
                type="text"
                value={oldValue}
                readOnly
                disabled
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm bg-gris-fond text-gris-texte cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Nouvelle valeur *
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Saisissez la nouvelle valeur..."
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Motif du changement *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez ce changement (20 caractères minimum)..."
                rows={4}
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
              />
              <div className="text-[10px] text-gris-doux mt-1 text-right">
                {reason.length} caractères
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Votre demande sera examinée par l&apos;équipe myCAMBO sous{' '}
              <b>48h ouvrées</b>. Vous recevrez une notification dès qu&apos;elle
              sera traitée.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-bold border border-gris-ligne text-marine rounded-full py-3 hover:border-marine transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-marine text-white font-bold rounded-full py-3 hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {submitting ? (
                'Envoi...'
              ) : (
                <>
                  <Send size={14} />
                  Envoyer la demande
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}