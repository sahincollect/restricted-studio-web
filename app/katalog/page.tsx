'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import catalogItems from '../../lib/catalog-data.json';
import ItemsatisLogo from '@/components/ItemsatisLogo';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';
import { getCatalogItemArtwork } from '@/lib/catalog-artwork';
import {
  FEATURED_BASELINE_CLICKS,
  getItemPopularityScore,
  isFeaturedCatalogItem,
} from '@/lib/catalog-featured';

type CatalogViewMode = 'all' | 'featured' | 'popular';
type CatalogSortMode = 'popular' | 'featured' | 'default' | 'name-asc' | 'name-desc';

interface CatalogItem {
  id: string;
  title: string;
  category: string;
  slug: string;
  source: string;
  status: string;
  image?: string;
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
  'Roxwood',
  'Gabz',
  'Qbox',
  'Soygun',
  'Polis',
  'GTR',
  'EUP',
];

const DISCORD_INVITE = '/discord';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';
const PAGE_SIZE = 60;

const UNIT_PRICE = 100; // TL per piece
const DISCOUNT_THRESHOLD = 15; // > 15 pieces triggers 50% discount
const DISCOUNT_PERCENT = 50;

const DEFAULT_STYLE = {
  from: '#080808',
  to: '#8B0000',
  icon: <rect x="4" y="4" width="16" height="16" rx="3" />,
};

const CATEGORY_STYLE: Record<string, { from: string; to: string; icon: React.ReactNode }> = {
  'Script & Sistemler': {
    from: '#080808',
    to: '#A50000',
    icon: (<><polyline points="8 6 3 12 8 18" /><polyline points="16 6 21 12 16 18" /><line x1="14" y1="4" x2="10" y2="20" /></>),
  },
  'MLO & Mekanlar': {
    from: '#0e0e0e',
    to: '#8B0000',
    icon: (<><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></>),
  },
  'Araç Paketleri': {
    from: '#450000',
    to: '#080808',
    icon: (<><path d="M5 17h14M3 13l2-6h14l2 6v4H3z" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /></>),
  },
  'Kıyafet & EUP': {
    from: '#080808',
    to: '#8B0000',
    icon: (<path d="M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z" />),
  },
  'Modlar & Eklentiler': {
    from: '#141414',
    to: '#A50000',
    icon: (<><path d="M12 2l9 5v10l-9 5-9-5V7z" /><polyline points="3 7 12 12 21 7" /><line x1="12" y1="12" x2="12" y2="22" /></>),
  },
  'Program & Araçlar': {
    from: '#080808',
    to: '#450000',
    icon: (<><rect x="3" y="4" width="18" height="13" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>),
  },
};

