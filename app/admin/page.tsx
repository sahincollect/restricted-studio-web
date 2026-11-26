'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TurnstileWidget from '@/components/TurnstileWidget';
import AdminStoreManager from '@/components/AdminStoreManager';
import AdminOrdersManager from '@/components/AdminOrdersManager';
import { HeroPrismBackdrop } from '@/components/StudioReveal';

interface RedeemCode {
  id: string;
  code: string;
  product_name: string;
  duration_days: number;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

interface UserLicenseAdmin {
  id: string;
  user_id: string;
  product_name: string;
  hwid: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_type: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  created_at: string;
}

type AdminSection = 'overview' | 'orders' | 'store' | 'licenses' | 'audit';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  const [authStep, setAuthStep] = useState<'password' | 'mfa_required' | 'mfa_setup'>('password');
  const [mfaCode, setMfaCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [dbConfigured, setDbConfigured] = useState<boolean>(true);
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [licenses, setLicenses] = useState<UserLicenseAdmin[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // License generator & filters
  const [genProduct, setGenProduct] = useState('R-AI');
  const [genDays, setGenDays] = useState('30');
  const [genCount, setGenCount] = useState('10');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [licenseQuery, setLicenseQuery] = useState('');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [auditQuery, setAuditQuery] = useState('');

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    setLoading(true);
    try {
      const stateRes = await fetch('/api/admin/login', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const stateData = await stateRes.json().catch(() => ({}));
      if (stateData?.authenticated) {
        if (typeof stateData.username === 'string' && stateData.username.trim()) {
          setActiveOperator(stateData.username.trim());
        }
        await loadData();
        return;
      }
      if (stateData?.mfaPending) {
        setAuthStep('mfa_required');
      }
      setAuthorized(false);
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthorized(true);
        setDbConfigured(Boolean(data.dbConfigured));
        setCodes(data.codes || []);
        setLicenses(data.licenses || []);
        setAuditLogs(data.auditLogs || []);
      } else {
        setAuthorized(false);
      }
    } catch (err: any) {
      setActionMsg('Bağlantı hatası: ' + (err.message || 'Sunucuya erişilemedi.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    const trimmedUser = username.trim();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: trimmedUser,
          password,
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setTurnstileReset((v) => v + 1);
        setLoginError(data.message || 'Geçersiz kimlik bilgileri.');
        setPassword('');
        return;
      }

      setActiveOperator(trimmedUser || null);
      setPassword('');
      if (data.step === 'mfa_setup') {
        setQrDataUrl(data.qrDataUrl || null);
        setManualSecret(data.manualSecret || null);
        setAuthStep('mfa_setup');
      } else {
        setAuthStep('mfa_required');
      }
    } catch {
      setLoginError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: mfaCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Doğrulama kodu geçersiz.');
        return;
      }

      setMfaCode('');
      setQrDataUrl(null);
      if (data.enrolled && !data.persistedToDb) {
        setActionMsg(
          '2FA etkinleştirildi. Kalıcı üretim güvenliği için üretilen TOTP sırrını ADMIN_TOTP_SECRET olarak Vercel ortam değişkenlerine ekleyin.'
        );
      }
      await checkAdminAndLoad();
    } catch {
      setLoginError('2FA doğrulaması sırasında bağlantı hatası.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', {
      method: 'DELETE',
      credentials: 'same-origin',
    }).catch(() => undefined);
    setAuthorized(false);
    setAuthStep('password');
    setActiveOperator(null);
    setActiveSection('overview');
    setCodes([]);
    setLicenses([]);
    setAuditLogs([]);
    setUsername('');
    setPassword('');
    setMfaCode('');
    setQrDataUrl(null);
    setManualSecret(null);
    setActionMsg(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setActionMsg(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'generate_codes',
          product_name: genProduct,
          duration_days: Number(genDays),
          count: Number(genCount),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Kod üretilemedi.');
      }

      setActionMsg(data.message);
      await loadData();
    } catch (err: any) {
      setActionMsg('Hata: ' + err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleResetHwid = async (licenseId: string) => {
    if (!confirm('Bu kullanıcının HWID cihaz kilidini sıfırlamak istediğinize emin misiniz?')) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'reset_hwid',
          license_id: licenseId,
        }),
      });

      const data = await res.json();
      setActionMsg(data.message);
      await loadData();
    } catch (err: any) {
      setActionMsg('HWID sıfırlama hatası: ' + err.message);
    }
  };

