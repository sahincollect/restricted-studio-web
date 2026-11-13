'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TurnstileWidget from '@/components/TurnstileWidget';

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

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  const [authStep, setAuthStep] = useState<'password' | 'mfa_required' | 'mfa_setup'>('password');
  const [mfaCode, setMfaCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [dbConfigured, setDbConfigured] = useState<boolean>(true);
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [licenses, setLicenses] = useState<UserLicenseAdmin[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [genProduct, setGenProduct] = useState('R-AI');
  const [genDays, setGenDays] = useState('30');
  const [genCount, setGenCount] = useState('10');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: username.trim(),
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
      setLoading(true);
      await loadData();
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
    setCodes([]);
    setLicenses([]);
    setAuditLogs([]);
    setUsername('');
    setPassword('');
    setMfaCode('');
    setQrDataUrl(null);
    setManualSecret(null);
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

  const unusedCodesText = codes
    .filter((c) => !c.is_used)
    .map((c) => c.code)
    .join('\n');

  const copyUnusedCodes = () => {
    if (!unusedCodesText) return;
    navigator.clipboard.writeText(unusedCodesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoDot}></span>
            <span>
              <span className="brand-logo-shimmer">RESTRICTED STUDIO</span> // YÖNETİCİ PANELİ
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/dashboard" style={styles.backBtn}>
              Müşteri Paneli
            </Link>
            {authorized && (
              <button type="button" onClick={handleLogout} style={styles.backBtn}>
                Çıkış Yap
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {actionMsg && !loading && (
          <div style={styles.alertBox}>
            <span>{actionMsg}</span>
          </div>
        )}

        {authorized && !dbConfigured && !loading && (
          <div style={styles.alertBox}>
            <span>
              Veritabanı servis anahtarı (SUPABASE_SERVICE_ROLE_KEY) tanımlanmadığı için lisans tabloları salt okunur / boş görünüyor.
            </span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0', color: '#71717a', fontSize: '14px' }}>
            <div
              className="rs-spin"
              style={{
                width: 34,
                height: 34,
                margin: '0 auto 16px',
                border: '3px solid rgba(240,240,240,0.18)',
                borderTopColor: '#A50000',
                borderRadius: '50%',
              }}
            />
            Yetki doğrulanıyor...
          </div>
        ) : !authorized ? (
          <div
            style={{
              ...styles.card,
              maxWidth: '420px',
              margin: '60px auto',
              padding: '36px 32px 28px',
              borderTop: '3px solid #A50000',
              boxShadow: '7px 7px 0 #A50000',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#A50000', marginBottom: '10px' }}>
              RESTRICTED STUDIO // ZERO-TRUST
            </div>
            <h2 style={{ ...styles.cardTitle, fontSize: '22px', fontWeight: 600, marginBottom: '6px' }}>
              {authStep === 'password'
                ? 'Yönetici Girişi'
                : authStep === 'mfa_setup'
                ? 'Zorunlu 2FA (TOTP) Kurulumu'
                : 'İki Faktörlü Doğrulama (2FA)'}
            </h2>
            <p style={{ ...styles.cardSubtitle, marginBottom: '20px' }}>
              {authStep === 'password'
                ? 'Yönetici oturumu için parola ve ardından TOTP 2FA doğrulaması zorunludur.'
                : authStep === 'mfa_setup'
                ? 'QR kodu Authenticator uygulamanıza okutun ve üretilen 6 haneli kodu girerek kurulumu kilitleyin.'
                : 'Authenticator uygulamanızda görüntülenen 6 haneli tek kullanımlık kodu girin.'}
            </p>

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="admin-username" style={styles.label}>KULLANICI ADI</label>
                  <input
                    id="admin-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="admin-password" style={styles.label}>PAROLA</label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={styles.input}
                  />
                </div>

                <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

                {loginError && (
                  <div role="alert" style={{ fontSize: '12.5px', color: '#fca5a5', borderLeft: '2px solid #ef4444', paddingLeft: '10px' }}>
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loginBusy || !username.trim() || !password}
                  style={{ ...styles.generateBtn, opacity: loginBusy || !username.trim() || !password ? 0.6 : 1 }}
                >
                  {loginBusy ? 'Doğrulanıyor...' : 'Adım 1: Parolayı Doğrula →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMfaVerify} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {authStep === 'mfa_setup' && qrDataUrl && (
                  <div style={{ textAlign: 'center', backgroundColor: '#121212', padding: '14px', border: '1px solid rgba(240,240,240,0.22)' }}>
                    <img
                      src={qrDataUrl}
                      alt="Admin TOTP QR Kodu"
                      style={{ width: 176, height: 176, display: 'block', margin: '0 auto 10px' }}
                    />
                    {manualSecret && (
                      <div style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: 'rgba(240,240,240,0.75)', wordBreak: 'break-all' }}>
                        Kurulum Anahtarı: {manualSecret}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="admin-mfa-code" style={styles.label}>6 HANELİ TOTP DOĞRULAMA KODU</label>
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
                    style={{ ...styles.input, textAlign: 'center', fontSize: '20px', letterSpacing: '0.28em', fontFamily: 'ui-monospace, monospace' }}
                  />
                </div>

                {loginError && (
                  <div role="alert" style={{ fontSize: '12.5px', color: '#fca5a5', borderLeft: '2px solid #ef4444', paddingLeft: '10px' }}>
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginBusy || mfaCode.length !== 6}
                  style={{ ...styles.generateBtn, opacity: loginBusy || mfaCode.length !== 6 ? 0.6 : 1 }}
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
                  style={{
                    padding: '9px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(240,240,240,0.25)',
                    color: 'rgba(240,240,240,0.72)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Baştan Giriş Yap
                </button>
              </form>
            )}
          </div>        ) : (
          <>
        {/* 1. TOPLU KOD ÜRETİCİ */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Toplu Lisans Kodu Üretici</h2>
              <p style={styles.cardSubtitle}>İtemsatış veya mağaza teslimatları için toplu aktivasyon kodları oluşturun.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>ÜRÜN ADI</label>
              <select value={genProduct} onChange={(e) => setGenProduct(e.target.value)} style={styles.select}>
                <option value="R-AI">R-AI</option>
                <option value="RESTRICTED-FIVEM">RESTRICTED-FIVEM</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>SÜRE (GÜN)</label>
              <select value={genDays} onChange={(e) => setGenDays(e.target.value)} style={styles.select}>
                <option value="30">30 Gün (1 Ay)</option>
                <option value="90">90 Gün (3 Ay)</option>
                <option value="365">365 Gün (1 Yıl)</option>
                <option value="9999">9999 Gün (Sınırsız / Lifetime)</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>ADET (1 - 500)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={genCount}
                onChange={(e) => setGenCount(e.target.value)}
                style={styles.numInput}
              />
            </div>

            <button type="submit" disabled={genLoading} style={styles.primaryBtn}>
              {genLoading ? 'Üretiliyor...' : 'Kodları Üret'}
            </button>
          </form>
        </div>

        {/* 2. İTEMSATIŞ STOK ALANI (TÜMÜNÜ KOPYALA) */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={styles.cardTitle}>İtemsatış Stok Formatı (Kullanılmamış Kodlar)</h2>
              <p style={styles.cardSubtitle}>
                Toplam {codes.filter((c) => !c.is_used).length} adet hazır stok kodu listeleniyor. Tek tıkla kopyalayıp İtemsatış otomatik teslimata yapıştırabilirsiniz.
              </p>
            </div>
            <button onClick={copyUnusedCodes} disabled={!unusedCodesText} style={styles.copyBtn}>
              {copied ? '✓ Kopyalandı!' : 'Tümünü Kopyala (Alt Alta)'}
            </button>
          </div>

          <textarea
            readOnly
            value={unusedCodesText || 'Henüz kullanılmamış stok kodu yok. Yukarıdan toplu kod üretebilirsiniz.'}
            rows={6}
            style={styles.codeTextarea}
          />
        </div>

        {/* 3. MÜŞTERİ LİSANSLARI & HWID YÖNETİMİ */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Kullanıcı Lisansları &amp; HWID Kilidi Yönetimi</h2>
              <p style={styles.cardSubtitle}>Cihaz değiştiren müşterilerin HWID kilidini sıfırlayın veya lisanslarını askıya alın.</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>KULLANICI ID</th>
                  <th style={styles.th}>ÜRÜN</th>
                  <th style={styles.th}>DURUM</th>
                  <th style={styles.th}>HWID DONANIM KİLİDİ</th>
                  <th style={styles.th}>BİTİŞ TARİHİ</th>
                  <th style={styles.th}>EYLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {licenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'rgba(240,240,240,0.65)' }}>
                      Henüz aktif kullanıcı lisansı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  licenses.map((lic) => (
                    <tr key={lic.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px', color: 'rgba(240,240,240,0.7)' }}>
                          {lic.user_id.slice(0, 12)}...
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: '#F0F0F0' }}>{lic.product_name}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: lic.status === 'active' ? '#F0F0F0' : '#450000',
                            color: lic.status === 'active' ? '#080808' : '#F0F0F0',
                            border: '1px solid #F0F0F0',
                          }}
                        >
                          {lic.status === 'active' ? 'Aktif' : 'Banlı / Askıda'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: lic.hwid ? '#F0F0F0' : '#A50000' }}>
                          {lic.hwid || 'Cihaz Yok (Serbest)'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '12px', color: 'rgba(240,240,240,0.72)' }}>{new Date(lic.expires_at).toLocaleDateString('tr-TR')}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleResetHwid(lic.id)}
                            disabled={!lic.hwid}
                            style={{
                              ...styles.actionBtn,
                              opacity: lic.hwid ? 1 : 0.4,
                              cursor: lic.hwid ? 'pointer' : 'not-allowed',
                            }}
                          >
                            HWID Sıfırla
                          </button>
                          <button
                            onClick={() => handleToggleBan(lic.id, lic.status)}
                            style={{
                              ...styles.actionBtn,
                              backgroundColor: lic.status === 'active' ? '#A50000' : '#F0F0F0',
                              color: lic.status === 'active' ? '#F0F0F0' : '#080808',
                              borderColor: '#F0F0F0',
                            }}
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

        {/* 4. DEĞİŞTİRİLEMEZ GÜVENLİK DENETİM KAYITLARI (AUDIT LOGS) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Güvenlik &amp; Denetim Kayıtları (Audit Logs)</h2>
              <p style={styles.cardSubtitle}>
                Değiştirilemez güvenlik olayları, yönetici işlemleri ve önce/sonra durum değişiklikleri.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>ZAMAN</th>
                  <th style={styles.th}>EYLEM</th>
                  <th style={styles.th}>AKTÖR</th>
                  <th style={styles.th}>IP ADRESİ</th>
                  <th style={styles.th}>DURUM ÖZETİ</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(240,240,240,0.65)' }}>
                      Henüz kaydedilmiş denetim olayı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: 'rgba(240,240,240,0.7)' }}>
                          {new Date(log.created_at).toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, fontSize: '11.5px', color: '#F0F0F0' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: 'rgba(240,240,240,0.75)' }}>
                          {log.actor_type}: {log.actor_id.slice(0, 18)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: '#A50000' }}>
                          {log.ip_address || '-'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '10.5px', color: 'rgba(240,240,240,0.65)' }}>
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
          </>
        )}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#080808',
    color: '#F0F0F0',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundImage:
      'var(--grain-svg), radial-gradient(rgba(240, 240, 240, 0.06) 1px, transparent 1px), linear-gradient(155deg, #080808 0%, #080808 62%, rgba(139, 0, 0, 0.32) 100%)',
    backgroundSize: '160px 160px, 5px 5px, 100% 100%',
  },
  header: {
    borderBottom: '1.5px solid rgba(240, 240, 240, 0.28)',
    backgroundColor: 'rgba(8, 8, 8, 0.94)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: '1150px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#F0F0F0',
    textDecoration: 'none',
    fontWeight: 800,
    fontSize: '13px',
    letterSpacing: '0.08em',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    border: '1px solid #F0F0F0',
  },
  backBtn: {
    padding: '7px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.38)',
    color: '#F0F0F0',
    fontSize: '12px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  main: {
    maxWidth: '1150px',
    margin: '0 auto',
    padding: '36px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: '#080808',
    border: '2px solid rgba(240, 240, 240, 0.42)',
    borderRadius: '0px',
    padding: '26px',
    boxShadow: '6px 6px 0 #8B0000',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  cardIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '0px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#F0F0F0',
    marginBottom: '3px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.68)',
  },
  formRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(240, 240, 240, 0.78)',
    letterSpacing: '0.06em',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.35)',
    color: '#F0F0F0',
    fontSize: '13.5px',
    outline: 'none',
  },
  numInput: {
    width: '110px',
    padding: '11px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.35)',
    color: '#F0F0F0',
    fontSize: '13.5px',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.32)',
    color: '#F0F0F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  generateBtn: {
    marginTop: '6px',
    padding: '13px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    fontSize: '14px',
    fontWeight: 700,
    border: '1.5px solid #F0F0F0',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #8B0000',
  },
  primaryBtn: {
    padding: '12px 22px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    fontSize: '13.5px',
    fontWeight: 700,
    border: '1.5px solid #F0F0F0',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #8B0000',
  },
  copyBtn: {
    padding: '8px 16px',
    borderRadius: '0px',
    backgroundColor: '#F0F0F0',
    border: '1.5px solid #F0F0F0',
    color: '#080808',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  codeTextarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.3)',
    color: '#F0F0F0',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    boxSizing: 'border-box',
    outline: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1.5px solid rgba(240, 240, 240, 0.35)',
  },
  th: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(240, 240, 240, 0.68)',
    letterSpacing: '0.06em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(240, 240, 240, 0.14)',
  },
  td: {
    padding: '14px',
    fontSize: '13px',
    color: '#F0F0F0',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '0px',
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.35)',
    color: '#F0F0F0',
    fontSize: '11.5px',
    fontWeight: 700,
  },
  alertBox: {
    padding: '14px 18px',
    borderRadius: '0px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    color: '#F0F0F0',
    fontSize: '13.5px',
    fontWeight: 700,
  },
};
