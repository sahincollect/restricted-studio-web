'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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

const STATE_META: Record<
  ComponentHealthState,
  { label: string; headline: string; dotColor: string; borderColor: string; badgeBg: string }
> = {
  operational: {
    label: 'ÇALIŞIYOR',
    headline: 'TÜM SİSTEMLER ÇALIŞIYOR',
    dotColor: '#22c55e',
    borderColor: '#22c55e',
    badgeBg: 'rgba(34, 197, 94, 0.14)',
  },
  degraded: {
    label: 'YAVAŞLAMA',
    headline: 'KISMİ PERFORMANS DÜŞÜŞÜ',
    dotColor: '#eab308',
    borderColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.14)',
  },
  outage: {
    label: 'KESİNTİ',
    headline: 'SERVİS ERİŞİM SORUNU ALGILANDI',
    dotColor: '#ef4444',
    borderColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
  },
};

function formatTimeTr(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function StatusBoard() {
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

  const runHealthCheck = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const payload = (await res.json()) as HealthPayload;
      if (!payload || !Array.isArray(payload.services)) {
        throw new Error('Geçersiz durum yanıtı alındı.');
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
      setFetchError('Durum verisi alınamadı. Ağ bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const currentMeta = data ? STATE_META[data.status] : STATE_META.operational;
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  const avgLatency =
    data?.services && data.services.length > 0
      ? Math.round(
          data.services.reduce((acc, item) => acc + item.latencyMs, 0) / data.services.length
        )
      : null;

  const degradedOrOutage = data?.services.filter((s) => s.status !== 'operational') || [];

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
            <span className="status-pill-tag">SİSTEM DURUMU</span>
          </div>

          <nav className="status-nav-links" aria-label="Hızlı Geçiş">
            {mainOrigin ? (
              <>
                <a href={siteLink('/')} className="status-nav-btn">
                  Ana Sayfa
                </a>
                <a href={siteLink('/katalog')} className="status-nav-btn">
                  Katalog
                </a>
                <a href={siteLink('/dashboard')} className="status-nav-btn status-nav-primary">
                  Müşteri Portalı →
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="status-nav-btn">
                  Ana Sayfa
                </Link>
                <Link href="/katalog" className="status-nav-btn">
                  Katalog
                </Link>
                <Link href="/dashboard" className="status-nav-btn status-nav-primary">
                  Müşteri Portalı →
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Global Operational Hero */}
        <section
          className="status-hero-card"
          style={{
            borderColor: fetchError ? '#ef4444' : currentMeta.borderColor,
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
                    : currentMeta.dotColor,
                }}
              />
              <h1 className="status-hero-title">
                {loading
                  ? 'SİSTEMLER KONTROL EDİLİYOR...'
                  : fetchError
                  ? 'DURUM SERVİSİNE ERİŞİLEMEDİ'
                  : currentMeta.headline}
              </h1>
            </div>
            <p className="status-hero-sub">
              {fetchError
                ? fetchError
                : data
                ? `Son kontrol: ${formatTimeTr(data.checkedAt)} · Ortalama yanıt: ${avgLatency ?? 0} ms · Bölge: ${data.region}`
                : 'Canlı servis uçları doğrulanıyor...'}
            </p>
          </div>

          <div className="status-hero-actions">
            <span className="status-countdown">Otomatik yenileme: {countdown}s</span>
            <button
              type="button"
              onClick={() => runHealthCheck(true)}
              disabled={refreshing}
              className="status-refresh-btn"
            >
              {refreshing ? 'Kontrol Ediliyor...' : 'Şimdi Kontrol Et'}
            </button>
          </div>
        </section>

        {/* Subsystem Breakdown */}
        <section className="status-section" aria-label="Servis Bileşenleri">
          <div className="status-section-head">
            <h2>ALT SİSTEMLER</h2>
            <span>Canlı HTTP / API Doğrulaması</span>
          </div>

          <div className="status-services-grid">
            {(data?.services || []).map((svc) => {
              const meta = STATE_META[svc.status];
              return (
                <article key={svc.id} className="status-service-row">
                  <div className="status-service-info">
                    <div className="status-service-name-line">
                      <span className="status-dot-sm" style={{ backgroundColor: meta.dotColor }} />
                      <h3>{svc.name}</h3>
                    </div>
                    <p className="status-service-desc">{svc.description}</p>
                    <span className="status-service-detail">{svc.detail}</span>
                  </div>

                  <div className="status-service-metrics">
                    <span className="status-latency">{svc.latencyMs} ms</span>
                    <span
                      className="status-badge"
                      style={{
                        color: meta.dotColor,
                        borderColor: meta.dotColor,
                        backgroundColor: meta.badgeBg,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* UptimeRobot Historical Metrics (when UPTIMEROBOT_API_KEY is configured) OR Real Session Log */}
        {data?.historicalMonitoring && data.monitors.length > 0 ? (
          <section className="status-section" aria-label="Geçmiş Erişilebilirlik">
            <div className="status-section-head">
              <h2>GEÇMİŞ ERİŞİLEBİLİRLİK</h2>
              <span>UptimeRobot Canlı Arşivi</span>
            </div>

            <div className="status-monitors-grid">
              {data.monitors.map((mon) => {
                const meta = STATE_META[mon.status];
                return (
                  <div key={mon.name} className="status-monitor-card">
                    <div className="status-monitor-head">
                      <span className="status-monitor-name">{mon.name}</span>
                      <span style={{ color: meta.dotColor, fontSize: '11px', fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="status-ratios">
                      <div>
                        <span>24 SAAT</span>
                        <strong>{mon.uptime24h || '-'}</strong>
                      </div>
                      <div>
                        <span>7 GÜN</span>
                        <strong>{mon.uptime7d || '-'}</strong>
                      </div>
                      <div>
                        <span>30 GÜN</span>
                        <strong>{mon.uptime30d || '-'}</strong>
                      </div>
                      <div>
                        <span>90 GÜN</span>
                        <strong>{mon.uptime90d || '-'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="status-section" aria-label="Canlı Ölçüm Geçmişi">
            <div className="status-section-head">
              <h2>CANLI KONTROL GÜNLÜĞÜ</h2>
              <span>Gerçek Zamanlı Oturum Ölçümleri</span>
            </div>

            <div className="status-log-box">
              {history.length === 0 ? (
                <div className="status-log-empty">İlk canlı doğrulama bekleniyor...</div>
              ) : (
                history.map((entry) => {
                  const meta = STATE_META[entry.status];
                  return (
                    <div key={entry.checkedAt} className="status-log-row">
                      <span>{formatTimeTr(entry.checkedAt)}</span>
                      <span style={{ color: meta.dotColor, fontWeight: 700 }}>{meta.label}</span>
                      <span>Ortalama {entry.avgLatencyMs} ms</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Incidents Panel */}
        <section className="status-section" aria-label="Olay Kayıtları">
          <div className="status-section-head">
            <h2>OLAY &amp; KESİNTİ BİLDİRİMLERİ</h2>
            <span>Anlık Durum</span>
          </div>

          <div className="status-incident-box">
            {degradedOrOutage.length === 0 ? (
              <p className="status-incident-ok">
                Tüm servisler normal çalışıyor. Aktif kesinti veya bakım kaydı bulunmuyor.
              </p>
            ) : (
              <ul className="status-incident-list">
                {degradedOrOutage.map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}:</strong> {s.detail} ({s.latencyMs} ms)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="status-footer">
          <span>Restricted Studio · Kurumsal Sistem Telemetrisi</span>
          <div className="status-footer-links">
            {mainOrigin ? (
              <>
                <a href={siteLink('/')}>Ana Sayfa</a>
                <a href={siteLink('/katalog')}>Katalog</a>
                <a href={siteLink('/discord')}>Discord</a>
              </>
            ) : (
              <>
                <Link href="/">Ana Sayfa</Link>
                <Link href="/katalog">Katalog</Link>
                <Link href="/discord">Discord</Link>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
