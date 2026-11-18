import { getCompactCatalogJson } from '@/lib/catalog-server';

export const revalidate = 3600;

export function GET() {
  return new Response(getCompactCatalogJson(), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
