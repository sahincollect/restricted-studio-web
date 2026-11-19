import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getOrderWithMessages, reconcilePendingOrdersWithShopier } from '@/lib/orders-store';

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
      { success: false, message: 'Oturum doğrulaması gereklidir.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const { ref } = await params;
  const initial = await getOrderWithMessages(ref);
  if (!initial.order) {
    return NextResponse.json(
      { success: false, message: 'Sipariş bulunamadı.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (initial.order.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let matched = false;
  let expired = false;
  if (initial.order.status === 'pending_payment') {
    const resSync = await reconcilePendingOrdersWithShopier([initial.order], request);
    matched = resSync.matchedRefs.includes(initial.order.referenceCode);
    expired = resSync.expiredCancelledRefs.includes(initial.order.referenceCode);
  }

  const fresh = await getOrderWithMessages(ref);
  const expiredFinal = expired || fresh.order?.status === 'cancelled';
  const res = NextResponse.json(
    {
      success: true,
      matched,
      expired: expiredFinal,
      order: fresh.order,
      messages: fresh.messages,
      message: matched
        ? 'Shopier ödemeniz doğrulandı! Siparişiniz teslimat sırasına alındı (ort. 2 saat, yoğunlukta 6–24 saat).'
        : expiredFinal
        ? '15 dakikalık ödeme süresi dolduğu için referanslı Shopier ilanı otomatik olarak kaldırıldı ve sipariş iptal edildi.'
        : fresh.order?.status === 'pending_payment'
        ? 'Henüz tamamlanmış Shopier ödemesi görünmüyor. Ödemeyi yeni tamamladıysanız birkaç saniye sonra tekrar kontrol edin.'
        : 'Sipariş durumu güncel.',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
