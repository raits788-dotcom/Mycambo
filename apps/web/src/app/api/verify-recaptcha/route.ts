// ============================================================================
// Vérification serveur du token reCAPTCHA v3
// ----------------------------------------------------------------------------
// Le secret RECAPTCHA_SECRET_KEY reste côté serveur (jamais exposé au client).
// ============================================================================

import { NextResponse } from 'next/server';

const SECRET = process.env.RECAPTCHA_SECRET_KEY;
const MIN_SCORE = 0.5; // seuil humain/bot

export async function POST(req: Request) {
  // Clé non configurée : on le signale, on ne bloque pas le dev.
  if (!SECRET) {
    return NextResponse.json({ ok: true, score: 0, warning: 'RECAPTCHA_SECRET_KEY non configurée' });
  }

  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ ok: false, score: 0 }, { status: 400 });

    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(SECRET)}&response=${encodeURIComponent(token)}`,
    });
    const data = await resp.json();
    const score = typeof data.score === 'number' ? data.score : 0;
    return NextResponse.json({ ok: data.success === true && score >= MIN_SCORE, score });
  } catch (e) {
    return NextResponse.json({ ok: false, score: 0 }, { status: 500 });
  }
}
