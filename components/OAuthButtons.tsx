'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const OAUTH_COPY: Record<
  Locale,
  {
    google: string;
    discord: string;
    setupPending: string;
  }
> = {
  tr: {
    google: 'Google ile Devam Et',
    discord: 'Discord ile Devam Et',
    setupPending: 'Kurulum Bekleniyor',
  },
  en: {
    google: 'Continue with Google',
    discord: 'Continue with Discord',
    setupPending: 'Setup Pending',
  },
  ru: {
    google: 'Войти через Google',
    discord: 'Войти через Discord',
    setupPending: 'Ожидает настройки',
  },
  fr: {
    google: 'Continuer avec Google',
    discord: 'Continuer avec Discord',
    setupPending: 'Configuration requise',
  },
};

export default function OAuthButtons({ redirectTo = '/hesabim' }: { redirectTo?: string }) {
  const { locale } = useI18n();
  const copy = OAUTH_COPY[locale] || OAUTH_COPY.tr;
  const [providers, setProviders] = useState<{ google: boolean; discord: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/providers', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.google === 'boolean') {
          setProviders({ google: Boolean(data.google), discord: Boolean(data.discord) });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const cleanNext = encodeURIComponent(redirectTo.startsWith('/') ? redirectTo : '/hesabim');

  return (
    <div className="rs-oauth-stack">
      <a href={`/api/auth/oauth/google?next=${cleanNext}`} className="rs-auth-btn-oauth">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.4c-.2 1.2-1.5 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.1 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-2H12z"
          />
        </svg>
        <span>{copy.google}</span>
      </a>

      <a href={`/api/auth/oauth/discord?next=${cleanNext}`} className="rs-auth-btn-oauth is-discord">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#818CF8" aria-hidden="true">
          <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
        <span>{copy.discord}</span>
        {providers && !providers.discord && (
          <span className="rs-oauth-badge">{copy.setupPending}</span>
        )}
      </a>
    </div>
  );
}
