'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import catalogStats from '@/lib/catalog-stats.json';
import { useI18n } from '@/components/I18nProvider';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';
import { getPixelCoreProfile, type PixelLoadProfile } from '@/lib/pixel-core-telemetry';

export default function PixelCoreMonitor(): React.JSX.Element {
  const [loadProfile, setLoadProfile] = useState<PixelLoadProfile>('128p');
  const { locale, t, formatNumber, formatPercent } = useI18n();
  const ui = INTERACTIVE_I18N[locale].showcase;
  const catLabels = t.catalog.categoryLabels;
  const coreMetrics = getPixelCoreProfile(loadProfile);

  const sortedCategories = Object.entries(catalogStats.counts as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxCategoryCount = sortedCategories[0]?.[1] || 1;

  const profileButtons: Array<{ key: PixelLoadProfile; label: string }> = [
    { key: 'idle', label: ui.core.idle },
    { key: '128p', label: ui.core.load128 },
    { key: '256p', label: ui.core.stress256 },
  ];

  return (
    <section className="px-telemetry" aria-label={t.home.telemetry.ariaLabel}>
      {/* Top Bar */}
      <div className="px-telemetry-top">
        <div className="px-telemetry-brand">
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            shapeRendering="crispEdges"
            aria-hidden="true"
            className="px-core-emblem"
          >
            <rect x="1" y="1" width="14" height="14" fill="#141414" stroke="#A50000" strokeWidth="1" />
            <rect x="4" y="4" width="3" height="3" fill="#FFB84D" />
            <rect x="9" y="4" width="3" height="3" fill="#F0F0F0" />
            <rect x="4" y="9" width="8" height="3" fill="#A50000" />
          </svg>
          <div className="px-telemetry-brand-text">
            <strong>RESTRICTED CORE</strong>
            <span>{ui.headerEyebrow}</span>
          </div>
        </div>

        <div className="px-telemetry-badges">
          <span className="px-status-badge">
            <span className="px-status-led" aria-hidden="true" />
            {t.home.telemetry.statusVersion}
          </span>
          <Link href="/status" className="px-status-top-link">
            {t.home.telemetry.statusLink}
          </Link>
        </div>
      </div>

      {/* Engine Strip + Interactive Profile Toggle */}
      <div className="px-engine-strip">
        <div className="px-engine-meta">
          <span className="px-cluster-tag">◆ Saint Roleplay — Istanbul Engine</span>
          <span className="px-tps-pill">{coreMetrics.tps}</span>
        </div>

        <div className="px-profile-group" role="group" aria-label={ui.loadProfileLabel}>
          {profileButtons.map((prof) => {
            const active = loadProfile === prof.key;
            return (
              <button
                key={prof.key}
                type="button"
                aria-pressed={active}
                onClick={() => setLoadProfile(prof.key)}
                className={`px-profile-btn${active ? ' is-active' : ''}`}
              >
                {prof.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="px-kpi-grid">
        <div className="px-kpi-cell">
          <span className="px-kpi-label">{ui.metrics.resmonLabel}</span>
          <strong className="px-kpi-val is-ok">{coreMetrics.tick}</strong>
          <span className="px-kpi-sub">{ui.metrics.resmonSub}</span>
        </div>
        <div className="px-kpi-cell">
          <span className="px-kpi-label">{ui.metrics.sqlLabel}</span>
          <strong className="px-kpi-val">{coreMetrics.sql}</strong>
          <span className="px-kpi-sub">{ui.metrics.sqlSub}</span>
        </div>
        <div className="px-kpi-cell">
          <span className="px-kpi-label">{ui.metrics.escrowLabel}</span>
          <strong className="px-kpi-val is-accent">{formatPercent(0)}</strong>
          <span className="px-kpi-sub">{ui.metrics.escrowSub}</span>
        </div>
        <div className="px-kpi-cell">
          <span className="px-kpi-label">{ui.metrics.archiveLabel}</span>
          <strong className="px-kpi-val">{formatNumber(catalogStats.total)}+</strong>
          <span className="px-kpi-sub">{ui.metrics.archiveSub}</span>
        </div>
      </div>

      {/* Quantized Stair-Step Capacity Panel */}
      <div className="px-chart-box">
        <div className="px-chart-head">
          <div>
            <strong>{t.home.telemetry.capacityTitle}</strong>
            <span>{t.home.telemetry.capacitySub}</span>
          </div>
          <span className="px-chart-peak">{formatPercent(coreMetrics.peak)} · 60 FPS</span>
        </div>

        <div className="px-chart-canvas-wrap">
          <svg
            className="px-step-svg"
            viewBox="0 0 480 140"
            preserveAspectRatio="none"
            role="img"
            aria-label={t.home.telemetry.capacityTitle}
          >
            <defs>
              <pattern id="crimsonPixelHatch" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#A50000" fillOpacity="0.16" />
                <rect x="0" y="0" width="4" height="4" fill="#A50000" fillOpacity="0.34" />
                <rect x="4" y="4" width="4" height="4" fill="#8B0000" fillOpacity="0.34" />
                <rect x="4" y="0" width="2" height="2" fill="#FFB84D" fillOpacity="0.18" />
              </pattern>
            </defs>

            <line
              x1="0"
              y1="35"
              x2="480"
              y2="35"
              stroke="rgba(240,240,240,0.08)"
              strokeDasharray="4 4"
              shapeRendering="crispEdges"
            />
            <line
              x1="0"
              y1="70"
              x2="480"
              y2="70"
              stroke="rgba(240,240,240,0.08)"
              strokeDasharray="4 4"
              shapeRendering="crispEdges"
            />
            <line
              x1="0"
              y1="105"
              x2="480"
              y2="105"
              stroke="rgba(240,240,240,0.08)"
              strokeDasharray="4 4"
              shapeRendering="crispEdges"
            />

            <path d={coreMetrics.areaPath} fill="url(#crimsonPixelHatch)" />
            <path
              d={coreMetrics.stepPath}
              fill="none"
              stroke="#F0F0F0"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              shapeRendering="crispEdges"
            />
          </svg>

          <span
            className="px-apex-dot"
            style={{
              left: `${(coreMetrics.apexX / 480) * 100}%`,
              top: `${(coreMetrics.apexY / 140) * 100}%`,
            }}
            aria-hidden="true"
          />

          <span className="px-axis-tag is-top">0.18 ms</span>
          <span className="px-axis-tag is-bottom">0.00 ms</span>
        </div>

        <div className="px-chart-foot">
          <span>{t.home.telemetry.capacityFooter}</span>
          <div className="px-bridge-tags">
            <span>Qbox</span>
            <span>QBCore</span>
            <span>ESX</span>
            <span>ox_lib</span>
          </div>
        </div>
      </div>

      {/* Bottom Split: Pixel-Segmented Archive + SLA Actions */}
      <div className="px-bottom-split">
        <div className="px-archive-box">
          <div className="px-box-head">
            <strong>{ui.archivePanelTitle}</strong>
            <span>{ui.archivePanelSub}</span>
          </div>
          <div className="px-archive-bars">
            {sortedCategories.map(([cat, count]) => {
              const widthPct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat} className="px-archive-row">
                  <div className="px-archive-label">
                    <span>{catLabels[cat] || cat}</span>
                    <b>{formatNumber(count)}</b>
                  </div>
                  <div className="px-segment-track">
                    <div className="px-segment-fill" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-sla-box">
          <div className="px-box-head">
            <strong>{ui.slaPanelTitle}</strong>
            <span className="px-sla-tag">0% ESCROW</span>
          </div>

          <ul className="px-sla-list">
            {ui.slaItems.map((item) => (
              <li key={item}>
                <span className="px-pixel-check" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="px-sla-actions">
            <Link href="/katalog" className="px-btn px-btn-crimson px-btn-compact">
              {ui.openCatalogCta}
            </Link>
            <Link href="/status" className="px-btn px-btn-ghost px-btn-compact">
              {t.home.telemetry.statusLink}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
