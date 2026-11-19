import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getCustomerNotificationContact, unlinkCustomerTelegramChat } from '@/lib/account-store';
import { listUserNotifications, markUserNotificationsRead } from '@/lib/notifications';
import { createTelegramCustomerBindUrl, getTelegramBotUsername, isTelegramConfigured } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, authenticated: false },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const [{ notifications, unreadCount }, contact] = await Promise.all([
    listUserNotifications(session.user.id, 20),
    getCustomerNotificationContact(session.user.id),
  ]);

  const telegramBindUrl = createTelegramCustomerBindUrl(session.user.id);

  const res = NextResponse.json(
    {
      success: true,
      authenticated: true,
      notifications,
      unreadCount,
      telegramBotConfigured: isTelegramConfigured(),
      telegramBotUsername: getTelegramBotUsername(),
      telegramLinked: Boolean(contact.telegramChatId),
      telegramUsername: contact.telegramUsername,
      telegramBindUrl,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'api_default', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, message: 'Oturum gerekli.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const body = (parsed.data || {}) as { action?: string; notificationId?: string };

  if (body.action === 'unlink_telegram') {
    await unlinkCustomerTelegramChat(session.user.id);
    const res = NextResponse.json(
      { success: true, telegramLinked: false, message: 'Telegram bildirimi kapatıldı.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
    return res;
  }

  const notifId = typeof body.notificationId === 'string' && body.notificationId.length <= 64 ? body.notificationId : undefined;
  await markUserNotificationsRead(session.user.id, notifId);
  const { notifications, unreadCount } = await listUserNotifications(session.user.id, 20);

  const res = NextResponse.json(
    { success: true, notifications, unreadCount },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
