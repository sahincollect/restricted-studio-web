import type { Metadata } from 'next';
import StatusBoard from '@/components/StatusBoard';

export const metadata: Metadata = {
  title: 'Sistem Durumu',
  description:
    'Restricted Studio altyapısı, kimlik doğrulama, Google OAuth, veritabanı ve katalog servislerinin canlı çalışma durumu.',
  openGraph: {
    title: 'Sistem Durumu | Restricted Studio',
    description: 'Canlı altyapı çalışma durumu ve servis gecikme ölçümleri.',
  },
};

export default function StatusPage() {
  return <StatusBoard />;
}
