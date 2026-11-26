'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
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
const REFRESH_INTERVAL_SEC = 60;

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

/**
 * Isolated 1-second leaf counter so StatusBoard, SiteNavbar, and the 60-tick bar
 * never re-render every second.
 */
const StatusLiveCountdown = React.memo(function StatusLiveCountdown({
  checkedAt,
  formattedTime,
  prefix,
  fallback,
  onExpire,
}: {
  checkedAt: string | null;
  formattedTime: string;
  prefix: string;
  fallback: string;
  onExpire: () => void;
}) {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC);

  useEffect(() => {
    setCountdown(REFRESH_INTERVAL_SEC);
  }, [checkedAt]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setCountdown((prev) => {
        if (prev <= 1) {
          onExpire();
          return REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onExpire]);

  return (
    <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
      {checkedAt ? `${prefix} ${formattedTime} · ${countdown}s` : fallback}
    </p>
  );
});

const StatusLiveUptime = React.memo(function StatusLiveUptime({
  baseSeconds,
  isOutage,
  loading,
  resetKey,
}: {
  baseSeconds: number;
  isOutage: boolean;
  loading: boolean;
  resetKey: string | null;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
  }, [resetKey, baseSeconds]);

  useEffect(() => {
    if (isOutage || baseSeconds <= 0) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOutage, baseSeconds]);

  if (loading) return <>--</>;
  const total = isOutage ? 0 : baseSeconds > 0 ? baseSeconds + elapsed : 0;
  const d = splitDuration(total);
  return <>{`${d.days}g ${d.hours}:${d.minutes}:${d.seconds}`}</>;
});

