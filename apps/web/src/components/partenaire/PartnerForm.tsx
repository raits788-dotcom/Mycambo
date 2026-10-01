'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Button from '@/components/ui/Button';
import { sendEmail } from '@/lib/email';

const SECTEURS = [
  { id: 'hotel', label: 'Hôtel / Hébergement' },
  { id: 'restaurant', label: 'Restaurant / Bar' },
  { id: 'association', label: 'Association / ONG' },
  { id: 'activite', label: 'Activité / Tour' },
  { id: 'shopping', label: 'Boutique / Artisanat' },
  { id: 'transport', label: 'Transport' },
  { id: 'autre', label: 'Autre' },
];

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function PartnerForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const contactName = form.get('name') as string;
    const businessName = form.get('business') as string;
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;
    const sector = form.get('sector') as string;
    const city = form.get('city') as string;
    const message = form.get('message') as string;

    // Trouve le label du secteur pour le stockage
    const sectorLabel =
      SECTEURS.find((s) => s.id === sector)?.label || sector;

    try {
      const supabase = getSupabase();

      // 1. INSERT dans partner_requests
      const { data: inserted, error: insertError } = await supabase
        .from('partner_requests')
        .insert({
          company_name: businessName,
          email: email,
          phone: phone || null,
          category: sectorLabel,
          city: city || null,
          message: `Contact : ${contactName}\n\n${message || ''}`,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur insert:', insertError);
        throw new Error("Erreur lors de l'enregistrement");
      }

      // 2. ENVOI EMAIL à contact@mycambo.net (notification)
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B3A6B; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">🇰🇭 Nouvelle demande partenaire</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1B3A6B; margin-top: 0;">${businessName}</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Contact</td><td style="padding: 8px 0;"><b>${contactName}</b></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Téléphone</td><td style="padding: 8px 0;">${phone || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Secteur</td><td style="padding: 8px 0;">${sectorLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Ville</td><td style="padding: 8px 0;">${city || '—'}</td></tr>
            </table>

            ${message ? `<div style="background: white; padding: 16px; border-left: 3px solid #D9A441; margin: 16px 0;"><p style="margin: 0; white-space: pre-wrap;">${message}</p></div>` : ''}

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
              <a href="https://admin.mycambo.net/demandes" style="background: #1B3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir dans la console admin →
              </a>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Demande reçue le ${new Date().toLocaleString('fr-FR')} · ID : ${inserted.id}
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: 'contact@mycambo.net',
        subject: `🇰🇭 Nouvelle demande partenaire : ${businessName}`,
        html: emailHtml,
      });

      // 3. Envoi email de confirmation au partenaire
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B3A6B; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Merci ${contactName} !</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Nous avons bien reçu votre demande pour <b>${businessName}</b>.</p>
            <p>Notre équipe va l'étudier dans les plus brefs délais et vous répondra sous <b>48 heures ouvrées</b>.</p>
            <p>En attendant, n'hésitez pas à explorer notre annuaire :</p>
            <p><a href="https://mycambo.net/annuaire" style="color: #1B3A6B;">→ Explorer l'annuaire</a></p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Cet email a été envoyé automatiquement. Pour toute question, contactez-nous à <a href="mailto:contact@mycambo.net">contact@mycambo.net</a>.
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: `Demande bien reçue — My Cambo`,
        html: confirmationHtml,
      });

      // 4. Succès
      setLoading(false);
      setSent(true);
    } catch (err) {
      console.error('Erreur:', err);
      setError("Erreur lors de l'envoi. Réessayez dans quelques instants.");
      setLoading(false);
    }
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
            <a href="/rubrique/hotel" className="text-marine underline font-bold">
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
        <form onSubmit={handleSubmit} className="bg-gris-fond rounded-lg p-6 md:p-8">
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