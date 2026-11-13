'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  detectLocaleFromNavigator,
  isSupportedLocale,
  type Locale,
} from '@/lib/i18n';
import { TRANSLATIONS, type TranslationDictionary } from '@/lib/translations';

interface I18nContextValue {
  locale: Locale;
  t: TranslationDictionary;
  setLocale: (next: Locale) => void;
  formatNumber: (n: number) => string;
  formatPercent: (n: number) => string;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
}

const LOCALE_INTL_MAP: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  ru: 'ru-RU',
  fr: 'fr-FR',
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookieLocale(): Locale | null {
  if (typeof document === 'undefined') return null;
  try {
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const [rawKey, ...rawVal] = part.trim().split('=');
      if (rawKey === LOCALE_COOKIE_NAME) {
        const val = decodeURIComponent(rawVal.join('=')).trim().toLowerCase();
        if (isSupportedLocale(val)) return val;
      }
    }
  } catch {
    // ignore cookie parse error
  }
  return null;
}

export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  initialDetectedFromHeader = false,
  children,
}: {
  initialLocale?: Locale;
  initialDetectedFromHeader?: boolean;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // If no explicit cookie or Accept-Language matched on SSR (rare client-only fallback), check navigator
  useEffect(() => {
    const cookieLoc = readCookieLocale();
    if (cookieLoc) {
      if (cookieLoc !== locale) setLocaleState(cookieLoc);
      return;
    }

    if (!initialDetectedFromHeader) {
      const navLoc = detectLocaleFromNavigator();
      if (navLoc && navLoc !== locale) {
        setLocaleState(navLoc);
      }
    }
  }, [initialDetectedFromHeader]);

  // Keep <html lang="..."> and <title>/<meta description> in sync on manual switch
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const intlLocale = LOCALE_INTL_MAP[locale];
    return {
      locale,
      t: TRANSLATIONS[locale],
      setLocale,
      formatNumber: (n: number) => n.toLocaleString(intlLocale),
      formatPercent: (n: number) => (locale === 'tr' ? `%${n}` : `${n}%`),
      formatDate: (iso: string) => {
        try {
          return new Date(iso).toLocaleDateString(intlLocale);
        } catch {
          return iso;
        }
      },
      formatTime: (iso: string) => {
        try {
          return new Date(iso).toLocaleTimeString(intlLocale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        } catch {
          return iso;
        }
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback if rendered outside provider in isolation
    return {
      locale: DEFAULT_LOCALE,
      t: TRANSLATIONS[DEFAULT_LOCALE],
      setLocale: () => undefined,
      formatNumber: (n: number) => n.toLocaleString('tr-TR'),
      formatPercent: (n: number) => `%${n}`,
      formatDate: (iso: string) => new Date(iso).toLocaleDateString('tr-TR'),
      formatTime: (iso: string) => new Date(iso).toLocaleTimeString('tr-TR'),
    };
  }
  return ctx;
}
