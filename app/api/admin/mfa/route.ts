import { NextResponse } from 'next/server';
import {
  ADMIN_ENROLL_COOKIE,
  ADMIN_PREAUTH_COOKIE,
  attachAdminElevatedCookies,
  readCookie,
  verifyEnrollmentCookieValue,
  verifyPreAuthToken,
} from '@/lib/admin-session';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { AdminMfaVerifySchema } from '@/lib/validation';
import {
  checkAuthBackoff,
  clearAuthLockout,
  ensureMinimumLatency,
  recordAuthFailure,
} from '@/lib/password-security';
import {
  getActiveAdminMfa,
  markAdminTotpStepUsed,
  saveAdminMfaEnrollment,
  verifyTotpCode,
} from '@/lib/admin-mfa';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'admin_mfa', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const preauth = verifyPreAuthToken(readCookie(request, ADMIN_PREAUTH_COOKIE));
  if (!preauth) {
    return NextResponse.json(
      { success: false, message: 'Ön doğrulama oturumu bulunamadı veya süresi doldu.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const parsed = await parseJsonBodySafe(request, 2048);
  if (!parsed.ok) return parsed.response;

  const validated = AdminMfaVerifySchema.safeParse(parsed.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt, 360);
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz doğrulama kodu.' },
      { status: 400 }
    );
  }

  const lockKeys = [`admin:mfa:ip:${guard.ip}`, `admin:mfa:user:${preauth.sub}`];
  const backoff = await checkAuthBackoff(lockKeys);
  if (backoff.locked) {
    await ensureMinimumLatency(startedAt, 360);
    return NextResponse.json(
      {
        success: false,
        message: 'Çok fazla hatalı 2FA kodu girildi. Lütfen bekleyin.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(backoff.retryAfter), 'Cache-Control': 'no-store' },
      }
    );
  }

  const mfaState = await getActiveAdminMfa();
  let secretToCheck: string | null = null;
  let lastUsedStep: number | null = null;
  let isNewEnrollment = false;

  if (mfaState.configured && mfaState.secret) {
    secretToCheck = mfaState.secret;
    lastUsedStep = mfaState.lastUsedStep;
  } else {
    const enroll = verifyEnrollmentCookieValue(readCookie(request, ADMIN_ENROLL_COOKIE));
    if (enroll && enroll.sub === preauth.sub) {
      secretToCheck = enroll.secret;
      isNewEnrollment = true;
    }
  }

  if (!secretToCheck) {
    return NextResponse.json(
      { success: false, message: 'MFA kurulum bilgisi geçersiz. Lütfen baştan giriş yapın.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const result = verifyTotpCode(secretToCheck, validated.data.code, lastUsedStep);
  if (!result.valid || typeof result.matchedStep !== 'number') {
    await recordAuthFailure(lockKeys);
    await writeAuditLog({
      request,
      actorId: preauth.sub,
      actorType: 'admin',
      action: 'ADMIN_MFA_FAILED',
    });
    await ensureMinimumLatency(startedAt, 360);
    return NextResponse.json(
      { success: false, message: 'TOTP doğrulama kodu geçersiz veya daha önce kullanılmış.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  await clearAuthLockout(lockKeys);

  let persistedToDb = false;
  if (isNewEnrollment) {
    persistedToDb = await saveAdminMfaEnrollment(secretToCheck, result.matchedStep);
    await writeAuditLog({
      request,
      actorId: preauth.sub,
      actorType: 'admin',
      action: 'ADMIN_MFA_ENROLLED',
      metadata: { persistedToDb },
    });
  } else {
    await markAdminTotpStepUsed(result.matchedStep);
  }

  await writeAuditLog({
    request,
    actorId: preauth.sub,
    actorType: 'admin',
    action: 'ADMIN_LOGIN_SUCCESS',
    metadata: { mfa: true },
  });

  const res = NextResponse.json(
    {
      success: true,
      enrolled: isNewEnrollment,
      persistedToDb,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  attachAdminElevatedCookies(request, res, preauth.sub);
  await ensureMinimumLatency(startedAt, 360);
  return res;
}
