import { NextResponse } from 'next/server';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { finalizeAdminResponse, verifyAdminAuth } from '@/lib/admin-auth';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { isShopierConfigured } from '@/lib/shopier';
import {
  cleanupExpiredPendingShopierOrders,
  listAllOrdersAdmin,
  reconcilePendingOrdersWithShopier,
} from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  await cleanupExpiredPendingShopierOrders({ request }).catch(() => undefined);
  const { orders, tableReady } = await listAllOrdersAdmin(120);
  return finalizeAdminResponse(request, auth, {
    success: true,
    shopierConfigured: isShopierConfigured(),
    tableReady,
    orders,
  });
}

export async function POST(request: Request) {
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

  const parsed = await parseJsonBodySafe(request, 4096);
  if (!parsed.ok) return parsed.response;

  if (parsed.data?.action !== 'sync_shopier') {
    return finalizeAdminResponse(request, auth, { success: false, message: 'Geçersiz işlem.' }, 400);
  }

  const result = await reconcilePendingOrdersWithShopier(undefined, request);
  const { orders, tableReady } = await listAllOrdersAdmin(120);

  await writeAuditLog({
    request,
    actorId: auth.actorId,
    actorType: 'admin',
    action: 'ADMIN_SHOPIER_ORDERS_SYNCED',
    metadata: {
      checked: result.checked,
      matchedCount: result.matchedRefs.length,
      expiredCancelledCount: result.expiredCancelledRefs.length,
    },
  });

  const parts: string[] = [];
  if (result.matchedRefs.length > 0) {
    parts.push(`${result.matchedRefs.length} siparişin Shopier ödemesi doğrulandı (${result.matchedRefs.join(', ')})`);
  }
  if (result.expiredCancelledRefs.length > 0) {
    parts.push(`${result.expiredCancelledRefs.length} süresi dolmuş (15 dk) Shopier ilanı otomatik kaldırıldı`);
  }

  return finalizeAdminResponse(request, auth, {
    success: true,
    message:
      parts.length > 0
        ? `${parts.join(' · ')}.`
        : `${result.checked} bekleyen sipariş kontrol edildi; yeni ödenmiş veya süresi dolmuş ilan bulunamadı.`,
    matchedRefs: result.matchedRefs,
    expiredCancelledRefs: result.expiredCancelledRefs,
    shopierConfigured: isShopierConfigured(),
    tableReady,
    orders,
  });
}
