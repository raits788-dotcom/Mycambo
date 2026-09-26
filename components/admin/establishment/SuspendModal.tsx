'use client';

import { useState } from 'react';
import { X, Pause, AlertCircle, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SUSPENSION_REASONS,
  addSuspension,
  type SuspensionReason,
} from '@/lib/suspensions';
import { getCurrentAdmin } from '@/lib/admin-mock';

interface SuspendModalProps {
  establishmentSlug: string;
  establishmentName: string;
  establishmentCity: string;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function SuspendModal({
  establishmentSlug,
  establishmentName,
  establishmentCity,
  onClose,
  onConfirmed,
}: SuspendModalProps) {
  const [reason, setReason] = useState<SuspensionReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [detail, setDetail] = useState('');
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const admin = getCurrentAdmin();
  const isOther = reason === 'other';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason) {
      setError('Veuillez sélectionner un type de non-conformité.');
      return;
    }
    if (isOther && customReason.trim().length < 10) {
      setError('Précisez le motif (10 caractères minimum).');
      return;
    }
    if (detail.trim().length < 30) {
      setError(
        'L\'explication détaillée doit contenir au moins 30 caractères.'
      );
      return;
    }

    setSubmitting(true);

    addSuspension({
      establishmentSlug,
      establishmentName,
      reason,
      customReason: isOther ? customReason.trim() : undefined,
      detail: detail.trim(),
      suspendedBy: admin?.name || 'Admin',
      tenantNotified: notify,
    });

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

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Pause size={32} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-3">
              Fiche suspendue
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              <b className="text-marine">{establishmentName}</b> a été retiré du
              site public.
              {notify && (
                <>
                  <br />
                  Le tenant a été notifié par email.
                </>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            {/* En-tête */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Pause size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-marine mb-1">
                  Suspendre cette fiche
                </h3>
                <p className="text-sm text-gris-texte">
                  L&apos;établissement sera retiré du site public
                  immédiatement.
                </p>
              </div>
            </div>

            {/* Établissement */}
            <div className="bg-gris-fond rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gris-ligne flex items-center justify-center text-2xl">
                🏫
              </div>
              <div>
                <div className="font-bold text-marine">
                  {establishmentName}
                </div>
                <div className="text-xs text-gris-texte">
                  {establishmentCity}
                </div>
              </div>
            </div>

            {/* Type de non-conformité */}
            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Type de non-conformité *
            </label>
            <div className="space-y-2 mb-5">
              {(Object.keys(SUSPENSION_REASONS) as SuspensionReason[]).map(
                (key) => {
                  const r = SUSPENSION_REASONS[key];
                  const isSelected = reason === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReason(key)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-lg border transition-all',
                        isSelected
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                          : 'border-gris-ligne hover:border-orange-300'
                      )}
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

            {/* Custom reason */}
            {isOther && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Précisez le motif *
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Ex : Fiche usurpant l'identité d'un tiers"
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Explication détaillée */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Explication détaillée *
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Décrivez précisément le problème constaté (30 caractères minimum)..."
                rows={4}
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-orange-500 focus:outline-none transition-colors resize-none"
              />
              <div className="text-[10px] text-gris-doux mt-1 text-right">
                {detail.length} caractères
              </div>
            </div>

            {/* Notification */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-marine"
                />
                <div>
                  <div className="font-bold text-sm text-marine">
                    Notifier le tenant par email
                  </div>
                  <div className="text-xs text-gris-texte leading-relaxed mt-1">
                    Un email sera envoyé au tenant avec le motif de la
                    suspension et les étapes pour corriger.
                  </div>
                </div>
              </label>
            </div>

            {/* Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 flex items-start gap-2">
              <Info size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800 leading-relaxed">
                La fiche reste <b>visible en interne</b> mais est retirée du
                site public. Le tenant peut corriger et demander la
                réactivation.
              </p>
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
                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold rounded-full py-3 hover:bg-orange-600 transition-colors text-sm disabled:opacity-60"
              >
                {submitting ? (
                  'Suspension...'
                ) : (
                  <>
                    <Pause size={14} />
                    Suspendre la fiche
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