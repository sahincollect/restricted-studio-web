import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import StatusBoard from '@/components/StatusBoard';
import { LOCALE_COOKIE_NAME, resolveRequestLocale } from '@/lib/i18n';
import { TRANSLATIONS } from '@/lib/translations';
import { canonicalUrl } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  });
  const m = TRANSLATIONS[locale].meta;
  return {
    title: m.statusTitle,
    description: m.statusDescription,
    alternates: {
      canonical: canonicalUrl('/status'),
    },
    openGraph: {
      title: `${m.statusTitle} | Restricted Studio`,
      description: m.statusDescription,
      url: canonicalUrl('/status'),
    },
  };
}

export default function StatusPage() {
  return <StatusBoard />;
}
