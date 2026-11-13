const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]{2,45}$/;

export const CUSTOMER_ACCESS_COOKIE = 'rs_access';
export const CUSTOMER_REFRESH_COOKIE = 'rs_refresh';
export const ADMIN_COOKIE = 'rs_admin_session';
export const ADMIN_PREAUTH_COOKIE = 'rs_admin_preauth';
export const ADMIN_ENROLL_COOKIE = 'rs_admin_enroll';
export const ADMIN_REFRESH_COOKIE = 'rs_admin_refresh';

export const CUSTOMER_ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
export const CUSTOMER_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function cleanIpCandidate(raw?: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(',')[0].trim();
  const stripped = first.includes('.') && first.includes(':') ? first.split(':')[0] : first;
  if (IPV4_RE.test(stripped) || (stripped.includes(':') && IPV6_RE.test(stripped))) {
    return stripped.slice(0, 64);
  }
  return null;
}

function ipv4ToUint32(ip: string): number | null {
  if (!IPV4_RE.test(ip)) return null;
  const parts = ip.split('.').map(Number);
  if (parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function ipMatchesRule(ip: string, rule: string): boolean {
  const cleanRule = rule.trim();
  if (!cleanRule) return false;
  if (!cleanRule.includes('/')) {
    return ip.toLowerCase() === cleanRule.toLowerCase();
  }
  const [network, prefixStr] = cleanRule.split('/');
  const prefix = Number(prefixStr);
  const ipNum = ipv4ToUint32(ip);
  const netNum = ipv4ToUint32(network);
  if (ipNum === null || netNum === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipNum & mask) === (netNum & mask);
}

/**
 * Extracts client IP safely, trusting Cloudflare and Vercel edge headers first.
 */
export function getClientIp(request: Request): string {
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('true-client-ip'),
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ];
  for (const cand of candidates) {
    const valid = cleanIpCandidate(cand);
    if (valid) return valid;
  }
  return 'unknown';
}

export function isLocalHostRequest(request: Request): boolean {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
  const cleanHost = host.split(':')[0];
  return (
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost.endsWith('.localhost')
  );
}

/**
 * Enforces optional IP / CIDR allowlist for admin routes (ADMIN_ALLOWED_IPS="1.2.3.4,10.0.0.0/24").
 */
export function isAdminIpAllowed(request: Request): boolean {
  const rawList = process.env.ADMIN_ALLOWED_IPS?.trim();
  if (!rawList) return true;
  if (isLocalHostRequest(request) && process.env.ADMIN_ALLOWED_IPS_STRICT !== '1') {
    return true;
  }
  const clientIp = getClientIp(request);
  if (clientIp === 'unknown') return false;
  const rules = rawList.split(',').map((s) => s.trim()).filter(Boolean);
  return rules.some((rule) => ipMatchesRule(clientIp, rule));
}

/**
 * Enforces optional dedicated subdomain isolation for admin panel (ADMIN_SUBDOMAIN="admin.restrictedstudio.com").
 */
export function isAdminHostAllowed(request: Request): boolean {
  const expected = process.env.ADMIN_SUBDOMAIN?.trim().toLowerCase();
  if (!expected) return true;
  if (isLocalHostRequest(request)) return true;
  const actualHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .trim()
    .toLowerCase();
  return actualHost === expected;
}

/**
 * Identifies requests arriving on the public status subdomain (e.g. status.restrictedstudio.shop).
 */
export function isStatusSubdomainRequest(request: Request): boolean {
  const actualHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .trim()
    .toLowerCase();
  return actualHost === 'status.restrictedstudio.shop' || actualHost.startsWith('status.');
}

/**
 * Prevents Open Redirect attacks on login/OAuth callback redirects.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) return fallback;
  if (/[\x00-\x1f\\]/.test(trimmed)) return fallback;
  return trimmed.slice(0, 256);
}

/**
 * Strict CORS allowlist (never Access-Control-Allow-Origin: *).
 */
export function getAllowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>();
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').trim();
  const proto = request.headers.get('x-forwarded-proto') || (isLocalHostRequest(request) ? 'http' : 'https');
  if (host) {
    allowed.add(`${proto}://${host}`.toLowerCase());
    if (!isLocalHostRequest(request)) {
      allowed.add(`https://${host}`.toLowerCase());
    }
  }

  const configured = [
    process.env.ALLOWED_ORIGINS,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]
    .filter(Boolean)
    .join(',');

  for (const item of configured.split(',')) {
    const clean = item.trim().replace(/\/+$/, '').toLowerCase();
    if (clean.startsWith('https://') || clean.startsWith('http://localhost') || clean.startsWith('http://127.0.0.1')) {
      allowed.add(clean);
    }
  }
  return allowed;
}

