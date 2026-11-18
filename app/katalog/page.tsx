import type { Metadata } from 'next';
import CatalogClient from '@/components/CatalogClient';
import JsonLd from '@/components/JsonLd';
import { getInitialCatalogSlice } from '@/lib/catalog-server';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'FiveM & RedM Katalog Arşivi',
  description:
    '6.446+ doğrulanmış açık kaynak FiveM/RedM script, MLO mekanlar, araç paketleri ve EUP koleksiyonları; sabit 100 TL ve 15+ alımda %50 indirim avantajıyla.',
  alternates: {
    canonical: canonicalUrl('/katalog'),
  },
  openGraph: {
    title: 'FiveM & RedM Katalog Arşivi | Restricted Studio',
    description:
      '6.446+ doğrulanmış açık kaynak FiveM/RedM script, MLO mekanlar, araç paketleri ve EUP koleksiyonları.',
    url: canonicalUrl('/katalog'),
  },
};

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; view?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : 'Tümü';
  const view = typeof params.view === 'string' ? params.view : 'all';

  const { initialItems, totalCount, categoryCounts } = getInitialCatalogSlice({
    q,
    category,
    view,
    limit: 64,
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl('/katalog')}#webpage`,
        url: canonicalUrl('/katalog'),
        name: 'FiveM & RedM Katalog Arşivi | Restricted Studio',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        numberOfItems: totalCount,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Katalog', item: canonicalUrl('/katalog') },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <CatalogClient
        initialItems={initialItems}
        totalCatalogCount={totalCount}
        initialCategoryCounts={categoryCounts}
        initialQuery={q}
        initialCategory={category}
        initialView={view}
      />
    </>
  );
}
