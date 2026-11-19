import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { verifyAdminAuth } from '@/lib/admin-auth';
import {
  DELIVERY_SLA_NOTICE_TR,
  cleanupExpiredPendingShopierOrders,
  getOrderWithMessages,
  isPendingShopierOrderExpired,
} from '@/lib/orders-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const guard = guardApiRequest(request, 'order_chat');
  if (!guard.ok) return guard.response;

  const { ref } = await params;
  const session = await resolveCustomerSession(request);
  const adminAuth = session.authenticated ? null : await verifyAdminAuth(request);

  if (!session.authenticated && !adminAuth?.authorized) {
    const res = NextResponse.json(
      { success: false, message: 'Oturum doğrulaması gereklidir.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const data = await getOrderWithMessages(ref);
  if (!data.order) {
    return NextResponse.json(
      { success: false, message: 'Sipariş bulunamadı.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const isOwner = Boolean(session.authenticated && session.user && data.order.userId === session.user.id);
  const isAdmin = Boolean(adminAuth?.authorized) || Boolean(session.authenticated && (await verifyAdminAuth(request)).authorized);

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, message: 'Bu siparişe erişim yetkiniz bulunmamaktadır.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let resolvedData = data;
  if (isPendingShopierOrderExpired(data.order)) {
    const cleanRes = await cleanupExpiredPendingShopierOrders({
      force: true,
      candidateOrders: [data.order],
      request,
    });
    if (cleanRes.cancelledRefs.length > 0 || cleanRes.promotedRefs.length > 0) {
      resolvedData = await getOrderWithMessages(ref);
    }
  }

  const res = NextResponse.json(
    {
      success: true,
      order: resolvedData.order || data.order,
      messages: resolvedData.messages,
      slaNotice: DELIVERY_SLA_NOTICE_TR,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
