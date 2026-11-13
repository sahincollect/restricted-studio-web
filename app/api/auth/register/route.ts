import { NextResponse } from 'next/server';
import { createAdminSupabase, createClientSupabase, normalizeUsername } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { CustomerRegisterSchema } from '@/lib/validation';
import {
  ensureMinimumLatency,
  hashPasswordArgon2id,
  validatePasswordPolicy,
} from '@/lib/password-security';
import { issueCustomerSession } from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'auth_register', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBodySafe(request, 8192);
  if (!parsedBody.ok) return parsedBody.response;

  const validated = CustomerRegisterSchema.safeParse(parsedBody.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt, 400);
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz kayıt verisi.' },
      { status: 400 }
    );
  }

  const { identifier, password, turnstileToken } = validated.data;
  const turnstile = await verifyTurnstileToken(turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json({ success: false, message: turnstile.message }, { status: 403 });
  }

  const policyCheck = await validatePasswordPolicy(password, identifier);
  if (!policyCheck.ok) {
    await ensureMinimumLatency(startedAt, 400);
    return NextResponse.json(
      { success: false, message: policyCheck.message },
      { status: 400 }
    );
  }

  try {
    const isEmail = identifier.includes('@');
    const cleanInput = identifier.trim();
    let email = '';
    let rawDisplayName = cleanInput;
    let normalized = '';

    if (isEmail) {
      email = cleanInput.toLowerCase();
      rawDisplayName = email.split('@')[0];
      normalized = normalizeUsername(rawDisplayName);
    } else {
      normalized = normalizeUsername(cleanInput);
      if (normalized.length < 3) {
        await ensureMinimumLatency(startedAt, 400);
        return NextResponse.json(
          { success: false, message: 'Kullanıcı adı en az 3 karakter (harf/rakam) olmalıdır.' },
          { status: 400 }
        );
      }
      email = `${normalized}@kullanici.restrictedstudio.shop`;
    }

    // Compute Argon2id upfront to equalize latency across existing & new accounts (anti-enumeration)
    const argonHash = await hashPasswordArgon2id(password);
    let createdUser: { id: string; email?: string } | null = null;
    let alreadyExists = false;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: rawDisplayName,
          username_normalized: normalized,
          is_anonymous_guest: false,
        },
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (
          msg.includes('already') ||
          msg.includes('exists') ||
          msg.includes('registered') ||
          error.status === 422
        ) {
          alreadyExists = true;
        } else {
          await ensureMinimumLatency(startedAt, 450);
          return NextResponse.json(
            { success: false, message: 'Kayıt işlemi şu anda tamamlanamıyor.' },
            { status: 400 }
          );
        }
      } else if (data?.user) {
        createdUser = data.user;
        try {
          await adminSupabase.from('user_password_hashes').upsert({
            user_id: data.user.id,
            argon2_hash: argonHash,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // Non-fatal if migration hasn't run yet
        }
      }
    } else {
      const supabase = createClientSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: rawDisplayName,
            username_normalized: normalized,
            is_anonymous_guest: false,
          },
        },
      });
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('registered')) {
          alreadyExists = true;
        } else {
          await ensureMinimumLatency(startedAt, 450);
          return NextResponse.json(
            { success: false, message: 'Kayıt işlemi şu anda tamamlanamıyor.' },
            { status: 400 }
          );
        }
      } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        alreadyExists = true;
      } else if (data.user) {
        createdUser = data.user;
      }
    }

    if (alreadyExists || !createdUser) {
      await writeAuditLog({
        request,
        actorId: email.slice(0, 64),
        actorType: 'customer',
        action: 'CUSTOMER_REGISTER_ENUM_SHIELD',
      });
      await ensureMinimumLatency(startedAt, 450);
      // Standardized anti-enumeration response — reveals neither email nor username existence
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          message:
            'Kayıt talebiniz alındı. Bilgileriniz uygunsa oturumunuz oluşturulur; mevcut bir hesabınız varsa giriş sayfasından devam edin.',
        },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await writeAuditLog({
      request,
      actorId: createdUser.id,
      actorType: 'customer',
      action: 'CUSTOMER_REGISTER_SUCCESS',
      metadata: { isEmail },
    });

    const res = NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: rawDisplayName,
        },
        message: 'Hesabınız oluşturuldu ve güvenli oturumunuz açıldı.',
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );

    await issueCustomerSession(request, res, {
      id: createdUser.id,
      email: createdUser.email,
      name: rawDisplayName,
    });

    await ensureMinimumLatency(startedAt, 450);
    return res;
  } catch {
    await ensureMinimumLatency(startedAt, 450);
    return NextResponse.json(
      { success: false, message: 'Kayıt işlemi sırasında beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
