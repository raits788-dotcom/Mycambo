'use client';

import { useState, useEffect } from 'react';
import {
  Lock, Bell, CreditCard, Trash2, AlertCircle, Check, ExternalLink,
  Shield, Loader2, KeyRound, Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';
import { sendPasswordResetEmail, requestAccountDeletion } from '@/lib/services';

const PLAN_COLORS: Record<string, string> = {
  Découverte: 'bg-gris-fond text-gris-texte',
  Essentiel: 'bg-blue-100 text-blue-700',
  Pro: 'bg-purple-100 text-purple-700',
  Business: 'bg-orange-100 text-orange-700',
  Entreprise: 'bg-red-100 text-red-700',
  Association: 'bg-green-100 text-green-700',
};

export default function ParametresPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [notifications, setNotifications] = useState({
    emailReviews: true,
    emailRequests: true,
    emailNewsletter: false,
    emailBilling: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);

  // MFA
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaLoading, setMfaLoading] = useState(true);

  // Abonnements
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

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

  useEffect(() => {
    if (tenantLoading || !tenant) return;

    (async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from('businesses')
          .select('id, name, slug, status, plans(name, price_monthly)')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        setBusinesses(data || []);
      } catch (err) {
        console.error('Businesses fetch error:', err);
      } finally {
        setBusinessesLoading(false);
      }
    })();
  }, [tenant, tenantLoading]);

  const totalMonthly = businesses
    .filter((b) => b.status === 'approved')
    .reduce((sum, b) => sum + Number(b.plans?.price_monthly || 0), 0);

  const handlePasswordReset = async () => {
    if (!tenant?.email) return;
    setSendingPasswordReset(true);
    try {
      await sendPasswordResetEmail(tenant.email);
      alert('✅ Email de réinitialisation envoyé à ' + tenant.email);
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!tenant?.id || !deletionReason.trim()) return;
    setSubmittingDeletion(true);
    try {
      await requestAccountDeletion({
        tenantId: tenant.id,
        reason: deletionReason,
      });
      alert('✅ Demande de suppression envoyée. Un administrateur vous contactera sous 48h.');
      setShowDeleteConfirm(false);
      setDeletionReason('');
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSubmittingDeletion(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Paramètres
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez votre compte, vos notifications et vos abonnements.
        </p>
      </div>

      {/* Sécurité MFA */}
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
              Votre compte est protégé par une double authentification.
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
              Sécurisez votre compte en activant la double authentification.
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

      {/* Mot de passe */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Mot de passe</h2>
        </div>
        <p className="text-xs text-gris-texte mb-4">
          Pour modifier votre mot de passe, un lien de réinitialisation vous sera envoyé par email.
        </p>
        <button
          onClick={handlePasswordReset}
          disabled={sendingPasswordReset}
          className="inline-flex items-center gap-2 text-sm font-bold border border-gris-ligne text-marine rounded-full px-5 py-2.5 hover:border-marine transition-colors disabled:opacity-50"
        >
          {sendingPasswordReset && <Loader2 size={12} className="animate-spin" />}
          {sendingPasswordReset ? 'Envoi...' : 'Changer mon mot de passe'}
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Notifications</h2>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="M'alerter par email lors de nouveaux avis"
            checked={notifications.emailReviews}
            onChange={(v) => setNotifications({ ...notifications, emailReviews: v })}
          />
          <ToggleRow
            label="M'alerter par email lors de nouvelles demandes"
            checked={notifications.emailRequests}
            onChange={(v) => setNotifications({ ...notifications, emailRequests: v })}
          />
          <ToggleRow
            label="Recevoir la newsletter MyCambo"
            checked={notifications.emailNewsletter}
            onChange={(v) => setNotifications({ ...notifications, emailNewsletter: v })}
          />
          <ToggleRow
            label="M'alerter par email pour la facturation"
            checked={notifications.emailBilling}
            onChange={(v) => setNotifications({ ...notifications, emailBilling: v })}
          />
        </div>
      </div>

      {/* Mes abonnements */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Mes abonnements</h2>
          </div>
          {!businessesLoading && businesses.length > 0 && (
            <span className="text-xs text-gris-texte">
              {businesses.filter((b) => b.status === 'approved').length} actif{businesses.filter((b) => b.status === 'approved').length > 1 ? 's' : ''} · {totalMonthly} $/mois
            </span>
          )}
        </div>

        {businessesLoading || tenantLoading ? (
          <div className="flex items-center gap-2 text-xs text-gris-texte">
            <Loader2 size={12} className="animate-spin" />
            Chargement...
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-6 bg-gris-fond rounded-lg">
            <Store size={28} className="text-gris-doux mx-auto mb-2" />
            <p className="text-xs text-gris-texte mb-3">
              Aucun établissement pour le moment.
            </p>
            <a
              href="/espace-partenaire/etablissements/nouveau"
              className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white rounded-full px-4 py-2 hover:bg-marine-dark transition-colors"
            >
              Créer un établissement
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {businesses.map((b) => {
              const planName = b.plans?.name || 'Découverte';
              const planPrice = b.plans?.price_monthly || 0;
              const planColor = PLAN_COLORS[planName] || 'bg-gris-fond text-gris-texte';

              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gris-ligne hover:bg-gris-fond/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                      <Store size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-marine text-sm truncate">
                        {b.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' + planColor}>
                          {planName}
                        </span>
                        <span className="text-xs text-gris-texte">
                          {planPrice > 0 ? `${planPrice} $/mois` : 'Gratuit'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/espace-partenaire/etablissements/${b.slug}`}
                    className="flex items-center gap-1 text-xs font-bold border border-gris-ligne text-marine rounded-full px-3 py-1.5 hover:border-marine transition-colors flex-shrink-0"
                  >
                    Gérer
                    <ExternalLink size={10} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suppression compte */}
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

      {/* Modal confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-600" />
              <h2 className="text-lg font-bold text-marine">Confirmer la suppression</h2>
            </div>
            <p className="text-sm text-gris-texte mb-4">
              Êtes-vous sûr ? Cette action est irréversible. Un administrateur vous contactera sous 48h.
            </p>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Motif de la suppression *
            </label>
            <textarea
              rows={3}
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Expliquez pourquoi vous souhaitez supprimer votre compte..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-sm font-bold border border-gris-ligne rounded-full py-2.5"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletionReason.trim() || submittingDeletion}
                className="flex-1 text-sm font-bold bg-red-600 text-white rounded-full py-2.5 hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submittingDeletion && <Loader2 size={12} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({
  label, checked, onChange,
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