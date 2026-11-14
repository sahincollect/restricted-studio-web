'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
      // Clipboard read requires user gesture permission; ignore denial silently
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
      // Clear local navigation regardless of network glitch
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
      // Ignore clipboard write restrictions
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
      <header className="rs-portal-header">
        <div className="rs-portal-header-inner">
          <div className="rs-portal-brand-group">
            <Link href="/" className="rs-auth-brand">
              <span className="rs-auth-brand-mark" aria-hidden="true" />
              <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
            </Link>
            <span className="rs-portal-trust">{t.common.itemsatisTrust}</span>
          </div>

          <div className="rs-portal-actions">
            <LanguageSwitcher compact />

            <Link href="/katalog" className="rs-portal-btn-ghost">
              {t.dashboard.catalogLink}
            </Link>

            {isAdmin && (
              <Link href="/admin" className="rs-portal-btn-admin">
                {t.dashboard.adminPanelBtn}
              </Link>
            )}

            <span className="rs-portal-identity" title={user.email || user.name}>
              <span className="rs-portal-identity-dot" aria-hidden="true" />
              <span>{formatDisplayIdentity(user)}</span>
            </span>

            <button
              type="button"
              onClick={() => void handleLogout('current')}
              disabled={logoutMode !== null}
              className="rs-portal-btn-ghost"
            >
              {t.dashboard.logoutBtn}
            </button>
          </div>
        </div>
      </header>

      <main className="rs-portal-main">
        <section className="rs-portal-hero">
          <div>
            <h1 className="rs-portal-h1">{t.dashboard.pageTitle}</h1>
            <p className="rs-portal-sub">{t.dashboard.pageSubtitle}</p>
          </div>
        </section>

        <section className="rs-portal-kpi-grid" aria-label="Account telemetry">
          <div className="rs-portal-kpi is-highlight">
            <span className="rs-portal-kpi-label">{t.dashboard.kpiActiveLicenses}</span>
            <strong className="rs-portal-kpi-value">{metrics.activeCount}</strong>
            <span className="rs-portal-kpi-meta">/ {metrics.totalCount}</span>
          </div>

          <div className="rs-portal-kpi">
            <span className="rs-portal-kpi-label">{t.dashboard.kpiStationStatus}</span>
            <strong className="rs-portal-kpi-value">
              {metrics.stationUnlocked ? t.dashboard.stationReady : t.dashboard.stationLocked}
            </strong>
            <span className="rs-portal-kpi-meta">Win x64 • R-AI</span>
          </div>

          <div className="rs-portal-kpi">
            <span className="rs-portal-kpi-label">{t.dashboard.kpiHwidStatus}</span>
            <strong className="rs-portal-kpi-value">
              {metrics.boundCount > 0 ? t.dashboard.hwidBound : t.dashboard.hwidUnbound}
            </strong>
            <span className="rs-portal-kpi-meta">
              {metrics.boundCount} / {metrics.totalCount}
            </span>
          </div>

          <div className="rs-portal-kpi">
            <span className="rs-portal-kpi-label">{t.dashboard.kpiSessionPosture}</span>
            <strong className="rs-portal-kpi-value">{t.dashboard.sessionProtected}</strong>
            <span className="rs-portal-kpi-meta">
              FID #{initialSessionMeta.familyId.slice(0, 8)}
            </span>
          </div>
        </section>

        <div className="rs-portal-bento">
          <div className="rs-portal-col">
            {/* Activation Terminal */}
            <section className="rs-portal-card" aria-labelledby="redeem-card-title">
              <div className="rs-portal-card-head">
                <div className="rs-portal-card-title-group">
                  <div className="rs-portal-icon-box" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="redeem-card-title" className="rs-portal-card-title">
                      {t.dashboard.redeemTitle}
                    </h2>
                    <p className="rs-portal-card-sub">{t.dashboard.redeemSubtitle}</p>
                  </div>
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`rs-auth-alert ${statusMessage.type === 'error' ? 'is-error' : 'is-info'}`}
                  role={statusMessage.type === 'error' ? 'alert' : 'status'}
                >
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRedeem} className="rs-portal-redeem-row">
                <div className="rs-portal-redeem-input-wrap">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder={t.dashboard.redeemPlaceholder}
                    className="rs-portal-redeem-input"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => void handlePasteCode()}
                    className="rs-portal-paste-btn"
                  >
                    {t.dashboard.pasteBtn}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={redeemLoading || !redeemCode.trim()}
                  className="rs-portal-btn-primary"
                >
                  {redeemLoading ? t.dashboard.redeemLoadingBtn : t.dashboard.redeemSubmitBtn}
                </button>
              </form>
            </section>

            {/* Licenses & Hardware Telemetry */}
            <section className="rs-portal-card" aria-labelledby="licenses-card-title">
              <div className="rs-portal-card-head">
                <div className="rs-portal-card-title-group">
                  <div className="rs-portal-icon-box" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="1" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="licenses-card-title" className="rs-portal-card-title">
                      {t.dashboard.licensesTitle}
                    </h2>
                    <p className="rs-portal-card-sub">{t.dashboard.licensesSubtitle}</p>
                  </div>
                </div>

                <div className="rs-portal-filters" role="group" aria-label="License filter">
                  {(['all', 'active', 'expired'] as LicenseFilter[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`rs-portal-filter-btn ${filter === key ? 'is-active' : ''}`}
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
                    textAlign: 'center',
                    padding: '34px 18px',
                    backgroundColor: '#0e0e11',
                    border: '1.5px dashed rgba(240, 240, 240, 0.28)',
                    color: 'rgba(240, 240, 240, 0.72)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <strong style={{ color: '#F0F0F0', fontSize: '14px' }}>
                    {t.dashboard.emptyLicensesTitle}
                  </strong>
                  <span style={{ fontSize: '12.5px' }}>{t.dashboard.emptyLicensesHint}</span>
                </div>
              ) : (
                <div className="rs-portal-table-wrap">
                  <table className="rs-portal-table">
                    <thead>
                      <tr>
                        <th>{t.dashboard.thProduct}</th>
                        <th>{t.dashboard.thStatus}</th>
                        <th>{t.dashboard.thRemaining}</th>
                        <th>{t.dashboard.thHwid}</th>
                        <th>{t.dashboard.thExpires}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLicenses.map((lic) => {
                        const remDays = calculateRemainingDays(lic.expires_at);
                        const isExpired = remDays <= 0 || lic.status !== 'active';
                        const isBanned = lic.status === 'banned';

                        return (
                          <tr key={lic.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {lic.product_name}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  border: '1px solid #F0F0F0',
                                  backgroundColor: isBanned
                                    ? '#3b0202'
                                    : isExpired
                                    ? '#141418'
                                    : '#F0F0F0',
                                  color: isBanned || isExpired ? '#F0F0F0' : '#080808',
                                }}
                              >
                                {isBanned
                                  ? t.dashboard.statusSuspended
                                  : isExpired
                                  ? t.dashboard.statusExpired
                                  : t.dashboard.statusActive}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {remDays} {t.dashboard.daysSuffix}
                            </td>
                            <td>
                              {lic.hwid ? (
                                <button
                                  type="button"
                                  onClick={() => void handleCopyHwid(lic.id, lic.hwid!)}
                                  className="rs-portal-hwid-btn"
                                  title={lic.hwid}
                                >
                                  <span>
                                    {lic.hwid.length > 14 ? `${lic.hwid.slice(0, 14)}…` : lic.hwid}
                                  </span>
                                  <span style={{ color: '#A50000' }}>
                                    {copiedId === lic.id ? t.dashboard.copiedBtn : t.dashboard.copyHwidBtn}
                                  </span>
                                </button>
                              ) : (
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    color: 'rgba(240, 240, 240, 0.56)',
                                  }}
                                >
                                  {t.dashboard.hwidPending}
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: 'rgba(240, 240, 240, 0.72)',
                              }}
                            >
                              {formatDate(lic.expires_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="rs-portal-col">
            {/* R-AI Workstation Download Card */}
            <section className="rs-portal-card" aria-labelledby="station-card-title">
              <div className="rs-portal-card-head">
                <div className="rs-portal-card-title-group">
                  <div className="rs-portal-icon-box" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="station-card-title" className="rs-portal-card-title">
                      {t.dashboard.stationTitle}
                    </h2>
                    <p className="rs-portal-card-sub">{t.dashboard.stationSubtitle}</p>
                  </div>
                </div>
              </div>

              <div className="rs-portal-spec-list">
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">{t.dashboard.thStatus}</span>
                  <span
                    className="rs-portal-spec-val"
                    style={{
                      color: metrics.stationUnlocked ? '#F0F0F0' : '#A50000',
                    }}
                  >
                    {metrics.stationUnlocked
                      ? t.dashboard.licenseActiveBadge
                      : t.dashboard.licenseMissingBadge}
                  </span>
                </div>
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">BINARY</span>
                  <span className="rs-portal-spec-val">Restricted_Studio_Setup.exe</span>
                </div>
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">TARGET</span>
                  <span className="rs-portal-spec-val">Windows 10/11 x64</span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                  color: 'rgba(240, 240, 240, 0.72)',
                  marginBottom: '16px',
                }}
              >
                {metrics.stationUnlocked
                  ? t.dashboard.downloadActiveNotice
                  : t.dashboard.downloadLockedNotice}
              </p>

              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={!metrics.stationUnlocked || downloadLoading}
                className="rs-portal-btn-primary"
                style={{ width: '100%' }}
              >
                {downloadLoading
                  ? t.dashboard.downloadPreparingBtn
                  : metrics.stationUnlocked
                  ? t.dashboard.downloadBtn
                  : t.dashboard.downloadLockedBtn}
              </button>
            </section>

            {/* Session & Security Posture Card */}
            <section className="rs-portal-card" aria-labelledby="security-card-title">
              <div className="rs-portal-card-head">
                <div className="rs-portal-card-title-group">
                  <div className="rs-portal-icon-box" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="security-card-title" className="rs-portal-card-title">
                      {t.dashboard.securityModuleTitle}
                    </h2>
                    <p className="rs-portal-card-sub">{t.dashboard.securityModuleSubtitle}</p>
                  </div>
                </div>
              </div>

              <div className="rs-portal-spec-list">
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">{t.dashboard.accountModeLabel}</span>
                  <span className="rs-portal-spec-val">
                    {initialSessionMeta.isGuest
                      ? t.dashboard.guestMode
                      : t.dashboard.registeredMode}
                  </span>
                </div>
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">{t.dashboard.sessionFamilyLabel}</span>
                  <span className="rs-portal-spec-val">
                    {initialSessionMeta.familyId.slice(0, 14)}…
                  </span>
                </div>
                <div className="rs-portal-spec-row">
                  <span className="rs-portal-spec-key">{t.dashboard.tokenShieldLabel}</span>
                  <span className="rs-portal-spec-val">{t.dashboard.tokenShieldValue}</span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: 'rgba(240, 240, 240, 0.65)',
                  marginBottom: '14px',
                }}
              >
                {t.dashboard.revokeAllHint}
              </p>

              <button
                type="button"
                onClick={() => void handleLogout('all')}
                disabled={logoutMode !== null}
                className="rs-portal-btn-danger-outline"
              >
                {logoutMode === 'all' ? t.dashboard.loggingOutAllBtn : t.dashboard.logoutAllBtn}
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