export function resolveCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')?.trim();
  const baseHeaders: Record<string, string> = { Vary: 'Origin' };
  if (!origin) return baseHeaders;

  const allowed = getAllowedOrigins(request);
  if (!allowed.has(origin.replace(/\/+$/, '').toLowerCase())) {
    return baseHeaders;
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token, X-Turnstile-Token, X-Admin-Secret',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

/**
 * Validates same-origin state-changing browser requests to defend against CSRF.
 */
export function verifySameOriginRequest(request: Request): { ok: boolean; reason?: string } {
  const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return { ok: false, reason: 'cross-site-fetch' };
  }

  const allowedOrigins = getAllowedOrigins(request);
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const parsed = new URL(origin);
      const originClean = `${parsed.protocol}//${parsed.host}`.toLowerCase();
      if (!allowedOrigins.has(originClean) && (!host || parsed.host.toLowerCase() !== host)) {
        return { ok: false, reason: 'origin-mismatch' };
      }
    } catch {
      return { ok: false, reason: 'invalid-origin' };
    }
  } else {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const parsedRef = new URL(referer);
        const refClean = `${parsedRef.protocol}//${parsedRef.host}`.toLowerCase();
        if (!allowedOrigins.has(refClean) && (!host || parsedRef.host.toLowerCase() !== host)) {
          return { ok: false, reason: 'referer-mismatch' };
        }
      } catch {
        return { ok: false, reason: 'invalid-referer' };
      }
    }
  }

  return { ok: true };
}

/**
 * Optional origin lock: when CLOUDFLARE_ORIGIN_SECRET is configured, ensures traffic came through Cloudflare.
 */
