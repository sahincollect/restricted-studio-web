'use client';

import { useState, useMemo } from 'react';
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
  'MLO & Mekanlar',
  'Script & Sistemler',
  'Araç Paketleri',
  'Kıyafet & EUP',
  'Modlar & Eklentiler',
  'Program & Araçlar',
];

const DISCORD_INVITE = 'https://discord.gg/eVcN3D5va';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [copiedItem, setCopiedItem] = useState<CatalogItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute category counts
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

  const handleDemand = (item: CatalogItem) => {
    const textToCopy = `Merhaba Restricted Studio ekibi, katalogdan şu paketi talep etmek istiyorum:\n[${item.id}] ${item.title}\n(Kaynak: ${item.source})`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }

    setCopiedItem(item);

    // After a short delay, open Discord in a new tab
    setTimeout(() => {
      window.open(DISCORD_INVITE, '_blank', 'noopener,noreferrer');
    }, 700);

    setTimeout(() => {
      setCopiedItem(null);
    }, 4000);
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
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              İletişime Geçin
            </a>

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
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-discord-solid btn-full"
                style={{ marginBottom: '8px' }}
              >
                İletişime Geçin (Discord)
              </a>
              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-itemsatis btn-full"
              >
                İtemsatış Mağazası
              </a>
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
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-secondary"
            >
              İletişime Geçin
            </a>
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
            <span>On-Demand Güvenlik &amp; Teslimat Kataloğu</span>
          </div>

          <h1 className="catalog-title">
            Geniş FiveM Arşivimiz.<br />
            <span style={{ color: 'var(--crimson)' }}>İstediğinizi seçin, anında hazırlayalım.</span>
          </h1>

          <p className="catalog-subtitle">
            Elimizde bulunan binlerce özel MLO, script, kıyafet ve araç paketini tek tek sisteme yükleyip bekletmek yerine talep odaklı çalışıyoruz. İhtiyacınız olan paketi katalogdan aratın, bize iletin; ekibimiz paketi zararlı yazılım, gizli webhook ve FPS optimizasyon testlerinden geçirerek tertemiz açık kaynak olarak size teslim etsin.
          </p>

          <div className="catalog-highlight-note">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              <strong>%100 Güvenlik Garantisi:</strong> Talep ettiğiniz tüm FiveVault ve özel arşiv paketleri teslim öncesinde tersine mühendislik araçlarıyla taranır, lisans kilitlerinden ve arka kapılardan tamamen arındırılır.
            </span>
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
              placeholder="Paket adı, içerik veya anahtar kelime ile arayın... (Örn: Roxwood, LSC, Clothing, Carplay, Prodigy)"
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
                  <span className="catalog-cat-count">{count}</span>
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
          Toplam <strong>{filteredItems.length}</strong> paket listeleniyor
          {selectedCategory !== 'Tümü' && ` (${selectedCategory})`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          <span>Talep Üzerine Hazır &amp; Doğrulanabilir</span>
        </div>
      </div>

      {/* =====================================================================
           CARD GRID
           ===================================================================== */}
      <main className="catalog-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
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
                      {isVerified ? 'Atölyede Doğrulandı' : 'FiveVault Arşivi'}
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
                    title="Paket adını kopyalayıp Discord destek talebine yönlendirir"
                  >
                    {isCopied ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Kopyalandı! Discord Açılıyor...</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        <span>Talep Et &amp; Teslim Al</span>
                      </>
                    )}
                  </button>

                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-inquire"
                    title="Discord'da Bu Paket Hakkında Soru Sor"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
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
              Aradığınız paket henüz kataloğumuza eklenmemiş olabilir. FiveVault veya CFX üzerindeki paket adını ya da linkini bize Discord üzerinden iletin; aynı gün arşivimizden tarayıp temizleyerek sizin için özel hazırlayalım.
            </p>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-discord-solid"
              style={{ display: 'inline-flex', padding: '12px 24px' }}
            >
              Özel Paket Talebi Aç (Discord)
            </a>
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
                Yukarıdaki arama çubuğunu kullanarak veya kategorileri filtreleyerek sunucunuza eklemek istediğiniz MLO, script veya aracı seçin.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">2</span>
              <h3 className="catalog-step-title">Talebinizi İletin</h3>
              <p className="catalog-step-desc">
                <strong>Talep Et</strong> butonuna tıklayın. Paket bilgisi otomatik olarak panonuza kopyalanır ve doğrudan Discord destek kanalımıza yönlendirilirsiniz.
              </p>
            </div>

            <div className="catalog-step-box">
              <span className="catalog-step-number">3</span>
              <h3 className="catalog-step-title">Temiz &amp; Açık Kaynak Teslimat</h3>
              <p className="catalog-step-desc">
                Paketiniz atölyemizde tersine mühendislikle incelenir, gizli link/backdoor kontrolleri tamamlanır ve 3D Secure / İtemsatış güvencesiyle temiz kod olarak teslim edilir.
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
            FiveVault, CFX Portal veya yurt dışı mağazalarda gördüğünüz herhangi bir paketin adını ya da linkini bize iletin. Geniş arşivimizden temin edip sıfır riskle hazırlayalım.
          </p>
          <div className="catalog-cta-btn-row">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-discord-solid"
              style={{ padding: '12px 28px' }}
            >
              Discord Üzerinden Özel Paket İste ↗
            </a>
            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-itemsatis"
              style={{ padding: '12px 28px' }}
            >
              Resmi İtemsatış Mağazamız ↗
            </a>
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
                <li><a href="#navbar" onClick={() => setSelectedCategory('MLO & Mekanlar')}>MLO &amp; Mekanlar</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Script & Sistemler')}>Script &amp; Sistemler</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Araç Paketleri')}>Araç Paketleri</a></li>
                <li><a href="#navbar" onClick={() => setSelectedCategory('Kıyafet & EUP')}>Kıyafet &amp; EUP</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Resmi Kanallar</h4>
              <ul>
                <li><a href={ITEMSATIS_URL} target="_blank" rel="noopener noreferrer">İtemsatış Mağazası ↗</a></li>
                <li><a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Discord Topluluğu ↗</a></li>
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

      {/* Copy toast */}
      {copiedItem && (
        <div className="catalog-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            <strong>{copiedItem.title}</strong> panoya kopyalandı! Discord destek kanalına aktarılıyorsunuz...
          </span>
        </div>
      )}
    </div>
  );
}
