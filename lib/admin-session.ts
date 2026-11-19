import crypto from 'crypto';
import type { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_ENROLL_COOKIE,
  ADMIN_PREAUTH_COOKIE,
  ADMIN_REFRESH_COOKIE,
  getClientIp,
} from '@/lib/security-edge';
import { isSecureRequest } from '@/lib/customer-session';
import { verifyArgon2idPassword } from '@/lib/password-security';
import { decryptMfaSecret, encryptMfaSecret } from '@/lib/admin-mfa';
import { createAdminSupabase } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/audit-log';

export { ADMIN_COOKIE, ADMIN_PREAUTH_COOKIE, ADMIN_ENROLL_COOKIE, ADMIN_REFRESH_COOKIE };

export const SESSION_TTL_SECONDS = 15 * 60; // 15 dakika kısa ömürlü yükseltilmiş oturum
export const ADMIN_REFRESH_TTL_SECONDS = 4 * 60 * 60; // 4 saat rotasyonlu yenileme ömrü
export const PREAUTH_TTL_SECONDS = 5 * 60; // 5 dakika MFA bekleme süresi
export const ENROLL_TTL_SECONDS = 10 * 60; // 10 dakika TOTP kurulum penceresi

export interface AdminSessionClaims {
  v: 2;
  type: 'elevated';
  sub: string;
  mfa: true;
  fid: string;
  jti: string;
  iat: number;
  exp: number;
}

interface AdminPreAuthClaims {
  v: 2;
  type: 'preauth';
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

interface AdminEnrollClaims {
  v: 2;
  type: 'enroll';
  sub: string;
  encSecret: string;
  jti: string;
  exp: number;
}

interface AdminRefreshRecord {
  sub: string;
  fid: string;
  used: boolean;
  revoked: boolean;
  expiresAt: number;
}

const globalAdminRefresh = globalThis as unknown as {
  __rsAdminRefreshMap?: Map<string, AdminRefreshRecord>;
  __rsAdminRevokedFamilies?: Set<string>;
};
const adminRefreshMap = (globalAdminRefresh.__rsAdminRefreshMap ||= new Map());
const adminRevokedFamilies = (globalAdminRefresh.__rsAdminRevokedFamilies ||= new Set());

function sessionSecret(): string | null {
  const s = (process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || '').trim();
  return s.length >= 16 ? s : null;
}

export function isAdminSessionSecretConfigured(): boolean {
  return Boolean(sessionSecret());
}

function sha256Buf(value: string) {
  return crypto.createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Buf(a), sha256Buf(b));
}