export function verifyCloudflareOriginSecret(request: Request): boolean {
  const expected = process.env.CLOUDFLARE_ORIGIN_SECRET;
  if (!expected) return true;
  if (isLocalHostRequest(request)) return true;
  const provided = request.headers.get('x-cf-origin-secret') || '';
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const EXPLOIT_PATH_RE =
  /(^|\/)(\.env|\.git|\.svn|\.hg|\.aws|\.ssh|\.ds_store|wp-login|wp-admin|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|adminer|phpinfo|cgi-bin|actuator|vendor\/phpunit|boaform|autodiscover)/i;
const DANGEROUS_EXT_RE = /\.(php|phtml|asp|aspx|jsp|jspx|cgi|pl|py|rb|sh|sql|bak|swp|ini|log)$/i;
const TRAVERSAL_RE = /(\.\.[/\\]|%2e%2e|\0)/i;
const ATTACK_QUERY_RE =
  /(<script|%3cscript|\$\{jndi:|union\s+(all\s+)?select|sleep\(\d+\)|benchmark\(|waitfor\s+delay|\/etc\/passwd|boot\.ini|;\s*(cat|wget|curl|bash|sh|powershell)\b)/i;

const EXPLOIT_SCANNER_UA_RE =
  /(sqlmap|nikto|nuclei|acunetix|nessus|openvas|masscan|zgrab|nmap|gobuster|dirbuster|feroxbuster|ffuf|wpscan|wfuzz|havij|commix|jaeles|dalfox|xsstrike|hydra|medusa|scrapy)/i;

const CLI_SCRAPER_UA_RE =
  /(curl\/|wget\/|python-requests|python-urllib|aiohttp|go-http-client|libwww-perl|httpie|mechanize)/i;

/**
 * Detects automated scanners, exploit probes, and aggressive catalog/auth scrapers.
 */
export function inspectThreatRequest(
  pathname: string,
  search: string,
  userAgent: string,
  _method: string
): { blocked: boolean; reason?: string } {
  let decodedPath = pathname;
  let decodedSearch = search;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return { blocked: true, reason: 'malformed-path-encoding' };
  }
  try {
    decodedSearch = decodeURIComponent(search);
  } catch {
    return { blocked: true, reason: 'malformed-query-encoding' };
  }

  if (
    TRAVERSAL_RE.test(pathname) ||
    TRAVERSAL_RE.test(decodedPath) ||
    EXPLOIT_PATH_RE.test(decodedPath) ||
    DANGEROUS_EXT_RE.test(decodedPath)
  ) {
    return { blocked: true, reason: 'exploit-path-probe' };
  }

  if (ATTACK_QUERY_RE.test(search) || ATTACK_QUERY_RE.test(decodedSearch)) {
    return { blocked: true, reason: 'attack-query-signature' };
  }

  if (EXPLOIT_SCANNER_UA_RE.test(userAgent)) {
    return { blocked: true, reason: 'scanner-user-agent' };
  }

  const isDesktopClientEndpoint = pathname.startsWith('/api/v1/verify-client');
  if (!isDesktopClientEndpoint) {
    const isSensitiveBrowserRoute =
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/redeem') ||
      pathname.startsWith('/api/licenses') ||
      pathname.startsWith('/api/download') ||
      pathname.startsWith('/katalog');

    if (isSensitiveBrowserRoute && (!userAgent || CLI_SCRAPER_UA_RE.test(userAgent))) {
      return { blocked: true, reason: 'automated-scraper-blocked' };
    }
  }

  return { blocked: false };
}

export type RateLimitTier =
  | 'admin_login'
  | 'admin_mfa'
  | 'admin_api'
  | 'auth_login'
  | 'auth_anonymous'
  | 'auth_register'
  | 'auth_forgot'
  | 'auth_refresh'
  | 'redeem'
  | 'verify_client'
  | 'download'
  | 'api_default'
  | 'page_catalog'
  | 'page_general';

const TIER_LIMITS: Record<RateLimitTier, { windowMs: number; max: number }> = {
  admin_login: { windowMs: 15 * 60 * 1000, max: 5 },
  admin_mfa: { windowMs: 15 * 60 * 1000, max: 8 },
  admin_api: { windowMs: 60 * 1000, max: 60 },
  auth_login: { windowMs: 15 * 60 * 1000, max: 12 },
  auth_anonymous: { windowMs: 15 * 60 * 1000, max: 5 },
  auth_register: { windowMs: 15 * 60 * 1000, max: 6 },
  auth_forgot: { windowMs: 15 * 60 * 1000, max: 5 },
  auth_refresh: { windowMs: 5 * 60 * 1000, max: 30 },
  redeem: { windowMs: 10 * 60 * 1000, max: 10 },
  verify_client: { windowMs: 5 * 60 * 1000, max: 20 },
  download: { windowMs: 5 * 60 * 1000, max: 15 },
  api_default: { windowMs: 60 * 1000, max: 60 },
  page_catalog: { windowMs: 60 * 1000, max: 60 },
  page_general: { windowMs: 60 * 1000, max: 120 },
};

interface RateBucket {
  count: number;
  resetAt: number;
}

const MAX_BUCKET_ENTRIES = 10000;
const globalStore = globalThis as unknown as { __rsRateLimits?: Map<string, RateBucket> };
const rateMap = (globalStore.__rsRateLimits ||= new Map<string, RateBucket>());

/**
 * Memory-bounded fixed-window rate limiter shared across Edge/Node invocations in an isolate.
 */
export function checkBoundedRateLimit(
  tier: RateLimitTier,
  key: string
): { allowed: boolean; remaining: number; retryAfter: number } {
  const cfg = TIER_LIMITS[tier];
  const now = Date.now();
  const compositeKey = `${tier}:${key}`;

  if (rateMap.size >= MAX_BUCKET_ENTRIES) {
    for (const [k, v] of rateMap.entries()) {
      if (v.resetAt <= now) rateMap.delete(k);
    }
    if (rateMap.size >= MAX_BUCKET_ENTRIES) {
      let dropped = 0;
      const limitDrop = Math.floor(MAX_BUCKET_ENTRIES * 0.1);
      for (const k of rateMap.keys()) {
        rateMap.delete(k);
        if (++dropped >= limitDrop) break;
      }
    }
  }

  let rec = rateMap.get(compositeKey);
  if (!rec || rec.resetAt <= now) {
    rec = { count: 0, resetAt: now + cfg.windowMs };
  }

  rec.count += 1;
  rateMap.set(compositeKey, rec);

  if (rec.count > cfg.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((rec.resetAt - now) / 1000)),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, cfg.max - rec.count),
    retryAfter: 0,
  };
}

