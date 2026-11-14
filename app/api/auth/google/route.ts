import { NextResponse, type NextRequest } from 'next/server';

/**
 * Google OAuth has been retired. Return 410 Gone for API/JSON clients
 * and redirect browser requests directly back to the password login portal.
 */
export async function GET(request: NextRequest) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return NextResponse.json(
      { success: false, message: 'Google kimlik doğrulaması devre dışı bırakıldı.' },
      { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const loginUrl = new URL('/login', request.url);
  const res = NextResponse.redirect(loginUrl, 307);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
