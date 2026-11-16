import { NextResponse } from 'next/server';
import { fetchItemsatisListings } from '@/lib/itemsatis-store';
import { mergeStoreProducts, readStorePriceOverrides } from '@/lib/store-pricing';
import { checkBoundedRateLimit, getClientIp } from '@/lib/security-edge';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkBoundedRateLimit('api_default', `store:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Çok fazla istek.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const [feed, pricing] = await Promise.all([
      fetchItemsatisListings(),
      readStorePriceOverrides(),
    ]);

    const visibleItems = mergeStoreProducts(feed.items, pricing.overrides).filter(
      (item) => !item.hidden
    );

    return NextResponse.json(
      {
        success: true,
        syncedAt: feed.syncedAt,
        source: feed.source,
        count: visibleItems.length,
        items: visibleItems,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Mağaza ürünleri şu anda yüklenemiyor.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
