import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { RedeemCodeSchema } from '@/lib/validation';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'redeem', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  try {
    const session = await resolveCustomerSession(request);
    if (!session.authenticated || !session.user) {
      const res = NextResponse.json(
        { success: false, message: 'Oturum bilgisi geçersiz veya süresi doldu. Lütfen tekrar giriş yapın.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
      if (session.clearCookies) clearCustomerSessionCookies(request, res);
      return res;
    }

    const parsed = await parseJsonBodySafe(request, 2048);
    if (!parsed.ok) return parsed.response;

    const validated = RedeemCodeSchema.safeParse(parsed.data);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0]?.message || 'Geçersiz aktivasyon kodu.' },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Aktivasyon servisi geçici olarak kapalı.' },
        { status: 503 }
      );
    }

    const rawCode = validated.data.code;
    const userId = session.user.id;
    const adminSupabase = createAdminSupabase();

    // 1. Validate code existence
    const { data: codeData, error: codeError } = await adminSupabase
      .from('redeem_codes')
      .select('id, code, product_name, duration_days, is_used')
      .eq('code', rawCode)
      .maybeSingle();

    if (codeError || !codeData) {
      return NextResponse.json(
        { success: false, message: 'Girdiğiniz aktivasyon kodu geçersiz.' },
        { status: 404 }
      );
    }

    if (codeData.is_used) {
      return NextResponse.json(
        { success: false, message: 'Bu aktivasyon kodu daha önce kullanılmış.' },
        { status: 400 }
      );
    }

    const durationDays = Number(codeData.duration_days) || 30;
    const productName = codeData.product_name || 'R-AI';

    // 2. Atomic single-use redemption claim
    const { data: updatedRows, error: updateCodeError } = await adminSupabase
      .from('redeem_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', codeData.id)
      .eq('is_used', false)
      .select('id');

    if (updateCodeError || !updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bu kod az önce kullanıldı veya işlem çakışması oluştu.' },
        { status: 409 }
      );
    }

    // 3. BOLA-safe owner-scoped license check
    const { data: existingLicense } = await adminSupabase
      .from('user_licenses')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('product_name', productName)
      .maybeSingle();

    if (existingLicense?.status === 'banned') {
      await adminSupabase
        .from('redeem_codes')
        .update({ is_used: false, used_by: null, used_at: null })
        .eq('id', codeData.id);
      return NextResponse.json(
        { success: false, message: 'Bu lisans askıya alınmış. Lütfen destek ile iletişime geçin.' },
        { status: 403 }
      );
    }

    const now = new Date();
    const newExpiry =
      existingLicense && new Date(existingLicense.expires_at) > now
        ? new Date(new Date(existingLicense.expires_at).getTime() + durationDays * 86400000)
        : new Date(now.getTime() + durationDays * 86400000);

    const { error: licenseWriteError } = existingLicense
      ? await adminSupabase
          .from('user_licenses')
          .update({
            expires_at: newExpiry.toISOString(),
            status: 'active',
          })
          .eq('id', existingLicense.id)
          .eq('user_id', userId)
      : await adminSupabase.from('user_licenses').insert({
          user_id: userId,
          product_name: productName,
          status: 'active',
          expires_at: newExpiry.toISOString(),
        });

    if (licenseWriteError) {
      await adminSupabase
        .from('redeem_codes')
        .update({ is_used: false, used_by: null, used_at: null })
        .eq('id', codeData.id);
      return NextResponse.json(
        { success: false, message: 'Lisans tanımlanamadı, kodunuz iade edildi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    await writeAuditLog({
      request,
      actorId: userId,
      actorType: 'customer',
      action: 'LICENSE_REDEEMED',
      resourceType: 'user_license',
      resourceId: existingLicense?.id || productName,
      beforeState: existingLicense
        ? { status: existingLicense.status, expires_at: existingLicense.expires_at }
        : null,
      afterState: { status: 'active', expires_at: newExpiry.toISOString(), duration_days: durationDays },
      metadata: { productName, codeId: codeData.id },
    });

    const res = NextResponse.json(
      {
        success: true,
        message: `${productName} lisansınız ${durationDays} gün boyunca başarıyla aktive edildi!`,
        expires_at: newExpiry.toISOString(),
        duration_days: durationDays,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.refreshedTokens) {
      attachCustomerCookies(request, res, session.refreshedTokens);
    }
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Aktivasyon işlemi şu anda tamamlanamıyor.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
