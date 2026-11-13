import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
  description:
    'Restricted Studio; FiveM sunucuları için yüksek performanslı açık kaynak scriptler, 3D MLO mekanlar, optimize SQL veri mimarisi ve hazır altyapı çözümleri sunan profesyonel yazılım stüdyosudur.',
  icons: {
    icon: '/assets/rslogo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
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
        {children}
      </body>
    </html>
  );
}
