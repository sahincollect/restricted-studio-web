'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';
import catalogStats from '@/lib/catalog-stats.json';

type LoadProfile = 'idle' | '128p' | '256p';

export default function ShowcaseTerminal() {
  const { locale, t, formatNumber, formatPercent } = useI18n();
  const ui = INTERACTIVE_I18N[locale].showcase;

  const [loadProfile, setLoadProfile] = useState<LoadProfile>('128p');

  const coreMetrics = useMemo(() => {
    if (loadProfile === 'idle') {
      return {
        tps: '60.0 TPS',
        tick: '0.00 ms',
        sql: '0.4 ms',
        peak: 42,
        path: 'M 0 120 Q 75 114, 145 108 T 275 100 T 380 102 T 480 96',
        area: 'M 0 120 Q 75 114, 145 108 T 275 100 T 380 102 T 480 96 L 480 140 L 0 140 Z',
        cx: 275,
        cy: 100,
      };
    }
    if (loadProfile === '256p') {
      return {
        tps: '59.8 TPS',
        tick: '0.07 ms',
        sql: '1.8 ms',
        peak: 97,
        path: 'M 0 110 Q 55 78, 105 58 T 205 24 T 295 42 T 390 20 T 480 14',
        area: 'M 0 110 Q 55 78, 105 58 T 205 24 T 295 42 T 390 20 T 480 14 L 480 140 L 0 140 Z',
        cx: 390,
        cy: 20,
      };
    }
    return {
      tps: '60.0 TPS',
      tick: '0.04 ms',
      sql: '1.1 ms',
      peak: 91,
      path: 'M 0 120 Q 55 106, 95 86 T 175 50 T 240 30 T 325 58 T 405 36 T 480 18',
      area: 'M 0 120 Q 55 106, 95 86 T 175 50 T 240 30 T 325 58 T 405 36 T 480 18 L 480 140 L 0 140 Z',
      cx: 240,
      cy: 30,
    };
  }, [loadProfile]);

  const topCategories = useMemo(
    () =>
      Object.entries(catalogStats.counts as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    []
  );

  return (
    <div className="device-mockup-chassis">
      {/* 1. Institutional Top Header */}
      <div className="device-top-bar">
        <div className="device-user-info">
          <img src="/assets/rslogo.jpg" alt="Restricted Core" className="device-avatar" />
          <div className="device-user-text">
            <span className="dut-greeting">RESTRICTED CORE</span>
            <span className="dut-status">{ui.headerEyebrow}</span>
          </div>
        </div>

        <Link href="/status" className="rc-status-pill">
          <span className="dut-dot" aria-hidden="true" />
          <span className="rc-status-full">
            {ui.statusOperational} · {t.home.telemetry.statusVersion}
          </span>
          <span className="rc-status-short">{ui.statusOperational} · v3.4</span>
        </Link>

        <div className="rc-mobile-summary" aria-hidden="true">
          <div>
            <strong>{coreMetrics.tick}</strong>
            <span>{ui.metrics.resmonLabel}</span>
          </div>
          <div>
            <strong>{formatPercent(0)}</strong>
            <span>{ui.metrics.escrowLabel}</span>
          </div>
          <div>
            <strong>{formatNumber(catalogStats.total)}+</strong>
            <span>{t.home.hero.statPackages}</span>
          </div>
        </div>
      </div>

      {/* 2. Benchmark Server & Load Profile Bar */}
      <div className="device-server-selector">
        <div className="dss-left">
          <span className="dss-name">◆ Saint Roleplay — Istanbul Engine</span>
          <span className="dss-tag">{coreMetrics.tps}</span>
        </div>

        <div className="core-load-pills" role="group" aria-label={ui.loadProfileLabel}>
          <button
            type="button"
            className={`clp-btn ${loadProfile === 'idle' ? 'is-active' : ''}`}
            onClick={() => setLoadProfile('idle')}
          >
            {ui.core.idle}
          </button>
          <button
            type="button"
            className={`clp-btn ${loadProfile === '128p' ? 'is-active' : ''}`}
            onClick={() => setLoadProfile('128p')}
          >
            {ui.core.load128}
          </button>
          <button
            type="button"
            className={`clp-btn ${loadProfile === '256p' ? 'is-active' : ''}`}
            onClick={() => setLoadProfile('256p')}
          >
            {ui.core.stress256}
          </button>
        </div>
      </div>

      {/* 3. 4-Column Executive KPI Strip */}
      <div className="device-metrics-strip">
        <div className="dms-col">
          <span className="dms-l">{ui.metrics.resmonLabel}</span>
          <span className="dms-v">{coreMetrics.tick}</span>
          <span className="dms-sub">{ui.metrics.resmonSub}</span>
        </div>
        <span className="dms-sep" aria-hidden="true" />
        <div className="dms-col">
          <span className="dms-l">{ui.metrics.sqlLabel}</span>
          <span className="dms-v">{coreMetrics.sql}</span>
          <span className="dms-sub">{ui.metrics.sqlSub}</span>
        </div>
        <span className="dms-sep" aria-hidden="true" />
        <div className="dms-col">
          <span className="dms-l">{ui.metrics.escrowLabel}</span>
          <span className="dms-v">{formatPercent(0)}</span>
          <span className="dms-sub">{ui.metrics.escrowSub}</span>
        </div>
        <span className="dms-sep" aria-hidden="true" />
        <div className="dms-col">
          <span className="dms-l">{ui.metrics.archiveLabel}</span>
          <span className="dms-v">{formatNumber(catalogStats.total)}+</span>
          <span className="dms-sub">{ui.metrics.archiveSub}</span>
        </div>
      </div>

      {/* 4. Expanded Server Thread Capacity Telemetry Chart */}
      <div className="device-capacity-card">
        <div className="dcc-head">
          <div>
            <span className="dcc-title">{t.home.telemetry.capacityTitle}</span>
            <span className="dcc-sub">{t.home.telemetry.capacitySub}</span>
          </div>
          <span className="dcc-apex-badge">{formatPercent(coreMetrics.peak)} · 60 FPS</span>
        </div>

        <div className="dcc-chart-container">
          <span className="dcc-scale-tag dcc-scale-top">0.10 ms</span>
          <span className="dcc-scale-tag dcc-scale-bottom">0.00 ms</span>
          <svg viewBox="0 0 480 140" preserveAspectRatio="none" className="capacity-curve-svg">
            <defs>
              <linearGradient id="crimsonPeakFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9B1111" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#080808" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            <line x1="0" y1="35" x2="480" y2="35" stroke="rgba(240,240,240,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="480" y2="70" stroke="rgba(240,240,240,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="105" x2="480" y2="105" stroke="rgba(240,240,240,0.08)" strokeDasharray="4 4" />
            <path d={coreMetrics.area} fill="url(#crimsonPeakFill)" />
            <path
              d={coreMetrics.path}
              fill="none"
              stroke="#E8E5DE"
              strokeWidth="2"
              opacity="0.92"
            />
            <circle cx={coreMetrics.cx} cy={coreMetrics.cy} r="7" fill="rgba(200, 50, 50, 0.25)" />
            <circle
              cx={coreMetrics.cx}
              cy={coreMetrics.cy}
              r="3.8"
              fill="#C83232"
              stroke="#E8E5DE"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        <div className="dcc-footer">
          <span>{t.home.telemetry.capacityFooter}</span>
          <div className="rc-bridge-chips" aria-label={ui.bridgesLabel}>
            <span>Qbox</span>
            <span>QBCore</span>
            <span>ESX</span>
            <span>ox_lib</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Enterprise Breakdown & Action Panel */}
      <div className="rc-bottom-grid">
        <div className="rc-panel">
          <div className="rc-panel-head">
            <span className="rc-panel-title">{ui.archivePanelTitle}</span>
            <span className="rc-panel-sub">{ui.archivePanelSub}</span>
          </div>
          <div className="rc-cat-list">
            {topCategories.map(([cat, count]) => {
              const pct = Math.round((count / catalogStats.total) * 100);
              return (
                <div key={cat} className="rc-cat-row">
                  <div className="rc-cat-meta">
                    <span className="rc-cat-name">{t.catalog.categoryLabels[cat] || cat}</span>
                    <span className="rc-cat-count">{formatNumber(count)}</span>
                  </div>
                  <div className="rc-cat-track">
                    <div className="rc-cat-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rc-panel rc-panel-sla">
          <div className="rc-panel-head">
            <span className="rc-panel-title">{ui.slaPanelTitle}</span>
            <span className="rc-panel-badge">0% ESCROW</span>
          </div>
          <ul className="rc-sla-list">
            {ui.slaItems.map((item) => (
              <li key={item}>
                <span className="rc-sla-check" aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="rc-cta-row">
            <Link href="/katalog" className="rc-cta-primary">
              {ui.openCatalogCta} →
            </Link>
            <Link href="/status" className="rc-cta-secondary">
              {t.home.telemetry.statusLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
