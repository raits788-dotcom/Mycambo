'use client';

import { useState, useEffect } from 'react';
import { Tag, MapPin, Mail, KeyRound, Loader2 } from 'lucide-react';
import { getCategories } from '@/lib/services';

type Tab = 'categories' | 'cities' | 'email' | 'api';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Paramètres</h1>
        <p className="text-sm text-gris-texte">Configuration globale de la plateforme.</p>
      </div>

      <div className="flex gap-2 border-b border-gris-ligne mb-6 flex-wrap">
        <button onClick={() => setTab('categories')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'categories' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <Tag size={14} /> Catégories
        </button>
        <button onClick={() => setTab('cities')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'cities' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <MapPin size={14} /> Villes
        </button>
        <button onClick={() => setTab('email')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'email' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <Mail size={14} /> Emails
        </button>
        <button onClick={() => setTab('api')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'api' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <KeyRound size={14} /> Clés API
        </button>
      </div>

      {tab === 'categories' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne">
            <h2 className="font-bold text-marine">Catégories d&apos;établissements</h2>
            <p className="text-xs text-gris-texte mt-1">{categories.length} catégories · utilisées dans l&apos;annuaire</p>
          </div>
          {loading ? (
            <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>
          ) : (
            <ul className="divide-y divide-gris-ligne">
              {categories.map((c) => (
                <li key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: c.color || '#1B3A6B' }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-marine">{c.name}</div>
                    <div className="text-xs text-gris-texte font-mono">/{c.slug}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'cities' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne">
            <h2 className="font-bold text-marine">Villes &amp; régions</h2>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {MOCK_CITIES.map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center gap-4">
                <MapPin size={16} className="text-marine" />
                <div className="flex-1">
                  <div className="font-bold text-marine">{c.name}</div>
                  <div className="text-xs text-gris-texte">{c.count} établissements</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'email' && (
        <div className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm space-y-4">
          <h2 className="font-bold text-marine mb-4">Configuration des emails</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Expéditeur</label>
              <input type="text" defaultValue="no-reply@mycambo.com" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">Nom expéditeur</label>
              <input type="text" defaultValue="My Cambo" className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne" />
            </div>
          </div>
          <p className="text-xs text-gris-doux">À configurer avec Resend en Phase G.</p>
        </div>
      )}

      {tab === 'api' && (
        <div className="space-y-5">
          {[
            { name: 'Stripe', desc: 'Cartes internationales', key: 'sk_live_************', active: false },
            { name: 'ABA PayWay', desc: 'Cartes locales, ABA Mobile, KHQR', key: 'aba_live_***********', active: true },
            { name: 'Wing', desc: 'Wing Wallet, KHQR', key: 'wing_live_**********', active: true },
            { name: 'Bakong / KHQR', desc: 'QR interbancaire national', key: 'bakong_live_********', active: true },
          ].map((g) => (
            <div key={g.name} className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-marine">{g.name}</h3>
                  <p className="text-xs text-gris-texte mt-1">{g.desc}</p>
                </div>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (g.active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')}>
                  {g.active ? 'ACTIF' : 'INACTIF'}
                </span>
              </div>
              <input type="password" defaultValue={g.key} className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne font-mono" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}