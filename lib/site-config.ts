const rawSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.restrictedstudio.shop'
)
  .trim()
  .replace(/\/+$/, '');

// Normalize bare apex domain to www so sitemap, canonical tags, and JSON-LD match the live non-redirecting host.
export const SITE_URL =
  rawSiteUrl === 'https://restrictedstudio.shop'
    ? 'https://www.restrictedstudio.shop'
    : rawSiteUrl;

export function canonicalUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
