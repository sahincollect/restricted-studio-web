'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase';

interface UserLicense {
  id: string;
  product_name: string;
  hwid: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [licenses, setLicenses] = useState<UserLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    let session = sessionData?.session;

    if (!session || !session.user) {
      try {
        let creds: { email: string; password: string } | null = null;
        const saved = typeof window !== 'undefined' ? localStorage.getItem('rs_anon_creds') : null;
        if (saved) {
          try {
            creds = JSON.parse(saved);
          } catch {
            creds = null;
          }
        }

        if (creds?.email && creds?.password) {
          const { data: reAuth } = await supabase.auth.signInWithPassword({
            email: creds.email,
            password: creds.password,
          });
          if (reAuth?.session) session = reAuth.session;
        }

        if (!session) {
          const anonRes = await fetch('/api/auth/anonymous', { method: 'POST' });
          const anonData = await anonRes.json();
          if (anonRes.ok && anonData.success) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('rs_anon_creds', JSON.stringify({ email: anonData.email, password: anonData.password }));
            }
            const { data: newAuth } = await supabase.auth.signInWithPassword({
              email: anonData.email,
              password: anonData.password,
            });
            if (newAuth?.session) session = newAuth.session;
          }
        }
      } catch {
        // Fallback to login if offline
      }
    }

    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    setUser(session.user);
    setToken(session.access_token);

    try {
      const res = await fetch('/api/licenses', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses || []);
        setIsAdmin(Boolean(data.isAdmin));
      }
    } catch {
      // Fallback
    }
    setLoading(false);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setRedeemLoading(true);
    setRedeemMessage(null);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Kod aktive edilemedi.');
      }

      setRedeemMessage({ type: 'success', text: data.message });
      setRedeemCode('');
      // Lisansları yeniden yükle
      await loadUserData();
    } catch (err: any) {
      setRedeemMessage({ type: 'error', text: err.message || 'Bir hata oluştu.' });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    setRedeemMessage(null);
    try {
      const res = await fetch('/api/download', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'İndirme bağlantısı alınamadı.');
      }
      window.location.href = data.url;
    } catch (err: any) {
      setRedeemMessage({ type: 'error', text: err.message || 'İndirme başarısız.' });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const calculateRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const activeLicense = licenses.find(
    (l) => l.product_name === 'R-AI' && l.status === 'active' && new Date(l.expires_at) > new Date()
  );

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoDot}></span>
            RESTRICTED STUDIO
          </Link>
          <div style={styles.userSection}>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: 'rgba(0, 113, 227, 0.16)',
                  border: '1px solid rgba(0, 113, 227, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Yönetici Paneli
              </Link>
            )}
            <span style={styles.userEmail}>
              {user?.user_metadata?.username || user?.email?.replace(/@(restrictedstudio\.com|restrictedstudio\.local|restricted\.studio)$/i, '')}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.pageTitle}>Müşteri Kontrol Paneli</h1>
            <p style={styles.pageSubtitle}>İtemsatış kodlarınızı aktive edin, lisanslarınızı görüntüleyin ve R-AI kurulum dosyasını indirin.</p>
          </div>
        </div>

        {/* 1. Kod Aktif Et (Redeem) Kartı */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Aktivasyon Kodu Kullan (Redeem)</h2>
              <p style={styles.cardSubtitle}>İtemsatış siparişinizden aldığınız kodu buraya girerek lisansınızı hesabınıza tanımlayın.</p>
            </div>
          </div>

          {redeemMessage && (
            <div
              style={{
                ...styles.messageBox,
                backgroundColor: redeemMessage.type === 'success' ? '#0e0e0e' : '#450000',
                borderColor: redeemMessage.type === 'success' ? '#F0F0F0' : '#A50000',
                color: '#F0F0F0',
              }}
            >
              <span>{redeemMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleRedeem} style={styles.redeemForm}>
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Örn: R-AI-XXXX-XXXX-XXXX"
              style={styles.redeemInput}
            />
            <button type="submit" disabled={redeemLoading || !redeemCode.trim()} style={styles.redeemBtn}>
              {redeemLoading ? 'Doğrulanıyor...' : 'Kodu Aktif Et'}
            </button>
          </form>
        </div>

        {/* 2. R-AI Masaüstü Uygulaması ve İndirme Kartı */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>R-AI Masaüstü Çalışma İstasyonu</h2>
              <p style={styles.cardSubtitle}>Kurumsal yapay zeka masaüstü (.exe) yazılımını doğrudan indirin.</p>
            </div>
          </div>

          <div style={styles.downloadSection}>
            <div style={styles.downloadInfo}>
              <div style={styles.downloadStatus}>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: activeLicense ? '#F0F0F0' : '#450000',
                    color: activeLicense ? '#080808' : '#F0F0F0',
                    border: '1px solid #F0F0F0',
                  }}
                >
                  {activeLicense ? 'LİSANS AKTİF & ONAYLI' : 'AKTİF LİSANS BULUNAMADI'}
                </span>
                <span style={styles.fileMeta}>Restricted_Studio_Setup.exe • Windows 10/11 x64</span>
              </div>
              <p style={styles.downloadNotice}>
                {activeLicense
                  ? 'Aktif lisansınız onaylandı. Aşağıdaki butona tıklayarak kurulum dosyasını indirebilirsiniz.'
                  : 'Kurulum dosyasını indirebilmek için önce geçerli bir aktivasyon kodu girerek lisans tanımlamalısınız.'}
              </p>
            </div>

            {activeLicense ? (
              <button onClick={handleDownload} disabled={downloadLoading} style={{ ...styles.downloadBtnActive, border: 'none', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{downloadLoading ? 'Bağlantı hazırlanıyor...' : 'R-AI Kurulum Dosyasını İndir (.exe)'}</span>
              </button>
            ) : (
              <button disabled style={styles.downloadBtnDisabled}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>İndirme Kilitli (Lisans Gereklidir)</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Lisanslarım ve HWID Tablosu */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Lisanslarım ve Cihaz Durumları</h2>
              <p style={styles.cardSubtitle}>Hesabınıza tanımlı ürünler, kalan süreler ve HWID donanım kilitleri.</p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Lisans bilgileri yükleniyor...</div>
          ) : licenses.length === 0 ? (
            <div style={styles.emptyBox}>
              <p>Henüz hesabınıza tanımlı aktif bir lisans bulunmuyor.</p>
              <span style={{ fontSize: '12px', color: 'rgba(240, 240, 240, 0.6)' }}>İtemsatış kodunuzu yukarıdaki kutucuğa girerek hemen başlatabilirsiniz.</span>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>ÜRÜN</th>
                    <th style={styles.th}>DURUM</th>
                    <th style={styles.th}>KALAN SÜRE</th>
                    <th style={styles.th}>DONANIM KİLİDİ (HWID)</th>
                    <th style={styles.th}>BİTİŞ TARİHİ</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((lic) => {
                    const daysLeft = calculateRemainingDays(lic.expires_at);
                    const isExpired = daysLeft <= 0;
                    return (
                      <tr key={lic.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <span style={styles.prodTag}>{lic.product_name}</span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor: !isExpired && lic.status === 'active' ? '#F0F0F0' : '#450000',
                              color: !isExpired && lic.status === 'active' ? '#080808' : '#F0F0F0',
                              border: '1px solid #F0F0F0',
                            }}
                          >
                            {!isExpired && lic.status === 'active' ? 'Aktif' : isExpired ? 'Süresi Doldu' : 'Askıya Alındı'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 700, color: daysLeft > 5 ? '#F0F0F0' : '#A50000' }}>
                            {daysLeft > 0 ? `${daysLeft} Gün` : '0 Gün'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {lic.hwid ? (
                            <span style={styles.hwidActive}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Kilitli ({lic.hwid.slice(0, 10)}...)
                            </span>
                          ) : (
                            <span style={styles.hwidPending}>İlk Cihaz Bekleniyor</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dateText}>{new Date(lic.expires_at).toLocaleDateString('tr-TR')}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
    maxWidth: '1100px',
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
    fontSize: '14px',
    letterSpacing: '0.08em',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    border: '1px solid #F0F0F0',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.72)',
    fontWeight: 500,
  },
  logoutBtn: {
    padding: '7px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid #A50000',
    color: '#F0F0F0',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '36px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    color: '#F0F0F0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'rgba(240, 240, 240, 0.68)',
  },
  card: {
    backgroundColor: '#080808',
    border: '2px solid rgba(240, 240, 240, 0.42)',
    borderRadius: '0px',
    padding: '28px',
    boxShadow: '6px 6px 0 #8B0000',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '0px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  redeemForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  redeemInput: {
    flex: 1,
    minWidth: '260px',
    padding: '13px 16px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.35)',
    color: '#F0F0F0',
    fontSize: '14px',
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.08em',
    outline: 'none',
  },
  redeemBtn: {
    padding: '13px 24px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    fontSize: '13.5px',
    fontWeight: 700,
    border: '1.5px solid #F0F0F0',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #8B0000',
    transition: 'all 0.15s',
  },
  messageBox: {
    padding: '12px 16px',
    borderRadius: '0px',
    fontSize: '13.5px',
    marginBottom: '16px',
    border: '1.5px solid #F0F0F0',
  },
  downloadSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.25)',
    borderRadius: '0px',
  },
  downloadInfo: {
    flex: 1,
    minWidth: '280px',
  },
  downloadStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: '0px',
    letterSpacing: '0.05em',
  },
  fileMeta: {
    fontSize: '12.5px',
    color: 'rgba(240, 240, 240, 0.72)',
    fontFamily: 'ui-monospace, monospace',
  },
  downloadNotice: {
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.68)',
    lineHeight: '1.45',
  },
  downloadBtnActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 22px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    border: '1.5px solid #F0F0F0',
    fontSize: '13.5px',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '4px 4px 0 #F0F0F0',
    transition: 'all 0.15s',
  },
  downloadBtnDisabled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 22px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    color: 'rgba(240, 240, 240, 0.48)',
    border: '1.5px solid rgba(240, 240, 240, 0.22)',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'not-allowed',
  },
  tableWrapper: {
    overflowX: 'auto',
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
  prodTag: {
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 700,
    color: '#F0F0F0',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '0px',
  },
  hwidActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#F0F0F0',
    fontWeight: 700,
  },
  hwidPending: {
    fontSize: '12px',
    color: '#A50000',
    fontWeight: 700,
  },
  dateText: {
    fontSize: '12px',
    color: 'rgba(240, 240, 240, 0.7)',
    fontFamily: 'ui-monospace, monospace',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '30px',
    color: 'rgba(240, 240, 240, 0.68)',
    fontSize: '13.5px',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#0e0e0e',
    borderRadius: '0px',
    border: '1.5px dashed rgba(240, 240, 240, 0.35)',
    color: 'rgba(240, 240, 240, 0.72)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
};
