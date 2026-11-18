'use client';

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import { HeroPrismBackdrop } from '@/components/StudioReveal';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="st-page-shell">
      <SiteNavbar />
      <main className="st-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <HeroPrismBackdrop />
        <div
          className="st-offer-asym-card"
          style={{ maxWidth: '480px', width: '100%', textAlign: 'center', alignItems: 'center', position: 'relative', zIndex: 2 }}
        >
          <span className="st-offer-tag">{t.errorsPage.errorCode}</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>{t.errorsPage.errorTitle}</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-dark-muted)' }}>{t.errorsPage.errorDesc}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button type="button" onClick={() => reset()} className="st-pill-btn is-dark">
              {t.errorsPage.retryBtn}
            </button>
            <Link href="/" className="st-pill-btn is-ember">
              {t.common.backToHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
