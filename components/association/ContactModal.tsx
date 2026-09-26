'use client';

import { useState, useEffect } from 'react';
import { X, Check, Mail } from 'lucide-react';
import { submitContact } from '@/lib/mock-data';
import { incrementSupports } from '@/lib/stats-tracker';

interface ContactModalProps {
  associationSlug: string;
  associationName: string;
  initialSubject?: string;
  onClose: () => void;
}

const SUBJECTS = [
  'Information générale',
  'Bénévolat',
  'Don',
  'Partenariat',
  'Autre',
];

export default function ContactModal({
  associationSlug,
  associationName,
  initialSubject,
  onClose,
}: ContactModalProps) {
  const safeInitial =
    initialSubject && SUBJECTS.includes(initialSubject)
      ? initialSubject
      : SUBJECTS[0];

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: safeInitial,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // ===== Synchronise le sujet si la prop change =====
  useEffect(() => {
    if (initialSubject && SUBJECTS.includes(initialSubject)) {
      setForm((prev) => ({ ...prev, subject: initialSubject }));
    }
  }, [initialSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    submitContact({ association_slug: associationSlug, ...form });

    if (form.subject === 'Don' || form.subject === 'Bénévolat') {
      incrementSupports(associationSlug);
      window.dispatchEvent(new Event('stats-updated'));
    }

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
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-ic-vert" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Message envoyé !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre message a été transmis à {associationName}.
              Elle vous répondra dans les plus brefs délais.
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
              <Mail size={24} className="text-marine" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Nous contacter
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Envoyez un message à {associationName}.
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Votre nom *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
              <input
                type="email"
                placeholder="Votre email *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
            </div>

            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Sujet
            </label>
            <div className="flex flex-wrap gap-2 mb-5">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, subject: s })}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                    form.subject === s
                      ? 'bg-marine text-white'
                      : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Votre message *"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-5 focus:border-marine focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}