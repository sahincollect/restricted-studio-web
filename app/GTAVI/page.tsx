import type { Metadata } from 'next';
import GtaViSpecialClient from '@/components/GtaViSpecialClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

const GTAVI_RENTAL_URL =
  'https://www.itemsatis.com/gta-6/gta-vi-ultimate-edition-playstation-48-saat-6103139.html';

export const metadata: Metadata = {
  title: 'GTA VI Ultimate Edition PlayStation | 48 Saat — 499 TL',
  description:
    'GTA VI 499 TL — GTA VI Ultimate Edition PlayStation 48 saat kiralama. Orijinal lisanslı PS5 çevrimdışı erişim, 48 saat teknik erişim garantisi, İtemsatış #6103139 güvencesiyle teslimat ve yakında özel seri GTA 6 FiveM içerikleri.',
  keywords: [
    'GTA VI 499 TL',
    'GTA VI 499 lira',
    'GTA 6 499 TL',
    'GTA VI Ultimate Edition PlayStation',
    'GTA VI 48 saat kiralama',
    'GTA 6 PlayStation hesap kiralama',
    'GTA VI PS5',
    'GTA 6 FiveM',
    'Restricted Studio',
  ],
  alternates: {
    canonical: canonicalUrl('/GTAVI'),
  },
  openGraph: {
    type: 'website',
    title: 'GTA VI Ultimate Edition PlayStation | 48 Saat — 499 TL | Restricted Studio',
    description:
      'GTA VI 499 TL: Orijinal lisanslı Grand Theft Auto VI (Ultimate Edition) PlayStation 48 saat kiralama ve özel seri GTA 6 temalı FiveM içerikleri.',
    url: canonicalUrl('/GTAVI'),
    images: [
      {
        url: '/assets/gtavi-ps-banner.jpg',
        width: 1408,
        height: 768,
        alt: 'GTA VI Ultimate Edition PlayStation | 48 Saat — 499 TL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA VI Ultimate Edition PlayStation | 48 Saat — 499 TL',
    description:
      'GTA VI 499 TL: PlayStation 48 saat dijital erişim kiralama (#6103139) ve özel seri GTA 6 temalı FiveM içerikleri.',
    images: ['/assets/gtavi-ps-banner.jpg'],
  },
};

export default function GtaViPage() {
  const pageUrl = canonicalUrl('/GTAVI');
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${pageUrl}#product`,
        name: 'GTA VI Ultimate Edition PlayStation | 48 Saat',
        alternateName: 'GTA VI 499 TL PlayStation 48 Saat Kiralama',
        sku: 'RS-GTAVI-PS-48H',
        mpn: '6103139',
        category: 'Video Games > PlayStation > Digital Rental',
        image: [
          canonicalUrl('/assets/gtavi-ps-banner.jpg'),
          canonicalUrl('/assets/vice-backdrop.jpg'),
        ],
        description:
          'Orijinal lisanslı Grand Theft Auto VI (Ultimate Edition) PlayStation hesabı yalnızca 48 saat süreyle çevrimdışı (offline) kiralama kapsamında 499 TL fiyatla sunulur. İtemsatış ilan no: #6103139.',
        brand: {
          '@type': 'Brand',
          name: 'Restricted Studio',
        },
        offers: {
          '@type': 'Offer',
          url: GTAVI_RENTAL_URL,
          priceCurrency: 'TRY',
          price: '499.00',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Restricted Studio',
            url: SITE_URL,
          },
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'GTA VI Ultimate Edition PlayStation | 48 Saat — 499 TL | Restricted Studio',
        description:
          'GTA VI 499 TL PlayStation 48 saat kiralama ve yakında özel seri GTA 6 temalı FiveM içerikleri.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${pageUrl}#product` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'GTA VI Ultimate Edition PlayStation | 48 Saat',
            item: pageUrl,
          },
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
