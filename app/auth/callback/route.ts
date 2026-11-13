import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  checkBoundedRateLimit,
  getClientIp,
  isLocalHostRequest,
  safeRedirectPath,
} from '@/lib/security-edge';
import {
  clearLegacySupabaseCookies,
  issueCustomerSession,
  isSecureRequest,
} from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

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

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkBoundedRateLimit('auth_login', ip);
  const origin = resolveSafeOrigin(request);

  if (!limit.allowed) {
    return NextResponse.redirect(`${origin}/login?error=rate_limited`);
  }

  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get('error');
  const code = searchParams.get('code');
  const nextPath = safeRedirectPath(searchParams.get('next'), '/dashboard');

  if (oauthError) {
    const mapped = oauthError === 'access_denied' ? 'oauth_denied' : 'oauth_failed';
    return NextResponse.redirect(`${origin}/login?error=${mapped}`);
  }

  if (!code || code.length > 512) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const redirectRes = NextResponse.redirect(`${origin}${nextPath}`);
  redirectRes.headers.set('Cache-Control', 'no-store');
  redirectRes.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const displayName =
    data.user.user_metadata?.username ||
    data.user.user_metadata?.full_name ||
    data.user.user_metadata?.name ||
    data.user.email?.split('@')[0] ||
    'Müşteri';

  // Issue hardened short-lived access + rotating refresh HttpOnly cookies
  await issueCustomerSession(request, redirectRes, {
    id: data.user.id,
    email: data.user.email,
    name: displayName,
  });

  // Explicitly clear any sb-* session/verifier cookies so no JS-readable token persists
  clearLegacySupabaseCookies(request, redirectRes);
  const secure = isSecureRequest(request);
  for (const { name } of pendingCookies) {
    redirectRes.cookies.set(name, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  await writeAuditLog({
    request,
    actorId: data.user.id,
    actorType: 'customer',
    action: 'CUSTOMER_LOGIN_SUCCESS',
    metadata: { provider: 'google_oauth' },
  });

  return redirectRes;
}
