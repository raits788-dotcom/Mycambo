'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

const SECTEURS = [
  { id: 'hotel', label: 'Hôtel / Hébergement' },
  { id: 'restaurant', label: 'Restaurant / Bar' },
  { id: 'association', label: 'Association / ONG' },
  { id: 'activite', label: 'Activité / Tour' },
  { id: 'shopping', label: 'Boutique / Artisanat' },
  { id: 'transport', label: 'Transport' },
  { id: 'autre', label: 'Autre' },
];

export default function PartnerForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      contact_name: form.get('name'),
      contact_email: form.get('email'),
      contact_phone: form.get('phone'),
      business_name: form.get('business'),
      sector_id: form.get('sector'),
      city: form.get('city'),
      description: form.get('message'),
    };

    // ⚠️ Simulation — branchement Supabase au module 🅱️
    console.log('📨 Demande partenaire :', data);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  }

  if (sent) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-6 text-ic-vert text-3xl">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-marine mb-4">
            Demande envoyée !
          </h2>
          <p className="text-gris-texte leading-relaxed mb-6">
            Merci pour votre intérêt. Notre équipe étudie votre demande et vous
            répondra par email sous 48 h ouvrées.
          </p>
          <p className="text-sm text-gris-doux">
            En attendant, explorez notre{' '}
            <a
              href="/rubrique/hotel"
              className="text-marine underline font-bold"
            >
              annuaire
            </a>{' '}
            pour découvrir nos partenaires actuels.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-gris-fond rounded-lg p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Nom de votre établissement *
              </label>
              <input
                type="text"
                name="business"
                required
                placeholder="Ex : Hôtel Angkor Palace"
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Votre nom *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Prénom Nom"
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Secteur *
              </label>
              <select
                name="sector"
                required
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              >
                <option value="">— Choisir —</option>
                {SECTEURS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="vous@exemple.com"
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+855 ..."
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Ville
              </label>
              <input
                type="text"
                name="city"
                placeholder="Ex : Siem Reap"
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Parlez-nous de votre activité
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Décrivez votre établissement, votre savoir-faire, ce qui vous rend unique..."
                className="w-full bg-white border border-gris-ligne rounded-md px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-khmer/10 text-khmer border border-khmer/20 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gris-doux">
              En envoyant, vous acceptez nos{' '}
              <a href="/legal/cgu" className="text-marine underline">
                CGU
              </a>
              .
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full md:w-auto justify-center"
            >
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
