import crypto from 'crypto';
import QRCode from 'qrcode';
import { createAdminSupabase } from '@/lib/supabase';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const ADMIN_MFA_PRIMARY_ID = 'primary-admin';

function deriveEncryptionKey(): Buffer {
  const raw =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'dev-ephemeral-fallback';
  return crypto.createHash('sha256').update(`rs-mfa-aes-v1:${raw}`).digest();
}

export function encodeBase32(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function decodeBase32(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): string {
  return encodeBase32(crypto.randomBytes(20));
}

export function computeTotpAtStep(secretBase32: string, step: number): string {
  const key = decodeBase32(secretBase32);
  const counter = Buffer.alloc(8);
  const high = Math.floor(step / 0x100000000);
  const low = step >>> 0;
  counter.writeUInt32BE(high, 0);
  counter.writeUInt32BE(low, 4);

  const hmac = crypto.createHmac('sha1', key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binCode % Math.pow(10, TOTP_DIGITS);
  return String(otp).padStart(TOTP_DIGITS, '0');
}

export function verifyTotpCode(
  secretBase32: string,
  code: string,
  lastUsedStep?: number | null
): { valid: boolean; matchedStep?: number } {
  const cleanCode = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return { valid: false };

  const currentStep = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);
  for (const delta of [-1, 0, 1]) {
    const candidateStep = currentStep + delta;
    if (typeof lastUsedStep === 'number' && candidateStep <= lastUsedStep) {
      continue;
    }
    const expected = computeTotpAtStep(secretBase32, candidateStep);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
      return { valid: true, matchedStep: candidateStep };
    }
  }
  return { valid: false };
}

export function encryptMfaSecret(secretBase32: string): string {
  const key = deriveEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(secretBase32, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${enc.toString('hex')}`;
}

export function decryptMfaSecret(encrypted: string): string | null {
  try {
    const [ivHex, tagHex, encHex] = encrypted.split('.');
    if (!ivHex || !tagHex || !encHex) return null;
    const key = deriveEncryptionKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(encHex, 'hex')),
      decipher.final(),
    ]);
    return dec.toString('utf8');
  } catch {
    return null;
  }
}

export function buildOtpAuthUri(secretBase32: string, label = 'admin@restrictedstudio.shop'): string {
  const issuer = 'Restricted Studio';
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export async function generateLocalTotpQrDataUrl(secretBase32: string): Promise<string> {
  const uri = buildOtpAuthUri(secretBase32);
  return QRCode.toDataURL(uri, {
    width: 196,
    margin: 2,
    color: { dark: '#080808', light: '#F0F0F0' },
  });
}

// In-memory TOTP cache & replay guard fallback when DB table isn't created yet
const globalMfa = globalThis as unknown as {
  __rsAdminMfa?: { secret: string | null; enabled: boolean; lastUsedStep: number | null };
};
const memMfa = (globalMfa.__rsAdminMfa ||= { secret: null, enabled: false, lastUsedStep: null });

export async function getActiveAdminMfa(): Promise<{
  configured: boolean;
  secret: string | null;
  lastUsedStep: number | null;
  source: 'env' | 'db' | 'memory' | 'none';
}> {
  const envSecret = (process.env.ADMIN_TOTP_SECRET || '').trim().toUpperCase();
  if (envSecret && envSecret.length >= 16) {
    return {
      configured: true,
      secret: envSecret,
      lastUsedStep: memMfa.lastUsedStep,
      source: 'env',
    };
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data } = await adminSupabase
        .from('admin_mfa_secrets')
        .select('encrypted_secret, enabled, last_used_step')
        .eq('admin_id', ADMIN_MFA_PRIMARY_ID)
        .maybeSingle();

      if (data?.enabled && data?.encrypted_secret) {
        const dec = decryptMfaSecret(data.encrypted_secret);
        if (dec) {
          return {
            configured: true,
            secret: dec,
            lastUsedStep: typeof data.last_used_step === 'number' ? data.last_used_step : null,
            source: 'db',
          };
        }
      }
    } catch {
      // Fallback to memory state
    }
  }

  if (memMfa.enabled && memMfa.secret) {
    return {
      configured: true,
      secret: memMfa.secret,
      lastUsedStep: memMfa.lastUsedStep,
      source: 'memory',
    };
  }

  return { configured: false, secret: null, lastUsedStep: null, source: 'none' };
}

export async function saveAdminMfaEnrollment(
  secretBase32: string,
  matchedStep: number
): Promise<boolean> {
  memMfa.secret = secretBase32;
  memMfa.enabled = true;
  memMfa.lastUsedStep = matchedStep;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase.from('admin_mfa_secrets').upsert({
        admin_id: ADMIN_MFA_PRIMARY_ID,
        encrypted_secret: encryptMfaSecret(secretBase32),
        enabled: true,
        last_used_step: matchedStep,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function markAdminTotpStepUsed(step: number): Promise<void> {
  memMfa.lastUsedStep = step;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase
        .from('admin_mfa_secrets')
        .update({ last_used_step: step, updated_at: new Date().toISOString() })
        .eq('admin_id', ADMIN_MFA_PRIMARY_ID);
    } catch {
      // Ignore if migration hasn't run yet
    }
  }
}
