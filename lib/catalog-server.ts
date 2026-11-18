import catalogDataRaw from './catalog-data.json';
import catalogStats from './catalog-stats.json';
import { FEATURED_BASELINE_CLICKS, isFeaturedCatalogItem } from './catalog-featured';
import { normalizeSearchText, scoreSearchMatch } from './catalog-intel';

export interface CatalogRecord {
  id: string;
  title: string;
  category: string;
  slug: string;
  source: string;
  status: string;
  image?: string;
}

export type CompactCatalogTuple = [
  id: string,
  title: string,
  categoryIndex: number,
  slug: string,
  verifiedFlag: 0 | 1,
  statusIndex: number,
];

export interface CompactCatalogPayload {
  c: string[];
  s: string[];
  v: CompactCatalogTuple[];
}

const catalogRecords = catalogDataRaw as CatalogRecord[];

let cachedCompactJson: string | null = null;
let cachedSortedDefault: CatalogRecord[] | null = null;

function getPopularityBaseline(id: string): number {
  return FEATURED_BASELINE_CLICKS[id] || 0;
}

function getDefaultPopularOrder(): CatalogRecord[] {
  if (!cachedSortedDefault) {
    cachedSortedDefault = [...catalogRecords].sort(
      (a, b) => getPopularityBaseline(b.id) - getPopularityBaseline(a.id)
    );
  }
  return cachedSortedDefault;
}

export function getCompactCatalogJson(): string {
  if (cachedCompactJson) return cachedCompactJson;

  const categoryList: string[] = [];
  const categoryIndexMap = new Map<string, number>();
  const statusList: string[] = [];
  const statusIndexMap = new Map<string, number>();

  const packed: CompactCatalogTuple[] = catalogRecords.map((item) => {
    let catIdx = categoryIndexMap.get(item.category);
    if (catIdx === undefined) {
      catIdx = categoryList.length;
      categoryList.push(item.category);
      categoryIndexMap.set(item.category, catIdx);
    }

    let statusIdx = statusIndexMap.get(item.status);
    if (statusIdx === undefined) {
      statusIdx = statusList.length;
      statusList.push(item.status);
      statusIndexMap.set(item.status, statusIdx);
    }

    return [
      item.id,
      item.title,
      catIdx,
      item.slug,
      item.source === 'restricted-verified' ? 1 : 0,
      statusIdx,
    ];
  });

  const payload: CompactCatalogPayload = {
    c: categoryList,
    s: statusList,
    v: packed,
  };

  cachedCompactJson = JSON.stringify(payload);
  return cachedCompactJson;
}

export function getInitialCatalogSlice(options: {
  q?: string;
  category?: string;
  view?: string;
  limit?: number;
}): {
  initialItems: CatalogRecord[];
  totalCount: number;
  categoryCounts: Record<string, number>;
} {
  const limit = options.limit ?? 64;
  const query = (options.q || '').trim();
  const category = (options.category || '').trim();
  const view = (options.view || '').trim();

  let list = getDefaultPopularOrder();

  if (category && category !== 'Tümü') {
    list = list.filter((item) => item.category === category);
  }

  if (view === 'featured') {
    list = list.filter((item) => isFeaturedCatalogItem(item.id));
  }

  if (query) {
    const rawNorm = normalizeSearchText(query);
    const tokens = rawNorm.split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      list = list
        .map((item) => {
          const normTitle = normalizeSearchText(item.title);
          const normKey = normalizeSearchText(`${item.title} ${item.category} ${item.id} ${item.slug}`);
          const pop = getPopularityBaseline(item.id);
          const rel = scoreSearchMatch(
            normTitle,
            normKey,
            tokens,
            rawNorm,
            pop,
            isFeaturedCatalogItem(item.id),
            item.source === 'restricted-verified'
          );
          return { item, rel, pop };
        })
        .filter((x) => x.rel >= 0)
        .sort((a, b) => b.rel - a.rel || b.pop - a.pop)
        .map((x) => x.item);
    }
  }

  return {
    initialItems: list.slice(0, limit),
    totalCount: catalogStats.total,
    categoryCounts: {
      Tümü: catalogStats.total,
      ...(catalogStats.counts as Record<string, number>),
    },
  };
}
