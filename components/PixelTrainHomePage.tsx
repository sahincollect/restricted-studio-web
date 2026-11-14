'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import catalogStats from '../lib/catalog-stats.json';
import { useI18n } from '../components/I18nProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { PIXEL_TRAIN_WAGONS } from '../lib/pixel-train-config';
import '../app/pixel-train.css';

type ModalId = 'about' | 'solutions' | 'engineering' | 'faq' | null;
type CodeTabKey = 'bridge' | 'security' | 'database';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function PixelTrainHomePage() {
  const { t, formatNumber, formatPercent } = useI18n();
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);
  const [isCruising, setIsCruising] = useState<boolean>(true);
  const [selectedCar, setSelectedCar] = useState<string>('promo-100tl');
  const [healthStatus, setHealthStatus] = useState<{ label: string; latency: string }>({
    label: 'AKTİF',
    latency: '0.01ms',
  });

  const codeSnippets: Record<CodeTabKey, { label: string; code: string }> = {
    bridge: {
      label: 'bridge.lua',
      code: `-- ${t.home.modals.codeComments.bridge}
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
      code: `-- ${t.home.modals.codeComments.security}
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
      code: `-- ${t.home.modals.codeComments.database}
CREATE TABLE IF NOT EXISTS \`restricted_records\` (
    \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`citizenid\` VARCHAR(50) NOT NULL,
    \`data\` LONGTEXT NOT NULL,
    INDEX \`idx_citizen\` (\`citizenid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    },
  };

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

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const ok = data.status === 'ok' || data.status === 'healthy';
        setHealthStatus({
          label: ok ? 'AKTİF' : 'İZLENİYOR',
          latency: '0.01ms',
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  const openModal = (id: Exclude<ModalId, null>) => {
    setMobileMenuOpen(false);
    setActiveModal(id);
  };

  const currentWagon =
    PIXEL_TRAIN_WAGONS.find((w) => w.id === selectedCar) ?? PIXEL_TRAIN_WAGONS[0];

  return (
    <div className={`pixel-train-shell px-train-shell ${isCruising ? 'is-cruising' : 'is-docked'}`}>
      {/* Low-glare Pixel Night Backdrop (Moon, Stars, Distant Pixel Skyline) */}
      <div className="px-night-sky" aria-hidden="true">
        <svg
          className="px-sky-svg px-crisp"
          viewBox="0 0 320 180"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Pixel Stars */}
          <g fill="#5b6888">
            <rect x="18" y="14" width="2" height="2" />
            <rect x="52" y="28" width="1" height="1" />
            <rect x="86" y="12" width="2" height="2" />
            <rect x="134" y="22" width="1" height="1" />
            <rect x="176" y="10" width="2" height="2" />
            <rect x="218" y="19" width="1" height="1" />
            <rect x="292" y="15" width="2" height="2" />
            <rect x="38" y="46" width="1" height="1" />
            <rect x="112" y="40" width="1" height="1" />
            <rect x="204" y="44" width="2" height="2" />
          </g>
          {/* Soft Amber Pixel Stars */}
          <g fill="#a37c40">
            <rect x="68" y="18" width="2" height="2" />
            <rect x="158" y="30" width="2" height="2" />
            <rect x="242" y="14" width="2" height="2" />
          </g>
          {/* Pixel Crescent Moon */}
          <g transform="translate(260, 18)">
            <rect x="4" y="0" width="10" height="2" fill="#d8c396" />
            <rect x="2" y="2" width="14" height="2" fill="#d8c396" />
            <rect x="0" y="4" width="16" height="8" fill="#d8c396" />
            <rect x="2" y="12" width="14" height="2" fill="#d8c396" />
            <rect x="4" y="14" width="10" height="2" fill="#d8c396" />
            <rect x="2" y="2" width="6" height="10" fill="#090c13" />
          </g>
          {/* Distant Pixel Mountain Ridge */}
          <path
            d="M0 140 L0 116 L24 116 L24 108 L48 108 L48 118 L76 118 L76 104 L108 104 L108 114 L144 114 L144 100 L176 100 L176 112 L212 112 L212 106 L248 106 L248 116 L284 116 L284 108 L320 108 L320 140 Z"
            fill="#0c1018"
          />
          {/* Distant Pixel City Silhouette */}
          <g fill="#111622">
            <rect x="12" y="122" width="16" height="24" />
            <rect x="32" y="114" width="12" height="32" />
            <rect x="48" y="126" width="20" height="20" />
            <rect x="82" y="118" width="14" height="28" />
            <rect x="122" y="112" width="18" height="34" />
            <rect x="144" y="122" width="14" height="24" />
            <rect x="188" y="116" width="16" height="30" />
            <rect x="224" y="120" width="22" height="26" />
            <rect x="268" y="114" width="16" height="32" />
            <rect x="290" y="124" width="18" height="22" />
          </g>
          {/* Subtle Warm Distant City Windows */}
          <g fill="#614928">
            <rect x="35" y="118" width="2" height="2" />
            <rect x="39" y="122" width="2" height="2" />
            <rect x="126" y="116" width="2" height="2" />
            <rect x="132" y="120" width="2" height="2" />
            <rect x="192" y="120" width="2" height="2" />
            <rect x="272" y="118" width="2" height="2" />
          </g>
        </svg>
      </div>

      {/* ===============================================================
           TOP FLOATING PILL NAVBAR (100% Parity with Noir Navigation)
           =============================================================== */}
      <header className="bento-pill-nav" id="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <div className="bpn-brand-group">
          <Link href="/" className="bpn-brand" aria-label={`Restricted Studio ${t.common.home}`}>
            <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="bpn-logo" />
            <div className="bpn-brand-text">
              <span className="bpn-title">RESTRICTED STUDIO</span>
              <span className="bpn-trust-mobile">
                <img src="/assets/itemsatis-icon.png" alt="" width={10} height={10} />
                {t.common.itemsatisTrust}
              </span>
            </div>
          </Link>

          <span className="bpn-brand-divider" aria-hidden="true" />

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bpn-trust-badge"
            title={t.common.itemsatisOfficialStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={13}
              height={13}
              className="bpn-trust-icon"
            />
            <span>{t.common.itemsatisTrust}</span>
          </a>
        </div>

        <nav className="bpn-menu" aria-label={t.common.home}>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'about' ? 'is-active' : ''}`}
            onClick={() => openModal('about')}
          >
            {t.home.nav.about}
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'solutions' ? 'is-active' : ''}`}
            onClick={() => openModal('solutions')}
          >
            {t.home.nav.solutions}
          </button>
          <Link href="/katalog" className="bpn-link bpn-link-highlight">
            {t.home.nav.catalog}
          </Link>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'engineering' ? 'is-active' : ''}`}
            onClick={() => openModal('engineering')}
          >
            {t.home.nav.engineering}
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'faq' ? 'is-active' : ''}`}
            onClick={() => openModal('faq')}
          >
            {t.home.nav.faq}
          </button>
        </nav>

        <div className="bpn-actions">
          <LanguageSwitcher compact className="bpn-lang-desktop" />

          <Link
            href="/katalog"
            className="bpn-icon-btn"
            title={t.home.nav.searchTitle}
            aria-label={t.home.nav.searchTitle}
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
            title={t.common.itemsatisStore}
            aria-label={t.common.itemsatisStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={15}
              height={15}
              className="bpn-itemsatis-img"
            />
            <span className="bpn-itemsatis-label">{t.common.itemsatisShort.toUpperCase()}</span>
          </a>

          <Link
            href="/discord"
            className="bpn-icon-btn"
            title={t.home.nav.discordTitle}
            aria-label="Discord"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </Link>

          <Link href="/dashboard" className="bpn-portal-btn">
            <span className="bpn-portal-dot" aria-hidden="true" />
            <span>{t.home.nav.portal}</span>
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={t.common.openMenu}
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`bpn-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} style={{ zIndex: 12 }}>
        <div style={{ padding: '4px 0 8px', borderBottom: '1px solid rgba(240,240,240,0.16)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(240,240,240,0.65)', letterSpacing: '0.08em' }}>
            {t.common.langLabel.toUpperCase()}
          </span>
          <LanguageSwitcher compact />
        </div>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('about')}>
          <span>{t.home.drawer.about}</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('solutions')}>
          <span>{t.home.drawer.solutions}</span>
          <span>↗</span>
        </button>
        <Link href="/katalog" className="bmn-link-btn" style={{ background: '#A50000' }}>
          <span>{t.home.drawer.catalog}</span>
          <span>→</span>
        </Link>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('engineering')}>
          <span>{t.home.drawer.engineering}</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('faq')}>
          <span>{t.home.drawer.faq}</span>
          <span>↗</span>
        </button>
        <Link href="/dashboard" className="bmn-link-btn" style={{ background: '#F0F0F0', color: '#080808' }}>
          <span>{t.home.drawer.portal}</span>
          <span>→</span>
        </Link>
        <a
          href={ITEMSATIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bmn-link-btn"
        >
          <span>{t.home.drawer.itemsatis}</span>
          <span>↗</span>
        </a>
        <Link href="/discord" className="bmn-link-btn">
          <span>{t.home.drawer.discord}</span>
          <span>↗</span>
        </Link>
        <Link href="/status" className="bmn-link-btn">
          <span>{t.home.drawer.status}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* Station Dispatch Telemetry HUD */}
      <section className="px-station-hud" aria-label="Tren İstasyonu Durum Paneli">
        <div className="px-hud-left">
          <span className="px-line-badge">
            <span className="px-line-led" aria-hidden="true" />
            HAT 01 // RESTRICTED NIGHT EXPRESS
          </span>
          <span className="px-hud-headline">
            Vagonlara tıklayarak doğrudan ilgili merkeze gidin —{' '}
            <strong>TÜM ÜRÜNLER 100TL!</strong> &amp; <strong>15+ ALIMA %50 İNDİRİM</strong>
          </span>
        </div>

        <div className="px-hud-controls">
          <button
            type="button"
            className={`px-mode-btn ${isCruising ? 'is-active' : ''}`}
            onClick={() => setIsCruising((prev) => !prev)}
            aria-pressed={isCruising}
          >
            {isCruising ? '◼ SEYİR MODU: AKTİF' : '▶ İSTASYONDA BEKLİYOR'}
          </button>
          <button
            type="button"
            className="px-mode-btn"
            onClick={() => openModal('engineering')}
          >
            ⚙ MOTOR MİMARİSİ
          </button>
        </div>
      </section>

      {/* Center Stage: Pixel Art Train + Coupled Campaign & Route Wagons */}
      <main className="px-train-stage" aria-label="Pixel Art Tren ve Kampanya Vagonları">
        {/* Overhead Pixel Catenary Line */}
        <div className="px-catenary-bar" aria-hidden="true">
          <span className="px-catenary-mast" />
          <span className="px-catenary-tag">ELEKTRİKLİ HAT // 25kV AC · 0.01ms RESMON</span>
          <span className="px-catenary-mast" />
          <span className="px-catenary-tag">FIVEM &amp; GTA V PREMIUM ARŞİV HATTI</span>
          <span className="px-catenary-mast" />
        </div>

        {/* Horizontally Coupled Train Cars */}
        <div className="px-train-assembly">
          {/* 1. PIXEL ART LOCOMOTIVE (Engine Head) */}
          <button
            type="button"
            className={`px-locomotive-card ${selectedCar === 'loco' ? 'is-selected' : ''}`}
            onMouseEnter={() => setSelectedCar('loco')}
            onClick={() => openModal('engineering')}
            aria-label="RS-2026 Pixel Lokomotif - Teknik Mimariyi Görüntüle"
          >
            <div>
              <div className="px-loco-top">
                <span className="px-loco-id">LOKOMOTİF // RS-01</span>
                <span className="px-loco-speed">{isCruising ? '88 KM/S' : '00 KM/S'}</span>
              </div>

              {/* Crisp Pixel Art Locomotive SVG */}
              <div className="px-loco-art-wrap">
                <svg
                  className="px-loco-svg px-crisp"
                  viewBox="0 0 88 48"
                  aria-hidden="true"
                >
                  {/* Pixel Smoke Puffs */}
                  <g className="px-smoke-puff-1" fill="#4f5b78">
                    <rect x="20" y="3" width="6" height="3" />
                    <rect x="24" y="1" width="5" height="2" />
                  </g>
                  <g className="px-smoke-puff-2" fill="#3a445c">
                    <rect x="30" y="2" width="7" height="3" />
                  </g>

                  {/* Warm Headlamp Beam Cone (left-facing) */}
                  <polygon
                    points="0,20 11,24 11,30 0,34"
                    fill="rgba(232, 168, 72, 0.22)"
                  />

                  {/* Smokestack */}
                  <rect x="18" y="8" width="6" height="9" fill="#2c354a" />
                  <rect x="17" y="7" width="8" height="2" fill="#8c2830" />

                  {/* Boiler Cylinder */}
                  <rect x="12" y="17" width="44" height="17" fill="#1e2536" />
                  <rect x="12" y="17" width="44" height="3" fill="#2f3a54" />
                  {/* Crimson Stripe Along Boiler */}
                  <rect x="12" y="25" width="44" height="3" fill="#a52a32" />
                  {/* Brass Boiler Bands */}
                  <rect x="24" y="17" width="2" height="17" fill="#c79246" />
                  <rect x="38" y="17" width="2" height="17" fill="#c79246" />

                  {/* Engineer Cabin (Right Side of Loco) */}
                  <rect x="54" y="11" width="28" height="23" fill="#242c40" />
                  <rect x="52" y="9" width="32" height="3" fill="#8c2830" />
                  {/* Warm Lit Cabin Windows */}
                  <rect x="58" y="15" width="9" height="8" fill="#e8a848" />
                  <rect x="70" y="15" width="8" height="8" fill="#d99538" />
                  <rect x="59" y="16" width="3" height="2" fill="#fff1d0" />

                  {/* Front Headlamp */}
                  <rect x="9" y="22" width="3" height="6" fill="#e8a848" />
                  <rect x="8" y="23" width="1" height="4" fill="#fff2cc" />

                  {/* Cowcatcher / Front Bumper (Left) */}
                  <polygon points="4,38 12,31 12,38" fill="#7d242b" />
                  <rect x="6" y="34" width="6" height="2" fill="#b83741" />

                  {/* Chassis Deck */}
                  <rect x="10" y="34" width="74" height="4" fill="#323d57" />

                  {/* Pixel Drive Wheels + Side Rod */}
                  <g>
                    <rect x="16" y="37" width="9" height="9" fill="#171b26" stroke="#7d2830" strokeWidth="2" />
                    <rect x="31" y="37" width="9" height="9" fill="#171b26" stroke="#7d2830" strokeWidth="2" />
                    <rect x="46" y="37" width="9" height="9" fill="#171b26" stroke="#7d2830" strokeWidth="2" />
                    <rect x="64" y="37" width="9" height="9" fill="#171b26" stroke="#5f6f94" strokeWidth="2" />
                    {/* Steel Connecting Rod */}
                    <rect x="19" y="41" width="33" height="2" fill="#c79246" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="px-loco-footer">
              <span className="px-loco-title">RS-2026 ANA LOKOMOTİF</span>
              <span className="px-loco-sub">
                Sıfır şifreleme · &lt;0.02ms çekirdek mimariyi incelemek için tıklayın
              </span>
            </div>

            <div className="px-undercarriage" aria-hidden="true">
              <div className="px-bogie">
                <span className="px-wheel" />
                <span className="px-wheel" />
              </div>
              <div className="px-bogie">
                <span className="px-wheel" />
                <span className="px-wheel" />
              </div>
            </div>
          </button>

          {/* 2. COUPLED PIXEL WAGONS (Including Required Promo Banners) */}
          {PIXEL_TRAIN_WAGONS.map((wagon, idx) => (
            <Link
              key={wagon.id}
              href={wagon.href}
              className={`px-wagon px-wagon--${wagon.tone} ${
                selectedCar === wagon.id ? 'is-selected' : ''
              }`}
              onMouseEnter={() => setSelectedCar(wagon.id)}
              onFocus={() => setSelectedCar(wagon.id)}
            >
              {/* Pixel Roof */}
              <div className="px-wagon-roof" aria-hidden="true" />

              <div className="px-wagon-body">
                <div className="px-wagon-meta">
                  <span className="px-wagon-code">{wagon.code}</span>
                  <span className="px-wagon-tag">{wagon.tag}</span>
                </div>

                {/* High-Contrast Eye-Friendly Pixel Signboard on Wagon */}
                <div className="px-wagon-signboard">
                  <h2 className="px-wagon-banner-text">{wagon.banner}</h2>
                </div>

                {/* Illuminated Pixel Passenger Windows */}
                <div className="px-wagon-windows" aria-hidden="true">
                  <span className="px-window-pane is-lit" />
                  <span className={`px-window-pane ${idx % 2 === 0 ? 'is-lit' : ''}`} />
                  <span className="px-window-pane is-lit" />
                  <span className={`px-window-pane ${idx !== 1 ? 'is-lit' : ''}`} />
                </div>

                <p className="px-wagon-desc">{wagon.sub}</p>
                <p className="px-wagon-spec">{wagon.spec}</p>

                <div className="px-wagon-cta-row">
                  <span className="px-wagon-cta">{wagon.cta}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: '#6d7891',
                    }}
                  >
                    [0{idx + 1}]
                  </span>
                </div>
              </div>

              {/* Pixel Bogie Wheelsets */}
              <div className="px-undercarriage" aria-hidden="true">
                <div className="px-bogie">
                  <span className="px-wheel" />
                  <span className="px-wheel" />
                </div>
                <div className="px-bogie">
                  <span className="px-wheel" />
                  <span className="px-wheel" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Continuous Pixel Trackbed & Stone Viaduct Under All Cars */}
        <div className="px-trackbed" aria-hidden="true">
          <div className="px-rail-steel" />
          <div className="px-rail-ties" />
          <div className="px-viaduct-wall" />
        </div>
      </main>

      {/* Bottom Station Platform Inspector & Fast Navigation Dock */}
      <footer className="px-platform-dock" aria-label="İstasyon Peronu ve Hızlı Erişim">
        <div className="px-inspector-info">
          <span className="px-inspector-badge">
            {selectedCar === 'loco' ? 'LOKOMOTİF RS-01' : currentWagon.code}
          </span>
          <span className="px-inspector-text">
            {selectedCar === 'loco' ? (
              <>
                <strong>RS-2026 Çekirdek Motor:</strong> %100 açık kaynak Lua/JS mimarisi · Sıfır
                şifreleme · {healthStatus.label} ({healthStatus.latency})
              </>
            ) : (
              <>
                <strong>{currentWagon.banner}:</strong> {currentWagon.sub}
              </>
            )}
          </span>
        </div>

        <div className="px-station-links">
          <Link href="/katalog" className="px-station-pill px-station-pill--primary">
            <span>KATALOG ({formatNumber(catalogStats.total)}+)</span>
            <span aria-hidden="true">→</span>
          </Link>
          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-station-pill"
          >
            <span>İTEMSATIŞ MAĞAZA</span>
            <span aria-hidden="true">↗</span>
          </a>
          <Link href="/dashboard" className="px-station-pill">
            <span>MÜŞTERİ PORTALI</span>
          </Link>
          <Link href="/status" className="px-station-pill">
            <span>SİSTEM DURUMU ({healthStatus.label})</span>
          </Link>
          <Link href="/discord" className="px-station-pill">
            <span>DISCORD</span>
          </Link>
        </div>
      </footer>

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
                  {activeModal === 'about' && t.home.modals.aboutEyebrow}
                  {activeModal === 'solutions' && t.home.modals.solutionsEyebrow}
                  {activeModal === 'engineering' && t.home.modals.engineeringEyebrow}
                  {activeModal === 'faq' && t.home.modals.faqEyebrow}
                </p>
                <h2 className="noir-modal-title">
                  {activeModal === 'about' && t.home.modals.aboutTitle}
                  {activeModal === 'solutions' && t.home.modals.solutionsTitle}
                  {activeModal === 'engineering' && t.home.modals.engineeringTitle}
                  {activeModal === 'faq' && t.home.modals.faqTitle}
                </h2>
              </div>
              <button
                type="button"
                className="noir-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label={t.common.close}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: ABOUT */}
            {activeModal === 'about' && (
              <div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'rgba(240,240,240,0.85)', marginBottom: '12px' }}>
                  <strong>{t.home.modals.aboutLeadBold}</strong>
                  {t.home.modals.aboutLeadRest}
                </p>

                <div className="noir-modal-grid-3">
                  {t.home.modals.aboutCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <table className="noir-compare-table">
                  <thead>
                    <tr>
                      {t.home.modals.compareHeaders.map((hdr) => (
                        <th key={hdr}>{hdr}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.home.modals.compareRows.map(([c1, c2, c3]) => (
                      <tr key={c1}>
                        <td>{c1}</td>
                        <td>{c2}</td>
                        <td>{c3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Body: SOLUTIONS */}
            {activeModal === 'solutions' && (
              <div>
                <div className="noir-modal-grid-2">
                  {t.home.modals.solutionsCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                      <div className="noir-chip-row">
                        <span className="noir-chip">{card.chips[0]}</span>
                        <span className="noir-chip">{card.chips[1]}</span>
                      </div>
                    </div>
                  ))}
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
                    <span>
                      {t.home.modals.archiveDistribution} ({formatNumber(catalogStats.total)}{' '}
                      {t.home.modals.archivePackagesUnit})
                    </span>
                    <Link href="/katalog" style={{ color: '#A50000', textDecoration: 'underline' }}>
                      {t.home.modals.openCatalogLink}
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
                            <span>{t.catalog.categoryLabels[cat] || cat}</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatNumber(count)} ({formatPercent(pct)})
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
                  {t.home.modals.engineeringCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <div className="noir-code-tabs">
                  {(Object.keys(codeSnippets) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`noir-code-tab ${codeTab === key ? 'active' : ''}`}
                      onClick={() => setCodeTab(key)}
                    >
                      {codeSnippets[key].label}
                    </button>
                  ))}
                </div>

                <pre className="noir-code-pre">
                  <code>{codeSnippets[codeTab].code}</code>
                </pre>
              </div>
            )}

            {/* Modal Body: FAQ */}
            {activeModal === 'faq' && (
              <div>
                {t.home.modals.faqItems.map((item, idx) => {
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
                    {t.home.modals.goToCatalog}
                  </Link>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-discord-solid"
                    style={{ flex: '1 1 200px' }}
                  >
                    {t.home.modals.itemsatisLink}
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
