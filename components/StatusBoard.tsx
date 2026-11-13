'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type {
  ComponentHealthState,
  ServiceProbeResult,
  UptimeMonitorSummary,
} from '@/app/api/health/route';

interface HealthPayload {
  status: ComponentHealthState;
  checkedAt: string;
  region: string;
  historicalMonitoring: boolean;
  monitors: UptimeMonitorSummary[];
  services: ServiceProbeResult[];
}

interface SessionProbeEntry {
  checkedAt: string;
  status: ComponentHealthState;
  avgLatencyMs: number;
}

const STATE_STYLE: Record<
  ComponentHealthState,
  { dotColor: string; borderColor: string; badgeBg: string }
> = {
  operational: {
    dotColor: '#22c55e',
    borderColor: '#22c55e',
    badgeBg: 'rgba(34, 197, 94, 0.14)',
  },
  degraded: {
    dotColor: '#eab308',
    borderColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.14)',
  },
  outage: {
    dotColor: '#ef4444',
    borderColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
  },
};

export default function StatusBoard() {
  const { t, formatTime } = useI18n();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [history, setHistory] = useState<SessionProbeEntry[]>([]);
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

        const latencies = payload.services.map((s) => s.latencyMs).filter((n) => n > 0);
        const avgLatencyMs = latencies.length
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : 0;

        setHistory((prev) => [
          { checkedAt: payload.checkedAt, status: payload.status, avgLatencyMs },
          ...prev.slice(0, 7),
        ]);
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
  const currentStyle = STATE_STYLE[activeStatus];
  const currentLabels = t.statusPage.states[activeStatus];
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  const avgLatency =
    data?.services && data.services.length > 0
      ? Math.round(
          data.services.reduce((acc, item) => acc + item.latencyMs, 0) / data.services.length
        )
      : null;

  const degradedOrOutage = data?.services.filter((s) => s.status !== 'operational') || [];

  const getLocalizedService = (svc: ServiceProbeResult) => {
    const meta = t.statusPage.servicesMeta[svc.id];
    if (!meta) return { name: svc.name, description: svc.description, detail: svc.detail };
    return {
      name: meta.name,
      description: meta.description,
      detail: svc.status === 'operational' ? meta.detailOk : svc.detail,
    };
  };

  return (
    <div className="status-page-shell">
      <div className="noir-subpage-sky" aria-hidden="true" />

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
                <a href={siteLink('/katalog')} className="status-nav-btn">
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
                <Link href="/katalog" className="status-nav-btn">
                  {t.common.catalog}
                </Link>
                <Link href="/dashboard" className="status-nav-btn status-nav-primary">
                  {t.common.clientPortal} →
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Global Operational Hero */}
        <section
          className="status-hero-card"
          style={{
            borderColor: fetchError ? '#ef4444' : currentStyle.borderColor,
          }}
        >
          <div className="status-hero-left">
            <div className="status-hero-indicator">
              <span
                className="status-dot"
                style={{
                  backgroundColor: loading
                    ? '#a1a1aa'
                    : fetchError
                    ? '#ef4444'
                    : currentStyle.dotColor,
                }}
              />
              <h1 className="status-hero-title">
                {loading
                  ? t.statusPage.loadingHeadline
                  : fetchError
                  ? t.statusPage.errorHeadline
                  : currentLabels.headline}
              </h1>
            </div>
            <p className="status-hero-sub">
              {fetchError
                ? fetchError
                : data
                ? `${t.statusPage.lastCheckedPrefix} ${formatTime(data.checkedAt)} · ${t.statusPage.avgLatencyLabel} ${avgLatency ?? 0} ms · ${t.statusPage.regionLabel} ${data.region}`
                : t.statusPage.verifyingLive}
            </p>
          </div>

          <div className="status-hero-actions">
            <span className="status-countdown">
              {t.statusPage.autoRefreshPrefix} {countdown}s
            </span>
            <button
              type="button"
              onClick={() => runHealthCheck(true)}
              disabled={refreshing}
              className="status-refresh-btn"
            >
              {refreshing ? t.statusPage.checkingBtn : t.statusPage.checkNowBtn}
            </button>
          </div>
        </section>

        {/* Subsystem Breakdown */}
        <section className="status-section" aria-label={t.statusPage.subsystemsTitle}>
          <div className="status-section-head">
            <h2>{t.statusPage.subsystemsTitle}</h2>
            <span>{t.statusPage.subsystemsSub}</span>
          </div>

          <div className="status-services-grid">
            {(data?.services || []).map((svc) => {
              const style = STATE_STYLE[svc.status];
              const stateLabel = t.statusPage.states[svc.status].label;
              const locSvc = getLocalizedService(svc);
              return (
                <article key={svc.id} className="status-service-row">
                  <div className="status-service-info">
                    <div className="status-service-name-line">
                      <span className="status-dot-sm" style={{ backgroundColor: style.dotColor }} />
                      <h3>{locSvc.name}</h3>
                    </div>
                    <p className="status-service-desc">{locSvc.description}</p>
                    <span className="status-service-detail">{locSvc.detail}</span>
                  </div>

                  <div className="status-service-metrics">
                    <span className="status-latency">{svc.latencyMs} ms</span>
                    <span
                      className="status-badge"
                      style={{
                        color: style.dotColor,
                        borderColor: style.dotColor,
                        backgroundColor: style.badgeBg,
                      }}
                    >
                      {stateLabel}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* UptimeRobot Historical Metrics (when UPTIMEROBOT_API_KEY is configured) OR Real Session Log */}
        {data?.historicalMonitoring && data.monitors.length > 0 ? (
          <section className="status-section" aria-label={t.statusPage.historicalTitle}>
            <div className="status-section-head">
              <h2>{t.statusPage.historicalTitle}</h2>
              <span>{t.statusPage.historicalSub}</span>
            </div>

            <div className="status-monitors-grid">
              {data.monitors.map((mon) => {
                const style = STATE_STYLE[mon.status];
                const stateLabel = t.statusPage.states[mon.status].label;
                return (
                  <div key={mon.name} className="status-monitor-card">
                    <div className="status-monitor-head">
                      <span className="status-monitor-name">{mon.name}</span>
                      <span style={{ color: style.dotColor, fontSize: '11px', fontWeight: 700 }}>
                        {stateLabel}
                      </span>
                    </div>
                    <div className="status-ratios">
                      <div>
                        <span>{t.statusPage.ratio24h}</span>
                        <strong>{mon.uptime24h || '-'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio7d}</span>
                        <strong>{mon.uptime7d || '-'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio30d}</span>
                        <strong>{mon.uptime30d || '-'}</strong>
                      </div>
                      <div>
                        <span>{t.statusPage.ratio90d}</span>
                        <strong>{mon.uptime90d || '-'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="status-section" aria-label={t.statusPage.liveLogTitle}>
            <div className="status-section-head">
              <h2>{t.statusPage.liveLogTitle}</h2>
              <span>{t.statusPage.liveLogSub}</span>
            </div>

            <div className="status-log-box">
              {history.length === 0 ? (
                <div className="status-log-empty">{t.statusPage.waitingProbe}</div>
              ) : (
                history.map((entry) => {
                  const style = STATE_STYLE[entry.status];
                  const stateLabel = t.statusPage.states[entry.status].label;
                  return (
                    <div key={entry.checkedAt} className="status-log-row">
                      <span>{formatTime(entry.checkedAt)}</span>
                      <span style={{ color: style.dotColor, fontWeight: 700 }}>{stateLabel}</span>
                      <span>
                        {t.statusPage.avgShort} {entry.avgLatencyMs} ms
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Incidents Panel */}
        <section className="status-section" aria-label={t.statusPage.incidentsTitle}>
          <div className="status-section-head">
            <h2>{t.statusPage.incidentsTitle}</h2>
            <span>{t.statusPage.incidentsSub}</span>
          </div>

          <div className="status-incident-box">
            {degradedOrOutage.length === 0 ? (
              <p className="status-incident-ok">{t.statusPage.noIncidents}</p>
            ) : (
              <ul className="status-incident-list">
                {degradedOrOutage.map((s) => {
                  const locSvc = getLocalizedService(s);
                  return (
                    <li key={s.id}>
                      <strong>{locSvc.name}:</strong> {locSvc.detail} ({s.latencyMs} ms)
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <footer className="status-footer">
          <span>{t.statusPage.footerBrand}</span>
          <div className="status-footer-links">
            {mainOrigin ? (
              <>
                <a href={siteLink('/')}>{t.common.home}</a>
                <a href={siteLink('/katalog')}>{t.common.catalog}</a>
                <a href={siteLink('/discord')}>{t.common.discord}</a>
              </>
            ) : (
              <>
                <Link href="/">{t.common.home}</Link>
                <Link href="/katalog">{t.common.catalog}</Link>
                <Link href="/discord">{t.common.discord}</Link>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
