'use client';

import { useState } from 'react';
import { X, AlertCircle, XCircle } from 'lucide-react';
import {
  REJECTION_CATEGORIES,
  type RejectionCategory,
} from '@/lib/partner-mock';

interface ReviewRefuseModalProps {
  authorName: string;
  reviewTitle: string;
  onClose: () => void;
  onSubmit: (data: {
    category: RejectionCategory;
    reason: string;
  }) => void;
}

export default function ReviewRefuseModal({
  authorName,
  reviewTitle,
  onClose,
  onSubmit,
}: ReviewRefuseModalProps) {
  const [category, setCategory] = useState<RejectionCategory | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category) {
      setError('Veuillez sélectionner une catégorie de refus.');
      return;
    }
    if (reason.trim().length < 20) {
      setError(
        'Le motif doit contenir au moins 20 caractères pour permettre à l\'équipe myCAMBO d\'évaluer votre demande.'
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ category, reason });
      setSubmitting(false);
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
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5">
            <XCircle size={26} className="text-red-500" />
          </div>

          <h3 className="text-2xl font-extrabold text-marine mb-2">
            Refuser cet avis
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed mb-2">
            Avis de <b className="text-marine">{authorName}</b>
          </p>
          <p className="text-xs text-gris-doux italic mb-6">
            &ldquo;{reviewTitle}&rdquo;
          </p>

          {/* Info importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertCircle size={14} className="text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              <b>Important :</b> votre demande de refus sera examinée par
              l&apos;équipe myCAMBO. Si le motif n&apos;est pas jugé suffisant,
              l&apos;avis sera publié.
            </p>
          </div>

          {/* Catégorie */}
          <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
            Catégorie du refus *
          </label>
          <div className="space-y-2 mb-5">
            {(Object.keys(REJECTION_CATEGORIES) as RejectionCategory[]).map(
              (key) => {
                const cat = REJECTION_CATEGORIES[key];
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-marine bg-marine/5 ring-1 ring-marine'
                        : 'border-gris-ligne hover:border-marine/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-marine mb-0.5">
                      {cat.label}
                    </div>
                    <div className="text-xs text-gris-texte">
                      {cat.description}
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* Motif détaillé */}
          <label
            htmlFor="reason"
            className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
          >
            Expliquez votre refus *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Précisez pourquoi cet avis ne doit pas être publié (20 caractères minimum)..."
            rows={4}
            required
            className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none mb-2"
          />
          <div className="text-[10px] text-gris-doux mb-4 text-right">
            {reason.length} caractères
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
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
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white font-bold rounded-full py-3 hover:bg-red-600 transition-colors text-sm disabled:opacity-60"
            >
              {submitting ? (
                'Envoi...'
              ) : (
                <>
                  <XCircle size={14} />
                  Envoyer le refus
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}