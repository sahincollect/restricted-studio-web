import { NextResponse } from 'next/server';
import {
  ADMIN_ENROLL_COOKIE,
  ADMIN_PREAUTH_COOKIE,
  ENROLL_TTL_SECONDS,
  PREAUTH_TTL_SECONDS,
  clearAdminCookies,
  createEnrollmentCookieValue,
  createPreAuthToken,
  readCookie,
  resolveElevatedAdminSession,
  attachAdminElevatedCookies,
  revokeAdminSessionFamily,
  verifyAdminCredentials,
  verifyPreAuthToken,
} from '@/lib/admin-session';
import { isSecureRequest } from '@/lib/customer-session';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { AdminLoginSchema } from '@/lib/validation';
import {
  checkAuthBackoff,
  clearAuthLockout,
  ensureMinimumLatency,
  recordAuthFailure,
} from '@/lib/password-security';
import {
  generateLocalTotpQrDataUrl,
  generateTotpSecret,
  getActiveAdminMfa,
} from '@/lib/admin-mfa';
import { writeAuditLog } from '@/lib/audit-log';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  const elevated = await resolveElevatedAdminSession(request);
  if (elevated.authenticated && elevated.claims) {
    const res = NextResponse.json(
      {
        authenticated: true,
        username: elevated.claims.sub,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (elevated.rotatedSub) {
      attachAdminElevatedCookies(request, res, elevated.rotatedSub, elevated.rotatedFamilyId);
    }
    return res;
  }

  const preauth = verifyPreAuthToken(readCookie(request, ADMIN_PREAUTH_COOKIE));
  return NextResponse.json(
    {
      authenticated: false,
      mfaPending: Boolean(preauth),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'admin_login', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const validated = AdminLoginSchema.safeParse(parsed.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt, 420);
    return NextResponse.json(
      { success: false, message: 'Geçersiz kimlik bilgileri.' },
      { status: 400 }
    );
  }

  const { username, password, turnstileToken } = validated.data;
  const turnstile = await verifyTurnstileToken(turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json({ success: false, message: turnstile.message }, { status: 403 });
  }

  const lockKeys = [`admin:ip:${guard.ip}`, `admin:user:${username.trim().toLowerCase()}`];
  const backoff = await checkAuthBackoff(lockKeys);
  if (backoff.locked) {
    await ensureMinimumLatency(startedAt, 420);
    return NextResponse.json(
      {
        success: false,
        message: 'Çok fazla başarısız yönetici denemesi. Güvenlik kilidi etkin.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(backoff.retryAfter), 'Cache-Control': 'no-store' },
      }
    );
  }

  const credentialsValid = await verifyAdminCredentials(username.trim(), password);
  if (!credentialsValid) {
    await recordAuthFailure(lockKeys);
    await writeAuditLog({
      request,
      actorId: username.trim().slice(0, 48) || 'unknown',
      actorType: 'admin',
      action: 'ADMIN_LOGIN_FAILED',
      metadata: { stage: 'password' },
    });
    await ensureMinimumLatency(startedAt, 420);
    return NextResponse.json(
      { success: false, message: 'Geçersiz kimlik bilgileri.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  await clearAuthLockout(lockKeys);

  // Step 1 passed -> DO NOT issue full session; require TOTP 2FA verification (Zero-Trust)
  const secure = isSecureRequest(request);
  const preauthToken = createPreAuthToken(username.trim());
  const mfaState = await getActiveAdminMfa();

  if (mfaState.configured && mfaState.secret) {
    await writeAuditLog({
      request,
      actorId: username.trim(),
      actorType: 'admin',
      action: 'ADMIN_PASSWORD_VERIFIED_MFA_PENDING',
    });

    const res = NextResponse.json(
      { success: true, step: 'mfa_required' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    res.cookies.set(ADMIN_PREAUTH_COOKIE, preauthToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/api/admin',
      maxAge: PREAUTH_TTL_SECONDS,
    });
    await ensureMinimumLatency(startedAt, 380);
    return res;
  }

  // First-time TOTP MFA enrollment
  const generatedSecret = generateTotpSecret();
  const qrDataUrl = await generateLocalTotpQrDataUrl(generatedSecret);
  const enrollCookie = createEnrollmentCookieValue(username.trim(), generatedSecret);

  await writeAuditLog({
    request,
    actorId: username.trim(),
    actorType: 'admin',
    action: 'ADMIN_MFA_SETUP_INITIATED',
  });

  const res = NextResponse.json(
    {
      success: true,
      step: 'mfa_setup',
      qrDataUrl,
      manualSecret: generatedSecret,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  res.cookies.set(ADMIN_PREAUTH_COOKIE, preauthToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: PREAUTH_TTL_SECONDS,
  });
  res.cookies.set(ADMIN_ENROLL_COOKIE, enrollCookie, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: ENROLL_TTL_SECONDS,
  });

  await ensureMinimumLatency(startedAt, 380);
  return res;
}

export async function DELETE(request: Request) {
  const guard = guardApiRequest(request, 'admin_api', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const elevated = await resolveElevatedAdminSession(request);
  revokeAdminSessionFamily(request);

  await writeAuditLog({
    request,
    actorId: elevated.claims?.sub || 'admin',
    actorType: 'admin',
    action: 'ADMIN_LOGOUT',
  });

  const res = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  clearAdminCookies(request, res);
  return res;
}
