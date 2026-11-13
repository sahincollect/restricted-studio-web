export type Locale = 'tr' | 'en' | 'ru' | 'fr';

export const SUPPORTED_LOCALES: readonly Locale[] = ['tr', 'en', 'ru', 'fr'];
export const DEFAULT_LOCALE: Locale = 'tr';
export const LOCALE_COOKIE_NAME = 'rs_lang';

export const LOCALE_LABELS: Record<Locale, { code: string; native: string }> = {
  tr: { code: 'TR', native: 'Türkçe' },
  en: { code: 'EN', native: 'English' },
  ru: { code: 'RU', native: 'Русский' },
  fr: { code: 'FR', native: 'Français' },
};

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return SUPPORTED_LOCALES.includes(value.toLowerCase() as Locale);
}

/**
 * Matches an individual BCP-47 language tag (e.g. "en-US", "ru-RU", "fr-CA", "tr")
 * against our supported locales.
 */
export function matchLanguageTag(tag: string | null | undefined): Locale | null {
  if (!tag) return null;
  const normalized = tag.trim().toLowerCase();
  if (!normalized || normalized === '*') return null;

  const primary = normalized.split('-')[0]?.split('_')[0];
  if (!primary) return null;

  if (isSupportedLocale(primary)) {
    return primary;
  }

  return null;
}

/**
 * Parses an HTTP Accept-Language header in strict RFC 9110 q-weight order
 * and returns the highest-priority supported locale, or null if none match.
 */
export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  const parsed = header
    .split(',')
    .map((part, index) => {
      const segments = part.trim().split(';');
      const tag = segments[0]?.trim() || '';
      let q = 1.0;

      for (let i = 1; i < segments.length; i++) {
        const param = segments[i]?.trim().toLowerCase();
        if (param?.startsWith('q=')) {
          const parsedQ = Number.parseFloat(param.slice(2));
          if (!Number.isNaN(parsedQ) && parsedQ >= 0 && parsedQ <= 1) {
            q = parsedQ;
          }
        }
      }

      return { tag, q, index };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => {
      if (b.q !== a.q) return b.q - a.q;
      return a.index - b.index;
    });

  for (const entry of parsed) {
    const matched = matchLanguageTag(entry.tag);
    if (matched) {
      return matched;
    }
  }

  return null;
}

export function detectLocaleFromNavigator(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];

  for (const lang of candidates) {
    const matched = matchLanguageTag(lang);
    if (matched) return matched;
  }

  return null;
}

export function resolveRequestLocale(options: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  const cookieNormalized = options.cookieLocale?.trim().toLowerCase();
  if (isSupportedLocale(cookieNormalized)) {
    return cookieNormalized;
  }

  const fromHeader = detectLocaleFromAcceptLanguage(options.acceptLanguage);
  if (fromHeader) {
    return fromHeader;
  }

  return DEFAULT_LOCALE;
}
