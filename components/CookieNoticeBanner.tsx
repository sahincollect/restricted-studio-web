'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const STORAGE_KEY = 'rs_cookie_notice_v1';

const BANNER_COPY: Record<
  Locale,
  {
    text: string;
    cookieLink: string;
    kvkkLink: string;
    acceptBtn: string;
  }
> = {
  tr: {
    text: 'Bu site; oturum güvenliği, dil tercihi ve anonim hız ölçümü amacıyla zorunlu çerezler ile tarayıcı depolaması kullanır. Reklam takip çerezi bulunmaz.',
    cookieLink: 'Çerez Politikası',
    kvkkLink: 'KVKK',
    acceptBtn: 'Anladım',
  },
  en: {
    text: 'We use strictly necessary security/session cookies, local browser storage, and cookieless telemetry. No advertising trackers are used.',
    cookieLink: 'Cookie Policy',
    kvkkLink: 'Data Notice',
    acceptBtn: 'Got it',
  },
  ru: {
    text: 'Сайт использует только обязательные технические cookie, localStorage и обезличенную телеметрию скорости без рекламного отслеживания.',
    cookieLink: 'Cookie',
    kvkkLink: 'KVKK',
    acceptBtn: 'Понятно',
  },
  fr: {
    text: 'Ce site utilise uniquement des cookies techniques essentiels, le stockage local et une télémétrie anonyme sans traceur publicitaire.',
    cookieLink: 'Cookies',
    kvkkLink: 'Données (KVKK)',
    acceptBtn: 'Compris',
  },
};

export default function CookieNoticeBanner() {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true);
      }
    } catch {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore storage restriction
    }
    setVisible(false);
  };

  if (!visible) return null;

  const copy = BANNER_COPY[locale] || BANNER_COPY.tr;

  return (
    <aside className="st-cookie-banner" role="region" aria-label={copy.cookieLink}>
      <p className="st-cookie-text">
        {copy.text}{' '}
        <Link href="/yasal/cerez" className="st-cookie-link">
          {copy.cookieLink}
        </Link>{' '}
        ·{' '}
        <Link href="/yasal/kvkk" className="st-cookie-link">
          {copy.kvkkLink}
        </Link>
      </p>
      <button type="button" onClick={handleDismiss} className="st-pill-btn is-light is-sm st-cookie-btn">
        {copy.acceptBtn}
      </button>
    </aside>
  );
}
