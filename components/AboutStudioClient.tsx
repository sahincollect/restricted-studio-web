'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import catalogStats from '@/lib/catalog-stats.json';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop, StudioReveal } from '@/components/StudioReveal';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function AboutStudioClient() {
  const { t, formatNumber, formatPercent } = useI18n();
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="st-page-shell">
      <SiteNavbar activePath="/hakkimizda" />

      <main className="st-main">
        {/* Top Hero Intro */}
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{t.home.modals.aboutEyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{t.home.modals.aboutTitle}</h1>
              <p className="st-subhero-desc">
                <strong style={{ color: '#ffffff' }}>{t.home.modals.aboutLeadBold}</strong>
                {t.home.modals.aboutLeadRest}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                <Link href="/katalog" className="st-pill-btn is-light">
                  {t.home.modals.goToCatalog}
                </Link>
                <a
                  href={ITEMSATIS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-pill-btn is-outline"
                >
                  {t.home.modals.itemsatisLink}
                </a>
              </div>
            </div>

            <div className="st-subhero-stats">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">{formatNumber(catalogStats.total)}+</span>
                <span className="st-stat-chip-lbl">{t.home.modals.archivePackagesUnit}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">0₺</span>
                <span className="st-stat-chip-lbl">Escrow / Lock</span>
              </div>
            </div>
          </div>
        </section>

        {/* Signature Asymmetric Light Dossier + Live Category Distribution */}
        <section className="st-section" style={{ paddingTop: '28px', paddingBottom: '44px' }}>
          <div className="st-container">
            <StudioReveal>
              <div className="st-asym-split-card">
                <div className="st-split-visual" style={{ padding: '24px', alignItems: 'flex-end' }}>
                  <img
                    src="/assets/studio-work-visual.jpg"
                    alt="Restricted Studio"
                    className="st-split-visual-img"
                  />
                  <div className="st-split-visual-scrim" aria-hidden="true" />
                  <Link href="/katalog" className="st-split-scroll-pill">
                    <span>{t.home.modals.openCatalogLink}</span>
                  </Link>
                </div>

                <div className="st-split-content">
                  <div className="st-offer-tag">{t.home.modals.archiveDistribution}</div>
                  <h2 className="st-split-heading" style={{ marginTop: '12px' }}>
                    {formatNumber(catalogStats.total)} {t.home.modals.archivePackagesUnit}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
                    {statRows.map(([cat, count]) => {
                      const pct = Math.max(3, Math.round((count / catalogStats.total) * 100));
                      return (
                        <div key={cat}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              fontWeight: 600,
                              marginBottom: '5px',
                            }}
                          >
                            <span style={{ color: '#111113' }}>
                              {t.catalog.categoryLabels[cat] || cat}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: '#c83918' }}>
                              {formatNumber(count)} ({formatPercent(pct)})
                            </span>
                          </div>
                          <div className="st-progress-track">
                            <div className="st-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StudioReveal>
          </div>
        </section>

        {/* Core Engineering Principles */}
        <section className="st-section" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
          <div className="st-container">
            <div className="st-areas-grid">
              {t.home.modals.aboutCards.map((card, i) => (
                <StudioReveal key={card.title} delay={i}>
                  <article className="st-area-card spotlight-surface">
                    <div>
                      <div className="st-area-card-top">
                        <span className="st-area-count-pill">0{i + 1}</span>
                      </div>
                      <h2 className="st-area-title">{card.title}</h2>
                      <p className="st-area-desc">{card.body}</p>
                    </div>
                  </article>
                </StudioReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Matrix */}
        <section className="st-section" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
          <div className="st-container">
            <StudioReveal>
              <div className="st-section-glow-head" style={{ marginBottom: '28px' }}>
                <h2 className="st-section-title" style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>
                  Restricted Studio <span className="is-accent">vs</span> Klasik Marketler
                </h2>
              </div>

              <div className="st-compare-table-wrap">
                <table className="st-table">
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
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{c1}</td>
                        <td style={{ color: 'var(--accent-coral)', fontWeight: 600 }}>{c2}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{c3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StudioReveal>
          </div>
        </section>

        {/* Solutions Pillars */}
        <section className="st-section" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
          <div className="st-container">
            <div className="st-section-glow-head" style={{ marginBottom: '32px' }}>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                {t.home.modals.solutionsEyebrow}
              </div>
              <h2 className="st-section-title" style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>
                {t.home.modals.solutionsTitle}
              </h2>
            </div>

            <div className="st-areas-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {t.home.modals.solutionsCards.map((card, i) => (
                <StudioReveal key={card.title} delay={i % 3}>
                  <div className="st-area-card spotlight-surface">
                    <div>
                      <h3 className="st-area-title">{card.title}</h3>
                      <p className="st-area-desc">{card.body}</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
                      <span className="st-area-count-pill">{card.chips[0]}</span>
                      <span className="st-area-count-pill">{card.chips[1]}</span>
                    </div>
                  </div>
                </StudioReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Embedded FAQ (#sss anchor) */}
        <section id="sss" className="st-section" style={{ paddingTop: '24px' }}>
          <div className="st-container">
            <div className="st-section-glow-head">
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                {t.home.modals.faqEyebrow}
              </div>
              <h2 className="st-section-title" style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>
                {t.home.modals.faqTitle}
              </h2>
            </div>

            <div className="st-faq-list">
              {t.home.modals.faqItems.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className={`st-faq-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="st-faq-trigger"
                      onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span className="st-faq-plus" aria-hidden="true">
                        +
                      </span>
                    </button>
                    {isOpen && <div className="st-faq-body">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
