import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';

export const metadata: Metadata = {
  title: 'Web Sitesi Kurulum Hizmeti',
  description:
    'FiveM/RedM sunucu portalları, dijital mağazalar ve kurumsal web siteleri için sıfırdan özel tasarım ve kurulum hizmeti.',
};

export default function WebKurulumPage() {
  return <ServiceRequestPageClient serviceType="web-kurulum" />;
}
