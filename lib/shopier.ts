import { SITE_URL } from '@/lib/site-config';
import {
  verifyShopierWebhookSignature,
  type ShopierOrderLineItem,
  type ShopierOrderRecord,
} from '@/lib/orders-pure';

export {
  verifyShopierWebhookSignature,
  type ShopierOrderLineItem,
  type ShopierOrderRecord,
};

const SHOPIER_API_BASE = 'https://api.shopier.com/v1';
const FALLBACK_PRODUCT_MEDIA_URL = `${SITE_URL}/assets/newlogo.png`;
const VALID_MEDIA_EXT_RE = /\.(jpg|jpeg|png|bmp)(\?.*)?$/i;

export interface ShopierProductResponse {
  id: string;
  title: string;
  url: string;
  type: 'physical' | 'digital';
  stockStatus?: string;
  stockQuantity?: number;
  priceData?: {
    currency?: string;
    price?: string;
  };
}

function getShopierToken(): string | null {
  const raw = process.env.SHOPIER_API_TOKEN?.trim();
  return raw && raw.length >= 20 ? raw : null;
}

export function isShopierConfigured(): boolean {
  return Boolean(getShopierToken());
}

function buildShopierHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'RestrictedStudio-ShopierClient/1.0',
  };
}

function resolveShopierMediaUrl(candidateUrl?: string | null): string {
  if (!candidateUrl || typeof candidateUrl !== 'string') {
    return FALLBACK_PRODUCT_MEDIA_URL;
  }
  const clean = candidateUrl.trim();
  if (clean.startsWith('https://') && VALID_MEDIA_EXT_RE.test(clean)) {
    return clean;
  }
  return FALLBACK_PRODUCT_MEDIA_URL;
}

/**
 * Creates a dynamic custom digital product listing on Shopier for an exact order reference and amount,
 * returning the hosted Shopier checkout URL (`https://www.shopier.com/<id>`).
 */
export async function createDynamicShopierListing(params: {
  referenceCode: string;
  title: string;
  description: string;
  amountTry: number;
  imageUrl?: string | null;
  buyerLabel?: string;
}): Promise<
  | { ok: true; productId: string; checkoutUrl: string }
  | { ok: false; message: string; status: number }
> {
  const token = getShopierToken();
  if (!token) {
    return {
      ok: false,
      status: 503,
      message: 'Shopier ödeme altyapısı sunucuda henüz yapılandırılmamış (SHOPIER_API_TOKEN eksik).',
    };
  }

  const priceStr = (Math.round(params.amountTry * 100) / 100).toFixed(2);
  const safeTitle = `[${params.referenceCode}] ${params.title}`.slice(0, 120);
  const safeDesc = params.description.slice(0, 1800);
  const mediaUrl = resolveShopierMediaUrl(params.imageUrl);

  try {
    const res = await fetch(`${SHOPIER_API_BASE}/products`, {
      method: 'POST',
      headers: buildShopierHeaders(token),
      body: JSON.stringify({
        title: safeTitle,
        description: safeDesc,
        type: 'digital',
        media: [
          {
            type: 'image',
            url: mediaUrl,
            placement: 1,
          },
        ],
        priceData: {
          currency: 'TRY',
          price: priceStr,
        },
        stockQuantity: 1,
        shippingPayer: 'sellerPays',
        customListing: true,
        customNote: `Referans: ${params.referenceCode}${
          params.buyerLabel ? ` | Müşteri: ${params.buyerLabel.slice(0, 48)}` : ''
        } — Ödeme sonrası restrictedstudio.shop/hesabim üzerinden teslimat sohbetinizi takip edin.`,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        ok: false,
        status: res.status >= 400 && res.status < 500 ? 502 : 503,
        message: `Shopier ödeme ilanı oluşturulamadı (HTTP ${res.status}). ${errText.slice(0, 140)}`,
      };
    }

    const data = (await res.json()) as ShopierProductResponse;
    if (!data?.id || !data?.url) {
      return {
        ok: false,
        status: 502,
        message: 'Shopier yanıtında ödeme bağlantısı dönmedi.',
      };
    }

    return {
      ok: true,
      productId: String(data.id),
      checkoutUrl: String(data.url),
    };
  } catch {
    return {
      ok: false,
      status: 504,
      message: 'Shopier sunucusuna bağlanırken zaman aşımı oluştu. Lütfen tekrar deneyin.',
    };
  }
}

export async function deleteDynamicShopierListing(productId: string): Promise<boolean> {
  const token = getShopierToken();
  if (!token || !productId) return false;
  try {
    const res = await fetch(`${SHOPIER_API_BASE}/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: buildShopierHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchShopierOrders(limit = 50): Promise<ShopierOrderRecord[]> {
  const token = getShopierToken();
  if (!token) return [];
  try {
    const cleanLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    const res = await fetch(
      `${SHOPIER_API_BASE}/orders?page=1&limit=${cleanLimit}&sort=dateDesc`,
      {
        headers: buildShopierHeaders(token),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ShopierOrderRecord[]) : [];
  } catch {
    return [];
  }
}

export async function markShopierOrderFulfilled(
  shopierOrderId: string,
  referenceCode: string
): Promise<boolean> {
  const token = getShopierToken();
  if (!token || !shopierOrderId) return false;
  try {
    const res = await fetch(`${SHOPIER_API_BASE}/orders/${encodeURIComponent(shopierOrderId)}`, {
      method: 'PUT',
      headers: buildShopierHeaders(token),
      body: JSON.stringify({
        fulfillments: {
          productType: 'digital',
          shippingCompany: 'dijital',
          trackingNumber: referenceCode,
          note: `Restricted Studio müşteri portalı üzerinden teslim edildi (${referenceCode}).`,
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
