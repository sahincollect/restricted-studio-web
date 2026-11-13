import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import {
  clearCustomerSessionCookies,
  revokeCurrentCustomerRefreshFamily,
} from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'api_default', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const userId = await revokeCurrentCustomerRefreshFamily(request);
  if (userId) {
    await writeAuditLog({
      request,
      actorId: userId,
      actorType: 'customer',
      action: 'CUSTOMER_LOGOUT',
    });
  }

  const res = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  clearCustomerSessionCookies(request, res);
  return res;
}