  const handleToggleBan = async (licenseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    if (!confirm(`Lisans durumunu '${newStatus}' olarak değiştirmek istiyor musunuz?`)) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'toggle_ban',
          license_id: licenseId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      setActionMsg(data.message);
      await loadData();
    } catch (err: any) {
      setActionMsg('İşlem hatası: ' + err.message);
    }
  };

  const unusedCodes = useMemo(() => codes.filter((c) => !c.is_used), [codes]);
  const unusedCodesText = useMemo(() => unusedCodes.map((c) => c.code).join('\n'), [unusedCodes]);

  const activeLicensesCount = useMemo(
    () => licenses.filter((l) => l.status === 'active').length,
    [licenses]
  );
  const bannedLicensesCount = useMemo(
    () => licenses.filter((l) => l.status !== 'active').length,
    [licenses]
  );
  const unusedRaiCount = useMemo(
    () => unusedCodes.filter((c) => c.product_name === 'R-AI').length,
    [unusedCodes]
  );
  const unusedFivemCount = useMemo(
    () => unusedCodes.filter((c) => c.product_name === 'RESTRICTED-FIVEM').length,
    [unusedCodes]
  );

  const filteredLicenses = useMemo(() => {
    const q = licenseQuery.trim().toLowerCase();
    return licenses.filter((lic) => {
      if (licenseFilter === 'active' && lic.status !== 'active') return false;
      if (licenseFilter === 'banned' && lic.status === 'active') return false;
      if (!q) return true;
      return (
        lic.user_id.toLowerCase().includes(q) ||
        lic.product_name.toLowerCase().includes(q) ||
        (lic.hwid || '').toLowerCase().includes(q)
      );
    });
  }, [licenses, licenseFilter, licenseQuery]);

  const filteredAuditLogs = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.actor_id.toLowerCase().includes(q) ||
        (log.ip_address || '').toLowerCase().includes(q) ||
        (log.resource_id || '').toLowerCase().includes(q)
    );
  }, [auditLogs, auditQuery]);

  const copyUnusedCodes = () => {
    if (!unusedCodesText) return;
    navigator.clipboard.writeText(unusedCodesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyManualSecret = () => {
    if (!manualSecret) return;
    navigator.clipboard.writeText(manualSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const menuItems: Array<{ id: AdminSection; label: string; count?: number | null }> = [
    { id: 'overview', label: 'Genel Bakış', count: null },
    { id: 'orders', label: 'Sipariş & Teslimat', count: null },
    { id: 'store', label: 'Mağaza Vitrin', count: null },
    { id: 'licenses', label: 'Lisans & Stok', count: unusedCodes.length },
    { id: 'audit', label: 'Güvenlik & Loglar', count: auditLogs.length },
  ];

  return (
    <div className="rs-admin-shell">
      <HeroPrismBackdrop />

      <header className="rs-admin-header">
        <div className="rs-admin-header-inner">
          <Link href="/" className="rs-admin-brand">
            <Image
              src="/assets/newstlogo.jpg"
              alt="Restricted Studio"
              width={28}
              height={28}
              sizes="28px"
              style={{ borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            <span className="rs-admin-brand-text">RESTRICTED STUDIO</span>
            <span className="rs-admin-brand-tag">ADMIN</span>
          </Link>

          <div className="rs-admin-actions">
            {authorized && activeOperator && (
              <span className="rs-admin-operator-pill" title="Aktif Yönetici Hesabı">
                <span className="rs-admin-operator-dot" aria-hidden="true" />
                <span>{activeOperator}</span>
              </span>
            )}
            <Link href="/lisanslar" className="rs-admin-btn">
              Vitrin ↗
            </Link>
            <Link href="/hesabim" className="rs-admin-btn">
              Hesabım
            </Link>
            {authorized && (
              <button type="button" onClick={handleLogout} className="rs-admin-btn is-danger">
                Çıkış Yap
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="rs-admin-main">
        {actionMsg && !loading && (
          <div className="rs-admin-alert" role="status">
            <span>{actionMsg}</span>
            <button
              type="button"
              onClick={() => setActionMsg(null)}
              className="rs-admin-btn"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              aria-label="Bildirimi kapat"
            >
              Kapat
            </button>
          </div>
        )}

        {authorized && !dbConfigured && !loading && (
          <div className="rs-admin-alert is-error">
            <span>
              Veritabanı servis anahtarı (SUPABASE_SERVICE_ROLE_KEY) tanımlanmadığı için lisans tabloları salt okunur / boş görünüyor.
            </span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <div
              className="rs-spin"
              style={{
                width: 34,
                height: 34,
                margin: '0 auto 16px',
                border: '3px solid rgba(255,255,255,0.16)',
                borderTopColor: 'var(--accent-ember)',
                borderRadius: '50%',
              }}
            />
            Yetki doğrulanıyor...
          </div>
        ) : !authorized ? (
          <div className="rs-admin-auth-wrap">
            <div className="rs-admin-auth-card">
              <div className="rs-admin-auth-steps" aria-label="Doğrulama adımları">
                <span className={`rs-admin-step-pill ${authStep === 'password' ? 'is-active' : ''}`}>
                  1 · PAROLA
                </span>
                <span className={`rs-admin-step-pill ${authStep !== 'password' ? 'is-active' : ''}`}>
                  2 · TOTP 2FA
                </span>
              </div>

              <div>
                <div className="rs-admin-store-kicker" style={{ marginBottom: '6px' }}>
                  RESTRICTED STUDIO // ZERO-TRUST
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                  {authStep === 'password'
                    ? 'Yönetici Girişi'
                    : authStep === 'mfa_setup'
                    ? 'Zorunlu 2FA (TOTP) Kurulumu'
                    : 'İki Faktörlü Doğrulama (2FA)'}
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {authStep === 'password'
                    ? 'Yönetici oturumu için kimlik bilgileri ve ardından TOTP 2FA doğrulaması zorunludur.'
                    : authStep === 'mfa_setup'
                    ? 'QR kodu Authenticator uygulamanıza okutun ve üretilen 6 haneli kodu girerek kurulumu kilitleyin.'
                    : 'Authenticator uygulamanızda görüntülenen 6 haneli tek kullanımlık kodu girin.'}
                </p>
              </div>

              {/* Hidden honeypot */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />

              {authStep === 'password' ? (
                <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="rs-admin-field">
                    <label htmlFor="admin-username" className="rs-admin-label">
                      KULLANICI ADI
                    </label>
                    <input
                      id="admin-username"
                      name="rs_admin_username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="section-admin username"
                      placeholder="Yönetici kullanıcı adı"
                      autoFocus
                      required
                      className="rs-admin-input"
                    />
                  </div>

                  <div className="rs-admin-field">
                    <label htmlFor="admin-password" className="rs-admin-label">
                      PAROLA
                    </label>
                    <div className="rs-admin-input-wrap">
                      <input
                        id="admin-password"
                        name="rs_admin_password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="section-admin current-password"
                        placeholder="••••••••"
                        required
                        className="rs-admin-input"
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="rs-admin-eye-btn"
                        aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                      >
                        {showPassword ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
                            <path d="M1 1l22 22" />
                            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19" />
                          </svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

                  {loginError && (
                    <div role="alert" className="rs-admin-alert is-error" style={{ padding: '10px 12px', fontSize: '12.5px' }}>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginBusy || !username.trim() || !password}
                    className="rs-admin-submit-btn"
                    style={{ width: '100%', padding: '12px 20px' }}
                  >
                    {loginBusy ? 'Doğrulanıyor...' : 'Adım 1: Parolayı Doğrula →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMfaVerify} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {authStep === 'mfa_setup' && qrDataUrl && (
                    <div className="rs-admin-mfa-qr-box">
                      <div className="rs-admin-mfa-qr-frame">
                        <img
                          src={qrDataUrl}
                          alt="Admin TOTP QR Kodu"
                          style={{ width: 168, height: 168, display: 'block' }}
                        />
                      </div>
                      {manualSecret && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                            Kurulum Anahtarı: {manualSecret}
                          </div>
                          <button type="button" onClick={copyManualSecret} className="rs-admin-btn" style={{ alignSelf: 'center' }}>
                            {secretCopied ? '✓ Anahtar Kopyalandı' : 'Anahtarı Kopyala'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rs-admin-field">
                    <label htmlFor="admin-mfa-code" className="rs-admin-label">
                      6 HANELİ TOTP DOĞRULAMA KODU
                    </label>
                    <input
                      id="admin-mfa-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      autoFocus
                      required
                      className="rs-admin-input"
                      style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '0.28em', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  {loginError && (
                    <div role="alert" className="rs-admin-alert is-error" style={{ padding: '10px 12px', fontSize: '12.5px' }}>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginBusy || mfaCode.length !== 6}
                    className="rs-admin-submit-btn"
                    style={{ width: '100%', padding: '12px 20px' }}
                  >
                    {loginBusy ? 'Doğrulanıyor...' : '2FA Onayla ve Panele Gir'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('password');
                      setMfaCode('');
                      setLoginError(null);
                    }}
                    className="rs-admin-btn"
                    style={{ width: '100%' }}
                  >
                    Baştan Giriş Yap
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="rs-admin-layout">
            {/* ADMIN MENU SIDEBAR (Desktop Sticky Sidebar / Mobile Horizontal Glass Bar) */}
            <aside className="rs-admin-sidebar" aria-label="Admin Navigasyonu">
              <div className="rs-admin-sidebar-profile">
                <div className="rs-admin-sidebar-kicker">YÖNETİCİ KONSOLU</div>
                <div className="rs-admin-sidebar-op">
                  <span>{activeOperator || 'Admin Operatör'}</span>
                  <span className="rs-admin-badge is-ok">2FA</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Supabase: {dbConfigured ? 'Bağlı' : 'Salt Okunur'}
                </div>
              </div>

              <nav className="rs-admin-menu" aria-label="Admin Menüsü">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`rs-admin-menu-btn ${isActive ? 'is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="rs-admin-menu-label">
                        <AdminMenuIcon section={item.id} />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.count === 'number' && (
                        <span className="rs-admin-menu-count">{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="rs-admin-sidebar-footer">
                <button
                  type="button"
                  onClick={() => void loadData()}
                  disabled={refreshing}
                  className="rs-admin-btn"
                  style={{ width: '100%' }}
                >
                  {refreshing ? 'Yenileniyor...' : 'Yenile'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rs-admin-btn is-danger"
                  style={{ width: '100%' }}
                >
                  Çıkış
                </button>
              </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <section className="rs-admin-content" aria-live="polite">
              {activeSection === 'overview' && (
                <>
                  <div className="rs-admin-kpi-grid">
                    <button
                      type="button"
                      onClick={() => setActiveSection('licenses')}
                      className="rs-admin-kpi-card"
                    >
                      <span className="rs-admin-kpi-kicker">HAZIR STOK KODU</span>
                      <span className="rs-admin-kpi-value">{unusedCodes.length}</span>
                      <span className="rs-admin-kpi-meta">
                        {codes.length} toplam kod · Yönet →
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('licenses')}
                      className="rs-admin-kpi-card"
                    >
                      <span className="rs-admin-kpi-kicker">AKTİF LİSANS</span>
                      <span className="rs-admin-kpi-value">{activeLicensesCount}</span>
                      <span className="rs-admin-kpi-meta">
                        {bannedLicensesCount} askıda · HWID&nbsp;→
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('orders')}
                      className="rs-admin-kpi-card"
                    >
                      <span className="rs-admin-kpi-kicker">TESLİMAT ODALARI</span>
                      <span className="rs-admin-kpi-value">1:1</span>
                      <span className="rs-admin-kpi-meta">Teslimat sohbeti&nbsp;→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('audit')}
                      className="rs-admin-kpi-card"
                    >
                      <span className="rs-admin-kpi-kicker">GÜVENLİK OLAYI</span>
                      <span className="rs-admin-kpi-value">{auditLogs.length}</span>
                      <span className="rs-admin-kpi-meta">Değiştirilemez loglar →</span>
                    </button>
                  </div>

                  <div className="rs-admin-quick-grid">
                    <div className="rs-admin-card">
                      <div className="rs-admin-card-head">
                        <div className="rs-admin-card-head-left">
                          <div className="rs-admin-card-icon">
                            <AdminMenuIcon section="licenses" />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                              Stok &amp; Lisans Özeti
                            </h2>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                              Kullanılmamış ürün kodlarını kopyalayın veya yeni seri üretin.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rs-admin-store-meta-row">
                        <span className="rs-admin-store-pill">
                          R-AI Hazır: <strong>{unusedRaiCount}</strong>
                        </span>
                        <span className="rs-admin-store-pill">
                          FiveM Hazır: <strong>{unusedFivemCount}</strong>
                        </span>
                        <span className="rs-admin-store-pill">
                          Kullanılan Kod: <strong>{codes.length - unusedCodes.length}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                        <button
                          type="button"
                          onClick={copyUnusedCodes}
                          disabled={!unusedCodesText}
                          className="rs-admin-submit-btn"
                        >
                          {copied ? '✓ Stok Kopyalandı!' : 'Hazır Stokları Kopyala'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('licenses')}
                          className="rs-admin-btn"
                        >
                          Kod Üret &amp; HWID →
                        </button>
                      </div>
                    </div>

                    <div className="rs-admin-card">
                      <div className="rs-admin-card-head">
                        <div className="rs-admin-card-head-left">
                          <div className="rs-admin-card-icon">
                            <AdminMenuIcon section="orders" />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                              Mağaza &amp; Teslimat Hızlı Geçiş
                            </h2>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                              Shopier teslimat sohbetlerini yanıtlayın veya İtemsatış vitrin fiyatlarını güncelleyin.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                        <button
                          type="button"
                          onClick={() => setActiveSection('orders')}
                          className="rs-admin-submit-btn"
                        >
                          Sipariş &amp; Teslimat Aç
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('store')}
                          className="rs-admin-btn"
                        >
                          Mağaza Vitrin &amp; Fiyatlar →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rs-admin-card">
                    <div className="rs-admin-card-head">
                      <div className="rs-admin-card-head-left">
                        <div className="rs-admin-card-icon">
                          <AdminMenuIcon section="audit" />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                            Son Güvenlik &amp; Denetim Hareketleri
                          </h2>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                            En son kaydedilen 5 yönetici veya güvenlik olayı.
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setActiveSection('audit')} className="rs-admin-btn">
                        Tüm Kayıtlar ({auditLogs.length}) →
                      </button>
                    </div>

                    <div className="rs-admin-table-wrap">
                      <table className="rs-admin-table">
                        <thead>
                          <tr>
                            <th>ZAMAN</th>
                            <th>EYLEM</th>
                            <th>AKTÖR</th>
                            <th>IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                Henüz denetim olayı kaydedilmedi.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.slice(0, 5).map((log) => (
                              <tr key={log.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                  {new Date(log.created_at).toLocaleString('tr-TR')}
                                </td>
                                <td style={{ fontWeight: 700, color: '#ffffff' }}>{log.action}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                  {log.actor_type}: {log.actor_id.slice(0, 18)}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--accent-coral)' }}>
                                  {log.ip_address || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'orders' && <AdminOrdersManager />}

              {activeSection === 'store' && <AdminStoreManager />}

              {activeSection === 'licenses' && (
                <>
                  {/* 1. TOPLU KOD ÜRETİCİ */}
                  <div className="rs-admin-card">
                    <div className="rs-admin-card-head">
                      <div className="rs-admin-card-head-left">
                        <div className="rs-admin-card-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                            Toplu Lisans Kodu Üretici
                          </h2>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                            İtemsatış veya mağaza teslimatları için toplu aktivasyon kodları oluşturun.
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleGenerate} className="rs-admin-form-row">
                      <div className="rs-admin-field">
                        <label htmlFor="admin-gen-product" className="rs-admin-label">
                          ÜRÜN ADI
                        </label>
                        <select
                          id="admin-gen-product"
                          value={genProduct}
                          onChange={(e) => setGenProduct(e.target.value)}
                          className="rs-admin-select"
                        >
                          <option value="R-AI">R-AI</option>
                          <option value="RESTRICTED-FIVEM">RESTRICTED-FIVEM</option>
                        </select>
                      </div>

                      <div className="rs-admin-field">
                        <label htmlFor="admin-gen-days" className="rs-admin-label">
                          SÜRE (GÜN)
                        </label>
                        <select
                          id="admin-gen-days"
                          value={genDays}
                          onChange={(e) => setGenDays(e.target.value)}
                          className="rs-admin-select"
                        >
                          <option value="30">30 Gün (1 Ay)</option>
                          <option value="90">90 Gün (3 Ay)</option>
                          <option value="365">365 Gün (1 Yıl)</option>
                          <option value="9999">9999 Gün (Sınırsız / Lifetime)</option>
                        </select>
                      </div>

                      <div className="rs-admin-field" style={{ maxWidth: '170px' }}>
                        <label htmlFor="admin-gen-count" className="rs-admin-label">
                          ADET (1 - 500)
                        </label>
                        <input
                          id="admin-gen-count"
                          type="number"
                          min="1"
                          max="500"
                          value={genCount}
                          onChange={(e) => setGenCount(e.target.value)}
                          className="rs-admin-input"
                        />
                      </div>

                      <button type="submit" disabled={genLoading} className="rs-admin-submit-btn">
                        {genLoading ? 'Üretiliyor...' : 'Kodları Üret'}
                      </button>
                    </form>
                  </div>

                  {/* 2. İTEMSATIŞ STOK ALANI */}
                  <div className="rs-admin-card">
                    <div className="rs-admin-card-head">
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                          İtemsatış Stok Formatı (Kullanılmamış Kodlar)
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          Toplam {unusedCodes.length} adet hazır stok kodu listeleniyor. Tek tıkla kopyalayıp otomatik teslimata yapıştırabilirsiniz.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={copyUnusedCodes}
                        disabled={!unusedCodesText}
                        className="rs-admin-btn"
                      >
                        {copied ? '✓ Kopyalandı!' : 'Tümünü Kopyala (Alt Alta)'}
                      </button>
                    </div>

                    <textarea
                      readOnly
                      value={unusedCodesText || 'Henüz kullanılmamış stok kodu yok. Yukarıdan toplu kod üretebilirsiniz.'}
                      rows={6}
                      className="rs-admin-textarea"
                      aria-label="Kullanılmamış lisans kodları"
                    />
                  </div>

                  {/* 3. MÜŞTERİ LİSANSLARI & HWID YÖNETİMİ */}
                  <div className="rs-admin-card">
                    <div className="rs-admin-card-head">
                      <div className="rs-admin-card-head-left">
                        <div className="rs-admin-card-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                            Kullanıcı Lisansları &amp; HWID Kilidi Yönetimi ({filteredLicenses.length})
                          </h2>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                            Cihaz değiştiren müşterilerin HWID kilidini sıfırlayın veya lisanslarını askıya alın.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rs-admin-store-filters">
                      <input
                        type="search"
                        value={licenseQuery}
                        onChange={(e) => setLicenseQuery(e.target.value)}
                        placeholder="Kullanıcı ID, ürün veya HWID ara..."
                        className="rs-admin-input"
                        style={{ flex: 1, minWidth: '210px' }}
                      />
                      <select
                        value={licenseFilter}
                        onChange={(e) => setLicenseFilter(e.target.value as 'all' | 'active' | 'banned')}
                        className="rs-admin-select"
                        style={{ width: 'auto', minWidth: '160px' }}
                        aria-label="Lisans durum filtresi"
                      >
                        <option value="all">Tüm Durumlar</option>
                        <option value="active">Sadece Aktif</option>
                        <option value="banned">Banlı / Askıda</option>
                      </select>
                    </div>

                    <div className="rs-admin-table-wrap">
                      <table className="rs-admin-table">
                        <thead>
                          <tr>
                            <th>KULLANICI ID</th>
                            <th>ÜRÜN</th>
                            <th>DURUM</th>
                            <th>HWID DONANIM KİLİDİ</th>
                            <th>BİTİŞ TARİHİ</th>
                            <th>EYLEMLER</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLicenses.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Eşleşen kullanıcı lisansı bulunmuyor.
                              </td>
                            </tr>
                          ) : (
                            filteredLicenses.map((lic) => (
                              <tr key={lic.id}>
                                <td>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                    {lic.user_id.slice(0, 12)}...
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{lic.product_name}</span>
                                </td>
                                <td>
                                  <span className={`rs-admin-badge ${lic.status === 'active' ? 'is-ok' : 'is-ban'}`}>
                                    {lic.status === 'active' ? 'Aktif' : 'Banlı / Askıda'}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '11.5px',
                                      color: lic.hwid ? '#ffffff' : 'var(--accent-coral)',
                                    }}
                                  >
                                    {lic.hwid || 'Cihaz Yok (Serbest)'}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {new Date(lic.expires_at).toLocaleDateString('tr-TR')}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleResetHwid(lic.id)}
                                      disabled={!lic.hwid}
                                      className="rs-admin-btn"
                                      style={{ opacity: lic.hwid ? 1 : 0.45, cursor: lic.hwid ? 'pointer' : 'not-allowed' }}
                                    >
                                      HWID Sıfırla
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBan(lic.id, lic.status)}
                                      className={`rs-admin-btn ${lic.status === 'active' ? 'is-danger' : ''}`}
                                    >
                                      {lic.status === 'active' ? 'Banla' : 'Aktif Et'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'audit' && (
                <div className="rs-admin-card">
                  <div className="rs-admin-card-head">
                    <div className="rs-admin-card-head-left">
                      <div className="rs-admin-card-icon">
                        <AdminMenuIcon section="audit" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                          Güvenlik &amp; Denetim Kayıtları ({filteredAuditLogs.length})
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          Değiştirilemez güvenlik olayları, yönetici işlemleri ve önce/sonra durum değişiklikleri.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rs-admin-store-filters">
                    <input
                      type="search"
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      placeholder="Eylem, aktör veya IP adresi filtrele..."
                      className="rs-admin-input"
                    />
                  </div>

                  <div className="rs-admin-table-wrap">
                    <table className="rs-admin-table">
                      <thead>
                        <tr>
                          <th>ZAMAN</th>
                          <th>EYLEM</th>
                          <th>AKTÖR</th>
                          <th>IP ADRESİ</th>
                          <th>DURUM ÖZETİ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAuditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              Eşleşen denetim olayı bulunmuyor.
                            </td>
                          </tr>
                        ) : (
                          filteredAuditLogs.map((log) => (
                            <tr key={log.id}>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                  {new Date(log.created_at).toLocaleString('tr-TR')}
                                </span>
                              </td>
                              <td>
                                <span className="rs-admin-badge">{log.action}</span>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                  {log.actor_type}: {log.actor_id.slice(0, 18)}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--accent-coral)' }}>
                                  {log.ip_address || '-'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {log.before_state || log.after_state
                                    ? `${log.before_state ? JSON.stringify(log.before_state) : '-'} -> ${
                                        log.after_state ? JSON.stringify(log.after_state) : '-'
                                      }`
                                    : log.resource_id || '-'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminMenuIcon({ section }: { section: AdminSection }) {
  if (section === 'overview') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (section === 'orders') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (section === 'store') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (section === 'licenses') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
