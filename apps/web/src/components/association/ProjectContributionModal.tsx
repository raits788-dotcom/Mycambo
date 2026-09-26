'use client';

import { useState } from 'react';
import { X, Check, Target } from 'lucide-react';
import { submitContribution } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface ProjectContributionModalProps {
  associationSlug: string;
  associationName: string;
  projectTitle: string;
  onClose: () => void;
}

const AMOUNTS = [25, 50, 100, 250];

export default function ProjectContributionModal({
  associationSlug,
  associationName,
  projectTitle,
  onClose,
}: ProjectContributionModalProps) {
  const [amount, setAmount] = useState<number | 'custom'>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const finalAmount =
    amount === 'custom' ? Number(customAmount) || 0 : amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    submitContribution({
      association_slug: associationSlug,
      project_title: projectTitle,
      amount: finalAmount,
      name: anonymous ? 'Anonyme' : name,
      email,
      message: message || undefined,
      anonymous,
    });
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
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

        {sent ? (
          /* ===== ENVOYÉ ===== */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-ic-vert" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Merci !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre demande de contribution au projet a bien été transmise
              à {associationName}. Elle vous contactera pour finaliser.
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ===== FORMULAIRE ===== */
          <form onSubmit={handleSubmit} className="p-8">
            <div className="w-14 h-14 rounded-full bg-ic-or/15 flex items-center justify-center mb-5">
              <Target size={26} className="text-ic-or" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Contribuer au projet
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-1">
              {projectTitle}
            </p>
            <p className="text-xs text-gris-doux mb-6">
              Proposé par {associationName}
            </p>

            {/* Montant */}
            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Contribution *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-bold transition-colors',
                    amount === a
                      ? 'bg-ic-or text-marine-dark'
                      : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                  )}
                >
                  {a} $
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('custom')}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-bold transition-colors',
                  amount === 'custom'
                    ? 'bg-ic-or text-marine-dark'
                    : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                )}
              >
                Autre
              </button>
            </div>
            {amount === 'custom' && (
              <input
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Montant en $"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-5 focus:border-marine focus:outline-none"
                required
              />
            )}

            {/* Coordonnées */}
            <div className="space-y-3 mb-5 mt-5">
              {!anonymous && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom *"
                  required
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email *"
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
            </div>

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message de soutien (optionnel)"
              rows={3}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-3 focus:border-marine focus:outline-none resize-none"
            />

            {/* Anonyme */}
            <label className="flex items-center gap-2 text-xs text-gris-texte cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 accent-marine"
              />
              Rester anonyme
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer ma contribution'}
            </button>

            <p className="mt-4 text-center text-[11px] text-gris-doux">
              L&apos;association vous contactera pour finaliser votre contribution
            </p>
          </form>
        )}
      </div>
    </div>
  );
}