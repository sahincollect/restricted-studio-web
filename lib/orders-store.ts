import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createAdminSupabase } from '@/lib/supabase';
import {
  deleteDynamicShopierListingResult,
  fetchShopierOrdersSafe,
  isShopierConfigured,
  markShopierOrderFulfilled,
  type ShopierOrderRecord,
} from '@/lib/shopier';
import { writeAuditLog } from '@/lib/audit-log';
import { dispatchOrderNotification } from '@/lib/notifications';
import {
  SHOPIER_LISTING_TTL_MINUTES,
  SHOPIER_LISTING_TTL_MS,
  computeOrderExpiresAtIso,
  isPendingShopierOrderExpired,
} from '@/lib/order-timer';
import {
  DELIVERY_SLA_NOTICE_TR,
  generateOrderReferenceCode,
  matchShopierOrderToInternal,
  type DeliveryPayload,
  type OrderLineItem,
  type OrderMessageRecord,
  type OrderRecord,
  type OrderStatus,
} from '@/lib/orders-pure';

export {
  SHOPIER_LISTING_TTL_MINUTES,
  SHOPIER_LISTING_TTL_MS,
  DELIVERY_SLA_NOTICE_TR,
  computeOrderExpiresAtIso,
  generateOrderReferenceCode,
  isPendingShopierOrderExpired,
  matchShopierOrderToInternal,
  type DeliveryPayload,
  type OrderLineItem,
  type OrderMessageRecord,
  type OrderRecord,
  type OrderStatus,
};

const LOCAL_ORDERS_FILE = path.join(process.cwd(), '.data', 'orders-store.json');

interface LocalOrdersDiskState {
  orders: OrderRecord[];
  messages: OrderMessageRecord[];
}

const globalOrders = globalThis as unknown as {
  __rsOrdersDisk?: LocalOrdersDiskState;
};

async function readLocalOrdersState(): Promise<LocalOrdersDiskState> {
  if (globalOrders.__rsOrdersDisk) return globalOrders.__rsOrdersDisk;
  if (process.env.VERCEL !== '1') {
    try {
      const raw = await fs.readFile(LOCAL_ORDERS_FILE, 'utf8');
      const parsed = JSON.parse(raw) as LocalOrdersDiskState;
      if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.messages)) {
        globalOrders.__rsOrdersDisk = parsed;
        return parsed;
      }
    } catch {
      // missing file
    }
  }
  globalOrders.__rsOrdersDisk = { orders: [], messages: [] };
  return globalOrders.__rsOrdersDisk;
}

