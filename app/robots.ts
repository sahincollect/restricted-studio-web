import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/katalog', '/discord', '/status'],
        disallow: ['/api/', '/admin', '/dashboard', '/auth/', '/login', '/register'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'Bytespider', 'ClaudeBot', 'anthropic-ai', 'Scrapy'],
        disallow: '/',
      },
    ],
  };
}
