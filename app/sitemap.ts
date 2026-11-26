import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';
import { LEGAL_DOC_ORDER } from '@/lib/legal-docs';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const coreEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/katalog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/lisanslar`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hizmetler/web-kurulum`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/hizmetler/discord-bot`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/GTAVI`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
      images: [
        `${SITE_URL}/assets/gtavi-ps-banner.jpg`,
        `${SITE_URL}/assets/vice-backdrop.jpg`,
      ],
    },
    {
      url: `${SITE_URL}/hakkimizda`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/status`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/iletisim`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const legalEntries: MetadataRoute.Sitemap = LEGAL_DOC_ORDER.map((slug) => ({
    url: `${SITE_URL}/yasal/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.4,
  }));

  return [...coreEntries, ...legalEntries];
}