async function writeLocalOrdersState(state: LocalOrdersDiskState): Promise<void> {
  globalOrders.__rsOrdersDisk = state;
  if (process.env.VERCEL === '1') return;
  try {
    await fs.mkdir(path.dirname(LOCAL_ORDERS_FILE), { recursive: true });
    await fs.writeFile(LOCAL_ORDERS_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // ignore fs error
  }
}

function mapDbOrder(row: Record<string, any>): OrderRecord {
  const createdAt = String(row.created_at);
  return {
    id: String(row.id),
    referenceCode: String(row.reference_code),
    userId: String(row.user_id),
    buyerEmail: String(row.buyer_email || ''),
    buyerName: String(row.buyer_name || ''),
    source: (row.source as OrderRecord['source']) || 'catalog',
    paymentProvider: (row.payment_provider as OrderRecord['paymentProvider']) || 'shopier',
    title: String(row.title),
    items: Array.isArray(row.items) ? row.items : [],
    currency: 'TRY',
    totalAmount: Number(row.total_amount || 0),
    status: (row.status as OrderStatus) || 'pending_payment',
    shopierProductId: row.shopier_product_id ? String(row.shopier_product_id) : null,
    shopierCheckoutUrl: row.shopier_checkout_url ? String(row.shopier_checkout_url) : null,
    shopierOrderId: row.shopier_order_id ? String(row.shopier_order_id) : null,
    deliverySlaNote: String(row.delivery_sla_note || DELIVERY_SLA_NOTICE_TR),
    deliveryPayload: (row.delivery_payload as DeliveryPayload | null) ?? null,
    paidAt: row.paid_at ? String(row.paid_at) : null,
    deliveredAt: row.delivered_at ? String(row.delivered_at) : null,
    expiresAt: computeOrderExpiresAtIso(createdAt),
    createdAt,
    updatedAt: String(row.updated_at || createdAt),
  };
}

function mapDbMessage(row: Record<string, any>): OrderMessageRecord {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    referenceCode: String(row.reference_code),
    senderUserId: row.sender_user_id ? String(row.sender_user_id) : null,
    senderRole: (row.sender_role as OrderMessageRecord['senderRole']) || 'system',
    senderName: String(row.sender_name || 'Sistem'),
    senderAvatar: row.sender_avatar ? String(row.sender_avatar) : null,
    messageType: (row.message_type as OrderMessageRecord['messageType']) || 'text',
    body: String(row.body || ''),
    attachmentMeta: (row.attachment_meta as DeliveryPayload | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export async function createOrderWithWelcomeMessage(params: {
  referenceCode: string;
  userId: string;
  buyerEmail: string;
  buyerName: string;
  source: 'catalog' | 'store' | 'service';
  paymentProvider: 'shopier' | 'itemsatis';
  title: string;
  items: OrderLineItem[];
  totalAmount: number;
  shopierProductId: string | null;
  shopierCheckoutUrl: string | null;
}): Promise<{ order: OrderRecord; persistent: boolean; backend: 'supabase' | 'local-file' | 'memory-only' }> {
  const nowIso = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const record: OrderRecord = {
    id: orderId,
    referenceCode: params.referenceCode,
    userId: params.userId,
    buyerEmail: params.buyerEmail,
    buyerName: params.buyerName,
    source: params.source,
    paymentProvider: params.paymentProvider,
    title: params.title,
    items: params.items,
    currency: 'TRY',
    totalAmount: params.totalAmount,
    status: 'pending_payment',
    shopierProductId: params.shopierProductId,
    shopierCheckoutUrl: params.shopierCheckoutUrl,
    shopierOrderId: null,
    deliverySlaNote: DELIVERY_SLA_NOTICE_TR,
    deliveryPayload: null,
    paidAt: null,
    deliveredAt: null,
    expiresAt: computeOrderExpiresAtIso(nowIso),
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const welcomeMsg: OrderMessageRecord = {
    id: crypto.randomUUID(),
    orderId,
    referenceCode: params.referenceCode,
    senderUserId: null,
    senderRole: 'system',
    senderName: 'Restricted Studio Teslimat Masası',
    senderAvatar: '/assets/newlogo.png',
    messageType: 'status_update',
    body: `Sipariş kaydınız (${params.referenceCode}) oluşturuldu. Referanslı Shopier ödeme ilanı ${SHOPIER_LISTING_TTL_MINUTES} dakika boyunca aktiftir; bu süre içinde satın alım yapılmazsa ilan otomatik kaldırılır. Ödeme tamamlandığında teslimat süreci başlatılacaktır. ${DELIVERY_SLA_NOTICE_TR}`,
    attachmentMeta: null,
    createdAt: nowIso,
  };

  let persistedDb = false;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data: insertedOrder, error: orderErr } = await adminSupabase
        .from('orders')
        .insert({
          id: record.id,
          reference_code: record.referenceCode,
          user_id: record.userId,
          buyer_email: record.buyerEmail,
          buyer_name: record.buyerName,
          source: record.source,
          payment_provider: record.paymentProvider,
          title: record.title,
          items: record.items,
          currency: record.currency,
          total_amount: record.totalAmount,
          status: record.status,
          shopier_product_id: record.shopierProductId,
          shopier_checkout_url: record.shopierCheckoutUrl,
          delivery_sla_note: record.deliverySlaNote,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select('*')
        .single();

      if (!orderErr && insertedOrder) {
        persistedDb = true;
        await adminSupabase.from('order_messages').insert({
          id: welcomeMsg.id,
          order_id: record.id,
          reference_code: record.referenceCode,
          sender_user_id: null,
          sender_role: welcomeMsg.senderRole,
          sender_name: welcomeMsg.senderName,
          sender_avatar: welcomeMsg.senderAvatar,
          message_type: welcomeMsg.messageType,
          body: welcomeMsg.body,
          created_at: nowIso,
        });
      }
    } catch {
      // Fallback gracefully when orders table is not migrated yet
    }
  }

  const localState = await readLocalOrdersState();
  localState.orders.unshift(record);
  localState.messages.push(welcomeMsg);
  await writeLocalOrdersState(localState);

  if (persistedDb) {
    return { order: record, persistent: true, backend: 'supabase' };
  }
  return {
    order: record,
    persistent: process.env.VERCEL !== '1',
    backend: process.env.VERCEL === '1' ? 'memory-only' : 'local-file',
  };
}

export async function listOrdersForUser(userId: string): Promise<OrderRecord[]> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && Array.isArray(data)) {
        return data.map(mapDbOrder);
      }
    } catch {
      // fall through
    }
  }
  const localState = await readLocalOrdersState();
  return localState.orders.filter((o) => o.userId === userId);
}

