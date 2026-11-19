import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { SITE_URL } from '@/lib/site-config';
import {
  findCustomerUserIdByTelegramChatId,
  linkCustomerTelegramChat,
  unlinkCustomerTelegramChat,
} from '@/lib/account-store';
import { listOrdersForUser } from '@/lib/orders-store';
import {
  escapeTelegramHtml,
  getTelegramWebhookSecret,
  isTelegramConfigured,
  saveBoundAdminTelegramChatId,
  sendTelegramMessage,
  verifyTelegramStartToken,
} from '@/lib/telegram';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

function timingSafeSecretMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = crypto.createHash('sha256').update(provided.trim()).digest();
  const b = crypto.createHash('sha256').update(expected.trim()).digest();
  return crypto.timingSafeEqual(a, b);
}

const ORDER_STATUS_TR: Record<string, string> = {
  pending_payment: 'Ödeme Bekliyor',
  paid: 'Ödendi',
  preparing: 'Hazırlanıyor',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'api_default', { checkSameOrigin: false });
  if (!guard.ok) return guard.response;

  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: false, message: 'Telegram bot disabled' }, { status: 503 });
  }

  const webhookSecret = getTelegramWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, message: 'TELEGRAM_WEBHOOK_SECRET not configured' },
      { status: 503 }
    );
  }

  const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
  if (!timingSafeSecretMatch(headerSecret, webhookSecret)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = await parseJsonBodySafe(request, 32768);
  if (!parsed.ok) return parsed.response;

  const update = parsed.data as {
    message?: {
      chat?: { id?: number | string; type?: string };
      from?: { id?: number | string; username?: string; is_bot?: boolean };
      text?: string;
    };
  };

  const msg = update?.message;
  if (!msg?.chat?.id || !msg.text || msg.from?.is_bot) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(msg.chat.id);
  const username = msg.from?.username || null;
  const text = msg.text.trim();

  if (text.startsWith('/chatid')) {
    await sendTelegramMessage(
      chatId,
      `🆔 <b>Chat ID'niz:</b> <code>${escapeTelegramHtml(chatId)}</code>`
    );
    return NextResponse.json({ ok: true });
  }

  if (msg.chat.type && msg.chat.type !== 'private') {
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/start')) {
    const arg = text.slice('/start'.length).trim();
    if (!arg) {
      await sendTelegramMessage(
        chatId,
        [
          `👋 <b>Restricted Studio Bildirim Botuna Hoş Geldiniz!</b>`,
          ``,
          `Sipariş onaylarını, yetkili mesajlarını ve teslimat ("Ürününüz hazır") bildirimlerini almak için web sitemizdeki <b>Hesabım → Telegram Bildirimlerini Bağla</b> butonuna tıklayın.`,
          ``,
          `🆔 Chat ID: <code>${escapeTelegramHtml(chatId)}</code>`,
          `Komutlar: /durum · /chatid · /iptal`,
        ].join('\n'),
        { text: 'Hesabım & Siparişler', url: `${SITE_URL}/hesabim` }
      );
      return NextResponse.json({ ok: true });
    }

    const verified = verifyTelegramStartToken(arg);
    if (!verified) {
      await sendTelegramMessage(
        chatId,
        `⚠️ Bağlantı anahtarı geçersiz veya süresi dolmuş. Lütfen siteden yeniden <b>Telegram Bildirimlerini Bağla</b> butonuna tıklayın.`,
        { text: 'Hesabım Sayfasını Aç', url: `${SITE_URL}/hesabim` }
      );
      return NextResponse.json({ ok: true });
    }

    if (verified.role === 'admin') {
      await saveBoundAdminTelegramChatId(chatId, username);
      await writeAuditLog({
        request,
        actorId: chatId,
        actorType: 'admin',
        action: 'TELEGRAM_ADMIN_CHAT_LINKED',
        metadata: { username },
      });
      await sendTelegramMessage(
        chatId,
        [
          `✅ <b>Admin Telegram Bildirimleri Etkinleştirildi!</b>`,
          `Yeni siparişler, Shopier ödeme onayları, müşteri mesajları ve 15 dk zaman aşımı uyarıları artık bu sohbete düşecektir.`,
          ``,
          `Kalıcı env için Chat ID'niz: <code>${escapeTelegramHtml(chatId)}</code>`,
        ].join('\n'),
        { text: 'Admin Panelini Aç', url: `${SITE_URL}/admin` }
      );
      return NextResponse.json({ ok: true });
    }

    await linkCustomerTelegramChat(verified.userId, chatId, username);
    await writeAuditLog({
      request,
      actorId: verified.userId,
      actorType: 'customer',
      action: 'TELEGRAM_CUSTOMER_LINKED',
      metadata: { chatId, username },
    });

    await sendTelegramMessage(
      chatId,
      [
        `✅ <b>Bildirimler Başarıyla Bağlandı!</b>`,
        `Ödemeniz onaylandığında, teslimat ekibimiz mesaj yazdığında ve ürününüz hazır olduğunda buradan anında bilgilendirileceksiniz.`,
        ``,
        `Komutlar: /durum · /iptal`,
      ].join('\n'),
      { text: 'Hesabıma Dön', url: `${SITE_URL}/hesabim` }
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/durum')) {
    const userId = await findCustomerUserIdByTelegramChatId(chatId);
    if (!userId) {
      await sendTelegramMessage(
        chatId,
        `Bu Telegram hesabı henüz bir Restricted Studio hesabına bağlı değil. Bağlamak için <b>Hesabım</b> sayfasını kullanın.`,
        { text: 'Hesabıma Git', url: `${SITE_URL}/hesabim` }
      );
      return NextResponse.json({ ok: true });
    }

    const orders = await listOrdersForUser(userId);
    if (orders.length === 0) {
      await sendTelegramMessage(chatId, `Henüz oluşturulmuş siparişiniz bulunmuyor.`);
      return NextResponse.json({ ok: true });
    }

    const lines = orders.slice(0, 5).map((o) => {
      const label = ORDER_STATUS_TR[o.status] || o.status;
      return `• <code>${escapeTelegramHtml(o.referenceCode)}</code> — ${escapeTelegramHtml(o.title)} (<b>${escapeTelegramHtml(label)}</b>)`;
    });

    await sendTelegramMessage(
      chatId,
      [`📦 <b>Son Siparişleriniz</b>`, ``, ...lines].join('\n'),
      { text: 'Teslimat Odalarını Aç', url: `${SITE_URL}/hesabim` }
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/iptal') || text.startsWith('/baglantiyi_kes')) {
    const userId = await findCustomerUserIdByTelegramChatId(chatId);
    if (userId) {
      await unlinkCustomerTelegramChat(userId);
    }
    await sendTelegramMessage(
      chatId,
      `🔕 Telegram sipariş bildirimleri durduruldu. İstediğiniz zaman Hesabım sayfasından tekrar bağlayabilirsiniz.`
    );
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(
    chatId,
    `Sipariş sorgulamak için /durum yazabilir veya canlı teslimat sohbeti için Hesabım sayfanızı kullanabilirsiniz.`,
    { text: 'Hesabım & Teslimat', url: `${SITE_URL}/hesabim` }
  );
  return NextResponse.json({ ok: true });
}
