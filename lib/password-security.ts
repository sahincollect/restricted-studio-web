import crypto from 'crypto';
import { argon2idAsync } from '@noble/hashes/argon2.js';
import { createAdminSupabase } from '@/lib/supabase';

const COMMON_BREACHED_PASSWORDS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'password123',
  'qwerty123',
  'qwertyuiop',
  'abc12345',
  'admin123',
  'admin1234',
  'welcome1',
  'letmein1',
  'iloveyou',
  '1q2w3e4r',
  '1q2w3e4r5t',
  'asdfghjk',
  'istanbul1',
  'istanbul34',
  'ankara06',
  'turkiye1',
  'fenerbahce',
  'galatasaray',
  'besiktas',
  'restricted',
  'restricted123',
  'restrictedstudio',
  'saintstudio',
  'fivem123',
]);

function encodeNoPadB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64').replace(/=+$/g, '');
}

function decodeNoPadB64(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return new Uint8Array(Buffer.from(str + pad, 'base64'));
}

/**
 * Hashes password using OWASP Argon2id parameters (19 MiB, 3 passes, parallelism 1).
 */
export async function hashPasswordArgon2id(password: string): Promise<string> {
  const salt = new Uint8Array(crypto.randomBytes(16));
  const m = 19456;
  const t = 3;
  const p = 1;
  const derived = await argon2idAsync(password, salt, { m, t, p, dkLen: 32 });
  return `$argon2id$v=19$m=${m},t=${t},p=${p}$${encodeNoPadB64(salt)}$${encodeNoPadB64(derived)}`;
}

/**
 * Verifies password against an Argon2id PHC hash in constant time.
 */
export async function verifyArgon2idPassword(password: string, phcHash: string): Promise<boolean> {
  try {
    const parts = phcHash.split('$');
    if (parts.length !== 6 || parts[1] !== 'argon2id') return false;
    const paramPairs = Object.fromEntries(
      parts[3].split(',').map((kv) => {
        const [k, v] = kv.split('=');
        return [k, Number(v)];
      })
    );
    const m = paramPairs.m || 19456;
    const t = paramPairs.t || 3;
    const p = paramPairs.p || 1;
    const salt = decodeNoPadB64(parts[4]);
    const expected = decodeNoPadB64(parts[5]);
    const actual = await argon2idAsync(password, salt, { m, t, p, dkLen: expected.length });
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function syncUserPasswordHash(userId: string, rawPassword: string): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !userId) return;
  try {
    const hash = await hashPasswordArgon2id(rawPassword);
    const adminSupabase = createAdminSupabase();
    await adminSupabase.from('user_password_hashes').upsert({
      user_id: userId,
      argon2_hash: hash,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal if migration hasn't created user_password_hashes yet
  }
}

/**
 * Checks HIBP Pwned Passwords via k-Anonymity (only 5-char SHA-1 prefix ever leaves server).
 */
async function isPasswordLeakedHibp(password: string): Promise<boolean> {
  try {
    const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'RestrictedStudio-AppSec/1.0',
      },
      signal: AbortSignal.timeout(1800),
    });

    if (!res.ok) return false;
    const text = await res.text();
    for (const line of text.split(/\r?\n/)) {
      const [candidateSuffix, countStr] = line.split(':');
      if (candidateSuffix === suffix && Number(countStr || '0') > 0) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Enforces complexity rules and leaked/compromised password rejection.
 */
export async function validatePasswordPolicy(
  password: string,
  identifier?: string
): Promise<{ ok: boolean; message?: string }> {
  if (password.length < 8 || password.length > 128) {
    return { ok: false, message: 'Şifre 8 ile 128 karakter arasında olmalıdır.' };
  }

  const hasLower = /[a-zçğıöşü]/.test(password);
  const hasUpper = /[A-ZÇĞİÖŞÜ]/.test(password);
  const hasDigitOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  if (!hasLower || !hasUpper || !hasDigitOrSymbol) {
    return {
      ok: false,
      message:
        'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam veya özel karakter içermelidir.',
    };
  }

  const lowerPass = password.toLowerCase();
  if (COMMON_BREACHED_PASSWORDS.has(lowerPass)) {
    return {
      ok: false,
      message: 'Çok yaygın veya sızdırılmış bir şifre seçtiniz. Lütfen daha güçlü bir şifre belirleyin.',
    };
  }

  if (identifier) {
    const localPart = identifier.split('@')[0].trim().toLowerCase();
    if (localPart.length >= 4 && lowerPass.includes(localPart)) {
      return {
        ok: false,
        message: 'Şifreniz kullanıcı adınızı veya e-posta adresinizi içeremez.',
      };
    }
  }

  if (await isPasswordLeakedHibp(password)) {
    return {
      ok: false,
      message:
        'Bu parola kamuya açık veri ihlallerinde yer aldığı için kabul edilmemektedir. Lütfen başka bir şifre seçin.',
    };
  }

  return { ok: true };
}

/**
 * Normalizes auth response timing to prevent timing-based user enumeration.
 */
export async function ensureMinimumLatency(startedAtMs: number, minFloorMs = 380): Promise<void> {
  const jitter = crypto.randomInt(0, 45);
  const target = startedAtMs + minFloorMs + jitter;
  const remaining = target - Date.now();
  if (remaining > 0) {
    await new Promise((r) => setTimeout(r, remaining));
  }
}

interface LockoutRecord {
  failedCount: number;
  lastFailedAt: number;
  lockedUntil: number;
}

const MAX_LOCKOUT_ENTRIES = 10000;
const globalLock = globalThis as unknown as { __rsAuthLockouts?: Map<string, LockoutRecord> };
const memLockouts = (globalLock.__rsAuthLockouts ||= new Map<string, LockoutRecord>());

function backoffDurationMs(failures: number): number {
  if (failures < 5) return 0;
  const exponent = Math.min(failures - 5, 5);
  // 30s -> 2m -> 8m -> 32m -> 60m
  return Math.min(30 * 1000 * Math.pow(4, exponent), 60 * 60 * 1000);
}

/**
 * Checks whether an IP or account identifier is currently under brute-force exponential lockout.
 */
export async function checkAuthBackoff(keys: string[]): Promise<{ locked: boolean; retryAfter: number }> {
  const now = Date.now();
  let maxLockedUntil = 0;

  for (const key of keys) {
    const mem = memLockouts.get(key);
    if (mem && mem.lockedUntil > now) {
      maxLockedUntil = Math.max(maxLockedUntil, mem.lockedUntil);
    }
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && keys.length > 0) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data } = await adminSupabase
        .from('auth_lockouts')
        .select('lock_key, locked_until')
        .in('lock_key', keys);

      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.locked_until) {
            const ts = new Date(row.locked_until).getTime();
            if (ts > now) maxLockedUntil = Math.max(maxLockedUntil, ts);
          }
        }
      }
    } catch {
      // Safe fallback to in-memory lockout tracking
    }
  }

  if (maxLockedUntil > now) {
    return {
      locked: true,
      retryAfter: Math.max(1, Math.ceil((maxLockedUntil - now) / 1000)),
    };
  }

  return { locked: false, retryAfter: 0 };
}

