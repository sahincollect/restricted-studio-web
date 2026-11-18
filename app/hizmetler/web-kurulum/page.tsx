import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Web Sitesi Kurulum Hizmeti',
  description:
    'FiveM/RedM sunucu portalları, dijital mağazalar ve kurumsal web siteleri için sıfırdan özel tasarım ve kurulum hizmeti.',
  alternates: {
    canonical: canonicalUrl('/hizmetler/web-kurulum'),
  },
  openGraph: {
    title: 'Web Sitesi Kurulum Hizmeti | Restricted Studio',
    description:
      'FiveM/RedM sunucu portalları, dijital mağazalar ve kurumsal web siteleri için sıfırdan özel tasarım ve kurulum hizmeti.',
    url: canonicalUrl('/hizmetler/web-kurulum'),
  },
};

export default function WebKurulumPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Web Sitesi Kurulum Hizmeti',
        serviceType: 'Web Design and Full-Stack Setup',
        provider: { '@id': `${SITE_URL}/#organization` },
        url: canonicalUrl('/hizmetler/web-kurulum'),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Web Sitesi Kurulum Hizmeti', item: canonicalUrl('/hizmetler/web-kurulum') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ServiceRequestPageClient serviceType="web-kurulum" />
    </>
  );
}
