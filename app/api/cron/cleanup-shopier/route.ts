import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { cleanupExpiredPendingShopierOrders } from '@/lib/orders-store';

export const dynamic = 'force-dynamic';

function isValidCronBearer(authHeader: string | null): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected || !authHeader) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const provided = match[1].trim();
  if (!provided) return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

async function handleCleanup(request: Request) {
  const guard = guardApiRequest(request, 'api_default', { checkSameOrigin: false });
  if (!guard.ok) return guard.response;

  const cronConfigured = Boolean(process.env.CRON_SECRET?.trim());
  const adminKeyConfigured = Boolean(process.env.ADMIN_SECRET_KEY?.trim());
  if (!cronConfigured && !adminKeyConfigured) {
    return NextResponse.json(
      {
        success: false,
        message: 'CRON_SECRET veya ADMIN_SECRET_KEY tanımlı değil; otomatik temizlik uç noktası kilitli.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const authorized =
    isValidCronBearer(request.headers.get('authorization')) ||
    verifyAdminSecret(request.headers.get('x-admin-secret'));

  if (!authorized) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz temizlik isteği.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const result = await cleanupExpiredPendingShopierOrders({
    force: true,
    request,
  });

  return NextResponse.json(
    {
      success: true,
      ...result,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}
