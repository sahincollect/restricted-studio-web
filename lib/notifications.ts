import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createAdminSupabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site-config';
import {
  getCustomerNotificationContact,
  setCustomerNotifReadCursor,
} from '@/lib/account-store';
import { escapeHtml, sanitizePlainText } from '@/lib/validation';
import {
  escapeTelegramHtml,
  isTelegramConfigured,
  notifyAdminTelegram,
  sendTelegramMessage,
} from '@/lib/telegram';
import type { OrderRecord } from '@/lib/orders-pure';

export type NotificationKind =
  | 'order_paid'
  | 'order_delivered'
  | 'admin_message'
  | 'order_expired'
  | 'info';

export interface UserNotificationRecord {
  id: string;
  userId: string;
  referenceCode: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}

const LOCAL_NOTIFS_FILE = path.join(process.cwd(), '.data', 'user-notifications.json');
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM_EMAIL = 'Restricted Studio <noreply@restrictedstudio.shop>';

const SYNTHETIC_EMAIL_RE =
  /@(kullanici\.restrictedstudio\.shop|anon\.restrictedstudio\.shop|restrictedstudio\.com|restrictedstudio\.local|restricted\.studio)$/i;

const globalNotifs = globalThis as unknown as {
  __rsUserNotifs?: UserNotificationRecord[];
};

async function readLocalNotifs(): Promise<UserNotificationRecord[]> {
  if (globalNotifs.__rsUserNotifs) return globalNotifs.__rsUserNotifs;
  if (process.env.VERCEL !== '1') {
    try {
      const raw = await fs.readFile(LOCAL_NOTIFS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalNotifs.__rsUserNotifs = parsed;
        return parsed;
      }
    } catch {
      // missing
    }
  }
  globalNotifs.__rsUserNotifs = [];
  return globalNotifs.__rsUserNotifs;
}

async function writeLocalNotifs(list: UserNotificationRecord[]): Promise<void> {
  globalNotifs.__rsUserNotifs = list.slice(0, 500);
  if (process.env.VERCEL === '1') return;
  try {
    await fs.mkdir(path.dirname(LOCAL_NOTIFS_FILE), { recursive: true });
    await fs.writeFile(LOCAL_NOTIFS_FILE, JSON.stringify(globalNotifs.__rsUserNotifs, null, 2), 'utf8');
  } catch {
    // ignore fs error
  }
}

export async function createUserNotification(params: {
  userId: string;
  referenceCode?: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
}): Promise<UserNotificationRecord> {
  const nowIso = new Date().toISOString();
  const record: UserNotificationRecord = {
    id: crypto.randomUUID(),
    userId: params.userId,
    referenceCode: params.referenceCode || null,
    kind: params.kind,
    title: sanitizePlainText(params.title, 120),
    body: sanitizePlainText(params.body, 320),
    href: params.href || (params.referenceCode ? `/hesabim?tab=orders&ref=${encodeURIComponent(params.referenceCode)}` : '/hesabim'),
    readAt: null,
    createdAt: nowIso,
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase.from('user_notifications').insert({
        id: record.id,
        user_id: record.userId,
        reference_code: record.referenceCode,
        kind: record.kind,
        title: record.title,
        body: record.body,
        href: record.href,
        created_at: nowIso,
      });
    } catch {
      // Fall back smoothly when table hasn't been created yet
    }
  }

  const local = await readLocalNotifs();
  local.unshift(record);
  await writeLocalNotifs(local);
  return record;
}

