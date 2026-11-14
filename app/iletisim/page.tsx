import type { Metadata } from 'next';
import ContactTerminalClient from '@/components/ContactTerminalClient';

export const metadata: Metadata = {
  title: 'İletişim & E-Posta Terminali | Restricted Studio',
  description:
    'Restricted Studio resmi e-posta iletişim hattı (info@restrictedstudio.shop) ve kurumsal İtemsatış destek terminali.',
  openGraph: {
    title: 'İletişim & E-Posta Terminali | Restricted Studio',
    description:
      'Restricted Studio resmi e-posta iletişim hattı (info@restrictedstudio.shop) ve kurumsal İtemsatış destek terminali.',
  },
};

export default function IletisimPage() {
  return <ContactTerminalClient />;
}
