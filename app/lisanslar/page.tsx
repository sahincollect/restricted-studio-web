import type { Metadata } from 'next';
import { fetchItemsatisListings } from '@/lib/itemsatis-store';
import { mergeStoreProducts, readStorePriceOverrides } from '@/lib/store-pricing';
import StoreLicensesClient, { type PublicStoreProduct } from '@/components/StoreLicensesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dijital Lisanslar & Özel İlanlar | Restricted Studio',
  description:
    'ChatGPT Plus, Gemini Pro, Canva, CapCut Pro, Office/Windows lisansları ve Restricted Studio resmi İtemsatış vitrinindeki tüm aktif ilanlar.',
  openGraph: {
    title: 'Dijital Lisanslar & Özel İlanlar | Restricted Studio',
    description:
      'ChatGPT Plus, Gemini Pro, Canva, CapCut Pro, Office/Windows lisansları ve Restricted Studio resmi İtemsatış vitrinindeki tüm aktif ilanlar.',
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

  return (
    <StoreLicensesClient
      initialItems={publicItems}
      syncedAt={feed.syncedAt}
      feedSource={feed.source}
    />
  );
}