function signStructuredToken(payload: Record<string, any>): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET tanımlı değil.');
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyStructuredToken<T extends { v?: number; exp?: number }>(token?: string | null): T | null {
  const secret = sessionSecret();
  if (!secret || !token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig || encoded.length > 4096) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T;
    if (!claims || claims.v !== 2 || typeof claims.exp !== 'number') return null;
    if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

interface EnvAdminOperator {
  username: string;
  passwordHash: string;
}

function decodeHashField(rawHash: string): string {
  const clean = rawHash.trim();
  if (clean.startsWith('$argon2id$')) return clean;
  if (clean.startsWith('b64:')) {
    try {
      const decoded = Buffer.from(clean.slice(4), 'base64').toString('utf8').trim();
      if (decoded.startsWith('$argon2id$')) return decoded;
    } catch {
      return '';
    }
  }
  return '';
}

function parseEnvAdminOperators(): EnvAdminOperator[] {
  const rawJson = process.env.ADMIN_OPERATORS_JSON?.trim();
  const rawB64 = process.env.ADMIN_OPERATORS_B64?.trim();
  let jsonStr = rawJson || '';
  if (!jsonStr && rawB64) {
    try {
      jsonStr = Buffer.from(rawB64, 'base64').toString('utf8');
    } catch {
      return [];
    }
  }
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EnvAdminOperator[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as EnvAdminOperator).username === 'string' &&
        typeof (item as EnvAdminOperator).passwordHash === 'string'
      ) {
        const phc = decodeHashField((item as EnvAdminOperator).passwordHash);
        if (phc) {
          out.push({
            username: (item as EnvAdminOperator).username.trim(),
            passwordHash: phc,
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Verifies admin username + password against primary env credentials (ADMIN_USERNAME +
 * ADMIN_PASSWORD_HASH / ADMIN_PASSWORD), ADMIN_OPERATORS_JSON, or Supabase `admin_operators`.
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  if (!sessionSecret()) return false;
  const cleanUser = username.trim();
  if (!cleanUser || !password) return false;

  const u = process.env.ADMIN_USERNAME?.trim();
  const p = process.env.ADMIN_PASSWORD;
  const pHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (u && (p || pHash)) {
    const userOk = safeEqual(cleanUser.toLowerCase(), u.toLowerCase());
    let passOk = false;
    if (pHash && pHash.startsWith('$argon2id$')) {
      passOk = await verifyArgon2idPassword(password, pHash);
    } else if (p && p.trim().startsWith('$argon2id$')) {
      passOk = await verifyArgon2idPassword(password, p.trim());
    } else if (p) {
      passOk = safeEqual(password, p);
    }
    if (userOk && passOk) return true;
  }

  for (const op of parseEnvAdminOperators()) {
    if (safeEqual(cleanUser.toLowerCase(), op.username.toLowerCase())) {
      if (await verifyArgon2idPassword(password, op.passwordHash)) {
        return true;
      }
    }
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data: rows, error } = await adminSupabase
        .from('admin_operators')
        .select('username, password_hash')
        .ilike('username', cleanUser)
        .eq('is_active', true)
        .limit(3);

      if (!error && Array.isArray(rows)) {
        for (const row of rows) {
          const dbHash = typeof row.password_hash === 'string' ? row.password_hash.trim() : '';
          if (
            typeof row.username === 'string' &&
            safeEqual(cleanUser.toLowerCase(), row.username.toLowerCase()) &&
            dbHash.startsWith('$argon2id$')
          ) {
            if (await verifyArgon2idPassword(password, dbHash)) {
              return true;
            }
          }
        }
      }
    } catch {
      // Non-fatal if admin_operators table is not migrated yet
    }
  }

  return false;
}

export function createSessionToken(sub = process.env.ADMIN_USERNAME || 'admin', familyId?: string): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const claims: AdminSessionClaims = {
    v: 2,
    type: 'elevated',
    sub,
    mfa: true,
    fid: familyId || crypto.randomUUID(),
    jti: crypto.randomUUID(),
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
  };
  return signStructuredToken(claims);
}

export function verifySessionToken(token?: string | null): AdminSessionClaims | null {
  const claims = verifyStructuredToken<AdminSessionClaims>(token);
  if (!claims || claims.type !== 'elevated' || claims.mfa !== true || !claims.fid) return null;
  if (adminRevokedFamilies.has(claims.fid)) return null;
  return claims;
}

export function createPreAuthToken(sub: string): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const claims: AdminPreAuthClaims = {
    v: 2,
    type: 'preauth',
    sub,
    jti: crypto.randomUUID(),
    iat: nowSec,
    exp: nowSec + PREAUTH_TTL_SECONDS,
  };
  return signStructuredToken(claims);
}

export function verifyPreAuthToken(token?: string | null): AdminPreAuthClaims | null {
  const claims = verifyStructuredToken<AdminPreAuthClaims>(token);
  if (!claims || claims.type !== 'preauth' || !claims.sub) return null;
  return claims;
}

export function createEnrollmentCookieValue(sub: string, plainBase32Secret: string): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const claims: AdminEnrollClaims = {
    v: 2,
    type: 'enroll',
    sub,
    encSecret: encryptMfaSecret(plainBase32Secret),
    jti: crypto.randomUUID(),
    exp: nowSec + ENROLL_TTL_SECONDS,
  };
  return signStructuredToken(claims);
}

export function verifyEnrollmentCookieValue(token?: string | null): { sub: string; secret: string } | null {
  const claims = verifyStructuredToken<AdminEnrollClaims>(token);
  if (!claims || claims.type !== 'enroll' || !claims.encSecret) return null;
  const dec = decryptMfaSecret(claims.encSecret);
  if (!dec) return null;
  return { sub: claims.sub, secret: dec };
}

export function createAdminRefreshToken(sub: string, familyId: string): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const token = signStructuredToken({
    v: 2,
    type: 'admin_refresh',
    sub,
    fid: familyId,
    jti: crypto.randomUUID(),
    iat: nowSec,
    exp: nowSec + ADMIN_REFRESH_TTL_SECONDS,
  });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (adminRefreshMap.size > 500) {
    const now = Date.now();
    for (const [k, rec] of adminRefreshMap.entries()) {
      if (rec.expiresAt <= now) adminRefreshMap.delete(k);
    }
  }
  adminRefreshMap.set(tokenHash, {
    sub,
    fid: familyId,
    used: false,
    revoked: false,
    expiresAt: (nowSec + ADMIN_REFRESH_TTL_SECONDS) * 1000,
  });
  return token;
}

