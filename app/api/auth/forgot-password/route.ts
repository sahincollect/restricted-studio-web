import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { ForgotPasswordSchema } from '@/lib/validation';
import { ensureMinimumLatency } from '@/lib/password-security';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const guard = guardApiRequest(request, 'auth_forgot', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const validated = ForgotPasswordSchema.safeParse(parsed.data);
  if (!validated.success) {
    await ensureMinimumLatency(startedAt, 420);
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçerli bir e-posta adresi giriniz.' },
      { status: 400 }
    );
  }

  const { email, turnstileToken } = validated.data;
  const turnstile = await verifyTurnstileToken(turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json({ success: false, message: turnstile.message }, { status: 403 });
  }

  try {
    const supabase = createClientSupabase();
    const origin = new URL(request.url).origin;
    await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    });
  } catch {
    // Intentionally suppressed to prevent user enumeration
  }

  await writeAuditLog({
    request,
    actorId: email.toLowerCase().slice(0, 64),
    actorType: 'customer',
    action: 'CUSTOMER_PASSWORD_RESET_REQUESTED',
  });

  await ensureMinimumLatency(startedAt, 420);

  return NextResponse.json(
    {
      success: true,
      message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa şifre sıfırlama bağlantısı gönderilmiştir.',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
