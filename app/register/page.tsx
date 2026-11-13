'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TurnstileWidget from '@/components/TurnstileWidget';

function RegisterFormContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnonContinue = async () => {
    setAnonLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTurnstileReset((v) => v + 1);
        throw new Error(data.message || 'Misafir oturumu başlatılamadı.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Anonim giriş sırasında bir hata oluştu.');
    } finally {
      setAnonLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes('@');

    if (!cleanInput) {
      setError('Lütfen kullanıcı adı veya e-posta giriniz.');
      setLoading(false);
      return;
    }

    if (!isEmail && cleanInput.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      const apiRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          identifier: cleanInput,
          password,
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const apiData = await apiRes.json();

      if (!apiRes.ok || !apiData.success) {
        setTurnstileReset((v) => v + 1);
        throw new Error(apiData.message || 'Kayıt işlemi tamamlanamadı.');
      }

      if (apiData.authenticated) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setInfoMessage(apiData.message);
        setPassword('');
        setPasswordConfirm('');
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.brandLink}>
            <span style={styles.brandDot}></span>
            <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
          </Link>
          <h1 style={styles.title}>Hesap Oluştur</h1>
          <p style={styles.subtitle}>İtemsatış kodlarınızı aktive etmek ve R-AI kullanmak için kaydolun.</p>
        </div>

        {infoMessage && (
          <div
            style={{
              ...styles.errorBox,
              backgroundColor: '#0e0e0e',
              borderColor: '#F0F0F0',
              color: '#F0F0F0',
            }}
          >
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Hidden honeypot field */}
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

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>KULLANICI ADI VEYA E-POSTA</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Örn: saintstudio veya ornek@domain.com"
              autoComplete="username"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>ŞİFRE</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter (Büyük/küçük harf + rakam)"
              autoComplete="new-password"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>ŞİFRE TEKRAR</label>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={styles.input}
            />
          </div>

          <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

          <button type="submit" disabled={loading || anonLoading} style={styles.button}>
            {loading ? 'Doğrulanıyor...' : 'Güvenli Kayıt Ol'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(240,240,240,0.56)', letterSpacing: '0.08em' }}>
            VEYA TEK TIKLA
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="/api/auth/google?next=%2Fdashboard"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '0px',
              backgroundColor: '#F0F0F0',
              border: '1.5px solid #F0F0F0',
              color: '#080808',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textDecoration: 'none',
              boxShadow: '3px 3px 0 #8B0000',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#080808"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>Google ile Devam Et</span>
          </a>

          <button
            type="button"
            onClick={handleAnonContinue}
            disabled={loading || anonLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '0px',
              backgroundColor: '#0e0e0e',
              border: '1.5px solid rgba(240, 240, 240, 0.42)',
              color: '#F0F0F0',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{anonLoading ? 'Güvenli Oturum Açılıyor...' : 'Anonim Olarak Devam Et'}</span>
          </button>
        </div>

        <div style={styles.footer}>
          <span>Zaten hesabınız var mı?</span>{' '}
          <Link href="/login" style={styles.link}>
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={styles.container} />}>
      <RegisterFormContent />
    </Suspense>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#080808',
    backgroundImage:
      'var(--grain-svg), radial-gradient(rgba(240, 240, 240, 0.08) 1px, transparent 1px), linear-gradient(155deg, #080808 0%, #080808 58%, #450000 84%, #8B0000 100%)',
    backgroundSize: '160px 160px, 5px 5px, 100% 100%',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#080808',
    border: '2px solid #F0F0F0',
    borderRadius: '0px',
    padding: '36px 32px',
    boxShadow: '7px 7px 0 #A50000',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  brandLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: 'rgba(240, 240, 240, 0.8)',
    textDecoration: 'none',
    marginBottom: '16px',
  },
  brandDot: {
    width: '8px',
    height: '8px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    border: '1px solid #F0F0F0',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#F0F0F0',
    letterSpacing: '-0.02em',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.68)',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.3)',
    color: '#F0F0F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
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
    transition: 'all 0.15s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    color: '#F0F0F0',
    padding: '10px 14px',
    borderRadius: '0px',
    fontSize: '13px',
    marginBottom: '18px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.65)',
  },
  link: {
    color: '#F0F0F0',
    textDecoration: 'underline',
    fontWeight: 700,
  },
};
