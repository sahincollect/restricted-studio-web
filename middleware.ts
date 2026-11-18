import { NextResponse, type NextRequest } from 'next/server';
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  buildSecurityHeaders,
  checkBoundedRateLimit,
  generateCspNonce,
  getClientIp,
  inspectThreatRequest,
  isAdminHostAllowed,
  isAdminIpAllowed,
  isLocalHostRequest,
  isStatusSubdomainRequest,
  resolveCorsHeaders,
  safeRedirectPath,
  verifyCloudflareOriginSecret,
  verifyCustomerAccessCookieEdge,
  verifyCustomerRefreshCookieEdge,
} from '@/lib/security-edge';
import { SITE_URL } from '@/lib/site-config';

function buildSecHeadersForRequest(request: NextRequest, noIndex: boolean, nonce: string): Record<string, string> {
  const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')).toLowerCase();
  const isHttps = proto === 'https' && !isLocalHostRequest(request);
  const isDev = process.env.NODE_ENV !== 'production';
  return buildSecurityHeaders({ isHttps, isDev, noIndex, nonce });
}

function isSecureEdgeCookie(request: NextRequest): boolean {
  const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')).toLowerCase();
  return proto === 'https' && !isLocalHostRequest(request);
}

function buildSameOriginUrl(request: NextRequest, pathname: string): URL {
  const hostHeader = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').trim();
  const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '') || 'http')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (hostHeader) {
    try {
      return new URL(pathname, `${proto}://${hostHeader.split(',')[0].trim()}`);
    } catch {
      // Fallback below
    }
  }
  return new URL(pathname, request.url);
}

