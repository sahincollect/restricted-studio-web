import type { Metadata } from 'next';
import StudioHomeClient from '@/components/StudioHomeClient';
import { canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/'),
  },
};

export default function HomePage() {
  return <StudioHomeClient />;
}