export async function recordAuthFailure(keys: string[]): Promise<number> {
  const now = Date.now();
  const RESET_WINDOW_MS = 60 * 60 * 1000;
  let maxLockSec = 0;

  if (memLockouts.size >= MAX_LOCKOUT_ENTRIES) {
    for (const [k, v] of memLockouts.entries()) {
      if (now - v.lastFailedAt > RESET_WINDOW_MS && v.lockedUntil < now) {
        memLockouts.delete(k);
      }
    }
  }

  for (const key of keys) {
    let rec = memLockouts.get(key);
    if (!rec || now - rec.lastFailedAt > RESET_WINDOW_MS) {
      rec = { failedCount: 0, lastFailedAt: now, lockedUntil: 0 };
    }
    rec.failedCount += 1;
    rec.lastFailedAt = now;
    const waitMs = backoffDurationMs(rec.failedCount);
    if (waitMs > 0) {
      rec.lockedUntil = Math.max(rec.lockedUntil, now + waitMs);
      maxLockSec = Math.max(maxLockSec, Math.ceil(waitMs / 1000));
    }
    memLockouts.set(key, rec);

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminSupabase = createAdminSupabase();
        const { data: existing } = await adminSupabase
          .from('auth_lockouts')
          .select('failed_count, last_failed_at')
          .eq('lock_key', key)
          .maybeSingle();

        const baseCount =
          existing && now - new Date(existing.last_failed_at).getTime() <= RESET_WINDOW_MS
            ? Number(existing.failed_count || 0)
            : 0;
        const nextCount = Math.max(baseCount + 1, rec.failedCount);
        const dbWaitMs = backoffDurationMs(nextCount);
        const lockedUntilIso = dbWaitMs > 0 ? new Date(now + dbWaitMs).toISOString() : null;

        await adminSupabase.from('auth_lockouts').upsert({
          lock_key: key,
          failed_count: nextCount,
          last_failed_at: new Date(now).toISOString(),
          locked_until: lockedUntilIso,
        });
      } catch {
        // Ignore if auth_lockouts migration hasn't been executed
      }
    }
  }

  return maxLockSec;
}

export async function clearAuthLockout(keys: string[]): Promise<void> {
  for (const key of keys) {
    memLockouts.delete(key);
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && keys.length > 0) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase.from('auth_lockouts').delete().in('lock_key', keys);
    } catch {
      // Ignore if auth_lockouts migration hasn't been executed
    }
  }
}
