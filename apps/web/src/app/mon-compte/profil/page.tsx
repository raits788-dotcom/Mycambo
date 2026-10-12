'use client';

import { useEffect, useState } from 'react';
import {
  User, Mail, Save, Check, Lock, Info, History, ArrowRight, Loader2,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import {
  getProfileHistory,
  addProfileChange,
  PROFILE_CHANGE_LABELS,
  timeAgo,
  type CurrentUser,
  type ProfileHistoryEntry,
} from '@/lib/user';

export default function ProfilPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [history, setHistory] = useState<ProfileHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const u = session.user;
      const current: CurrentUser = {
        id: u.id,
        name: u.user_metadata?.name || u.email?.split('@')[0] || 'Utilisateur',
        email: u.email || '',
        created_at: u.created_at,
      };
      setUser(current);
      setForm({ name: current.name, email: current.email });

      const h = await getProfileHistory(u.id);
      setHistory(h);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (form.name !== user.name) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Met à jour le user_metadata
      await supabase.auth.updateUser({
        data: { name: form.name },
      });

      // Log l'historique
      await addProfileChange(user.id, 'name', user.name, form.name);

      setUser({ ...user, name: form.name });
      const h = await getProfileHistory(user.id);
      setHistory(h);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEmailChangeRequest = async () => {
    if (user) {
      await addProfileChange(user.id, 'email_change_requested', user.email, null);
      const h = await getProfileHistory(user.id);
      setHistory(h);
    }
    setShowEmailModal(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Vous devez être connecté.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mon profil
        </h1>
        <p className="text-sm text-gris-texte">
          Modifiez vos informations personnelles.
        </p>
      </div>

      {/* Carte profil */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gris-ligne">
          <div className="w-16 h-16 rounded-full bg-marine text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-marine text-lg">{user.name}</div>
            <div className="text-xs text-gris-texte">{user.email}</div>
            <div className="text-[10px] text-gris-doux mt-1">
              Compte créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              Nom complet
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg pl-10 pr-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-gris-doux mt-1">
              Ce nom apparaît sur vos avis et vos demandes.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              Adresse email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                id="email"
                type="email"
                value={form.email}
                readOnly
                disabled
                className="w-full border border-gris-ligne rounded-lg pl-10 pr-10 py-3 text-sm bg-gris-fond text-gris-texte cursor-not-allowed"
              />
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 flex items-start gap-2">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <b>Votre email est votre identifiant unique de connexion.</b>{' '}
                Il ne peut pas être modifié librement.
              </div>
            </div>

            <button
              type="button"
              onClick={handleEmailChangeRequest}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-marine hover:underline"
            >
              <Mail size={13} />
              Demander un changement d&apos;email
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="pt-4 border-t border-gris-ligne flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
              ) : saved ? (
                <><Check size={14} /> Enregistré</>
              ) : (
                <><Save size={14} /> Enregistrer</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Historique de mon compte</h2>
        </div>
        <p className="text-xs text-gris-texte mb-4">
          Toutes les modifications apportées à votre compte.
        </p>

        {history.length === 0 ? (
          <p className="text-xs text-gris-doux italic">Aucun historique pour le moment.</p>
        ) : (
          <div className="space-y-1">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-gris-ligne last:border-0">
                <div className="text-lg flex-shrink-0">📝</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine">
                    {PROFILE_CHANGE_LABELS[entry.field] || entry.field}
                  </div>
                  {entry.old_value && entry.new_value && (
                    <div className="text-xs text-gris-texte mt-0.5">
                      <span className="line-through text-gris-doux">{entry.old_value}</span>{' '}
                      <span className="text-marine">→ {entry.new_value}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-gris-doux mt-1">
                    {timeAgo(entry.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEmailModal && <EmailChangeModal onClose={() => setShowEmailModal(false)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// MODALE DEMANDE CHANGEMENT EMAIL
// ═══════════════════════════════════════════════════════════
function EmailChangeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="w-14 h-14 rounded-full bg-marine/10 flex items-center justify-center mb-5">
            <Mail size={24} className="text-marine" />
          </div>

          <h3 className="text-2xl font-extrabold text-marine mb-2">
            Changement d&apos;email
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Votre email est votre identifiant de connexion. Pour changer
            d&apos;email, une procédure de vérification est nécessaire.
          </p>

          <div className="bg-gris-fond rounded-lg p-4 mb-5">
            <div className="text-xs font-bold text-marine mb-3">Comment ça marche ?</div>
            <ol className="text-xs text-gris-texte space-y-2">
              <li className="flex gap-2"><span className="font-bold text-marine">1.</span>Contactez le support myCAMBO par email</li>
              <li className="flex gap-2"><span className="font-bold text-marine">2.</span>Nous vous enverrons un lien à votre <b>ancien email</b></li>
              <li className="flex gap-2"><span className="font-bold text-marine">3.</span>Puis un second lien à votre <b>nouvel email</b></li>
              <li className="flex gap-2"><span className="font-bold text-marine">4.</span>Une fois les 2 confirmations validées, l&apos;email est modifié</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Cette procédure garantit qu&apos;aucun tiers ne peut modifier votre email à votre insu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-bold border border-gris-ligne text-marine rounded-full py-3 hover:border-marine transition-colors"
            >
              Annuler
            </button>
            <a
              href="mailto:contact@mycambo.net?subject=Demande%20de%20changement%20d'email"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-marine text-white font-bold rounded-full py-3 hover:bg-marine-dark transition-colors text-sm"
            >
              <Mail size={14} />
              Contacter le support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}