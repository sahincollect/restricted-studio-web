import crypto from 'node:crypto';

const DEFAULT_BOT_USERNAME = 'restrictedstudio_bot';

export function getTelegramBotToken(): string | null {
  const raw = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return raw && raw.includes(':') ? raw : null;
}

export function isTelegramConfigured(): boolean {
  return Boolean(getTelegramBotToken());
}

export function getTelegramBotUsername(): string {
  const raw = process.env.TELEGRAM_BOT_USERNAME?.trim() || DEFAULT_BOT_USERNAME;
  return raw.replace(/^@/, '');
}

export function getTelegramWebhookSecret(): string | null {
  const raw = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  return raw && raw.length >= 16 ? raw : null;
}

export function escapeTelegramHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getTelegramSigningKey(): string | null {
  const candidates = [
    process.env.TELEGRAM_WEBHOOK_SECRET,
    process.env.CUSTOMER_SESSION_SECRET,
    process.env.ADMIN_SESSION_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]
    .map((v) => v?.trim() || '')
    .filter((v) => v.length >= 16);

  if (candidates.length > 0) return candidates[0];
  if (process.env.NODE_ENV !== 'production') {
    return 'rs-dev-only-telegram-signing-secret';
  }
  return null;
}

function hmacHex(secret: string, data: string, length: number): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex').slice(0, length);
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

function compactUuid(uuid: string): string | null {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  return /^[0-9a-f]{32}$/.test(hex) ? hex : null;
}

function expandUuid(hex: string): string | null {
  if (!/^[0-9a-f]{32}$/i.test(hex)) return null;
  const h = hex.toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Generates a compact signed `start=` payload (<= 64 chars) for `https://t.me/<bot>?start=...`.
 */
export function createTelegramCustomerBindUrl(userId: string, ttlSeconds = 1800): string | null {
  if (!isTelegramConfigured()) return null;
  const key = getTelegramSigningKey();
  const compact = compactUuid(userId);
  if (!key || !compact) return null;

  const expHex = (Math.floor(Date.now() / 1000) + ttlSeconds).toString(16).padStart(8, '0');
  const body = `u_${compact}_${expHex}`;
  const sig = hmacHex(key, body, 16);
  return `https://t.me/${getTelegramBotUsername()}?start=${body}_${sig}`;
}

export function createTelegramAdminBindUrl(ttlSeconds = 900): string | null {
  if (!isTelegramConfigured()) return null;
  const key = getTelegramSigningKey();
  if (!key) return null;

  const expHex = (Math.floor(Date.now() / 1000) + ttlSeconds).toString(16).padStart(8, '0');
  const body = `a_${expHex}`;
  const sig = hmacHex(key, body, 24);
  return `https://t.me/${getTelegramBotUsername()}?start=${body}_${sig}`;
}

export function verifyTelegramStartToken(
  rawPayload: string | null | undefined,
  nowSec = Math.floor(Date.now() / 1000)
): { role: 'customer'; userId: string } | { role: 'admin' } | null {
  const clean = (rawPayload || '').trim();
  const key = getTelegramSigningKey();
  if (!clean || !key) return null;

  if (clean.startsWith('u_')) {
    const parts = clean.split('_');
    if (parts.length !== 4) return null;
    const [, compactId, expHex, sig] = parts;
    if (!/^[0-9a-f]{32}$/.test(compactId) || !/^[0-9a-f]{8}$/.test(expHex) || !/^[0-9a-f]{16}$/.test(sig)) {
      return null;
    }
    const expected = hmacHex(key, `u_${compactId}_${expHex}`, 16);
    if (!timingSafeHexEqual(sig, expected)) return null;
    const exp = Number.parseInt(expHex, 16);
    if (!Number.isFinite(exp) || exp < nowSec) return null;
    const uuid = expandUuid(compactId);
    return uuid ? { role: 'customer', userId: uuid } : null;
  }

  if (clean.startsWith('a_')) {
    const parts = clean.split('_');
    if (parts.length !== 3) return null;
    const [, expHex, sig] = parts;
    if (!/^[0-9a-f]{8}$/.test(expHex) || !/^[0-9a-f]{24}$/.test(sig)) return null;
    const expected = hmacHex(key, `a_${expHex}`, 24);
    if (!timingSafeHexEqual(sig, expected)) return null;
    const exp = Number.parseInt(expHex, 16);
    if (!Number.isFinite(exp) || exp < nowSec) return null;
    return { role: 'admin' };
  }

  return null;
}
