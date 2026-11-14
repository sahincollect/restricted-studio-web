export type PixelTownBuildingId =
  | 'status'
  | 'discord'
  | 'portal'
  | 'catalog'
  | 'engineering'
  | 'itemsatis'
  | 'scripts'
  | 'mlo'
  | 'vehicles';

export type PixelTownBuildingTone = 'crimson' | 'amber' | 'frost';

export type PixelTownBuildingAction =
  | { kind: 'route'; href: string }
  | { kind: 'modal'; modalId: 'engineering' }
  | { kind: 'external'; href: string };

export interface PixelTownBuildingSpec {
  id: PixelTownBuildingId;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  tone: PixelTownBuildingTone;
  sprite: string;
  action: PixelTownBuildingAction;
  statCategoryKey?: 'Script & Sistemler' | 'MLO & Mekanlar' | 'Araç Paketleri';
  featuredMobile?: boolean;
}

export interface TownHealthSnapshot {
  state: 'operational' | 'degraded';
  responseTimeMs: number | null;
}

export interface CatalogStatsInput {
  total: number;
  counts: Record<string, number>;
}

export const ITEMSATIS_STORE_URL = 'https://www.itemsatis.com/p/saintstudio';

/**
 * Reserved top-left sky marquee bounding box (in stage percentages) that no building
 * box may intersect so hero copy stays crisp on empty night sky.
 */
export const TOWN_MARQUEE_RESERVED_BOX = {
  x1: 0,
  y1: 0,
  x2: 38,
  y2: 34,
} as const;

export const PIXEL_TOWN_BUILDINGS: readonly PixelTownBuildingSpec[] = [
  {
    id: 'portal',
    x: 41,
    y: 12,
    w: 15,
    h: 22,
    zIndex: 12,
    tone: 'crimson',
    sprite: '/assets/town/portal.png',
    action: { kind: 'route', href: '/dashboard' },
  },
  {
    id: 'status',
    x: 58,
    y: 5,
    w: 16,
    h: 21,
    zIndex: 10,
    tone: 'frost',
    sprite: '/assets/town/status.png',
    action: { kind: 'route', href: '/status' },
  },
  {
    id: 'discord',
    x: 78,
    y: 8,
    w: 16,
    h: 25,
    zIndex: 11,
    tone: 'crimson',
    sprite: '/assets/town/discord.png',
    action: { kind: 'route', href: '/discord' },
  },
  {
    id: 'catalog',
    x: 55,
    y: 30,
    w: 22,
    h: 27,
    zIndex: 20,
    tone: 'crimson',
    sprite: '/assets/town/catalog.png',
    action: { kind: 'route', href: '/katalog' },
    featuredMobile: true,
  },
  {
    id: 'engineering',
    x: 7,
    y: 39,
    w: 17,
    h: 25,
    zIndex: 22,
    tone: 'amber',
    sprite: '/assets/town/engineering.png',
    action: { kind: 'modal', modalId: 'engineering' },
  },
  {
    id: 'itemsatis',
    x: 26,
    y: 44,
    w: 17,
    h: 25,
    zIndex: 23,
    tone: 'crimson',
    sprite: '/assets/town/itemsatis.png',
    action: { kind: 'external', href: ITEMSATIS_STORE_URL },
  },
  {
    id: 'scripts',
    x: 41,
    y: 60,
    w: 17,
    h: 26,
    zIndex: 31,
    tone: 'amber',
    sprite: '/assets/town/scripts.png',
    action: { kind: 'route', href: '/katalog?category=scripts' },
    statCategoryKey: 'Script & Sistemler',
  },
  {
    id: 'mlo',
    x: 60,
    y: 61,
    w: 17,
    h: 26,
    zIndex: 32,
    tone: 'frost',
    sprite: '/assets/town/mlo.png',
    action: { kind: 'route', href: '/katalog?category=mlo' },
    statCategoryKey: 'MLO & Mekanlar',
  },
  {
    id: 'vehicles',
    x: 79,
    y: 58,
    w: 17,
    h: 27,
    zIndex: 33,
    tone: 'crimson',
    sprite: '/assets/town/vehicles.png',
    action: { kind: 'route', href: '/katalog?category=vehicles' },
    statCategoryKey: 'Araç Paketleri',
  },
] as const;

function formatCountDot(value: number): string {
  return Math.max(0, Math.round(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parses `/api/health` responses defensively; returns null on malformed payloads
 * so UI badges fall back to localized nominal copy without errors.
 */
export function deriveStatusBadgeState(payload: unknown): TownHealthSnapshot | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const rawStatus = record.status;

  if (rawStatus !== 'operational' && rawStatus !== 'degraded' && rawStatus !== 'down') {
    return null;
  }

  const rawLatency = record.responseTimeMs;
  if (rawLatency !== undefined && (typeof rawLatency !== 'number' || !Number.isFinite(rawLatency) || rawLatency < 0)) {
    return null;
  }

  return {
    state: rawStatus === 'operational' ? 'operational' : 'degraded',
    responseTimeMs: typeof rawLatency === 'number' ? Math.round(rawLatency) : null,
  };
}

/**
 * Formats the live signboard badge for a town building from catalog stats or health latency.
 */
export function getTownBuildingBadge(
  id: PixelTownBuildingId,
  localizedDefaultBadge: string,
  stats: CatalogStatsInput,
  healthState?: TownHealthSnapshot | null
): string {
  if (id === 'catalog' && typeof stats.total === 'number' && stats.total > 0) {
    return `${formatCountDot(stats.total)}+`;
  }

  const spec = PIXEL_TOWN_BUILDINGS.find((entry) => entry.id === id);
  if (spec?.statCategoryKey) {
    const count = stats.counts[spec.statCategoryKey];
    if (typeof count === 'number' && count > 0) {
      return formatCountDot(count);
    }
  }

  if (id === 'status' && healthState?.responseTimeMs !== null && healthState?.responseTimeMs !== undefined) {
    return `${healthState.responseTimeMs} ms`;
  }

  return localizedDefaultBadge;
}

/**
 * Verifies every building stays within stage safe margins, avoids the top-left sky marquee box,
 * and keeps bottom-center signboard anchors adequately spaced.
 */
export function validateTownLayoutGeometry(
  buildings: readonly PixelTownBuildingSpec[]
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const b of buildings) {
    if (b.x < 2 || b.y < 2 || b.x + b.w > 98 || b.y + b.h > 92) {
      errors.push(`${b.id} exceeds stage safe bounds`);
    }

    const overlapsMarquee =
      b.x < TOWN_MARQUEE_RESERVED_BOX.x2 &&
      b.x + b.w > TOWN_MARQUEE_RESERVED_BOX.x1 &&
      b.y < TOWN_MARQUEE_RESERVED_BOX.y2 &&
      b.y + b.h > TOWN_MARQUEE_RESERVED_BOX.y1;

    if (overlapsMarquee) {
      errors.push(`${b.id} overlaps reserved top-left marquee box`);
    }
  }

  for (let i = 0; i < buildings.length; i += 1) {
    for (let j = i + 1; j < buildings.length; j += 1) {
      const a = buildings[i];
      const b = buildings[j];
      const ax = a.x + a.w / 2;
      const ay = a.y + a.h;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h;
      const dist = Math.hypot(ax - bx, ay - by);
      if (dist < 8) {
        errors.push(`Sign anchor distance too tight (${dist.toFixed(2)}%) between ${a.id} and ${b.id}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
