import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  checkBoundedRateLimit,
  getClientIp,
  isLocalHostRequest,
  safeRedirectPath,
} from '@/lib/security-edge';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

function resolveSafeOrigin(request: NextRequest): string {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').trim();
  const protoHeader = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  if (host && /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) {
    const proto = isLocalHostRequest(request) ? 'http' : protoHeader === 'http' ? 'http' : 'https';
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

async function isOAuthProviderEnabled(provider: 'google' | 'discord'): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { external?: Record<string, boolean> };
    return Boolean(json?.external?.[provider]);
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const ip = getClientIp(request);
  const limit = checkBoundedRateLimit('auth_login', ip);
  const origin = resolveSafeOrigin(request);

  if (!limit.allowed) {
    return NextResponse.redirect(`${origin}/login?error=rate_limited`);
  }

  const { provider: rawProvider } = await params;
  const provider = rawProvider.toLowerCase();
  if (provider !== 'google' && provider !== 'discord') {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const nextPath = safeRedirectPath(request.nextUrl.searchParams.get('next'), '/hesabim');

  const enabled = await isOAuthProviderEnabled(provider);
  if (!enabled) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth_not_configured&provider=${provider}&redirect=${encodeURIComponent(nextPath)}`
    );
  }

  const cookieStore = await cookies();
  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((c) => pendingCookies.push(c));
      },
    },
  });

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(provider === 'discord' ? { scopes: 'identify email' } : {}),
      ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const res = NextResponse.redirect(data.url, 307);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const secure = !isLocalHostRequest(request) && origin.startsWith('https://');
  for (const c of pendingCookies) {
    res.cookies.set(c.name, c.value, {
      ...c.options,
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
  }

  return res;
}
