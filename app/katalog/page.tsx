'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import catalogItems from '../../lib/catalog-data.json';

interface CatalogItem {
  id: string;
  title: string;
  category: string;
  slug: string;
  source: string;
  status: string;
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

const DISCORD_INVITE = '/discord';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';
const ITEMSATIS_LISTING_URL = 'https://www.itemsatis.com/p/saintstudio';
const PAGE_SIZE = 60;

const UNIT_PRICE = 100; // TL per piece
const DISCOUNT_THRESHOLD = 15; // > 15 pieces triggers 50% discount
const DISCOUNT_PERCENT = 50;

const DEFAULT_STYLE = {
  from: '#0b1a33',
  to: '#12306b',
  icon: <rect x="4" y="4" width="16" height="16" rx="3" />,
};

const CATEGORY_STYLE: Record<string, { from: string; to: string; icon: React.ReactNode }> = {
  'Script & Sistemler': {
    from: '#0b1a33',
    to: '#154a9c',
    icon: (<><polyline points="8 6 3 12 8 18" /><polyline points="16 6 21 12 16 18" /><line x1="14" y1="4" x2="10" y2="20" /></>),
  },
  'MLO & Mekanlar': {
    from: '#0c2a36',
    to: '#14708f',
    icon: (<><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></>),
  },
  'Araç Paketleri': {
    from: '#141b33',
    to: '#2d4a9a',
    icon: (<><path d="M5 17h14M3 13l2-6h14l2 6v4H3z" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /></>),
  },
  'Kıyafet & EUP': {
    from: '#1b1936',
    to: '#4a3f9c',
    icon: (<path d="M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z" />),
  },
  'Modlar & Eklentiler': {
    from: '#0d2236',
    to: '#1d63a6',
    icon: (<><path d="M12 2l9 5v10l-9 5-9-5V7z" /><polyline points="3 7 12 12 21 7" /><line x1="12" y1="12" x2="12" y2="22" /></>),
  },
  'Program & Araçlar': {
    from: '#131a24',
    to: '#33465f',
    icon: (<><rect x="3" y="4" width="18" height="13" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>),
  },
};

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CatalogItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check 24-hour persistence for the order guide modal
  useEffect(() => {
    try {
      const hideUntil = localStorage.getItem('rs_hide_order_guide_until');
      if (hideUntil) {
        const expiry = parseInt(hideUntil, 10);
        if (!isNaN(expiry) && Date.now() < expiry) {
          return;
        }
      }
    } catch {
      // ignore storage errors
    }
    setShowGuideModal(true);
  }, []);

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
      // ignore storage errors
    }
    setCartHydrated(true);
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem('rs_catalog_cart', JSON.stringify(cart.map((c) => c.id)));
    } catch {
      // ignore storage errors
    }
  }, [cart, cartHydrated]);

  const handleCloseGuideModal = () => {
    if (dontShowToday) {
      try {
        localStorage.setItem(
          'rs_hide_order_guide_until',
          String(Date.now() + 24 * 60 * 60 * 1000)
        );
      } catch {
        // ignore storage errors
      }
    }
    setShowGuideModal(false);
  };

  const SAMPLE_INQUIRY =
    'Merhaba, İtemsatış üzerinden sipariş vermek istiyorum:\nPaketler:\n[Paket İsimlerini Buraya Yapıştırın]\nStok, güncellik ve fiyat teyidi alabilir miyim?';

  const handleCopyTemplate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(SAMPLE_INQUIRY);
    }
    setTemplateCopied(true);
    setTimeout(() => {
      setTemplateCopied(false);
    }, 3000);
  };

  // Compute category counts across all 6,400+ items
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tümü: catalogItems.length };
    for (const item of catalogItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (catalogItems as CatalogItem[]).filter((item) => {
      const matchCat =
        selectedCategory === 'Tümü' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const catMatch = item.category.toLowerCase().includes(query);
      const idMatch = item.id.toLowerCase().includes(query);
      const slugMatch = item.slug.toLowerCase().includes(query);

      return titleMatch || catMatch || idMatch || slugMatch;
    });
  }, [search, selectedCategory]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory]);

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
    setCart((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item];
    });
    triggerToast(`"${item.title}" sepete eklendi.`);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCartItem = (item: CatalogItem) => {
    if (cartIds.has(item.id)) {
      removeFromCart(item.id);
      triggerToast(`"${item.title}" sepetten çıkarıldı.`);
    } else {
      addToCart(item);
    }
  };

  const clearCart = () => {
    setCart([]);
    triggerToast('Sepetiniz temizlendi.');
  };

  // Checkout: Copy ONLY item titles and redirect to Itemsatis
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Yalnızca paket isimleri kopyalanır
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
        ? `${cart.length} paket ismi kopyalandı! İtemsatış açılıyor...`
        : 'İtemsatış mağazamıza aktarılıyorsunuz...'
    );

    setTimeout(() => {
      window.open(ITEMSATIS_URL, '_blank', 'noopener,noreferrer');
    }, 700);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* =====================================================================
           MINIMALIST FROSTED GLASS NAV
           ===================================================================== */}
      <header className="global-nav" id="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-brand" aria-label="Restricted Studio Ana Sayfa">
            <img src="/assets/Restricted.jpg" alt="Restricted Studio" className="nav-brand-logo" />
            <span className="nav-brand-text">Restricted Studio</span>
          </Link>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="navMenu" aria-label="Ana Menü">
            <Link href="/#hikayemiz" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              Biz Kimiz
            </Link>
            <Link
              href="/katalog"
              className="nav-item"
              style={{ color: 'var(--crimson)', fontWeight: 700 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Katalog
            </Link>
            <Link
              href={DISCORD_INVITE}
              className="nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              İletişime Geçin
            </Link>

            {/* Mobile Actions */}
            <div className="nav-mobile-actions">
              <button
                type="button"
                className="btn btn-full"
                style={{ background: '#0071e3', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}
              >
                🛒 Sepetim ({cart.length} Paket)
              </button>
              <Link
                href="/dashboard"
                className="btn btn-full"
                style={{ background: '#0d0d10', color: '#ffffff', marginBottom: '8px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Müşteri Portalı &amp; Lisanslarım
              </Link>
              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-itemsatis btn-full"
                style={{ marginBottom: '8px' }}
              >
                İtemsatış Mağazası
              </a>
              <Link
                href={DISCORD_INVITE}
                className="btn btn-discord-solid btn-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişime Geçin (Discord)
              </Link>
            </div>
          </nav>

          <div className="nav-cta-group">
            {/* Header Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="nav-btn-cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: cart.length > 0 ? '#0071e3' : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid ' + (cart.length > 0 ? '#0071e3' : 'rgba(255, 255, 255, 0.1)'),
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              <span>Sepet</span>
              {cart.length > 0 && (
                <span style={{
                  backgroundColor: '#ffffff',
                  color: '#0071e3',
                  borderRadius: '999px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}>
                  {cart.length}
                </span>
              )}
            </button>

            <Link href="/dashboard" className="nav-btn-portal" id="navPortalBtn">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ marginRight: '6px' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Müşteri Portalı
            </Link>
            <Link
              href={DISCORD_INVITE}
              className="nav-btn-secondary"
            >
              İletişime Geçin
            </Link>
            <button
              className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              id="mobileToggle"
              aria-label="Menüyü Aç/Kapat"
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
           HERO: Compact Header & Campaign Bar
           ===================================================================== */}
      <section className="catalog-hero">
        <div className="container catalog-hero-inner">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p className="catalog-eyebrow">Paket Kataloğu</p>
              <h1 className="catalog-title">FiveM Arşivi</h1>
              <p className="catalog-subtitle">
                {catalogItems.length.toLocaleString('tr-TR')} paket. Sepete ekleyin, tek tıkla İtemsatış üzerinden teslim alın.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="catalog-guide-link"
                style={{
                  backgroundColor: cart.length > 0 ? 'rgba(0, 113, 227, 0.15)' : 'transparent',
                  borderColor: cart.length > 0 ? '#0071e3' : undefined,
                  color: cart.length > 0 ? '#38bdf8' : undefined,
                }}
              >
                🛒 Sepet ({cart.length})
              </button>
              <button type="button" onClick={() => setShowGuideModal(true)} className="catalog-guide-link">
                Sipariş Yönergesi
              </button>
            </div>
          </div>

          {/* Campaign Notice Box */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px 20px',
              borderRadius: '14px',
              background: isDiscounted
                ? 'linear-gradient(135deg, #06261a 0%, #0c4d34 100%)'
                : 'linear-gradient(135deg, #081d3d 0%, #0e3778 100%)',
              border: isDiscounted ? '1.5px solid #10b981' : '1.5px solid #0071e3',
              boxShadow: isDiscounted
                ? '0 8px 24px rgba(16, 185, 129, 0.25)'
                : '0 8px 28px rgba(0, 113, 227, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: isDiscounted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 113, 227, 0.3)',
                  border: isDiscounted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(0, 113, 227, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                {isDiscounted ? '🎉' : '🏷️'}
              </div>
              <div style={{ fontSize: '13.5px', color: '#ffffff', lineHeight: 1.5 }}>
                <strong style={{ color: isDiscounted ? '#34d399' : '#60a5fa', fontWeight: 800, marginRight: '6px' }}>
                  Parça Başı 100 TL Kampanyası:
                </strong>
                {isDiscounted ? (
                  <span>
                    15 adetten fazla ürün seçtiniz, <strong style={{ color: '#34d399', textDecoration: 'underline' }}>%50 İndirim</strong> aktif! (Paket başı 50 TL)
                  </span>
                ) : (
                  <span>
                    Tüm paketler parça başı <strong style={{ color: '#ffffff' }}>100 TL</strong>. Sepetinize <strong style={{ color: '#93c5fd' }}>15&apos;ten fazla ürün</strong> (16+) eklerseniz tüm sepetinizde anında <strong style={{ color: '#60a5fa' }}>%50 İndirim</strong> tanımlanır!
                    {cart.length > 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(0, 113, 227, 0.45)',
                          border: '1px solid #38bdf8',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {remainingForDiscount} ürün sonra %50 indirim
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                style={{
                  backgroundColor: '#0071e3',
                  color: '#ffffff',
                  border: '1px solid #60a5fa',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span>Sepeti Gör ({finalTotal.toLocaleString('tr-TR')} TL)</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
           SEARCH & CATEGORY FILTERS
           ===================================================================== */}
      <div className="catalog-controls">
        <div className="catalog-search-card">
          <div className="catalog-search-wrap">
            <svg
              className="catalog-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="catalog-search-input"
              placeholder="6.400+ paket içinde arayın... (Örn: LB Phone, JG Mechanic, Roxwood, Heist, EUP, Audi)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="catalog-search-clear"
                onClick={() => setSearch('')}
                aria-label="Aramayı Temizle"
              >
                ✕
              </button>
            )}
          </div>

          <div className="catalog-category-bar">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  className={`catalog-cat-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="catalog-cat-count">{count.toLocaleString('tr-TR')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
           STATUS BAR
           ===================================================================== */}
      <div className="catalog-statusbar">
        <div className="catalog-result-count">
          Toplam <strong>{filteredItems.length.toLocaleString('tr-TR')}</strong> paket bulundu
          {filteredItems.length > visibleCount && ` (İlk ${visibleCount} gösteriliyor)`}
          {selectedCategory !== 'Tümü' && ` · ${selectedCategory}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12.5px', color: '#a1a1aa' }}>Parça başı 100 TL • 15+ pakette %50 indirim</span>
          <span style={{ color: '#0071e3', fontWeight: 600 }}>• İtemsatış ile teslimat</span>
        </div>
      </div>

      {/* =====================================================================
           CARD GRID
           ===================================================================== */}
      <main className="catalog-grid">
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => {
            const inCart = cartIds.has(item.id);
            const isVerified = item.source === 'restricted-verified';

            return (
              <div key={item.id} className="catalog-card">
                <div>
                  <div
                    className="catalog-card-visual"
                    style={{ background: `linear-gradient(135deg, ${(CATEGORY_STYLE[item.category] || DEFAULT_STYLE).from}, ${(CATEGORY_STYLE[item.category] || DEFAULT_STYLE).to})` }}
                  >
                    <span className="catalog-visual-id">{item.id}</span>
                    {isVerified && <span className="catalog-visual-verified">Doğrulanmış</span>}
                    <svg className="catalog-visual-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      {(CATEGORY_STYLE[item.category] || DEFAULT_STYLE).icon}
                    </svg>
                    <span className="catalog-visual-cat">{item.category}</span>
                  </div>

                  <h3 className="catalog-card-title">{item.title}</h3>
                </div>

                <div className="catalog-card-footer">
                  <button
                    className={`btn-demand ${inCart ? 'in-cart' : ''}`}
                    onClick={() => toggleCartItem(item)}
                    title={inCart ? 'Sepetten çıkar' : 'Sepete ekle'}
                    style={{
                      backgroundColor: inCart ? 'rgba(16, 185, 129, 0.15)' : '#0071e3',
                      color: inCart ? '#34d399' : '#ffffff',
                      border: inCart ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                    }}
                  >
                    {inCart ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Sepette (Çıkar)</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Sepete Ekle (100 TL)</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={DISCORD_INVITE}
                    className="btn-inquire"
                    title="Discord'da Bu Paket Hakkında Soru Sor"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="catalog-empty-card">
            <svg
              className="catalog-empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <h3 className="catalog-empty-title">&quot;{search}&quot; ile eşleşen paket bulunamadı</h3>
            <p className="catalog-empty-text">
              Aradığınız paket henüz kataloğumuza eklenmemiş olabilir. Aradığınız paket adını veya FiveM / CFX forum linkini bize Discord üzerinden iletin; aynı gün arşivimizden tarayıp temizleyerek sizin için özel hazırlayalım.
            </p>
            <Link
              href={DISCORD_INVITE}
              className="btn btn-discord-solid"
              style={{ display: 'inline-flex', padding: '12px 24px' }}
            >
              Özel Paket Talebi Aç (Discord)
            </Link>
          </div>
        )}

        {/* Load More Button */}
        {filteredItems.length > visibleCount && (
          <div className="catalog-loadmore-wrap">
            <button className="catalog-loadmore-btn" onClick={handleLoadMore}>
              <span>Daha Fazla Paket Yükle (+{PAGE_SIZE})</span>
              <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                ({visibleCount} / {filteredItems.length.toLocaleString('tr-TR')})
              </span>
            </button>
          </div>
        )}
      </main>

      {/* =====================================================================
           NASIL ÇALIŞIR? WORKFLOW
           ===================================================================== */}
      <section className="catalog-workflow">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <p className="section-eyebrow">İşleyiş Standartlarımız</p>
            <h2 className="section-title">Katalogdan Teslimata: 3 Adım.</h2>
            <p className="section-description">
              Tüm paketleri körü körüne satmak yerine, talep ettiğiniz paketi anında optimize edip teslim ediyoruz.
            </p>
          </div>

          <div className="catalog-workflow-grid">
            <div className="catalog-step-box">
              <span className="catalog-step-number">1</span>
              <h3 className="catalog-step-title">Sepete Ekleyin</h3>
              <p className="catalog-step-desc">
                6.400&apos;den fazla paket arasından arama yaparak sunucunuza eklemek istediğiniz script veya MLO&apos;ları sepete toplayın.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">2</span>
              <h3 className="catalog-step-title">Satın Al &amp; İtemsatış&apos;a İletin</h3>
              <p className="catalog-step-desc">
                Sepetten <strong>Satın Al</strong> butonuna bastığınızda seçtiğiniz paket isimleri otomatik kopyalanır ve resmi İtemsatış mağazamıza aktarılırsınız.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">3</span>
              <h3 className="catalog-step-title">Temiz &amp; Açık Kaynak Teslimat</h3>
              <p className="catalog-step-desc">
                Paketleriniz güvenlik denetimlerinden geçirilir, 3D Secure güvencesiyle temiz kod olarak adınıza teslim edilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
           BOTTOM CTA BANNER
           ===================================================================== */}
      <div className="container">
        <div className="catalog-cta-banner">
          <h2 className="catalog-cta-headline">Aradığınız Paketi Listede Bulamadınız mı?</h2>
          <p className="catalog-cta-lead">
            CFX Portal, Tebex veya yurt dışı platformlarda gördüğünüz herhangi bir paketin adını ya da linkini bize iletin. Geniş arşivimizden temin edip sıfır riskle hazırlayalım.
          </p>
          <div className="catalog-cta-btn-row">
            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-itemsatis"
              style={{ padding: '12px 28px' }}
            >
              İtemsatış Mağazasından İletişime Geç ↗
            </a>
            <Link
              href={DISCORD_INVITE}
              className="btn btn-discord-solid"
              style={{ padding: '12px 28px' }}
            >
              Discord Destek Talebi Aç ↗
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
           FOOTER
           ===================================================================== */}
      <footer className="site-footer" style={{ marginTop: 'auto' }}>
        <div className="container">
          <div className="footer-columns">
            <div className="footer-brand-info">
              <div className="nav-brand">
                <img src="/assets/Restricted.jpg" alt="Restricted Studio" className="nav-brand-logo" />
                <span className="nav-brand-text">Restricted Studio</span>
              </div>
              <p className="footer-tagline">
                FiveM Türkiye ekosistemi için sade, güvenli ve yüksek performanslı yazılım ve altyapı çözümleri.
              </p>
            </div>

            <div className="footer-col">
              <h4>Bölümler</h4>
              <ul>
                <li><Link href="/#hikayemiz">Biz Kimiz</Link></li>
                <li><Link href="/katalog">Paket Kataloğu</Link></li>
                <li><Link href="/dashboard">Müşteri Portalı</Link></li>
                <li><Link href="/#standartlar">Mühendislik Standartları</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Kategoriler</h4>
              <ul>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Script & Sistemler')}>Script &amp; Sistemler (3.500+)</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('MLO & Mekanlar')}>MLO &amp; Mekanlar (1.200+)</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Araç Paketleri')}>Araç Paketleri (1.100+)</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Kıyafet & EUP')}>Kıyafet &amp; EUP</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Resmi Kanallar</h4>
              <ul>
                <li><a href={ITEMSATIS_URL} target="_blank" rel="noopener noreferrer">İtemsatış Mağazası ↗</a></li>
                <li><Link href={DISCORD_INVITE}>Discord Topluluğu ↗</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-legal">
            <p>Telif Hakkı © 2026 Restricted Studio. Tüm hakları saklıdır.</p>
            <p className="footer-note">
              Restricted Studio; Rockstar Games, Take-Two Interactive veya CitizenFX Collective ile bağlantılı değildir. Tüm katalog içeriği talep üzerine güvenlik denetimi yapılarak sağlanmaktadır.
            </p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
           ORDER INSTRUCTIONS MODAL (POP-UP)
           ===================================================================== */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          onClick={handleCloseGuideModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 5, 8, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overscrollBehavior: 'contain',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#0a0a0c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '2px solid #0071e3',
              borderRadius: '16px',
              padding: '28px 28px 22px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
              position: 'relative',
              color: '#fafafa',
              fontFamily: 'var(--font-sans)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <button
              type="button"
              onClick={handleCloseGuideModal}
              aria-label="Kapat"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 id="guide-modal-title" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 6px' }}>
              Sipariş Yönergesi
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '0 0 22px', lineHeight: 1.5 }}>
              Siparişiniz üç basit adımda tamamlanır.
            </p>

            <ol style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { n: '1', t: 'Paketlerini Belirle', d: 'Katalogdan istediğiniz paketleri "Sepete Ekle" butonuyla sepetinize toplayın.' },
                { n: '2', t: 'İtemsatış\'tan Yaz', d: 'Sepetten "Satın Al" butonuna bastığınızda seçtiğiniz tüm paket isimleri panonuza kopyalanır. Mağazamızda satıcıya iletin.' },
                { n: '3', t: 'Anında Teslim Al', d: 'Ekibimiz listeyi teyit edince adınıza güvenli sipariş açılır; dosyalarınızı hemen teslim alırsınız.' },
              ].map((s) => (
                <li key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(0, 113, 227, 0.6)', color: '#4da3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                    {s.n}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{s.t}</div>
                    <div style={{ fontSize: '12.5px', color: '#a1a1aa', lineHeight: 1.5 }}>{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={handleCopyTemplate}
              aria-label="Mesaj şablonunu kopyala"
              style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '14px',
                cursor: 'pointer',
                color: '#d4d4d8',
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: templateCopied ? '#34d399' : '#4da3ff', marginBottom: '6px' }}>
                <span>ÖRNEK MESAJ ŞABLONU</span>
                <span>{templateCopied ? 'Kopyalandı' : 'Kopyalamak için tıklayın'}</span>
              </span>
              <span style={{ display: 'block', fontSize: '12.5px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {SAMPLE_INQUIRY}
              </span>
            </button>

            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.55, margin: '0 0 18px', paddingLeft: '10px', borderLeft: '2px solid rgba(0, 113, 227, 0.7)' }}>
              <strong style={{ color: '#e4e4e7', fontWeight: 600 }}>Not:</strong> Paketler parça başı 100 TL&apos;dir. 15&apos;ten fazla ürün eklediğinizde sepette %50 indirim uygulanır. Teyitsiz alımlar işleme alınamaz.
            </p>

            <button
              type="button"
              onClick={handleCloseGuideModal}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                backgroundColor: '#0071e3',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kataloğa Devam Et
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: '#71717a' }}>
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  style={{ accentColor: '#0071e3', width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span>Bugün tekrar gösterme</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
           FLOATING CART BAR (Fixed at bottom when cart has items)
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
                  <span className="cart-total-bold">{finalTotal.toLocaleString('tr-TR')} TL</span>
                  {isDiscounted && <span className="discount-tag">%50 İndirim</span>}
                </div>
                <span className="cart-sub-hint">
                  {isDiscounted
                    ? 'Kampanya aktif (Paket başı 50 TL)'
                    : remainingForDiscount === 1
                    ? 'Sadece 1 paket daha ekle, %50 indirimi kap!'
                    : `${remainingForDiscount} paket sonra %50 indirim!`}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-floating-checkout"
              onClick={() => setIsCartOpen(true)}
            >
              <span>Sepeti İncele &amp; Satın Al</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
           CART DRAWER / MODAL
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
            {/* Drawer Header */}
            <div className="cart-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="cart-header-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="cart-drawer-title">Sepetim</h2>
                  <span className="cart-drawer-sub">{cart.length} paket seçildi</span>
                </div>
              </div>
              <button
                type="button"
                className="cart-drawer-close"
                onClick={() => setIsCartOpen(false)}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Campaign Banner in Drawer */}
            <div className={`cart-campaign-box ${isDiscounted ? 'active' : ''}`}>
              {isDiscounted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🎉</span>
                  <div>
                    <strong style={{ color: '#34d399', fontSize: '13px' }}>%50 İndirim Tanımlandı!</strong>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>15 adetten fazla ürün eklendiği için paket başı 100 TL yerine 50 TL olarak hesaplanıyor.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🏷️</span>
                  <div>
                    <strong style={{ color: '#38bdf8', fontSize: '13px' }}>15&apos;ten Fazla Ürün Kampanyası</strong>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      Sepetinize <strong>{remainingForDiscount} paket daha</strong> eklerseniz tüm sepet %50 indirime girecektir!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Item List */}
            <div className="cart-item-list">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '12px 0 4px' }}>Sepetiniz henüz boş</p>
                  <span style={{ fontSize: '12.5px', color: '#a1a1aa' }}>Katalogdan istediğiniz paketleri &quot;Sepete Ekle&quot; butonuyla ekleyebilirsiniz.</span>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.id} className="cart-item-row">
                    <span className="cart-item-index">{idx + 1}</span>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.title}</span>
                      <div className="cart-item-tags">
                        <span className="cart-item-id">{item.id}</span>
                        <span className="cart-item-category">{item.category}</span>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-price">
                        {isDiscounted ? (
                          <>
                            <s style={{ color: '#71717a', fontSize: '11px', marginRight: '4px' }}>100 TL</s>
                            <strong style={{ color: '#10b981' }}>50 TL</strong>
                          </>
                        ) : (
                          <strong>100 TL</strong>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-remove-btn"
                        title="Sepetten Çıkar"
                        aria-label="Çıkar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-breakdown">
                  <div className="summary-row">
                    <span>Seçilen Paket Adedi</span>
                    <span>{cart.length} Adet</span>
                  </div>
                  <div className="summary-row">
                    <span>Birim Fiyat</span>
                    <span>
                      {isDiscounted ? (
                        <>
                          <s style={{ color: '#71717a', marginRight: '6px' }}>100 TL</s>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>50 TL</span>
                        </>
                      ) : (
                        '100 TL'
                      )}
                    </span>
                  </div>
                  {isDiscounted && (
                    <div className="summary-row discount">
                      <span>%50 Kampanya İndirimi</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>-{discountSavings.toLocaleString('tr-TR')} TL</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Toplam Tutar</span>
                    <span className="total-amount">{finalTotal.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Satın Al (İtemsatış&apos;a İlet)</span>
                </button>

                <p className="cart-checkout-note">
                  ℹ️ <strong>Satın Al</strong> butonuna bastığınızda sepetteki <strong>{cart.length}</strong> paketin yalnızca isimleri panonuza kopyalanır ve resmi İtemsatış mağazamıza yönlendirilirsiniz.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={clearCart}
                  >
                    Sepeti Temizle
                  </button>
                  <button
                    type="button"
                    className="cart-continue-btn"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Kataloğa Devam Et →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
           TOAST NOTIFICATION
           ===================================================================== */}
      {toastMessage && (
        <div className="catalog-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