export async function listUserNotifications(userId: string, limit = 25): Promise<{
  notifications: UserNotificationRecord[];
  unreadCount: number;
}> {
  const contact = await getCustomerNotificationContact(userId);
  const readCursorMs = contact.lastNotifReadAt ? Date.parse(contact.lastNotifReadAt) : 0;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data)) {
        const mapped: UserNotificationRecord[] = data.map((r: Record<string, any>) => ({
          id: String(r.id),
          userId: String(r.user_id),
          referenceCode: r.reference_code ? String(r.reference_code) : null,
          kind: (r.kind as NotificationKind) || 'info',
          title: String(r.title || ''),
          body: String(r.body || ''),
          href: String(r.href || '/hesabim'),
          readAt: r.read_at ? String(r.read_at) : null,
          createdAt: String(r.created_at),
        }));
        const unreadCount = mapped.filter((n) => !n.readAt).length;
        return { notifications: mapped, unreadCount };
      }

      // Fallback: derive customer notifications cleanly from order_messages + orders when user_notifications table is not yet created
      const { data: userOrders } = await adminSupabase
        .from('orders')
        .select('id, reference_code, title, status')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (Array.isArray(userOrders) && userOrders.length > 0) {
        const orderIds = userOrders.map((o) => String(o.id));
        const { data: msgRows } = await adminSupabase
          .from('order_messages')
          .select('id, reference_code, sender_role, sender_name, message_type, body, created_at')
          .in('order_id', orderIds)
          .neq('sender_role', 'customer')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (Array.isArray(msgRows)) {
          const derived: UserNotificationRecord[] = msgRows.map((m: Record<string, any>) => {
            const ref = String(m.reference_code);
            const createdIso = String(m.created_at);
            const isBundle = m.message_type === 'delivery_bundle';
            const isAdmin = m.sender_role === 'admin';
            const kind: NotificationKind = isBundle
              ? 'order_delivered'
              : isAdmin
              ? 'admin_message'
              : 'info';
            const title = isBundle
              ? `Ürününüz Hazır · ${ref}`
              : isAdmin
              ? `Yetkili Mesajı · ${ref}`
              : `Sipariş Güncellemesi · ${ref}`;
            const isRead = Boolean(readCursorMs && Date.parse(createdIso) <= readCursorMs);
            return {
              id: String(m.id),
              userId,
              referenceCode: ref,
              kind,
              title,
              body: String(m.body || '').slice(0, 180),
              href: `/hesabim?tab=orders&ref=${encodeURIComponent(ref)}`,
              readAt: isRead ? contact.lastNotifReadAt : null,
              createdAt: createdIso,
            };
          });
          return {
            notifications: derived,
            unreadCount: derived.filter((n) => !n.readAt).length,
          };
        }
      }
    } catch {
      // fall through
    }
  }

  const local = (await readLocalNotifs()).filter((n) => n.userId === userId).slice(0, limit);
  const unreadCount = local.filter((n) => !n.readAt).length;
  return { notifications: local, unreadCount };
}

export async function markUserNotificationsRead(userId: string, notificationId?: string): Promise<void> {
  const nowIso = new Date().toISOString();
  await setCustomerNotifReadCursor(userId, nowIso);

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      let query = adminSupabase
        .from('user_notifications')
        .update({ read_at: nowIso })
        .eq('user_id', userId)
        .is('read_at', null);
      if (notificationId) {
        query = query.eq('id', notificationId);
      }
      await query;
    } catch {
      // ignore if unmigrated
    }
  }

  const local = await readLocalNotifs();
  let changed = false;
  for (const item of local) {
    if (item.userId === userId && !item.readAt && (!notificationId || item.id === notificationId)) {
      item.readAt = nowIso;
      changed = true;
    }
  }
  if (changed) {
    await writeLocalNotifs(local);
  }
}