export async function listAllOrdersAdmin(limit = 100): Promise<{
  orders: OrderRecord[];
  tableReady: boolean;
}> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && Array.isArray(data)) {
        return { orders: data.map(mapDbOrder), tableReady: true };
      }
    } catch {
      // fall through
    }
  }
  const localState = await readLocalOrdersState();
  return { orders: localState.orders.slice(0, limit), tableReady: false };
}

export async function getOrderWithMessages(referenceCode: string): Promise<{
  order: OrderRecord | null;
  messages: OrderMessageRecord[];
}> {
  const cleanRef = referenceCode.trim().toUpperCase();
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data: orderRow, error } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('reference_code', cleanRef)
        .maybeSingle();

      if (!error && orderRow) {
        const { data: msgRows } = await adminSupabase
          .from('order_messages')
          .select('*')
          .eq('order_id', orderRow.id)
          .order('created_at', { ascending: true })
          .limit(300);

        return {
          order: mapDbOrder(orderRow),
          messages: Array.isArray(msgRows) ? msgRows.map(mapDbMessage) : [],
        };
      }
    } catch {
      // fall through
    }
  }

  const localState = await readLocalOrdersState();
  const order = localState.orders.find((o) => o.referenceCode === cleanRef) || null;
  const messages = order
    ? localState.messages.filter((m) => m.referenceCode === cleanRef)
    : [];
  return { order, messages };
}

export async function appendOrderMessage(params: {
  order: OrderRecord;
  senderUserId: string | null;
  senderRole: 'customer' | 'admin' | 'system';
  senderName: string;
  senderAvatar?: string | null;
  messageType?: 'text' | 'status_update' | 'delivery_bundle';
  body: string;
  attachmentMeta?: DeliveryPayload | null;
}): Promise<OrderMessageRecord> {
  const nowIso = new Date().toISOString();
  const msg: OrderMessageRecord = {
    id: crypto.randomUUID(),
    orderId: params.order.id,
    referenceCode: params.order.referenceCode,
    senderUserId: params.senderUserId,
    senderRole: params.senderRole,
    senderName: params.senderName,
    senderAvatar: params.senderAvatar ?? null,
    messageType: params.messageType || 'text',
    body: params.body,
    attachmentMeta: params.attachmentMeta ?? null,
    createdAt: nowIso,
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase.from('order_messages').insert({
        id: msg.id,
        order_id: msg.orderId,
        reference_code: msg.referenceCode,
        sender_user_id: msg.senderUserId,
        sender_role: msg.senderRole,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        message_type: msg.messageType,
        body: msg.body,
        attachment_meta: msg.attachmentMeta,
        created_at: nowIso,
      });
      await adminSupabase
        .from('orders')
        .update({ updated_at: nowIso })
        .eq('id', params.order.id);
    } catch {
      // fallback to local memory/disk
    }
  }

  const localState = await readLocalOrdersState();
  localState.messages.push(msg);
  const idx = localState.orders.findIndex((o) => o.id === params.order.id);
  if (idx !== -1) {
    localState.orders[idx] = { ...localState.orders[idx], updatedAt: nowIso };
  }
  await writeLocalOrdersState(localState);

  return msg;
}

