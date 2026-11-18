'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthPortalShell from '@/components/AuthPortalShell';
import TurnstileWidget from '@/components/TurnstileWidget';
import OAuthButtons from '@/components/OAuthButtons';
import { useI18n } from '@/components/I18nProvider';
import { LEGAL_FORM_COPY } from '@/lib/legal-docs';

function evaluatePasswordScore(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw) && pw.length >= 10) score += 1;
  return score;
}

function RegisterFormContent() {
  const { locale, t } = useI18n();
  const legalCopy = LEGAL_FORM_COPY[locale] || LEGAL_FORM_COPY.tr;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pwScore = useMemo(() => evaluatePasswordScore(password), [password]);
  const pwLevelIndex = pwScore > 0 ? Math.min(pwScore - 1, 3) : 0;

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

      window.location.assign('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.anonGenericError;
      setError(msg);
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
      setError(t.auth.errEnterIdentifier);
      setLoading(false);
      return;
    }

    if (!isEmail && cleanInput.length < 3) {
      setError(t.auth.errUsernameLength);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.errPasswordLength);
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError(t.auth.errPasswordMismatch);
      setLoading(false);
      return;
    }

    if (!legalAccepted) {
      setError(legalCopy.registerConsentErr);
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
          kvkkAccepted: true,
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const apiData = await apiRes.json();

      if (!apiRes.ok || !apiData.success) {
        setTurnstileReset((v) => v + 1);
        throw new Error(apiData.message || t.auth.errRegisterFailed);
      }

      if (apiData.authenticated) {
        window.location.assign('/dashboard');
      } else {
        setInfoMessage(apiData.message);
        setPassword('');
        setPasswordConfirm('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.errRegisterGeneric;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPortalShell
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      infoMessage={infoMessage}
      errorMessage={error}
      footer={
        <>
          <span>{t.auth.alreadyHaveAccount}</span>{' '}
          <Link href="/login" style={{ color: '#F0F0F0', textDecoration: 'underline', fontWeight: 700 }}>
            {t.auth.loginHereLink}
          </Link>
        </>
      }
    >
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

      <form onSubmit={handleRegister} className="rs-auth-form">
        <div className="rs-auth-field">
          <label htmlFor="reg-identifier" className="rs-auth-label">
            {t.auth.identifierLabel}
          </label>
          <input
            id="reg-identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t.auth.registerIdentifierPlaceholder}
            autoComplete="username"
            className="rs-auth-input"
          />
        </div>

        <div className="rs-auth-field">
          <label htmlFor="reg-password" className="rs-auth-label">
            {t.auth.passwordLabel}
          </label>
          <div className="rs-auth-input-wrap">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.registerPasswordPlaceholder}
              autoComplete="new-password"
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

          {password.length > 0 && (
            <div className="rs-pw-meter" aria-live="polite">
              <div className="rs-pw-bars">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={`rs-pw-bar ${pwScore >= step ? `level-${pwScore}` : ''}`}
                  />
                ))}
              </div>
              <div className="rs-pw-meta">
                <span>{t.auth.pwStrengthLabel}</span>
                <span style={{ color: pwScore >= 3 ? '#F0F0F0' : '#A50000' }}>
                  {t.auth.pwLevels[pwLevelIndex]}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rs-auth-field">
          <label htmlFor="reg-password-confirm" className="rs-auth-label">
            {t.auth.passwordConfirmLabel}
          </label>
          <div className="rs-auth-input-wrap">
            <input
              id="reg-password-confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="rs-auth-input has-toggle"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="rs-auth-pw-toggle"
              aria-label={showConfirm ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showConfirm ? t.auth.hidePassword : t.auth.showPassword}
            </button>
          </div>
        </div>

        <label className="st-consent-check">
          <input
            type="checkbox"
            checked={legalAccepted}
            onChange={(e) => setLegalAccepted(e.target.checked)}
            required
          />
          <span>
            {legalCopy.registerConsentPrefix}
            <Link href="/yasal/kvkk" className="st-cookie-link">
              {legalCopy.kvkkLink}
            </Link>
            {' & '}
            <Link href="/yasal/kullanim-kosullari" className="st-cookie-link">
              {legalCopy.termsLink}
            </Link>
            {legalCopy.registerConsentSuffix}
          </span>
        </label>

        <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />

        <button type="submit" disabled={loading || anonLoading} className="rs-auth-btn-primary">
          {loading ? t.auth.verifyingBtn : t.auth.registerSubmitBtn}
        </button>
      </form>

      <div className="rs-auth-divider">
        <div className="rs-auth-divider-line" />
        <span className="rs-auth-divider-text">{t.auth.orDivider}</span>
        <div className="rs-auth-divider-line" />
      </div>

      <OAuthButtons redirectTo="/hesabim" />

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
    </AuthPortalShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="rs-auth-shell" />}>
      <RegisterFormContent />
    </Suspense>
  );
}
