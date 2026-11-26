'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ItemsatisLogo from '@/components/ItemsatisLogo';
import ShopierLogo from '@/components/ShopierLogo';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import {
  requestShopierCheckout,
  SHOPIER_UI_COPY,
  ShopierCheckoutStatusBox,
  type ShopierCheckoutOrderSummary,
} from '@/components/ShopierCheckoutBox';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';
import {
  analyzeCatalogItem,
  normalizeSearchText,
  scoreSearchMatch,
  splitTitleHighlight,
  type CatalogSystemKey,
} from '@/lib/catalog-intel';
import {
  FEATURED_BASELINE_CLICKS,
  getItemPopularityScore,
  isFeaturedCatalogItem,
} from '@/lib/catalog-featured';
import type { CompactCatalogPayload } from '@/lib/catalog-server';

type CatalogViewMode = 'all' | 'featured' | 'popular';
type CatalogSortMode = 'popular' | 'featured' | 'default' | 'name-asc' | 'name-desc';

export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  slug: string;
  source: string;
  status: string;
  image?: string;
}

interface CatalogClientProps {
  initialItems: CatalogItem[];
  totalCatalogCount: number;
  initialCategoryCounts: Record<string, number>;
  initialQuery?: string;
  initialCategory?: string;
  initialView?: string;
}

const CATEGORIES = [
  'Tümü',
  'Script & Sistemler',
  'MLO & Mekanlar',
  'Araç Paketleri',
  'Kıyafet & EUP',
  'Modlar & Eklentiler',
  'Program & Araçlar',
];

const POPULAR_TAGS = [
  'LB Phone',
  'Gabz',
  'Roxwood',
  'Qbox',
  'Soygun',
  'Polis',
  'Banka',
  'Garaj',
  'EUP',
];

const DISCORD_INVITE = '/iletisim';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';
const PAGE_SIZE = 60;

const UNIT_PRICE = 100;
const DISCOUNT_THRESHOLD = 15;
const DISCOUNT_PERCENT = 50;

let cachedFullCatalog: CatalogItem[] | null = null;
let inflightCatalogPromise: Promise<CatalogItem[]> | null = null;

function expandCompactCatalog(payload: CompactCatalogPayload): CatalogItem[] {
  const { c: categories, s: statuses, v: tuples } = payload;
  return tuples.map(([id, title, catIdx, slug, verifiedFlag, statusIdx]) => ({
    id,
    title,
    category: categories[catIdx] || 'Script & Sistemler',
    slug,
    source: verifiedFlag === 1 ? 'restricted-verified' : 'restricted-archive',
    status: statuses[statusIdx] || 'Doğrulandı / Hazır',
  }));
}

function loadFullCatalog(): Promise<CatalogItem[]> {
  if (cachedFullCatalog) return Promise.resolve(cachedFullCatalog);
  if (!inflightCatalogPromise) {
    inflightCatalogPromise = fetch('/api/catalog/items')
      .then((res) => {
        if (!res.ok) throw new Error('Catalog fetch failed');
        return res.json() as Promise<CompactCatalogPayload>;
      })
      .then((payload) => {
        const expanded = expandCompactCatalog(payload);
        cachedFullCatalog = expanded;
        return expanded;
      })
      .catch((err) => {
        inflightCatalogPromise = null;
        throw err;
      });
  }
  return inflightCatalogPromise;
}

function renderSystemIcon(systemKey: CatalogSystemKey) {
  switch (systemKey) {
    case 'phone':
      return (
        <>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </>
      );
    case 'vehicle':
      return (
        <>
          <path d="M5 17h14M3 13l2-6h14l2 6v4H3z" />
          <circle cx="7.5" cy="17" r="1.5" />
          <circle cx="16.5" cy="17" r="1.5" />
        </>
      );
    case 'police':
      return <path d="M12 2l7 4v5c0 5-3.5 9.2-7 11-3.5-1.8-7-6-7-11V6l7-4z" />;
    case 'heist':
      return (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="12" r="3.5" />
          <line x1="12" y1="8.5" x2="12" y2="12" />
        </>
      );
    case 'nightlife':
      return (
        <path d="M12 2l2.4 5.2L20 8l-4 3.8.9 5.5-4.9-2.6-4.9 2.6.9-5.5L4 8l5.6-.8z" />
      );
    case 'mlo':
      return (
        <>
          <path d="M3 21V9l9-6 9 6v12" />
          <path d="M9 21v-7h6v7" />
        </>
      );
    case 'clothing':
      return <path d="M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z" />;
    case 'security':
      return (
        <>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </>
      );
    default:
      return (
        <>
          <polyline points="8 6 3 12 8 18" />
          <polyline points="16 6 21 12 16 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </>
      );
  }
}