export async function updateOrderStatusAndDelivery(params: {
  order: OrderRecord;
  status: OrderStatus;
  shopierOrderId?: string | null;
  paidAt?: string | null;
  deliveredAt?: string | null;
  deliveryPayload?: DeliveryPayload | null;
}): Promise<OrderRecord> {
  const nowIso = new Date().toISOString();
  const updated: OrderRecord = {
    ...params.order,
    status: params.status,
    shopierOrderId: params.shopierOrderId !== undefined ? params.shopierOrderId : params.order.shopierOrderId,
    paidAt: params.paidAt !== undefined ? params.paidAt : params.order.paidAt,
    deliveredAt: params.deliveredAt !== undefined ? params.deliveredAt : params.order.deliveredAt,
    deliveryPayload:
      params.deliveryPayload !== undefined ? params.deliveryPayload : params.order.deliveryPayload,
    updatedAt: nowIso,
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase
        .from('orders')
        .update({
          status: updated.status,
          shopier_order_id: updated.shopierOrderId,
          paid_at: updated.paidAt,
          delivered_at: updated.deliveredAt,
          delivery_payload: updated.deliveryPayload,
          updated_at: nowIso,
        })
        .eq('id', updated.id);
    } catch {
      // fall through
    }
  }

  const localState = await readLocalOrdersState();
  const idx = localState.orders.findIndex((o) => o.id === updated.id || o.referenceCode === updated.referenceCode);
  if (idx !== -1) {
    localState.orders[idx] = updated;
    await writeLocalOrdersState(localState);
  }

  return updated;
}

async function claimPendingOrderTransition(
  order: OrderRecord,
  nextStatus: OrderStatus,
  fields?: {
    shopierOrderId?: string | null;
    paidAt?: string | null;
    deliveredAt?: string | null;
  }
): Promise<OrderRecord | null> {
  const nowIso = new Date().toISOString();
  let dbHandled = false;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data: claimedRows, error: updateErr } = await adminSupabase
        .from('orders')
        .update({
          status: nextStatus,
          ...(fields?.shopierOrderId !== undefined ? { shopier_order_id: fields.shopierOrderId } : {}),
          ...(fields?.paidAt !== undefined ? { paid_at: fields.paidAt } : {}),
          ...(fields?.deliveredAt !== undefined ? { delivered_at: fields.deliveredAt } : {}),
          updated_at: nowIso,
        })
        .eq('id', order.id)
        .eq('status', 'pending_payment')
        .select('*');

      if (!updateErr && Array.isArray(claimedRows)) {
        if (claimedRows.length > 0) {
          const mapped = mapDbOrder(claimedRows[0]);
          const localState = await readLocalOrdersState();
          const lIdx = localState.orders.findIndex((o) => o.id === mapped.id);
          if (lIdx !== -1) {
            localState.orders[lIdx] = mapped;
            await writeLocalOrdersState(localState);
          }
          return mapped;
        }
        const { data: existingRow, error: selErr } = await adminSupabase
          .from('orders')
          .select('id')
          .eq('id', order.id)
          .maybeSingle();
        if (!selErr && existingRow) {
          dbHandled = true;
        }
      }
    } catch {
      // fall through to local store
    }
  }

  if (dbHandled) return null;

  const localState = await readLocalOrdersState();
  const idx = localState.orders.findIndex(
    (o) => (o.id === order.id || o.referenceCode === order.referenceCode) && o.status === 'pending_payment'
  );
  if (idx === -1) return null;

  const nextOrder: OrderRecord = {
    ...localState.orders[idx],
    status: nextStatus,
    shopierOrderId: fields?.shopierOrderId !== undefined ? fields.shopierOrderId : localState.orders[idx].shopierOrderId,
    paidAt: fields?.paidAt !== undefined ? fields.paidAt : localState.orders[idx].paidAt,
    deliveredAt: fields?.deliveredAt !== undefined ? fields.deliveredAt : localState.orders[idx].deliveredAt,
    updatedAt: nowIso,
  };
  localState.orders[idx] = nextOrder;
  await writeLocalOrdersState(localState);
  return nextOrder;
}

async function revertCancelledToPending(orderId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase
        .from('orders')
        .update({ status: 'pending_payment', updated_at: nowIso })
        .eq('id', orderId)
        .eq('status', 'cancelled');
    } catch {
      // ignore
    }
  }
  const localState = await readLocalOrdersState();
  const idx = localState.orders.findIndex((o) => o.id === orderId && o.status === 'cancelled');
  if (idx !== -1) {
    localState.orders[idx] = { ...localState.orders[idx], status: 'pending_payment', updatedAt: nowIso };
    await writeLocalOrdersState(localState);
  }
}

