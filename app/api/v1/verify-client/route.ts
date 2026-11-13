import { NextResponse } from 'next/server';
import {
  createAdminSupabase,
  createClientSupabase,
  resolveLegacyLoginIdentifier,
  resolveLoginIdentifier,
} from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { VerifyClientSchema } from '@/lib/validation';
import {
  checkAuthBackoff,
  clearAuthLockout,
  ensureMinimumLatency,
  recordAuthFailure,
  syncUserPasswordHash,
  verifyArgon2idPassword,
} from '@/lib/password-security';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'verify_client');
  if (!guard.ok) return guard.response;

  try {
    const parsed = await parseJsonBodySafe(request, 4096);
    if (!parsed.ok) return parsed.response;

    const validated = VerifyClientSchema.safeParse(parsed.data);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: validated.error.issues[0]?.message || 'Geçersiz doğrulama isteği.',
        },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Doğrulama servisi şu anda erişilemiyor.' },
        { status: 503 }
      );
    }

    const { code, email: rawEmail, username: rawUsername, password, hwid, product_name: productName } =
      validated.data;

    const rawCode = (code || '').trim().toUpperCase();
    const rawIdentifier = (rawEmail || rawUsername || '').trim();
    const lockKeys = [`client:ip:${guard.ip}`];
    if (rawIdentifier) lockKeys.push(`client:id:${rawIdentifier.toLowerCase()}`);
    if (rawCode) lockKeys.push(`client:code:${rawCode}`);

    const backoff = await checkAuthBackoff(lockKeys);
    if (backoff.locked) {
      await ensureMinimumLatency(startedAt, 360);
      return NextResponse.json(
        {
          success: false,
          message: 'Çok fazla başarısız doğrulama denemesi. Lütfen bir süre bekleyin.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(backoff.retryAfter), 'Cache-Control': 'no-store' },
        }
      );
    }

    const adminSupabase = createAdminSupabase();
    let userId = '';
    let userDisplay = '';

    // YÖNTEM A: Aktivasyon Kodu ile Doğrulama
    const candidateCode =
      rawCode ||
      (rawIdentifier.toUpperCase().startsWith('R-AI-') ||
      rawIdentifier.toUpperCase().startsWith('RESTRICTED-')
        ? rawIdentifier.toUpperCase()
        : '');

    if (candidateCode) {
      const { data: codeData, error: codeErr } = await adminSupabase
        .from('redeem_codes')
        .select('id, is_used, used_by')
        .eq('code', candidateCode)
        .maybeSingle();

      if (codeErr || !codeData) {
        await recordAuthFailure(lockKeys);
        await ensureMinimumLatency(startedAt, 360);
        return NextResponse.json(
          { success: false, message: 'Girdiğiniz aktivasyon kodu geçersiz.' },
          { status: 404 }
        );
      }

      if (!codeData.is_used || !codeData.used_by) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Bu kod henüz web sitesinden etkinleştirilmemiştir! Lütfen önce restrictedstudio.shop adresinden kodu aktif edin.',
          },
          { status: 403 }
        );
      }

      userId = codeData.used_by;
      userDisplay = candidateCode;
    } else {
      // YÖNTEM B: E-posta / Kullanıcı Adı ve Şifre ile Doğrulama
      if (!rawIdentifier || !password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Lütfen sitede etkinleştirdiğiniz aktivasyon kodunu veya hesap bilgilerinizi giriniz.',
          },
          { status: 400 }
        );
      }

      const primaryEmail = resolveLoginIdentifier(rawIdentifier);
      const legacyEmail = resolveLegacyLoginIdentifier(rawIdentifier);
      const candidates = primaryEmail === legacyEmail ? [primaryEmail] : [primaryEmail, legacyEmail];

      let matchedAuth: { id: string; user_metadata?: Record<string, any> } | null = null;
      const clientSupabase = createClientSupabase();

      for (const emailCandidate of candidates) {
        try {
          const { data: userList } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          const usersArr = ((userList as any)?.users || []) as Array<{
            id: string;
            email?: string;
            user_metadata?: Record<string, any>;
          }>;
          const foundUser = usersArr.find(
            (u) => (u.email || '').toLowerCase() === emailCandidate.toLowerCase()
          );
          if (foundUser) {
            const { data: hashRow } = await adminSupabase
              .from('user_password_hashes')
              .select('argon2_hash')
              .eq('user_id', foundUser.id)
              .maybeSingle();
            if (hashRow?.argon2_hash && (await verifyArgon2idPassword(password, hashRow.argon2_hash))) {
              matchedAuth = foundUser;
              break;
            }
          }
        } catch {
          // Continue to password check
        }

        const { data: authData, error: authError } = await clientSupabase.auth.signInWithPassword({
          email: emailCandidate,
          password,
        });
        if (!authError && authData?.user) {
          matchedAuth = authData.user;
          await syncUserPasswordHash(authData.user.id, password);
          break;
        }
      }

      if (!matchedAuth) {
        await recordAuthFailure(lockKeys);
        await writeAuditLog({
          request,
          actorId: rawIdentifier.slice(0, 64),
          actorType: 'customer',
          action: 'CLIENT_VERIFY_FAILED',
          metadata: { reason: 'bad_credentials' },
        });
        await ensureMinimumLatency(startedAt, 360);
        return NextResponse.json(
          { success: false, message: 'Geçersiz kimlik bilgileri.' },
          { status: 401 }
        );
      }

      userId = matchedAuth.id;
      userDisplay = matchedAuth.user_metadata?.username || rawIdentifier;
    }

    await clearAuthLockout(lockKeys);

    // 3. Lisans Sorgulama
    const { data: license, error: licenseError } = await adminSupabase
      .from('user_licenses')
      .select('id, status, expires_at, hwid')
      .eq('user_id', userId)
      .eq('product_name', productName)
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        {
          success: false,
          message: `'${productName}' ürünü için aktif lisans bulunamadı. Lütfen önce restrictedstudio.shop üzerinden kodunuzu etkinleştiriniz.`,
        },
        { status: 403 }
      );
    }

    if (license.status === 'banned') {
      return NextResponse.json(
        { success: false, message: 'Bu lisans yönetici tarafından askıya alınmıştır/banlanmıştır.' },
        { status: 403 }
      );
    }

    if (license.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Lisans durumu aktif değil.' },
        { status: 403 }
      );
    }

    const expiresAt = new Date(license.expires_at);
    const now = new Date();
    if (expiresAt <= now) {
      await adminSupabase.from('user_licenses').update({ status: 'expired' }).eq('id', license.id);
      return NextResponse.json(
        { success: false, message: 'Lisans süreniz sona ermiştir. Lütfen İtemsatış üzerinden yenileyiniz.' },
        { status: 403 }
      );
    }

    // 4. HWID Kilidi
    if (!license.hwid) {
      const { error: updateHwidError } = await adminSupabase
        .from('user_licenses')
        .update({ hwid })
        .eq('id', license.id);

      if (updateHwidError) {
        return NextResponse.json(
          { success: false, message: 'HWID kaydı sırasında bir hata oluştu.' },
          { status: 500 }
        );
      }
    } else if (license.hwid !== hwid) {
      await writeAuditLog({
        request,
        actorId: userId,
        actorType: 'customer',
        action: 'CLIENT_VERIFY_HWID_MISMATCH',
        resourceType: 'user_license',
        resourceId: license.id,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            'Farklı bir cihaz tespit edildi (HWID uyuşmazlığı). Lisansınız başka bir bilgisayara kilitli. Bilgisayar değiştirdiyseniz destek ekibimizle iletişime geçerek HWID sıfırlatınız.',
        },
        { status: 403 }
      );
    }

    await writeAuditLog({
      request,
      actorId: userId,
      actorType: 'customer',
      action: 'CLIENT_VERIFY_SUCCESS',
      resourceType: 'user_license',
      resourceId: license.id,
    });

    const remainingDays = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json(
      {
        success: true,
        user: userDisplay,
        product: productName,
        status: 'active',
        hwid_locked: true,
        expires_at: license.expires_at,
        days_remaining: remainingDays,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Doğrulama sunucusunda beklenmeyen bir hata oluştu.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