export default function CatalogPage() {
  const { locale, t, formatNumber, formatPercent } = useI18n();
  const extraT = INTERACTIVE_I18N[locale].catalogExtra;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('all');
  const [sortMode, setSortMode] = useState<CatalogSortMode>('popular');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Sync URL params (?q= / ?view=) and fetch live popularity counts
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('q');
      const viewParam = params.get('view');
      if (qParam) setSearch(qParam);
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

  // Cart local storage hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rs_catalog_cart');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          const idSet = new Set(ids);
          const restored = (catalogItems as CatalogItem[]).filter((item) => idSet.has(item.id));
          setCart(restored);
        }
      }
    } catch {
      // ignore
    }
    setCartHydrated(true);
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem('rs_catalog_cart', JSON.stringify(cart.map((c) => c.id)));
    } catch {
      // ignore
    }
  }, [cart, cartHydrated]);

  // Adjust body class when cart has items on mobile
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

  // Pre-index items for lightning-fast search (<2ms over 6400 items)
  const searchIndex = useMemo(() => {
    return (catalogItems as CatalogItem[]).map((item) => ({
      item,
      searchKey: `${item.title} ${item.category} ${item.id} ${item.slug}`.toLowerCase(),
    }));
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tümü: catalogItems.length };
    for (const item of catalogItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let entries = searchIndex;

    if (selectedCategory !== 'Tümü') {
      entries = entries.filter((e) => e.item.category === selectedCategory);
    }

    if (viewMode === 'featured') {
      entries = entries.filter((e) => isFeaturedCatalogItem(e.item.id));
    }

    if (q) {
      entries = entries.filter((e) => e.searchKey.includes(q));
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

  const topPopularStrip = useMemo(() => {
    return (catalogItems as CatalogItem[])
      .map((item) => ({
        item,
        score: getItemPopularityScore(item.id, clickCounts),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [clickCounts]);

  // Reset pagination when search, category, view or sort changes
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

  // Checkout: Copy ONLY item titles and redirect to Itemsatis
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

  return (
    <div className={`catalog-page-wrapper ${cart.length > 0 ? 'has-active-cart' : ''}`}>
      {/* =====================================================================
           GLOBAL NAV WITH OFFICIAL ITEMSATIS LOGO
           ===================================================================== */}
      <header className="global-nav" id="navbar">
        <div className="nav-container">
          <div className="nav-brand-wrap">
            <Link href="/" className="nav-brand" aria-label={`Restricted Studio ${t.common.home}`}>
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="nav-brand-logo" />
              <span className="nav-brand-text">RESTRICTED STUDIO</span>
            </Link>
            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-brand-trust"
              title={t.common.itemsatisOfficialStore}
            >
              <ItemsatisLogo variant="icon" width={12} height={12} />
              <span>{t.common.itemsatisTrust}</span>
            </a>
          </div>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="navMenu" aria-label={t.common.home}>
            <Link href="/" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {t.common.home}
            </Link>
            <Link
              href="/katalog"
              className="nav-item nav-item-active nav-katalog-shimmer"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.common.catalog}
            </Link>
            <Link href="/discord" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {t.common.discord}
            </Link>
            <Link href="/status" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {t.common.status}
            </Link>

            {/* Mobile Actions */}
            <div className="nav-mobile-actions">
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(240,240,240,0.65)' }}>
                  {t.common.langLabel.toUpperCase()}
                </span>
                <LanguageSwitcher compact />
              </div>
              <button
                type="button"
                className="btn btn-full"
                style={{ background: '#A50000', color: '#F0F0F0', border: '1.5px solid #F0F0F0', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}
              >
                {t.catalog.mobileMyCart(cart.length)}
              </button>
              <Link
                href="/dashboard"
                className="btn btn-full"
                style={{ background: '#080808', color: '#F0F0F0', border: '1.5px solid #F0F0F0', marginBottom: '8px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.catalog.mobilePortal}
              </Link>
              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-itemsatis btn-full"
                style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ItemsatisLogo variant="icon" width={18} height={18} />
                <span>{t.catalog.mobileItemsatis}</span>
              </a>
              <Link
                href={DISCORD_INVITE}
                className="btn btn-discord-solid btn-full"
                style={{ marginBottom: '8px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.catalog.mobileDiscord}
              </Link>
              <Link
                href="/status"
                className="btn btn-full"
                style={{ background: '#0e0e0e', color: '#F0F0F0', border: '1.5px solid rgba(240,240,240,0.3)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.catalog.mobileStatus}
              </Link>
            </div>
          </nav>

          <div className="nav-cta-group">
            <LanguageSwitcher compact className="bpn-lang-desktop" />

            {/* Header Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="nav-btn-cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: cart.length > 0 ? '#A50000' : '#080808',
                color: '#F0F0F0',
                border: '1.5px solid #F0F0F0',
                padding: '0 14px',
                height: '34px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              <span>{t.catalog.cartShort}</span>
              {cart.length > 0 && (
                <span style={{
                  backgroundColor: '#F0F0F0',
                  color: '#080808',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}>
                  {cart.length}
                </span>
              )}
            </button>

            {/* Official Itemsatis Header Button (Icon + Full Label) */}
            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-itemsatis"
              title={t.common.itemsatisStore}
              aria-label={t.common.itemsatisStore}
            >
              <ItemsatisLogo variant="icon" width={15} height={15} />
              <span>{t.common.itemsatisShort}</span>
            </a>

            {/* Discord Header Icon Link */}
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn nav-icon-discord"
              title={t.home.nav.discordTitle}
              aria-label={t.home.nav.discordTitle}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            <Link href="/dashboard" className="nav-btn-portal" id="navPortalBtn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{t.common.clientPortal}</span>
            </Link>

            <button
              className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              id="mobileToggle"
              aria-label={t.common.openMenu}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
           COMPACT HERO STRIP (Texture Preserved, Verbose Copy Removed)
           ===================================================================== */}
      <section className="catalog-hero-strip">
        <div className="container catalog-hero-strip-inner">
          <div className="chs-left">
            <div className="chs-pill">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c83232"
                strokeWidth="2.1"
                strokeLinecap="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="3.34" y1="7" x2="20.66" y2="17" />
                <line x1="20.66" y1="7" x2="3.34" y2="17" />
              </svg>
              <span>{t.catalog.eyebrow}</span>
            </div>
            <h1 className="chs-title">{t.catalog.title}</h1>
          </div>

          <div className="chs-right">
            <div className="chs-badges-row">
              <div className="chs-badge-item">
                <span className="chs-badge-num">{formatNumber(6400)}+</span>
                <span className="chs-badge-lbl">{t.catalog.badgeOpenSource}</span>
              </div>
              <div className="chs-badge-item">
                <span className="chs-badge-num">100 TL</span>
                <span className="chs-badge-lbl">{t.catalog.badgeUnitPrice}</span>
              </div>
              <div className="chs-badge-item">
                <span className="chs-badge-num">{formatPercent(50)}</span>
                <span className="chs-badge-lbl">{t.catalog.badgeDiscount}</span>
              </div>
            </div>

            <div className="chs-actions">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="chs-guide-btn"
              >
                <span>{t.catalog.orderGuideBtn}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
           2-COLUMN CATALOG LAYOUT (LEFT MENU SIDEBAR + RIGHT GRID)
           ===================================================================== */}
      <div className="container catalog-layout-wrapper">
        <div className="catalog-layout-grid">

          {/* =================================================================
               SIMPLIFIED LEFT SIDEBAR MENU
               ================================================================= */}
          <aside className={`catalog-sidebar-menu ${mobileFiltersOpen ? 'mobile-drawer-open' : ''}`}>
            <div className="catalog-sidebar-inner spotlight-surface">

              {/* Mobile Drawer Header */}
              <div className="sidebar-mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>☰</span>
                  <strong style={{ fontSize: '15px', color: '#F0F0F0' }}>{t.catalog.sidebarTitle}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="sidebar-close-btn"
                  aria-label={t.common.close}
                >
                  ✕
                </button>
              </div>

              {/* 1. Quick Search Box */}
              <div className="sb-section sb-search-section">
                <label className="sb-section-title" htmlFor="catalogSearchInput">{t.catalog.searchTitle}</label>
                <div className="sb-search-wrap">
                  <svg
                    className="sb-search-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="2.2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="catalogSearchInput"
                    type="text"
                    className="sb-search-input"
                    placeholder={t.catalog.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      className="sb-search-clear"
                      onClick={() => setSearch('')}
                      aria-label={t.catalog.searchClearAria}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Functional Views: All / Featured / Most Clicked */}
              <div className="sb-section">
                <span className="sb-section-title">{extraT.viewsLabel}</span>
                <div className="sb-cat-nav" role="group" aria-label={extraT.viewsLabel}>
                  <button
                    type="button"
                    className={`sb-cat-item ${viewMode === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('all');
                      setMobileFiltersOpen(false);
                    }}
                  >
                    <span className="sb-cat-label">{extraT.viewAll}</span>
                    <span className="sb-cat-pill">{formatNumber(catalogItems.length)}</span>
                  </button>
                  <button
                    type="button"
                    className={`sb-cat-item ${viewMode === 'featured' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('featured');
                      setSortMode('featured');
                      setMobileFiltersOpen(false);
                    }}
                  >
                    <span className="sb-cat-label">★ {extraT.viewFeatured}</span>
                    <span className="sb-cat-pill">{Object.keys(FEATURED_BASELINE_CLICKS).length}</span>
                  </button>
                  <button
                    type="button"
                    className={`sb-cat-item ${viewMode === 'popular' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('popular');
                      setSortMode('popular');
                      setMobileFiltersOpen(false);
                    }}
                  >
                    <span className="sb-cat-label">▲ {extraT.viewPopular}</span>
                  </button>
                </div>
              </div>

              {/* 3. Vertical Category Navigation Menu */}
              <div className="sb-section">
                <div className="sb-section-head">
                  <span className="sb-section-title">{t.catalog.categoriesTitle}</span>
                  <span className="sb-count-total">{formatNumber(catalogItems.length)}</span>
                </div>
                <nav className="sb-cat-nav" aria-label={t.catalog.categoriesTitle}>
                  {CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isActive = selectedCategory === cat;
                    const catLabel = t.catalog.categoryLabels[cat] || cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`sb-cat-item ${isActive ? 'active is-active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setMobileFiltersOpen(false);
                        }}
                      >
                        <span className="sb-cat-icon">
                          {cat === 'Tümü' ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {(CATEGORY_STYLE[cat] || DEFAULT_STYLE).icon}
                            </svg>
                          )}
                        </span>
                        <span className="sb-cat-label">{catLabel}</span>
                        <span className="sb-cat-pill">{formatNumber(count)}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* 4. Compact Progress Meter (Text Clutter Removed) */}
              <div className={`sb-campaign-card ${isDiscounted ? 'discount-active' : ''}`}>
                <div className="sbc-badge">
                  {isDiscounted ? t.catalog.campaignActiveBadge : t.catalog.campaignDefaultBadge}
                </div>
                <div className="sbc-body">
                  {!isDiscounted && (
                    <div className="sbc-progress-wrap">
                      <div className="sbc-progress-bar">
                        <div
                          className="sbc-progress-fill"
                          style={{ width: `${Math.min(100, (cart.length / 16) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="sbc-progress-hint">
                        {cart.length} / 16 · {t.catalog.badgeDiscount}
                      </span>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(true)}
                      className="sbc-open-cart-btn"
                    >
                      <span>{t.catalog.openCartWithTotal(formatNumber(finalTotal))}</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Toggleable Quick Tags */}
              <div className="sb-section">
                <span className="sb-section-title">{t.catalog.quickSearchTitle}</span>
                <div className="sb-tags-cloud">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`sb-tag-chip ${search === tag ? 'active' : ''}`}
                      onClick={() => {
                        setSearch((prev) => (prev === tag ? '' : tag));
                        setMobileFiltersOpen(false);
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Compact Links (Verbose Store Description Removed) */}
              <div className="sb-help-row">
                <a
                  href={ITEMSATIS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sb-help-link"
                >
                  {t.common.itemsatisShort} ↗
                </a>
                <Link href={DISCORD_INVITE} className="sb-help-link">
                  {t.common.discord} ↗
                </Link>
              </div>

            </div>
          </aside>

          {/* Backdrop for mobile drawer */}
          {mobileFiltersOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* =================================================================
               RIGHT MAIN CONTENT
               ================================================================= */}
          <main className="catalog-main-content">

            {/* Content Top Bar (Symmetrical Fixed Header Row) */}
            <div className="catalog-main-topbar">
              <div className="cmt-left">
                <h2 className="cmt-category-title">
                  <span>
                    {viewMode === 'featured'
                      ? extraT.viewFeatured
                      : viewMode === 'popular'
                      ? extraT.viewPopular
                      : t.catalog.categoryLabels[selectedCategory] || selectedCategory}
                  </span>
                  <span className="cmt-count-badge">
                    {t.catalog.packageCountLabel(formatNumber(filteredItems.length))}
                  </span>
                </h2>
              </div>

              <div className="cmt-right">
                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  className="cmt-mobile-filter-btn"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="4" y1="21" x2="4" y2="14"/>
                    <line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="3"/>
                    <line x1="20" y1="21" x2="20" y2="16"/>
                    <line x1="20" y1="12" x2="20" y2="3"/>
                    <line x1="1" y1="14" x2="7" y2="14"/>
                    <line x1="9" y1="8" x2="15" y2="8"/>
                    <line x1="17" y1="16" x2="23" y2="16"/>
                  </svg>
                  <span>{t.catalog.mobileMenuBtn}</span>
                </button>

                {/* Single Unified Sort Select */}
                <div className="cmt-sort-wrap">
                  <label htmlFor="cmtSortSelect" className="cmt-sort-label">{t.catalog.sortLabel}</label>
                  <select
                    id="cmtSortSelect"
                    className="cmt-sort-select"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as CatalogSortMode)}
                  >
                    <option value="popular">{extraT.sortPopular}</option>
                    <option value="featured">{extraT.sortFeatured}</option>
                    <option value="default">{t.catalog.sortDefault}</option>
                    <option value="name-asc">{t.catalog.sortAsc}</option>
                    <option value="name-desc">{t.catalog.sortDesc}</option>
                  </select>
                </div>

                {/* Cart Action Button in Header */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className={`cmt-cart-btn ${cart.length > 0 ? 'has-items' : ''}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  <span>{t.catalog.myCartBtn}</span>
                  <span className="cmt-cart-count">{cart.length}</span>
                </button>
              </div>
            </div>

            {/* Dedicated Active Filter Bar (Keeps Header Symmetrical & Cleanly Scannable) */}
            {(search || selectedCategory !== 'Tümü' || viewMode !== 'all') && (
              <div className="cmt-active-filters" role="region" aria-label={extraT.viewsLabel}>
                {viewMode !== 'all' && (
                  <span className="cmt-chip">
                    <span className="cmt-chip-text">
                      {viewMode === 'featured' ? `★ ${extraT.viewFeatured}` : `▲ ${extraT.viewPopular}`}
                    </span>
                    <button
                      type="button"
                      className="cmt-chip-remove"
                      onClick={() => setViewMode('all')}
                      aria-label={t.catalog.resetFilters}
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategory !== 'Tümü' && (
                  <span className="cmt-chip">
                    <span className="cmt-chip-text">
                      {t.catalog.categoryLabels[selectedCategory] || selectedCategory}
                    </span>
                    <button
                      type="button"
                      className="cmt-chip-remove"
                      onClick={() => setSelectedCategory('Tümü')}
                      aria-label={t.catalog.removeCategoryAria}
                    >
                      ✕
                    </button>
                  </span>
                )}
                {search && (
                  <span className="cmt-chip">
                    <span className="cmt-chip-text">&quot;{search}&quot;</span>
                    <button
                      type="button"
                      className="cmt-chip-remove"
                      onClick={() => setSearch('')}
                      aria-label={t.catalog.removeSearchAria}
                    >
                      ✕
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="cmt-chip-clear-all"
                  onClick={() => {
                    setViewMode('all');
                    setSelectedCategory('Tümü');
                    setSearch('');
                  }}
                >
                  {t.catalog.resetFilters}
                </button>
              </div>
            )}

            {/* Mobile Category Horizontal Scroll Strip */}
            <div className="catalog-mobile-cats-strip">
              <button
                type="button"
                className={`cm-cat-chip ${viewMode === 'featured' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode((prev) => (prev === 'featured' ? 'all' : 'featured'));
                  setSortMode('featured');
                }}
              >
                <span>★ {extraT.viewFeatured}</span>
              </button>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`cm-cat-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{t.catalog.categoryLabels[cat] || cat}</span>
                    <span className="cm-cat-badge">{categoryCounts[cat] || 0}</span>
                  </button>
                );
              })}
            </div>

            {/* =================================================================
                 MOST CLICKED / FEATURED SPOTLIGHT STRIP
                 ================================================================= */}
            {viewMode === 'all' && selectedCategory === 'Tümü' && !search && topPopularStrip.length > 0 && (
              <section className="catalog-popular-strip" aria-label={extraT.popularStripTitle}>
                <div className="cps-header">
                  <div className="cps-title-group">
                    <span className="cps-dot" />
                    <span className="cps-heading">{extraT.popularStripTitle}</span>
                    <span className="cps-sub">{extraT.popularStripSub}</span>
                  </div>
                  <button
                    type="button"
                    className="cps-view-all-btn"
                    onClick={() => {
                      setViewMode('popular');
                      setSortMode('popular');
                    }}
                  >
                    {extraT.viewPopular} →
                  </button>
                </div>

                <div className="cps-grid">
                  {topPopularStrip.map(({ item, score }, idx) => {
                    const inCart = cartIds.has(item.id);
                    const thumbSrc = getCatalogItemArtwork(item);
                    return (
                      <div
                        key={item.id}
                        className="cps-card spotlight-surface"
                        onClick={() => {
                          trackItemClick(item);
                          setPreviewItem(item);
                        }}
                      >
                        <div className="cps-card-thumb">
                          <img src={thumbSrc} alt={item.title} className="cps-card-thumb-img" loading="lazy" />
                          <div className="cps-card-top">
                            <span className="cps-rank">#{idx + 1}</span>
                            <span className="cps-clicks">
                              ▲ {formatNumber(score)} {extraT.clicksUnit}
                            </span>
                          </div>
                        </div>
                        <div className="cps-card-title" title={item.title}>
                          {item.title}
                        </div>
                        <div className="cps-card-foot">
                          <span className="cps-card-cat">
                            {t.catalog.categoryLabels[item.category] || item.category}
                          </span>
                          <button
                            type="button"
                            className={`cps-quick-add ${inCart ? 'is-added' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCartItem(item);
                            }}
                          >
                            {inCart ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================================
                 PRODUCT GRID
                 ================================================================= */}
            <div className="catalog-product-grid">
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => {
                  const inCart = cartIds.has(item.id);
                  const isVerified = item.source === 'restricted-verified';
                  const isFeatured = isFeaturedCatalogItem(item.id);
                  const popScore = getItemPopularityScore(item.id, clickCounts);
                  const coverSrc = getCatalogItemArtwork(item);

                  return (
                    <article key={item.id} className="catalog-card-v2 spotlight-surface">
                      <div
                        className="cc-card-top cc-clickable"
                        onClick={() => {
                          trackItemClick(item);
                          setPreviewItem(item);
                        }}
                      >
                        {/* Triadic Noir Illustrated Cover */}
                        <div className="cc-card-visual has-artwork">
                          <img
                            src={coverSrc}
                            alt={item.title}
                            className="cc-visual-art"
                            loading="lazy"
                          />
                          <div className="cc-visual-scrim" aria-hidden="true" />
                          <div className="cc-visual-top-row">
                            <span className="cc-visual-id">{item.id}</span>
                            {popScore > 0 && (
                              <span className="cc-visual-clicks">
                                ▲ {formatNumber(popScore)}
                              </span>
                            )}
                          </div>
                          <div className="cc-visual-bottom-meta">
                            <div className="cc-visual-badges-line">
                              {isFeatured && (
                                <span className="cc-visual-featured">★ {extraT.featuredTag}</span>
                              )}
                              {isVerified && !isFeatured && (
                                <span className="cc-visual-verified">{t.catalog.verifiedItemBadge}</span>
                              )}
                            </div>
                            <span className="cc-visual-cat">{t.catalog.categoryLabels[item.category] || item.category}</span>
                          </div>
                        </div>

                        {/* Product Title */}
                        <h3 className="cc-card-title" title={item.title}>
                          {item.title}
                        </h3>
                      </div>

                      {/* Card Bottom Row: Price & Buttons */}
                      <div className="cc-card-bottom">
                        <div className="cc-price-row">
                          <span className="cc-price-lbl">{t.catalog.priceLabel}</span>
                          <div className="cc-price-val">
                            {isDiscounted ? (
                              <>
                                <s className="cc-price-old">100 TL</s>
                                <span className="cc-price-new">50 TL</span>
                              </>
                            ) : (
                              <span className="cc-price-reg">100 TL</span>
                            )}
                          </div>
                        </div>

                        <div className="cc-btn-actions">
                          <button
                            type="button"
                            className={`cc-btn-add ${inCart ? 'is-in-cart' : ''}`}
                            onClick={() => toggleCartItem(item)}
                            title={inCart ? t.catalog.removeFromCartTitle : t.catalog.addToCartTitle}
                          >
                            {inCart ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{t.catalog.inCartBtn}</span>
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span>{t.catalog.addToCartBtn}</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={DISCORD_INVITE}
                            className="cc-btn-discord"
                            title={t.catalog.askDiscordTitle}
                            aria-label={t.catalog.askDiscordAria}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                /* Empty state */
                <div className="catalog-empty-card">
                  <svg className="catalog-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <h3 className="catalog-empty-title">
                    {search ? t.catalog.emptySearchTitle(search) : t.catalog.emptyCategoryTitle}
                  </h3>
                  <p className="catalog-empty-text">{t.catalog.emptyDesc}</p>
                  <Link
                    href={DISCORD_INVITE}
                    className="btn btn-discord-solid"
                    style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '10px' }}
                  >
                    {t.catalog.requestCustomBtn}
                  </Link>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredItems.length > visibleCount && (
              <div className="catalog-loadmore-wrap">
                <button type="button" className="catalog-loadmore-btn" onClick={handleLoadMore}>
                  <span>{t.catalog.loadMoreBtn(PAGE_SIZE)}</span>
                  <span className="loadmore-counter">
                    ({formatNumber(visibleCount)} / {formatNumber(filteredItems.length)})
                  </span>
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* =====================================================================
           FOOTER WITH OFFICIAL ITEMSATIS LOGO
           ===================================================================== */}
      <footer className="site-footer" style={{ marginTop: 'auto' }}>
        <div className="container">
          <div className="footer-columns">
            <div className="footer-brand-info">
              <div className="nav-brand">
                <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="nav-brand-logo" />
                <span className="nav-brand-text">RESTRICTED STUDIO</span>
              </div>
              <p className="footer-tagline">{t.catalog.footerTagline}</p>
              <div style={{ marginTop: '16px' }}>
                <a
                  href={ITEMSATIS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}
                >
                  <span style={{ fontSize: '12px', color: 'rgba(240, 240, 240, 0.72)' }}>{t.catalog.officialSalesLabel}</span>
                  <ItemsatisLogo variant="full" width={95} height={20} />
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>{t.catalog.footerSections}</h4>
              <ul>
                <li><Link href="/">{t.common.home}</Link></li>
                <li><Link href="/katalog">{t.catalog.footerCatalogLink}</Link></li>
                <li><Link href="/dashboard">{t.common.clientPortal}</Link></li>
                <li><Link href="/discord">{t.catalog.footerDiscordSupport}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t.catalog.footerCategories}</h4>
              <ul>
                <li><button type="button" onClick={() => setSelectedCategory('Script & Sistemler')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t.catalog.categoryLabels['Script & Sistemler']} ({formatNumber(3500)}+)</button></li>
                <li><button type="button" onClick={() => setSelectedCategory('MLO & Mekanlar')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t.catalog.categoryLabels['MLO & Mekanlar']} ({formatNumber(1200)}+)</button></li>
                <li><button type="button" onClick={() => setSelectedCategory('Araç Paketleri')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t.catalog.categoryLabels['Araç Paketleri']} ({formatNumber(1100)}+)</button></li>
                <li><button type="button" onClick={() => setSelectedCategory('Kıyafet & EUP')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}>{t.catalog.categoryLabels['Kıyafet & EUP']}</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t.catalog.footerOfficialChannels}</h4>
              <ul>
                <li>
                  <a href={ITEMSATIS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ItemsatisLogo variant="icon" width={14} height={14} />
                    <span>{t.home.modals.itemsatisLink}</span>
                  </a>
                </li>
                <li><Link href={DISCORD_INVITE}>{t.home.nav.discordTitle} ↗</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-legal">
            <p>{t.catalog.footerCopyright}</p>
            <p className="footer-note">{t.catalog.footerDisclaimer}</p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
           ORDER INSTRUCTIONS MODAL (WITH OFFICIAL ITEMSATIS LOGO)
           ===================================================================== */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          onClick={handleCloseGuideModal}
          className="guide-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="guide-modal-dialog"
          >
            <button
              type="button"
              onClick={handleCloseGuideModal}
              aria-label={t.common.close}
              className="guide-modal-close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ItemsatisLogo variant="icon" width={24} height={24} />
              <h2 id="guide-modal-title" style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                {t.catalog.guideModalTitle}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '0 0 20px', lineHeight: 1.5 }}>
              {t.catalog.guideModalSubtitle}
            </p>

            <ol style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {t.catalog.guideSteps.map((s) => (
                <li key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '0px', background: '#8B0000', border: '1px solid #F0F0F0', color: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                    {s.n}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#F0F0F0', marginBottom: '2px' }}>{s.t}</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(240, 240, 240, 0.72)', lineHeight: 1.5 }}>{s.d}</div>
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
                textAlign: 'left',
                backgroundColor: '#0e0e0e',
                border: '1px solid rgba(240, 240, 240, 0.25)',
                padding: '12px 14px',
                marginBottom: '14px',
                cursor: 'pointer',
                color: '#F0F0F0',
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', color: templateCopied ? '#F0F0F0' : '#A50000', marginBottom: '6px' }}>
                <span>{t.catalog.templateHeader}</span>
                <span>{templateCopied ? t.catalog.templateCopied : t.catalog.templateCopyHint}</span>
              </span>
              <span style={{ display: 'block', fontSize: '12.5px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {SAMPLE_INQUIRY}
              </span>
            </button>

            <p style={{ fontSize: '12px', color: 'rgba(240, 240, 240, 0.72)', lineHeight: 1.55, margin: '0 0 18px', paddingLeft: '10px', borderLeft: '2px solid #A50000' }}>
              <strong style={{ color: '#F0F0F0', fontWeight: 600 }}>{t.catalog.guideCampaignNoteLabel}</strong>{' '}
              {t.catalog.guideCampaignNoteBody}
            </p>

            <button
              type="button"
              onClick={handleCloseGuideModal}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                backgroundColor: '#A50000',
                color: '#F0F0F0',
                padding: '12px 20px',
                border: '1.5px solid #F0F0F0',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.catalog.guideStartExploring}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: 'rgba(240, 240, 240, 0.72)' }}>
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  style={{ accentColor: '#A50000', width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span>{t.catalog.guideDontShowToday}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
           FLOATING CART BAR
           ===================================================================== */}
      {cart.length > 0 && !isCartOpen && (
        <div className="catalog-floating-cart">
          <div className="floating-cart-inner">
            <div className="floating-cart-info" onClick={() => setIsCartOpen(true)}>
              <div className="cart-badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
                <span className="cart-count-pill">{cart.length}</span>
              </div>
              <div className="cart-text-details">
                <div className="cart-price-line">
                  <span className="cart-total-bold">{formatNumber(finalTotal)} TL</span>
                  {isDiscounted && <span className="discount-tag">{t.catalog.floatingDiscountTag}</span>}
                </div>
                <span className="cart-sub-hint">
                  {isDiscounted
                    ? t.catalog.floatingHintActive
                    : remainingForDiscount === 1
                    ? t.catalog.floatingHintOneLeft
                    : t.catalog.floatingHintRemaining(remainingForDiscount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-floating-checkout"
              onClick={() => setIsCartOpen(true)}
            >
              <span>{t.catalog.floatingCheckoutBtn}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
           CART DRAWER / MODAL (WITH OFFICIAL ITEMSATIS LOGO)
           ===================================================================== */}
      {isCartOpen && (
        <div
          className="cart-drawer-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="cart-header-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="cart-drawer-title">{t.catalog.drawerTitle}</h2>
                  <span className="cart-drawer-sub">{t.catalog.drawerSub(cart.length)}</span>
                </div>
              </div>
              <button
                type="button"
                className="cart-drawer-close"
                onClick={() => setIsCartOpen(false)}
                aria-label={t.common.close}
              >
                ✕
              </button>
            </div>

            {/* Campaign Banner in Drawer */}
            <div className={`cart-campaign-box ${isDiscounted ? 'active' : ''}`}>
              {isDiscounted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>{formatPercent(50)}</span>
                  <div>
                    <strong style={{ color: '#F0F0F0', fontSize: '13px' }}>{t.catalog.drawerDiscountTitle}</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(240, 240, 240, 0.85)' }}>{t.catalog.drawerDiscountDesc}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#A50000' }}>◆</span>
                  <div>
                    <strong style={{ color: '#F0F0F0', fontSize: '13px' }}>{t.catalog.drawerCampaignTitle}</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(240, 240, 240, 0.72)' }}>
                      {t.catalog.drawerCampaignDesc(remainingForDiscount)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Item List */}
            <div className="cart-item-list">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(240, 240, 240, 0.45)" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#F0F0F0', margin: '12px 0 4px' }}>{t.catalog.drawerEmptyTitle}</p>
                  <span style={{ fontSize: '12.5px', color: 'rgba(240, 240, 240, 0.72)' }}>{t.catalog.drawerEmptyDesc}</span>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.id} className="cart-item-row">
                    <span className="cart-item-index">{idx + 1}</span>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.title}</span>
                      <div className="cart-item-tags">
                        <span className="cart-item-id">{item.id}</span>
                        <span className="cart-item-category">{t.catalog.categoryLabels[item.category] || item.category}</span>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-price">
                        {isDiscounted ? (
                          <>
                            <s style={{ color: 'rgba(240, 240, 240, 0.48)', fontSize: '11px', marginRight: '4px' }}>100 TL</s>
                            <strong style={{ color: '#A50000', background: '#F0F0F0', padding: '1px 4px' }}>50 TL</strong>
                          </>
                        ) : (
                          <strong>100 TL</strong>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-remove-btn"
                        title={t.catalog.drawerRemoveTitle}
                        aria-label={t.catalog.drawerRemoveAria}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout with official Itemsatis Logo */}
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-breakdown">
                  <div className="summary-row">
                    <span>{t.catalog.summaryCountLabel}</span>
                    <span>{t.catalog.summaryCountVal(cart.length)}</span>
                  </div>
                  <div className="summary-row">
                    <span>{t.catalog.summaryUnitLabel}</span>
                    <span>
                      {isDiscounted ? (
                        <>
                          <s style={{ color: 'rgba(240, 240, 240, 0.48)', marginRight: '6px' }}>100 TL</s>
                          <span style={{ color: '#F0F0F0', background: '#A50000', padding: '1px 5px', fontWeight: 700 }}>50 TL</span>
                        </>
                      ) : (
                        '100 TL'
                      )}
                    </span>
                  </div>
                  {isDiscounted && (
                    <div className="summary-row discount">
                      <span>{t.catalog.summaryDiscountLabel}</span>
                      <span style={{ color: '#A50000', fontWeight: 700 }}>-{formatNumber(discountSavings)} TL</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>{t.catalog.summaryTotalLabel}</span>
                    <span className="total-amount">{formatNumber(finalTotal)} TL</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <ItemsatisLogo variant="icon" width={20} height={20} />
                  <span>{t.catalog.checkoutBtn}</span>
                </button>

                <p className="cart-checkout-note">
                  ℹ️ {t.catalog.checkoutNoteBefore} <strong>{cart.length}</strong> {t.catalog.checkoutNoteMiddle}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={clearCart}
                  >
                    {t.catalog.clearCartBtn}
                  </button>
                  <button
                    type="button"
                    className="cart-continue-btn"
                    onClick={() => setIsCartOpen(false)}
                  >
                    {t.catalog.continueCatalogBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
           PACKAGE QUICK-PREVIEW MODAL
           ===================================================================== */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          onClick={() => setPreviewItem(null)}
          className="guide-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="guide-modal-dialog catalog-preview-dialog"
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              aria-label={t.common.close}
              className="guide-modal-close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="cpm-cover-wrap">
              <img
                src={getCatalogItemArtwork(previewItem)}
                alt={previewItem.title}
                className="cpm-cover-img"
              />
            </div>

            <div className="cpm-badge-row">
              <span className="cpm-kicker">{extraT.previewTitle}</span>
              {isFeaturedCatalogItem(previewItem.id) && (
                <span className="cc-visual-featured">★ {extraT.featuredTag}</span>
              )}
              {previewItem.source === 'restricted-verified' && (
                <span className="cc-visual-verified">{t.catalog.verifiedItemBadge}</span>
              )}
            </div>

            <h2 id="preview-modal-title" className="cpm-title">
              {previewItem.title}
            </h2>

            <dl className="catalog-preview-meta">
              <div className="cpm-meta-cell">
                <dt>{extraT.previewId}</dt>
                <dd>{previewItem.id}</dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{extraT.previewCat}</dt>
                <dd>{t.catalog.categoryLabels[previewItem.category] || previewItem.category}</dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{extraT.previewClicks}</dt>
                <dd>
                  ▲ {formatNumber(getItemPopularityScore(previewItem.id, clickCounts))} {extraT.clicksUnit}
                </dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{extraT.previewStatus}</dt>
                <dd>{previewItem.status || 'Active'}</dd>
              </div>
            </dl>

            <div className="cpm-actions">
              <button
                type="button"
                className={`cc-btn-add ${cartIds.has(previewItem.id) ? 'is-in-cart' : ''}`}
                onClick={() => toggleCartItem(previewItem)}
              >
                {cartIds.has(previewItem.id) ? `✓ ${t.catalog.inCartBtn}` : `+ ${t.catalog.addToCartBtn}`}
              </button>

              <button
                type="button"
                className="cpm-copy-btn"
                onClick={async () => {
                  let ok = false;
                  try {
                    if (navigator?.clipboard?.writeText) {
                      await navigator.clipboard.writeText(previewItem.title);
                      ok = true;
                    }
                  } catch {
                    ok = false;
                  }
                  if (ok) {
                    setPreviewCopied(true);
                    window.setTimeout(() => setPreviewCopied(false), 2200);
                  }
                }}
              >
                {previewCopied ? `✓ ${extraT.quickCopied}` : extraT.quickCopy}
              </button>

              <Link
                href={DISCORD_INVITE}
                className="cpm-discord-btn"
                aria-label={t.catalog.askDiscordAria}
              >
                {t.common.discord} ↗
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
           TOAST NOTIFICATION
           ===================================================================== */}
      {toastMessage && (
        <div className="catalog-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
