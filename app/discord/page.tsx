import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import DiscordClient from '@/components/DiscordClient';
import { LOCALE_COOKIE_NAME, resolveRequestLocale } from '@/lib/i18n';
import { TRANSLATIONS } from '@/lib/translations';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  });
  const m = TRANSLATIONS[locale].meta;
  return {
    title: m.discordTitle,
    description: m.discordDescription,
  };
}

export default function DiscordPage() {
  return <DiscordClient />;
}
