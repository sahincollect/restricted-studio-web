import { NextResponse, type NextRequest } from 'next/server';
import { safeRedirectPath } from '@/lib/security-edge';

export async function GET(request: NextRequest) {
  const nextPath = safeRedirectPath(request.nextUrl.searchParams.get('next'), '/hesabim');
  const target = new URL(`/api/auth/oauth/google?next=${encodeURIComponent(nextPath)}`, request.url);
  const res = NextResponse.redirect(target, 307);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
