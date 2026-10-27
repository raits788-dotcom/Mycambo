'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Check, X, Clock, Phone, Mail } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { getReservationsForBusiness, setReservationStatus } from '@/lib/services';

interface ReservationsTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

const STATUS = {
  pending: { label: 'En attente', cls: 'bg-orange-100 text-orange-700' },
  confirmed: { label: 'Confirmée', cls: 'bg-green-100 text-green-700' },
  declined: { label: 'Refusée', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulée', cls: 'bg-gris-fond text-gris-texte' },
} as const;

export default function ReservationsTab({ establishment, onUpdate }: ReservationsTabProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setRows(await getReservationsForBusiness(establishment.id));
    setLoading(false);
  }, [establishment.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const changeStatus = async (id: string, status: string) => {
    await setReservationStatus(id, status);
    await reload();
    onUpdate();
  };

  if (loading) {
    return <div className="py-10 text-center text-gris-doux text-sm">Chargement…</div>;
  }

  if (!rows.length) {
    return (
      <div className="py-12 text-center">
        <CalendarCheck size={36} className="mx-auto text-gris-doux mb-3" />
        <p className="text-sm text-gris-texte">Aucune demande de réservation pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-extrabold text-marine">Demandes de réservation</h3>
      {rows.map((r) => {
        const st = STATUS[r.status as keyof typeof STATUS] || STATUS.pending;
        return (
          <div key={r.id} className="border border-gris-ligne rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="font-bold text-marine">{r.customer_name}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gris-doux mt-1">
                  {r.customer_email && (
                    <span className="flex items-center gap-1"><Mail size={12} /> {r.customer_email}</span>
                  )}
                  {r.customer_phone && (
                    <span className="flex items-center gap-1"><Phone size={12} /> {r.customer_phone}</span>
                  )}
                </div>
              </div>
              <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>
                {st.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gris-texte mb-3">
              {r.date_from && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(r.date_from).toLocaleDateString('fr-FR')}
                  {r.date_to && ' → ' + new Date(r.date_to).toLocaleDateString('fr-FR')}
                </span>
              )}
              {r.time_slot && <span>🕐 {r.time_slot}</span>}
              {r.party_size != null && <span>👥 {r.party_size}</span>}
            </div>
            {r.message && <p className="text-sm text-gris-texte mb-3 italic">« {r.message} »</p>}

            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => changeStatus(r.id, 'confirmed')}
                  className="flex items-center gap-1 bg-ic-vert text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90"
                >
                  <Check size={15} /> Confirmer
                </button>
                <button
                  onClick={() => changeStatus(r.id, 'declined')}
                  className="flex items-center gap-1 bg-gris-fond text-gris-texte text-sm font-bold px-4 py-2 rounded-full hover:bg-gris-ligne"
                >
                  <X size={15} /> Refuser
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
