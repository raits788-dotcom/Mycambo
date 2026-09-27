'use client';

import { useState } from 'react';
import {
  Plus,
  Settings,
  Tag,
  MapPin,
  Mail,
  KeyRound,
  Save,
  Trash2,
} from 'lucide-react';

type Tab = 'categories' | 'cities' | 'email' | 'api';

const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Hôtels', slug: 'hotel', count: 45, color: '#2C5599' },
  { id: 'c2', name: 'Restaurants', slug: 'restaurant', count: 78, color: '#F07C29' },
  { id: 'c3', name: 'Associations', slug: 'association', count: 23, color: '#E5407A' },
  { id: 'c4', name: 'Activités', slug: 'activite', count: 34, color: '#35A85B' },
  { id: 'c5', name: 'Shopping', slug: 'shopping', count: 28, color: '#D9A441' },
  { id: 'c6', name: 'Transports', slug: 'transport', count: 12, color: '#2C82D6' },
  { id: 'c7', name: 'Spa & Bien-être', slug: 'spa', count: 19, color: '#7B3FE4' },
];

const MOCK_CITIES = [
  { id: 'v1', name: 'Phnom Penh', count: 124 },
  { id: 'v2', name: 'Siem Reap', count: 89 },
  { id: 'v3', name: 'Battambang', count: 23 },
  { id: 'v4', name: 'Kampot', count: 18 },
  { id: 'v5', name: 'Koh Rong', count: 12 },
  { id: 'v6', name: 'Kep', count: 8 },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('categories');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Paramètres
        </h1>
        <p className="text-sm text-gris-texte">
          Configuration globale de la plateforme My Cambo.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6 flex-wrap">
        <button
          onClick={() => setTab('categories')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'categories' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <Tag size={14} />
          Catégories
        </button>
        <button
          onClick={() => setTab('cities')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'cities' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <MapPin size={14} />
          Villes
        </button>
        <button
          onClick={() => setTab('email')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'email' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <Mail size={14} />
          Emails
        </button>
        <button
          onClick={() => setTab('api')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'api' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <KeyRound size={14} />
          Clés API
        </button>
      </div>

      {/* Catégories */}
      {tab === 'categories' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
            <div>
              <h2 className="font-bold text-marine">Catégories d&apos;établissements</h2>
              <p className="text-xs text-gris-texte mt-1">{MOCK_CATEGORIES.length} catégories · utilisées dans l&apos;annuaire</p>
            </div>
            <button className="flex items-center gap-2 bg-marine text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-marine-dark">
              <Plus size={12} />
              Ajouter
            </button>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {MOCK_CATEGORIES.map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: c.color }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-marine">{c.name}</div>
                  <div className="text-xs text-gris-texte font-mono">/{c.slug} · {c.count} établissements</div>
                </div>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Villes */}
      {tab === 'cities' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
            <div>
              <h2 className="font-bold text-marine">Villes & régions</h2>
              <p className="text-xs text-gris-texte mt-1">{MOCK_CITIES.length} villes · utilisées pour les filtres</p>
            </div>
            <button className="flex items-center gap-2 bg-marine text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-marine-dark">
              <Plus size={12} />
              Ajouter
            </button>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {MOCK_CITIES.map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
                <MapPin size={16} className="text-marine" />
                <div className="flex-1">
                  <div className="font-bold text-marine">{c.name}</div>
                  <div className="text-xs text-gris-texte">{c.count} établissements</div>
                </div>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emails */}
      {tab === 'email' && (
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm space-y-4">
          <h2 className="font-bold text-marine mb-4">Configuration des emails</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Expéditeur</label>
              <input type="text" defaultValue="no-reply@mycambo.com" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Nom expéditeur</label>
              <input type="text" defaultValue="My Cambo" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Provider SMTP</label>
            <select className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none">
              <option>Resend</option>
              <option>Postmark</option>
              <option>SendGrid</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-marine text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-marine-dark">
            <Save size={14} />
            Enregistrer
          </button>
        </div>
      )}

      {/* Clés API */}
      {tab === 'api' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-marine">Stripe</h3>
                <p className="text-xs text-gris-texte mt-1">Paiement par carte internationale</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gris-fond text-gris-texte">INACTIF</span>
            </div>
            <input type="password" defaultValue="sk_live_********************" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono" />
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-marine">ABA PayWay</h3>
                <p className="text-xs text-gris-texte mt-1">Cartes locales, ABA Mobile, KHQR</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ACTIF</span>
            </div>
            <input type="password" defaultValue="aba_live_****************" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono" />
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-marine">Wing</h3>
                <p className="text-xs text-gris-texte mt-1">Wing Wallet, KHQR</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ACTIF</span>
            </div>
            <input type="password" defaultValue="wing_live_***************" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono" />
          </div>

          <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-marine">Bakong / KHQR</h3>
                <p className="text-xs text-gris-texte mt-1">QR interbancaire national du Cambodge</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ACTIF</span>
            </div>
            <input type="password" defaultValue="bakong_live_*************" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none font-mono" />
          </div>
        </div>
      )}
    </>
  );
}