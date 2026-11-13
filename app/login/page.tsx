'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import TurnstileWidget from '@/components/TurnstileWidget';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function sanitizeLocalRedirect(raw: string | null): string {
  if (!raw) return '/dashboard';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '/dashboard';
  }
  return trimmed;
}

function LoginFormContent() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeLocalRedirect(searchParams.get('redirect'));

  useEffect(() => {
    const errParam = searchParams.get('error') as keyof typeof t.auth.loginErrors | null;
    if (errParam && t.auth.loginErrors[errParam]) {
      setError(t.auth.loginErrors[errParam]);
    }
    if (searchParams.get('registered') === '1') {
      setInfoMessage(t.auth.registeredInfo);
    }
  }, [searchParams, t.auth.loginErrors, t.auth.registeredInfo]);

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
        throw new Error(data.message || t.auth.anonStartError);
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err.message || t.auth.anonGenericError);
    } finally {
      setAnonLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTurnstileReset((v) => v + 1);
        const msg =
          res.status === 401 && (!data.message || data.message === 'Geçersiz kimlik bilgileri.')
            ? t.auth.invalidCredentials
            : data.message || t.auth.invalidCredentials;
        throw new Error(msg);
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err.message || t.auth.loginGenericError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: forgotEmail.trim(),
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTurnstileReset((v) => v + 1);
        throw new Error(data.message || t.auth.forgotProcessError);
      }
      setInfoMessage(data.message);
      setForgotEmail('');
    } catch (err: any) {
      setError(err.message || t.auth.forgotSendError);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <LanguageSwitcher compact />
        </div>
        <div style={styles.header}>
          <Link href="/" style={styles.brandLink}>
            <span style={styles.brandDot}></span>
            <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
          </Link>
          <h1 style={styles.title}>{forgotMode ? t.auth.forgotTitle : t.auth.loginTitle}</h1>
          <p style={styles.subtitle}>
            {forgotMode ? t.auth.forgotSubtitle : t.auth.loginSubtitle}
          </p>
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

        {/* Hidden honeypot field for automated bot traps */}
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

        {forgotMode ? (
          <form onSubmit={handleForgotSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>{t.auth.registeredEmailLabel}</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                style={styles.input}
              />
            </div>

            <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

            <button type="submit" disabled={forgotLoading} style={styles.button}>
              {forgotLoading ? t.auth.sendingBtn : t.auth.sendResetBtn}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError(null);
              }}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(240,240,240,0.28)',
                color: 'rgba(240,240,240,0.8)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.auth.backToLoginBtn}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>{t.auth.identifierLabel}</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.auth.identifierPlaceholder}
                  autoComplete="username"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>{t.auth.passwordLabel}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError(null);
                      setInfoMessage(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(240,240,240,0.68)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {t.auth.forgotPasswordLink}
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={styles.input}
                />
              </div>

              <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

              <button type="submit" disabled={loading || anonLoading} style={styles.button}>
                {loading ? t.auth.verifyingBtn : t.auth.loginBtn}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(240,240,240,0.56)', letterSpacing: '0.08em' }}>
                {t.auth.orDivider}
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`/api/auth/google?next=${encodeURIComponent(redirectTarget)}`}
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
                <span>{t.auth.googleContinueBtn}</span>
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
                <span>{anonLoading ? t.auth.anonOpeningBtn : t.auth.anonContinueBtn}</span>
              </button>
            </div>
          </>
        )}

        <div style={styles.footer}>
          <span>{t.auth.noAccountText}</span>{' '}
          <Link href="/register" style={styles.link}>
            {t.auth.registerLink}
          </Link>
          <div style={{ marginTop: '10px', fontSize: '11.5px', color: 'rgba(240, 240, 240, 0.5)' }}>
            <Link href="/status" style={{ color: 'rgba(240, 240, 240, 0.65)', textDecoration: 'underline' }}>
              {t.auth.systemStatusLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={styles.container} />}>
      <LoginFormContent />
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
    gap: '18px',
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
    transition: 'border-color 0.2s',
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
