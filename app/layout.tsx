import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
  description: 'Restricted Studio; FiveM sunucuları için yüksek performanslı açık kaynak scriptler, 3D MLO mekanlar, optimize SQL veri mimarisi ve hazır altyapı çözümleri sunan profesyonel yazılım stüdyosudur.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
