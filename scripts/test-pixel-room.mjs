import assert from 'node:assert/strict';
import test from 'node:test';
import { PIXEL_ROOM_HOTSPOTS, PIXEL_ROOM_PROMOS } from '../lib/pixel-room-config.ts';

test('pixel-room-config defines required interactive room hotspots and promo badges', () => {
  assert.equal(PIXEL_ROOM_PROMOS.unitPrice, 'TÜM ÜRÜNLER 100TL!');
  assert.equal(PIXEL_ROOM_PROMOS.bulkDiscount, '15+ ALIMA %50 İNDİRİM');
  assert.ok(PIXEL_ROOM_HOTSPOTS.length >= 6);

  const badges = PIXEL_ROOM_HOTSPOTS.map((h) => h.badge);
  assert.ok(badges.includes('TÜM ÜRÜNLER 100TL!'));
  assert.ok(badges.includes('15+ ALIMA %50 İNDİRİM'));
});