async function promoteMatchedShopierOrder(ord: OrderRecord, match: ShopierOrderRecord): Promise<boolean> {
  const paidIso = match.dateCreated ? new Date(match.dateCreated).toISOString() : new Date().toISOString();
  const nextStatus: OrderStatus = match.status === 'fulfilled' ? 'delivered' : 'preparing';
  const nextOrder = await claimPendingOrderTransition(ord, nextStatus, {
    shopierOrderId: String(match.id),
    paidAt: paidIso,
  });
  if (!nextOrder) return false;

  await appendOrderMessage({
    order: nextOrder,
    senderUserId: null,
    senderRole: 'system',
    senderName: 'Shopier Ödeme Doğrulama',
    senderAvatar: '/assets/newlogo.png',
    messageType: 'status_update',
    body: `Shopier ödemesi doğrulandı (Shopier Sipariş #${match.id}). Siparişiniz hazırlık sırasına alındı. ${DELIVERY_SLA_NOTICE_TR}`,
  });

  await dispatchOrderNotification({
    type: 'order_paid',
    order: nextOrder,
    shopierOrderId: String(match.id),
  });
  return true;
}

async function listExpiredPendingShopierCandidates(nowMs = Date.now()): Promise<OrderRecord[]> {
  const cutoffIso = new Date(nowMs - SHOPIER_LISTING_TTL_MS).toISOString();
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('status', 'pending_payment')
        .eq('payment_provider', 'shopier')
        .lte('created_at', cutoffIso)
        .limit(60);
      if (!error && Array.isArray(data)) {
        return data.map(mapDbOrder);
      }
    } catch {
      // fall through to local state
    }
  }
  const localState = await readLocalOrdersState();
  return localState.orders.filter((o) => isPendingShopierOrderExpired(o, nowMs));
}

export interface ShopierCleanupResult {
  checked: number;
  cancelledRefs: string[];
  promotedRefs: string[];
  skippedReason?: string;
}

const globalCleanupState = globalThis as unknown as {
  __rsLastShopierCleanupAt?: number;
  __rsShopierCleanupPromise?: Promise<ShopierCleanupResult> | null;
};

async function runExpiredShopierCleanup(
  candidates: OrderRecord[],
  request?: Request
): Promise<ShopierCleanupResult> {
  const nowMs = Date.now();
  const expired = candidates.filter((o) => isPendingShopierOrderExpired(o, nowMs));
  if (expired.length === 0) {
    return { checked: 0, cancelledRefs: [], promotedRefs: [] };
  }

  let shopierOrders: ShopierOrderRecord[] = [];
  const shopierEnabled = isShopierConfigured();
  if (shopierEnabled) {
    const res = await fetchShopierOrdersSafe(50);
    if (!res.ok) {
      return {
        checked: expired.length,
        cancelledRefs: [],
        promotedRefs: [],
        skippedReason: 'shopier_fetch_failed',
      };
    }
    shopierOrders = res.orders;
  }

  const cancelledRefs: string[] = [];
  const promotedRefs: string[] = [];

  for (const ord of expired) {
    if (shopierOrders.length > 0) {
      const match = matchShopierOrderToInternal(ord, shopierOrders);
      if (match) {
        if (await promoteMatchedShopierOrder(ord, match)) {
          promotedRefs.push(ord.referenceCode);
        }
        continue;
      }
    }

    const claimed = await claimPendingOrderTransition(ord, 'cancelled');
    if (!claimed) continue;

    if (shopierEnabled && ord.shopierProductId) {
      const delRes = await deleteDynamicShopierListingResult(ord.shopierProductId);
      if (!delRes.ok) {
        await revertCancelledToPending(ord.id);
        continue;
      }
    }

    await appendOrderMessage({
      order: claimed,
      senderUserId: null,
      senderRole: 'system',
      senderName: 'Otomatik Süre Sonu',
      senderAvatar: '/assets/newlogo.png',
      messageType: 'status_update',
      body: `Ödeme süresi (${SHOPIER_LISTING_TTL_MINUTES} dakika) dolduğu için referanslı Shopier ödeme ilanı (${ord.referenceCode}) otomatik olarak kaldırıldı ve sipariş iptal edildi. Satın almak isterseniz sepetinizden yeni ilan oluşturabilirsiniz.`,
    });

    await writeAuditLog({
      request,
      actorId: 'system-expiry',
      actorType: 'system',
      action: 'SHOPIER_EXPIRED_LISTING_REMOVED',
      resourceType: 'order',
      resourceId: ord.referenceCode,
      metadata: {
        shopierProductId: ord.shopierProductId,
        createdAt: ord.createdAt,
      },
    });

    await dispatchOrderNotification({
      type: 'order_expired',
      order: claimed,
    });

    cancelledRefs.push(ord.referenceCode);
  }

  return { checked: expired.length, cancelledRefs, promotedRefs };
}

