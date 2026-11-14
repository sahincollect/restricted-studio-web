import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminSupabase } from '@/lib/supabase';
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_ACCESS_TTL_SECONDS,
  CUSTOMER_REFRESH_COOKIE,
  CUSTOMER_REFRESH_TTL_SECONDS,
  getClientIp,
  getCustomerTokenSecrets,
  isLocalHostRequest,
} from '@/lib/security-edge';
import { writeAuditLog } from '@/lib/audit-log';
import { sanitizePlainText } from '@/lib/validation';

export interface CustomerUserSession {
  id: string;
  email?: string;
  name?: string;
  role: 'customer';
  familyId: string;
}

export interface DashboardLicenseRow {
  id: string;
  product_name: string;
  hwid: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface DashboardSessionMeta {
  familyId: string;
  issuedAt: number;
  expiresAt: number;
  isGuest: boolean;
}

export interface ServerDashboardSessionResult {
  authenticated: boolean;
  needsRefresh: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
  licenses: DashboardLicenseRow[];
  isAdmin: boolean;
  sessionMeta?: DashboardSessionMeta;
}

interface RefreshClaims {
  sub: string;
  email?: string;
  name?: string;
  role: 'customer';
  fid: string;
  jti: string;
  iat: number;
  iatMs?: number;
  exp: number;
}

interface MemoryRefreshRecord {
  userId: string;
  familyId: string;
  usedAt: number | null;
  revokedAt: number | null;
  expiresAt: number;
}

const MAX_MEMORY_REFRESH = 5000;
const globalRefresh = globalThis as unknown as {
  __rsRefreshStore?: Map<string, MemoryRefreshRecord>;
  __rsRevokedFamilies?: Set<string>;
  __rsRevokedUsers?: Map<string, number>;
};
const memoryRefreshStore = (globalRefresh.__rsRefreshStore ||= new Map<string, MemoryRefreshRecord>());
const memoryRevokedFamilies = (globalRefresh.__rsRevokedFamilies ||= new Set<string>());
const memoryRevokedUsers = (globalRefresh.__rsRevokedUsers ||= new Map<string, number>());

export function isSecureRequest(request: Request): boolean {
  const proto = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  if (proto === 'https') return true;
  if (isLocalHostRequest(request)) return false;
  return process.env.NODE_ENV === 'production';
}

export function readRequestCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie') || '';
  if (!raw) return null;
  const parts = raw.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    if (k === name) {
      const val = trimmed.slice(eqIdx + 1).trim();
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return null;
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function signPayload(payloadObj: Record<string, any>, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedPayload<T extends { exp?: number }>(token?: string | null): T | null {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, encodedSig] = parts;
  if (!encoded || !encodedSig || encoded.length > 4096) return null;

  const secrets = getCustomerTokenSecrets();
  if (secrets.length === 0) return null;

  const providedSigBuf = Buffer.from(encodedSig);
  let verified = false;
  for (const secret of secrets) {
    const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
    const expectedBuf = Buffer.from(expectedSig);
    if (
      providedSigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedSigBuf, expectedBuf)
    ) {
      verified = true;
      break;
    }
  }
  if (!verified) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T;
    if (!parsed || typeof parsed.exp !== 'number') return null;
    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function pruneMemoryRefreshStore() {
  if (memoryRefreshStore.size < MAX_MEMORY_REFRESH) return;
  const now = Date.now();
  for (const [k, rec] of memoryRefreshStore.entries()) {
    if (rec.expiresAt <= now) {
      memoryRefreshStore.delete(k);
    }
  }
  if (memoryRefreshStore.size >= MAX_MEMORY_REFRESH) {
    let dropped = 0;
    for (const k of memoryRefreshStore.keys()) {
      memoryRefreshStore.delete(k);
      if (++dropped >= Math.floor(MAX_MEMORY_REFRESH * 0.2)) break;
    }
  }
}

function createAccessAndRefreshTokens(user: {
  id: string;
  email?: string;
  name?: string;
  familyId?: string;
}): {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  refreshHash: string;
  refreshExpiresAt: Date;
} {
  const secrets = getCustomerTokenSecrets();
  if (secrets.length === 0) {
    throw new Error('Customer session secret is not configured in production');
  }
  const secret = secrets[0];
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const familyId = user.familyId || crypto.randomUUID();

  const accessToken = signPayload(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: 'customer',
      fid: familyId,
      jti: crypto.randomUUID(),
      iat: nowSec,
      iatMs: nowMs,
      exp: nowSec + CUSTOMER_ACCESS_TTL_SECONDS,
    },
    secret
  );

  const refreshToken = signPayload(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: 'customer',
      fid: familyId,
      jti: crypto.randomUUID(),
      iat: nowSec,
      iatMs: nowMs,
      exp: nowSec + CUSTOMER_REFRESH_TTL_SECONDS,
    },
    secret
  );

