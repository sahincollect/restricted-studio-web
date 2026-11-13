import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminSupabase } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { AnonymousAuthSchema } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';
import { issueCustomerSession } from '@/lib/customer-session';
import { hashPasswordArgon2id } from '@/lib/password-security';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'auth_anonymous', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const validated = AnonymousAuthSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json({ success: false, message: 'Geçersiz istek.' }, { status: 400 });
  }

  const turnstile = await verifyTurnstileToken(validated.data.turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json({ success: false, message: turnstile.message }, { status: 403 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { success: false, message: 'Hızlı misafir hesabı şu anda kullanılamıyor. Lütfen kayıt olun.' },
      { status: 503 }
    );
  }

  try {
    const adminSupabase = createAdminSupabase();
    const randomTag = crypto.randomBytes(5).toString('hex');
    const alias = `misafir-${randomTag}`;
    const email = `${alias}@anon.restrictedstudio.shop`;
    const password = crypto.randomBytes(28).toString('base64url');
    const argonHash = await hashPasswordArgon2id(password);

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: alias,
        is_anonymous_guest: true,
      },
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { success: false, message: 'Misafir hesabı şu anda oluşturulamıyor.' },
        { status: 500 }
      );
    }

    try {
      await adminSupabase.from('user_password_hashes').upsert({
        user_id: data.user.id,
        argon2_hash: argonHash,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if migration hasn't run
    }

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          name: alias,
          isGuest: true,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    // Secrets/tokens stay strictly in HttpOnly cookies — never sent back in JSON or stored in localStorage
    await issueCustomerSession(request, res, {
      id: data.user.id,
      email: data.user.email,
      name: alias,
    });

    await writeAuditLog({
      request,
      actorId: data.user.id,
      actorType: 'anonymous',
      action: 'ANONYMOUS_ACCOUNT_CREATED',
      metadata: { alias },
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası.' },
      { status: 500 }
    );
  }
}
