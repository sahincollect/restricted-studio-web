import snapshotData from './itemsatis-store-snapshot.json' with { type: 'json' };

export type StoreProductGroup = 'ai' | 'design' | 'media' | 'software' | 'fivem';

export interface ItemsatisProductItem {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  typeName: string;
  group: StoreProductGroup;
  sourcePrice: number;
  imageUrl: string;
  itemsatisUrl: string;
  pinned: boolean;
  featured: boolean;
}

export interface ItemsatisFetchResult {
  items: ItemsatisProductItem[];
  syncedAt: string;
  source: 'live' | 'cache' | 'snapshot';
}

const SAINTSTUDIO_PROFILE_URL = 'https://www.itemsatis.com/p/saintstudio';
const SAINTSTUDIO_POSTS_URL = 'https://www.itemsatis.com/api/profilePosts';
const SAINTSTUDIO_USER_ID = '1923977';
const CACHE_TTL_MS = 5 * 60 * 1000;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ouml: 'ö',
  Ouml: 'Ö',
  uuml: 'ü',
  Uuml: 'Ü',
  ccedil: 'ç',
  Ccedil: 'Ç',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  ndash: '–',
  mdash: '—',
  bull: '•',
  middot: '·',
  hellip: '…',
};

function decodeHtmlEntities(raw: unknown): string {
  return String(raw ?? '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
      const cp = Number.parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const cp = Number.parseInt(dec, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    })
    .replace(/&([a-zA-Z]+);/g, (match: string, name: string) => NAMED_ENTITIES[name] ?? match)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function classifyProductGroup(categoryName: string, title: string): StoreProductGroup {
  const cat = categoryName.toLowerCase();
  const text = title.toLowerCase();
  if (
    cat.includes('yapay zeka') ||
    text.includes('chatgpt') ||
    text.includes('gemini') ||
    text.includes('grok') ||
    text.includes('muse') ||
    text.includes('notion')
  ) {
    return 'ai';
  }
  if (cat.includes('canva') || cat.includes('capcut') || cat.includes('adobe')) {
    return 'design';
  }
  if (
    cat.includes('spotify') ||
    cat.includes('youtube') ||
    cat.includes('duolingo') ||
    cat.includes('mail')
  ) {
    return 'media';
  }
  if (
    cat.includes('ofis') ||
    cat.includes('lisans') ||
    text.includes('win 10') ||
    text.includes('izotope') ||
    text.includes('fabfilter')
  ) {
    return 'software';
  }
  return 'fivem';
}

interface RawProfilePost {
  Id?: string | number;
  Title?: string;
  Description?: string;
  Price?: string | number;
  Url?: string;
  categoryName?: string;
  TypeName?: string;
  categorySeo?: string;
  postSeo?: string;
  Pinned?: string;
  ProfilePinned?: string;
  Featured?: string;
}

const globalStoreCache = globalThis as unknown as {
  __rsItemsatisStoreCache?: {
    items: ItemsatisProductItem[];
    syncedAt: string;
    fetchedAtMs: number;
  };
};

async function pullLiveFromItemsatis(): Promise<ItemsatisProductItem[] | null> {
  try {
    const landingRes = await fetch(SAINTSTUDIO_PROFILE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4500),
    });

    if (!landingRes.ok) return null;

    const getSetCookie = (landingRes.headers as Headers & { getSetCookie?: () => string[] })
      .getSetCookie;
    const rawCookies = typeof getSetCookie === 'function' ? getSetCookie.call(landingRes.headers) : [];
    const cookieHeader = rawCookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ');

    const posts: RawProfilePost[] = [];
    for (let page = 1; page <= 12; page++) {
      const res = await fetch(SAINTSTUDIO_POSTS_URL, {
        method: 'POST',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: SAINTSTUDIO_PROFILE_URL,
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: new URLSearchParams({
          Page: String(page),
          userID: SAINTSTUDIO_USER_ID,
        }).toString(),
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) break;
      const json = (await res.json()) as {
        success?: boolean;
        posts?: RawProfilePost[];
        hasMore?: boolean;
      };
      if (!json?.success || !Array.isArray(json.posts) || json.posts.length === 0) {
        break;
      }
      posts.push(...json.posts);
      if (!json.hasMore) break;
    }

    if (posts.length === 0) return null;

    const seen = new Set<string>();
    const normalized: ItemsatisProductItem[] = [];
    for (const post of posts) {
      const id = String(post.Id ?? '').trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const title = decodeHtmlEntities(post.Title);
      if (!title) continue;

      const categoryName = decodeHtmlEntities(post.categoryName || 'Genel');
      const description = decodeHtmlEntities(post.Description || '');
      const sourcePrice = Number.parseFloat(String(post.Price ?? '0'));
      const safePrice = Number.isFinite(sourcePrice) && sourcePrice >= 0 ? sourcePrice : 0;
      const imageUrl =
        typeof post.Url === 'string' && /^https?:\/\//i.test(post.Url) ? post.Url : '';
      const categorySeo = String(post.categorySeo || 'urun').replace(/[^a-z0-9-_]/gi, '');
      const postSeo = String(post.postSeo || 'ilan').replace(/[^a-z0-9-_]/gi, '');

      normalized.push({
        id,
        title,
        description,
        categoryName,
        typeName: decodeHtmlEntities(post.TypeName || 'İlan'),
        group: classifyProductGroup(categoryName, title),
        sourcePrice: Math.round(safePrice * 100) / 100,
        imageUrl,
        itemsatisUrl: `https://www.itemsatis.com/${categorySeo}/${postSeo}-${id}.html`,
        pinned: post.Pinned === '1' || post.ProfilePinned === '1',
        featured: post.Featured === '1',
      });
    }

    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

export function getSnapshotItemsatisListings(): ItemsatisFetchResult {
  return {
    items: (snapshotData.items || []) as ItemsatisProductItem[],
    syncedAt: snapshotData.syncedAt || new Date().toISOString(),
    source: 'snapshot',
  };
}

/**
 * Retrieves listings from the saintstudio İtemsatış profile with a 5-minute memory cache
 * and guaranteed static-snapshot fallback when upstream is throttled or offline.
 */
export async function fetchItemsatisListings(options?: {
  forceRefresh?: boolean;
}): Promise<ItemsatisFetchResult> {
  const now = Date.now();
  const cached = globalStoreCache.__rsItemsatisStoreCache;

  if (!options?.forceRefresh && cached && now - cached.fetchedAtMs < CACHE_TTL_MS) {
    return {
      items: cached.items,
      syncedAt: cached.syncedAt,
      source: 'cache',
    };
  }

  const liveItems = await pullLiveFromItemsatis();
  if (liveItems) {
    const syncedAt = new Date().toISOString();
    globalStoreCache.__rsItemsatisStoreCache = {
      items: liveItems,
      syncedAt,
      fetchedAtMs: now,
    };
    return {
      items: liveItems,
      syncedAt,
      source: 'live',
    };
  }

  if (cached && cached.items.length > 0) {
    return {
      items: cached.items,
      syncedAt: cached.syncedAt,
      source: 'cache',
    };
  }

  return getSnapshotItemsatisListings();
}
