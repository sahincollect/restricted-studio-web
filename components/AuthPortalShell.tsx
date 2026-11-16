'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface AuthPortalShellProps {
  title: string;
  subtitle: string;
  infoMessage?: string | null;
  errorMessage?: string | null;
  footer?: ReactNode;
  children: ReactNode;
}

export default function AuthPortalShell({
  title,
  subtitle,
  infoMessage,
  errorMessage,
  footer,
  children,
}: AuthPortalShellProps) {
  const { t } = useI18n();

  return (
    <div className="rs-auth-shell">
      <header className="rs-auth-topbar">
        <Link href="/" className="rs-auth-brand">
          <span className="rs-auth-brand-mark" aria-hidden="true" />
          <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
        </Link>

        <nav className="rs-auth-nav" aria-label="Portal navigation">
          <Link href="/" className="rs-auth-nav-link">
            {t.auth.backHomeLink}
          </Link>
          <Link href="/katalog" className="rs-auth-nav-link nav-katalog-shimmer">
            {t.auth.catalogLink}
          </Link>
          <Link href="/lisanslar" className="rs-auth-nav-link nav-katalog-shimmer">
            {t.common.licenses}
          </Link>
          <Link href="/status" className="rs-auth-nav-link">
            {t.auth.systemStatusLink}
          </Link>
          <LanguageSwitcher compact />
        </nav>
      </header>

      <main className="rs-auth-grid">
        <aside className="rs-auth-dossier">
          <div>
            <div className="rs-auth-eyebrow">{t.auth.securityEyebrow}</div>
            <h2 className="rs-auth-headline">{t.auth.securityHeadline}</h2>
            <p className="rs-auth-summary">{t.auth.securitySummary}</p>

            <ul className="rs-auth-specs">
              {t.auth.securitySpecs.map((spec) => (
                <li key={spec} className="rs-auth-spec-item">
                  <span className="rs-auth-spec-dot" aria-hidden="true" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rs-auth-dossier-foot">
            <span>{t.common.itemsatisTrust}</span>
            <span>HTTPONLY • HMAC-SHA256</span>
          </div>
        </aside>

        <section className="rs-auth-card" aria-labelledby="auth-portal-title">
          <div className="rs-auth-card-head">
            <h1 id="auth-portal-title" className="rs-auth-title">
              {title}
            </h1>
            <p className="rs-auth-subtitle">{subtitle}</p>
          </div>

          {infoMessage && (
            <div className="rs-auth-alert is-info" role="status">
              <span>{infoMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rs-auth-alert is-error" role="alert">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: '2px' }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {children}

          {footer && <div className="rs-auth-card-foot">{footer}</div>}
        </section>
      </main>
    </div>
  );
}
