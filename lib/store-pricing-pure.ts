import type { ItemsatisProductItem } from './itemsatis-store';

export interface StorePriceOverride {
  productId: string;
  customPrice: number | null;
  comparePrice: number | null;
  hidden: boolean;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface MergedStoreProduct extends ItemsatisProductItem {
  price: number;
  customPrice: number | null;
  comparePrice: number | null;
  hidden: boolean;
  hasCustomPrice: boolean;
}

export function sanitizePriceValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.min(1_000_000, Math.round(num * 100) / 100);
}

export function mergeStoreProducts(
  listings: ItemsatisProductItem[],
  overrides: Record<string, StorePriceOverride>
): MergedStoreProduct[] {
  return listings.map((item) => {
    const ov = overrides[item.id];
    const customPrice = ov?.customPrice ?? null;
    const comparePrice = ov?.comparePrice ?? null;
    const hidden = ov?.hidden ?? false;
    const price = customPrice !== null ? customPrice : item.sourcePrice;

    return {
      ...item,
      price,
      customPrice,
      comparePrice,
      hidden,
      hasCustomPrice: customPrice !== null,
    };
  });
}
