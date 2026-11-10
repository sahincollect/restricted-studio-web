'use client';

import { useState, useMemo, useEffect } from 'react';
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

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedItem, setCopiedItem] = useState<CatalogItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

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
    'Merhaba, İtemsatış üzerinden aşağıdaki paketi almak istiyorum:\\nPaket: [Paket adı]\\nStok, güncellik ve fiyat teyidi alabilir miyim?';

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

  const handleDemand = (item: CatalogItem) => {
    const textToCopy = `Merhaba Restricted Studio ekibi, İtemsatış üzerinden şu paket hakkında bilgi almak ve sipariş vermek istiyorum:\n[${item.id}] ${item.title}\nPaket stok, sürüm ve fiyat durumunu teyit edebilir misiniz?`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }

    setCopiedItem(item);

    // Redirect to İtemsatış store
    setTimeout(() => {
      window.open(ITEMSATIS_URL, '_blank', 'noopener,noreferrer');
    }, 600);

    setTimeout(() => {
      setCopiedItem(null);
    }, 4000);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
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
           HERO SECTION: Amacı Açıklayan Apple Tarzı Başlık
           ===================================================================== */}
      <section className="catalog-hero">
        <div className="container catalog-hero-inner">
          <div className="catalog-pill-badge">
            <span className="dot"></span>
            <span>6.400+ Paket · On-Demand Güvenlik &amp; İtemsatış Teslimat Kataloğu</span>
          </div>

          <h1 className="catalog-title">
            Geniş FiveM Arşivimiz.<br />
            <span style={{ color: 'var(--crimson)' }}>İstediğinizi seçin, anında teslim edelim.</span>
          </h1>

          <p className="catalog-subtitle">
            Restricted Studio özel arşivimizdeki binlerce popüler scripti, MLO mekanı, araç paketini ve kıyafeti tek bir katalogda topladık. Aradığınız paketi arama çubuğundan bulun, yeşil <strong>Teslim Al</strong> butonuna basarak İtemsatış güvencesiyle güvenle sipariş verin.
          </p>

          <div className="catalog-highlight-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                <strong>İtemsatış &amp; Güvenli Teslimat:</strong> Teslim Al butonuna tıkladığınızda paket adı panonuza kopyalanır ve mağazamıza aktarılırsınız. İlanları doğrudan satın almayınız; satıcıya soru sorarak sipariş veriniz.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              style={{
                backgroundColor: 'rgba(0, 113, 227, 0.12)',
                color: '#0071e3',
                border: '1px solid rgba(0, 113, 227, 0.3)',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>ℹ️ Sipariş Yönergeleri</span>
            </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          <span>İtemsatış ile Hızlı &amp; Güvenli Teslimat</span>
        </div>
      </div>

      {/* =====================================================================
           CARD GRID
           ===================================================================== */}
      <main className="catalog-grid">
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => {
            const isCopied = copiedItem?.id === item.id;
            const isVerified = item.source === 'restricted-verified';

            return (
              <div key={item.id} className="catalog-card">
                <div>
                  <div className="catalog-card-top">
                    <span className="catalog-id-tag">{item.id}</span>
                    <span className={`catalog-cat-tag ${isVerified ? 'verified' : ''}`}>
                      {item.category}
                    </span>
                  </div>

                  <h3 className="catalog-card-title">{item.title}</h3>

                  <div className="catalog-card-badges">
                    <span className="catalog-mini-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {isVerified ? 'Doğrulanmış Paket' : 'Stüdyo Arşivi'}
                    </span>
                    <span className="catalog-mini-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Açık Kaynak
                    </span>
                    <span className="catalog-mini-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Temiz Kod
                    </span>
                  </div>
                </div>

                <div className="catalog-card-footer">
                  <button
                    className={`btn-demand ${isCopied ? 'copied' : ''}`}
                    onClick={() => handleDemand(item)}
                    title="Paket adını kopyalayıp İtemsatış mağazamıza yönlendirir"
                  >
                    {isCopied ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Kopyalandı! İtemsatış Açılıyor...</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <span>Teslim Al (İtemsatış)</span>
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
            <h3 className="catalog-empty-title">"{search}" ile eşleşen paket bulunamadı</h3>
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
              <h3 className="catalog-step-title">Paketi Belirleyin</h3>
              <p className="catalog-step-desc">
                6.400'den fazla paket arasından arama çubuğunu veya kategorileri kullanarak sunucunuza eklemek istediğiniz MLO, script veya aracı seçin.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">2</span>
              <h3 className="catalog-step-title">İtemsatış'tan Sipariş Verin</h3>
              <p className="catalog-step-desc">
                Yeşil <strong>Teslim Al</strong> butonuna tıklayın. Paket adı otomatik kopyalanır ve resmi İtemsatış mağazamıza aktarılırsınız.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">3</span>
              <h3 className="catalog-step-title">Temiz &amp; Açık Kaynak Teslimat</h3>
              <p className="catalog-step-desc">
                Paketiniz atölyemizde tersine mühendislikle incelenir, gizli link/backdoor kontrolleri tamamlanır ve 3D Secure güvencesiyle temiz kod olarak teslim edilir.
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
           ORDER GUIDE MODAL
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
              borderTop: '2px solid #dc2626',
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
              Siparişiniz üç adımda tamamlanır.
            </p>

            <ol style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { n: '1', t: 'Paketini Belirle', d: 'Katalogdan paketi seçin ve "Teslim Al" ile adını kopyalayın.' },
                { n: '2', t: 'İtemsatış\'tan Yaz', d: 'Mağazamızda "Satıcıya Soru Sor" alanından aşağıdaki mesajı gönderin.' },
                { n: '3', t: 'Anında Teslim Al', d: 'Ekibimiz teyit edince size özel sipariş açılır; dosyanızı hemen alırsınız.' },
              ].map((s) => (
                <li key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(220, 38, 38, 0.6)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
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
              <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: templateCopied ? '#34d399' : '#ef4444', marginBottom: '6px' }}>
                <span>MESAJ ŞABLONU</span>
                <span>{templateCopied ? 'Kopyalandı' : 'Kopyalamak için tıklayın'}</span>
              </span>
              <span style={{ display: 'block', fontSize: '12.5px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {SAMPLE_INQUIRY}
              </span>
            </button>

            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.55, margin: '0 0 18px', paddingLeft: '10px', borderLeft: '2px solid rgba(220, 38, 38, 0.7)' }}>
              <strong style={{ color: '#e4e4e7', fontWeight: 600 }}>Not:</strong> 30 TL'lik temel ilan sembolik fiyattır. Paketin fiyatı ve teslimatı satıcı teyidinden sonra netleşir; teyitsiz satın alımlar işleme alınamaz.
            </p>

            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              İtemsatış Mağazasına Git
            </a>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: '#71717a' }}>
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  style={{ accentColor: '#dc2626', width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span>Bugün tekrar gösterme</span>
              </label>
              <button
                type="button"
                onClick={handleCloseGuideModal}
                style={{ background: 'none', border: 'none', color: '#d4d4d8', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', padding: '4px 0' }}
              >
                Kataloğa Geç →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy toast */}
      {copiedItem && (
        <div className="catalog-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            <strong>{copiedItem.title}</strong> panoya kopyalandı! İtemsatış mağazasından satıcıya iletebilirsiniz.
          </span>
        </div>
      )}
    </div>
  );
}
