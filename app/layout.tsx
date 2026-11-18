import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import './globals.css';
import CursorSpotlight from '@/components/CursorSpotlight';
import BearClawIntro from '@/components/BearClawIntro';
import { I18nProvider } from '@/components/I18nProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  LOCALE_COOKIE_NAME,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  resolveRequestLocale,
} from '@/lib/i18n';
import { TRANSLATIONS } from '@/lib/translations';
import { SITE_URL } from '@/lib/site-config';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const ICON_VERSION = '20261118';

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
    metadataBase: new URL(SITE_URL),
    title: {
      default: m.siteTitle,
      template: '%s | Restricted Studio',
    },
    description: m.siteDescription,
    icons: {
      icon: [
        { url: `/favicon.ico?v=${ICON_VERSION}`, sizes: 'any' },
        { url: `/icon-48.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '48x48' },
        { url: `/icon-96.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '96x96' },
        { url: `/icon-192.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '192x192' },
        { url: `/icon-512.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '512x512' },
      ],
      shortcut: `/favicon.ico?v=${ICON_VERSION}`,
      apple: [{ url: `/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: '180x180', type: 'image/png' }],
    },
    manifest: `/manifest.webmanifest?v=${ICON_VERSION}`,
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale],
      url: SITE_URL,
      siteName: 'Restricted Studio',
      title: m.siteTitle,
      description: m.ogDescription,
      images: [
        {
          url: `/icon-512.png?v=${ICON_VERSION}`,
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
      images: [`/icon-512.png?v=${ICON_VERSION}`],
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
        '@id': `${SITE_URL}/#organization`,
        name: 'Restricted Studio',
        url: SITE_URL,
        email: 'info@restrictedstudio.shop',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon-512.png?v=${ICON_VERSION}`,
          width: 512,
          height: 512,
        },
        image: `${SITE_URL}/icon-512.png?v=${ICON_VERSION}`,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'info@restrictedstudio.shop',
            url: `${SITE_URL}/iletisim`,
            availableLanguage: ['Turkish', 'English', 'Russian', 'French'],
          },
        ],
        sameAs: ['https://www.itemsatis.com/p/saintstudio'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Restricted Studio',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/katalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      data-csp-nonce={nonce ? 'active' : 'off'}
    >
      <head>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="studio-root-body">
        <BearClawIntro />
        <CursorSpotlight />
        <I18nProvider
          initialLocale={locale}
          initialDetectedFromHeader={initialDetectedFromHeader}
        >
          {children}
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
