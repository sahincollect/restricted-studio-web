'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase';

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

export default function AdminPage() {
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [licenses, setLicenses] = useState<UserLicenseAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [genProduct, setGenProduct] = useState('R-AI');
  const [genDays, setGenDays] = useState('30');
  const [genCount, setGenCount] = useState('10');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (session?.access_token) {
      setToken(session.access_token);
    }

    await loadData(session?.access_token || '');
  };

  const loadData = async (jwt: string) => {
    try {
      const headers: any = {};
      if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

      const res = await fetch('/api/admin', { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthorized(true);
        setCodes(data.codes || []);
        setLicenses(data.licenses || []);
        setActionMsg(null);
      } else {
        setAuthorized(false);
        setActionMsg(null);
      }
    } catch (err: any) {
      setActionMsg('Bağlantı hatası: ' + err.message);
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
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Giriş başarısız.');
        setPassword('');
        return;
      }
      setPassword('');
      setLoading(true);
      await loadData(token);
    } catch {
      setLoginError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => undefined);
    setAuthorized(false);
    setCodes([]);
    setLicenses([]);
    setUsername('');
    setPassword('');
  };
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setActionMsg(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
      await loadData(token);
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'reset_hwid',
          license_id: licenseId,
        }),
      });

      const data = await res.json();
      setActionMsg(data.message);
      await loadData(token);
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'toggle_ban',
          license_id: licenseId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      setActionMsg(data.message);
      await loadData(token);
    } catch (err: any) {
      setActionMsg('İşlem hatası: ' + err.message);
    }
  };

  // İtemsatış stokları için kullanılmamış kodları alt alta kopyala
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
            RESTRICTED STUDIO // YÖNETİCİ PANELİ
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0', color: '#71717a', fontSize: '14px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                margin: '0 auto 16px',
                border: '3px solid rgba(255,255,255,0.08)',
                borderTopColor: '#fe0000',
                borderRadius: '50%',
                animation: 'rsSpin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes rsSpin{to{transform:rotate(360deg)}}`}</style>
            Yetki doğrulanıyor...
          </div>
        ) : !authorized ? (
          <div
            style={{
              ...styles.card,
              maxWidth: '400px',
              margin: '80px auto',
              padding: '36px 32px 28px',
              borderTop: '2px solid #dc2626',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#ef4444', marginBottom: '10px' }}>
              RESTRICTED STUDIO
            </div>
            <h2 style={{ ...styles.cardTitle, fontSize: '22px', fontWeight: 600, marginBottom: '6px' }}>Yönetici Girişi</h2>
            <p style={{ ...styles.cardSubtitle, marginBottom: '24px' }}>
              Bu alan yetkili personele aittir. Tüm erişimler denetlenir.
            </p>
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
              {loginError && (
                <div role="alert" style={{ fontSize: '12.5px', color: '#fca5a5', borderLeft: '2px solid #dc2626', paddingLeft: '10px' }}>
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loginBusy || !username.trim() || !password}
                style={{ ...styles.generateBtn, opacity: loginBusy || !username.trim() || !password ? 0.6 : 1 }}
              >
                {loginBusy ? 'Doğrulanıyor...' : 'Giriş Yap'}
              </button>
            </form>
          </div>        ) : (
          <>
        {/* 1. TOPLU KOD ÜRETİCİ */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fe0000" strokeWidth="2">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fe0000" strokeWidth="2">
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
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#71717a' }}>
                      Henüz aktif kullanıcı lisansı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  licenses.map((lic) => (
                    <tr key={lic.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px', color: '#94a3b8' }}>
                          {lic.user_id.slice(0, 12)}...
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{lic.product_name}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: lic.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: lic.status === 'active' ? '#10b981' : '#f87171',
                          }}
                        >
                          {lic.status === 'active' ? 'Aktif' : 'Banlı / Askıda'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: lic.hwid ? '#34d399' : '#f59e0b' }}>
                          {lic.hwid || 'Cihaz Yok (Serbest)'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(lic.expires_at).toLocaleDateString('tr-TR')}</span>
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
                              backgroundColor: lic.status === 'active' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                              color: lic.status === 'active' ? '#f87171' : '#34d399',
                              borderColor: lic.status === 'active' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
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
          </>
        )}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#08080b',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(10, 11, 16, 0.85)',
    backdropFilter: 'blur(16px)',
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
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 800,
    fontSize: '13px',
    letterSpacing: '0.08em',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fe0000',
    boxShadow: '0 0 10px #fe0000',
  },
  backBtn: {
    padding: '7px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e2e8f0',
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
    backgroundColor: 'rgba(14, 15, 22, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '26px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
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
    borderRadius: '10px',
    backgroundColor: 'rgba(254, 0, 0, 0.12)',
    border: '1px solid rgba(254, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '3px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#71717a',
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
    color: '#a1a1aa',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
  },
  numInput: {
    width: '110px',
    padding: '11px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
  },
  primaryBtn: {
    padding: '12px 22px',
    borderRadius: '8px',
    backgroundColor: '#fe0000',
    color: '#ffffff',
    fontSize: '13.5px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(254, 0, 0, 0.35)',
  },
  copyBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  codeTextarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#e2e8f0',
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
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#71717a',
    letterSpacing: '0.06em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '14px',
    fontSize: '13px',
    color: '#e2e8f0',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '5px',
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#e2e8f0',
    fontSize: '11.5px',
    fontWeight: 600,
  },
  alertBox: {
    padding: '14px 18px',
    borderRadius: '10px',
    backgroundColor: 'rgba(254, 0, 0, 0.12)',
    border: '1px solid rgba(254, 0, 0, 0.35)',
    color: '#ff6b6b',
    fontSize: '13.5px',
    fontWeight: 600,
  },
};
