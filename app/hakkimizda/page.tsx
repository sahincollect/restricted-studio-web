import type { Metadata } from 'next';
import AboutStudioClient from '@/components/AboutStudioClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Hakkımızda — Stüdyo & Mühendislik Dosyası',
  description:
    'Restricted Studio standartları, sıfır şifreleme politikası, 6.446+ doğrulanmış FiveM arşivi ve İtemsatış 3D Secure güvencesi.',
  alternates: {
    canonical: canonicalUrl('/hakkimizda'),
  },
  openGraph: {
    title: 'Hakkımızda — Restricted Studio',
    description:
      'Sıfır escrow, tam açık kaynak kod teslimatı ve sabit 100 TL fiyatlandırma yaklaşımı ile FiveM altyapı stüdyosu.',
    url: canonicalUrl('/hakkimizda'),
  },
};

export default function HakkimizdaPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        url: canonicalUrl('/hakkimizda'),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Hakkımızda', item: canonicalUrl('/hakkimizda') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <AboutStudioClient />
    </>
  );
}
