'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import catalogStats from '@/lib/catalog-stats.json';
import { useI18n } from '@/components/I18nProvider';
import { useCrtTransition } from '@/components/CrtTransitionProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function AboutStudioClient() {
  const { t, formatNumber, formatPercent } = useI18n();
  const { navigateWithCrt } = useCrtTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  const handleCrtLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    navigateWithCrt(href);
  };

  return (
    <div className="rs-about-shell">
      <div className="rs-about-scanlines" aria-hidden="true" />
      <div className="rs-about-glow" aria-hidden="true" />

      {/* Top Navigation Bar matching Homepage Pill Navbar */}
      <div className="rs-about-nav-wrap">
        <header className="bento-pill-nav rs-about-pill-nav" id="navbar">
          <div className="bpn-brand-group">
            <Link
              href="/"
              onClick={(e) => handleCrtLink(e, '/')}
              className="bpn-brand"
              aria-label={`Restricted Studio ${t.common.home}`}
            >
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
            <Link href="/hakkimizda" className="bpn-link is-active">
              HAKKIMIZDA
            </Link>
            <Link href="/katalog" className="bpn-link bpn-link-highlight">
              KATALOG
            </Link>
            <Link href="/lisanslar" className="bpn-link bpn-link-highlight">
              {t.common.licenses.toLocaleUpperCase('tr')}
            </Link>
            <a href="#sss" className="bpn-link">
              SSS
            </a>
            <Link href="/iletisim" className="bpn-link">
              İLETİŞİM
            </Link>
          </nav>

          <div className="bpn-actions">
            <LanguageSwitcher compact className="bpn-lang-desktop" />

            <Link
              href="/"
              onClick={(e) => handleCrtLink(e, '/')}
              className="bpn-icon-btn"
              title="Ana Sayfaya Dön"
              aria-label="Ana Sayfaya Dön"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 18l-6-6 6-6" />
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
              href="/iletisim"
              className="bpn-icon-btn"
              title="İletişim: info@restrictedstudio.shop"
              aria-label="İletişim"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

        <div className={`bpn-mobile-drawer rs-about-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="rs-about-drawer-lang">
            <span>{t.common.langLabel.toUpperCase()}</span>
            <LanguageSwitcher compact />
          </div>
          <Link
            href="/"
            onClick={(e) => handleCrtLink(e, '/')}
            className="bmn-link-btn"
          >
            <span>← SOKAK SAHNESİ / ANA SAYFA</span>
            <span>↗</span>
          </Link>
          <Link href="/katalog" className="bmn-link-btn rs-about-drawer-catalog">
            <span>KATALOG (6.400+)</span>
            <span>→</span>
          </Link>
          <Link href="/lisanslar" className="bmn-link-btn" style={{ borderColor: '#A50000' }}>
            <span className="nav-katalog-shimmer">{t.common.licenses.toLocaleUpperCase('tr')}</span>
            <span>→</span>
          </Link>
          <a
            href="#sss"
            className="bmn-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>SSS</span>
            <span>↓</span>
          </a>
          <Link href="/iletisim" className="bmn-link-btn">
            <span>İLETİŞİM</span>
            <span>→</span>
          </Link>
          <Link href="/dashboard" className="bmn-link-btn rs-about-drawer-portal">
            <span>{t.home.drawer.portal}</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Main Retro CRT Terminal Content */}
      <main className="rs-about-main">
        <div className="rs-about-window">
          {/* Terminal Window Chrome */}
          <div className="rs-about-chrome">
            <div className="rs-about-dots" aria-hidden="true">
              <span className="rs-dot rs-dot--red" />
              <span className="rs-dot rs-dot--amber" />
              <span className="rs-dot rs-dot--blue" />
            </div>
            <div className="rs-about-chrome-title">
              CH-02 // RS-STUDIO — [HAKKIMIZDA &amp; MÜHENDİSLİK DOSYASI]
            </div>
            <Link
              href="/"
              onClick={(e) => handleCrtLink(e, '/')}
              className="rs-about-channel-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 19v2" />
              </svg>
              <span>SOKAK SAHNESİNE DÖN</span>
            </Link>
          </div>

          <div className="rs-about-body">
            {/* Hero Intro Block */}
            <section className="rs-about-hero">
              <div className="rs-about-hero-main">
                <div className="rs-about-eyebrow">
                  <span className="rs-live-led" />
                  <span>{t.home.modals.aboutEyebrow}</span>
                </div>
                <h1 className="rs-about-title">{t.home.modals.aboutTitle}</h1>
                <p className="rs-about-lead">
                  <strong>{t.home.modals.aboutLeadBold}</strong>
                  {t.home.modals.aboutLeadRest}
                </p>

                <div className="rs-about-cta-row">
                  <Link href="/katalog" className="rs-about-btn-primary">
                    KATALOĞU KEŞFET ({formatNumber(catalogStats.total)}+) →
                  </Link>
                  <Link href="/iletisim" className="rs-about-btn-ghost">
                    İLETİŞİM (info@restrictedstudio.shop)
                  </Link>
                </div>
              </div>

              {/* Right Telemetry Monitor */}
              <aside className="rs-about-telemetry" aria-label="Arşiv İstatistikleri">
                <div className="rs-tele-head">
                  <span>CANLI ARŞİV DAĞILIMI</span>
                  <span className="rs-tele-total">
                    {formatNumber(catalogStats.total)} {t.home.modals.archivePackagesUnit}
                  </span>
                </div>
                <div className="rs-tele-bars">
                  {statRows.map(([cat, count]) => {
                    const pct = Math.max(2, Math.round((count / catalogStats.total) * 100));
                    return (
                      <div key={cat} className="rs-tele-row">
                        <div className="rs-tele-labels">
                          <span>{t.catalog.categoryLabels[cat] || cat}</span>
                          <span className="rs-tele-val">
                            {formatNumber(count)} ({formatPercent(pct)})
                          </span>
                        </div>
                        <div className="rs-tele-track">
                          <div className="rs-tele-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </section>

            {/* 3 Core Principles */}
            <section className="rs-about-cards" aria-label="Stüdyo İlkeleri">
              {t.home.modals.aboutCards.map((card, i) => (
                <article key={card.title} className="rs-about-card">
                  <div className="rs-about-card-num">0{i + 1} // STANDART</div>
                  <h2>{card.title}</h2>
                  <p>{card.body}</p>
                </article>
              ))}
            </section>

            {/* Comparison Matrix */}
            <section className="rs-about-section">
              <div className="rs-about-sec-head">
                <span className="rs-about-sec-tag">KIYASLAMA MATRİSİ</span>
                <h2>Restricted Studio vs Klasik Marketler</h2>
              </div>
              <div className="rs-about-table-wrap">
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
            </section>

            {/* Solutions Architecture Cards */}
            <section className="rs-about-section">
              <div className="rs-about-sec-head">
                <span className="rs-about-sec-tag">{t.home.modals.solutionsEyebrow}</span>
                <h2>{t.home.modals.solutionsTitle}</h2>
              </div>
              <div className="rs-about-solutions-grid">
                {t.home.modals.solutionsCards.map((card) => (
                  <div key={card.title} className="rs-about-solution-card">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                    <div className="noir-chip-row">
                      <span className="noir-chip">{card.chips[0]}</span>
                      <span className="noir-chip">{card.chips[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Embedded FAQ (#sss anchor) */}
            <section id="sss" className="rs-about-section">
              <div className="rs-about-sec-head">
                <span className="rs-about-sec-tag">{t.home.modals.faqEyebrow}</span>
                <h2>{t.home.modals.faqTitle}</h2>
              </div>
              <div className="rs-about-faq-list">
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
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
