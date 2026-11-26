import { NextResponse } from 'next/server';
import { verifyShopierWebhookSignature, type ShopierOrderRecord } from '@/lib/shopier';
import {
  appendOrderMessage,
  DELIVERY_SLA_NOTICE_TR,
  getOrderWithMessages,
  listAllOrdersAdmin,
  matchShopierOrderToInternal,
  updateOrderStatusAndDelivery,
  type OrderRecord,
} from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';
import { dispatchOrderNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ success: false, message: 'Geçersiz gövde.' }, { status: 400 });
  }

  if (!rawBody || rawBody.length > 65_536) {
    return NextResponse.json({ success: false, message: 'Geçersiz payload boyutu.' }, { status: 400 });
  }

  const signature = request.headers.get('shopier-signature');
  if (!verifyShopierWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { success: false, message: 'Webhook imzası doğrulanamadı.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let payload: ShopierOrderRecord & { data?: ShopierOrderRecord };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: 'Geçersiz JSON.' }, { status: 400 });
  }

  const eventName = (request.headers.get('shopier-event') || '').trim();
  const shopierOrder: ShopierOrderRecord =
    payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;

  if (!shopierOrder?.id) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const all = await listAllOrdersAdmin(150);
  let targetOrder: OrderRecord | null = null;

  for (const ord of all.orders) {
    if (matchShopierOrderToInternal(ord, [shopierOrder])) {
      targetOrder = ord;
      break;
    }
  }

  // Fallback regex match if reference code appears in Shopier note or title
  if (!targetOrder) {
    const textBlob = `${shopierOrder.note || ''} ${(shopierOrder.lineItems || []).map((l) => l.title).join(' ')}`;
    const refMatch = textBlob.match(/RS-ORD-\d{6}-[A-Z0-9]{6}/i);
    if (refMatch) {
      targetOrder = (await getOrderWithMessages(refMatch[0].toUpperCase())).order;
    }
  }

  if (targetOrder && targetOrder.status === 'pending_payment') {
    const nextStatus = eventName === 'order.fulfilled' ? 'delivered' : 'preparing';
    const paidIso = shopierOrder.dateCreated
      ? new Date(shopierOrder.dateCreated).toISOString()
      : new Date().toISOString();

    const updated = await updateOrderStatusAndDelivery({
      order: targetOrder,
      status: nextStatus,
      shopierOrderId: String(shopierOrder.id),
      paidAt: paidIso,
    });

    await appendOrderMessage({
      order: updated,
      senderUserId: null,
      senderRole: 'system',
      senderName: 'Shopier Webhook Doğrulama',
      senderAvatar: '/assets/newstlogo.jpg',
      messageType: 'status_update',
      body: `Shopier ödemesi doğrulandı (Sipariş #${shopierOrder.id}). Siparişiniz teslimat ekibine iletildi. ${DELIVERY_SLA_NOTICE_TR}`,
    });

    await writeAuditLog({
      request,
      actorId: 'shopier-webhook',
      actorType: 'system',
      action: 'SHOPIER_WEBHOOK_ORDER_PAID',
      resourceType: 'order',
      resourceId: targetOrder.referenceCode,
      metadata: { eventName, shopierOrderId: String(shopierOrder.id) },
    });

    await dispatchOrderNotification({
      type: 'order_paid',
      order: updated,
      shopierOrderId: String(shopierOrder.id),
    });
  }

  return NextResponse.json({ success: true, event: eventName || 'ok' });
}