function expireCustomerCookies(response: NextResponse, request: NextRequest): void {
  const secure = isSecureEdgeCookie(request);
  response.cookies.set(CUSTOMER_ACCESS_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(CUSTOMER_REFRESH_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

function applyResponseHeaders(
  response: NextResponse,
  request: NextRequest,
  secHeaders: Record<string, string>,
  isApi: boolean,
  noStore = false,
  allowPublicCache = false
): NextResponse {
  for (const [k, v] of Object.entries(secHeaders)) {
    response.headers.set(k, v);
  }
  if (isApi) {
    const cors = resolveCorsHeaders(request);
    for (const [k, v] of Object.entries(cors)) {
      response.headers.set(k, v);
    }
    if (!allowPublicCache && !response.headers.has('Cache-Control')) {
      response.headers.set('Cache-Control', 'no-store');
    }
  }
  if (noStore) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search || '';
  const ua = request.headers.get('user-agent') || '';
  const isStatusSubdomain = isStatusSubdomainRequest(request);
  const isApi = path.startsWith('/api/');
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isPrivateOrAuth =
    isApi ||
    isAdminPath ||
    path.startsWith('/dashboard') ||
    path.startsWith('/hesabim') ||
    path.startsWith('/siparisler') ||
    path.startsWith('/auth') ||
    path === '/login' ||
    path === '/register';

  const nonce = generateCspNonce();
  const secHeaders = buildSecHeadersForRequest(request, isPrivateOrAuth, nonce);

  try {
    // 1. Optional Cloudflare Origin Lock (active when CLOUDFLARE_ORIGIN_SECRET is set)
    if (!verifyCloudflareOriginSecret(request)) {
      return applyResponseHeaders(
        new NextResponse(isApi ? JSON.stringify({ success: false, message: 'Forbidden.' }) : 'Forbidden', {
          status: 403,
          headers: isApi ? { 'Content-Type': 'application/json' } : undefined,
        }),
        request,
        secHeaders,
        isApi
      );
    }

    // 2. Strict CORS Preflight for API endpoints (never Allow-Origin: *)
    if (isApi && request.method === 'OPTIONS') {
      const cors = resolveCorsHeaders(request);
      if (!cors['Access-Control-Allow-Origin']) {
        return new NextResponse(null, { status: 403, headers: { Vary: 'Origin' } });
      }
      return applyResponseHeaders(new NextResponse(null, { status: 204 }), request, secHeaders, true);
    }

    // 3. Scanner, Exploit-Path & Scraper Shield
    const threat = inspectThreatRequest(path, search, ua, request.method);
    if (threat.blocked) {
      return applyResponseHeaders(
        new NextResponse(
          isApi
            ? JSON.stringify({ success: false, message: 'Güvenlik politikası gereği istek engellendi.' })
            : 'Erişim reddedildi.',
          {
            status: 403,
            headers: {
              'Cache-Control': 'no-store',
              ...(isApi ? { 'Content-Type': 'application/json' } : {}),
            },
          }
        ),
        request,
        { ...secHeaders, 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
        isApi
      );
    }

    // 4. Zero-Trust Admin Isolation (dedicated subdomain + CIDR IP Whitelisting)
    if (isAdminPath) {
      if (isStatusSubdomain || !isAdminHostAllowed(request)) {
        return applyResponseHeaders(
          new NextResponse(
            isApi
              ? JSON.stringify({ success: false, message: 'Yönetici rotası bu alan adında devre dışı.' })
              : 'Sayfa bulunamadı.',
            {
              status: isApi ? 403 : 404,
              headers: {
                'Cache-Control': 'no-store',
                ...(isApi ? { 'Content-Type': 'application/json' } : {}),
              },
            }
          ),
          request,
          secHeaders,
          isApi
        );
      }

      if (!isAdminIpAllowed(request)) {
        return applyResponseHeaders(
          new NextResponse(
            isApi
              ? JSON.stringify({ success: false, message: 'Bu IP adresi yönetici erişimi için yetkili değil.' })
              : 'Erişim reddedildi (IP politikası).',
            {
              status: 403,
              headers: {
                'Cache-Control': 'no-store',
                ...(isApi ? { 'Content-Type': 'application/json' } : {}),
              },
            }
          ),
          request,
          secHeaders,
          isApi
        );
      }
    }

    // 5. Edge Rate Limiting
    const ip = getClientIp(request);
    const rateTier = path.startsWith('/katalog')
      ? 'page_catalog'
      : isApi
      ? 'api_default'
      : 'page_general';
    const edgeLimit = checkBoundedRateLimit(rateTier, ip);
    if (!edgeLimit.allowed) {
      return applyResponseHeaders(
        new NextResponse(
          isApi
            ? JSON.stringify({
                success: false,
                message: 'Çok fazla istek algılandı. Lütfen daha sonra tekrar deneyin.',
              })
            : 'Çok fazla istek gönderildi. Lütfen kısa bir süre sonra tekrar deneyin.',
          {
            status: 429,
            headers: {
              'Retry-After': String(edgeLimit.retryAfter),
              'Cache-Control': 'no-store',
              ...(isApi ? { 'Content-Type': 'application/json' } : {}),
            },
          }
        ),
        request,
        secHeaders,
        isApi
      );
    }

    // 6. Customer Page Access Gate (/dashboard, /hesabim, /siparisler, /login, /register) using HttpOnly cookies only
    const isPublicCatalogFeed = path === '/api/catalog/items' && request.method === 'GET';
    const isPortalNoStore =
      (isApi && !isPublicCatalogFeed) ||
      isAdminPath ||
      path.startsWith('/dashboard') ||
      path.startsWith('/hesabim') ||
      path.startsWith('/siparisler') ||
      path === '/login' ||
      path === '/register' ||
      path.startsWith('/auth');
    let clearStaleOnNext = false;

    const isProtectedCustomerPage =
      path.startsWith('/dashboard') || path.startsWith('/hesabim') || path.startsWith('/siparisler');

    if (isProtectedCustomerPage || path === '/login' || path === '/register') {
      const accessCookie = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value;
      const refreshCookie = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value;
      const accessCheck = await verifyCustomerAccessCookieEdge(accessCookie);
      const refreshCheck = accessCheck.valid
        ? { valid: true as const }
        : await verifyCustomerRefreshCookieEdge(refreshCookie);
      const clearSessionRequested = request.nextUrl.searchParams.get('clear_session') === '1';

      if (isProtectedCustomerPage && !accessCheck.valid && !refreshCheck.valid) {
        const redirectUrl = buildSameOriginUrl(request, '/login');
        redirectUrl.searchParams.set('redirect', safeRedirectPath(`${path}${search}`, '/dashboard'));
        const redirectRes = NextResponse.redirect(redirectUrl, 307);
        expireCustomerCookies(redirectRes, request);
        return applyResponseHeaders(redirectRes, request, secHeaders, false, true);
      }

      if ((path === '/login' || path === '/register') && clearSessionRequested) {
        clearStaleOnNext = true;
      } else if ((path === '/login' || path === '/register') && accessCheck.valid) {
        return applyResponseHeaders(
          NextResponse.redirect(buildSameOriginUrl(request, '/hesabim'), 307),
          request,
          secHeaders,
          false,
          true
        );
      }
    }

    // Forward nonce & CSP on request headers so Next.js 15 auto-nonces SSR/hydration scripts
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', secHeaders['Content-Security-Policy']);

    // Dedicated public status subdomain routing (status.restrictedstudio.shop -> /status)
    if (isStatusSubdomain) {
      if (path === '/' || path === '/status') {
        const rewriteUrl = new URL('/status', request.url);
        const rewriteRes = NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        });
        return applyResponseHeaders(rewriteRes, request, secHeaders, false);
      }
      if (path === '/api/health') {
        return applyResponseHeaders(
          NextResponse.next({ request: { headers: requestHeaders } }),
          request,
          secHeaders,
          true
        );
      }
      if (isApi) {
        return applyResponseHeaders(
          NextResponse.json(
            { success: false, message: 'Bu uç nokta durum alt alan adında kullanılamaz.' },
            { status: 404 }
          ),
          request,
          secHeaders,
          true
        );
      }
      if (!isLocalHostRequest(request)) {
        return applyResponseHeaders(
          NextResponse.redirect(`${SITE_URL}${path}${search}`, 307),
          request,
          secHeaders,
          false
        );
      }
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    if (clearStaleOnNext) {
      expireCustomerCookies(response, request);
    }
    return applyResponseHeaders(response, request, secHeaders, isApi, isPortalNoStore, isPublicCatalogFeed);
  } catch {
    return applyResponseHeaders(NextResponse.next(), request, secHeaders, isApi);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_vercel|\\.well-known/|favicon\\.ico|icon-.*\\.png|apple-touch-icon\\.png|manifest\\.webmanifest|assets/|robots\\.txt|sitemap\\.xml).*)',
  ],
};
