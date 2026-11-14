import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import WinterSnow from '@/components/WinterSnow';
import CursorSpotlight from '@/components/CursorSpotlight';
import ConsoleEasterEgg from '@/components/ConsoleEasterEgg';
import { I18nProvider } from '@/components/I18nProvider';
import {
  LOCALE_COOKIE_NAME,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  resolveRequestLocale,
} from '@/lib/i18n';
import { TRANSLATIONS } from '@/lib/translations';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.restrictedstudio.shop').replace(
  /\/+$/,
  ''
);

const OG_LOCALE_MAP = {
  tr: 'tr_TR',
  en: 'en_US',
  ru: 'ru_RU',
  fr: 'fr_FR',
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  });
  const m = TRANSLATIONS[locale].meta;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: m.siteTitle,
      template: '%s | Restricted Studio',
    },
    description: m.siteDescription,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
        { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale],
      url: siteUrl,
      siteName: 'Restricted Studio',
      title: m.siteTitle,
      description: m.ogDescription,
      images: [
        {
          url: '/icon-512.png',
          width: 512,
          height: 512,
          alt: 'Restricted Studio',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: m.siteTitle,
      description: m.twitterDescription,
      images: ['/icon-512.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Forces per-request dynamic rendering so Next.js 15 propagates the middleware CSP nonce onto hydration scripts.
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const nonce = requestHeaders.get('x-nonce') || undefined;
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const acceptLanguage = requestHeaders.get('accept-language');
  const locale = resolveRequestLocale({ cookieLocale, acceptLanguage });
  const initialDetectedFromHeader = Boolean(
    isSupportedLocale(cookieLocale) || detectLocaleFromAcceptLanguage(acceptLanguage)
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Restricted Studio',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
        },
        image: `${siteUrl}/icon-512.png`,
        sameAs: ['https://www.itemsatis.com/p/saintstudio'],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Restricted Studio',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale} data-csp-nonce={nonce ? 'active' : 'off'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Roboto+Condensed:wght@700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="noir-root-body">
        {/* Global SVG Halftone / Analog Film-Grain Filter & Stipple Patterns */}
        <svg
          aria-hidden="true"
          style={{
            position: 'fixed',
            width: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <filter id="rsFilmGrain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.82"
                numOctaves="3"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 18 -7"
                in="noise"
                result="highContrastNoise"
              />
              <feComposite in="SourceGraphic" in2="highContrastNoise" operator="in" />
            </filter>
          </defs>
        </svg>
        <WinterSnow />
        <CursorSpotlight />
        <I18nProvider
          initialLocale={locale}
          initialDetectedFromHeader={initialDetectedFromHeader}
        >
          <ConsoleEasterEgg />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
