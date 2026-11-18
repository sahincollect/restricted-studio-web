import type { Metadata } from 'next';
import { fetchItemsatisListings } from '@/lib/itemsatis-store';
import { mergeStoreProducts, readStorePriceOverrides } from '@/lib/store-pricing';
import StoreLicensesClient, { type PublicStoreProduct } from '@/components/StoreLicensesClient';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dijital Lisanslar & Özel İlanlar',
  description:
    'ChatGPT Plus, Gemini Pro, Canva, CapCut Pro, Office/Windows lisansları ve Restricted Studio resmi İtemsatış vitrinindeki tüm aktif ilanlar.',
  alternates: {
    canonical: canonicalUrl('/lisanslar'),
  },
  openGraph: {
    title: 'Dijital Lisanslar & Özel İlanlar | Restricted Studio',
    description:
      'ChatGPT Plus, Gemini Pro, Canva, CapCut Pro, Office/Windows lisansları ve Restricted Studio resmi İtemsatış vitrinindeki tüm aktif ilanlar.',
    url: canonicalUrl('/lisanslar'),
  },
};

export default async function LisanslarPage() {
  const [feed, pricing] = await Promise.all([
    fetchItemsatisListings(),
    readStorePriceOverrides(),
  ]);

  const publicItems: PublicStoreProduct[] = mergeStoreProducts(feed.items, pricing.overrides)
    .filter((item) => !item.hidden)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      categoryName: item.categoryName,
      typeName: item.typeName,
      group: item.group,
      price: item.price,
      comparePrice: item.comparePrice,
      imageUrl: item.imageUrl,
      itemsatisUrl: item.itemsatisUrl,
      pinned: item.pinned,
      featured: item.featured,
    }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl('/lisanslar')}#webpage`,
        url: canonicalUrl('/lisanslar'),
        name: 'Dijital Lisanslar & Özel İlanlar | Restricted Studio',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        numberOfItems: publicItems.length,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Katalog', item: canonicalUrl('/katalog') },
          { '@type': 'ListItem', position: 3, name: 'Lisanslar', item: canonicalUrl('/lisanslar') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <StoreLicensesClient
        initialItems={publicItems}
        syncedAt={feed.syncedAt}
        feedSource={feed.source}
      />
    </>
  );
}
