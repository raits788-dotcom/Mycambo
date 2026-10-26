'use client';

import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface ReplyRequestModalProps {
  message: any;
  onClose: () => void;
  onSent: () => void;
}

export default function ReplyRequestModal({
  message,
  onClose,
  onSent,
}: ReplyRequestModalProps) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    setError('');

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Enregistrer la réponse dans le message
      const { error: updateErr } = await supabase
        .from('contact_messages')
        .update({
          reply: reply.trim(),
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      if (updateErr) throw updateErr;

      // 2. Envoyer l'email au client
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: message.email,
              subject: `Réponse à votre demande : ${message.subject}`,
              html: `
                <h2>Réponse de l'établissement</h2>
                <p>Bonjour ${message.name},</p>
                <p>Voici la réponse à votre demande :</p>
                <blockquote style="background:#f4f7fb;padding:16px;border-left:4px solid #1B3A6B;margin:16px 0">
                  ${reply.trim().replace(/\n/g, '<br/>')}
                </blockquote>
                <p>Cordialement,</p>
              `,
            }),
          }
        );
      } catch (emailErr) {
        console.warn('Email envoi échoué:', emailErr);
      }

      onSent();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center"
        >
          <X size={18} className="text-marine" />
        </button>

        <h3 className="text-xl font-extrabold text-marine mb-2">
          Répondre à {message.name}
        </h3>
        <p className="text-sm text-gris-texte mb-4">
          <b>Sujet :</b> {message.subject}
        </p>
        <div className="bg-gris-fond rounded-lg p-3 mb-4 text-sm text-gris-texte">
          {message.message}
        </div>

        <form onSubmit={handleSend}>
          <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
            Votre réponse *
          </label>
          <textarea
            rows={5}
            required
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none resize-none mb-3"
            placeholder="Écrivez votre réponse..."
          />

          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="flex-1 bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? 'Envoi...' : 'Envoyer la réponse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}