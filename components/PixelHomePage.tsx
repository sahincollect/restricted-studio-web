'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../app/pixel-home.css';
import catalogStats from '@/lib/catalog-stats.json';
import ItemsatisLogo from '@/components/ItemsatisLogo';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PixelWinterCanvas from '@/components/PixelWinterCanvas';
import PixelCoreMonitor from '@/components/PixelCoreMonitor';

type ModalId = 'about' | 'solutions' | 'engineering' | 'faq' | null;
type CodeTabKey = 'bridge' | 'security' | 'database';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function PixelHomePage(): React.JSX.Element {
  const { t, formatNumber, formatPercent } = useI18n();
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

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

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  const openModal = (id: Exclude<ModalId, null>) => {
    setMobileMenuOpen(false);
    setActiveModal(id);
  };

  return (
    <div className="pixel-noir-shell">
      <div className="px-scanline-layer" aria-hidden="true" />
      <PixelWinterCanvas />

      {/* ===============================================================
           TOP PIXEL HEADER BAR
           =============================================================== */}
      <header className="px-nav" id="navbar">
        <div className="px-nav-brand-group">
          <Link href="/" className="px-brand" aria-label={`Restricted Studio ${t.common.home}`}>
            <span className="px-logo-frame">
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" />
            </span>
            <div className="px-brand-text">
              <div className="px-brand-title-row">
                <span className="px-brand-title">RESTRICTED STUDIO</span>
                {/* Subtle 14x14 Pixel Holiday Pine & Crimson Star Emblem */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  shapeRendering="crispEdges"
                  aria-hidden="true"
                  className="px-holiday-pine"
                >
                  <rect x="6" y="0" width="2" height="2" fill="#FFB84D" />
                  <rect x="6" y="2" width="2" height="2" fill="#A50000" />
                  <rect x="4" y="4" width="6" height="2" fill="#F0F0F0" />
                  <rect x="3" y="6" width="8" height="2" fill="#B8E1FF" />
                  <rect x="2" y="8" width="10" height="2" fill="#F0F0F0" />
                  <rect x="6" y="10" width="2" height="3" fill="#A50000" />
                </svg>
              </div>
              <span className="px-trust-mobile">
                <img src="/assets/itemsatis-icon.png" alt="" width={10} height={10} />
                {t.common.itemsatisTrust}
              </span>
            </div>
          </Link>

          <span className="px-nav-divider" aria-hidden="true" />

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-trust-badge"
            title={t.common.itemsatisOfficialStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={13}
              height={13}
            />
            <span>{t.common.itemsatisTrust}</span>
          </a>
        </div>

        <nav className="px-nav-menu" aria-label={t.common.home}>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'about' ? ' is-active' : ''}`}
            onClick={() => openModal('about')}
          >
            {t.home.nav.about}
          </button>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'solutions' ? ' is-active' : ''}`}
            onClick={() => openModal('solutions')}
          >
            {t.home.nav.solutions}
          </button>
          <Link href="/katalog" className="px-nav-link is-highlight">
            {t.home.nav.catalog}
          </Link>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'engineering' ? ' is-active' : ''}`}
            onClick={() => openModal('engineering')}
          >
            {t.home.nav.engineering}
          </button>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'faq' ? ' is-active' : ''}`}
            onClick={() => openModal('faq')}
          >
            {t.home.nav.faq}
          </button>
        </nav>

        <div className="px-nav-actions">
          <LanguageSwitcher compact className="px-lang-desktop" />

          <Link
            href="/katalog"
            className="px-icon-btn"
            title={t.home.nav.searchTitle}
            aria-label={t.home.nav.searchTitle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="3" y="2" width="6" height="2" fill="currentColor" />
              <rect x="2" y="4" width="2" height="4" fill="currentColor" />
              <rect x="8" y="4" width="2" height="4" fill="currentColor" />
              <rect x="3" y="8" width="6" height="2" fill="currentColor" />
              <rect x="9" y="9" width="2" height="2" fill="currentColor" />
              <rect x="11" y="11" width="2" height="2" fill="currentColor" />
              <rect x="13" y="13" width="2" height="2" fill="currentColor" />
            </svg>
          </Link>

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-itemsatis-btn"
            title={t.common.itemsatisStore}
            aria-label={t.common.itemsatisStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={14}
              height={14}
              style={{ filter: 'grayscale(100%) contrast(1.2)' }}
            />
            <span>{t.common.itemsatisShort.toUpperCase()}</span>
          </a>

          <Link
            href="/discord"
            className="px-icon-btn"
            title={t.home.nav.discordTitle}
            aria-label="Discord"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </Link>

          <Link href="/dashboard" className="px-portal-btn">
            <span className="px-portal-sq" aria-hidden="true" />
            <span>{t.home.nav.portal}</span>
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className="px-mobile-toggle"
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
      <div className={`px-mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
        <div className="px-drawer-lang">
          <span className="px-drawer-lang-label">{t.common.langLabel.toUpperCase()}</span>
          <LanguageSwitcher compact />
        </div>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('about')}>
          <span>{t.home.drawer.about}</span>
          <span>↗</span>
        </button>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('solutions')}>
          <span>{t.home.drawer.solutions}</span>
          <span>↗</span>
        </button>
        <Link href="/katalog" className="px-drawer-btn is-crimson">
          <span>{t.home.drawer.catalog}</span>
          <span>→</span>
        </Link>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('engineering')}>
          <span>{t.home.drawer.engineering}</span>
          <span>↗</span>
        </button>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('faq')}>
          <span>{t.home.drawer.faq}</span>
          <span>↗</span>
        </button>
        <Link href="/dashboard" className="px-drawer-btn is-light">
          <span>{t.home.drawer.portal}</span>
          <span>→</span>
        </Link>
        <a
          href={ITEMSATIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-drawer-btn"
        >
          <span>{t.home.drawer.itemsatis}</span>
          <span>↗</span>
        </a>
        <Link href="/discord" className="px-drawer-btn">
          <span>{t.home.drawer.discord}</span>
          <span>↗</span>
        </Link>
        <Link href="/status" className="px-drawer-btn">
          <span>{t.home.drawer.status}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ===============================================================
           VIEWPORT-LOCKED PIXEL HOLIDAY SPLIT GRID
           =============================================================== */}
      <main className="px-grid">
        {/* LEFT COLUMN */}
        <div className="px-col-left">
          {/* HERO CARD WITH HD-2D WINTER CITADEL PIXEL ART */}
          <section className="px-panel px-hero">
            <div className="px-hero-art" aria-hidden="true">
              <img
                src="/assets/pixel-holiday-citadel.png"
                alt=""
                className="px-pixel-img"
              />
              <div className="px-hero-vignette" />
            </div>

            <div className="px-hero-top">
              <div className="px-eyebrow">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  shapeRendering="crispEdges"
                  aria-hidden="true"
                >
                  <rect x="5" y="1" width="2" height="10" fill="#A50000" />
                  <rect x="1" y="5" width="10" height="2" fill="#A50000" />
                  <rect x="3" y="3" width="2" height="2" fill="#FFB84D" />
                  <rect x="7" y="3" width="2" height="2" fill="#FFB84D" />
                  <rect x="3" y="7" width="2" height="2" fill="#FFB84D" />
                  <rect x="7" y="7" width="2" height="2" fill="#FFB84D" />
                </svg>
                <span>{t.home.hero.eyebrow}</span>
              </div>

              <h1 className="px-headline">
                {t.home.hero.headline1}
                <br />
                {t.home.hero.headline2}
                <br />
                <span className="px-headline-accent">{t.home.hero.headline3}</span>
              </h1>

              <p className="px-subhead">
                {t.home.hero.subheadBeforeCount}{' '}
                {formatNumber(catalogStats.total)}
                {t.home.hero.subheadAfterCount}
              </p>
            </div>

            <div className="px-hero-bottom">
              <div className="px-hero-actions">
                <Link href="/katalog" className="px-btn px-btn-snow">
                  <span>{t.home.hero.exploreCatalog}</span>
                  <span aria-hidden="true">→</span>
                </Link>

                <a
                  href={ITEMSATIS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-btn px-btn-dark"
                >
                  <ItemsatisLogo
                    variant="icon"
                    width={14}
                    height={14}
                    style={{ filter: 'grayscale(100%) contrast(1.2)' }}
                  />
                  <span>{t.common.itemsatisStore.toUpperCase()}</span>
                </a>
              </div>

              <div className="px-hero-stats" aria-label={t.home.hero.statValuesAria}>
                <div className="px-stat-item">
                  <span className="px-stat-val">{formatNumber(catalogStats.total)}+</span>
                  <span className="px-stat-lbl">{t.home.hero.statPackages}</span>
                </div>
                <span className="px-stat-sep" aria-hidden="true" />
                <div className="px-stat-item">
                  <span className="px-stat-val">0.04 ms</span>
                  <span className="px-stat-lbl">{t.home.hero.statResmon}</span>
                </div>
                <span className="px-stat-sep" aria-hidden="true" />
                <div className="px-stat-item">
                  <span className="px-stat-val">{formatPercent(100)}</span>
                  <span className="px-stat-lbl">{t.home.hero.statOpenSource}</span>
                </div>
              </div>
            </div>
          </section>

          {/* SYMMETRICAL TWIN PIXEL FEATURE CARDS */}
          <div className="px-sub-row">
            <button
              type="button"
              className="px-panel px-card px-card-crimson"
              onClick={() => openModal('engineering')}
            >
              <div className="px-card-head">
                <span className="px-card-tag">{t.home.cards.engTag}</span>
                <span className="px-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>

              <div className="px-card-art" aria-hidden="true">
                <img
                  src="/assets/pixel-holiday-vault.png"
                  alt=""
                  className="px-pixel-img"
                />
              </div>

              <div className="px-card-bottom">
                <h2 className="px-card-title">{t.home.cards.engTitle}</h2>
                <p className="px-card-sub">{t.home.cards.engSub}</p>
              </div>
            </button>

            <Link href="/discord" className="px-panel px-card px-card-noir">
              <div className="px-card-head">
                <span className="px-card-tag">{t.home.cards.discordTag}</span>
                <span className="px-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>

              <div className="px-card-art" aria-hidden="true">
                <img
                  src="/assets/pixel-holiday-beacon.png"
                  alt=""
                  className="px-pixel-img"
                />
              </div>

              <div className="px-card-bottom">
                <h2 className="px-card-title">{t.home.cards.discordTitle}</h2>
                <p className="px-card-sub">{t.home.cards.discordSub}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: PIXEL CORE TELEMETRY & WINTER SKYLINE */}
        <div className="px-col-right">
          <div className="px-panel px-core-panel">
            <div className="px-core-backdrop" aria-hidden="true">
              <img
                src="/assets/pixel-holiday-skyline.png"
                alt=""
                className="px-skyline-img"
              />
              <div className="px-core-mask" />
            </div>

            <PixelCoreMonitor />
          </div>
        </div>
      </main>

      {/* ===============================================================
           IN-VIEWPORT PIXEL MODALS
           =============================================================== */}
      {activeModal && (
        <div
          className="px-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div className="px-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="px-modal-head">
              <div>
                <p className="px-modal-eyebrow">
                  {activeModal === 'about' && t.home.modals.aboutEyebrow}
                  {activeModal === 'solutions' && t.home.modals.solutionsEyebrow}
                  {activeModal === 'engineering' && t.home.modals.engineeringEyebrow}
                  {activeModal === 'faq' && t.home.modals.faqEyebrow}
                </p>
                <h2 className="px-modal-title">
                  {activeModal === 'about' && t.home.modals.aboutTitle}
                  {activeModal === 'solutions' && t.home.modals.solutionsTitle}
                  {activeModal === 'engineering' && t.home.modals.engineeringTitle}
                  {activeModal === 'faq' && t.home.modals.faqTitle}
                </h2>
              </div>
              <button
                type="button"
                className="px-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label={t.common.close}
              >
                ✕
              </button>
            </div>

            {activeModal === 'about' && (
              <div>
                <p className="px-modal-lead">
                  <strong>{t.home.modals.aboutLeadBold}</strong>
                  {t.home.modals.aboutLeadRest}
                </p>

                <div className="px-modal-grid-3">
                  {t.home.modals.aboutCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <table className="px-compare-table">
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

            {activeModal === 'solutions' && (
              <div>
                <div className="px-modal-grid-2">
                  {t.home.modals.solutionsCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                      <div className="px-chip-row">
                        <span className="px-chip">{card.chips[0]}</span>
                        <span className="px-chip">{card.chips[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-archive-modal-wrap">
                  <div className="px-archive-modal-head">
                    <span>
                      {t.home.modals.archiveDistribution} ({formatNumber(catalogStats.total)}{' '}
                      {t.home.modals.archivePackagesUnit})
                    </span>
                    <Link href="/katalog">{t.home.modals.openCatalogLink}</Link>
                  </div>
                  <div className="px-archive-bars">
                    {statRows.map(([cat, count]) => {
                      const pct = Math.round((count / catalogStats.total) * 100);
                      return (
                        <div key={cat} className="px-archive-row">
                          <div className="px-archive-label">
                            <span>{t.catalog.categoryLabels[cat] || cat}</span>
                            <b>
                              {formatNumber(count)} ({formatPercent(pct)})
                            </b>
                          </div>
                          <div className="px-segment-track">
                            <div className="px-segment-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'engineering' && (
              <div>
                <div className="px-modal-grid-3" style={{ marginBottom: '14px' }}>
                  {t.home.modals.engineeringCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <div className="px-code-tabs">
                  {(Object.keys(codeSnippets) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`px-code-tab${codeTab === key ? ' active' : ''}`}
                      onClick={() => setCodeTab(key)}
                    >
                      {codeSnippets[key].label}
                    </button>
                  ))}
                </div>

                <pre className="px-code-pre">
                  <code>{codeSnippets[codeTab].code}</code>
                </pre>
              </div>
            )}

            {activeModal === 'faq' && (
              <div>
                {t.home.modals.faqItems.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className={`px-faq-item${isOpen ? ' active' : ''}`}>
                      <button
                        type="button"
                        className="px-faq-trigger"
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className="px-faq-body">{item.a}</div>}
                    </div>
                  );
                })}

                <div className="px-modal-cta-row">
                  <Link href="/katalog" className="px-btn px-btn-crimson">
                    {t.home.modals.goToCatalog}
                  </Link>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-btn px-btn-dark"
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