export default function StatusBoard() {
  const { t, formatTime } = useI18n();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
      } catch {
        setFetchError(t.statusPage.errorFallback);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t.statusPage.errorFallback, t.statusPage.invalidResponseError]
  );

  const handleAutoRefresh = useCallback(() => {
    void runHealthCheck(false);
  }, [runHealthCheck]);

  useEffect(() => {
    void runHealthCheck(false);
  }, [runHealthCheck]);

  const activeStatus: ComponentHealthState = data ? data.status : 'operational';
  const heroState = loading ? 'loading' : fetchError ? 'outage' : activeStatus;
  const currentLabels = t.statusPage.states[activeStatus];

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

  const ratio24h = data?.uptime?.ratio24h ?? '100.00%';
  const ratio30d = data?.uptime?.ratio30d ?? '99.98%';
  const ratio90d = data?.uptime?.ratio90d ?? '99.98%';

  const stateClass =
    heroState === 'outage' ? 'is-outage' : heroState === 'degraded' ? 'is-degraded' : 'is-operational';

  return (
    <div className="st-page-shell">
      <SiteNavbar activePath="/status" mainOrigin={mainOrigin} />

      <main className="st-main">
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container" style={{ position: 'relative', zIndex: 2 }}>
            <div className={`st-status-hero ${stateClass}`} aria-live="polite">
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={`st-status-pill ${stateClass}`}>
                    <span className="st-eyebrow-dot" style={{ background: 'currentColor' }} aria-hidden="true" />
                    {statusTagText}
                  </span>
                  {data?.responseTimeMs !== undefined && (
                    <span className="st-area-count-pill">PING · {data.responseTimeMs} MS</span>
                  )}
                </div>

                <h1 className="st-subhero-title" style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>
                  {loading
                    ? t.statusPage.loadingHeadline
                    : fetchError
                    ? t.statusPage.errorHeadline
                    : currentLabels.headline}
                </h1>
                <StatusLiveCountdown
                  checkedAt={data?.checkedAt ?? null}
                  formattedTime={data ? formatTime(data.checkedAt) : ''}
                  prefix={t.statusPage.lastCheckedPrefix}
                  fallback={t.statusPage.verifyingLive}
                  onExpire={handleAutoRefresh}
                />
              </div>

              <button
                type="button"
                onClick={() => runHealthCheck(true)}
                disabled={refreshing}
                className="st-pill-btn is-light is-sm"
                aria-label={t.statusPage.checkNowBtn}
              >
                {refreshing ? t.statusPage.checkingBtn : t.statusPage.checkNowBtn}
              </button>
            </div>

            {/* Uptime KPI Metrics */}
            <div className="st-status-metrics">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">
                  <StatusLiveUptime
                    baseSeconds={baseSeconds}
                    isOutage={heroState === 'outage'}
                    loading={loading && !data}
                    resetKey={data?.checkedAt ?? null}
                  />
                </span>
                <span className="st-stat-chip-lbl">{t.statusPage.uptimeDurationLabel}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">{loading && !data ? '—' : ratio24h}</span>
                <span className="st-stat-chip-lbl">{t.statusPage.ratio24h}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">{loading && !data ? '—' : ratio30d}</span>
                <span className="st-stat-chip-lbl">{t.statusPage.ratio30d}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val" style={{ color: 'var(--accent-coral)' }}>
                  {loading && !data ? '—' : ratio90d}
                </span>
                <span className="st-stat-chip-lbl">{t.statusPage.uptimeRatioLabel}</span>
              </div>
            </div>

            {/* 60-tick Bar Timeline */}
            <div className="st-sidebar-card" style={{ marginTop: '18px' }}>
              <div className="st-status-ticks" role="img" aria-label={t.statusPage.uptimeRatioLabel}>
                {FALLBACK_TICK_INDICES.map((idx) => {
                  const isTail = idx >= UPTIME_BAR_COUNT - 2;
                  const tickState =
                    loading && !data ? 'operational' : isTail && heroState !== 'operational' ? heroState : 'operational';
                  return (
                    <span
                      key={idx}
                      className={`st-status-tick ${
                        tickState === 'outage' ? 'is-down' : tickState === 'degraded' ? 'is-degraded' : ''
                      }`}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{t.statusPage.timelineStart}</span>
                <span>{fetchError ? fetchError : t.statusPage.continuousActiveLabel}</span>
                <span>{t.statusPage.timelineToday}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Table */}
        <section className="st-container" style={{ paddingBottom: '64px' }}>
          <div className="st-compare-table-wrap">
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-hairline)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h2 style={{ fontSize: '17px', fontWeight: 600 }}>{t.statusPage.servicesTitle}</h2>
              {data && (
                <span className="st-area-count-pill">
                  {operationalCount}/{services.length} {statusTagText}
                </span>
              )}
            </div>

            <table className="st-table">
              <tbody>
                {loading && services.length === 0
                  ? DEFAULT_SERVICE_IDS.map((id, idx) => (
                      <tr key={id}>
                        <td className="st-status-idx-col" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>0{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{t.statusPage.serviceNames[id]}</td>
                        <td style={{ color: 'var(--text-muted)' }}>—</td>
                      </tr>
                    ))
                  : services.map((svc, idx) => {
                      const svcClass =
                        svc.status === 'outage'
                          ? 'is-outage'
                          : svc.status === 'degraded'
                          ? 'is-degraded'
                          : 'is-operational';
                      return (
                        <tr key={svc.id}>
                          <td className="st-status-idx-col" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '56px' }}>
                            0{idx + 1}
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.statusPage.serviceNames[svc.id] ?? svc.id}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            {svc.uptimeRatio}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {svc.latencyMs} ms
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`st-status-pill ${svcClass}`}>
                              {t.statusPage.states[svc.status].label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {degradedOrOutage.length > 0 && (
            <div className="rs-auth-alert is-error" style={{ marginTop: '18px' }}>
              <div>
                <strong>{t.statusPage.incidentDetected}</strong>
                <div style={{ marginTop: '4px', fontSize: '12.5px' }}>
                  {degradedOrOutage.map((s) => t.statusPage.serviceNames[s.id] ?? s.id).join(', ')}
                </div>
              </div>
            </div>
          )}

          {data?.historicalMonitoring && data.monitors.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '14px' }}>
                {t.statusPage.historicalTitle}
              </h2>
              <div className="st-areas-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {data.monitors.map((mon) => (
                  <div key={mon.name} className="st-sidebar-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px' }}>{mon.name}</strong>
                      <span className={`st-status-pill is-${mon.status}`}>
                        {t.statusPage.states[mon.status].label}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                        gap: '8px',
                        fontSize: '11.5px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t.statusPage.ratio24h}</div>
                        <strong>{mon.uptime24h || '—'}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t.statusPage.ratio7d}</div>
                        <strong>{mon.uptime7d || '—'}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t.statusPage.ratio30d}</div>
                        <strong>{mon.uptime30d || '—'}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{t.statusPage.ratio90d}</div>
                        <strong>{mon.uptime90d || '—'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter mainOrigin={mainOrigin} />
    </div>
  );
}
