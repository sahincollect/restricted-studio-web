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
} from '@/app/api/health/route';

interface HealthPayload {
  status: ComponentHealthState;
  checkedAt: string;
  historicalMonitoring: boolean;
  monitors: UptimeMonitorSummary[];
  services: ServiceProbeResult[];
}

const DEFAULT_SERVICE_IDS: readonly PublicServiceId[] = ['web', 'auth', 'database', 'catalog'];

export default function StatusBoard() {
  const { t, formatTime } = useI18n();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
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
  const heroState = loading ? 'loading' : fetchError ? 'outage' : activeStatus;
  const currentLabels = t.statusPage.states[activeStatus];
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  const services = data?.services || [];
  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedOrOutage = services.filter((s) => s.status !== 'operational');

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
          {/* Sleek Hero Status Card */}
          <section className="status-hero-card" data-state={heroState}>
            <div className="status-hero-left">
              <div className="status-hero-indicator">
                <span className="status-pulse-dot" data-state={heroState} aria-hidden="true" />
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
                  ? `${t.statusPage.lastCheckedPrefix} ${formatTime(data.checkedAt)} · ${countdown}s`
                  : t.statusPage.verifyingLive}
              </p>
            </div>

            <button
              type="button"
              onClick={() => runHealthCheck(true)}
              disabled={refreshing}
              className="status-refresh-btn"
              aria-label={t.statusPage.checkNowBtn}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={refreshing ? 'status-spin' : undefined}
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              <span>{refreshing ? t.statusPage.checkingBtn : t.statusPage.checkNowBtn}</span>
            </button>
          </section>

          {/* Minimalist Service List */}
          <section className="status-panel" aria-label={t.statusPage.servicesTitle}>
            <div className="status-panel-head">
              <h2>{t.statusPage.servicesTitle}</h2>
              {data && (
                <span className="status-count-pill">
                  {operationalCount}/{services.length}
                </span>
              )}
            </div>

            <div className="status-list">
              {loading && services.length === 0
                ? DEFAULT_SERVICE_IDS.map((id) => (
                    <div key={id} className="status-row status-row-skeleton">
                      <span className="status-row-left">
                        <span className="status-dot-sm" data-state="loading" />
                        <span className="status-service-name">{t.statusPage.serviceNames[id]}</span>
                      </span>
                      <span className="status-skeleton-pill" aria-hidden="true" />
                    </div>
                  ))
                : services.map((svc) => {
                    const stateLabel = t.statusPage.states[svc.status].label;
                    const displayName = t.statusPage.serviceNames[svc.id] ?? svc.id;
                    return (
                      <div key={svc.id} className="status-row">
                        <div className="status-row-left">
                          <span className="status-dot-sm" data-state={svc.status} aria-hidden="true" />
                          <span className="status-service-name">{displayName}</span>
                        </div>
                        <span className="status-state-pill" data-state={svc.status}>
                          {stateLabel}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </section>

          {/* Quiet Status Summary or Active Incident Alert */}
          {!loading && !fetchError && degradedOrOutage.length === 0 && (
            <div className="status-calm-note">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>{t.statusPage.noIncidents}</span>
            </div>
          )}

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

          {/* UptimeRobot Historical Metrics (only shown when configured) */}
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
