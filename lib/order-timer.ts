export const SHOPIER_LISTING_TTL_MINUTES = 15;
export const SHOPIER_LISTING_TTL_MS = SHOPIER_LISTING_TTL_MINUTES * 60 * 1000;

export function computeOrderExpiresAtIso(createdAt: string): string | null {
  const ms = Date.parse(createdAt);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms + SHOPIER_LISTING_TTL_MS).toISOString();
}

export function getOrderExpiresAtMs(order: { createdAt?: string; expiresAt?: string | null }): number {
  if (order.expiresAt) {
    const parsed = Date.parse(order.expiresAt);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (order.createdAt) {
    const createdMs = Date.parse(order.createdAt);
    if (Number.isFinite(createdMs)) return createdMs + SHOPIER_LISTING_TTL_MS;
  }
  return 0;
}

export function getOrderRemainingSeconds(
  order: { createdAt?: string; expiresAt?: string | null },
  nowMs = Date.now()
): number {
  const expMs = getOrderExpiresAtMs(order);
  if (!expMs) return 0;
  return Math.max(0, Math.ceil((expMs - nowMs) / 1000));
}

export function isPendingShopierOrderExpired(
  order: {
    status: string;
    paymentProvider: string;
    createdAt?: string;
    expiresAt?: string | null;
  },
  nowMs = Date.now()
): boolean {
  if (order.status !== 'pending_payment' || order.paymentProvider !== 'shopier') {
    return false;
  }
  const expMs = getOrderExpiresAtMs(order);
  return expMs > 0 && nowMs >= expMs;
}

export function formatCountdownMmSs(totalSeconds: number): string {
  const clean = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clean / 60);
  const secs = clean % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
