import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import {
  clearCustomerSessionCookies,
  resolveCustomerSession,
  revokeAllCustomerSessions,
  revokeCurrentCustomerRefreshFamily,
} from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'api_default', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  let scope: 'current' | 'all' = 'current';
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    const parsed = await parseJsonBodySafe(request, 1024);
    if (parsed.ok && parsed.data && typeof parsed.data === 'object') {
      const requestedScope = (parsed.data as { scope?: unknown }).scope;
      if (requestedScope === 'all') {
        scope = 'all';
      }
    }
  }

  let userId: string | null = null;

  if (scope === 'all') {
    const session = await resolveCustomerSession(request);
    userId = session.authenticated && session.user ? session.user.id : null;
    if (!userId) {
      userId = await revokeCurrentCustomerRefreshFamily(request);
    }
    if (userId) {
      await revokeAllCustomerSessions(userId);
      await writeAuditLog({
        request,
        actorId: userId,
        actorType: 'customer',
        action: 'CUSTOMER_LOGOUT_ALL_SESSIONS',
      });
    }
  } else {
    userId = await revokeCurrentCustomerRefreshFamily(request);
    if (userId) {
      await writeAuditLog({
        request,
        actorId: userId,
        actorType: 'customer',
        action: 'CUSTOMER_LOGOUT',
      });
    }
  }

  const res = NextResponse.json(
    { success: true, scope },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  clearCustomerSessionCookies(request, res);
  return res;
}
