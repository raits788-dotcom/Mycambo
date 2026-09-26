'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { submitVolunteer } from '@/lib/mock-data';
import { incrementSupports } from '@/lib/stats-tracker';

interface VolunteerModalProps {
  associationSlug: string;
  associationName: string;
  onClose: () => void;
}

export default function VolunteerModal({
  associationSlug,
  associationName,
  onClose,
}: VolunteerModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    start_date: '',
    end_date: '',
    skills: '',
    motivation: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    submitVolunteer({ association_slug: associationSlug, ...form });
  
    const newCount = incrementSupports(associationSlug);
    console.log('❤️ Soutiens mis à jour :', newCount);
    window.dispatchEvent(new Event('stats-updated'));
  
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
      Candidature envoyée !
    </h3>
    <p className="text-sm text-gris-texte leading-relaxed mb-4">
      Merci pour votre engagement. Votre candidature a été transmise à{' '}
      <b className="text-marine">{associationName}</b>.
    </p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
      <p className="text-xs text-blue-800 leading-relaxed">
        <b>Et maintenant ?</b>
        <br />
        L&apos;association vous contactera rapidement pour discuter de votre venue, des dates et des modalités.
      </p>
    </div>
    <button
      onClick={onClose}
      className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
    >
      Fermer
    </button>
  </div>
) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="text-4xl mb-4">🙋</div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Devenir bénévole
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Rejoignez l&apos;équipe de {associationName}. Remplissez ce
              formulaire, l&apos;association vous répondra rapidement.
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Nom complet *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-[10px] font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Arrivée *
                </label>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="w-full border border-gris-ligne rounded-lg px-3 py-2.5 text-sm focus:border-marine focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Départ *
                </label>
                <input
                  type="date"
                  required
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="w-full border border-gris-ligne rounded-lg px-3 py-2.5 text-sm focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="Compétences (enseignement, santé, construction…)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-3 focus:border-marine focus:outline-none"
            />

            <textarea
              placeholder="Pourquoi souhaitez-vous devenir bénévole ? *"
              required
              rows={4}
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-5 focus:border-marine focus:outline-none resize-none"
            />

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