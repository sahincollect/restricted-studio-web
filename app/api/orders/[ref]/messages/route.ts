import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { OrderMessageSchema, sanitizePlainText } from '@/lib/validation';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getUserProfile } from '@/lib/account-store';
import { appendOrderMessage, getOrderWithMessages } from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
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

  const { ref } = await params;
  const found = await getOrderWithMessages(ref);
  if (!found.order) {
    return NextResponse.json(
      { success: false, message: 'Sipariş bulunamadı.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (found.order.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, message: 'Bu teslimat odasına mesaj gönderme yetkiniz yok.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  const validated = OrderMessageSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { success: false, message: validated.error.issues[0]?.message || 'Geçersiz mesaj.' },
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
  const msg = await appendOrderMessage({
    order: found.order,
    senderUserId: session.user.id,
    senderRole: 'customer',
    senderName: profile.displayName || session.user.name || 'Müşteri',
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

  const res = NextResponse.json(
    { success: true, message: msg },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
