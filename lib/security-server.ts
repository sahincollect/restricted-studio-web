import { NextResponse } from 'next/server';
import {
  type RateLimitTier,
  checkBoundedRateLimit,
  getClientIp,
  verifySameOriginRequest,
} from '@/lib/security-edge';

export interface TurnstileResult {
  ok: boolean;
  skipped?: boolean;
  message?: string;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

/**
 * Verifies Cloudflare Turnstile token when both site key and secret key are configured.
 */
export async function verifyTurnstileToken(
  token?: string | null,
  ip?: string
): Promise<TurnstileResult> {
  if (!isTurnstileConfigured()) {
    return { ok: true, skipped: true };
  }

  const cleanToken = String(token || '').trim();
  if (!cleanToken || cleanToken.length > 2048) {
    return {
      ok: false,
      message: 'Güvenlik doğrulaması (Cloudflare Turnstile) tamamlanmadı. Lütfen tekrar deneyin.',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.set('secret', process.env.TURNSTILE_SECRET_KEY!.trim());
    formData.set('response', cleanToken);
    if (ip && ip !== 'unknown') {
      formData.set('remoteip', ip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) {
      return {
        ok: false,
        message: 'Bot koruma servisiyle doğrulanamadı. Lütfen birkaç saniye sonra tekrar deneyin.',
      };
    }

    const payload = (await res.json()) as { success?: boolean };
    if (!payload?.success) {
      return {
        ok: false,
        message: 'Bot doğrulaması geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: 'Güvenlik doğrulama zaman aşımına uğradı. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Parses request JSON safely with byte-size cap to prevent payload-flood memory exhaustion.
 */
export async function parseJsonBodySafe<T = Record<string, any>>(
  request: Request,
  maxBytes = 16384
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const lenHeader = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(lenHeader) && lenHeader > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'İstek boyutu izin verilen sınırı aşıyor.' },
        { status: 413 }
      ),
    };
  }

  try {
    const text = await request.text();
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: 'İstek boyutu izin verilen sınırı aşıyor.' },
          { status: 413 }
        ),
      };
    }
    const parsed = text ? JSON.parse(text) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: 'Geçersiz JSON yükü.' },
          { status: 400 }
        ),
      };
    }
    return { ok: true, data: parsed as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Geçersiz istek biçimi.' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Shared guard for browser-facing API endpoints: enforces same-origin CSRF check and rate limiting.
 */
export function guardApiRequest(
  request: Request,
  tier: RateLimitTier,
  options: { checkSameOrigin?: boolean; extraKey?: string } = {}
): { ok: true; ip: string } | { ok: false; response: NextResponse } {
  if (options.checkSameOrigin) {
    const originCheck = verifySameOriginRequest(request);
    if (!originCheck.ok) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: 'Kaynak doğrulaması reddedildi.' },
          { status: 403 }
        ),
      };
    }
  }

  const ip = getClientIp(request);
  const key = options.extraKey ? `${ip}:${options.extraKey}` : ip;
  const limit = checkBoundedRateLimit(tier, key);
  if (!limit.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message: 'Çok fazla istek algılandı. Güvenlik gereği lütfen bir süre bekleyip tekrar deneyin.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfter),
            'Cache-Control': 'no-store',
          },
        }
      ),
    };
  }

  return { ok: true, ip };
}
