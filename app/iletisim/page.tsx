import type { Metadata } from 'next';
import ContactTerminalClient from '@/components/ContactTerminalClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'Restricted Studio kurumsal iletişim kanalları, toplu lisans talepleri ve teknik destek hattı (info@restrictedstudio.shop).',
  alternates: {
    canonical: canonicalUrl('/iletisim'),
  },
  openGraph: {
    title: 'İletişim | Restricted Studio',
    description:
      'Restricted Studio kurumsal iletişim kanalları, toplu lisans talepleri ve teknik destek hattı (info@restrictedstudio.shop).',
    url: canonicalUrl('/iletisim'),
  },
};

export default function IletisimPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        url: canonicalUrl('/iletisim'),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'İletişim', item: canonicalUrl('/iletisim') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ContactTerminalClient />
    </>
  );
}
