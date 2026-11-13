'use client';

import React from 'react';
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import { useI18n } from './I18nProvider';

export default function LanguageSwitcher({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`rs-lang-switcher ${compact ? 'is-compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={t.common.langLabel}
      title={t.common.autoLangHint}
    >
      {SUPPORTED_LOCALES.map((loc: Locale) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            className={`rs-lang-btn ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            title={LOCALE_LABELS[loc].native}
          >
            {LOCALE_LABELS[loc].code}
          </button>
        );
      })}
    </div>
  );
}
