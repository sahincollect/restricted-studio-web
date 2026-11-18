import type { Metadata } from 'next';
import AboutStudioClient from '@/components/AboutStudioClient';
import { canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Hakkımızda — Stüdyo & Mühendislik Dosyası',
  description:
    'Restricted Studio standartları, sıfır şifreleme politikası, 6.446+ doğrulanmış FiveM arşivi ve İtemsatış 3D Secure güvencesi.',
  alternates: {
    canonical: canonicalUrl('/hakkimizda'),
  },
  openGraph: {
    title: 'Hakkımızda — Restricted Studio',
    description:
      'Sıfır escrow, tam açık kaynak kod teslimatı ve sabit 100 TL fiyatlandırma yaklaşımı ile FiveM altyapı stüdyosu.',
    url: canonicalUrl('/hakkimizda'),
  },
};

export default function HakkimizdaPage() {
  return <AboutStudioClient />;
}