async function sendCustomerEmailNotification(params: {
  toEmail: string;
  subject: string;
  headline: string;
  bodyText: string;
  ctaUrl: string;
  ctaLabel: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const cleanTo = (params.toEmail || '').trim().toLowerCase();
  if (!apiKey || !cleanTo || !cleanTo.includes('@') || SYNTHETIC_EMAIL_RE.test(cleanTo)) {
    return false;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const html = `
  <div style="background:#0d0c0d;padding:28px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
    <div style="max-width:560px;margin:0 auto;background:#141316;border:1px solid #2a272c;border-radius:18px;padding:24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ef5b38;">RESTRICTED STUDIO · BİLDİRİM</div>
      <h1 style="margin:10px 0 12px;font-size:19px;font-weight:700;color:#ffffff;">${escapeHtml(params.headline)}</h1>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#d4d4d8;white-space:pre-line;">${escapeHtml(params.bodyText)}</p>
      <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#ef5b38;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">${escapeHtml(params.ctaLabel)}</a>
    </div>
  </div>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [cleanTo],
        subject: params.subject,
        html,
        text: `${params.headline}\n\n${params.bodyText}\n\n${params.ctaLabel}: ${params.ctaUrl}`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type OrderNotificationEvent =
  | { type: 'order_created'; order: OrderRecord }
  | { type: 'order_paid'; order: OrderRecord; shopierOrderId?: string | null }
  | { type: 'customer_message'; order: OrderRecord; senderName: string; messageBody: string }
  | { type: 'admin_message'; order: OrderRecord; messageBody: string }
  | { type: 'order_delivered'; order: OrderRecord; instructions: string; hasCode?: boolean; hasUrl?: boolean }
  | { type: 'order_expired'; order: OrderRecord };

/**
 * Central order notification dispatcher:
 * - Admin alerts go immediately via Telegram (`notifyAdminTelegram`)
 * - Customer alerts record in-app notifications (`user_notifications`), send Telegram if linked, and optionally send Resend email when `RESEND_API_KEY` is configured.
 */
export async function dispatchOrderNotification(event: OrderNotificationEvent): Promise<void> {
  const { order } = event;
  const ref = order.referenceCode;
  const orderHref = `/hesabim?tab=orders&ref=${encodeURIComponent(ref)}`;
  const orderFullUrl = `${SITE_URL}${orderHref}`;

  try {
    if (event.type === 'order_created') {
      const msg = [
        `🛒 <b>Yeni Shopier Referans İlanı</b>`,
        `<b>Ref:</b> <code>${escapeTelegramHtml(ref)}</code>`,
        `<b>Ürün:</b> ${escapeTelegramHtml(order.title)}`,
        `<b>Tutar:</b> ${escapeTelegramHtml(order.totalAmount)} TL`,
        `<b>Alıcı:</b> ${escapeTelegramHtml(order.buyerName || order.buyerEmail || order.userId.slice(0, 8))}`,
        `<i>Ödeme penceresi: 15 dakika</i>`,
      ].join('\n');
      await notifyAdminTelegram(msg, { text: 'Admin Siparişlerini Aç', path: '/admin' });
      return;
    }

    if (event.type === 'customer_message') {
      const snippet = sanitizePlainText(event.messageBody, 450);
      const msg = [
        `💬 <b>Müşteriden Yeni Mesaj</b>`,
        `<b>Ref:</b> <code>${escapeTelegramHtml(ref)}</code>`,
        `<b>Gönderen:</b> ${escapeTelegramHtml(event.senderName)}`,
        `<b>Ürün:</b> ${escapeTelegramHtml(order.title)}`,
        ``,
        `“${escapeTelegramHtml(snippet)}”`,
      ].join('\n');
      await notifyAdminTelegram(msg, { text: 'Sohbeti Yanıtla (/admin)', path: '/admin' });
      return;
    }

    const contact = await getCustomerNotificationContact(order.userId);
    const tgEnabled = isTelegramConfigured() && Boolean(contact.telegramChatId);

    if (event.type === 'order_paid') {
      const adminMsg = [
        `💰 <b>ÜRÜN SATILDI (ÖDEME ONAYLANDI)</b>`,
        `<b>Ref:</b> <code>${escapeTelegramHtml(ref)}</code>`,
        `<b>Ürün:</b> ${escapeTelegramHtml(order.title)}`,
        `<b>Tutar:</b> ${escapeTelegramHtml(order.totalAmount)} TL`,
        event.shopierOrderId ? `<b>Shopier Sipariş:</b> #${escapeTelegramHtml(event.shopierOrderId)}` : null,
        `<b>Alıcı:</b> ${escapeTelegramHtml(order.buyerName || order.buyerEmail || 'Üye')}`,
      ]
        .filter(Boolean)
        .join('\n');

      await notifyAdminTelegram(adminMsg, { text: 'Teslimatı Başlat (/admin)', path: '/admin' });

      const custTitle = `Ödemeniz Onaylandı · ${ref}`;
      const custBody = `"${order.title}" siparişinizin ödemesi doğrulandı ve teslimat sırasına alındı. Ortalama teslimat süresi 2 saat, yoğunlukta 6–24 saattir.`;

      await createUserNotification({
        userId: order.userId,
        referenceCode: ref,
        kind: 'order_paid',
        title: custTitle,
        body: custBody,
        href: orderHref,
      });

      if (tgEnabled && contact.telegramChatId) {
        await sendTelegramMessage(
          contact.telegramChatId,
          [
            `✅ <b>${escapeTelegramHtml(custTitle)}</b>`,
            escapeTelegramHtml(custBody),
          ].join('\n\n'),
          { text: 'Teslimat Odasını Aç', url: orderFullUrl }
        );
      }

      await sendCustomerEmailNotification({
        toEmail: order.buyerEmail || contact.email,
        subject: `[Restricted Studio] ${custTitle}`,
        headline: custTitle,
        bodyText: custBody,
        ctaUrl: orderFullUrl,
        ctaLabel: 'Siparişi & Sohbeti Görüntüle',
      });
      return;
    }

    if (event.type === 'admin_message') {
      const preview = sanitizePlainText(event.messageBody, 350);
      const custTitle = `Yetkili Mesaj Gönderdi · ${ref}`;

      await createUserNotification({
        userId: order.userId,
        referenceCode: ref,
        kind: 'admin_message',
        title: custTitle,
        body: preview,
        href: orderHref,
      });

      if (tgEnabled && contact.telegramChatId) {
        await sendTelegramMessage(
          contact.telegramChatId,
          [
            `💬 <b>${escapeTelegramHtml(custTitle)}</b>`,
            `<b>Ürün:</b> ${escapeTelegramHtml(order.title)}`,
            ``,
            `“${escapeTelegramHtml(preview)}”`,
          ].join('\n'),
          { text: 'Sohbetten Yanıtla', url: orderFullUrl }
        );
      }

      await sendCustomerEmailNotification({
        toEmail: order.buyerEmail || contact.email,
        subject: `[Restricted Studio] ${custTitle}`,
        headline: custTitle,
        bodyText: `${order.title} siparişiniz için teslimat ekibimiz yeni bir mesaj paylaştı:\n\n"${preview}"`,
        ctaUrl: orderFullUrl,
        ctaLabel: 'Mesajı Görüntüle',
      });
      return;
    }

    if (event.type === 'order_delivered') {
      const custTitle = `Ürününüz Hazır / Teslim Edildi! · ${ref}`;
      const snippet = sanitizePlainText(event.instructions, 300);

      await createUserNotification({
        userId: order.userId,
        referenceCode: ref,
        kind: 'order_delivered',
        title: custTitle,
        body: `"${order.title}" teslimatı tamamlandı. ${snippet}`,
        href: orderHref,
      });

      if (tgEnabled && contact.telegramChatId) {
        await sendTelegramMessage(
          contact.telegramChatId,
          [
            `🎉 <b>${escapeTelegramHtml(custTitle)}</b>`,
            `<b>Ürün:</b> ${escapeTelegramHtml(order.title)}`,
            event.hasCode ? `🔑 <b>Aktivasyon / Lisans Kodu</b> kasanıza eklendi.` : null,
            event.hasUrl ? `📦 <b>İndirme Bağlantısı</b> kasanıza eklendi.` : null,
            ``,
            escapeTelegramHtml(snippet),
          ]
            .filter(Boolean)
            .join('\n'),
          { text: 'Teslimat Kasasını Aç', url: orderFullUrl }
        );
      }

      await sendCustomerEmailNotification({
        toEmail: order.buyerEmail || contact.email,
        subject: `[Restricted Studio] ${custTitle}`,
        headline: custTitle,
        bodyText: `"${order.title}" siparişiniz teslim edildi.\n\nNot: ${snippet}\n\nLisans kodunuz ve teslimat detayları Hesabım -> Teslimat Kasası bölümünde sabitlendi.`,
        ctaUrl: orderFullUrl,
        ctaLabel: 'Teslimat Kasasına Git',
      });
      return;
    }

    if (event.type === 'order_expired') {
      await notifyAdminTelegram(
        [
          `⏰ <b>15 Dk Ödeme Süresi Doldu</b>`,
          `<b>Ref:</b> <code>${escapeTelegramHtml(ref)}</code>`,
          `<b>Ürün:</b> ${escapeTelegramHtml(order.title)} (${escapeTelegramHtml(order.totalAmount)} TL)`,
          `Referanslı Shopier ilanı otomatik olarak kaldırıldı.`,
        ].join('\n'),
        { text: 'Admin Paneli', path: '/admin' }
      );

      const custTitle = `Ödeme Süresi Doldu · ${ref}`;
      const custBody = `15 dakika içinde ödeme tamamlanmadığı için "${order.title}" Shopier ilanı otomatik olarak kaldırıldı.`;

      await createUserNotification({
        userId: order.userId,
        referenceCode: ref,
        kind: 'order_expired',
        title: custTitle,
        body: custBody,
        href: orderHref,
      });

      if (tgEnabled && contact.telegramChatId) {
        await sendTelegramMessage(
          contact.telegramChatId,
          `⏰ <b>${escapeTelegramHtml(custTitle)}</b>\n${escapeTelegramHtml(custBody)}`,
          { text: 'Siparişi İncele', url: orderFullUrl }
        );
      }
    }
  } catch (err) {
    console.error('dispatchOrderNotification error:', err instanceof Error ? err.message : 'unknown');
  }
}

export async function notifyServiceRequestTelegram(params: {
  requestId: string;
  serviceTitle: string;
  fullName: string;
  email: string;
  discordHandle?: string;
  packageTier: string;
  budget: string;
}): Promise<void> {
  try {
    await notifyAdminTelegram(
      [
        `📩 <b>Yeni Hizmet Talebi (${escapeTelegramHtml(params.requestId)})</b>`,
        `<b>Kategori:</b> ${escapeTelegramHtml(params.serviceTitle)}`,
        `<b>Başvuran:</b> ${escapeTelegramHtml(params.fullName)} (${escapeTelegramHtml(params.email)})`,
        params.discordHandle ? `<b>Discord:</b> ${escapeTelegramHtml(params.discordHandle)}` : null,
        `<b>Paket:</b> ${escapeTelegramHtml(params.packageTier)} · <b>Bütçe:</b> ${escapeTelegramHtml(params.budget)}`,
      ]
        .filter(Boolean)
        .join('\n')
    );
  } catch {
    // non-fatal
  }
}
