'use client';

import { useState } from 'react';
import {
  X,
  Check,
  Heart,
  ExternalLink,
  Mail,
  CreditCard,
  Lock,
} from 'lucide-react';
import { submitDonation, type DonationLink } from '@/lib/mock-data';
import { incrementSupports } from '@/lib/stats-tracker';
import { cn } from '@/lib/utils';

interface DonateModalProps {
  associationSlug: string;
  associationName: string;
  donationLink?: DonationLink | null;
  onClose: () => void;
}

const AMOUNTS = [10, 25, 50, 100];

export default function DonateModal({
  associationSlug,
  associationName,
  donationLink,
  onClose,
}: DonateModalProps) {
  const [mode, setMode] = useState<'choice' | 'form' | 'sent'>(
    donationLink ? 'choice' : 'form'
  );
  const [amount, setAmount] = useState<number | 'custom'>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'unique' | 'mensuel'>('unique');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalAmount = amount === 'custom' ? Number(customAmount) || 0 : amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    submitDonation({
      association_slug: associationSlug,
      amount: finalAmount,
      frequency,
      name: anonymous ? 'Anonyme' : name,
      email,
      phone: phone || undefined,
      message: message || undefined,
      anonymous,
    });
  
    // ===== Incrémente les soutiens AVANT le changement d'état =====
    const newCount = incrementSupports(associationSlug);
    console.log('❤️ Soutiens mis à jour :', newCount);
    window.dispatchEvent(new Event('stats-updated'));
  
    setTimeout(() => {
      setLoading(false);
      setMode('sent');
    }, 600);
  };

  const openDonationLink = () => {
    if (donationLink?.url) {
      window.open(donationLink.url, '_blank', 'noopener,noreferrer');
    }
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

        {/* ============ CHOIX ============ */}
        {mode === 'choice' && donationLink && (
          <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-khmer/15 flex items-center justify-center mb-5">
              <Heart size={26} className="fill-khmer text-khmer" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Soutenir {associationName}
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Choisissez la façon qui vous convient le mieux pour soutenir cette
              association.
            </p>

            <button
              onClick={openDonationLink}
              className="w-full flex items-start gap-4 p-5 bg-marine text-white rounded-xl hover:bg-marine-dark transition-colors mb-3 text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-base mb-1 flex items-center gap-2">
                  {donationLink.label}
                  <ExternalLink size={14} />
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  {donationLink.description ||
                    'Paiement sécurisé par carte bancaire'}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gris-ligne" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gris-doux font-bold">
                ou
              </span>
              <div className="flex-1 h-px bg-gris-ligne" />
            </div>

            <button
              onClick={() => setMode('form')}
              className="w-full flex items-start gap-4 p-5 bg-gris-fond hover:bg-gris-ligne rounded-xl transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-marine" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-marine text-base mb-1">
                  Être contacté(e) par l&apos;association
                </div>
                <div className="text-xs text-gris-texte leading-relaxed">
                  L&apos;association vous répondra sous 48h pour convenir du
                  mode de paiement (virement, ABA, Wing…)
                </div>
              </div>
            </button>

            <div className="mt-6 flex items-center gap-2 text-xs text-gris-doux justify-center">
              <Lock size={12} />
              <span>
                Aucun paiement sur myCAMBO — mise en relation uniquement
              </span>
            </div>
          </div>
        )}

        {/* ============ FORMULAIRE ============ */}
        {mode === 'form' && (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="w-14 h-14 rounded-full bg-khmer/15 flex items-center justify-center mb-5">
              <Heart size={26} className="fill-khmer text-khmer" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Faire un don
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Remplissez ce formulaire, {associationName} vous contactera pour
              finaliser votre don.
            </p>

            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Montant envisagé *
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
                      ? 'bg-marine text-white'
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
                    ? 'bg-marine text-white'
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

            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider mt-3">
              Fréquence
            </label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setFrequency('unique')}
                className={cn(
                  'py-3 rounded-lg text-sm font-bold transition-colors',
                  frequency === 'unique'
                    ? 'bg-marine text-white'
                    : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                )}
              >
                Don ponctuel
              </button>
              <button
                type="button"
                onClick={() => setFrequency('mensuel')}
                className={cn(
                  'py-3 rounded-lg text-sm font-bold transition-colors',
                  frequency === 'mensuel'
                    ? 'bg-marine text-white'
                    : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                )}
              >
                Don mensuel
              </button>
            </div>

            <div className="space-y-3 mb-5">
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
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Téléphone (optionnel)"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message de soutien (optionnel)"
              rows={3}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-3 focus:border-marine focus:outline-none resize-none"
            />

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
              className="w-full bg-khmer text-white font-bold py-3 rounded-full hover:bg-khmer/90 transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </button>

            <div className="mt-4 text-center text-[11px] text-gris-doux flex items-center justify-center gap-2">
              <Lock size={11} />
              <span>
                L&apos;association vous répondra sous 48h pour finaliser votre
                don
              </span>
            </div>
          </form>
        )}

        {/* ============ ENVOYÉ ============ */}
        {mode === 'sent' && (
  <div className="p-8 text-center">
    <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-4">
      <Check size={32} className="text-ic-vert" />
    </div>
    <h3 className="text-2xl font-extrabold text-marine mb-2">
      Promesse de don envoyée !
    </h3>
    <p className="text-sm text-gris-texte leading-relaxed mb-4">
      Merci pour votre générosité. Votre promesse a été transmise à{' '}
      <b className="text-marine">{associationName}</b>.
    </p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
      <p className="text-xs text-blue-800 leading-relaxed">
        <b>Et maintenant ?</b>
        <br />
        L&apos;association vous contactera sous 48h par email pour finaliser
        votre don (virement, ABA, Wing…).
      </p>
    </div>
    <button
      onClick={onClose}
      className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
    >
      Fermer
    </button>
  </div>
)}
      </div>
    </div>
  );
}
