import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/katalog',
          '/lisanslar',
          '/hizmetler/',
          '/hakkimizda',
          '/iletisim',
          '/status',
          '/yasal/',
          '/.well-known/security.txt',
          '/favicon.ico',
          '/icon-48.png',
          '/icon-96.png',
          '/icon-192.png',
          '/icon-512.png',
          '/apple-touch-icon.png',
          '/manifest.webmanifest',
        ],
        disallow: ['/api/', '/admin', '/dashboard', '/auth/', '/login', '/register'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'Bytespider', 'ClaudeBot', 'anthropic-ai', 'Scrapy'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
