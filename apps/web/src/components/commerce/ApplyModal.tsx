'use client';

import { useState } from 'react';
import { X, Check, Briefcase } from 'lucide-react';
import { submitApplication } from '@/lib/services';

interface ApplyModalProps {
  jobOfferId: string;
  jobTitle: string;
  businessId: string;
  tenantId?: string | null;
  onClose: () => void;
}

export default function ApplyModal({
  jobOfferId,
  jobTitle,
  businessId,
  tenantId,
  onClose,
}: ApplyModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitApplication({
      job_offer_id: jobOfferId,
      business_id: businessId,
      tenant_id: tenantId,
      candidate_name: form.name,
      candidate_email: form.email,
      candidate_phone: form.phone,
      message: form.message || undefined,
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(res.error || 'Une erreur est survenue.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">Candidature envoyée !</h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre candidature pour <b>{jobTitle}</b> a bien été transmise. L&apos;établissement
              vous recontactera.
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="w-14 h-14 rounded-full bg-marine/10 flex items-center justify-center mb-5">
              <Briefcase size={24} className="text-marine" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">Postuler</h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Candidature pour <b>{jobTitle}</b>.
            </p>

            <div className="space-y-3 mb-4">
              <input
                type="text" placeholder="Votre nom *" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email" placeholder="Email *" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
                />
                <input
                  type="tel" placeholder="Téléphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <textarea
              placeholder="Lettre de motivation (optionnel)"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-4 focus:border-marine focus:outline-none resize-none"
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer ma candidature'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
