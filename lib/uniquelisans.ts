const UNIQUELISANS_BASE_URL = 'https://bayi.uniquelisans.com/api';

export interface UniqueLisansSummary {
  configured: boolean;
  reachable: boolean;
  balance: number | null;
  categoryCount: number;
}

/**
 * Optional server-only UniqueLisans supplier telemetry for the admin dashboard.
 * Returns `{ configured: false }` when UNIQUELISANS_API_KEY is absent from env.
 */
export async function fetchUniqueLisansSummary(): Promise<UniqueLisansSummary> {
  const apiKey = process.env.UNIQUELISANS_API_KEY?.trim();
  if (!apiKey) {
    return {
      configured: false,
      reachable: false,
      balance: null,
      categoryCount: 0,
    };
  }

  try {
    const [balRes, catRes] = await Promise.all([
      fetch(`${UNIQUELISANS_BASE_URL}/balance?key=${encodeURIComponent(apiKey)}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      }),
      fetch(`${UNIQUELISANS_BASE_URL}/categories?key=${encodeURIComponent(apiKey)}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      }),
    ]);

    const balJson = balRes.ok ? ((await balRes.json()) as { balance?: number; status?: string }) : null;
    const catJson = catRes.ok
      ? ((await catRes.json()) as { categories?: unknown[]; status?: string })
      : null;

    const ok = balJson?.status === 'success' || catJson?.status === 'success';
    return {
      configured: true,
      reachable: ok,
      balance: typeof balJson?.balance === 'number' ? balJson.balance : null,
      categoryCount: Array.isArray(catJson?.categories) ? catJson.categories.length : 0,
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      balance: null,
      categoryCount: 0,
    };
  }
}
