'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import type { DashboardLicenseRow, DashboardSessionMeta } from '@/lib/customer-session';

interface DashboardUser {
  id: string;
  email?: string;
  name?: string;
}

interface DashboardClientProps {
  initialUser: DashboardUser;
  initialLicenses: DashboardLicenseRow[];
  initialIsAdmin: boolean;
  initialSessionMeta: DashboardSessionMeta;
  needsCookieRefresh: boolean;
}

type LicenseFilter = 'all' | 'active' | 'expired';

function formatDisplayIdentity(user: DashboardUser): string {
  if (user.name) return user.name;
  if (!user.email) return 'Client';
  return user.email.replace(
    /@(kullanici\.restrictedstudio\.shop|anon\.restrictedstudio\.shop|restrictedstudio\.com|restrictedstudio\.local|restricted\.studio)$/i,
    ''
  );
}

export default function DashboardClient({
  initialUser,
  initialLicenses,
  initialIsAdmin,
  initialSessionMeta,
  needsCookieRefresh,
}: DashboardClientProps) {
  const { t, formatDate } = useI18n();
  const [user, setUser] = useState<DashboardUser>(initialUser);
  const [licenses, setLicenses] = useState<DashboardLicenseRow[]>(initialLicenses);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);
  const [sessionInvalid, setSessionInvalid] = useState(false);

  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [logoutMode, setLogoutMode] = useState<'current' | 'all' | null>(null);
  const [filter, setFilter] = useState<LicenseFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const forceRedirectToLogin = useCallback((reason = 'session_expired') => {
    setSessionInvalid(true);
    window.location.replace(`/login?redirect=/dashboard&clear_session=1&reason=${reason}`);
  }, []);

  const syncDashboardData = useCallback(
    async (silent = false) => {
      try {
        const res = await fetch('/api/licenses', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (res.status === 401) {
          forceRedirectToLogin('session_expired');
          return;
        }
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.user) setUser(data.user);
          if (Array.isArray(data.licenses)) setLicenses(data.licenses);
          setIsAdmin(Boolean(data.isAdmin));
        } else if (!silent) {
          setStatusMessage({ type: 'error', text: data.message || t.dashboard.genericError });
        }
      } catch {
        if (!silent) {
          setStatusMessage({ type: 'error', text: t.dashboard.genericError });
        }
      }
    },
    [forceRedirectToLogin, t.dashboard.genericError]
  );

  useEffect(() => {
    if (needsCookieRefresh) {
      void syncDashboardData(true);
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void syncDashboardData(true);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncDashboardData(true);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [needsCookieRefresh, syncDashboardData]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim() || redeemLoading) return;

    setRedeemLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      if (res.status === 401) {
        forceRedirectToLogin('session_expired');
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || t.dashboard.redeemError);
      }

      setStatusMessage({ type: 'success', text: data.message });
      setRedeemCode('');
      await syncDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.dashboard.genericError;
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handlePasteCode = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setRedeemCode(clip.trim().toUpperCase());
      }
    } catch {
      // Clipboard denied silently
    }
  };

  const handleDownload = async () => {
    if (downloadLoading) return;
    setDownloadLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/download', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.status === 401) {
        forceRedirectToLogin('session_expired');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || t.dashboard.downloadError);
      }
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.dashboard.downloadFailed;
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleLogout = async (scope: 'current' | 'all') => {
    if (logoutMode) return;
    setLogoutMode(scope);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });
    } catch {
      // Ignore network glitch on logout
    }
    setSessionInvalid(true);
    window.location.replace('/login?clear_session=1');
  };

  const handleCopyHwid = async (id: string, hwid: string) => {
    try {
      await navigator.clipboard.writeText(hwid);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1800);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const calculateRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const metrics = useMemo(() => {
    const now = Date.now();
    const active = licenses.filter(
      (l) => l.status === 'active' && new Date(l.expires_at).getTime() > now
    );
    const activeRAl = active.find((l) => l.product_name === 'R-AI');
    const bound = licenses.filter((l) => Boolean(l.hwid));
    return {
      activeCount: active.length,
      totalCount: licenses.length,
      stationUnlocked: Boolean(activeRAl) || isAdmin,
      boundCount: bound.length,
    };
  }, [licenses, isAdmin]);

  const filteredLicenses = useMemo(() => {
    const now = Date.now();
    if (filter === 'active') {
      return licenses.filter(
        (l) => l.status === 'active' && new Date(l.expires_at).getTime() > now
      );
    }
    if (filter === 'expired') {
      return licenses.filter(
        (l) => l.status !== 'active' || new Date(l.expires_at).getTime() <= now
      );
    }
    return licenses;
  }, [licenses, filter]);

  if (sessionInvalid) {
    return null;
  }

  return (
    <div className="rs-portal-shell">
      <SiteNavbar activePath="/dashboard" />

      <div style={{ position: 'relative', flex: 1 }}>
        <HeroPrismBackdrop />

        <main className="rs-portal-main" style={{ position: 'relative', zIndex: 2 }}>
          <section className="st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{formatDisplayIdentity(user)}</span>
              </div>
              <h1 className="st-subhero-title" style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>
                {t.dashboard.pageTitle}
              </h1>
              <p className="st-subhero-desc">{t.dashboard.pageSubtitle}</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {isAdmin && (
                <Link href="/admin" className="st-pill-btn is-ember is-sm">
                  {t.dashboard.adminPanelBtn} →
                </Link>
              )}
              <button
                type="button"
                onClick={() => void handleLogout('current')}
                disabled={logoutMode !== null}
                className="st-pill-btn is-outline is-sm"
              >
                {t.dashboard.logoutBtn}
              </button>
            </div>
          </section>

          <section className="rs-portal-kpi-grid" aria-label="Account telemetry">
            <div className="rs-portal-kpi is-highlight">
              <span className="rs-portal-kpi-label">{t.dashboard.kpiActiveLicenses}</span>
              <strong className="rs-portal-kpi-value">
                {metrics.activeCount} / {metrics.totalCount}
              </strong>
              <span className="rs-portal-kpi-meta">{t.common.itemsatisTrust}</span>
            </div>

            <div className="rs-portal-kpi">
              <span className="rs-portal-kpi-label">{t.dashboard.kpiStationStatus}</span>
              <strong className="rs-portal-kpi-value">
                {metrics.stationUnlocked ? t.dashboard.stationReady : t.dashboard.stationLocked}
              </strong>
              <span className="rs-portal-kpi-meta">Win x64 • R-AI</span>
            </div>

            <div className="rs-portal-kpi">
              <span className="rs-portal-kpi-label">{t.dashboard.kpiSessionPosture}</span>
              <strong className="rs-portal-kpi-value">{t.dashboard.sessionProtected}</strong>
              <span className="rs-portal-kpi-meta">FID #{initialSessionMeta.familyId.slice(0, 8)}</span>
            </div>
          </section>

          <div className="rs-portal-grid-2">
            {/* Activation & Licenses Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <section className="rs-portal-panel spotlight-surface" aria-labelledby="redeem-card-title">
                <div>
                  <h2 id="redeem-card-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {t.dashboard.redeemTitle}
                  </h2>
                  <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t.dashboard.redeemSubtitle}
                  </p>
                </div>

                {statusMessage && (
                  <div
                    className={`rs-auth-alert ${statusMessage.type === 'error' ? 'is-error' : 'is-info'}`}
                    role={statusMessage.type === 'error' ? 'alert' : 'status'}
                  >
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder={t.dashboard.redeemPlaceholder}
                      className="st-input"
                      style={{ flex: 1, minWidth: '180px', fontFamily: 'var(--font-mono)' }}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button type="button" onClick={() => void handlePasteCode()} className="st-pill-btn is-outline is-sm">
                      {t.dashboard.pasteBtn}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={redeemLoading || !redeemCode.trim()}
                    className="st-pill-btn is-light"
                  >
                    {redeemLoading ? t.dashboard.redeemLoadingBtn : t.dashboard.redeemSubmitBtn}
                  </button>
                </form>
              </section>

              <section className="rs-portal-panel spotlight-surface" aria-labelledby="licenses-card-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 id="licenses-card-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                      {t.dashboard.licensesTitle}
                    </h2>
                    <p style={{ marginTop: '2px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {t.dashboard.licensesSubtitle}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['all', 'active', 'expired'] as LicenseFilter[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`st-filter-pill ${filter === key ? 'is-active' : ''}`}
                        style={{ padding: '5px 11px', fontSize: '11.5px' }}
                      >
                        {key === 'all'
                          ? t.dashboard.filterAll
                          : key === 'active'
                          ? t.dashboard.filterActive
                          : t.dashboard.filterExpired}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredLicenses.length === 0 ? (
                  <div
                    style={{
                      padding: '28px 16px',
                      borderRadius: '16px',
                      border: '1px dashed var(--border-strong)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    <strong style={{ display: 'block', color: '#ffffff', marginBottom: '4px' }}>
                      {t.dashboard.emptyLicensesTitle}
                    </strong>
                    <span>{t.dashboard.emptyLicensesHint}</span>
                  </div>
                ) : (
                  <div className="rs-portal-license-list">
                    {filteredLicenses.map((lic) => {
                      const remDays = calculateRemainingDays(lic.expires_at);
                      const isExpired = remDays <= 0 || lic.status !== 'active';
                      const isBanned = lic.status === 'banned';

                      return (
                        <div key={lic.id} className="rs-portal-license-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                              {lic.product_name}
                            </strong>
                            <span className={`st-status-pill ${isBanned || isExpired ? 'is-outage' : 'is-operational'}`}>
                              {isBanned
                                ? t.dashboard.statusSuspended
                                : isExpired
                                ? t.dashboard.statusExpired
                                : t.dashboard.statusActive}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {remDays} {t.dashboard.daysSuffix} · {formatDate(lic.expires_at)}
                          </div>
                          <div>
                            {lic.hwid ? (
                              <button
                                type="button"
                                onClick={() => void handleCopyHwid(lic.id, lic.hwid!)}
                                className="st-filter-pill"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                                title={lic.hwid}
                              >
                                {lic.hwid.slice(0, 14)}… ({copiedId === lic.id ? t.dashboard.copiedBtn : t.dashboard.copyHwidBtn})
                              </button>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                {t.dashboard.hwidPending}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Download & Security Posture Column */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <section className="rs-portal-panel spotlight-surface" aria-labelledby="station-card-title">
                <div>
                  <h2 id="station-card-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {t.dashboard.stationTitle}
                  </h2>
                  <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t.dashboard.stationSubtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.dashboard.thStatus}</span>
                    <strong style={{ color: metrics.stationUnlocked ? '#4ade80' : 'var(--accent-coral)' }}>
                      {metrics.stationUnlocked ? t.dashboard.licenseActiveBadge : t.dashboard.licenseMissingBadge}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>BINARY</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>Restricted_Studio_Setup.exe</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>TARGET</span>
                    <span>Windows 10/11 x64</span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {metrics.stationUnlocked ? t.dashboard.downloadActiveNotice : t.dashboard.downloadLockedNotice}
                </p>

                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={!metrics.stationUnlocked || downloadLoading}
                  className="st-pill-btn is-ember is-full"
                >
                  {downloadLoading
                    ? t.dashboard.downloadPreparingBtn
                    : metrics.stationUnlocked
                    ? t.dashboard.downloadBtn
                    : t.dashboard.downloadLockedBtn}
                </button>
              </section>

              <section className="rs-portal-panel spotlight-surface" aria-labelledby="security-card-title">
                <div>
                  <h2 id="security-card-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {t.dashboard.securityModuleTitle}
                  </h2>
                  <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t.dashboard.securityModuleSubtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.dashboard.accountModeLabel}</span>
                    <span>{initialSessionMeta.isGuest ? t.dashboard.guestMode : t.dashboard.registeredMode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.dashboard.sessionFamilyLabel}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{initialSessionMeta.familyId.slice(0, 14)}…</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.dashboard.tokenShieldLabel}</span>
                    <span>{t.dashboard.tokenShieldValue}</span>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {t.dashboard.revokeAllHint}
                </p>

                <button
                  type="button"
                  onClick={() => void handleLogout('all')}
                  disabled={logoutMode !== null}
                  className="st-pill-btn is-outline is-full"
                >
                  {logoutMode === 'all' ? t.dashboard.loggingOutAllBtn : t.dashboard.logoutAllBtn}
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