  const refreshHash = sha256Hex(refreshToken);
  const refreshExpiresAt = new Date((nowSec + CUSTOMER_REFRESH_TTL_SECONDS) * 1000);
  return { accessToken, refreshToken, familyId, refreshHash, refreshExpiresAt };
}

async function persistRefreshToken(params: {
  userId: string;
  familyId: string;
  tokenHash: string;
  parentHash?: string | null;
  expiresAt: Date;
  request: Request;
}) {
  pruneMemoryRefreshStore();
  memoryRefreshStore.set(params.tokenHash, {
    userId: params.userId,
    familyId: params.familyId,
    usedAt: null,
    revokedAt: null,
    expiresAt: params.expiresAt.getTime(),
  });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const adminSupabase = createAdminSupabase();
    await adminSupabase.from('auth_refresh_tokens').insert({
      user_id: params.userId,
      family_id: params.familyId,
      token_hash: params.tokenHash,
      parent_hash: params.parentHash ?? null,
      expires_at: params.expiresAt.toISOString(),
      ip_address: getClientIp(params.request),
      user_agent: sanitizePlainText(params.request.headers.get('user-agent'), 240),
    });
  } catch {
    // Graceful degradation when auth_refresh_tokens table is not yet provisioned
  }
}

async function revokeRefreshFamily(familyId: string) {
  memoryRevokedFamilies.add(familyId);
  for (const [, rec] of memoryRefreshStore.entries()) {
    if (rec.familyId === familyId && !rec.revokedAt) {
      rec.revokedAt = Date.now();
    }
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const adminSupabase = createAdminSupabase();
    await adminSupabase
      .from('auth_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('family_id', familyId)
      .is('revoked_at', null);
  } catch {
    // Ignore when DB table is unavailable
  }
}

export function clearLegacySupabaseCookies(request: Request, response: NextResponse) {
  const raw = request.headers.get('cookie') || '';
  if (!raw) return;
  const secure = isSecureRequest(request);
  const seen = new Set<string>();
  for (const part of raw.split(';')) {
    const eqIdx = part.indexOf('=');
    const name = (eqIdx === -1 ? part : part.slice(0, eqIdx)).trim();
    if (name.startsWith('sb-') && !seen.has(name)) {
      seen.add(name);
      response.cookies.set(name, '', {
        httpOnly: false,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }
  }
}

export function attachCustomerCookies(
  request: Request,
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  const secure = isSecureRequest(request);

  response.cookies.set(CUSTOMER_ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_ACCESS_TTL_SECONDS,
  });

  response.cookies.set(CUSTOMER_REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: CUSTOMER_REFRESH_TTL_SECONDS,
  });

  clearLegacySupabaseCookies(request, response);
}

export function clearCustomerSessionCookies(request: Request, response: NextResponse) {
  const secure = isSecureRequest(request);
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
  clearLegacySupabaseCookies(request, response);
}

/**
 * Issues fresh 15m access + 7d refresh HttpOnly cookies and records the new refresh family.
 */
export async function issueCustomerSession(
  request: Request,
  response: NextResponse,
  user: { id: string; email?: string; name?: string }
): Promise<CustomerUserSession> {
  const tokens = createAccessAndRefreshTokens(user);
  await persistRefreshToken({
    userId: user.id,
    familyId: tokens.familyId,
    tokenHash: tokens.refreshHash,
    expiresAt: tokens.refreshExpiresAt,
    request,
  });

  attachCustomerCookies(request, response, tokens);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'customer',
    familyId: tokens.familyId,
  };
}

