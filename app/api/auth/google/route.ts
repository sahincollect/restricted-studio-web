import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import {
  checkBoundedRateLimit,
  getClientIp,
  isLocalHostRequest,
  safeRedirectPath,
} from '@/lib/security-edge';
import { isSecureRequest } from '@/lib/customer-session';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

function resolveOrigin(request: NextRequest): string {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').trim();
  const protoHeader = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  if (host && /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) {
    const proto = isLocalHostRequest(request) ? 'http' : protoHeader === 'http' ? 'http' : 'https';
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

/**
 * Initiates Google OAuth PKCE strictly server-side using HttpOnly cookies.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkBoundedRateLimit('auth_login', ip);
  const origin = resolveOrigin(request);

  if (!limit.allowed) {
    return NextResponse.redirect(`${origin}/login?error=rate_limited`);
  }

  const { searchParams } = new URL(request.url);
  const nextPath = safeRedirectPath(searchParams.get('next'), '/dashboard');
  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((c) => pendingCookies.push(c));
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const res = NextResponse.redirect(data.url);
  res.headers.set('Cache-Control', 'no-store');
  const secure = isSecureRequest(request);

  for (const { name, value, options } of pendingCookies) {
    res.cookies.set(name, value, {
      ...options,
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
  }

  return res;
}
