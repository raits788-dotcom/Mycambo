'use client';

import { useState } from 'react';
import { X, Check, CalendarCheck } from 'lucide-react';
import { submitReservation } from '@/lib/services';

interface ReservationModalProps {
  businessId: string;
  businessName: string;
  tenantId?: string | null;
  // 'hotel' => séjour (arrivée/départ) ; sinon => table (date + créneau)
  kind: 'hotel' | 'restaurant';
  onClose: () => void;
}

const TIME_SLOTS = ['12:00', '12:30', '13:00', '19:00', '19:30', '20:00', '20:30'];

export default function ReservationModal({
  businessId,
  businessName,
  tenantId,
  kind,
  onClose,
}: ReservationModalProps) {
  const isHotel = kind === 'hotel';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    party: 2,
    dateFrom: '',
    dateTo: '',
    slot: TIME_SLOTS[0],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitReservation({
      business_id: businessId,
      tenant_id: tenantId,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      party_size: form.party,
      date_from: form.dateFrom || undefined,
      date_to: isHotel ? form.dateTo || undefined : undefined,
      time_slot: isHotel ? undefined : form.slot,
      message: form.message || undefined,
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(res.error || 'Une erreur est survenue.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">Demande envoyée !</h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre demande de réservation a été transmise à <b>{businessName}</b>. L&apos;établissement
              vous recontactera pour la confirmer.
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="w-14 h-14 rounded-full bg-marine/10 flex items-center justify-center mb-5">
              <CalendarCheck size={24} className="text-marine" />
            </div>
            <h3 className="text-2xl font-extrabold text-marine mb-2">
              Réserver à {businessName}
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              {isHotel
                ? 'Indiquez vos dates de séjour. L’établissement confirmera la disponibilité.'
                : 'Choisissez une date et un créneau. Le restaurant confirmera votre table.'}
            </p>

            <div className="space-y-3 mb-4">
              <input
                type="text" placeholder="Votre nom *" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email" placeholder="Email *" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
                />
                <input
                  type="tel" placeholder="Téléphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {isHotel ? 'Arrivée *' : 'Date *'}
                </label>
                <input
                  type="date" required
                  value={form.dateFrom}
                  onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
                  className="w-full border border-gris-ligne rounded-lg px-3 py-2.5 text-sm focus:border-marine focus:outline-none"
                />
              </div>
              {isHotel ? (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Départ *</label>
                  <input
                    type="date" required
                    value={form.dateTo}
                    onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
                    className="w-full border border-gris-ligne rounded-lg px-3 py-2.5 text-sm focus:border-marine focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Créneau *</label>
                  <select
                    value={form.slot}
                    onChange={(e) => setForm({ ...form, slot: e.target.value })}
                    className="w-full border border-gris-ligne rounded-lg px-3 py-2.5 text-sm focus:border-marine focus:outline-none"
                  >
                    {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>

            <label className="block text-xs font-bold text-ink mb-1">
              {isHotel ? 'Nombre de chambres' : 'Nombre de personnes'}
            </label>
            <input
              type="number" min={1} max={50}
              value={form.party}
              onChange={(e) => setForm({ ...form, party: Number(e.target.value) })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-2.5 text-sm mb-4 focus:border-marine focus:outline-none"
            />

            <textarea
              placeholder="Message (optionnel)"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-4 focus:border-marine focus:outline-none resize-none"
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Demander une réservation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
