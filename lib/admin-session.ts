import crypto from 'crypto';

// Yönetici oturumu: HMAC imzalı, süreli, HttpOnly çerez. Yalnızca sunucuda kullanılır.
export const ADMIN_COOKIE = 'rs_admin_session';
export const SESSION_TTL_SECONDS = 2 * 60 * 60;

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string) {
  return crypto.timingSafeEqual(sha(a), sha(b));
}

// Kullanıcı adı + parola doğrulaması (bilgiler ortam değişkenlerinde tutulur, kodda değil).
export function verifyAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p || !sessionSecret()) return false;
  // Her iki karşılaştırma da her zaman yapılır (zamanlama farkını azaltır).
  const userOk = safeEqual(username, u);
  const passOk = safeEqual(password, p);
  return userOk && passOk;
}

export function createSessionToken(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET tanımlı değil.');
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${exp}.${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token?: string | null): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${expStr}.${nonce}`).digest('hex');
  return safeEqual(sig, expected);
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function hasValidAdminSession(request: Request): boolean {
  return verifySessionToken(readCookie(request, ADMIN_COOKIE));
}

// Basit IP başına deneme sınırı (sunucusuz ortamda örnek başına, en iyi çaba).
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
