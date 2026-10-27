'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check, Info } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function NouvelEtablissementPage() {
  const router = useRouter();
  const { tenant, loading: tenantLoading } = useCurrentTenant();

  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('position');
      setCategories(data || []);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setError('');

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const slug =
      form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 8);

    const { error: insertErr } = await supabase.from('businesses').insert({
      tenant_id: tenant.id,
      name: form.name,
      slug,
      category_id: form.category_id || null,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      photos: [],
      status: 'pending',
    });

    if (insertErr) {
      setError(insertErr.message);
      setSaving(false);
      return;
    }

    // Notifier myCAMBO qu'un établissement attend validation (best-effort).
    try {
      await supabase.from('notifications').insert({
        recipient_type: 'admin',
        recipient_id: tenant.id,
        type: 'establishment_pending',
        title: 'Nouvel établissement à valider',
        message: 'Le partenaire « ' + tenant.name + ' » a créé « ' + form.name + ' ». À vérifier avant publication.',
      });
    } catch { /* non bloquant */ }

    setSaving(false);
    setSuccess(true);
  };

  if (tenantLoading) {
    return <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>;
  }

  if (!tenant) {
    return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;
  }

  // Écran de confirmation : la fiche est créée mais en attente de validation myCAMBO.
  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl border border-gris-ligne p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-marine mb-2">Établissement créé !</h2>
        <p className="text-sm text-gris-texte leading-relaxed mb-6">
          Votre établissement <b>{form.name}</b> a bien été enregistré. Il est
          <b> en attente de vérification par myCAMBO</b> et sera publié dès validation,
          conformément à notre engagement qualité. Vous pouvez dès maintenant compléter
          sa fiche (photos, services, horaires).
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/espace-partenaire/etablissements"
            className="bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm">
            Voir mes établissements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/espace-partenaire/etablissements"
        className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-4"
      >
        <ArrowLeft size={14} />
        Retour à mes établissements
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Nouvel établissement
        </h1>
        <p className="text-sm text-gris-texte">
          Ajoutez un nouvel établissement à votre compte.
        </p>
      </div>

      <div className="max-w-2xl bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={18} className="text-marine shrink-0 mt-0.5" />
        <p className="text-sm text-marine">
          Chaque établissement est <b>vérifié par l&apos;équipe myCAMBO</b> avant
          d&apos;être publié sur le site. Renseignez des informations exactes pour
          accélérer la validation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm space-y-5 max-w-3xl"
      >
        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Nom de l&apos;établissement *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="Le Bistro Khmer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Catégorie *
          </label>
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          >
            <option value="">— Choisir une catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Description courte
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
            placeholder="En une phrase, présentez votre établissement"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Ville *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="Phnom Penh"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              placeholder="+855 ..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Site web
          </label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
            placeholder="https://..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gris-ligne gap-3">
          <Link
            href="/espace-partenaire/etablissements"
            className="px-6 py-3 text-sm font-bold text-gris-texte hover:text-marine rounded-full"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Création...' : 'Créer l\'établissement'}
          </button>
        </div>
      </form>
    </>
  );
}