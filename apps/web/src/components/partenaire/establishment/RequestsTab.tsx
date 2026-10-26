'use client';

import { useState, useEffect, useMemo } from 'react';
import { Inbox, Loader2, Mail, Phone, CheckCircle2, MessageSquare, Search, Filter, Clock } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import ReplyRequestModal from './ReplyRequestModal';

interface RequestsTabProps {
  establishment: StoredEstablishment;
}

export default function RequestsTab({ establishment }: RequestsTabProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadMessages = async () => {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('business_id', establishment.id)
      .order('created_at', { ascending: false });

    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [establishment.id]);

  const markAsRead = async (messageId: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Mise à jour optimiste : on change le statut localement d'abord
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: 'read' } : m))
    );

    // Puis on enregistre en BDD
    await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);
  };

  // Filtrage local (instantané)
  const filtered = useMemo(() => {
    return messages.filter((msg) => {
      const matchSearch =
        (msg.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (msg.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || msg.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [messages, search, statusFilter]);

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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-marine" />
            <h2 className="font-bold text-marine">
              Demandes reçues ({messages.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter size={14} className="text-gris-doux" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-gris-ligne px-2 py-2"
              >
                <option value="all">Tous</option>
                <option value="new">Nouveau</option>
                <option value="read">Lu</option>
                <option value="replied">Répondu</option>
              </select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-gris-fond rounded-lg">
            <p className="text-sm text-gris-texte">Aucun message ne correspond à vos filtres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg border border-gris-ligne p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="font-bold text-marine">{msg.name}</div>
                      <span className={
                        'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                        (msg.status === 'new' ? 'bg-blue-100 text-blue-700'
                          : msg.status === 'read' ? 'bg-gris-fond text-gris-texte'
                          : 'bg-green-100 text-green-700')
                      }>
                        {msg.status === 'new' ? 'Nouveau' : msg.status === 'read' ? 'Lu' : 'Répondu'}
                      </span>
                      {msg.email_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <CheckCircle2 size={10} /> Vérifié
                        </span>
                      )}
                    </div>
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
                  <div className="text-xs text-gris-doux text-right">
                    <div>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</div>
                    {msg.replied_at && (
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <Clock size={10} />
                        Répondu le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm font-bold text-marine mb-1">{msg.subject}</div>
                <p className="text-sm text-gris-texte leading-relaxed mb-3">{msg.message}</p>

                {msg.reply && (
                  <div className="bg-gris-fond border-l-2 border-marine rounded-r p-3 mb-3">
                    <div className="text-xs font-bold text-marine mb-1">Votre réponse :</div>
                    <p className="text-sm text-gris-texte whitespace-pre-line">{msg.reply}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-gris-ligne">
                  {msg.status === 'new' && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="text-xs font-bold text-marine hover:underline"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-marine hover:underline"
                  >
                    <MessageSquare size={11} /> {msg.reply ? 'Modifier la réponse' : 'Répondre'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMessage && (
        <ReplyRequestModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onSent={() => {
            setSelectedMessage(null);
            loadMessages();
          }}
        />
      )}
    </>
  );
}