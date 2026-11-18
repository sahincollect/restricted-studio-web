import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { listOrdersForUser, reconcilePendingOrdersWithShopier } from '@/lib/orders-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, message: 'Oturum bulunamadı.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const url = new URL(request.url);
  let orders = await listOrdersForUser(session.user.id);

  if (url.searchParams.get('sync') === '1' && orders.some((o) => o.status === 'pending_payment')) {
    const reconciled = await reconcilePendingOrdersWithShopier(orders);
    if (reconciled.matchedRefs.length > 0) {
      orders = await listOrdersForUser(session.user.id);
    }
  }

  const res = NextResponse.json(
    { success: true, orders },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}
