import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/katalog',
          '/discord',
          '/status',
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
  };
}