export function attachAdminElevatedCookies(
  request: Request,
  response: NextResponse,
  sub: string,
  familyId: string = crypto.randomUUID()
) {
  const secure = isSecureRequest(request);
  const accessToken = createSessionToken(sub, familyId);
  const refreshToken = createAdminRefreshToken(sub, familyId);

  response.cookies.set(ADMIN_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  response.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: ADMIN_REFRESH_TTL_SECONDS,
  });

  // Clear temporary MFA challenge cookies
  response.cookies.set(ADMIN_PREAUTH_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
  response.cookies.set(ADMIN_ENROLL_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
}

export function clearAdminCookies(request: Request, response: NextResponse) {
  const secure = isSecureRequest(request);
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
  response.cookies.set(ADMIN_PREAUTH_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
  response.cookies.set(ADMIN_ENROLL_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      const val = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return null;
}

export function getValidAdminSession(request: Request): AdminSessionClaims | null {
  return verifySessionToken(readCookie(request, ADMIN_COOKIE));
}

export function hasValidAdminSession(request: Request): boolean {
  return Boolean(getValidAdminSession(request));
}

/**
 * Resolves elevated admin session, rotating rs_admin_refresh cleanly when short-lived access expires.
 */
export async function resolveElevatedAdminSession(request: Request): Promise<{
  authenticated: boolean;
  claims?: AdminSessionClaims;
  rotatedSub?: string;
  rotatedFamilyId?: string;
  reuseDetected?: boolean;
}> {
  const current = getValidAdminSession(request);
  if (current) {
    return { authenticated: true, claims: current };
  }

  const rawRefresh = readCookie(request, ADMIN_REFRESH_COOKIE);
  if (!rawRefresh) return { authenticated: false };

  const claims = verifyStructuredToken<{ v: 2; type: 'admin_refresh'; sub: string; fid: string; exp: number }>(
    rawRefresh
  );
  if (!claims || claims.type !== 'admin_refresh' || !claims.fid || adminRevokedFamilies.has(claims.fid)) {
    return { authenticated: false };
  }

  const hash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  const rec = adminRefreshMap.get(hash);
  if (!rec) {
    return { authenticated: false };
  }
  if (rec.used || rec.revoked || rec.expiresAt <= Date.now()) {
    adminRevokedFamilies.add(claims.fid);
    for (const [, entry] of adminRefreshMap.entries()) {
      if (entry.fid === claims.fid) entry.revoked = true;
    }
    await writeAuditLog({
      request,
      actorId: claims.sub,
      actorType: 'admin',
      action: 'ADMIN_REFRESH_REUSE_DETECTED',
      resourceType: 'admin_session_family',
      resourceId: claims.fid,
      metadata: { ip: getClientIp(request) },
    });
    return { authenticated: false, reuseDetected: true };
  }

  rec.used = true;
  return {
    authenticated: true,
    claims: {
      v: 2,
      type: 'elevated',
      sub: claims.sub,
      mfa: true,
      fid: claims.fid,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    },
    rotatedSub: claims.sub,
    rotatedFamilyId: claims.fid,
  };
}

export function revokeAdminSessionFamily(request: Request) {
  const elevated = getValidAdminSession(request);
  const rawRefresh = readCookie(request, ADMIN_REFRESH_COOKIE);
  const refClaims = verifyStructuredToken<{ v: 2; type: 'admin_refresh'; fid: string }>(rawRefresh);
  const fid = elevated?.fid || refClaims?.fid;
  if (fid) {
    adminRevokedFamilies.add(fid);
    for (const [, entry] of adminRefreshMap.entries()) {
      if (entry.fid === fid) entry.revoked = true;
    }
  }
}

// Legacy compatibility rate-limit helpers (augmented by lib/password-security.ts)
const attempts = new Map<string, { count: number; first: number; lockedUntil: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export function registerFailure(ip: string) {
  const now = Date.now();
  let rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) rec = { count: 0, first: now, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) rec.lockedUntil = now + WINDOW_MS;
  attempts.set(ip, rec);
}

export function registerSuccess(ip: string) {
  attempts.delete(ip);
}
