'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import catalogStats from '../lib/catalog-stats.json';
import ItemsatisLogo from '../components/ItemsatisLogo';

type ModalId = 'about' | 'solutions' | 'engineering' | 'faq' | null;
type CodeTabKey = 'bridge' | 'security' | 'database';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

const CODE_SNIPPETS: Record<CodeTabKey, { label: string; code: string }> = {
  bridge: {
    label: 'bridge.lua',
    code: `-- QB-Core, Qbox ve ESX Otomatik Algılama Köprüsü
local Bridge = {}

function Bridge.GetFramework()
    if GetResourceState("qbx_core") == "started" then
        return "qbox"
    elseif GetResourceState("qb-core") == "started" then
        return "qbcore"
    elseif GetResourceState("es_extended") == "started" then
        return "esx"
    end
end

return Bridge`,
  },
  security: {
    label: 'security.lua',
    code: `-- Sunucu Taraflı Mesafe ve Güvenlik Doğrulaması
local function VerifyPlayerAction(source, targetCoords)
    local ped = GetPlayerPed(source)
    if not DoesEntityExist(ped) then return false end

    local dist = #(GetEntityCoords(ped) - targetCoords)
    if dist > 3.5 then
        return false
    end

    return true
end`,
  },
  database: {
    label: 'schema.sql',
    code: `-- İndekslenmiş MariaDB Veri Tablosu Yapısı
CREATE TABLE IF NOT EXISTS \`restricted_records\` (
    \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`citizenid\` VARCHAR(50) NOT NULL,
    \`data\` LONGTEXT NOT NULL,
    INDEX \`idx_citizen\` (\`citizenid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
};

const FAQ_ITEMS = [
  {
    q: 'Ürünleri nasıl inceleyebilir ve satın alabilirim?',
    a: 'Tüm ürünlerimiz, fiyatlarımız ve detaylı açıklamalarımız resmi İtemsatış mağazamızda yer almaktadır. Katalog üzerinden paketleri sepetinize ekleyip İtemsatış butonları aracılığıyla 3D Secure güvencesiyle satın alım yapabilirsiniz.',
  },
  {
    q: 'Teslim edilen dosyalarda şifreleme veya lisans kilidi var mı?',
    a: 'Hayır. Sunucu sahiplerinin tasarımları ve kodları kendi sunucularına göre özgürce uyarlayabilmesi için tüm teslimatlarımızı %100 açık kaynak (open-source, escrow kilitsiz) olarak gerçekleştiriyoruz.',
  },
  {
    q: 'Hangi FiveM altyapıları (Framework) destekleniyor?',
    a: 'Geliştirdiğimiz scriptler ve sunucu paketleri hem QB-Core ve Qbox hem de ESX Legacy altyapılarıyla tam uyumlu çalışmaktadır.',
  },
  {
    q: 'Satın alım sonrası kurulum desteği sağlıyor musunuz?',
    a: 'Evet. Her ürünün içerisinde adım adım Türkçe kurulum rehberi yer alır. Ayrıca Discord topluluğumuz üzerinden teknik ekibimizden birebir kurulum ve entegrasyon desteği alabilirsiniz.',
  },
];

export default function HomePage() {
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  // Strictly lock root html/body scroll while on the entrance screen across all browsers
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('is-viewport-locked');
    body.classList.add('is-viewport-locked');
    window.scrollTo(0, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      html.classList.remove('is-viewport-locked');
      body.classList.remove('is-viewport-locked');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  const openModal = (id: Exclude<ModalId, null>) => {
    setMobileMenuOpen(false);
    setActiveModal(id);
  };

  return (
    <div className="noir-entrance-shell">
      {/* ===============================================================
           TOP FLOATING PILL NAVBAR (Image 1 Sharp Header Frame)
           =============================================================== */}
      <header className="bento-pill-nav" id="navbar">
        <div className="bpn-brand-group">
          <Link href="/" className="bpn-brand" aria-label="Restricted Studio Ana Sayfa">
            <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="bpn-logo" />
            <div className="bpn-brand-text">
              <span className="bpn-title">RESTRICTED STUDIO</span>
              <span className="bpn-trust-mobile">
                <img src="/assets/itemsatis-icon.png" alt="" width={10} height={10} />
                İTEMSATIŞ GÜVENCESİYLE
              </span>
            </div>
          </Link>

          <span className="bpn-brand-divider" aria-hidden="true" />

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bpn-trust-badge"
            title="İtemsatış Resmi Mağaza Güvencesi"
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt="İtemsatış"
              width={13}
              height={13}
              className="bpn-trust-icon"
            />
            <span>İTEMSATIŞ GÜVENCESİYLE</span>
          </a>
        </div>

        <nav className="bpn-menu" aria-label="Ana Menü">
          <button
            type="button"
            className={`bpn-link ${activeModal === 'about' ? 'is-active' : ''}`}
            onClick={() => openModal('about')}
          >
            BİZ KİMİZ
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'solutions' ? 'is-active' : ''}`}
            onClick={() => openModal('solutions')}
          >
            ÇÖZÜMLER
          </button>
          <Link href="/katalog" className="bpn-link bpn-link-highlight">
            KATALOG
          </Link>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'engineering' ? 'is-active' : ''}`}
            onClick={() => openModal('engineering')}
          >
            MÜHENDİSLİK
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'faq' ? 'is-active' : ''}`}
            onClick={() => openModal('faq')}
          >
            SSS
          </button>
        </nav>

        <div className="bpn-actions">
          <Link
            href="/katalog"
            className="bpn-icon-btn"
            title="Katalogda Ara"
            aria-label="Katalogda Ara"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bpn-itemsatis-btn"
            title="Resmi İtemsatış Mağazası"
            aria-label="Resmi İtemsatış Mağazası"
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt="İtemsatış"
              width={15}
              height={15}
              className="bpn-itemsatis-img"
            />
            <span className="bpn-itemsatis-label">İTEMSATIŞ</span>
          </a>

          <Link
            href="/discord"
            className="bpn-icon-btn"
            title="Discord Topluluğu"
            aria-label="Discord"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </Link>

          <Link href="/dashboard" className="bpn-portal-btn">
            <span className="bpn-portal-dot" aria-hidden="true" />
            <span>MÜŞTERİ PORTALI</span>
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menüyü Aç/Kapat"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer inside Fixed Shell (zero body scroll) */}
      <div className={`bpn-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('about')}>
          <span>BİZ KİMİZ</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('solutions')}>
          <span>ÇÖZÜMLER &amp; İSTATİSTİKLER</span>
          <span>↗</span>
        </button>
        <Link href="/katalog" className="bmn-link-btn" style={{ background: '#A50000' }}>
          <span>PAKET KATALOĞU (6.400+)</span>
          <span>→</span>
        </Link>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('engineering')}>
          <span>MÜHENDİSLİK &amp; AÇIK KAYNAK</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('faq')}>
          <span>SIKÇA SORULAN SORULAR</span>
          <span>↗</span>
        </button>
        <Link href="/dashboard" className="bmn-link-btn" style={{ background: '#F0F0F0', color: '#080808' }}>
          <span>MÜŞTERİ PORTALI &amp; LİSANS</span>
          <span>→</span>
        </Link>
        <a
          href={ITEMSATIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bmn-link-btn"
        >
          <span>İTEMSATIŞ RESMİ MAĞAZA</span>
          <span>↗</span>
        </a>
        <Link href="/discord" className="bmn-link-btn">
          <span>DİSCORD TOPLULUĞU</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ===============================================================
           VIEWPORT-LOCKED ASYMMETRIC BENTO GRID (Zero Vertical/Horizontal Scroll)
           =============================================================== */}
      <main className="bento-grid-container">
        {/* LEFT COLUMN */}
        <div className="bento-col-left">
          {/* MAIN OBSIDIAN ARCHITECTURAL HEADLINE CARD */}
          <section className="bento-card bento-card-main">
            <div className="noir-stipple-chalk" aria-hidden="true" />
            <div className="noir-grain-overlay" aria-hidden="true" />

            <div className="bcm-layout">
              <div className="bcm-left-col">
                <div className="bcm-top-wrap">
                  <div className="bcm-eyebrow">
                    <span className="bcm-dot" />
                    <span>RESTRICTED STUDIO // FIVEM ARCHITECTURE</span>
                  </div>

                  <h1 className="bcm-headline">
                    ANALİZİ BIRAKIN
                    <br />
                    VE SİSTEMİ ÇALIŞTIRIN.
                    <br />
                    <span className="bcm-headline-highlight">RESTRICTED İLE.</span>
                  </h1>

                  <p className="bcm-subhead">
                    Şüpheli sızıntılar ve karmaşık kurulumlarla vakit kaybetmeyin.{' '}
                    {catalogStats.total.toLocaleString('tr-TR')}+ doğrulanmış açık kaynak script,
                    optimize 3D mekanlar ve sıfır gecikmeli SQL mimarisiyle doğrudan üretime geçin.
                  </p>
                </div>

                <div className="bcm-actions-row">
                  <Link href="/katalog" className="bcm-split-btn bcm-split-primary">
                    <div className="bsb-text-wrap">
                      <span className="bsb-sub">RESTRICTED STUDIO</span>
                      <span className="bsb-main">KATALOĞU KEŞFET</span>
                    </div>
                    <div className="bsb-icon-wrap">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bcm-split-btn bcm-split-secondary"
                  >
                    <div className="bsb-text-wrap">
                      <span className="bsb-sub">RESMİ MAĞAZA GÜVENCESİ</span>
                      <span className="bsb-main">İTEMSATIŞ</span>
                    </div>
                    <div className="bsb-icon-wrap">
                      <ItemsatisLogo
                        variant="icon"
                        width={16}
                        height={16}
                        style={{ filter: 'grayscale(100%) contrast(1.15)' }}
                      />
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Architectural Specification Rail (Cures Right-Side Void Calmly) */}
              <aside className="bcm-spec-panel" aria-label="Mimari Özellik Özeti">
                <div className="bsp-header">
                  <span className="bsp-code">ED.2026 // SPEC-01</span>
                  <span className="bsp-cross" aria-hidden="true">+</span>
                </div>

                <div className="bsp-vignette" aria-hidden="true">
                  <svg viewBox="0 0 180 68" fill="none">
                    <defs>
                      <linearGradient id="specBeamFade" x1="0.35" y1="1" x2="0.1" y2="0">
                        <stop offset="0%" stopColor="#E6E4DF" stopOpacity="0.45" />
                        <stop offset="45%" stopColor="#8B0000" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#080808" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points="88,48 112,48 76,0 44,0" fill="url(#specBeamFade)" />
                    <path d="M0 54 Q 45 44, 92 52 T 180 48 L 180 68 L 0 68 Z" fill="#080808" />
                    <polygon points="90,46 102,38 102,58 90,58" fill="#080808" />
                    <polygon points="102,38 114,46 114,58 102,58" fill="#E6E4DF" opacity="0.88" />
                    <rect x="106" y="49" width="4" height="9" fill="#080808" />
                    <line x1="12" y1="54" x2="72" y2="54" stroke="#8B0000" strokeWidth="1" opacity="0.8" />
                  </svg>
                </div>

                <div className="bsp-rows">
                  <div className="bsp-row">
                    <span className="bsp-k">ARŞİV</span>
                    <span className="bsp-v">{catalogStats.total.toLocaleString('tr-TR')}+ Paket</span>
                  </div>
                  <div className="bsp-row">
                    <span className="bsp-k">RESMON</span>
                    <span className="bsp-v">≤ 0.04 ms</span>
                  </div>
                  <div className="bsp-row">
                    <span className="bsp-k">LİSANS</span>
                    <span className="bsp-v">Escrow Yok · Open</span>
                  </div>
                  <div className="bsp-row">
                    <span className="bsp-k">MOTOR</span>
                    <span className="bsp-v">QBox · QB · ESX</span>
                  </div>
                </div>

                <Link href="/katalog" className="bsp-promo-foot">
                  <span>16+ SEPETTE %50 İNDİRİM</span>
                  <span>→</span>
                </Link>
              </aside>
            </div>
          </section>

          {/* BOTTOM SUB-BENTO ROW */}
          <div className="bento-sub-row">
            {/* SUB-CARD 1: CRIMSON MONOLITH + INVERTED SPOTLIGHT (Direct Image 2 Homage) */}
            <button
              type="button"
              className="bento-card bento-card-crimson"
              onClick={() => openModal('engineering')}
            >
              <div className="noir-stipple-obsidian" aria-hidden="true" />
              <div className="noir-grain-heavy" aria-hidden="true" />

              <div className="bento-card-head">
                <span className="bcc-tag">MÜHENDİSLİK &amp; MİMARİ</span>
                <span className="bcc-circle-btn" aria-hidden="true">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" />
                  </svg>
                </span>
              </div>

              <div className="bcc-monolith-art" aria-hidden="true">
                <svg viewBox="0 0 160 96" fill="none">
                  <defs>
                    {/* Inverted spotlight: bright near gable roof fading upward into obsidian stipple */}
                    <linearGradient id="invertedBeamLeft" x1="0.5" y1="1" x2="0.2" y2="0">
                      <stop offset="0%" stopColor="#F0F0F0" stopOpacity="0.95" />
                      <stop offset="32%" stopColor="#F0F0F0" stopOpacity="0.32" />
                      <stop offset="68%" stopColor="#080808" stopOpacity="0.88" />
                      <stop offset="100%" stopColor="#080808" stopOpacity="0.98" />
                    </linearGradient>
                    <pattern id="beamDots" width="3" height="3" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.6" fill="#080808" opacity="0.55" />
                    </pattern>
                  </defs>
                  {/* Inverted beam upward-left */}
                  <polygon points="88,46 116,46 72,0 32,0" fill="url(#invertedBeamLeft)" />
                  <polygon points="88,46 116,46 72,0 32,0" fill="url(#beamDots)" />
                  {/* Obsidian Horizon Hills */}
                  <path
                    d="M0 78 Q 36 66, 74 75 T 160 72 L 160 96 L 0 96 Z"
                    fill="#080808"
                  />
                  {/* Cast hard shadow under monolith */}
                  <polygon points="56,82 90,74 90,82" fill="#080808" />
                  {/* Monolithic Structure (Chalk wall + Black gable/door) */}
                  <polygon points="88,52 104,42 104,78 88,78" fill="#080808" />
                  <polygon points="104,42 120,52 120,78 104,78" fill="#F0F0F0" />
                  <rect x="109" y="64" width="6" height="14" fill="#080808" />
                </svg>
              </div>

              <div className="bcc-bottom">
                <h2 className="bcc-title">ŞİFRESİZ KOD</h2>
                <p className="bcc-sub">%100 Açık kaynak Lua/JS. Escrow kilitsiz mimari.</p>
              </div>
            </button>

            {/* SUB-CARD 2: OBSIDIAN LIMINAL PATH + SILHOUETTE (Direct Image 2 Homage) */}
            <Link href="/discord" className="bento-card bento-card-noir">
              <div className="noir-stipple-chalk" aria-hidden="true" />
              <div className="noir-grain-overlay" aria-hidden="true" />

              <div className="bento-card-head">
                <span className="bcn-tag">TOPLULUK &amp; DESTEK</span>
                <span className="bcn-circle-btn" aria-hidden="true">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" />
                  </svg>
                </span>
              </div>

              <div className="bcn-figure-art" aria-hidden="true">
                <svg viewBox="0 0 160 96" fill="none">
                  {/* Winding chalk path into crimson/obsidian void */}
                  <path
                    d="M 94 12 C 118 28, 72 48, 100 66 C 118 76, 86 88, 66 96 L 106 96 C 128 84, 140 70, 114 54 C 90 38, 126 24, 102 12 Z"
                    fill="#F0F0F0"
                    opacity="0.88"
                  />
                  {/* Horizon line */}
                  <line x1="0" y1="22" x2="160" y2="22" stroke="#A50000" strokeWidth="1.2" />
                  {/* Solitary watching figure silhouette */}
                  <ellipse cx="44" cy="83" rx="14" ry="3.5" fill="#080808" />
                  <circle cx="48" cy="48" r="4" fill="#F0F0F0" />
                  <path
                    d="M42 54 L54 54 L56 68 L52 68 L51 82 L47 82 L47 69 L45 69 L44 82 L41 82 L42 68 L40 68 Z"
                    fill="#080808"
                    stroke="#F0F0F0"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              <div className="bcn-bottom">
                <h2 className="bcn-title">DİSCORD</h2>
                <p className="bcn-sub">7/24 Birebir destek talebi &amp; teknik danışmanlık.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: LIMINAL INVERTED-SPOTLIGHT CRIMSON SHOWCASE */}
        <div className="bento-col-right">
          <section className="bento-card bento-card-showcase" aria-label="Sistem Telemetri Monitörü">
            {/* Image 2 Crimson Sky + Inverted Spotlight Beam + Grain */}
            <div className="noir-stipple-obsidian" aria-hidden="true" />
            <div className="noir-grain-heavy" aria-hidden="true" />
            <div className="showcase-inverted-beam" aria-hidden="true" />

            <div className="showcase-meta-bar" aria-hidden="true">
              <span className="smb-tag">RS // CANLI TELEMETRİ MİMARİSİ</span>
              <span className="smb-status">
                <span className="smb-dot" />
                60.0 TPS STABİL
              </span>
            </div>

            {/* Liminal Horizon Monolith & Path behind the Console */}
            <svg
              className="showcase-horizon-art"
              viewBox="0 0 400 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 44 Q 65 26, 130 40 T 260 36 T 400 46 L 400 180 L 0 180 Z"
                fill="#080808"
              />
              {/* Tiny distant chalk/obsidian monolith */}
              <polygon points="312,18 326,8 326,42 312,42" fill="#080808" />
              <polygon points="326,8 340,18 340,42 326,42" fill="#F0F0F0" />
              <rect x="331" y="28" width="5" height="14" fill="#080808" />
              {/* Subtle winding path foreground */}
              <path
                d="M 180 180 Q 250 135, 215 100 T 308 42"
                stroke="#F0F0F0"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
                opacity="0.22"
              />
            </svg>

            <div className="showcase-callout-ticks">
              <svg
                className="showcase-side-ticks"
                width="22"
                height="48"
                viewBox="0 0 22 48"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6 L19 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                <path d="M2 24 L18 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                <path d="M4 42 L19 33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
              </svg>

              {/* RISOGRAPH CONSOLE MOCKUP */}
              <div className="device-mockup-chassis">
                <div className="device-island">
                  <span className="device-sensor" />
                  <span className="device-cam" />
                </div>

                <div className="device-top-bar">
                  <div className="device-user-info">
                    <img src="/assets/rslogo.jpg" alt="Restricted Core" className="device-avatar" />
                    <div className="device-user-text">
                      <span className="dut-greeting">Restricted Core</span>
                      <span className="dut-status">
                        <span className="dut-dot" />
                        v3.4 · Aktif
                      </span>
                    </div>
                  </div>
                  <div className="device-top-icons">
                    <Link href="/katalog" className="device-icon-pill" aria-label="Katalog">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </Link>
                    <Link href="/dashboard" className="device-icon-pill has-badge" aria-label="Portal">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="device-server-selector">
                  <div className="dss-left">
                    <span style={{ fontSize: '12px' }}>◆</span>
                    <span className="dss-name">Saint Roleplay — Istanbul Engine</span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>

                {/* Primary Metric Alert Card */}
                <div className="device-metric-card-primary">
                  <div className="dmcp-header">
                    <div className="dmcp-badge-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                      >
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <circle cx="12" cy="17" r="0.6" />
                      </svg>
                    </div>
                    <div className="dmcp-text">
                      <span className="dmcp-title">STABİL KAYNAK TÜKETİMİ</span>
                      <p className="dmcp-desc">
                        Tüm tick döngüleri <strong>0.04ms</strong> altında optimize edildi. SQL
                        gecikmesi: <strong>1.1ms</strong>.
                      </p>
                    </div>
                    <Link
                      href="/katalog"
                      className="dmcp-action-btn"
                      aria-label="Katalogdaki Optimize Sistemler"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                      >
                        <path d="M7 17L17 7M17 7H8M17 7V16" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Widget 2: Sunucu Kapasitesi Crimson Risograph Graph */}
                <div className="device-capacity-card">
                  <div className="noir-stipple-obsidian" aria-hidden="true" />
                  <div className="dcc-head">
                    <div>
                      <span className="dcc-title">SUNUCU KAPASİTESİ</span>
                      <span className="dcc-sub">TPS &amp; Eşzamanlı Oyuncu</span>
                    </div>
                    <span className="dcc-filter-pill">Bu Hafta ▾</span>
                  </div>

                  <div className="dcc-days-row">
                    {[
                      { d: 'Pzt', v: '78%' },
                      { d: 'Sal', v: '82%' },
                      { d: 'Çar', v: '91%', active: true },
                      { d: 'Per', v: '88%' },
                      { d: 'Cum', v: '85%' },
                      { d: 'Cmt', v: '93%' },
                      { d: 'Paz', v: '98%' },
                    ].map((col) => (
                      <div key={col.d} className={`dcc-day-col ${col.active ? 'active' : ''}`}>
                        <span className="ddc-label">{col.d}</span>
                        <span className="ddc-val">{col.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="dcc-chart-container">
                    <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="capacity-curve-svg">
                      <defs>
                        <pattern id="curveStipple" width="4" height="4" patternUnits="userSpaceOnUse">
                          <circle cx="1.5" cy="1.5" r="0.85" fill="#F0F0F0" opacity="0.24" />
                        </pattern>
                        <linearGradient id="crimsonPeakFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A50000" stopOpacity="0.95" />
                          <stop offset="60%" stopColor="#8B0000" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#080808" stopOpacity="0.95" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 100 Q 30 92, 50 78 T 100 46 T 140 22 T 180 54 T 220 36 T 270 18 T 320 10 L 320 110 L 0 110 Z"
                        fill="url(#crimsonPeakFill)"
                      />
                      <path
                        d="M 0 100 Q 30 92, 50 78 T 100 46 T 140 22 T 180 54 T 220 36 T 270 18 T 320 10 L 320 110 L 0 110 Z"
                        fill="url(#curveStipple)"
                      />
                      <path
                        d="M 0 100 Q 30 92, 50 78 T 100 46 T 140 22 T 180 54 T 220 36 T 270 18 T 320 10"
                        fill="none"
                        stroke="#F0F0F0"
                        strokeWidth="2.4"
                      />
                      <circle cx="140" cy="22" r="4.5" fill="#F0F0F0" stroke="#A50000" strokeWidth="2.5" />
                    </svg>
                    <div className="dcc-apex-pin">91% · 60.0 FPS</div>
                  </div>

                  <div className="dcc-footer">
                    <span>64/64 Oyuncu · %99.99 Uptime · 0 Escrow</span>
                  </div>
                </div>
              </div>

              <svg
                className="showcase-side-ticks"
                width="22"
                height="48"
                viewBox="0 0 22 48"
                fill="none"
                aria-hidden="true"
              >
                <path d="M18 6 L3 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                <path d="M20 24 L4 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                <path d="M18 42 L3 33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
              </svg>
            </div>
          </section>
        </div>
      </main>

      {/* ===============================================================
           IN-VIEWPORT NOIR MODALS (Zero Page Scroll Preserved!)
           =============================================================== */}
      {activeModal && (
        <div
          className="noir-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div className="noir-modal-panel" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="noir-modal-head">
              <div>
                <p className="noir-modal-eyebrow">
                  {activeModal === 'about' && '01 // BİZ KİMİZ & STANDARTLARIMIZ'}
                  {activeModal === 'solutions' && '02 // ÜRETİM ALANLARI & ARŞİV DAĞILIMI'}
                  {activeModal === 'engineering' && '03 // MÜHENDİSLİK & ŞİFRESİZ MİMARİ'}
                  {activeModal === 'faq' && '04 // SIKÇA SORULAN SORULAR'}
                </p>
                <h2 className="noir-modal-title">
                  {activeModal === 'about' && 'FiveM Türkiye’de kaliteyi yeniden inşa ediyoruz.'}
                  {activeModal === 'solutions' && 'Tek çatı altında modüler sunucu altyapısı.'}
                  {activeModal === 'engineering' && 'Şifreli kutular değil, okunabilir temiz kod.'}
                  {activeModal === 'faq' && 'Merak edilen tüm teknik ve satış detayları.'}
                </h2>
              </div>
              <button
                type="button"
                className="noir-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: ABOUT */}
            {activeModal === 'about' && (
              <div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'rgba(240,240,240,0.85)', marginBottom: '12px' }}>
                  <strong>Yurt dışında 100€ ile 300€ arasında satılan yazılımlar</strong>, kur farkı
                  nedeniyle Türkiye’deki sunucu girişimlerinin önündeki en büyük engele dönüştü.
                  Restricted Studio; dünya standartlarındaki Lua/JS, 3D mekan (MLO) ve MariaDB
                  mühendisliğini Türkiye ekonomisine uygun, ulaşılabilir ve %100 açık kaynak koşullarla
                  sunmak için kuruldu.
                </p>

                <div className="noir-modal-grid-3">
                  <div className="noir-info-box">
                    <h4>Ulaşılabilir Yerel Fiyat</h4>
                    <p>
                      Döviz kuruna endeksli fahiş etiketler yerine TL bazlı şeffaf fiyatlandırma.
                      16+ paket sepetlerinde anında %50 kampanya indirimi.
                    </p>
                  </div>
                  <div className="noir-info-box">
                    <h4>Tek Tipleşmeye Son</h4>
                    <p>
                      Arayüzü, dili ve kuralları tamamen sunucunuza göre özelleştirilebilen
                      modüler sistemler.
                    </p>
                  </div>
                  <div className="noir-info-box">
                    <h4>Koşulsuz Kod Güvenliği</h4>
                    <p>
                      Gizli dış bağlantılardan ve arka kapılardan (backdoor/webhook) tamamen
                      arındırılmış temiz kaynak kodları.
                    </p>
                  </div>
                </div>

                <table className="noir-compare-table">
                  <thead>
                    <tr>
                      <th>Kriter</th>
                      <th>Hazır Kopya / Yurt Dışı</th>
                      <th>Restricted Studio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Kaynak Kod</td>
                      <td>Escrow kilitli, müdahaleye kapalı</td>
                      <td>%100 Açık kaynak, düzenlenebilir</td>
                    </tr>
                    <tr>
                      <td>Performans</td>
                      <td>Yüksek işlemci yükü &amp; FPS kaybı</td>
                      <td>0.00 ms boşta tüketim, optimize SQL</td>
                    </tr>
                    <tr>
                      <td>Güvenlik</td>
                      <td>Denetlenemeyen şifreli dosyalar</td>
                      <td>Şeffaf güvenlik taramalı temiz kod</td>
                    </tr>
                    <tr>
                      <td>Satış &amp; Güvence</td>
                      <td>Belirsiz forum ticareti</td>
                      <td>İtemsatış 3D Secure &amp; Türkçe Discord</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Body: SOLUTIONS */}
            {activeModal === 'solutions' && (
              <div>
                <div className="noir-modal-grid-2">
                  <div className="noir-info-box">
                    <h4>Özgün FiveM Scriptleri</h4>
                    <p>
                      Lua 5.4 ve modern arayüzlerle geliştirilen, sunucu işlemcisini yormayan
                      modüler sistemler.
                    </p>
                    <div className="noir-chip-row">
                      <span className="noir-chip">QB-Core / Qbox / ESX</span>
                      <span className="noir-chip">0.00 ms Idle</span>
                    </div>
                  </div>
                  <div className="noir-info-box">
                    <h4>3D MLO &amp; Mekan Tasarımı</h4>
                    <p>
                      Kalabalık oyuncularda dahi FPS düşürmeyen portal/occlusion optimize iç
                      mekanlar.
                    </p>
                    <div className="noir-chip-row">
                      <span className="noir-chip">Optimize Poligon</span>
                      <span className="noir-chip">Özel İç Mekan</span>
                    </div>
                  </div>
                  <div className="noir-info-box">
                    <h4>SQL Veritabanı Mimarisi</h4>
                    <p>
                      Doğru indekslenmiş MariaDB tablolarıyla milisaniye altı sorgu yanıtı ve
                      Türkçe karakter uyumu.
                    </p>
                    <div className="noir-chip-row">
                      <span className="noir-chip">1.1 ms Gecikme</span>
                      <span className="noir-chip">InnoDB UTF8MB4</span>
                    </div>
                  </div>
                  <div className="noir-info-box">
                    <h4>Hazır Sunucu Paketleri</h4>
                    <p>
                      Ekonomisi dengelenmiş, çakışmasız ve kurulum rehberli anahtar teslim sunucu
                      paketleri.
                    </p>
                    <div className="noir-chip-row">
                      <span className="noir-chip">Tam Entegrasyon</span>
                      <span className="noir-chip">Discord Destek</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    border: '1.5px solid rgba(240,240,240,0.28)',
                    background: '#0e0e0e',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    <span>ARŞİV DAĞILIMI ({catalogStats.total.toLocaleString('tr-TR')} PAKET)</span>
                    <Link href="/katalog" style={{ color: '#A50000', textDecoration: 'underline' }}>
                      Kataloğu Aç →
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {statRows.map(([cat, count]) => {
                      const pct = Math.round((count / catalogStats.total) * 100);
                      return (
                        <div key={cat}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              marginBottom: '3px',
                            }}
                          >
                            <span>{cat}</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                              {count.toLocaleString('tr-TR')} (%{pct})
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#080808', border: '1px solid rgba(240,240,240,0.2)' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: '#A50000',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: ENGINEERING */}
            {activeModal === 'engineering' && (
              <div>
                <div className="noir-modal-grid-3" style={{ marginTop: 0, marginBottom: '16px' }}>
                  <div className="noir-info-box">
                    <h4>1. Çoklu Altyapı Köprüsü</h4>
                    <p>Tek kod tabanı üzerinden QB-Core, Qbox ve ESX Legacy otomatik tanıma.</p>
                  </div>
                  <div className="noir-info-box">
                    <h4>2. Sunucu Taraflı Güvenlik</h4>
                    <p>Tüm para, envanter ve mesafe kontrolleri doğrudan sunucuda doğrulanır.</p>
                  </div>
                  <div className="noir-info-box">
                    <h4>3. Şeffaf Güvenlik Raporu</h4>
                    <p>Her arşiv teslimat öncesi harici webhook ve backdoor taramasından geçer.</p>
                  </div>
                </div>

                <div className="noir-code-tabs">
                  {(Object.keys(CODE_SNIPPETS) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`noir-code-tab ${codeTab === key ? 'active' : ''}`}
                      onClick={() => setCodeTab(key)}
                    >
                      {CODE_SNIPPETS[key].label}
                    </button>
                  ))}
                </div>

                <pre className="noir-code-pre">
                  <code>{CODE_SNIPPETS[codeTab].code}</code>
                </pre>
              </div>
            )}

            {/* Modal Body: FAQ */}
            {activeModal === 'faq' && (
              <div>
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className={`noir-faq-item ${isOpen ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="noir-faq-trigger"
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className="noir-faq-body">{item.a}</div>}
                    </div>
                  );
                })}

                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <Link href="/katalog" className="btn btn-itemsatis" style={{ flex: '1 1 200px' }}>
                    Paket Kataloğuna Git →
                  </Link>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-discord-solid"
                    style={{ flex: '1 1 200px' }}
                  >
                    İtemsatış Mağazası ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
