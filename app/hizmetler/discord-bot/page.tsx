import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';

export const metadata: Metadata = {
  title: 'Discord Bot Hizmetleri',
  description:
    'FiveM/RedM veritabanı köprülü whitelist, ticket, moderasyon guard ve ekonomi Discord botları için özel kurulum hizmeti.',
};

export default function DiscordBotPage() {
  return <ServiceRequestPageClient serviceType="discord-bot" />;
}
