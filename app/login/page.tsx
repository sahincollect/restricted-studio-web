'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthPortalShell from '@/components/AuthPortalShell';
import TurnstileWidget from '@/components/TurnstileWidget';
import OAuthButtons from '@/components/OAuthButtons';
import { useI18n } from '@/components/I18nProvider';

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
  const [showPassword, setShowPassword] = useState(false);
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

  const searchParams = useSearchParams();
  const redirectTarget = sanitizeLocalRedirect(searchParams.get('redirect'));

  useEffect(() => {
    const rawError = searchParams.get('error');
    const errParam = rawError as keyof typeof t.auth.loginErrors | null;
    const reasonParam = searchParams.get('reason') as keyof typeof t.auth.loginErrors | null;

    if (rawError === 'oauth_not_configured') {
      const prov = searchParams.get('provider') === 'discord' ? 'Discord' : 'Google';
      setError(`${prov} OAuth sağlayıcısı henüz Supabase üzerinde etkinleştirilmemiş.`);
    } else if (errParam && t.auth.loginErrors[errParam]) {
      setError(t.auth.loginErrors[errParam]);
    } else if (reasonParam && t.auth.loginErrors[reasonParam]) {
      setInfoMessage(t.auth.loginErrors[reasonParam]);
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

      window.location.assign(redirectTarget);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.anonGenericError;
      setError(msg);
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

      window.location.assign(redirectTarget);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.loginGenericError;
      setError(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.forgotSendError;
      setError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthPortalShell
      title={forgotMode ? t.auth.forgotTitle : t.auth.loginTitle}
      subtitle={forgotMode ? t.auth.forgotSubtitle : t.auth.loginSubtitle}
      infoMessage={infoMessage}
      errorMessage={error}
      footer={
        <>
          <span>{t.auth.noAccountText}</span>{' '}
          <Link href="/register" style={{ color: '#F0F0F0', textDecoration: 'underline', fontWeight: 700 }}>
            {t.auth.registerLink}
          </Link>
        </>
      }
    >
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
        <form onSubmit={handleForgotSubmit} className="rs-auth-form">
          <div className="rs-auth-field">
            <label htmlFor="forgot-email" className="rs-auth-label">
              {t.auth.registeredEmailLabel}
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="rs-auth-input"
            />
          </div>

          <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

          <button type="submit" disabled={forgotLoading} className="rs-auth-btn-primary">
            {forgotLoading ? t.auth.sendingBtn : t.auth.sendResetBtn}
          </button>

          <button
            type="button"
            onClick={() => {
              setForgotMode(false);
              setError(null);
            }}
            className="rs-auth-btn-secondary"
          >
            {t.auth.backToLoginBtn}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleLogin} className="rs-auth-form">
            <div className="rs-auth-field">
              <label htmlFor="login-identifier" className="rs-auth-label">
                {t.auth.identifierLabel}
              </label>
              <input
                id="login-identifier"
                name="customer_identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.auth.identifierPlaceholder}
                autoComplete="section-customer username"
                className="rs-auth-input"
              />
            </div>

            <div className="rs-auth-field">
              <div className="rs-auth-label-row">
                <label htmlFor="login-password" className="rs-auth-label">
                  {t.auth.passwordLabel}
                </label>
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
                    color: 'rgba(240,240,240,0.72)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t.auth.forgotPasswordLink}
                </button>
              </div>
              <div className="rs-auth-input-wrap">
                <input
                  id="login-password"
                  name="customer_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="section-customer current-password"
                  className="rs-auth-input has-toggle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rs-auth-pw-toggle"
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showPassword ? t.auth.hidePassword : t.auth.showPassword}
                </button>
              </div>
            </div>

            <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

            <button type="submit" disabled={loading || anonLoading} className="rs-auth-btn-primary">
              {loading ? t.auth.verifyingBtn : t.auth.loginBtn}
            </button>
          </form>

          <div className="rs-auth-divider">
            <div className="rs-auth-divider-line" />
            <span className="rs-auth-divider-text">{t.auth.orDivider}</span>
            <div className="rs-auth-divider-line" />
          </div>

          <OAuthButtons
            redirectTo={(() => {
              const r = searchParams.get('redirect');
              return r && r.startsWith('/') && !r.startsWith('//') ? r : '/hesabim';
            })()}
          />

          <button
            type="button"
            onClick={() => void handleAnonContinue()}
            disabled={loading || anonLoading}
            className="rs-auth-btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{anonLoading ? t.auth.anonOpeningBtn : t.auth.anonContinueBtn}</span>
          </button>
        </>
      )}
    </AuthPortalShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rs-auth-shell" />}>
      <LoginFormContent />
    </Suspense>
  );
}
