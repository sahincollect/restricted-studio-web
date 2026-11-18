import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Discord Bot Hizmetleri',
  description:
    'FiveM/RedM veritabanı köprülü whitelist, ticket, moderasyon guard ve ekonomi Discord botları için özel kurulum hizmeti.',
  alternates: {
    canonical: canonicalUrl('/hizmetler/discord-bot'),
  },
  openGraph: {
    title: 'Discord Bot Hizmetleri | Restricted Studio',
    description:
      'FiveM/RedM veritabanı köprülü whitelist, ticket, moderasyon guard ve ekonomi Discord botları için özel kurulum hizmeti.',
    url: canonicalUrl('/hizmetler/discord-bot'),
  },
};

export default function DiscordBotPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Discord Bot Hizmetleri',
        serviceType: 'Custom Discord Bot & FiveM SQL Integration',
        provider: { '@id': `${SITE_URL}/#organization` },
        url: canonicalUrl('/hizmetler/discord-bot'),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Discord Bot Hizmetleri', item: canonicalUrl('/hizmetler/discord-bot') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ServiceRequestPageClient serviceType="discord-bot" />
    </>
  );
}
