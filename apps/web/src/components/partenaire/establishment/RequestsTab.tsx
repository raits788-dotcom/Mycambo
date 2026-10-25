'use client';

import { useState, useEffect } from 'react';
import { Inbox, Loader2, Mail, Phone } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import { getContactMessagesForBusiness } from '@/lib/services';

interface RequestsTabProps {
  establishment: StoredEstablishment;
}

export default function RequestsTab({ establishment }: RequestsTabProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getContactMessagesForBusiness(establishment.id);
      setMessages(data);
      setLoading(false);
    })();
  }, [establishment.id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 bg-gris-fond rounded-lg">
        <Inbox size={40} className="text-gris-ligne mx-auto mb-3" />
        <p className="text-sm text-gris-texte">
          Aucune demande pour cet établissement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Inbox size={16} className="text-marine" />
        <h2 className="font-bold text-marine">
          Demandes reçues ({messages.length})
        </h2>
      </div>

      {messages.map((msg) => (
        <div
          key={msg.id}
          className="bg-white rounded-lg border border-gris-ligne p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="font-bold text-marine">{msg.name}</div>
              <div className="text-xs text-gris-doux flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Mail size={11} /> {msg.email}
                </span>
                {msg.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {msg.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gris-doux">
              {new Date(msg.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <div className="text-sm font-bold text-marine mb-1">{msg.subject}</div>
          <p className="text-sm text-gris-texte leading-relaxed">{msg.message}</p>
        </div>
      ))}
    </div>
  );
}