import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { ShopierCheckoutSchema, sanitizePlainText } from '@/lib/validation';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getCatalogItemsByIds } from '@/lib/catalog-server';
import { fetchItemsatisListings } from '@/lib/itemsatis-store';
import { mergeStoreProducts, readStorePriceOverrides } from '@/lib/store-pricing';
import { createDynamicShopierListing, deleteDynamicShopierListing } from '@/lib/shopier';
import {
  appendOrderMessage,
  cleanupExpiredPendingShopierOrders,
  createOrderWithWelcomeMessage,
  DELIVERY_SLA_NOTICE_TR,
  SHOPIER_LISTING_TTL_MINUTES,
  generateOrderReferenceCode,
  type OrderLineItem,
} from '@/lib/orders-store';
import { writeAuditLog } from '@/lib/audit-log';
import { dispatchOrderNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'shopier_checkout', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      {
        success: false,
        requiresAuth: true,
        message:
          'Shopier ile referanslı ödeme ve kişiye özel teslimat sohbeti açmak için lütfen önce giriş yapın.',
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const parsed = await parseJsonBodySafe(request, 16384);
  if (!parsed.ok) return parsed.response;

  const validated = ShopierCheckoutSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        message: validated.error.issues[0]?.message || 'Geçersiz ödeme sepeti.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const payload = validated.data;
  let orderTitle = '';
  let items: OrderLineItem[] = [];
  let totalAmount = 0;
  let descriptionText = '';
  let mediaImageUrl: string | null = null;

  if (payload.source === 'catalog') {
    const uniqueIds = Array.from(new Set(payload.itemIds));
    const catalogMatches = getCatalogItemsByIds(uniqueIds);
    if (catalogMatches.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Seçilen katalog modülleri bulunamadı.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const unitPrice = catalogMatches.length >= 16 ? 50 : 100;
    items = catalogMatches.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
    }));
    totalAmount = catalogMatches.length * unitPrice;
    orderTitle =
      catalogMatches.length === 1
        ? catalogMatches[0].title
        : `FiveM / RedM Katalog Paketi (${catalogMatches.length} Modül)`;

    const previewNames = catalogMatches
      .slice(0, 12)
      .map((c, idx) => `${idx + 1}. ${c.title} (${c.id})`)
      .join('\n');
    const extraCount = catalogMatches.length > 12 ? `\n+ ${catalogMatches.length - 12} diğer modül` : '';

    descriptionText = [
      `Restricted Studio Katalog Arşivi Siparişi`,
      `Toplam Modül: ${catalogMatches.length} adet (Birim: ${unitPrice} TL)`,
      '',
      previewNames + extraCount,
      '',
      DELIVERY_SLA_NOTICE_TR,
    ].join('\n');
  } else {
    const [feed, pricing] = await Promise.all([
      fetchItemsatisListings(),
      readStorePriceOverrides(),
    ]);
    const merged = mergeStoreProducts(feed.items, pricing.overrides);
    const product = merged.find((p) => p.id === payload.productId && !p.hidden);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Seçilen mağaza ürünü bulunamadı veya satışa kapalı.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    if (!Number.isFinite(product.price) || product.price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Bu ürün için geçerli Shopier tutarı hesaplanamadı.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const quantity = payload.quantity ?? 1;
    const unitPrice = Math.round(product.price * 100) / 100;
    totalAmount = Math.round(unitPrice * quantity * 100) / 100;
    orderTitle = quantity > 1 ? `${product.title} (${quantity} Adet)` : product.title;
    items = [
      {
        id: product.id,
        title: product.title,
        quantity,
        unitPrice,
        totalPrice: totalAmount,
      },
    ];
    mediaImageUrl = product.imageUrl || null;
    descriptionText = [
      `Ürün: ${product.title}`,
      `Kategori: ${product.categoryName}`,
      `Adet: ${quantity} · Birim: ${unitPrice} TL`,
      '',
      DELIVERY_SLA_NOTICE_TR,
    ].join('\n');
  }

  await cleanupExpiredPendingShopierOrders({ request }).catch(() => undefined);

  const referenceCode = generateOrderReferenceCode();
  const buyerLabel = session.user.name || session.user.email || session.user.id;
  const listingRes = await createDynamicShopierListing({
    referenceCode,
    title: orderTitle,
    description: `Sipariş Ref: ${referenceCode}\nBu özel ödeme bağlantısı ${SHOPIER_LISTING_TTL_MINUTES} dakika boyunca geçerlidir.\n${descriptionText}`,
    amountTry: totalAmount,
    imageUrl: mediaImageUrl,
    buyerLabel,
  });

  if (!listingRes.ok) {
    return NextResponse.json(
      { success: false, message: listingRes.message },
      { status: listingRes.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let created: Awaited<ReturnType<typeof createOrderWithWelcomeMessage>>;
  try {
    created = await createOrderWithWelcomeMessage({
      referenceCode,
      userId: session.user.id,
      buyerEmail: session.user.email || '',
      buyerName: session.user.name || 'Müşteri',
      source: payload.source,
      paymentProvider: 'shopier',
      title: orderTitle,
      items,
      totalAmount,
      shopierProductId: listingRes.productId,
      shopierCheckoutUrl: listingRes.checkoutUrl,
    });
  } catch {
    await deleteDynamicShopierListing(listingRes.productId);
    return NextResponse.json(
      { success: false, message: 'Sipariş kaydı oluşturulamadı, lütfen tekrar deneyin.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const customerNote = sanitizePlainText(payload.note, 400);
  if (customerNote) {
    await appendOrderMessage({
      order: created.order,
      senderUserId: session.user.id,
      senderRole: 'customer',
      senderName: session.user.name || 'Müşteri',
      messageType: 'text',
      body: customerNote,
    });
  }

  await writeAuditLog({
    request,
    actorId: session.user.id,
    actorType: 'customer',
    action: 'SHOPIER_CHECKOUT_CREATED',
    resourceType: 'order',
    resourceId: referenceCode,
    afterState: {
      source: payload.source,
      totalAmount,
      shopierProductId: listingRes.productId,
      persistent: created.persistent,
    },
  });

  await dispatchOrderNotification({ type: 'order_created', order: created.order });

  const res = NextResponse.json(
    {
      success: true,
      order: created.order,
      checkoutUrl: listingRes.checkoutUrl,
      expiresAt: created.order.expiresAt,
      ttlMinutes: SHOPIER_LISTING_TTL_MINUTES,
      chatUrl: `/hesabim?tab=orders&ref=${encodeURIComponent(referenceCode)}`,
      slaNotice: DELIVERY_SLA_NOTICE_TR,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );

  if (session.refreshedTokens) {
    attachCustomerCookies(request, res, session.refreshedTokens);
  }
  return res;
}
