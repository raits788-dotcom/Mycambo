'use client';

import { useState } from 'react';
import { X, Check, Mail } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface ContactModalProps {
  businessId: string;
  businessName: string;
  onClose: () => void;
}

const SUBJECTS = [
  'Information générale',
  'Réservation',
  'Livraison',
  'Autre',
];

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function ContactModal({
  businessId,
  businessName,
  onClose,
}: ContactModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('contact_messages').insert({
        business_id: businessId,
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        source: 'contact_page',
        status: 'new',
        email_verified: false,
        verification_token: token,
        verification_expires_at: expiresAt,
      });

      if (error) throw error;

      // Envoyer l'email de vérification au client
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-verification-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email,
              token,
              business_name: businessName,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          console.error('Erreur envoi email vérification:', err);
        }
      } catch (emailErr) {
        console.warn('Email notification failed:', emailErr);
      }

      setSent(true);
    } catch (err) {
      console.error('Erreur contact:', err);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
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

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Vérifiez votre email !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Un email de vérification a été envoyé à <b>{form.email}</b>.
              <br />
              Cliquez sur le lien dans l'email pour valider votre demande.
              <br />
              <span className="text-xs text-gris-doux">
                Si vous ne recevez rien, vérifiez vos spams.
              </span>
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
              Contacter {businessName}
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Envoyez un message à cet établissement. Un email de vérification vous sera envoyé.
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