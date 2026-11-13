import { NextResponse } from 'next/server';
import { createAdminSupabase, createClientSupabase, resolveLegacyLoginIdentifier, resolveLoginIdentifier } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { CustomerLoginSchema } from '@/lib/validation';
import {
  checkAuthBackoff,
  ensureMinimumLatency,
  recordAuthFailure,
  clearAuthLockout,
  syncUserPasswordHash,
  verifyArgon2idPassword,
} from '@/lib/password-security';
import { issueCustomerSession } from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'auth_login', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBodySafe(request, 8192);
  if (!parsedBody.ok) return parsedBody.response;

  const validated = CustomerLoginSchema.safeParse(parsedBody.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt);
    return NextResponse.json(
      { success: false, message: 'Geçersiz kimlik bilgileri.' },
      { status: 400 }
    );
  }

  const { identifier, password, turnstileToken } = validated.data;
  const turnstile = await verifyTurnstileToken(turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json({ success: false, message: turnstile.message }, { status: 403 });
  }

  const normalizedId = identifier.trim().toLowerCase();
  const lockKeys = [`cust:ip:${guard.ip}`, `cust:id:${normalizedId}`];
  const backoff = await checkAuthBackoff(lockKeys);
  if (backoff.locked) {
    await ensureMinimumLatency(startedAt);
    return NextResponse.json(
      {
        success: false,
        message: 'Çok fazla başarısız giriş denemesi. Güvenlik gereği hesabınız geçici olarak kilitlendi.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(backoff.retryAfter), 'Cache-Control': 'no-store' },
      }
    );
  }

  try {
    const primaryEmail = resolveLoginIdentifier(identifier);
    const legacyEmail = resolveLegacyLoginIdentifier(identifier);
    const candidateEmails = primaryEmail === legacyEmail ? [primaryEmail] : [primaryEmail, legacyEmail];

    let authenticatedUser: { id: string; email?: string; user_metadata?: Record<string, any> } | null = null;
    const supabase = createClientSupabase();

    for (const candidateEmail of candidateEmails) {
      // Optional Argon2id verification against stored hash if admin service key exists
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const adminSupabase = createAdminSupabase();
          const { data: userList } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          const usersArr = ((userList as any)?.users || []) as Array<{
            id: string;
            email?: string;
            user_metadata?: Record<string, any>;
          }>;
          const matchedUser = usersArr.find(
            (u) => (u.email || '').toLowerCase() === candidateEmail.toLowerCase()
          );
          if (matchedUser) {
            const { data: hashRow } = await adminSupabase
              .from('user_password_hashes')
              .select('argon2_hash')
              .eq('user_id', matchedUser.id)
              .maybeSingle();

            if (hashRow?.argon2_hash) {
              const argonOk = await verifyArgon2idPassword(password, hashRow.argon2_hash);
              if (argonOk) {
                authenticatedUser = matchedUser;
                break;
              }
            }
          }
        } catch {
          // Fall through to Supabase password check
        }
      }

      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: candidateEmail,
        password,
      });
      if (!signInErr && signInData.user) {
        authenticatedUser = signInData.user;
        await syncUserPasswordHash(signInData.user.id, password);
        break;
      }
    }

    if (!authenticatedUser) {
      await recordAuthFailure(lockKeys);
      await writeAuditLog({
        request,
        actorId: normalizedId.slice(0, 64),
        actorType: 'customer',
        action: 'CUSTOMER_LOGIN_FAILED',
      });
      await ensureMinimumLatency(startedAt);
      return NextResponse.json(
        { success: false, message: 'Geçersiz kimlik bilgileri.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await clearAuthLockout(lockKeys);

    const displayName =
      authenticatedUser.user_metadata?.username ||
      authenticatedUser.user_metadata?.full_name ||
      authenticatedUser.email?.split('@')[0] ||
      'Müşteri';

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: displayName,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    await issueCustomerSession(request, res, {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: displayName,
    });

    await writeAuditLog({
      request,
      actorId: authenticatedUser.id,
      actorType: 'customer',
      action: 'CUSTOMER_LOGIN_SUCCESS',
      metadata: { provider: 'password' },
    });

    await ensureMinimumLatency(startedAt);
    return res;
  } catch {
    await ensureMinimumLatency(startedAt);
    return NextResponse.json(
      { success: false, message: 'Giriş işlemi şu anda tamamlanamıyor.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
