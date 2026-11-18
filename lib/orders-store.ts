import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createAdminSupabase } from '@/lib/supabase';
import { fetchShopierOrders, markShopierOrderFulfilled, type ShopierOrderRecord } from '@/lib/shopier';
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
  DELIVERY_SLA_NOTICE_TR,
  generateOrderReferenceCode,
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
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at || row.created_at),
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
    body: `Sipariş kaydınız (${params.referenceCode}) oluşturuldu. Shopier güvenli ödeme sayfasından ödemenizi tamamladığınızda sistem ödemenizi doğrulayıp teslimat sürecini başlatacaktır. ${DELIVERY_SLA_NOTICE_TR}`,
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

/**
 * Reconciles pending internal orders against live Shopier `GET /v1/orders` API.
 */
export async function reconcilePendingOrdersWithShopier(
  candidateOrders?: OrderRecord[]
): Promise<{ checked: number; matchedRefs: string[] }> {
  const shopierOrders = await fetchShopierOrders(50);
  if (shopierOrders.length === 0) {
    return { checked: 0, matchedRefs: [] };
  }

  const targetOrders =
    candidateOrders || (await listAllOrdersAdmin(100)).orders;
  const pending = targetOrders.filter((o) => o.status === 'pending_payment');
  const matchedRefs: string[] = [];

  for (const ord of pending) {
    const match = matchShopierOrderToInternal(ord, shopierOrders);
    if (!match) continue;

    const paidIso = match.dateCreated ? new Date(match.dateCreated).toISOString() : new Date().toISOString();
    const nextStatus: OrderStatus = match.status === 'fulfilled' ? 'delivered' : 'preparing';
    const nextOrder = await updateOrderStatusAndDelivery({
      order: ord,
      status: nextStatus,
      shopierOrderId: String(match.id),
      paidAt: paidIso,
    });

    await appendOrderMessage({
      order: nextOrder,
      senderUserId: null,
      senderRole: 'system',
      senderName: 'Shopier Ödeme Doğrulama',
      senderAvatar: '/assets/newlogo.png',
      messageType: 'status_update',
      body: `Shopier ödemesi doğrulandı (Shopier Sipariş #${match.id}). Siparişiniz hazırlık sırasına alındı. ${DELIVERY_SLA_NOTICE_TR}`,
    });

    matchedRefs.push(ord.referenceCode);
  }

  return { checked: pending.length, matchedRefs };
}

export async function fulfillDeliveredOrderOnShopier(order: OrderRecord): Promise<boolean> {
  if (!order.shopierOrderId) return false;
  return markShopierOrderFulfilled(order.shopierOrderId, order.referenceCode);
}