export function generateCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

/**
 * Generates strict nonce-based Content-Security-Policy and browser hardening headers.
 * Never permits unsafe-inline or unsafe-eval for script execution in production.
 */
export function buildSecurityHeaders(options: {
  isHttps: boolean;
  isDev: boolean;
  noIndex?: boolean;
  nonce?: string;
}): Record<string, string> {
  const scriptDirectives = [
    "script-src 'self'",
    options.nonce ? `'nonce-${options.nonce}' 'strict-dynamic'` : '',
    options.isDev ? "'unsafe-eval'" : '',
    'https://challenges.cloudflare.com',
  ]
    .filter(Boolean)
    .join(' ');

  const styleElem = [
    "style-src 'self'",
    options.nonce ? `'nonce-${options.nonce}'` : '',
    'https://fonts.googleapis.com',
  ]
    .filter(Boolean)
    .join(' ');

  const cspParts = [
    "default-src 'self'",
    scriptDirectives,
    styleElem,
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://*.supabase.co",
    "object-src 'none'",
    options.isHttps && !options.isDev ? 'upgrade-insecure-requests' : '',
  ].filter(Boolean);

  const headers: Record<string, string> = {
    'Content-Security-Policy': cspParts.join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'X-DNS-Prefetch-Control': 'off',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  if (options.isHttps && !options.isDev) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  }

  if (options.noIndex) {
    headers['X-Robots-Tag'] = 'noindex, nofollow, noarchive';
  }

  return headers;
}

export function getCustomerTokenSecrets(): string[] {
  const candidates = [
    process.env.CUSTOMER_SESSION_SECRET,
    process.env.ADMIN_SESSION_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]
    .map((v) => v?.trim() || '')
    .filter((v) => v.length >= 16);

  if (candidates.length > 0) return candidates;
  if (process.env.NODE_ENV !== 'production') {
    return ['rs-local-dev-only-customer-session-fallback-key'];
  }
  return [];
}

function base64UrlDecodeToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export interface EdgeCustomerClaims {
  sub: string;
  email?: string;
  name?: string;
  role: string;
  fid: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Pure Web Crypto HMAC-SHA256 verification for Edge middleware (no Node crypto dependency).
 */
export async function verifyCustomerAccessCookieEdge(
  token?: string | null
): Promise<{ valid: true; claims: EdgeCustomerClaims } | { valid: false }> {
  if (!token || !token.includes('.')) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [encodedPayload, encodedSig] = parts;
  if (!encodedPayload || !encodedSig || encodedPayload.length > 4096) return { valid: false };

  const secrets = getCustomerTokenSecrets();
  if (secrets.length === 0) return { valid: false };

  let sigBytes: Uint8Array;
  try {
    sigBytes = base64UrlDecodeToBytes(encodedSig);
  } catch {
    return { valid: false };
  }

  const encoder = new TextEncoder();
  const payloadData = encoder.encode(encodedPayload);

  let signatureValid = false;
  for (const secret of secrets) {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const sigBuffer = new ArrayBuffer(sigBytes.byteLength);
      new Uint8Array(sigBuffer).set(sigBytes);
      const ok = await crypto.subtle.verify('HMAC', key, sigBuffer, payloadData);
      if (ok) {
        signatureValid = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!signatureValid) return { valid: false };

  try {
    const rawJson = new TextDecoder().decode(base64UrlDecodeToBytes(encodedPayload));
    const claims = JSON.parse(rawJson) as EdgeCustomerClaims;
    if (!claims?.sub || typeof claims.exp !== 'number') return { valid: false };
    const nowSec = Math.floor(Date.now() / 1000);
    if (claims.exp <= nowSec) return { valid: false };
    return { valid: true, claims };
  } catch {
    return { valid: false };
  }
}
