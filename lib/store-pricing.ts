import fs from 'node:fs/promises';
import path from 'node:path';
import { createAdminSupabase, createClientSupabase } from '@/lib/supabase';
import type { ItemsatisProductItem } from '@/lib/itemsatis-store';
import {
  mergeStoreProducts,
  sanitizePriceValue,
  type MergedStoreProduct,
  type StorePriceOverride,
} from '@/lib/store-pricing-pure';

export { mergeStoreProducts, sanitizePriceValue, type MergedStoreProduct, type StorePriceOverride };

export type PriceStorageBackend = 'supabase' | 'local-file' | 'memory-only';

export interface PriceStoreStatus {
  overrides: Record<string, StorePriceOverride>;
  backend: PriceStorageBackend;
  persistent: boolean;
  dbConfigured: boolean;
  tableReady: boolean;
}

const LOCAL_OVERRIDE_FILE = path.join(process.cwd(), '.data', 'store-price-overrides.json');

const globalPriceState = globalThis as unknown as {
  __rsStorePriceOverrides?: Record<string, StorePriceOverride>;
};

function normalizeOverrideMap(
  raw: Record<string, Partial<StorePriceOverride>>
): Record<string, StorePriceOverride> {
  const out: Record<string, StorePriceOverride> = {};
  for (const [key, entry] of Object.entries(raw || {})) {
    const productId = String(entry?.productId || key).trim();
    if (!productId) continue;
    out[productId] = {
      productId,
      customPrice: sanitizePriceValue(entry?.customPrice),
      comparePrice: sanitizePriceValue(entry?.comparePrice),
      hidden: Boolean(entry?.hidden),
      updatedAt: typeof entry?.updatedAt === 'string' ? entry.updatedAt : undefined,
      updatedBy: typeof entry?.updatedBy === 'string' ? entry.updatedBy : undefined,
    };
  }
  return out;
}

async function readLocalOverrideFile(): Promise<Record<string, StorePriceOverride> | null> {
  if (process.env.VERCEL === '1') return null;
  try {
    const raw = await fs.readFile(LOCAL_OVERRIDE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, Partial<StorePriceOverride>>;
    return normalizeOverrideMap(parsed);
  } catch {
    return null;
  }
}

async function writeLocalOverrideFile(map: Record<string, StorePriceOverride>): Promise<boolean> {
  if (process.env.VERCEL === '1') return false;
  try {
    await fs.mkdir(path.dirname(LOCAL_OVERRIDE_FILE), { recursive: true });
    await fs.writeFile(LOCAL_OVERRIDE_FILE, JSON.stringify(map, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

interface DbPriceRow {
  product_id: string;
  custom_price: number | string | null;
  compare_price: number | string | null;
  hidden: boolean | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

function mapDbRowsToOverrides(rows: DbPriceRow[]): Record<string, StorePriceOverride> {
  const out: Record<string, StorePriceOverride> = {};
  for (const row of rows) {
    if (!row?.product_id) continue;
    out[row.product_id] = {
      productId: row.product_id,
      customPrice: sanitizePriceValue(row.custom_price),
      comparePrice: sanitizePriceValue(row.compare_price),
      hidden: Boolean(row.hidden),
      updatedAt: row.updated_at || undefined,
      updatedBy: row.updated_by || null,
    };
  }
  return out;
}

/**
 * Loads store price overrides from Supabase (if configured & migrated),
 * local `.data` file (non-serverless dev), or warm in-memory store.
 */
export async function readStorePriceOverrides(): Promise<PriceStoreStatus> {
  const dbConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Prefer Supabase Admin / Public table if schema exists
  try {
    const client = dbConfigured ? createAdminSupabase() : createClientSupabase();
    const { data, error } = await client
      .from('store_product_prices')
      .select('product_id, custom_price, compare_price, hidden, updated_at, updated_by')
      .limit(1000);

    if (!error && Array.isArray(data)) {
      const map = mapDbRowsToOverrides(data as DbPriceRow[]);
      globalPriceState.__rsStorePriceOverrides = map;
      return {
        overrides: map,
        backend: dbConfigured ? 'supabase' : 'memory-only',
        persistent: dbConfigured,
        dbConfigured,
        tableReady: true,
      };
    }
  } catch {
    // Fall through cleanly when DB table is not migrated yet
  }

  // 2. Non-serverless local disk persistence
  const localFileMap = await readLocalOverrideFile();
  if (localFileMap) {
    globalPriceState.__rsStorePriceOverrides = localFileMap;
    return {
      overrides: localFileMap,
      backend: 'local-file',
      persistent: true,
      dbConfigured,
      tableReady: false,
    };
  }

  // 3. Ephemeral memory fallback
  const mem = globalPriceState.__rsStorePriceOverrides || {};
  return {
    overrides: mem,
    backend: 'memory-only',
    persistent: false,
    dbConfigured,
    tableReady: false,
  };
}

/**
 * Persists one or more price override updates across Supabase (preferred),
 * local filesystem (dev), and runtime memory cache.
 */
export async function saveStorePriceOverrides(
  updates: StorePriceOverride[],
  actorId: string
): Promise<{
  ok: boolean;
  persistent: boolean;
  backend: PriceStorageBackend;
  overrides: Record<string, StorePriceOverride>;
  message: string;
}> {
  const currentState = await readStorePriceOverrides();
  const nextMap: Record<string, StorePriceOverride> = { ...currentState.overrides };
  const nowIso = new Date().toISOString();

  const normalizedUpdates: StorePriceOverride[] = [];
  for (const item of updates) {
    const productId = String(item.productId || '').trim();
    if (!productId) continue;

    const customPrice = sanitizePriceValue(item.customPrice);
    const comparePrice = sanitizePriceValue(item.comparePrice);
    const hidden = Boolean(item.hidden);

    const record: StorePriceOverride = {
      productId,
      customPrice,
      comparePrice,
      hidden,
      updatedAt: nowIso,
      updatedBy: actorId,
    };

    if (customPrice === null && comparePrice === null && !hidden) {
      delete nextMap[productId];
    } else {
      nextMap[productId] = record;
    }
    normalizedUpdates.push(record);
  }

  globalPriceState.__rsStorePriceOverrides = nextMap;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && normalizedUpdates.length > 0) {
    try {
      const adminSupabase = createAdminSupabase();
      const rows = normalizedUpdates.map((u) => ({
        product_id: u.productId,
        custom_price: u.customPrice,
        compare_price: u.comparePrice,
        hidden: u.hidden,
        updated_by: actorId,
        updated_at: nowIso,
      }));

      const { error } = await adminSupabase
        .from('store_product_prices')
        .upsert(rows, { onConflict: 'product_id' });

      if (!error) {
        return {
          ok: true,
          persistent: true,
          backend: 'supabase',
          overrides: nextMap,
          message: 'Fiyat değişiklikleri Supabase veritabanına kalıcı olarak kaydedildi.',
        };
      }
    } catch {
      // Fall through to local/memory warning
    }
  }

  const localSaved = await writeLocalOverrideFile(nextMap);
  if (localSaved) {
    return {
      ok: true,
      persistent: true,
      backend: 'local-file',
      overrides: nextMap,
      message: 'Fiyatlar yerel geliştirme dosyasına (.data) kaydedildi.',
    };
  }

  return {
    ok: true,
    persistent: false,
    backend: 'memory-only',
    overrides: nextMap,
    message:
      'Fiyatlar geçici belleğe uygulandı; kalıcı kayıt için Supabase şeması (store_product_prices) ve SUPABASE_SERVICE_ROLE_KEY gereklidir.',
  };
}
