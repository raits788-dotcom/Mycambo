import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@my-cambo/database/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rafraîchir la session Supabase
  const response = await updateSession(request);

  // 2. Autoriser la page de connexion
  if (pathname === '/connexion') {
    return response;
  }

  // 3. Vérifier le cookie de session admin
  const adminSession = request.cookies.get('mycambo_admin_session');

  if (!adminSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - fichiers publics
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};