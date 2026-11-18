import { NextResponse } from 'next/server';
import { createAdminSupabase, createClientSupabase } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import {
  ensureMinimumLatency,
  syncUserPasswordHash,
  validatePasswordPolicy,
} from '@/lib/password-security';
import { PasswordChangeSchema } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'account_update', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, message: 'Oturum doğrulaması gereklidir.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const parsed = await parseJsonBodySafe(request, 2048);
  if (!parsed.ok) return parsed.response;

  const validated = PasswordChangeSchema.safeParse(parsed.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt, 320);
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz şifre.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { currentPassword, newPassword } = validated.data;
  const policy = await validatePasswordPolicy(newPassword, session.user.email || session.user.name);
  if (!policy.ok) {
    await ensureMinimumLatency(startedAt, 320);
    return NextResponse.json(
      { success: false, message: policy.message },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        success: false,
        message: 'Şifre güncelleme servisi için veritabanı servis anahtarı gereklidir.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const adminSupabase = createAdminSupabase();
    const { data: userRes, error: fetchErr } = await adminSupabase.auth.admin.getUserById(session.user.id);
    if (fetchErr || !userRes?.user) {
      return NextResponse.json(
        { success: false, message: 'Hesap kaydı bulunamadı.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const providers = Array.isArray(userRes.user.app_metadata?.providers)
      ? userRes.user.app_metadata.providers
      : [userRes.user.app_metadata?.provider].filter(Boolean);
    const hasEmailProvider = providers.includes('email');

    if (hasEmailProvider && session.user.email) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Mevcut şifrenizi girmelisiniz.' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      const clientSupabase = createClientSupabase();
      const { error: checkErr } = await clientSupabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });
      if (checkErr) {
        await ensureMinimumLatency(startedAt, 360);
        return NextResponse.json(
          { success: false, message: 'Mevcut şifreniz doğrulanamadı.' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    const { error: updateErr } = await adminSupabase.auth.admin.updateUserById(session.user.id, {
      password: newPassword,
    });
    if (updateErr) {
      return NextResponse.json(
        { success: false, message: 'Şifre güncellenemedi.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await syncUserPasswordHash(session.user.id, newPassword);
    await writeAuditLog({
      request,
      actorId: session.user.id,
      actorType: 'customer',
      action: 'CUSTOMER_PASSWORD_CHANGED',
    });

    const res = NextResponse.json(
      { success: true, message: 'Hesap şifreniz güvenle güncellendi.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Şifre güncellenirken sunucu hatası oluştu.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
