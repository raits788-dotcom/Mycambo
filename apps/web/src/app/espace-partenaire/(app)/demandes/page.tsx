'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Inbox, Loader2, Filter, Search, MessageSquare, CheckCircle2,
  Clock, Eye, X, Send,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerDemandesPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    if (!tenant?.id) return;
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .eq('tenant_id', tenant.id)
      .order('name');

    setEstablishments(businesses || []);

    const businessIds = (businesses || []).map((b) => b.id);

    if (businessIds.length === 0) {
      setDemandes([]);
      setLoading(false);
      return;
    }

    const { data: messages } = await supabase
      .from('contact_messages')
      .select(`
        *,
        business:businesses(id, name, slug)
      `)
      .in('business_id', businessIds)
      .order('created_at', { ascending: false });

    setDemandes(messages || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!tenantLoading && tenant) {
      loadData();
    }
  }, [tenant, tenantLoading]);

  const markAsRead = async (messageId: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    setDemandes((prev) =>
      prev.map((d) => (d.id === messageId ? { ...d, status: 'read' } : d))
    );

    await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);
  };

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    setReplyText(msg.reply || '');
    if (msg.status === 'new') {
      markAsRead(msg.id);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setSending(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('contact_messages')
        .update({
          reply: replyText.trim(),
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      // Envoyer l'email au client
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedMessage.email,
              subject: `Réponse à votre demande : ${selectedMessage.subject}`,
              html: `
                <h2>Réponse de l'établissement</h2>
                <p>Bonjour ${selectedMessage.name},</p>
                <p>Voici la réponse à votre demande :</p>
                <blockquote style="background:#f4f7fb;padding:16px;border-left:4px solid #1B3A6B;margin:16px 0">
                  ${replyText.trim().replace(/\n/g, '<br/>')}
                </blockquote>
                <p>Cordialement,</p>
              `,
            }),
          }
        );
      } catch (emailErr) {
        console.warn('Email envoi échoué:', emailErr);
      }

      setSelectedMessage(null);
      setReplyText('');
      await loadData();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const filtered = useMemo(() => {
    return demandes.filter((d) => {
      const matchEstablishment = selectedEstablishment === 'all' || d.business_id === selectedEstablishment;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchSearch =
        (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.business?.name || '').toLowerCase().includes(search.toLowerCase());

      return matchEstablishment && matchStatus && matchSearch;
    });
  }, [demandes, selectedEstablishment, statusFilter, search]);

  if (tenantLoading || loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Demandes reçues
        </h1>
        <p className="text-sm text-gris-texte">
          {filtered.length} demande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur {demandes.length}
        </p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, sujet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
          >
            <option value="all">Tous statuts</option>
            <option value="new">Nouveau</option>
            <option value="read">Lu</option>
            <option value="replied">Répondu</option>
          </select>

          {establishments.length > 1 && (
            <select
              value={selectedEstablishment}
              onChange={(e) => setSelectedEstablishment(e.target.value)}
              className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
            >
              <option value="all">Tous les établissements</option>
              {establishments.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
          <Inbox size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte">
            {demandes.length === 0
              ? 'Aucune demande pour l\'instant.'
              : 'Aucune demande ne correspond à vos filtres.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Établissement</th>
                <th className="text-left px-3 py-3 font-bold">Client</th>
                <th className="text-left px-3 py-3 font-bold">Sujet</th>
                <th className="text-left px-3 py-3 font-bold">Date</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-gris-fond/50 cursor-pointer"
                  onClick={() => handleOpenMessage(d)}
                >
                  <td className="px-5 py-4 font-bold text-marine">
                    {d.business?.name || '—'}
                  </td>
                  <td className="px-3 py-4 text-marine">
                    <div className="flex items-center gap-2">
                      <span>{d.name}</span>
                      {d.email_verified && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">
                          <CheckCircle2 size={8} /> Vérifié
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gris-doux">{d.email}</div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{d.subject}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">
                    <div>{new Date(d.created_at).toLocaleDateString('fr-FR')}</div>
                    {d.replied_at && (
                      <div className="flex items-center gap-1 mt-1 text-green-600 text-[10px]">
                        <Clock size={9} /> Répondu
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={
                        'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                        (d.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : d.status === 'read'
                          ? 'bg-gris-fond text-gris-texte'
                          : 'bg-green-100 text-green-700')
                      }
                    >
                      {d.status === 'new' ? 'Nouveau' : d.status === 'read' ? 'Lu' : 'Répondu'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-bold text-marine hover:underline">
                      <Eye size={12} /> Ouvrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de détail + réponse */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="flex items-start justify-between p-6 border-b border-gris-ligne">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-extrabold text-marine">{selectedMessage.subject}</h2>
                  <span
                    className={
                      'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                      (selectedMessage.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedMessage.status === 'read'
                        ? 'bg-gris-fond text-gris-texte'
                        : 'bg-green-100 text-green-700')
                    }
                  >
                    {selectedMessage.status === 'new'
                      ? 'Nouveau'
                      : selectedMessage.status === 'read'
                      ? 'Lu'
                      : 'Répondu'}
                  </span>
                </div>
                <p className="text-xs text-gris-texte">
                  De <b>{selectedMessage.name}</b> ({selectedMessage.email}) —{' '}
                  {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gris-doux mt-1">
                  Établissement : {selectedMessage.business?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-9 h-9 rounded-lg hover:bg-gris-fond flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message */}
            <div className="p-6 border-b border-gris-ligne">
              <div className="text-sm text-gris-texte whitespace-pre-line">
                {selectedMessage.message}
              </div>
            </div>

            {/* Réponse existante */}
            {selectedMessage.reply && (
              <div className="p-6 border-b border-gris-ligne bg-gris-fond/50">
                <div className="text-xs font-bold text-marine uppercase mb-2">
                  Votre réponse précédente
                </div>
                <div className="text-sm text-gris-texte whitespace-pre-line">
                  {selectedMessage.reply}
                </div>
                {selectedMessage.replied_at && (
                  <div className="text-[10px] text-gris-doux mt-2">
                    Envoyée le {new Date(selectedMessage.replied_at).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de réponse */}
            <div className="p-6">
              <label className="block text-xs font-bold text-marine uppercase mb-2">
                {selectedMessage.reply ? 'Modifier la réponse' : 'Répondre au client'}
              </label>
              <textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-5 py-2.5 text-sm font-bold border border-gris-ligne text-marine rounded-full hover:border-marine"
                >
                  Fermer
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-marine text-white rounded-full hover:bg-marine-dark disabled:opacity-50"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sending ? 'Envoi...' : 'Envoyer la réponse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}