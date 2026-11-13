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
} from '@/lib/security-edge';

function buildSecHeadersForRequest(request: NextRequest, noIndex: boolean, nonce: string): Record<string, string> {
  const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')).toLowerCase();
  const isHttps = proto === 'https' && !isLocalHostRequest(request);
  const isDev = process.env.NODE_ENV !== 'production';
  return buildSecurityHeaders({ isHttps, isDev, noIndex, nonce });
}

function applyResponseHeaders(
  response: NextResponse,
  request: NextRequest,
  secHeaders: Record<string, string>,
  isApi: boolean
): NextResponse {
  for (const [k, v] of Object.entries(secHeaders)) {
    response.headers.set(k, v);
  }
  if (isApi) {
    const cors = resolveCorsHeaders(request);
    for (const [k, v] of Object.entries(cors)) {
      response.headers.set(k, v);
    }
    if (!response.headers.has('Cache-Control')) {
      response.headers.set('Cache-Control', 'no-store');
    }
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

    // 6. Customer Page Access Gate (/dashboard, /login, /register) using HttpOnly cookies only
    if (path.startsWith('/dashboard') || path === '/login' || path === '/register') {
      const accessCookie = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value;
      const refreshCookie = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value;
      const accessCheck = await verifyCustomerAccessCookieEdge(accessCookie);

      if (path.startsWith('/dashboard') && !accessCheck.valid && !refreshCookie) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', safeRedirectPath(path, '/dashboard'));
        return applyResponseHeaders(NextResponse.redirect(redirectUrl), request, secHeaders, false);
      }

      if ((path === '/login' || path === '/register') && accessCheck.valid) {
        return applyResponseHeaders(
          NextResponse.redirect(new URL('/dashboard', request.url)),
          request,
          secHeaders,
          false
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
        const mainSiteBase = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.restrictedstudio.shop').replace(/\/+$/, '');
        return applyResponseHeaders(
          NextResponse.redirect(`${mainSiteBase}${path}${search}`, 307),
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
    return applyResponseHeaders(response, request, secHeaders, isApi);
  } catch {
    return applyResponseHeaders(NextResponse.next(), request, secHeaders, isApi);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon-.*\\.png|apple-touch-icon\\.png|manifest\\.webmanifest|assets/|robots\\.txt|sitemap\\.xml).*)',
  ],
};