/**
 * Deletes expired unpaid dynamic Shopier listings (>= 15 minutes old) unless Shopier confirms payment.
 */
export async function cleanupExpiredPendingShopierOrders(options?: {
  force?: boolean;
  candidateOrders?: OrderRecord[];
  minIntervalMs?: number;
  request?: Request;
}): Promise<ShopierCleanupResult> {
  const now = Date.now();
  if (options?.candidateOrders) {
    const expiredSubset = options.candidateOrders.filter((o) => isPendingShopierOrderExpired(o, now));
    if (expiredSubset.length === 0) {
      return { checked: 0, cancelledRefs: [], promotedRefs: [] };
    }
    return runExpiredShopierCleanup(expiredSubset, options.request);
  }

  const minInterval = options?.minIntervalMs ?? 20_000;
  if (!options?.force && globalCleanupState.__rsLastShopierCleanupAt && now - globalCleanupState.__rsLastShopierCleanupAt < minInterval) {
    return { checked: 0, cancelledRefs: [], promotedRefs: [], skippedReason: 'throttled' };
  }

  if (globalCleanupState.__rsShopierCleanupPromise) {
    return globalCleanupState.__rsShopierCleanupPromise;
  }

  globalCleanupState.__rsLastShopierCleanupAt = now;
  const promise = (async () => {
    const candidates = await listExpiredPendingShopierCandidates(now);
    return runExpiredShopierCleanup(candidates, options?.request);
  })().finally(() => {
    globalCleanupState.__rsShopierCleanupPromise = null;
  });

  globalCleanupState.__rsShopierCleanupPromise = promise;
  return promise;
}

/**
 * Reconciles pending internal orders against live Shopier `GET /v1/orders` API,
 * and cleans up any unpaid orders past the 15-minute payment window.
 */
export async function reconcilePendingOrdersWithShopier(
  candidateOrders?: OrderRecord[],
  request?: Request
): Promise<{ checked: number; matchedRefs: string[]; expiredCancelledRefs: string[] }> {
  const targetOrders = candidateOrders || (await listAllOrdersAdmin(100)).orders;
  const pending = targetOrders.filter((o) => o.status === 'pending_payment');
  if (pending.length === 0) {
    return { checked: 0, matchedRefs: [], expiredCancelledRefs: [] };
  }

  const matchedRefs: string[] = [];
  const shopierRes = await fetchShopierOrdersSafe(50);

  if (shopierRes.ok && shopierRes.orders.length > 0) {
    for (const ord of pending) {
      const match = matchShopierOrderToInternal(ord, shopierRes.orders);
      if (match && (await promoteMatchedShopierOrder(ord, match))) {
        matchedRefs.push(ord.referenceCode);
      }
    }
  }

  let expiredCancelledRefs: string[] = [];
  if (shopierRes.ok || !isShopierConfigured()) {
    const stillPending = pending.filter((o) => !matchedRefs.includes(o.referenceCode));
    if (stillPending.some((o) => isPendingShopierOrderExpired(o))) {
      const cleanRes = await cleanupExpiredPendingShopierOrders({
        force: true,
        candidateOrders: stillPending,
        request,
      });
      matchedRefs.push(...cleanRes.promotedRefs);
      expiredCancelledRefs = cleanRes.cancelledRefs;
    }
  }

  return { checked: pending.length, matchedRefs, expiredCancelledRefs };
}

export async function fulfillDeliveredOrderOnShopier(order: OrderRecord): Promise<boolean> {
  if (!order.shopierOrderId) return false;
  return markShopierOrderFulfilled(order.shopierOrderId, order.referenceCode);
}
