import test from 'node:test';
import assert from 'node:assert/strict';
import { getSnapshotItemsatisListings } from '../lib/itemsatis-store.ts';
import { mergeStoreProducts } from '../lib/store-pricing-pure.ts';

test('itemsatis snapshot loads clean listings with required fields', () => {
  const snap = getSnapshotItemsatisListings();
  assert.ok(snap.items.length >= 20, 'expected snapshot to contain listings');
  for (const item of snap.items) {
    assert.ok(item.id, 'listing id should exist');
    assert.ok(item.title && !item.title.includes('&#'), 'title must have decoded HTML entities');
    assert.ok(item.itemsatisUrl.startsWith('https://www.itemsatis.com/'), 'valid İtemsatış link');
    assert.ok(Number.isFinite(item.sourcePrice) && item.sourcePrice >= 0, 'valid price');
  }
});

test('mergeStoreProducts applies customPrice, comparePrice, and hidden overrides', () => {
  const sample = getSnapshotItemsatisListings().items.slice(0, 2);
  const first = sample[0];
  const second = sample[1];

  const merged = mergeStoreProducts(sample, {
    [first.id]: {
      productId: first.id,
      customPrice: 499.5,
      comparePrice: 699,
      hidden: false,
    },
    [second.id]: {
      productId: second.id,
      customPrice: null,
      comparePrice: null,
      hidden: true,
    },
  });

  assert.equal(merged[0].price, 499.5);
  assert.equal(merged[0].comparePrice, 699);
  assert.equal(merged[0].hasCustomPrice, true);
  assert.equal(merged[0].hidden, false);

  assert.equal(merged[1].price, second.sourcePrice);
  assert.equal(merged[1].hasCustomPrice, false);
  assert.equal(merged[1].hidden, true);
});
