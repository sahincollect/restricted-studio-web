import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  checkRateLimit,
  createSessionToken,
  registerFailure,
  registerSuccess,
  verifyAdminCredentials,
} from '@/lib/admin-session';

export const runtime = 'nodejs';

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Geçersiz istek.' }, { status: 400 });
  }

  const username = String(body?.username ?? '').slice(0, 128);
  const password = String(body?.password ?? '').slice(0, 256);

  if (!verifyAdminCredentials(username, password)) {
    registerFailure(ip);
    await sleep(800);
    return NextResponse.json({ success: false, message: 'Kullanıcı adı veya parola hatalı.' }, { status: 401 });
  }

  registerSuccess(ip);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
