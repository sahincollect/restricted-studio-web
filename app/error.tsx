'use client';

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#080808',
        color: '#F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundImage:
          'var(--grain-svg), linear-gradient(155deg, #080808 0%, #080808 62%, #450000 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#080808',
          border: '2px solid #F0F0F0',
          boxShadow: '8px 8px 0 #A50000',
          padding: '36px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: '#A50000',
            marginBottom: '12px',
          }}
        >
          {t.errorsPage.errorCode}
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>
          {t.errorsPage.errorTitle}
        </h1>
        <p style={{ fontSize: '13.5px', color: 'rgba(240, 240, 240, 0.72)', lineHeight: 1.6, marginBottom: '24px' }}>
          {t.errorsPage.errorDesc}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '11px 20px',
              backgroundColor: '#A50000',
              border: '1.5px solid #F0F0F0',
              color: '#F0F0F0',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t.errorsPage.retryBtn}
          </button>
          <Link
            href="/"
            style={{
              padding: '11px 20px',
              backgroundColor: '#0e0e0e',
              border: '1.5px solid rgba(240,240,240,0.45)',
              color: '#F0F0F0',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {t.common.backToHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