export interface RefreshRotationResult {
  ok: boolean;
  user?: CustomerUserSession;
  tokens?: { accessToken: string; refreshToken: string };
  reuseDetected?: boolean;
}

/**
 * Validates and performs single-use Refresh Token rotation with family reuse detection.
 */
export async function rotateCustomerRefreshToken(request: Request): Promise<RefreshRotationResult> {
  const rawRefresh = readRequestCookie(request, CUSTOMER_REFRESH_COOKIE);
  if (!rawRefresh) return { ok: false };

  const claims = verifySignedPayload<RefreshClaims>(rawRefresh);
  if (!claims?.sub || !claims?.fid) return { ok: false };

  const tokenHash = sha256Hex(rawRefresh);
  const nowIso = new Date().toISOString();

  const userRevokedAtMs = memoryRevokedUsers.get(claims.sub);
  const refreshIssuedMs = typeof claims.iatMs === 'number' ? claims.iatMs : (claims.iat ?? 0) * 1000;
  if (memoryRevokedFamilies.has(claims.fid) || (userRevokedAtMs !== undefined && refreshIssuedMs <= userRevokedAtMs)) {
    return { ok: false, reuseDetected: true };
  }

  // Check DB store if available
  let dbChecked = false;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data: existing, error } = await adminSupabase
        .from('auth_refresh_tokens')
        .select('id, user_id, family_id, used_at, revoked_at, expires_at')
        .eq('token_hash', tokenHash)
        .maybeSingle();

      if (!error) {
        dbChecked = true;
        if (existing) {
          if (existing.revoked_at || existing.used_at) {
            // Replay/theft detected -> revoke entire token family immediately
            await revokeRefreshFamily(existing.family_id);
            await writeAuditLog({
              request,
              actorId: existing.user_id,
              actorType: 'customer',
              action: 'REFRESH_TOKEN_REUSE_DETECTED',
              resourceType: 'auth_refresh_family',
              resourceId: existing.family_id,
            });
            return { ok: false, reuseDetected: true };
          }

          if (new Date(existing.expires_at).getTime() <= Date.now()) {
            return { ok: false };
          }

          // Atomic single-use claim update
          const { data: claimed } = await adminSupabase
            .from('auth_refresh_tokens')
            .update({ used_at: nowIso })
            .eq('id', existing.id)
            .is('used_at', null)
            .is('revoked_at', null)
            .select('id')
            .maybeSingle();

          if (!claimed) {
            await revokeRefreshFamily(existing.family_id);
            await writeAuditLog({
              request,
              actorId: existing.user_id,
              actorType: 'customer',
              action: 'REFRESH_TOKEN_RACE_REUSE_DETECTED',
              resourceType: 'auth_refresh_family',
              resourceId: existing.family_id,
            });
            return { ok: false, reuseDetected: true };
          }
        }
      }
    } catch {
      dbChecked = false;
    }
  }

  // In-memory store check & rotation fallback
  const memRec = memoryRefreshStore.get(tokenHash);
  if (memRec) {
    if (memRec.revokedAt || memRec.usedAt) {
      await revokeRefreshFamily(memRec.familyId);
      await writeAuditLog({
        request,
        actorId: memRec.userId,
        actorType: 'customer',
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        resourceType: 'auth_refresh_family',
        resourceId: memRec.familyId,
      });
      return { ok: false, reuseDetected: true };
    }
    memRec.usedAt = Date.now();
  } else if (dbChecked) {
    // Unknown token not present in DB when DB is healthy
    return { ok: false };
  }

  const nextTokens = createAccessAndRefreshTokens({
    id: claims.sub,
    email: claims.email,
    name: claims.name,
    familyId: claims.fid,
  });

  await persistRefreshToken({
    userId: claims.sub,
    familyId: nextTokens.familyId,
    tokenHash: nextTokens.refreshHash,
    parentHash: tokenHash,
    expiresAt: nextTokens.refreshExpiresAt,
    request,
  });

  return {
    ok: true,
    user: {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
      role: 'customer',
      familyId: claims.fid,
    },
    tokens: {
      accessToken: nextTokens.accessToken,
      refreshToken: nextTokens.refreshToken,
    },
  };
}

