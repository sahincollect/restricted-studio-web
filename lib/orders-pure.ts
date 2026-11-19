import crypto from 'node:crypto';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryPayload {
  licenseCode?: string;
  downloadUrl?: string;
  instructions: string;
  deliveredAt: string;
  deliveredBy: string;
}

export interface OrderRecord {
  id: string;
  referenceCode: string;
  userId: string;
  buyerEmail: string;
  buyerName: string;
  source: 'catalog' | 'store' | 'service' | 'support';
  paymentProvider: 'shopier' | 'itemsatis' | 'direct';
  title: string;
  items: OrderLineItem[];
  currency: 'TRY';
  totalAmount: number;
  status: OrderStatus;
  shopierProductId: string | null;
  shopierCheckoutUrl: string | null;
  shopierOrderId: string | null;
  deliverySlaNote: string;
  deliveryPayload: DeliveryPayload | null;
  paidAt: string | null;
  deliveredAt: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderMessageRecord {
  id: string;
  orderId: string;
  referenceCode: string;
  senderUserId: string | null;
  senderRole: 'customer' | 'admin' | 'system';
  senderName: string;
  senderAvatar?: string | null;
  messageType: 'text' | 'status_update' | 'delivery_bundle';
  body: string;
  attachmentMeta?: DeliveryPayload | null;
  createdAt: string;
}

export interface ShopierOrderLineItem {
  productId?: string | number;
  title?: string;
  quantity?: number;
  price?: string | number;
}

export interface ShopierOrderRecord {
  id: string;
  status?: string;
  paymentStatus?: string;
  dateCreated?: string;
  currency?: string;
  paymentMethod?: string;
  note?: string;
  totals?: {
    subtotal?: string;
    total?: string;
  };
  shippingInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  lineItems?: ShopierOrderLineItem[];
}

export const DELIVERY_SLA_NOTICE_TR =
  'Ürünlerimiz ortalama 2 saat içerisinde teslim edilmektedir. Yoğunluk vb. durumlarda teslimat süresi 6 ila 24 saate uzayabilmektedir.';

export function generateOrderReferenceCode(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RS-ORD-${yy}${mm}${dd}-${rand}`;
}

export function generateSupportReferenceCode(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RS-MSG-${yy}${mm}${dd}-${rand}`;
}

export function isSupportThread(
  order: Pick<OrderRecord, 'source' | 'paymentProvider' | 'referenceCode'>
): boolean {
  return (
    order.source === 'support' ||
    order.paymentProvider === 'direct' ||
    order.referenceCode.startsWith('RS-MSG-')
  );
}

export function matchShopierOrderToInternal(
  internalOrder: OrderRecord,
  shopierOrders: ShopierOrderRecord[]
): ShopierOrderRecord | null {
  for (const so of shopierOrders) {
    if (so.paymentStatus && so.paymentStatus !== 'paid') continue;
    const noteMatch =
      typeof so.note === 'string' && so.note.toUpperCase().includes(internalOrder.referenceCode);
    const lineMatch =
      Array.isArray(so.lineItems) &&
      so.lineItems.some((li) => {
        const pid = li?.productId ? String(li.productId) : '';
        const title = typeof li?.title === 'string' ? li.title.toUpperCase() : '';
        return (
          (internalOrder.shopierProductId && pid === internalOrder.shopierProductId) ||
          title.includes(internalOrder.referenceCode)
        );
      });
    if (noteMatch || lineMatch) return so;
  }
  return null;
}

/**
 * Verifies incoming Shopier Webhook HS256 signature (`Shopier-Signature`) against `SHOPIER_WEBHOOK_TOKEN`.
 */
export function verifyShopierWebhookSignature(
  rawBody: string,
  signatureHeader?: string | null
): boolean {
  const secret = process.env.SHOPIER_WEBHOOK_TOKEN?.trim();
  if (!secret || !signatureHeader) return false;
  const cleanSig = signatureHeader.trim();
  const digestHex = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const digestB64 = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  for (const expected of [digestHex, digestB64]) {
    const a = Buffer.from(cleanSig);
    const b = Buffer.from(expected);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return true;
    }
  }
  return false;
}
