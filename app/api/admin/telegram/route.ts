import { NextResponse } from 'next/server';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { finalizeAdminResponse, verifyAdminAuth } from '@/lib/admin-auth';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { SITE_URL } from '@/lib/site-config';
import {
  createTelegramAdminBindUrl,
  getTelegramBotProfile,
  getTelegramBotUsername,
  getTelegramWebhookInfo,
  getTelegramWebhookSecret,
  isTelegramConfigured,
  listAdminTelegramChatEntries,
  notifyAdminTelegram,
  setupTelegramWebhook,
} from '@/lib/telegram';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const configured = isTelegramConfigured();
  const [chats, webhookInfo, botInfo] = await Promise.all([
    listAdminTelegramChatEntries(),
    configured ? getTelegramWebhookInfo() : Promise.resolve({ ok: false, result: undefined }),
    configured ? getTelegramBotProfile() : Promise.resolve({ ok: false, result: undefined }),
  ]);

  return finalizeAdminResponse(request, auth, {
    success: true,
    configured,
    botUsername: botInfo?.result?.username || getTelegramBotUsername(),
    webhookSecretConfigured: Boolean(getTelegramWebhookSecret()),
    webhookUrl: webhookInfo?.result?.url || null,
    webhookError: webhookInfo?.result?.last_error_message || null,
    adminChatIdsCount: chats.allChatIds.length,
    envAdminChatIdsCount: chats.envIds.length,
    adminBindUrl: createTelegramAdminBindUrl(),
  });
}

export async function POST(request: Request) {
  const hasSecretHeader = verifyAdminSecret(request.headers.get('x-admin-secret'));
  const guard = guardApiRequest(request, 'admin_api', {
    checkSameOrigin: !hasSecretHeader,
  });
  if (!guard.ok) return guard.response;

  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!isTelegramConfigured()) {
    return finalizeAdminResponse(
      request,
      auth,
      { success: false, message: 'TELEGRAM_BOT_TOKEN ortam değişkeni tanımlı değil.' },
      503
    );
  }

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const action = parsed.data?.action;
  if (action === 'setup_webhook') {
    const secret = getTelegramWebhookSecret();
    if (!secret) {
      return finalizeAdminResponse(
        request,
        auth,
        {
          success: false,
          message: 'Webhook güvenliği için sunucuda TELEGRAM_WEBHOOK_SECRET (en az 16 karakter) tanımlı olmalıdır.',
        },
        400
      );
    }

    const webhookTarget = `${SITE_URL}/api/telegram/webhook`;
    const res = await setupTelegramWebhook(webhookTarget, secret);
    if (!res.ok) {
      return finalizeAdminResponse(
        request,
        auth,
        {
          success: false,
          message: `Telegram webhook kurulamadı: ${res.description || 'Bilinmeyen hata'}`,
        },
        502
      );
    }

    await writeAuditLog({
      request,
      actorId: auth.actorId,
      actorType: 'admin',
      action: 'TELEGRAM_WEBHOOK_CONFIGURED',
      metadata: { webhookTarget },
    });

    return finalizeAdminResponse(request, auth, {
      success: true,
      webhookUrl: webhookTarget,
      message: `Telegram webhook başarıyla bağlandı (${webhookTarget}).`,
    });
  }

  if (action === 'test_admin_message') {
    const res = await notifyAdminTelegram(
      `🔔 <b>Restricted Studio Test Bildirimi</b>\nAdmin Telegram bildirim kanalı aktif ve çalışıyor.`,
      { text: 'Admin Konsolunu Aç', path: '/admin' }
    );
    if (res.sent === 0) {
      return finalizeAdminResponse(
        request,
        auth,
        {
          success: false,
          message:
            'Kayıtlı Admin Chat ID bulunamadı veya mesaj iletilemedi. Önce "Admin Telegram Bağla" butonundan bota /start verin.',
        },
        400
      );
    }
    return finalizeAdminResponse(request, auth, {
      success: true,
      message: `${res.sent} yönetici Telegram sohbetine test bildirimi gönderildi.`,
    });
  }

  return finalizeAdminResponse(request, auth, { success: false, message: 'Geçersiz işlem.' }, 400);
}
