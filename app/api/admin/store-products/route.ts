import { NextResponse } from 'next/server';
import { fetchItemsatisListings } from '@/lib/itemsatis-store';
import {
  mergeStoreProducts,
  readStorePriceOverrides,
  saveStorePriceOverrides,
  type StorePriceOverride,
} from '@/lib/store-pricing';
import { fetchUniqueLisansSummary } from '@/lib/uniquelisans';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { finalizeAdminResponse, verifyAdminAuth } from '@/lib/admin-auth';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { StoreAdminActionSchema } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const [feed, pricing, supplier] = await Promise.all([
      fetchItemsatisListings(),
      readStorePriceOverrides(),
      fetchUniqueLisansSummary(),
    ]);

    const items = mergeStoreProducts(feed.items, pricing.overrides);

    return finalizeAdminResponse(request, auth, {
      success: true,
      syncedAt: feed.syncedAt,
      feedSource: feed.source,
      storage: {
        backend: pricing.backend,
        persistent: pricing.persistent,
        dbConfigured: pricing.dbConfigured,
        tableReady: pricing.tableReady,
      },
      supplier,
      items,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Mağaza ürün verileri yüklenemedi.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(request: Request) {
  const hasSecretHeader = verifyAdminSecret(request.headers.get('x-admin-secret'));
  const guard = guardApiRequest(request, 'admin_api', {
    checkSameOrigin: !hasSecretHeader,
  });
  if (!guard.ok) return guard.response;

  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const parsed = await parseJsonBodySafe(request, 16384);
    if (!parsed.ok) return parsed.response;

    const validated = StoreAdminActionSchema.safeParse(parsed.data);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: validated.error.issues[0]?.message || 'Geçersiz fiyat güncelleme isteği.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const input = validated.data;

    if (input.action === 'refresh_itemsatis') {
      const [feed, pricing] = await Promise.all([
        fetchItemsatisListings({ forceRefresh: true }),
        readStorePriceOverrides(),
      ]);

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_STORE_ITEMS_REFRESHED',
        resourceType: 'store_products',
        metadata: { count: feed.items.length, source: feed.source },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: `${feed.items.length} ürün ${feed.source === 'live' ? 'İtemsatış canlı profilinden' : 'yerel önbellekten'} yenilendi.`,
        syncedAt: feed.syncedAt,
        feedSource: feed.source,
        items: mergeStoreProducts(feed.items, pricing.overrides),
      });
    }

    const [feed, currentPricing] = await Promise.all([
      fetchItemsatisListings(),
      readStorePriceOverrides(),
    ]);

    if (input.action === 'upsert_price') {
      const target = feed.items.find((i) => i.id === input.productId);
      if (!target) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Güncellenecek ürün bulunamadı.' },
          404
        );
      }

      const prev = currentPricing.overrides[input.productId];
      const nextOverride: StorePriceOverride = {
        productId: input.productId,
        customPrice: input.customPrice,
        comparePrice:
          input.comparePrice !== undefined ? input.comparePrice : prev?.comparePrice ?? null,
        hidden: input.hidden !== undefined ? input.hidden : prev?.hidden ?? false,
      };

      const saved = await saveStorePriceOverrides([nextOverride], auth.actorId);
      const mergedItems = mergeStoreProducts(feed.items, saved.overrides);

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_STORE_PRICE_UPDATED',
        resourceType: 'store_product_prices',
        resourceId: input.productId,
        beforeState: prev || { customPrice: null, comparePrice: null, hidden: false },
        afterState: nextOverride,
        metadata: { title: target.title, persistent: saved.persistent, backend: saved.backend },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: saved.message,
        storage: {
          backend: saved.backend,
          persistent: saved.persistent,
        },
        items: mergedItems,
      });
    }

    if (input.action === 'bulk_adjust') {
      const targets =
        input.group === 'all'
          ? feed.items
          : feed.items.filter((item) => item.group === input.group);

      if (targets.length === 0) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Seçilen grupta ürün bulunamadı.' },
          400
        );
      }

      const numericVal = typeof input.value === 'number' ? input.value : 0;
      const updates: StorePriceOverride[] = targets.map((item) => {
        const prev = currentPricing.overrides[item.id];
        if (input.mode === 'reset') {
          return {
            productId: item.id,
            customPrice: null,
            comparePrice: null,
            hidden: prev?.hidden ?? false,
          };
        }

        const basePrice = prev?.customPrice ?? item.sourcePrice;
        let computed = basePrice;
        if (input.mode === 'percent') {
          computed = basePrice * (1 + numericVal / 100);
        } else if (input.mode === 'fixed_delta') {
          computed = basePrice + numericVal;
        } else if (input.mode === 'set_fixed') {
          computed = numericVal;
        }

        const clamped = Math.max(0, Math.min(1_000_000, Math.round(computed * 100) / 100));
        return {
          productId: item.id,
          customPrice: clamped,
          comparePrice: prev?.comparePrice ?? null,
          hidden: prev?.hidden ?? false,
        };
      });

      const saved = await saveStorePriceOverrides(updates, auth.actorId);
      const mergedItems = mergeStoreProducts(feed.items, saved.overrides);

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_STORE_BULK_PRICE_ADJUST',
        resourceType: 'store_product_prices',
        metadata: {
          group: input.group,
          mode: input.mode,
          value: input.value ?? null,
          affectedCount: updates.length,
          persistent: saved.persistent,
          backend: saved.backend,
        },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: `${updates.length} ürün için toplu fiyat işlemi uygulandı. ${saved.message}`,
        storage: {
          backend: saved.backend,
          persistent: saved.persistent,
        },
        items: mergedItems,
      });
    }

    return finalizeAdminResponse(request, auth, { success: false, message: 'Geçersiz işlem.' }, 400);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
