import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import StudioHomeClient from '@/components/StudioHomeClient';
import JsonLd from '@/components/JsonLd';
import { LOCALE_COOKIE_NAME, resolveRequestLocale } from '@/lib/i18n';
import { TRANSLATIONS } from '@/lib/translations';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/'),
  },
};

export default async function HomePage() {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  });
  const faqItems = TRANSLATIONS[locale].home.modals.faqItems;

  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Ana Sayfa',
            item: canonicalUrl('/'),
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: canonicalUrl('/'),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={homeStructuredData} />
      <StudioHomeClient />
    </>
  );
}
