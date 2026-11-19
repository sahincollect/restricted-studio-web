import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { SupportThreadMessageSchema, sanitizePlainText } from '@/lib/validation';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getUserProfile } from '@/lib/account-store';
import {
  appendOrderMessage,
  cleanupExpiredPendingShopierOrders,
  createOrderWithWelcomeMessage,
  generateSupportReferenceCode,
  getOrderWithMessages,
  isPendingShopierOrderExpired,
  listOrdersForUser,
  type OrderMessageRecord,
  type OrderRecord,
} from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';
import { dispatchOrderNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { authenticated: false, threads: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const url = new URL(request.url);
  const requestedRef = url.searchParams.get('ref')?.trim().toUpperCase() || '';

  const [{ profile }, initialThreads] = await Promise.all([
    getUserProfile(session.user),
    listOrdersForUser(session.user.id),
  ]);

  let threads = initialThreads;
  if (threads.some((o) => isPendingShopierOrderExpired(o))) {
    const cleaned = await cleanupExpiredPendingShopierOrders({
      force: true,
      candidateOrders: threads,
      request,
    });
    if (cleaned.cancelledRefs.length > 0 || cleaned.promotedRefs.length > 0) {
      threads = await listOrdersForUser(session.user.id);
    }
  }

  const targetRef =
    requestedRef && threads.some((t) => t.referenceCode === requestedRef)
      ? requestedRef
      : threads[0]?.referenceCode || null;

  let activeThread: OrderRecord | null = null;
  let messages: OrderMessageRecord[] = [];
  if (targetRef) {
    const data = await getOrderWithMessages(targetRef);
    if (data.order && data.order.userId === session.user.id) {
      activeThread = data.order;
      messages = data.messages;
    }
  }

  const res = NextResponse.json(
    {
      authenticated: true,
      user: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        isGuest: profile.isGuest,
        telegramLinked: Boolean(profile.telegramLinked),
      },
      threads,
      activeRef: activeThread?.referenceCode || null,
      activeThread,
      messages,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'order_chat', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, message: 'Mesaj göndermek için oturum açmalısınız.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const validated = SupportThreadMessageSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz mesaj bilgisi.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const cleanBody = sanitizePlainText(validated.data.body, 1500);
  if (!cleanBody) {
    return NextResponse.json(
      { success: false, message: 'Mesaj boş olamaz.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { profile } = await getUserProfile(session.user);
  const senderName = profile.displayName || session.user.name || 'Üye';

  if (validated.data.referenceCode) {
    const found = await getOrderWithMessages(validated.data.referenceCode);
    if (!found.order) {
      return NextResponse.json(
        { success: false, message: 'Görüşme bulunamadı.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    if (found.order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Bu görüşmeye mesaj gönderme yetkiniz yok.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const msg = await appendOrderMessage({
      order: found.order,
      senderUserId: session.user.id,
      senderRole: 'customer',
      senderName,
      senderAvatar: profile.avatarUrl,
      messageType: 'text',
      body: cleanBody,
    });

    await writeAuditLog({
      request,
      actorId: session.user.id,
      actorType: 'customer',
      action: 'ORDER_CHAT_CUSTOMER_MESSAGE',
      resourceType: 'order',
      resourceId: found.order.referenceCode,
    });

    await dispatchOrderNotification({
      type: 'customer_message',
      order: found.order,
      senderName,
      messageBody: cleanBody,
    });

    const fresh = await getOrderWithMessages(found.order.referenceCode);
    const res = NextResponse.json(
      {
        success: true,
        referenceCode: found.order.referenceCode,
        order: fresh.order || found.order,
        messages: fresh.messages,
        message: msg,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
    return res;
  }

  const cleanTopic = sanitizePlainText(validated.data.topic, 80) || 'Canlı Destek & Soru';
  const ref = generateSupportReferenceCode();

  const created = await createOrderWithWelcomeMessage({
    referenceCode: ref,
    userId: session.user.id,
    buyerEmail: profile.email || session.user.email || '',
    buyerName: senderName,
    source: 'support',
    paymentProvider: 'direct',
    title: cleanTopic,
    items: [],
    totalAmount: 0,
    shopierProductId: null,
    shopierCheckoutUrl: null,
    initialStatus: 'preparing',
  });

  const msg = await appendOrderMessage({
    order: created.order,
    senderUserId: session.user.id,
    senderRole: 'customer',
    senderName,
    senderAvatar: profile.avatarUrl,
    messageType: 'text',
    body: cleanBody,
  });

  await writeAuditLog({
    request,
    actorId: session.user.id,
    actorType: 'customer',
    action: 'SUPPORT_THREAD_CREATED',
    resourceType: 'order',
    resourceId: ref,
    metadata: { topic: cleanTopic },
  });

  await dispatchOrderNotification({
    type: 'customer_message',
    order: created.order,
    senderName,
    messageBody: cleanBody,
  });

  const fresh = await getOrderWithMessages(ref);
  const res = NextResponse.json(
    {
      success: true,
      referenceCode: ref,
      order: fresh.order || created.order,
      messages: fresh.messages,
      message: msg,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
