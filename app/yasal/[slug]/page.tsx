import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import LegalDocumentClient from '@/components/LegalDocumentClient';
import JsonLd from '@/components/JsonLd';
import { LOCALE_COOKIE_NAME, resolveRequestLocale } from '@/lib/i18n';
import {
  LEGAL_DOC_ORDER,
  type LegalDocSlug,
} from '@/lib/legal-docs';
import { getLegalDocument } from '@/lib/legal-doc-content';
import { SITE_URL, canonicalUrl } from '@/lib/site-config';

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: LegalDocSlug }> {
  return LEGAL_DOC_ORDER.map((slug) => ({ slug }));
}

function isLegalSlug(val: string): val is LegalDocSlug {
  return (LEGAL_DOC_ORDER as readonly string[]).includes(val);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return {};

  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  });
  const doc = getLegalDocument(locale, slug);

  return {
    title: doc.title,
    description: doc.summary,
    alternates: {
      canonical: canonicalUrl(doc.href),
    },
    openGraph: {
      title: `${doc.title} | Restricted Studio`,
      description: doc.summary,
      url: canonicalUrl(doc.href),
    },
  };
}

export default async function LegalSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    notFound();
  }

  const doc = getLegalDocument('tr', slug);
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl(doc.href)}#webpage`,
        url: canonicalUrl(doc.href),
        name: `${doc.title} | Restricted Studio`,
        description: doc.summary,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: doc.navLabel, item: canonicalUrl(doc.href) },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <LegalDocumentClient slug={slug} />
    </>
  );
}
