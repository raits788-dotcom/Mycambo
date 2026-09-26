'use client';

import { useState } from 'react';
import { X, Trash2, AlertCircle, Info, Check } from 'lucide-react';
import {
  addDeletionRequest,
  DELETION_REASONS,
  type DeletionReason,
} from '@/lib/deletion-requests';

interface DeleteEstablishmentModalProps {
  establishmentSlug: string;
  establishmentName: string;
  establishmentStatus: string;
  isPublished: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function DeleteEstablishmentModal({
  establishmentSlug,
  establishmentName,
  isPublished,
  onClose,
  onConfirmed,
}: DeleteEstablishmentModalProps) {
  const [reason, setReason] = useState<DeletionReason>('closed');
  const [customReason, setCustomReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const isConfirmValid = confirmText.trim() === establishmentName.trim();
  const needsCustomReason = reason === 'other';
  const isCustomValid = !needsCustomReason || customReason.trim().length >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isConfirmValid) {
      setError(`Vous devez taper exactement « ${establishmentName} » pour confirmer.`);
      return;
    }

    if (!isCustomValid) {
      setError('Merci de préciser le motif (20 caractères minimum).');
      return;
    }

    if (!accept) {
      setError('Vous devez accepter les conditions.');
      return;
    }

    setSubmitting(true);

    addDeletionRequest({
      establishmentSlug,
      establishmentName,
      reason,
      customReason: needsCustomReason ? customReason.trim() : undefined,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          /* ===== Confirmation ===== */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-3">
              Demande envoyée !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6 max-w-md mx-auto">
              Votre demande de suppression de{' '}
              <b className="text-marine">{establishmentName}</b> a bien été
              transmise à l&apos;équipe myCAMBO.
              <br />
              Vous recevrez une réponse sous <b>48h ouvrées</b>.
            </p>
            <button
              onClick={onConfirmed}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ===== Formulaire ===== */
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-marine mb-1">
                  {isPublished
                    ? 'Demander la suppression'
                    : 'Supprimer cet établissement'}
                </h3>
                <p className="text-sm text-gris-texte">
                  {isPublished
                    ? 'Cette demande sera examinée par l\'équipe myCAMBO.'
                    : 'Cette action est définitive.'}
                </p>
              </div>
            </div>

            {/* Info */}
            {isPublished && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-800 leading-relaxed">
                  <b>Important :</b> une fois validée, votre établissement sera{' '}
                  <b>archivé</b> et retiré du site public. Les données seront
                  conservées pendant <b>6 mois</b> (récupérables sur demande),
                  puis définitivement supprimées.
                </div>
              </div>
            )}

            {/* Récap */}
            <div className="bg-gris-fond rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gris-ligne flex items-center justify-center text-2xl">
                🏫
              </div>
              <div>
                <div className="font-bold text-marine">{establishmentName}</div>
                <div className="text-xs text-gris-texte">
                  Vous demandez la suppression de cette fiche
                </div>
              </div>
            </div>

            {/* Motif */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Motif de la suppression *
              </label>
              <div className="space-y-2">
                {(Object.keys(DELETION_REASONS) as DeletionReason[]).map(
                  (key) => {
                    const r = DELETION_REASONS[key];
                    const isSelected = reason === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setReason(key)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-marine bg-marine/5 ring-1 ring-marine'
                            : 'border-gris-ligne hover:border-marine/50'
                        }`}
                      >
                        <div className="font-bold text-sm text-marine mb-0.5">
                          {r.label}
                        </div>
                        <div className="text-xs text-gris-texte">
                          {r.description}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Custom reason */}
            {needsCustomReason && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Précisez votre motif *
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Expliquez votre demande (20 caractères minimum)..."
                  rows={3}
                  required
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
                />
                <div className="text-[10px] text-gris-doux mt-1 text-right">
                  {customReason.length} caractères
                </div>
              </div>
            )}

            {/* Confirmation par saisie */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Tapez{' '}
                <span className="bg-gris-fond px-2 py-0.5 rounded font-mono text-marine">
                  {establishmentName}
                </span>{' '}
                pour confirmer *
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={establishmentName}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors ${
                  confirmText && !isConfirmValid
                    ? 'border-red-300'
                    : confirmText && isConfirmValid
                    ? 'border-green-500'
                    : 'border-gris-ligne focus:border-marine'
                }`}
              />
              {confirmText && !isConfirmValid && (
                <p className="text-[10px] text-red-500 mt-1">
                  Le nom ne correspond pas.
                </p>
              )}
            </div>

            {/* Acceptation */}
            <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-marine"
              />
              <span className="text-xs text-gris-texte leading-relaxed">
                Je comprends que cette demande sera examinée par myCAMBO et que
                l&apos;établissement sera{' '}
                {isPublished ? 'retiré du site public' : 'supprimé définitivement'}{' '}
                une fois validée.
              </span>
            </label>

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
                    <Trash2 size={14} />
                    {isPublished ? 'Envoyer la demande' : 'Supprimer'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}