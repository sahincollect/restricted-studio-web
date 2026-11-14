import { NextResponse } from 'next/server';
import { createClientSupabase, createAdminSupabase } from '@/lib/supabase';
import { checkBoundedRateLimit, getClientIp } from '@/lib/security-edge';
import { FEATURED_BASELINE_CLICKS } from '@/lib/catalog-featured';

const ITEM_ID_RE = /^RS-CAT-\d{4,6}$/;

const globalPopularity = globalThis as unknown as {
  __rsCatalogClicks?: Map<string, number>;
  __rsClickGuard?: Map<string, number>;
};

const memoryClicks = (globalPopularity.__rsCatalogClicks ||= new Map<string, number>());
const clickGuard = (globalPopularity.__rsClickGuard ||= new Map<string, number>());

function getMergedCounts(dbRows?: Array<{ item_id: string; clicks: number }> | null): {
  counts: Record<string, number>;
  persistent: boolean;
} {
  const counts: Record<string, number> = { ...FEATURED_BASELINE_CLICKS };
  let persistent = false;

  if (Array.isArray(dbRows)) {
    persistent = true;
    for (const row of dbRows) {
      if (row && typeof row.item_id === 'string' && typeof row.clicks === 'number') {
        const base = counts[row.item_id] || 0;
        counts[row.item_id] = base + Math.max(0, Number(row.clicks) || 0);
      }
    }
  } else {
    for (const [id, extra] of memoryClicks.entries()) {
      counts[id] = (counts[id] || 0) + extra;
    }
  }

  return { counts, persistent };
}

export async function GET() {
  try {
    const supabase = createClientSupabase();
    const { data, error } = await supabase
      .from('catalog_popularity')
      .select('item_id, clicks')
      .order('clicks', { ascending: false })
      .limit(250);

    if (!error && Array.isArray(data)) {
      const merged = getMergedCounts(data);
      return NextResponse.json(
        { success: true, ...merged },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }
  } catch {
    // Fallback cleanly to in-memory + baseline map
  }

  const fallback = getMergedCounts(null);
  return NextResponse.json(
    { success: true, ...fallback },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const ipRate = checkBoundedRateLimit('api_default', `catclick:${clientIp}`);
  if (!ipRate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Çok fazla istek.' },
      { status: 429 }
    );
  }

  let body: { itemId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Geçersiz gövde.' }, { status: 400 });
  }

  const itemId = typeof body?.itemId === 'string' ? body.itemId.trim().toUpperCase() : '';
  if (!ITEM_ID_RE.test(itemId)) {
    return NextResponse.json({ success: false, message: 'Geçersiz ürün kimliği.' }, { status: 400 });
  }

  // Deduplicate rapid repeated clicks on the same item from one IP within 10s
  const guardKey = `${clientIp}:${itemId}`;
  const now = Date.now();
  const prevAt = clickGuard.get(guardKey) || 0;
  if (now - prevAt < 10_000) {
    const current =
      (FEATURED_BASELINE_CLICKS[itemId] || 0) + (memoryClicks.get(itemId) || 0);
    return NextResponse.json({
      success: true,
      itemId,
      clicks: current,
      deduped: true,
      persistent: false,
    });
  }

  if (clickGuard.size > 5000) {
    for (const [k, t] of clickGuard.entries()) {
      if (now - t > 60_000) clickGuard.delete(k);
    }
  }
  clickGuard.set(guardKey, now);

  // Increment in-memory counter immediately
  const nextMem = (memoryClicks.get(itemId) || 0) + 1;
  memoryClicks.set(itemId, nextMem);

  // Attempt persistent Supabase RPC increment if configured and migrated
  let persistent = false;
  let dbClicks: number | null = null;
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase.rpc('increment_catalog_click', {
        p_item_id: itemId,
      });
      if (!error && typeof data === 'number') {
        persistent = true;
        dbClicks = data;
      }
    }
  } catch {
    // Graceful fallback if table hasn't been created in Supabase yet
  }

  const totalClicks =
    (FEATURED_BASELINE_CLICKS[itemId] || 0) + (dbClicks !== null ? dbClicks : nextMem);

  return NextResponse.json({
    success: true,
    itemId,
    clicks: totalClicks,
    persistent,
  });
}