export async function revokeCurrentCustomerRefreshFamily(request: Request): Promise<string | null> {
  const rawRefresh = readRequestCookie(request, CUSTOMER_REFRESH_COOKIE);
  const rawAccess = readRequestCookie(request, CUSTOMER_ACCESS_COOKIE);

  const refreshClaims = verifySignedPayload<RefreshClaims>(rawRefresh);
  const accessClaims = verifySignedPayload<RefreshClaims>(rawAccess);
  const familyId = refreshClaims?.fid || accessClaims?.fid;
  const userId = refreshClaims?.sub || accessClaims?.sub || null;

  if (familyId) {
    await revokeRefreshFamily(familyId);
  }
  return userId;
}

export async function revokeAllCustomerSessions(userId: string): Promise<void> {
  if (!userId) return;
  const revokedAtMs = Date.now();
  memoryRevokedUsers.set(userId, revokedAtMs);

  for (const [, rec] of memoryRefreshStore.entries()) {
    if (rec.userId === userId) {
      rec.revokedAt = revokedAtMs;
      memoryRevokedFamilies.add(rec.familyId);
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const adminSupabase = createAdminSupabase();
    await adminSupabase
      .from('auth_refresh_tokens')
      .update({ revoked_at: new Date(revokedAtMs).toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);
  } catch {
    // Ignore when DB table is unavailable
  }
}

async function isFamilyOrUserRevoked(
  userId: string,
  familyId: string,
  iatMs?: number,
  iatSec?: number
): Promise<boolean> {
  if (memoryRevokedFamilies.has(familyId)) {
    return true;
  }

  const userRevokedAtMs = memoryRevokedUsers.get(userId);
  if (userRevokedAtMs !== undefined) {
    const tokenIssuedMs = typeof iatMs === 'number' ? iatMs : (iatSec ?? 0) * 1000;
    if (tokenIssuedMs <= userRevokedAtMs) {
      return true;
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }

  try {
    const adminSupabase = createAdminSupabase();
    const { data: rows, error } = await adminSupabase
      .from('auth_refresh_tokens')
      .select('revoked_at')
      .eq('family_id', familyId)
      .limit(10);

    if (!error && Array.isArray(rows) && rows.length > 0 && rows.every((r) => Boolean(r.revoked_at))) {
      memoryRevokedFamilies.add(familyId);
      return true;
    }
  } catch {
    // Graceful degradation
  }

  return false;
}

export interface ResolvedCustomerSession {
  authenticated: boolean;
  user?: CustomerUserSession;
  refreshedTokens?: { accessToken: string; refreshToken: string };
  clearCookies?: boolean;
}

/**
 * Resolves authenticated customer purely from HttpOnly cookies (auto-rotating via rs_refresh if access expired).
 */
export async function resolveCustomerSession(request: Request): Promise<ResolvedCustomerSession> {
  const accessCookie = readRequestCookie(request, CUSTOMER_ACCESS_COOKIE);
  const accessClaims = verifySignedPayload<RefreshClaims>(accessCookie);

  if (
    accessClaims?.role === 'customer' &&
    accessClaims?.sub &&
    accessClaims?.fid &&
    !(await isFamilyOrUserRevoked(accessClaims.sub, accessClaims.fid, accessClaims.iatMs, accessClaims.iat))
  ) {
    return {
      authenticated: true,
      user: {
        id: accessClaims.sub,
        email: accessClaims.email,
        name: accessClaims.name,
        role: 'customer',
        familyId: accessClaims.fid,
      },
    };
  }

  const refreshCookie = readRequestCookie(request, CUSTOMER_REFRESH_COOKIE);
  if (!refreshCookie) {
    return { authenticated: false };
  }

  const rotated = await rotateCustomerRefreshToken(request);
  if (rotated.ok && rotated.user && rotated.tokens) {
    return {
      authenticated: true,
      user: rotated.user,
      refreshedTokens: rotated.tokens,
    };
  }

  return {
    authenticated: false,
    clearCookies: Boolean(rotated.reuseDetected),
  };
}

/**
 * Verifies customer session inside Server Components (SSR) before any /dashboard HTML is emitted.
 * Does not mutate refresh tokens (DashboardClient triggers silent API rotation when needsRefresh=true).
 */
export async function verifyServerDashboardSession(): Promise<ServerDashboardSessionResult> {
  const cookieStore = await cookies();
  const accessRaw = cookieStore.get(CUSTOMER_ACCESS_COOKIE)?.value;
  const refreshRaw = cookieStore.get(CUSTOMER_REFRESH_COOKIE)?.value;

  let sessionClaims: RefreshClaims | null = null;
  let needsRefresh = false;

  const accessClaims = verifySignedPayload<RefreshClaims>(accessRaw);
  if (
    accessClaims?.role === 'customer' &&
    accessClaims?.sub &&
    accessClaims?.fid &&
    !(await isFamilyOrUserRevoked(accessClaims.sub, accessClaims.fid, accessClaims.iatMs, accessClaims.iat))
  ) {
    sessionClaims = accessClaims;
  } else if (refreshRaw) {
    const refreshClaims = verifySignedPayload<RefreshClaims>(refreshRaw);
    if (
      refreshClaims?.role === 'customer' &&
      refreshClaims?.sub &&
      refreshClaims?.fid &&
      !(await isFamilyOrUserRevoked(refreshClaims.sub, refreshClaims.fid, refreshClaims.iatMs, refreshClaims.iat))
    ) {
      const tokenHash = sha256Hex(refreshRaw);
      const memRec = memoryRefreshStore.get(tokenHash);
      if (memRec && (memRec.revokedAt || memRec.usedAt)) {
        return { authenticated: false, needsRefresh: false, licenses: [], isAdmin: false };
      }

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const adminSupabase = createAdminSupabase();
          const { data: existing, error } = await adminSupabase
            .from('auth_refresh_tokens')
            .select('revoked_at, used_at, expires_at')
            .eq('token_hash', tokenHash)
            .maybeSingle();

          if (!error) {
            if (
              !existing ||
              existing.revoked_at ||
              existing.used_at ||
              new Date(existing.expires_at).getTime() <= Date.now()
            ) {
              return { authenticated: false, needsRefresh: false, licenses: [], isAdmin: false };
            }
          }
        } catch {
          // Rely on in-memory store when DB check is unavailable
        }
      }

      sessionClaims = refreshClaims;
      needsRefresh = true;
    }
  }

  if (!sessionClaims) {
    return { authenticated: false, needsRefresh: false, licenses: [], isAdmin: false };
  }

  let licenses: DashboardLicenseRow[] = [];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('user_licenses')
        .select('id, product_name, hwid, status, expires_at, created_at')
        .eq('user_id', sessionClaims.sub)
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        licenses = data as DashboardLicenseRow[];
      }
    } catch {
      licenses = [];
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const isAdmin = Boolean(adminEmail && sessionClaims.email?.toLowerCase() === adminEmail);
  const isGuest = Boolean(sessionClaims.email?.toLowerCase().endsWith('@anon.restrictedstudio.shop'));

  return {
    authenticated: true,
    needsRefresh,
    user: {
      id: sessionClaims.sub,
      email: sessionClaims.email,
      name: sessionClaims.name,
    },
    licenses,
    isAdmin,
    sessionMeta: {
      familyId: sessionClaims.fid,
      issuedAt: sessionClaims.iat,
      expiresAt: sessionClaims.exp,
      isGuest,
    },
  };
}
