'use client';

import { useState } from 'react';
import { Lock, Bell, Trash2, AlertCircle } from 'lucide-react';

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    emailAvis: true,
    emailDemandes: true,
    newsletter: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Paramètres
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez vos préférences et votre compte.
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
            label="M'alerter quand mes avis sont publiés"
            checked={notifications.emailAvis}
            onChange={(v) =>
              setNotifications({ ...notifications, emailAvis: v })
            }
          />
          <ToggleRow
            label="M'alerter des réponses à mes demandes"
            checked={notifications.emailDemandes}
            onChange={(v) =>
              setNotifications({ ...notifications, emailDemandes: v })
            }
          />
          <ToggleRow
            label="Recevoir la newsletter myCAMBO"
            checked={notifications.newsletter}
            onChange={(v) =>
              setNotifications({ ...notifications, newsletter: v })
            }
          />
        </div>
      </div>

      {/* Suppression du compte */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-500" />
          <h2 className="font-bold text-red-600">Supprimer mon compte</h2>
        </div>

        {!showDeleteConfirm ? (
          <>
            <p className="text-xs text-gris-texte mb-4">
              La suppression de votre compte est <b>définitive</b>. Toutes vos
              données (favoris, avis, demandes) seront effacées.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-bold bg-red-500 text-white rounded-full px-5 py-2.5 hover:bg-red-600 transition-colors"
            >
              Supprimer mon compte
            </button>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle
                size={16}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <div className="font-bold text-red-700 text-sm mb-1">
                  Êtes-vous sûr ?
                </div>
                <p className="text-xs text-red-700">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs font-bold border border-red-200 text-red-700 rounded-full px-4 py-2 hover:bg-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // ⚠️ À brancher sur Supabase
                  console.log('Compte supprimé (simulation)');
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
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm text-gris-texte">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-marine' : 'bg-gris-ligne'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5.5 left-0.5' : 'left-0.5'
          }`}
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </label>
  );
}