import type { Metadata } from 'next';
import ContactTerminalClient from '@/components/ContactTerminalClient';

export const metadata: Metadata = {
  title: 'İletişim | Restricted Studio',
  description:
    'Restricted Studio kurumsal iletişim kanalları, toplu lisans talepleri ve teknik destek hattı (info@restrictedstudio.shop).',
  openGraph: {
    title: 'İletişim | Restricted Studio',
    description:
      'Restricted Studio kurumsal iletişim kanalları, toplu lisans talepleri ve teknik destek hattı (info@restrictedstudio.shop).',
  },
};

export default function IletisimPage() {
  return <ContactTerminalClient />;
}
