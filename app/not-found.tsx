'use client';

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import { HeroPrismBackdrop } from '@/components/StudioReveal';

export default function NotFound() {
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
          <span className="st-offer-tag">{t.errorsPage.notFoundCode}</span>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{t.errorsPage.notFoundTitle}</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-dark-muted)' }}>{t.errorsPage.notFoundDesc}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <Link href="/" className="st-pill-btn is-dark">
              {t.common.backToHome}
            </Link>
            <Link href="/katalog" className="st-pill-btn is-ember">
              {t.errorsPage.exploreCatalog}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
