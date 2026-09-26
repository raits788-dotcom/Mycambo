'use client';

import { useState } from 'react';
import { X, Play, AlertCircle, Check } from 'lucide-react';
import { liftSuspension, type Suspension } from '@/lib/suspensions';
import { getCurrentAdmin } from '@/lib/admin-mock';

interface ReactivateModalProps {
  suspension: Suspension;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function ReactivateModal({
  suspension,
  onClose,
  onConfirmed,
}: ReactivateModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const admin = getCurrentAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (reason.trim().length < 10) {
      setError('Précisez la raison de la réactivation (10 caractères minimum).');
      return;
    }

    setSubmitting(true);

    liftSuspension(
      suspension.establishmentSlug,
      admin?.name || 'Admin',
      reason.trim()
    );

    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setTimeout(() => {
        onConfirmed();
      }, 1500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-3">
              Fiche réactivée
            </h3>
            <p className="text-sm text-gris-texte">
              <b className="text-marine">{suspension.establishmentName}</b> est à
              nouveau visible sur le site public.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Play size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-marine mb-1">
                  Réactiver la fiche
                </h3>
                <p className="text-sm text-gris-texte">
                  La fiche redeviendra visible publiquement.
                </p>
              </div>
            </div>

            {/* Récap suspension */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="text-xs text-orange-800 leading-relaxed">
                <b>Suspension actuelle :</b>
                <br />
                {suspension.reason === 'other'
                  ? suspension.customReason
                  : suspension.reason}{' '}
                — {suspension.detail}
                <br />
                <span className="text-orange-700/70">
                  Suspendu par {suspension.suspendedBy} le{' '}
                  {new Date(suspension.suspendedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Raison de réactivation */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Raison de la réactivation *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : Le tenant a corrigé le contenu signalé."
                rows={3}
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
              />
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
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold rounded-full py-3 hover:bg-green-600 transition-colors text-sm disabled:opacity-60"
              >
                {submitting ? (
                  'Réactivation...'
                ) : (
                  <>
                    <Play size={14} />
                    Réactiver la fiche
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