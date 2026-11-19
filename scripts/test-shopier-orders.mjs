import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { ShopierCheckoutSchema, validateAvatarInput } from '../lib/validation.ts';
import {
  DELIVERY_SLA_NOTICE_TR,
  generateOrderReferenceCode,
  matchShopierOrderToInternal,
  verifyShopierWebhookSignature,
} from '../lib/orders-pure.ts';
import {
  SHOPIER_LISTING_TTL_MINUTES,
  SHOPIER_LISTING_TTL_MS,
  computeOrderExpiresAtIso,
  formatCountdownMmSs,
  getOrderRemainingSeconds,
  isPendingShopierOrderExpired,
} from '../lib/order-timer.ts';

test('validateAvatarInput enforces presets, HTTPS URLs, magic bytes, and size limits', () => {
  assert.deepEqual(validateAvatarInput('preset:Ember'), { ok: true, value: 'preset:ember' });
  assert.deepEqual(validateAvatarInput('https://cdn.example.com/avatar.png'), {
    ok: true,
    value: 'https://cdn.example.com/avatar.png',
  });

  assert.equal(validateAvatarInput('http://cdn.example.com/avatar.png').ok, false);
  assert.equal(validateAvatarInput('https://127.0.0.1/avatar.png').ok, false);
  assert.equal(
    validateAvatarInput('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+').ok,
    false
  );

  // Spoofed HTML disguised as PNG header
  const fakePng = Buffer.from('<script>alert(1)</script>').toString('base64');
  assert.equal(validateAvatarInput(`data:image/png;base64,${fakePng}`).ok, false);

  // Genuine PNG magic header (>= 12 bytes)
  const validPngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
  ]).toString('base64');
  assert.equal(validateAvatarInput(`data:image/png;base64,${validPngHeader}`).ok, true);

  // Oversized PNG > 262,144 bytes
  const bigBuf = Buffer.alloc(270_000, 0);
  bigBuf[0] = 0x89;
  bigBuf[1] = 0x50;
  bigBuf[2] = 0x4e;
  bigBuf[3] = 0x47;
  assert.equal(validateAvatarInput(`data:image/png;base64,${bigBuf.toString('base64')}`).ok, false);
});

test('ShopierCheckoutSchema validates catalog & store checkout payloads strictly', () => {
  assert.equal(
    ShopierCheckoutSchema.safeParse({
      source: 'catalog',
      itemIds: ['RS-CAT-0001', 'RS-CAT-0012'],
      note: 'Sunucu: Restricted RP',
    }).success,
    true
  );

  assert.equal(
    ShopierCheckoutSchema.safeParse({
      source: 'catalog',
      itemIds: ['../bad-id'],
    }).success,
    false
  );

  assert.equal(
    ShopierCheckoutSchema.safeParse({
      source: 'store',
      productId: '4125874',
      quantity: 2,
    }).success,
    true
  );
});

test('generateOrderReferenceCode emits valid unique references and SLA notice includes 2h / 6-24h', () => {
  const a = generateOrderReferenceCode();
  const b = generateOrderReferenceCode();
  assert.match(a, /^RS-ORD-\d{6}-[A-F0-9]{6}$/);
  assert.match(b, /^RS-ORD-\d{6}-[A-F0-9]{6}$/);
  assert.notEqual(a, b);
  assert.ok(DELIVERY_SLA_NOTICE_TR.includes('2 saat'));
  assert.ok(DELIVERY_SLA_NOTICE_TR.includes('6 ila 24 saat'));
});

test('matchShopierOrderToInternal matches only paid orders by productId, title, or note', () => {
  const internal = {
    id: '1',
    referenceCode: 'RS-ORD-261119-AB12CD',
    userId: 'u1',
    buyerEmail: 'a@b.c',
    buyerName: 'User',
    source: 'catalog',
    paymentProvider: 'shopier',
    title: 'Test Bundle',
    items: [],
    currency: 'TRY',
    totalAmount: 100,
    status: 'pending_payment',
    shopierProductId: '53113085',
    shopierCheckoutUrl: 'https://www.shopier.com/53113085',
    shopierOrderId: null,
    deliverySlaNote: DELIVERY_SLA_NOTICE_TR,
    deliveryPayload: null,
    paidAt: null,
    deliveredAt: null,
    createdAt: '',
    updatedAt: '',
  };

  assert.equal(
    matchShopierOrderToInternal(internal, [
      { id: '9001', paymentStatus: 'unpaid', note: 'RS-ORD-261119-AB12CD' },
    ]),
    null
  );

  const matched = matchShopierOrderToInternal(internal, [
    { id: '9002', paymentStatus: 'paid', lineItems: [{ productId: '53113085', title: 'Pack' }] },
  ]);
  assert.equal(matched?.id, '9002');
});

test('verifyShopierWebhookSignature fails closed without secret and validates HMAC-SHA256', () => {
  const prev = process.env.SHOPIER_WEBHOOK_TOKEN;
  delete process.env.SHOPIER_WEBHOOK_TOKEN;
  const payload = JSON.stringify({ id: '9002', paymentStatus: 'paid' });
  assert.equal(verifyShopierWebhookSignature(payload, 'deadbeef'), false);

  process.env.SHOPIER_WEBHOOK_TOKEN = 'test_webhook_secret_123456';
  const hexSig = crypto
    .createHmac('sha256', process.env.SHOPIER_WEBHOOK_TOKEN)
    .update(payload, 'utf8')
    .digest('hex');
  assert.equal(verifyShopierWebhookSignature(payload, hexSig), true);
  assert.equal(verifyShopierWebhookSignature(payload, 'tampered_sig'), false);

  if (prev === undefined) {
    delete process.env.SHOPIER_WEBHOOK_TOKEN;
  } else {
    process.env.SHOPIER_WEBHOOK_TOKEN = prev;
  }
});

test('15-minute Shopier listing expiry helpers detect unpaid timeouts accurately', () => {
  assert.equal(SHOPIER_LISTING_TTL_MINUTES, 15);
  assert.equal(SHOPIER_LISTING_TTL_MS, 15 * 60 * 1000);

  const createdIso = '2026-11-19T01:00:00.000Z';
  const expectedExpIso = '2026-11-19T01:15:00.000Z';
  assert.equal(computeOrderExpiresAtIso(createdIso), expectedExpIso);

  const pendingOrder = {
    status: 'pending_payment',
    paymentProvider: 'shopier',
    createdAt: createdIso,
    expiresAt: expectedExpIso,
  };

  const before14m59s = Date.parse(createdIso) + 14 * 60 * 1000 + 59 * 1000;
  const exact15m00s = Date.parse(createdIso) + 15 * 60 * 1000;

  assert.equal(isPendingShopierOrderExpired(pendingOrder, before14m59s), false);
  assert.equal(getOrderRemainingSeconds(pendingOrder, before14m59s), 1);
  assert.equal(formatCountdownMmSs(899), '14:59');

  assert.equal(isPendingShopierOrderExpired(pendingOrder, exact15m00s), true);
  assert.equal(getOrderRemainingSeconds(pendingOrder, exact15m00s), 0);
  assert.equal(formatCountdownMmSs(0), '00:00');

  assert.equal(
    isPendingShopierOrderExpired({ ...pendingOrder, status: 'preparing' }, exact15m00s),
    false
  );
  assert.equal(
    isPendingShopierOrderExpired({ ...pendingOrder, status: 'cancelled' }, exact15m00s),
    false
  );
  assert.equal(
    isPendingShopierOrderExpired({ ...pendingOrder, paymentProvider: 'itemsatis' }, exact15m00s),
    false
  );
});
