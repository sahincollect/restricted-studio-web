import { NextResponse } from 'next/server';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { finalizeAdminResponse, verifyAdminAuth } from '@/lib/admin-auth';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { AdminOrderActionSchema, isSafeHttpsUrl, sanitizePlainText } from '@/lib/validation';
import {
  appendOrderMessage,
  fulfillDeliveredOrderOnShopier,
  getOrderWithMessages,
  updateOrderStatusAndDelivery,
  type DeliveryPayload,
} from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';
import { dispatchOrderNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { ref } = await params;
  const data = await getOrderWithMessages(ref);
  if (!data.order) {
    return finalizeAdminResponse(request, auth, { success: false, message: 'Sipariş bulunamadı.' }, 404);
  }

  return finalizeAdminResponse(request, auth, {
    success: true,
    order: data.order,
    messages: data.messages,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
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

  const { ref } = await params;
  const current = await getOrderWithMessages(ref);
  if (!current.order) {
    return finalizeAdminResponse(request, auth, { success: false, message: 'Sipariş bulunamadı.' }, 404);
  }

  const parsed = await parseJsonBodySafe(request, 16384);
  if (!parsed.ok) return parsed.response;

  const validated = AdminOrderActionSchema.safeParse(parsed.data);
  if (!validated.success) {
    return finalizeAdminResponse(
      request,
      auth,
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz işlem.' },
      400
    );
  }

  const input = validated.data;

  if (input.mode === 'reply') {
    const cleanBody = sanitizePlainText(input.body, 2000);
    if (!cleanBody) {
      return finalizeAdminResponse(request, auth, { success: false, message: 'Mesaj boş olamaz.' }, 400);
    }

    let updatedOrder = current.order;
    if (input.nextStatus && input.nextStatus !== current.order.status) {
      updatedOrder = await updateOrderStatusAndDelivery({
        order: current.order,
        status: input.nextStatus,
        paidAt:
          input.nextStatus === 'paid' || input.nextStatus === 'preparing' || input.nextStatus === 'delivered'
            ? current.order.paidAt || new Date().toISOString()
            : current.order.paidAt,
        deliveredAt:
          input.nextStatus === 'delivered'
            ? current.order.deliveredAt || new Date().toISOString()
            : current.order.deliveredAt,
      });
    }

    const msg = await appendOrderMessage({
      order: updatedOrder,
      senderUserId: null,
      senderRole: 'admin',
      senderName: 'Restricted Studio Yetkilisi',
      senderAvatar: '/assets/newlogo.png',
      messageType: 'text',
      body: cleanBody,
    });

    await writeAuditLog({
      request,
      actorId: auth.actorId,
      actorType: 'admin',
      action: 'ADMIN_ORDER_REPLY',
      resourceType: 'order',
      resourceId: updatedOrder.referenceCode,
      metadata: { nextStatus: input.nextStatus || null },
    });

    if (input.nextStatus === 'delivered') {
      await dispatchOrderNotification({
        type: 'order_delivered',
        order: updatedOrder,
        instructions: cleanBody,
      });
    } else {
      await dispatchOrderNotification({
        type: 'admin_message',
        order: updatedOrder,
        messageBody: cleanBody,
      });
    }

    const fresh = await getOrderWithMessages(ref);
    return finalizeAdminResponse(request, auth, {
      success: true,
      order: fresh.order,
      messages: fresh.messages,
      message: msg,
    });
  }

  // Corporate Digital Delivery Bundle Mode
  const cleanUrl = sanitizePlainText(input.downloadUrl, 512);
  if (cleanUrl && !isSafeHttpsUrl(cleanUrl)) {
    return finalizeAdminResponse(
      request,
      auth,
      { success: false, message: 'Teslimat indirme bağlantısı geçerli ve güvenli bir https:// URL olmalıdır.' },
      400
    );
  }

  const cleanCode = sanitizePlainText(input.licenseCode, 240);
  const cleanInstructions = sanitizePlainText(input.instructions, 2500);
  const nowIso = new Date().toISOString();

  const deliveryPayload: DeliveryPayload = {
    licenseCode: cleanCode || undefined,
    downloadUrl: cleanUrl || undefined,
    instructions: cleanInstructions,
    deliveredAt: nowIso,
    deliveredBy: auth.actorId,
  };

  const deliveredOrder = await updateOrderStatusAndDelivery({
    order: current.order,
    status: 'delivered',
    paidAt: current.order.paidAt || nowIso,
    deliveredAt: nowIso,
    deliveryPayload,
  });

  const shopierFulfilled = await fulfillDeliveredOrderOnShopier(deliveredOrder);

  await appendOrderMessage({
    order: deliveredOrder,
    senderUserId: null,
    senderRole: 'admin',
    senderName: 'Restricted Studio Teslimat Yetkilisi',
    senderAvatar: '/assets/newlogo.png',
    messageType: 'delivery_bundle',
    body: cleanInstructions,
    attachmentMeta: deliveryPayload,
  });

  await writeAuditLog({
    request,
    actorId: auth.actorId,
    actorType: 'admin',
    action: 'ADMIN_ORDER_DELIVERED',
    resourceType: 'order',
    resourceId: deliveredOrder.referenceCode,
    afterState: { status: 'delivered', hasCode: Boolean(cleanCode), hasUrl: Boolean(cleanUrl), shopierFulfilled },
  });

  await dispatchOrderNotification({
    type: 'order_delivered',
    order: deliveredOrder,
    instructions: cleanInstructions,
    hasCode: Boolean(cleanCode),
    hasUrl: Boolean(cleanUrl),
  });

  const fresh = await getOrderWithMessages(ref);
  return finalizeAdminResponse(request, auth, {
    success: true,
    order: fresh.order,
    messages: fresh.messages,
    shopierFulfilled,
    message: `Sipariş (${deliveredOrder.referenceCode}) teslim edildi olarak işaretlendi.`,
  });
}
