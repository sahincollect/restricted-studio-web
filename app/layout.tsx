import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import WinterSnow from '@/components/WinterSnow';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://restrictedstudio.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
    template: '%s | Restricted Studio',
  },
  description:
    'Restricted Studio; FiveM sunucuları için yüksek performanslı açık kaynak scriptler, 3D MLO mekanlar, optimize SQL veri mimarisi ve hazır altyapı çözümleri sunan profesyonel yazılım stüdyosudur.',
  icons: {
    icon: '/assets/rslogo.jpg',
    apple: '/assets/rslogo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'Restricted Studio',
    title: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
    description:
      'Açık kaynak FiveM scriptler, optimize SQL mimarisi, 3D MLO haritalar ve lisans yönetimi.',
    images: [
      {
        url: '/assets/rslogo.jpg',
        width: 512,
        height: 512,
        alt: 'Restricted Studio',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
    description:
      'FiveM sunucuları için yüksek performanslı açık kaynak scriptler ve optimize altyapı çözümleri.',
    images: ['/assets/rslogo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Forces per-request dynamic rendering so Next.js 15 propagates the middleware CSP nonce onto hydration scripts.
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce') || undefined;

  return (
    <html lang="tr" data-csp-nonce={nonce ? 'active' : 'off'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noir-root-body">
        {/* Global SVG Halftone / Analog Film-Grain Filter & Stipple Patterns */}
        <svg
          aria-hidden="true"
          style={{
            position: 'fixed',
            width: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <filter id="rsFilmGrain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.82"
                numOctaves="3"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 18 -7"
                in="noise"
                result="highContrastNoise"
              />
              <feComposite in="SourceGraphic" in2="highContrastNoise" operator="in" />
            </filter>
          </defs>
        </svg>
        <WinterSnow />
        {children}
      </body>
    </html>
  );
}
