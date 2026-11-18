import type { Metadata } from 'next';
import ContactTerminalClient from '@/components/ContactTerminalClient';
import { canonicalUrl } from '@/lib/site-config';

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
  return <ContactTerminalClient />;
}
