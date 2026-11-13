import type { Metadata } from 'next';
import './globals.css';
import WinterSnow from '@/components/WinterSnow';
import ChristmasTree from '@/components/ChristmasTree';
import BackgroundMusic from '@/components/BackgroundMusic';

export const metadata: Metadata = {
  title: 'Restricted Studio — FiveM & AI Yazılım Ekosistemi',
  description: 'Restricted Studio; FiveM ekosistemi ve R-AI yapay zeka masaüstü çalışma istasyonu geliştiren yazılım stüdyosudur.',
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
        <WinterSnow />
        <ChristmasTree />
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
