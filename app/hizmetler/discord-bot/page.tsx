import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';
import { canonicalUrl } from '@/lib/site-config';

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
  return <ServiceRequestPageClient serviceType="discord-bot" />;
}