export default function CatalogClient({
  initialItems,
  totalCatalogCount,
  initialCategoryCounts,
  initialQuery = '',
  initialCategory = 'Tümü',
  initialView = 'all',
}: CatalogClientProps) {
  const { locale, t, formatNumber, formatPercent } = useI18n();
  const extraT = INTERACTIVE_I18N[locale].catalogExtra;

  const resolvedInitCat = CATEGORIES.includes(initialCategory) ? initialCategory : 'Tümü';
  const resolvedInitView: CatalogViewMode =
    initialView === 'featured' ? 'featured' : initialView === 'popular' ? 'popular' : 'all';
  const resolvedInitSort: CatalogSortMode =
    resolvedInitView === 'featured' ? 'featured' : 'popular';

  const [allItems, setAllItems] = useState<CatalogItem[]>(
    () => cachedFullCatalog ?? initialItems
  );
  const [catalogLoaded, setCatalogLoaded] = useState<boolean>(() => Boolean(cachedFullCatalog));

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(resolvedInitCat);
  const [viewMode, setViewMode] = useState<CatalogViewMode>(resolvedInitView);
  const [sortMode, setSortMode] = useState<CatalogSortMode>(resolvedInitSort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);
  const [previewCopied, setPreviewCopied] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>(
    () => ({ ...FEATURED_BASELINE_CLICKS })
  );

  // Cart State
  const [cart, setCart] = useState<CatalogItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shopierLoading, setShopierLoading] = useState(false);
  const [shopierNote, setShopierNote] = useState('');
  const [shopierRequiresAuth, setShopierRequiresAuth] = useState(false);
  const [shopierError, setShopierError] = useState<string | null>(null);
  const [shopierOrder, setShopierOrder] = useState<ShopierCheckoutOrderSummary | null>(null);
  const shopierT = SHOPIER_UI_COPY[locale] || SHOPIER_UI_COPY.tr;

  // Sync URL params, load full compacted catalog index asynchronously, and fetch live click counts
  useEffect(() => {
    let cancelled = false;

    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('q');
      const viewParam = params.get('view');
      const catParam = params.get('category');
      if (qParam !== null) setSearch(qParam);
      if (catParam && CATEGORIES.includes(catParam)) {
        setSelectedCategory(catParam);
      }
      if (viewParam === 'featured') {
        setViewMode('featured');
        setSortMode('featured');
      } else if (viewParam === 'popular') {
        setViewMode('popular');
        setSortMode('popular');
      }
    } catch {
      // ignore
    }

    if (!cachedFullCatalog) {
      loadFullCatalog()
        .then((items) => {
          if (!cancelled) {
            setAllItems(items);
            setCatalogLoaded(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCatalogLoaded(true);
          }
        });
    } else {
      setCatalogLoaded(true);
    }

    let localExtras: Record<string, number> = {};
    try {
      const saved = JSON.parse(localStorage.getItem('rs_local_clicks') || '{}');
      if (saved && typeof saved === 'object') localExtras = saved;
    } catch {
      // ignore
    }

    fetch('/api/catalog/clicks', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const merged: Record<string, number> = { ...FEATURED_BASELINE_CLICKS };
        if (data?.counts && typeof data.counts === 'object') {
          for (const [k, v] of Object.entries(data.counts)) {
            if (typeof v === 'number') merged[k] = v;
          }
        }
        for (const [k, v] of Object.entries(localExtras)) {
          if (typeof v === 'number') {
            merged[k] = Math.max(merged[k] || 0, (FEATURED_BASELINE_CLICKS[k] || 0) + v);
          }
        }
        setClickCounts(merged);
      })
      .catch(() => {
        if (cancelled) return;
        setClickCounts((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(localExtras)) {
            if (typeof v === 'number') {
              next[k] = Math.max(next[k] || 0, (FEATURED_BASELINE_CLICKS[k] || 0) + v);
            }
          }
          return next;
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const trackItemClick = (item: CatalogItem) => {
    setClickCounts((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? FEATURED_BASELINE_CLICKS[item.id] ?? 0) + 1,
    }));

    try {
      const localMap = JSON.parse(localStorage.getItem('rs_local_clicks') || '{}');
      localMap[item.id] = (Number(localMap[item.id]) || 0) + 1;
      localStorage.setItem('rs_local_clicks', JSON.stringify(localMap));
    } catch {
      // ignore
    }

    fetch('/api/catalog/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && typeof data.clicks === 'number') {
          setClickCounts((prev) => ({
            ...prev,
            [item.id]: Math.max(prev[item.id] || 0, data.clicks),
          }));
        }
      })
      .catch(() => {
        // non-blocking telemetry
      });
  };

  // Restore cart only after full catalog is loaded so stored items outside the initial SSR slice are never dropped
  useEffect(() => {
    if (!catalogLoaded) {
      try {
        const stored = localStorage.getItem('rs_catalog_cart');
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (Array.isArray(ids) && ids.length > 0) {
            const idSet = new Set(ids);
            setCart(initialItems.filter((item) => idSet.has(item.id)));
          }
        }
      } catch {
        // ignore
      }
      return;
    }

    try {
      const stored = localStorage.getItem('rs_catalog_cart');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          const idSet = new Set(ids);
          const restored = allItems.filter((item) => idSet.has(item.id));
          setCart(restored);
        }
      }
    } catch {
      // ignore
    }
    setCartHydrated(true);
  }, [catalogLoaded, allItems, initialItems]);

  // Sync cart to local storage after full restoration
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem('rs_catalog_cart', JSON.stringify(cart.map((c) => c.id)));
    } catch {
      // ignore
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (cart.length > 0) {
      document.body.classList.add('has-catalog-cart');
    } else {
      document.body.classList.remove('has-catalog-cart');
    }
    return () => {
      document.body.classList.remove('has-catalog-cart');
    };
  }, [cart.length]);

  useEffect(() => {
    if (!previewItem && !showGuideModal && !isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) setPreviewItem(null);
        else if (isCartOpen) setIsCartOpen(false);
        else if (showGuideModal) setShowGuideModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewItem, isCartOpen, showGuideModal]);

  const handleCloseGuideModal = () => {
    if (dontShowToday) {
      try {
        localStorage.setItem(
          'rs_hide_order_guide_until',
          String(Date.now() + 24 * 60 * 60 * 1000)
        );
      } catch {
        // ignore
      }
    }
    setShowGuideModal(false);
  };

  const SAMPLE_INQUIRY = t.catalog.sampleInquiry;

  const handleCopyTemplate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(SAMPLE_INQUIRY);
    }
    setTemplateCopied(true);
    setTimeout(() => {
      setTemplateCopied(false);
    }, 3000);
  };

  // Pre-index normalized items (initial 64 at mount, then all 6,446 once loaded async)
  const searchIndex = useMemo(() => {
    return allItems.map((item) => ({
      item,
      normalizedTitle: normalizeSearchText(item.title),
      normalizedKey: normalizeSearchText(`${item.title} ${item.category} ${item.id} ${item.slug}`),
    }));
  }, [allItems]);

  const categoryCounts = useMemo(() => {
    if (!catalogLoaded) return initialCategoryCounts;
    const counts: Record<string, number> = { Tümü: allItems.length };
    for (const item of allItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [catalogLoaded, allItems, initialCategoryCounts]);

  const totalCount = catalogLoaded ? allItems.length : totalCatalogCount;

  // Filter, score search relevance, and sort items
  const filteredItems = useMemo(() => {
    const rawNormalized = normalizeSearchText(search);
    const tokens = rawNormalized ? rawNormalized.split(/\s+/).filter(Boolean) : [];
    let entries = searchIndex;

    if (selectedCategory !== 'Tümü') {
      entries = entries.filter((e) => e.item.category === selectedCategory);
    }

    if (viewMode === 'featured') {
      entries = entries.filter((e) => isFeaturedCatalogItem(e.item.id));
    }

    if (tokens.length > 0) {
      const scored = entries
        .map((e) => {
          const pop = getItemPopularityScore(e.item.id, clickCounts);
          const relevance = scoreSearchMatch(
            e.normalizedTitle,
            e.normalizedKey,
            tokens,
            rawNormalized,
            pop,
            isFeaturedCatalogItem(e.item.id),
            e.item.source === 'restricted-verified'
          );
          return { item: e.item, relevance, pop };
        })
        .filter((x) => x.relevance >= 0);

      if (sortMode === 'name-asc') {
        scored.sort((a, b) => a.item.title.localeCompare(b.item.title, locale));
      } else if (sortMode === 'name-desc') {
        scored.sort((a, b) => b.item.title.localeCompare(a.item.title, locale));
      } else {
        scored.sort((a, b) => b.relevance - a.relevance || b.pop - a.pop);
      }

      return scored.map((x) => x.item);
    }

    const items = entries.map((e) => e.item);

    if (sortMode === 'popular' || (viewMode === 'popular' && sortMode === 'default')) {
      items.sort(
        (a, b) => getItemPopularityScore(b.id, clickCounts) - getItemPopularityScore(a.id, clickCounts)
      );
    } else if (sortMode === 'featured') {
      items.sort((a, b) => {
        const fa = isFeaturedCatalogItem(a.id) ? 1 : 0;
        const fb = isFeaturedCatalogItem(b.id) ? 1 : 0;
        if (fb !== fa) return fb - fa;
        return getItemPopularityScore(b.id, clickCounts) - getItemPopularityScore(a.id, clickCounts);
      });
    } else if (sortMode === 'name-asc') {
      items.sort((a, b) => a.title.localeCompare(b.title, locale));
    } else if (sortMode === 'name-desc') {
      items.sort((a, b) => b.title.localeCompare(a.title, locale));
    }

    return items;
  }, [search, selectedCategory, viewMode, sortMode, searchIndex, locale, clickCounts]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory, viewMode, sortMode]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  // Cart logic & pricing
  const cartIds = useMemo(() => new Set(cart.map((c) => c.id)), [cart]);
  const isDiscounted = cart.length > DISCOUNT_THRESHOLD;
  const effectiveUnitPrice = isDiscounted ? UNIT_PRICE * (1 - DISCOUNT_PERCENT / 100) : UNIT_PRICE;
  const rawTotal = cart.length * UNIT_PRICE;
  const finalTotal = cart.length * effectiveUnitPrice;
  const discountSavings = rawTotal - finalTotal;
  const remainingForDiscount = Math.max(0, DISCOUNT_THRESHOLD + 1 - cart.length);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const addToCart = (item: CatalogItem) => {
    trackItemClick(item);
    setCart((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item];
    });
    triggerToast(t.catalog.toastAdded(item.title));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCartItem = (item: CatalogItem) => {
    if (cartIds.has(item.id)) {
      removeFromCart(item.id);
      triggerToast(t.catalog.toastRemoved(item.title));
    } else {
      addToCart(item);
    }
  };

  const clearCart = () => {
    setCart([]);
    triggerToast(t.catalog.toastCleared);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const textToCopy = cart.map((c) => c.title).join('\n');
    let copied = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        copied = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      copied = false;
    }

    triggerToast(
      copied
        ? t.catalog.toastCheckoutCopied(cart.length)
        : t.catalog.toastCheckoutRedirect
    );

    setTimeout(() => {
      window.open(ITEMSATIS_URL, '_blank', 'noopener,noreferrer');
    }, 700);
  };

  const handleShopierCheckout = async () => {
    if (cart.length === 0 || shopierLoading) return;
    setShopierLoading(true);
    setShopierRequiresAuth(false);
    setShopierError(null);
    setShopierOrder(null);

    const res = await requestShopierCheckout({
      source: 'catalog',
      itemIds: cart.map((c) => c.id),
      note: shopierNote.trim() || undefined,
    });

    setShopierLoading(false);

    if (!res.ok) {
      if (res.requiresAuth) {
        setShopierRequiresAuth(true);
      } else {
        setShopierError(res.message);
      }
      return;
    }

    setShopierOrder(res.order);
    triggerToast(`${shopierT.readyTitle} (${res.order.referenceCode})`);
    try {
      window.open(res.order.checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // popup blocked; CTA button remains visible in drawer
    }
  };

  const displayedTotalLabelCount =
    catalogLoaded || search.trim() || viewMode === 'featured'
      ? filteredItems.length
      : categoryCounts[selectedCategory] ?? filteredItems.length;

  return (
    <div className="st-page-shell">
      <SiteNavbar
        activePath="/katalog"
        cartCount={cart.length}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <main className="st-main">
        {/* Hero */}
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{t.catalog.eyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{t.catalog.title}</h1>
            </div>

            <div className="st-subhero-stats">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">{formatNumber(6400)}+</span>
                <span className="st-stat-chip-lbl">{t.catalog.badgeOpenSource}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">100 TL</span>
                <span className="st-stat-chip-lbl">{t.catalog.badgeUnitPrice}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">{formatPercent(50)}</span>
                <span className="st-stat-chip-lbl">{t.catalog.badgeDiscount}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="st-pill-btn is-outline is-sm"
                style={{ alignSelf: 'center' }}
              >
                {t.catalog.orderGuideBtn}
              </button>
            </div>
          </div>
        </section>

        {/* 2-Column Catalog Body */}
        <div className="st-container st-cat-layout">
          {/* Left Sidebar */}
          <aside className="st-cat-sidebar">
            <div className="st-sidebar-card spotlight-surface">
              <label className="st-sidebar-title" htmlFor="catalogSearchInput">
                {t.catalog.searchTitle}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="catalogSearchInput"
                  type="text"
                  className="st-input"
                  placeholder={t.catalog.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingRight: search ? '36px' : undefined }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label={t.catalog.searchClearAria}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearch((prev) => (prev === tag ? '' : tag))}
                    className={`st-filter-pill ${search === tag ? 'is-active' : ''}`}
                    style={{ padding: '5px 10px', fontSize: '11.5px' }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="st-sidebar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="st-sidebar-title">{t.catalog.categoriesTitle}</span>
                <span className="st-cat-count">{formatNumber(totalCount)}</span>
              </div>

              <div className="st-cat-list">
                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`st-cat-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileFiltersOpen(false);
                      }}
                    >
                      <span>{t.catalog.categoryLabels[cat] || cat}</span>
                      <span className="st-cat-count">{formatNumber(count)}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-hairline)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  className={`st-filter-pill ${viewMode === 'all' ? 'is-active' : ''}`}
                  style={{ padding: '6px 11px', fontSize: '11.5px' }}
                  onClick={() => setViewMode('all')}
                >
                  {extraT.viewAll}
                </button>
                <button
                  type="button"
                  className={`st-filter-pill is-ember ${viewMode === 'featured' ? 'is-active' : ''}`}
                  style={{ padding: '6px 11px', fontSize: '11.5px' }}
                  onClick={() => {
                    setViewMode('featured');
                    setSortMode('featured');
                  }}
                >
                  ★ {extraT.viewFeatured}
                </button>
                <button
                  type="button"
                  className={`st-filter-pill is-ember ${viewMode === 'popular' ? 'is-active' : ''}`}
                  style={{ padding: '6px 11px', fontSize: '11.5px' }}
                  onClick={() => {
                    setViewMode('popular');
                    setSortMode('popular');
                  }}
                >
                  ▲ {extraT.viewPopular}
                </button>
              </div>
            </div>

            <div className="st-sidebar-card is-promo">
              <span className="st-sidebar-title">
                {isDiscounted ? t.catalog.campaignActiveBadge : t.catalog.campaignDefaultBadge}
              </span>
              {!isDiscounted && (
                <>
                  <div className="st-progress-track">
                    <div
                      className="st-progress-fill"
                      style={{ width: `${Math.min(100, (cart.length / 16) * 100)}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-dark-muted)', fontWeight: 600 }}>
                    {cart.length} / 16 · {t.catalog.badgeDiscount}
                  </span>
                </>
              )}
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="st-pill-btn is-dark is-sm is-full"
                >
                  {t.catalog.openCartWithTotal(formatNumber(finalTotal))} →
                </button>
              )}
            </div>
          </aside>

          {/* Right Main Grid */}
          <div>
            <div className="st-cat-toolbar">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {viewMode === 'featured'
                    ? extraT.viewFeatured
                    : viewMode === 'popular'
                    ? extraT.viewPopular
                    : t.catalog.categoryLabels[selectedCategory] || selectedCategory}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t.catalog.packageCountLabel(formatNumber(displayedTotalLabelCount))}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  id="cmtSortSelect"
                  className="st-select"
                  style={{ width: 'auto', minWidth: '170px', padding: '9px 14px' }}
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as CatalogSortMode)}
                  aria-label={t.catalog.sortLabel}
                >
                  <option value="popular">{extraT.sortPopular}</option>
                  <option value="featured">{extraT.sortFeatured}</option>
                  <option value="default">{t.catalog.sortDefault}</option>
                  <option value="name-asc">{t.catalog.sortAsc}</option>
                  <option value="name-desc">{t.catalog.sortDesc}</option>
                </select>

                {(search || selectedCategory !== 'Tümü' || viewMode !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('all');
                      setSelectedCategory('Tümü');
                      setSearch('');
                    }}
                    className="st-pill-btn is-outline is-sm"
                  >
                    {t.catalog.resetFilters}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className={`st-pill-btn is-sm ${cart.length > 0 ? 'is-ember' : 'is-light'}`}
                >
                  {t.catalog.myCartBtn} ({cart.length})
                </button>
              </div>
            </div>

            {displayedItems.length > 0 ? (
              <div className="st-product-grid">
                {displayedItems.map((item) => {
                  const inCart = cartIds.has(item.id);
                  const isFeatured = isFeaturedCatalogItem(item.id);
                  const popScore = getItemPopularityScore(item.id, clickCounts);
                  const intel = analyzeCatalogItem(item, locale);
                  const titleSegments = search.trim() ? splitTitleHighlight(item.title, search) : null;
                  const categoryDisplay = t.catalog.categoryLabels[item.category] || item.category;

                  return (
                    <article key={item.id} className="st-product-card spotlight-surface">
                      <div
                        className="st-product-visual"
                        onClick={() => {
                          trackItemClick(item);
                          setPreviewItem(item);
                        }}
                      >
                        <span className="st-product-sys-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {renderSystemIcon(intel.systemKey)}
                          </svg>
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {isFeatured && (
                            <span
                              className="st-product-badge"
                              style={{
                                background: 'rgba(114, 86, 206, 0.16)',
                                border: '1px solid rgba(220, 71, 202, 0.36)',
                                color: '#f5d0fe',
                              }}
                            >
                              ★ {extraT.featuredTag}
                            </span>
                          )}
                          <span className="st-product-badge">
                            {popScore > 0 ? `▲ ${formatNumber(popScore)}` : intel.roleLabel}
                          </span>
                        </div>
                      </div>

                      <div className="st-product-body">
                        <div className="st-product-meta">{categoryDisplay}</div>
                        <h3
                          className="st-product-title"
                          title={item.title}
                          onClick={() => {
                            trackItemClick(item);
                            setPreviewItem(item);
                          }}
                        >
                          {titleSegments
                            ? titleSegments.map((seg, i) =>
                                seg.match ? (
                                  <mark key={i} style={{ background: 'rgba(201,52,155,0.42)', color: '#fff', borderRadius: '4px', padding: '0 2px' }}>
                                    {seg.text}
                                  </mark>
                                ) : (
                                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                                )
                              )
                            : item.title}
                        </h3>

                        <div className="st-product-foot">
                          <div className="st-product-price">
                            {isDiscounted ? (
                              <>
                                <s style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: '5px' }}>100 TL</s>
                                <span style={{ color: 'var(--accent-coral)' }}>50 TL</span>
                              </>
                            ) : (
                              '100 TL'
                            )}
                          </div>

                          <div className="st-product-actions">
                            <button
                              type="button"
                              className={`st-btn-card-add ${inCart ? 'in-cart' : ''}`}
                              onClick={() => toggleCartItem(item)}
                              title={inCart ? t.catalog.removeFromCartTitle : t.catalog.addToCartTitle}
                            >
                              {inCart ? `✓ ${t.catalog.inCartBtn}` : `+ ${t.catalog.addToCartBtn}`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="st-area-card" style={{ textAlign: 'center', alignItems: 'center', padding: '48px 24px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 600 }}>
                  {search ? t.catalog.emptySearchTitle(search) : t.catalog.emptyCategoryTitle}
                </h3>
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                  {t.catalog.emptyDesc}
                </p>
                <Link href={DISCORD_INVITE} className="st-pill-btn is-light is-sm" style={{ marginTop: '18px' }}>
                  {t.catalog.requestCustomBtn}
                </Link>
              </div>
            )}

            {filteredItems.length > visibleCount && (
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
                <button type="button" className="st-pill-btn is-outline" onClick={handleLoadMore}>
                  {t.catalog.loadMoreBtn(PAGE_SIZE)} ({formatNumber(Math.min(visibleCount, filteredItems.length))} / {formatNumber(filteredItems.length)})
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          onClick={handleCloseGuideModal}
          className="st-modal-backdrop"
        >
          <div onClick={(e) => e.stopPropagation()} className="st-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ItemsatisLogo variant="icon" width={22} height={22} />
                <h2 id="guide-modal-title" style={{ fontSize: '19px', fontWeight: 700 }}>
                  {t.catalog.guideModalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseGuideModal}
                aria-label={t.common.close}
                className="st-circle-btn"
                style={{ width: '30px', height: '30px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t.catalog.guideModalSubtitle}
            </p>

            <ol style={{ listStyle: 'none', marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {t.catalog.guideSteps.map((s) => (
                <li key={s.n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span className="st-circle-btn" style={{ width: '26px', height: '26px', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                    {s.n}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{s.t}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={handleCopyTemplate}
              aria-label={t.catalog.templateCopyAria}
              style={{
                width: '100%',
                marginTop: '16px',
                textAlign: 'left',
                background: '#0f0e11',
                border: '1px solid var(--border-strong)',
                borderRadius: '14px',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--accent-coral)', marginBottom: '6px' }}>
                <span>{t.catalog.templateHeader}</span>
                <span>{templateCopied ? t.catalog.templateCopied : t.catalog.templateCopyHint}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {SAMPLE_INQUIRY}
              </div>
            </button>

            <button
              type="button"
              onClick={handleCloseGuideModal}
              className="st-pill-btn is-light is-full"
              style={{ marginTop: '16px' }}
            >
              {t.catalog.guideStartExploring}
            </button>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
              />
              <span>{t.catalog.guideDontShowToday}</span>
            </label>
          </div>
        </div>
      )}

      {cart.length > 0 && !isCartOpen && (
        <div className="st-floating-cart">
          <div style={{ cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '15px' }}>{formatNumber(finalTotal)} TL</strong>
              {isDiscounted && (
                <span className="st-product-badge" style={{ background: 'var(--accent-ember)', color: '#fff' }}>
                  {t.catalog.floatingDiscountTag}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {isDiscounted
                ? t.catalog.floatingHintActive
                : remainingForDiscount === 1
                ? t.catalog.floatingHintOneLeft
                : t.catalog.floatingHintRemaining(remainingForDiscount)}
            </div>
          </div>
          <button type="button" className="st-pill-btn is-light is-sm" onClick={() => setIsCartOpen(true)}>
            {t.catalog.floatingCheckoutBtn} ({cart.length}) →
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="st-modal-backdrop" style={{ justifyContent: 'flex-end', padding: 0 }} role="dialog" aria-modal="true" onClick={() => setIsCartOpen(false)}>
          <div className="st-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t.catalog.drawerTitle}</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.catalog.drawerSub(cart.length)}</span>
              </div>
              <button type="button" className="st-circle-btn" style={{ width: '30px', height: '30px' }} onClick={() => setIsCartOpen(false)} aria-label={t.common.close}>
                ✕
              </button>
            </div>

            <div style={{ padding: '14px 22px', background: isDiscounted ? 'rgba(243,106,120,0.16)' : 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-hairline)' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: isDiscounted ? 'var(--accent-coral)' : '#fff' }}>
                {isDiscounted ? t.catalog.drawerDiscountTitle : t.catalog.drawerCampaignTitle}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isDiscounted ? t.catalog.drawerDiscountDesc : t.catalog.drawerCampaignDesc(remainingForDiscount)}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontWeight: 600, color: '#fff' }}>{t.catalog.drawerEmptyTitle}</p>
                  <p style={{ fontSize: '12.5px', marginTop: '4px' }}>{t.catalog.drawerEmptyDesc}</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={item.id}
                    className="st-drawer-item"
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {idx + 1}. {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {isDiscounted ? '50 TL' : '100 TL'} · {t.catalog.categoryLabels[item.category] || item.category}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={t.catalog.drawerRemoveAria}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="st-drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>{t.catalog.summaryCountLabel}</span>
                  <span>{t.catalog.summaryCountVal(cart.length)}</span>
                </div>
                {isDiscounted && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent-coral)' }}>
                    <span>{t.catalog.summaryDiscountLabel}</span>
                    <strong>-{formatNumber(discountSavings)} TL</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 700 }}>
                  <span>{t.catalog.summaryTotalLabel}</span>
                  <span>{formatNumber(finalTotal)} TL</span>
                </div>

                <input
                  type="text"
                  value={shopierNote}
                  onChange={(e) => setShopierNote(e.target.value)}
                  placeholder={shopierT.notePlaceholder}
                  maxLength={200}
                  className="st-input"
                  style={{ fontSize: '12.5px', padding: '9px 12px' }}
                  aria-label={shopierT.notePlaceholder}
                />

                <p className="rs-shopier-sla-inline">{shopierT.slaNotice}</p>

                <ShopierCheckoutStatusBox
                  locale={locale}
                  redirectPath="/katalog"
                  requiresAuth={shopierRequiresAuth}
                  errorMessage={shopierError}
                  createdOrder={shopierOrder}
                  onClear={() => {
                    setShopierRequiresAuth(false);
                    setShopierError(null);
                    setShopierOrder(null);
                  }}
                />

                <button
                  type="button"
                  className="st-pill-btn is-shopier is-full"
                  onClick={() => void handleShopierCheckout()}
                  disabled={shopierLoading}
                >
                  <ShopierLogo width={18} height={18} />
                  <span>{shopierLoading ? shopierT.creatingListing : shopierT.payWithShopier}</span>
                </button>

                <button type="button" className="st-pill-btn is-itemsatis is-full" onClick={handleCheckout}>
                  <ItemsatisLogo variant="icon" width={18} height={18} />
                  <span>{shopierT.altItemsatis}</span>
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <button type="button" onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    {t.catalog.clearCartBtn}
                  </button>
                  <button type="button" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                    {t.catalog.continueCatalogBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {previewItem && (() => {
        const intel = analyzeCatalogItem(previewItem, locale);
        const compatText =
          intel.frameworks.length > 0 ? intel.frameworks.join(' · ') : extraT.openSourceSpec;

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            onClick={() => setPreviewItem(null)}
            className="st-modal-backdrop"
          >
            <div onClick={(e) => e.stopPropagation()} className="st-modal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span className="rs-store-cat">{extraT.previewTitle}</span>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  aria-label={t.common.close}
                  className="st-circle-btn"
                  style={{ width: '30px', height: '30px' }}
                >
                  ✕
                </button>
              </div>

              <h2 id="preview-modal-title" style={{ marginTop: '12px', fontSize: '20px', fontWeight: 700 }}>
                {previewItem.title}
              </h2>
              <p style={{ marginTop: '8px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {intel.summary}
              </p>

              <div
                style={{
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-hairline)',
                  fontSize: '12.5px',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{extraT.roleLabel}</div>
                  <strong>{intel.roleLabel}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{extraT.compatLabel}</div>
                  <strong>{compatText}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{extraT.previewCat}</div>
                  <strong>{t.catalog.categoryLabels[previewItem.category] || previewItem.category}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{extraT.previewClicks}</div>
                  <strong>▲ {formatNumber(getItemPopularityScore(previewItem.id, clickCounts))}</strong>
                </div>
              </div>

              <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`st-pill-btn ${cartIds.has(previewItem.id) ? 'is-ember' : 'is-light'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleCartItem(previewItem)}
                >
                  {cartIds.has(previewItem.id) ? `✓ ${t.catalog.inCartBtn}` : `+ ${t.catalog.addToCartBtn}`}
                </button>
                <button
                  type="button"
                  className="st-pill-btn is-outline is-sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(previewItem.title);
                      setPreviewCopied(true);
                      window.setTimeout(() => setPreviewCopied(false), 2000);
                    } catch {}
                  }}
                >
                  {previewCopied ? extraT.quickCopied : extraT.quickCopy}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toastMessage && <div className="st-toast">✓ {toastMessage}</div>}
    </div>
  );
}
