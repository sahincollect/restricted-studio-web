import test from 'node:test';
import assert from 'node:assert/strict';
import { PIXEL_TRAIN_WAGONS, PIXEL_TRAIN_PROMO_TEXTS } from '../lib/pixel-train-config.ts';

test('pixel-train-config defines exact campaign wagon texts and valid routes', () => {
  assert.equal(PIXEL_TRAIN_PROMO_TEXTS.unitPrice, 'TÜM ÜRÜNLER 100TL!');
  assert.equal(PIXEL_TRAIN_PROMO_TEXTS.bulkDiscount, '15+ ALIMA %50 İNDİRİM');

  assert.ok(Array.isArray(PIXEL_TRAIN_WAGONS));
  assert.ok(PIXEL_TRAIN_WAGONS.length >= 4);

  const banners = PIXEL_TRAIN_WAGONS.map((w) => w.banner);
  assert.ok(banners.includes('TÜM ÜRÜNLER 100TL!'), 'Must include exact TÜM ÜRÜNLER 100TL! wagon');
  assert.ok(banners.includes('15+ ALIMA %50 İNDİRİM'), 'Must include exact 15+ ALIMA %50 İNDİRİM wagon');

  for (const w of PIXEL_TRAIN_WAGONS) {
    assert.ok(w.id && w.code && w.banner && w.href);
  }
});
