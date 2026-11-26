'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import PlatformLogosBar from '@/components/PlatformLogosBar';
import { HeroPrismBackdrop } from '@/components/StudioReveal';

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
      <SiteNavbar activePath="/login" />

      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        <HeroPrismBackdrop />

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

              <div style={{ marginTop: '22px' }}>
                <PlatformLogosBar variant="compact" />
              </div>
            </div>

            <div className="rs-auth-dossier-foot">
              <span>{t.common.itemsatisTrust}</span>
              <span>HTTPONLY • HMAC-SHA256</span>
            </div>
          </aside>

          <section className="rs-auth-card" aria-labelledby="auth-portal-title">
            <div>
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
                <span>{errorMessage}</span>
              </div>
            )}

            {children}

            {footer && <div className="rs-auth-foot-note">{footer}</div>}
          </section>
        </main>
      </div>
    </div>
  );
}
