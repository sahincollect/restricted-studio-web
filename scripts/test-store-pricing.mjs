import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_LICENSE_LISTINGS,
  filterLicenseCatalogItems,
  getSnapshotItemsatisListings,
} from '../lib/itemsatis-store.ts';
import { mergeStoreProducts } from '../lib/store-pricing-pure.ts';

test('itemsatis snapshot loads only first 19 non-FiveM digital license listings', () => {
  const snap = getSnapshotItemsatisListings();
  assert.ok(snap.items.length > 0 && snap.items.length <= MAX_LICENSE_LISTINGS, 'expected at most 19 listings');
  for (const item of snap.items) {
    assert.ok(item.id, 'listing id should exist');
    assert.notEqual(item.group, 'fivem', 'FiveM listings must not appear in licenses catalog');
    assert.ok(item.title && !item.title.includes('&#'), 'title must have decoded HTML entities');
    assert.ok(item.itemsatisUrl.startsWith('https://www.itemsatis.com/'), 'valid İtemsatış link');
    assert.ok(Number.isFinite(item.sourcePrice) && item.sourcePrice >= 0, 'valid price');
  }
});

test('filterLicenseCatalogItems caps at 19 and strips FiveM items', () => {
  const sample = getSnapshotItemsatisListings().items;
  const padded = [
    ...sample.slice(0, 5),
    { ...sample[0], id: '999999', group: 'fivem' },
    ...sample.slice(5),
    ...sample,
  ];
  const filtered = filterLicenseCatalogItems(padded);
  assert.ok(filtered.length <= MAX_LICENSE_LISTINGS);
  assert.equal(filtered.some((i) => i.group === 'fivem'), false);
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
