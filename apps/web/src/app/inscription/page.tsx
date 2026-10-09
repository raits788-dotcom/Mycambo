'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertCircle, ArrowLeft, Building2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { storeRefCode, getStoredRefCode, saveReferral } from '@/lib/referral';

export default function InscriptionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ─── Capture du code parrain depuis ?ref=CODE ─────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) storeRefCode(ref);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Créer le compte auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authErr) throw authErr;
      if (!authData.user) throw new Error('Utilisateur non créé');

      // 2. Créer le tenant
      const slug = form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' + Math.random().toString(36).substring(2, 6);

      const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert({
          slug,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          city: form.city || null,
          status: 'pending',
        })
        .select()
        .single();

      if (tenantErr) throw tenantErr;

      // 3. Lier l'utilisateur au tenant
      await supabase.from('tenant_users').insert({
        tenant_id: tenant.id,
        user_id: authData.user.id,
        role: 'owner',
      });

      // 4. Enregistrer le parrainage si un code était stocké
      const refCode = getStoredRefCode();
      if (refCode && tenant?.id) {
        await saveReferral({ code: refCode, referredTenantId: tenant.id });
        sessionStorage.removeItem('mycambo_ref_code');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/espace-partenaire/dashboard');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gris-fond p-4">
        <div className="bg-white rounded-2xl border border-gris-ligne p-8 max-w-md w-full text-center shadow-cb-md">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-2">Compte créé !</h1>
          <p className="text-sm text-gris-texte mb-6">
            Votre demande a bien été enregistrée. Vous allez être redirigé vers votre espace.
          </p>
          <Loader2 size={20} className="animate-spin text-marine mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris-fond py-8 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-6"
        >
          <ArrowLeft size={14} />
          Retour à l&apos;accueil
        </Link>

        <div className="bg-white rounded-2xl border border-gris-ligne p-8 shadow-cb-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-marine mb-1">
              Créer un compte partenaire
            </h1>
            <p className="text-sm text-gris-texte">
              Rejoignez l&apos;annuaire MyCambo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Nom de l&apos;établissement *
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Le Bistro Khmer"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@exemple.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                Mot de passe * (min. 8 caractères)
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+855..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase mb-1">
                  Ville
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Phnom Penh"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-gris-texte">
                J&apos;accepte les{' '}
                <Link href="/legal/cgu" className="text-marine font-bold hover:underline">
                  conditions générales
                </Link>{' '}
                et la{' '}
                <Link href="/legal/confidentialite" className="text-marine font-bold hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gris-ligne text-center text-xs text-gris-texte">
            Déjà un compte ?{' '}
            <Link href="/espace-partenaire/connexion" className="text-marine font-bold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-center text-gris-doux mt-6">
          🔒 Vos données sont sécurisées · Validation manuelle par l&apos;équipe MyCambo
        </p>
      </div>
    </div>
  );
}