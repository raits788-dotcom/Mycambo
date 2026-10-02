'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  Bell,
  CreditCard,
  Trash2,
  AlertCircle,
  Check,
  ExternalLink,
  Shield,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    emailReviews: true,
    emailRequests: true,
    emailNewsletter: false,
    emailBilling: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ═══ MFA ═══
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaLoading, setMfaLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMfaLoading(false);
          return;
        }
        const { data } = await supabase
          .from('user_mfa')
          .select('is_enabled, is_verified')
          .eq('user_id', user.id)
          .maybeSingle();

        setMfaEnabled(data?.is_enabled === true && data?.is_verified === true);
      } catch (err) {
        console.error('MFA check error:', err);
        setMfaEnabled(false);
      } finally {
        setMfaLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Paramètres
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez votre compte, vos notifications et votre abonnement.
        </p>
      </div>

      {/* ═══ Sécurité MFA ═══ */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Double authentification (MFA)</h2>
        </div>

        {mfaLoading ? (
          <div className="flex items-center gap-2 text-xs text-gris-texte">
            <Loader2 size={12} className="animate-spin" />
            Vérification...
          </div>
        ) : mfaEnabled ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                🔐 MFA activée
              </span>
            </div>
            <p className="text-xs text-gris-texte mb-4">
              Votre compte est protégé par une double authentification. Un code à 6 chiffres
              est requis à chaque connexion.
            </p>
            <a
href="/setup-mfa"
              className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine transition-colors inline-block"
            >
              Gérer la MFA
            </a>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                ⚠️ MFA non activée
              </span>
            </div>
            <p className="text-xs text-gris-texte mb-4">
              Sécurisez votre compte en activant la double authentification. Un code à 6 chiffres
              sera demandé à chaque connexion.
            </p>
            <a
              href="/setup-mfa"
              className="inline-flex items-center gap-2 text-sm font-bold bg-marine text-white rounded-full px-5 py-2.5 hover:bg-marine-dark transition-colors"
            >
              <Shield size={14} />
              Activer la MFA
            </a>
          </>
        )}
      </div>

      {/* ═══ Mot de passe ═══ */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Mot de passe</h2>
        </div>
        <p className="text-xs text-gris-texte mb-4">
          Pour modifier votre mot de passe, un lien de réinitialisation vous
          sera envoyé par email.
        </p>
        <button className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine transition-colors">
          Changer mon mot de passe
        </button>
      </div>

      {/* ═══ Notifications ═══ */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Notifications</h2>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="M'alerter par email lors de nouveaux avis"
            checked={notifications.emailReviews}
            onChange={(v) =>
              setNotifications({ ...notifications, emailReviews: v })
            }
          />
          <ToggleRow
            label="M'alerter par email lors de nouvelles demandes"
            checked={notifications.emailRequests}
            onChange={(v) =>
              setNotifications({ ...notifications, emailRequests: v })
            }
          />
          <ToggleRow
            label="Recevoir la newsletter MyCambo"
            checked={notifications.emailNewsletter}
            onChange={(v) =>
              setNotifications({ ...notifications, emailNewsletter: v })
            }
          />
          <ToggleRow
            label="M'alerter par email pour la facturation"
            checked={notifications.emailBilling}
            onChange={(v) =>
              setNotifications({ ...notifications, emailBilling: v })
            }
          />
        </div>
      </div>

      {/* ═══ Abonnement ═══ */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Abonnement</h2>
        </div>
        <p className="text-xs text-gris-texte mb-4">
          Votre formule actuelle : <b className="text-marine">Pro</b> — 39 $/mois
        </p>
        <a
          href="/espace-partenaire/parametres"
          className="text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine transition-colors inline-flex items-center gap-2"
        >
          Voir mon abonnement
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ═══ Suppression compte ═══ */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-600" />
          <h2 className="font-bold text-red-600">Zone de danger</h2>
        </div>
        <p className="text-xs text-gris-texte mb-4">
          La suppression de votre compte est définitive. Toutes vos données seront effacées.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm font-bold bg-red-600 text-white rounded-full px-5 py-2.5 hover:bg-red-700 transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* ═══ Modal confirmation ═══ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-600" />
              <h2 className="text-lg font-bold text-marine">Confirmer la suppression</h2>
            </div>
            <p className="text-sm text-gris-texte mb-6">
              Êtes-vous sûr ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-sm font-bold border border-gris-ligne rounded-full py-2.5"
              >
                Annuler
              </button>
              <button className="flex-1 text-sm font-bold bg-red-600 text-white rounded-full py-2.5 hover:bg-red-700">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Composant Toggle Row
// ═══════════════════════════════════════════════════════════
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gris-texte">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors',
          checked ? 'bg-marine' : 'bg-gris-ligne'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}