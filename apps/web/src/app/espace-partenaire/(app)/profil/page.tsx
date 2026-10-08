'use client';

import { useEffect, useState } from 'react';
import { User, Mail, MapPin, Phone, Loader2, Save } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerProfilePage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', address: '', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: (tenant as any).phone || '',
        city: (tenant as any).city || '',
        address: (tenant as any).address || '',
        description: (tenant as any).description || '',
      });
    }
  }, [tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setError('');
    setSaved(false);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateErr } = await supabase
      .from('tenants')
      .update({
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        description: form.description,
      })
      .eq('id', tenant.id);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (tenantLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
      </div>
    );
  }

  if (!tenant) {
    return <div className="p-12 text-center text-gris-texte">Aucun tenant associé.</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mon profil partenaire
        </h1>
        <p className="text-sm text-gris-texte">
          Ces informations apparaissent sur vos fiches publiques.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Carte identité */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-marine text-white flex items-center justify-center font-bold text-lg">
              {form.name ? form.name.substring(0, 2).toUpperCase() : '??'}
            </div>
            <div>
              <div className="font-bold text-marine text-lg">{form.name || 'Sans nom'}</div>
              <div className="text-sm text-gris-texte">{form.email}</div>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                ● Compte vérifié
              </span>
            </div>
          </div>
        </div>

        {/* Informations entreprise */}
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <h2 className="font-bold text-marine mb-4 flex items-center gap-2">
            <User size={16} /> Informations entreprise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Nom commercial *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Email (non modifiable)
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne bg-gris-fond text-gris-texte"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Ville
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ Modifications enregistrées
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-marine text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-marine-dark disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </>
  );
}