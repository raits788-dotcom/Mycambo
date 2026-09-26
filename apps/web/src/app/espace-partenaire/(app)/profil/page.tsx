'use client';

import { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  Check,
  ExternalLink,
  Heart,
  Info,
} from 'lucide-react';
import { getCurrentPartnerMock } from '@/lib/auth-mock';

export default function ProfilPage() {
  const partner = getCurrentPartnerMock();

  const [form, setForm] = useState({
    name: partner?.name || 'Green Umbrella',
    email: partner?.email || 'sokha@greenumbrella-kh.org',
    legalName: 'Green Umbrella NGO',
    contactName: 'Sokha Chen',
    phone: '+855 12 345 678',
    website: 'www.greenumbrella-kh.org',
    address: 'Putsor, Takeo',
    city: 'Takeo',
    country: 'Cambodge',
    donationLink: 'https://greenumbrella-kh.org/donate/',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profil partenaire mis à jour :', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mon profil partenaire
        </h1>
        <p className="text-sm text-gris-texte">
          Ces informations apparaissent sur vos fiches publiques.
        </p>
      </div>

      {/* Bandeau identité */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-lg bg-khmer text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {partner?.initials || 'GU'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-marine text-lg mb-1">
              {form.name}
            </div>
            <div className="text-xs text-gris-texte mb-2">
              {form.email}
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Compte vérifié
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informations entreprise */}
        <div className="bg-white rounded-lg border border-gris-ligne p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Informations entreprise</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Nom commercial *
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="legalName" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Raison sociale
              </label>
              <input
                id="legalName"
                type="text"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Contact principal
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Site web
              </label>
              <input
                id="website"
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-lg border border-gris-ligne p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} className="text-marine" />
            <h2 className="font-bold text-marine">Adresse</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Adresse
              </label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Ville
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Pays
                </label>
                <input
                  id="country"
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lien de don */}
        <div className="bg-white rounded-lg border border-gris-ligne p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-red-500" />
            <h2 className="font-bold text-marine">Lien de don</h2>
          </div>
          <p className="text-xs text-gris-texte mb-5">
            Permettez aux visiteurs de faire un don directement sur votre
            plateforme (HelloAsso, PayPal, etc.).
          </p>

          <div>
            <label htmlFor="donationLink" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              URL de votre page de don
            </label>
            <input
              id="donationLink"
              type="url"
              value={form.donationLink}
              onChange={(e) => setForm({ ...form, donationLink: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-gris-doux mt-1">
              Ce lien apparaîtra sur votre fiche publique.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 flex items-start gap-2">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              myCAMBO ne gère pas les paiements. Les dons se font directement
              entre vous et le donateur.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            {saved ? (
              <>
                <Check size={14} />
                Enregistré
              </>
            ) : (
              <>
                <Save size={14} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}