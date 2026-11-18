import type { Metadata } from 'next';
import ServiceRequestPageClient from '@/components/ServiceRequestPageClient';
import { canonicalUrl } from '@/lib/site-config';

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
  return <ServiceRequestPageClient serviceType="web-kurulum" />;
}
