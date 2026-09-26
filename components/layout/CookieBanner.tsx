'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mycambo-cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('mycambo-cookie-consent', 'accepted');
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem('mycambo-cookie-consent', 'refused');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50">
      <div className="bg-ink text-ivory rounded-lg shadow-card p-6 border border-gold/20">
        <h4 className="font-serif text-lg mb-2">🍪 Respect de votre vie privée</h4>
        <p className="text-sm text-ivory/70 mb-4 leading-relaxed">
          Nous utilisons des cookies pour améliorer votre expérience et
          analyser notre trafic. Vous pouvez accepter ou refuser.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <Button onClick={accept} size="sm" className="flex-1">
            Accepter
          </Button>
          <Button onClick={refuse} variant="ghost" size="sm" className="flex-1 text-ivory border-ivory/30 hover:border-gold hover:text-gold">
            Refuser
          </Button>
        </div>
        <Link
          href="/legal/cookies"
          className="text-xs text-gold hover:underline"
        >
          En savoir plus →
        </Link>
      </div>
    </div>
  );
}