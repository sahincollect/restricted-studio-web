import type { Metadata } from 'next';
import GtaViSpecialClient from '@/components/GtaViSpecialClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'GTA VI Özel Seri — Yakında Özel Seri GTA 6 Temalı FiveM İçerikleri',
  description:
    'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz. Leonida & Vice City atmosferli açık kaynak MLO, HUD ve script koleksiyonu.',
  alternates: {
    canonical: canonicalUrl('/GTAVI'),
  },
  openGraph: {
    title: 'GTA VI Özel Seri — Restricted Studio',
    description:
      'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    url: canonicalUrl('/GTAVI'),
  },
};

export default function GtaViPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        url: canonicalUrl('/GTAVI'),
        name: 'GTA VI Özel Seri — Restricted Studio',
        description:
          'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'GTA VI', item: canonicalUrl('/GTAVI') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <GtaViSpecialClient />
    </>
  );
}
