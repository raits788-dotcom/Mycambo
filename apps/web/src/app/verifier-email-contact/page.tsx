'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function VerifyEmailContactPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token manquant.');
      return;
    }

    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Chercher le message avec ce token
      const { data: messages, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('verification_token', token)
        .limit(1);

      if (error || !messages || messages.length === 0) {
        setStatus('error');
        setMessage('Token invalide ou expiré.');
        return;
      }

      const message = messages[0];

      // 2. Vérifier que le token n'a pas expiré
      if (message.verification_expires_at && new Date(message.verification_expires_at) < new Date()) {
        setStatus('error');
        setMessage('Ce lien a expiré. Veuillez refaire une demande.');
        return;
      }

      // 3. Vérifier que le message n'est pas déjà vérifié
      if (message.email_verified) {
        setStatus('success');
        setMessage('Votre email est déjà vérifié.');
        return;
      }

      // 4. Mettre à jour le message : email_verified = true
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({ email_verified: true, verification_token: null })
        .eq('id', message.id);

      if (updateError) {
        setStatus('error');
        setMessage('Erreur lors de la vérification.');
        return;
      }

      // 5. Notifier l'établissement
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-new-contact-message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business_id: message.business_id }),
          }
        );
      } catch (emailErr) {
        console.warn('Notification failed:', emailErr);
      }

      setStatus('success');
      setMessage('Votre email est vérifié ! Votre demande a été transmise à l\'établissement.');
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="text-marine animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-marine mb-2">Vérification en cours...</h1>
            <p className="text-sm text-gris-texte">Merci de patienter.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-marine mb-2">Email vérifié !</h1>
            <p className="text-sm text-gris-texte mb-6">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={40} className="text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-marine mb-2">Erreur de vérification</h1>
            <p className="text-sm text-gris-texte mb-6">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}