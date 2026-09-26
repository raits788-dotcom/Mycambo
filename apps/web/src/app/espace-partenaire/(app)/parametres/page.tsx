'use client';

import { useState } from 'react';
import {
  Lock,
  Bell,
  CreditCard,
  Trash2,
  AlertCircle,
  Check,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    emailReviews: true,
    emailRequests: true,
    emailNewsletter: false,
    emailBilling: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

      {/* Mot de passe */}
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

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Notifications</h2>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Nouvel avis à modérer"
            description="Recevoir un email quand un avis est publié sur vos fiches."
            checked={notifications.emailReviews}
            onChange={(v) => setNotifications({ ...notifications, emailReviews: v })}
          />
          <ToggleRow
            label="Nouvelles demandes"
            description="Recevoir un email pour chaque nouvelle promesse de don, candidature bénévole ou message."
            checked={notifications.emailRequests}
            onChange={(v) => setNotifications({ ...notifications, emailRequests: v })}
          />
          <ToggleRow
            label="Rappels de facturation"
            description="Être alerté avant chaque prélèvement d'abonnement."
            checked={notifications.emailBilling}
            onChange={(v) => setNotifications({ ...notifications, emailBilling: v })}
          />
          <ToggleRow
            label="Newsletter myCAMBO"
            description="Recevoir les actualités et conseils pour partenaires."
            checked={notifications.emailNewsletter}
            onChange={(v) => setNotifications({ ...notifications, emailNewsletter: v })}
          />
        </div>
      </div>

      {/* Abonnement */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Abonnement</h2>
        </div>

        <div className="bg-gris-fond rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-gris-texte mb-1">Formule actuelle</div>
              <div className="font-extrabold text-marine text-lg">
                Gratuite (Association)
              </div>
              <div className="text-xs text-gris-texte mt-1">
                Les associations sont référencées gratuitement sur myCAMBO.
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              <Check size={11} />
              Actif
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Votre compte association est gratuit. Aucune facturation.
          </p>
        </div>

        <a
          href="/partenaire/formules"
          className="inline-flex items-center gap-2 text-sm font-bold text-marine hover:underline"
        >
          Voir les autres formules
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-marine" />
          <h2 className="font-bold text-marine">Sécurité</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 py-2">
            <div>
              <div className="text-sm font-medium text-marine">
                Authentification à deux facteurs
              </div>
              <div className="text-xs text-gris-texte">
                Ajouter une sécurité supplémentaire à votre compte.
              </div>
            </div>
            <span className="text-[10px] font-bold text-gris-doux border border-gris-ligne px-2.5 py-1 rounded-full">
              Bientôt
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 py-2 border-t border-gris-ligne">
            <div>
              <div className="text-sm font-medium text-marine">
                Sessions actives
              </div>
              <div className="text-xs text-gris-texte">
                Voir et déconnecter vos autres appareils.
              </div>
            </div>
            <button className="text-xs font-bold text-marine hover:underline">
              Gérer
            </button>
          </div>
        </div>
      </div>

      {/* Zone de danger */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-500" />
          <h2 className="font-bold text-red-600">Zone de danger</h2>
        </div>

        {!showDeleteConfirm ? (
          <>
            <p className="text-xs text-gris-texte mb-4 leading-relaxed">
              La suppression de votre compte est <b>définitive</b>. Toutes vos
              données (fiches, avis, demandes, statistiques) seront effacées.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-bold bg-red-500 text-white rounded-full px-5 py-2.5 hover:bg-red-600 transition-colors"
            >
              Supprimer mon compte partenaire
            </button>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-700 text-sm mb-1">
                  Êtes-vous sûr ?
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Cette action est <b>irréversible</b>. Toutes vos fiches seront
                  retirées de myCAMBO immédiatement.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs font-bold border border-red-200 text-red-700 rounded-full px-4 py-2 hover:bg-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  console.log('Compte partenaire supprimé (simulation)');
                }}
                className="text-xs font-bold bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 transition-colors"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ===== Toggle row =====
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer py-2">
      <div className="flex-1">
        <div className="text-sm font-medium text-marine">{label}</div>
        <div className="text-xs text-gris-texte mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5',
          checked ? 'bg-marine' : 'bg-gris-ligne'
        )}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </button>
    </label>
  );
}