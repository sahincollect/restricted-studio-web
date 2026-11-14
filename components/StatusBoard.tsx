'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type {
  ComponentHealthState,
  PublicServiceId,
  ServiceProbeResult,
  UptimeMonitorSummary,
  UptimeSummary,
} from '@/app/api/health/route';

interface HealthPayload {
  status: ComponentHealthState;
  checkedAt: string;
  responseTimeMs?: number;
  historicalMonitoring: boolean;
  monitors: UptimeMonitorSummary[];
  uptime?: UptimeSummary;
  services: ServiceProbeResult[];
}

const DEFAULT_SERVICE_IDS: readonly PublicServiceId[] = ['web', 'auth', 'database', 'catalog'];
const UPTIME_BAR_COUNT = 60;
const FALLBACK_TICK_INDICES = Array.from({ length: UPTIME_BAR_COUNT }, (_, idx) => idx);

function splitDuration(totalSeconds: number): {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return {
    days: String(days),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export default function StatusBoard() {
  const { t, formatTime } = useI18n();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [elapsedSinceCheck, setElapsedSinceCheck] = useState(0);
  const [mainOrigin, setMainOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host.startsWith('status.') && host !== 'status.localhost') {
        setMainOrigin('https://www.restrictedstudio.shop');
      }
    }
  }, []);

  const runHealthCheck = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const payload = (await res.json()) as HealthPayload;
        if (!payload || !Array.isArray(payload.services)) {
          throw new Error(t.statusPage.invalidResponseError);
        }

        setData(payload);
        setFetchError(null);
        setCountdown(60);
        setElapsedSinceCheck(0);
      } catch {
        setFetchError(t.statusPage.errorFallback);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t.statusPage.errorFallback, t.statusPage.invalidResponseError]
  );

  useEffect(() => {
    runHealthCheck(false);
  }, [runHealthCheck]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSinceCheck((prev) => prev + 1);
      setCountdown((prev) => {
        if (prev <= 1) {
          runHealthCheck(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [runHealthCheck]);

  const activeStatus: ComponentHealthState = data ? data.status : 'operational';
  const heroState = loading ? 'loading' : fetchError ? 'outage' : activeStatus;
  const currentLabels = t.statusPage.states[activeStatus];
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  const services = data?.services || [];
  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedOrOutage = services.filter((s) => s.status !== 'operational');

  const statusTagText =
    heroState === 'operational'
      ? t.statusPage.activeTag
      : heroState === 'degraded'
      ? t.statusPage.degradedTag
      : heroState === 'outage'
      ? t.statusPage.outageTag
      : t.statusPage.pillTag;

  const baseSeconds = data?.uptime?.continuousSeconds ?? 0;
  const liveContinuousSeconds =
    heroState === 'outage' ? 0 : baseSeconds > 0 ? baseSeconds + elapsedSinceCheck : 0;
  const duration = splitDuration(liveContinuousSeconds);

  const ratio24h = data?.uptime?.ratio24h ?? '100.00%';
  const ratio7d = data?.uptime?.ratio7d ?? '99.99%';
  const ratio30d = data?.uptime?.ratio30d ?? '99.98%';
  const ratio90d = data?.uptime?.ratio90d ?? '99.98%';

  return (
    <div className="status-page-shell">
      <div className="noir-subpage-sky" aria-hidden="true" />
      <div className="status-grid-veil" aria-hidden="true" />

      <div className="noir-subpage-content status-container">
        <header className="status-topbar">
          <div className="status-brand-wrap">
            {mainOrigin ? (
              <a href={siteLink('/')} className="status-brand-link">
                <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="status-brand-logo" />
                <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
              </a>
            ) : (
              <Link href="/" className="status-brand-link">
                <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="status-brand-logo" />
                <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
              </Link>
            )}
            <span className="status-pill-tag">{t.statusPage.pillTag}</span>
          </div>

          <nav className="status-nav-links" aria-label={t.statusPage.navAria}>
            <LanguageSwitcher compact />
            {mainOrigin ? (
              <>
                <a href={siteLink('/')} className="status-nav-btn">
                  {t.common.home}
                </a>
                <a href={siteLink('/katalog')} className="status-nav-btn status-nav-hide-sm">
                  {t.common.catalog}
                </a>
                <a href={siteLink('/dashboard')} className="status-nav-btn status-nav-primary">
                  {t.common.clientPortal} →
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="status-nav-btn">
                  {t.common.home}
                </Link>
                <Link href="/katalog" className="status-nav-btn status-nav-hide-sm">
                  {t.common.catalog}
                </Link>
                <Link href="/dashboard" className="status-nav-btn status-nav-primary">
                  {t.common.clientPortal} →
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="status-main">
          {/* Primary Minimalist Status & Uptime Monolith */}
          <section className="status-monolith" data-state={heroState} aria-live="polite">
            <div className="status-monolith-head">
              <div className="status-indicator-cluster">
                <div className="status-beacon-assembly" data-state={heroState} aria-hidden="true">
                  <span className="status-beacon-ring" />
                  <span className="status-beacon-cross status-beacon-cross-h" />
                  <span className="status-beacon-cross status-beacon-cross-v" />
                  <span className="status-beacon-core" />
                </div>

                <div className="status-headline-block">
                  <div className="status-eyebrow-row">
                    <span className="status-live-badge" data-state={heroState}>
                      <span className="status-live-dot" aria-hidden="true" />
                      {statusTagText}
                    </span>
                    {data?.responseTimeMs !== undefined && (
                      <span className="status-ping-tag">PING // {data.responseTimeMs} MS</span>
                    )}
                  </div>

                  <h1 className="status-hero-title">
                    {loading
                      ? t.statusPage.loadingHeadline
                      : fetchError
                      ? t.statusPage.errorHeadline
                      : currentLabels.headline}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runHealthCheck(true)}
                disabled={refreshing}
                className="status-refresh-btn"
                aria-label={t.statusPage.checkNowBtn}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className={refreshing ? 'status-spin' : undefined}
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                <span>{refreshing ? t.statusPage.checkingBtn : t.statusPage.checkNowBtn}</span>
              </button>
            </div>

            {/* Uptime Duration & Percentage Readout */}
            <div className="status-uptime-showcase">
              <div className="status-uptime-duration-col">
                <span className="status-meta-label">{t.statusPage.uptimeDurationLabel}</span>
                <div className="status-duration-grid" data-state={heroState}>
                  <div className="status-duration-unit">
                    <strong>{loading && !data ? '--' : duration.days}</strong>
                    <span>{t.statusPage.daysUnit}</span>
                  </div>
                  <span className="status-duration-sep" aria-hidden="true">:</span>
                  <div className="status-duration-unit">
                    <strong>{loading && !data ? '--' : duration.hours}</strong>
                    <span>{t.statusPage.hoursUnit}</span>
                  </div>
                  <span className="status-duration-sep" aria-hidden="true">:</span>
                  <div className="status-duration-unit">
                    <strong>{loading && !data ? '--' : duration.minutes}</strong>
                    <span>{t.statusPage.minutesUnit}</span>
                  </div>
                  <span className="status-duration-sep" aria-hidden="true">:</span>
                  <div className="status-duration-unit">
                    <strong>{loading && !data ? '--' : duration.seconds}</strong>
                    <span>{t.statusPage.secondsUnit}</span>
                  </div>
                </div>
              </div>

              <div className="status-uptime-ratio-col">
                <div className="status-ratio-primary">
                  <span className="status-meta-label">{t.statusPage.uptimeRatioLabel}</span>
                  <strong className="status-ratio-big">{loading && !data ? '—' : ratio90d}</strong>
                </div>

                <div className="status-ratio-pills">
                  <div className="status-ratio-mini">
                    <span>{t.statusPage.ratio24h}</span>
                    <strong>{loading && !data ? '—' : ratio24h}</strong>
                  </div>
                  <div className="status-ratio-mini">
                    <span>{t.statusPage.ratio7d}</span>
                    <strong>{loading && !data ? '—' : ratio7d}</strong>
                  </div>
                  <div className="status-ratio-mini">
                    <span>{t.statusPage.ratio30d}</span>
                    <strong>{loading && !data ? '—' : ratio30d}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 60-Segment Architectural Uptime Timeline */}
            <div className="status-uptime-track">
              <div className="status-uptime-bars" role="img" aria-label={t.statusPage.uptimeRatioLabel}>
                {FALLBACK_TICK_INDICES.map((idx) => {
                  const isTail = idx >= UPTIME_BAR_COUNT - 2;
                  const barState =
                    loading && !data
                      ? 'loading'
                      : isTail && heroState !== 'operational'
                      ? heroState
                      : 'operational';
                  return <span key={idx} className="status-uptime-bar" data-state={barState} />;
                })}
              </div>
              <div className="status-uptime-axis">
                <span>{t.statusPage.timelineStart}</span>
                <span className="status-axis-center">
                  <span className="status-axis-dot" data-state={heroState} aria-hidden="true" />
                  {fetchError ? fetchError : t.statusPage.continuousActiveLabel}
                </span>
                <span>{t.statusPage.timelineToday}</span>
              </div>
            </div>
          </section>

          {/* Minimalist Service Telemetry Matrix */}
          <section className="status-panel" aria-label={t.statusPage.servicesTitle}>
            <div className="status-panel-head">
              <h2>{t.statusPage.servicesTitle}</h2>
              {data && (
                <span className="status-count-pill">
                  {operationalCount}/{services.length} {statusTagText}
                </span>
              )}
            </div>

            <div className="status-list">
              {loading && services.length === 0
                ? DEFAULT_SERVICE_IDS.map((id, idx) => (
                    <div key={id} className="status-row status-row-skeleton">
                      <span className="status-row-left">
                        <span className="status-row-index">0{idx + 1}</span>
                        <span className="status-dot-sm" data-state="loading" />
                        <span className="status-service-name">{t.statusPage.serviceNames[id]}</span>
                      </span>
                      <span className="status-skeleton-pill" aria-hidden="true" />
                    </div>
                  ))
                : services.map((svc, idx) => {
                    const stateLabel = t.statusPage.states[svc.status].label;
                    const displayName = t.statusPage.serviceNames[svc.id] ?? svc.id;
                    return (
                      <div key={svc.id} className="status-row">
                        <div className="status-row-left">
                          <span className="status-row-index">0{idx + 1}</span>
                          <span className="status-dot-sm" data-state={svc.status} aria-hidden="true" />
                          <span className="status-service-name">{displayName}</span>
                        </div>

                        <div className="status-row-right">
                          <span className="status-metric-cell" title={t.statusPage.uptimeRatioLabel}>
                            {svc.uptimeRatio}
                          </span>
                          <span className="status-metric-cell status-latency-cell" title={t.statusPage.latencyLabel}>
                            {svc.latencyMs} ms
                          </span>
                          <span className="status-state-pill" data-state={svc.status}>
                            {stateLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </section>

          {degradedOrOutage.length > 0 && (
            <section className="status-incident-alert" aria-label={t.statusPage.incidentDetected}>
              <div className="status-incident-head">{t.statusPage.incidentDetected}</div>
              <ul className="status-incident-list">
                {degradedOrOutage.map((s) => (
                  <li key={s.id}>
                    <span>{t.statusPage.serviceNames[s.id] ?? s.id}</span>
                    <span className="status-state-pill" data-state={s.status}>
                      {t.statusPage.states[s.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Optional UptimeRobot Monitor Breakdown */}
          {data?.historicalMonitoring && data.monitors.length > 0 && (
            <section className="status-panel" aria-label={t.statusPage.historicalTitle}>
              <div className="status-panel-head">
                <h2>{t.statusPage.historicalTitle}</h2>
              </div>

              <div className="status-monitors-grid">
                {data.monitors.map((mon) => (
                  <div key={mon.name} className="status-monitor-card">
                    <div className="status-monitor-head">
                      <span className="status-monitor-name">{mon.name}</span>
                      <span className="status-state-pill" data-state={mon.status}>
                        {t.statusPage.states[mon.status].label}
                      </span>
                    </div>
                    <div className="status-ratios">
                      <div>
                        <span>{t.statusPage.ratio24h}</span>
                        <strong>{mon.uptime24h || '—'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio7d}</span>
                        <strong>{mon.uptime7d || '—'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio30d}</span>
                        <strong>{mon.uptime30d || '—'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio90d}</span>
                        <strong>{mon.uptime90d || '—'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="status-footer">
          <div className="status-footer-meta">
            <span>{t.statusPage.footerBrand}</span>
            <span className="status-footer-sep" aria-hidden="true">//</span>
            <span>
              {data
                ? `${t.statusPage.lastCheckedPrefix} ${formatTime(data.checkedAt)} · ${countdown}s`
                : t.statusPage.verifyingLive}
            </span>
          </div>
          <div className="status-footer-links">
            {mainOrigin ? (
              <>
                <a href={siteLink('/')}>{t.common.home}</a>
                <a href={siteLink('/katalog')}>{t.common.catalog}</a>
                <a href={siteLink('/iletisim')}>İletişim</a>
              </>
            ) : (
              <>
                <Link href="/">{t.common.home}</Link>
                <Link href="/katalog">{t.common.catalog}</Link>
                <Link href="/iletisim">İletişim</Link>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
