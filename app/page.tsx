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
            <div className="noir-grain-overlay" aria-hidden="true" />
            <div className="bcm-visual-stage" aria-hidden="true">
              <img
                src="/assets/noir-hero-monolith.jpg"
                alt=""
                className="bcm-visual-img"
              />
            </div>

            <div className="bcm-top-wrap">
              <div className="bcm-eyebrow">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c62828"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="3.34" y1="7" x2="20.66" y2="17" />
                  <line x1="20.66" y1="7" x2="3.34" y2="17" />
                </svg>
                <span>RESTRICTED STUDIO · YILBAŞI SÜRÜMÜ 2026</span>
              </div>

              <h1 className="bcm-headline">
                KARARLI ALTYAPI.
                <br />
                ŞEFFAF MÜHENDİSLİK.
                <br />
                <span className="bcm-headline-accent">YÜKSEK PERFORMANS.</span>
              </h1>

              <p className="bcm-subhead">
                Şüpheli sızıntılar ve karmaşık kurulumlarla vakit kaybetmeyin.{' '}
                {catalogStats.total.toLocaleString('tr-TR')}+ doğrulanmış açık kaynak script,
                optimize 3D mekanlar ve sıfır gecikmeli SQL mimarisiyle doğrudan üretime geçin.
              </p>
            </div>

            <div className="bcm-bottom-bar">
              <div className="bcm-actions-row">
                <Link href="/katalog" className="bcm-btn-primary">
                  <span>KATALOĞU KEŞFET</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <a
                  href={ITEMSATIS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bcm-btn-secondary"
                >
                  <ItemsatisLogo
                    variant="icon"
                    width={15}
                    height={15}
                    style={{ filter: 'grayscale(100%) contrast(1.15)' }}
                  />
                  <span>İTEMSATIŞ MAĞAZASI</span>
                </a>
              </div>

              <div className="bcm-stats-inline" aria-label="Temel Değerler">
                <div className="bsi-item">
                  <span className="bsi-val">{catalogStats.total.toLocaleString('tr-TR')}+</span>
                  <span className="bsi-lbl">PAKET</span>
                </div>
                <span className="bsi-sep" aria-hidden="true" />
                <div className="bsi-item">
                  <span className="bsi-val">0.04 ms</span>
                  <span className="bsi-lbl">RESMON</span>
                </div>
                <span className="bsi-sep" aria-hidden="true" />
                <div className="bsi-item">
                  <span className="bsi-val">%100</span>
                  <span className="bsi-lbl">AÇIK KAYNAK</span>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM SUB-BENTO ROW (Symmetrical Twin Architectural Cards) */}
          <div className="bento-sub-row">
            {/* SUB-CARD 1: OPEN-SOURCE ARCHITECTURE */}
            <button
              type="button"
              className="bento-card bento-card-crimson"
              onClick={() => openModal('engineering')}
            >
              <div className="noir-grain-overlay" aria-hidden="true" />

              <div className="bento-card-head">
                <span className="bcc-tag">MÜHENDİSLİK &amp; MİMARİ</span>
                <span className="bcc-circle-btn" aria-hidden="true">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" />
                  </svg>
                </span>
              </div>

              <div className="bcc-art-wrap" aria-hidden="true">
                <img
                  src="/assets/noir-art-opensource.jpg"
                  alt=""
                  className="bento-art-photo"
                />
              </div>

              <div className="bcc-bottom">
                <h2 className="bcc-title">ŞİFRESİZ KOD</h2>
                <p className="bcc-sub">%100 Açık kaynak Lua/JS · Escrow kilitsiz mimari.</p>
              </div>
            </button>

            {/* SUB-CARD 2: DISCORD COMMUNITY */}
            <Link href="/discord" className="bento-card bento-card-noir">
              <div className="noir-grain-overlay" aria-hidden="true" />

              <div className="bento-card-head">
                <span className="bcn-tag">TOPLULUK &amp; DESTEK</span>
                <span className="bcn-circle-btn" aria-hidden="true">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" />
                  </svg>
                </span>
              </div>

              <div className="bcn-art-wrap" aria-hidden="true">
                <img
                  src="/assets/noir-art-discord.jpg"
                  alt=""
                  className="bento-art-photo"
                />
              </div>

              <div className="bcn-bottom">
                <h2 className="bcn-title">DİSCORD</h2>
                <p className="bcn-sub">7/24 Birebir destek talebi ve kurulum danışmanlığı.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: SERENE CHIAROSCURO INVERTED-SPOTLIGHT SHOWCASE */}
        <div className="bento-col-right">
          <section className="bento-card bento-card-showcase" aria-label="Sistem Telemetri Monitörü">
            <div className="noir-grain-heavy" aria-hidden="true" />
            <div className="showcase-inverted-beam" aria-hidden="true" />

            {/* Minimalist New Year North Star + Distant Horizon Constellation */}
            <svg
              className="showcase-polaris-mark"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M28 6 L29.4 16.6 L40 18 L29.4 19.4 L28 30 L26.6 19.4 L16 18 L26.6 16.6 Z"
                fill="currentColor"
              />
              <circle cx="11" cy="11" r="1.1" fill="currentColor" opacity="0.55" />
              <circle cx="40" cy="34" r="0.9" fill="#c62828" opacity="0.7" />
            </svg>

            {/* Singular Signature Image 2 Winter Horizon Monolith behind Console */}
            <svg
              className="showcase-horizon-art"
              viewBox="0 0 400 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 44 Q 65 26, 130 40 T 260 36 T 400 46 L 400 180 L 0 180 Z"
                fill="#090909"
              />
              {/* Soft frost hairline along rolling winter terrain */}
              <path
                d="M0 44 Q 65 26, 130 40 T 260 36 T 400 46"
                stroke="#E8E5DE"
                strokeWidth="1.2"
                fill="none"
                opacity="0.22"
              />
              {/* Monolith cabin silhouette with snow-dusted pitch */}
              <polygon points="312,18 326,8 326,42 312,42" fill="#090909" />
              <polygon points="326,8 340,18 340,42 326,42" fill="#E8E5DE" opacity="0.82" />
              <polyline
                points="311,18.5 326,7.5 341,18.5"
                stroke="#E8E5DE"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.92"
              />
              <rect x="331" y="28" width="5" height="14" fill="#090909" />
              <path
                d="M 185 180 Q 245 135, 215 100 T 308 42"
                stroke="#E8E5DE"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                opacity="0.16"
              />
            </svg>

            <div className="showcase-callout-ticks">
              {/* Calm Obsidian Telemetry Console Mockup */}
              <div className="device-mockup-chassis">
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
                  <span className="device-tps-pill">60.0 TPS</span>
                </div>

                <div className="device-server-selector">
                  <span className="dss-name">◆ Saint Roleplay — Istanbul Engine</span>
                  <span className="dss-tag">ONLINE</span>
                </div>

                {/* Clean 3-Stat Line Row */}
                <div className="device-metrics-strip">
                  <div className="dms-col">
                    <span className="dms-v">0.04 ms</span>
                    <span className="dms-l">Tick</span>
                  </div>
                  <span className="dms-sep" aria-hidden="true" />
                  <div className="dms-col">
                    <span className="dms-v">1.1 ms</span>
                    <span className="dms-l">SQL</span>
                  </div>
                  <span className="dms-sep" aria-hidden="true" />
                  <div className="dms-col">
                    <span className="dms-v">%0</span>
                    <span className="dms-l">Escrow</span>
                  </div>
                </div>

                {/* Widget: Calm Server Capacity Graph */}
                <div className="device-capacity-card">
                  <div className="dcc-head">
                    <div>
                      <span className="dcc-title">SUNUCU KAPASİTESİ</span>
                      <span className="dcc-sub">Eşzamanlı Yük · Bu Hafta</span>
                    </div>
                    <span className="dcc-apex-badge">%91 · 60 FPS</span>
                  </div>

                  <div className="dcc-chart-container">
                    <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="capacity-curve-svg">
                      <defs>
                        <linearGradient id="crimsonPeakFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9B1111" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#080808" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 98 Q 35 88, 60 72 T 115 44 T 155 26 T 205 52 T 255 32 T 320 16 L 320 110 L 0 110 Z"
                        fill="url(#crimsonPeakFill)"
                      />
                      <path
                        d="M 0 98 Q 35 88, 60 72 T 115 44 T 155 26 T 205 52 T 255 32 T 320 16"
                        fill="none"
                        stroke="#E8E5DE"
                        strokeWidth="1.8"
                        opacity="0.88"
                      />
                      <circle cx="155" cy="26" r="3.5" fill="#C83232" stroke="#E8E5DE" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div className="dcc-footer">
                    <span>64 / 64 Oyuncu · %99.99 Uptime</span>
                  </div>
                </div>
              </div>
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
