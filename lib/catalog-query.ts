import type { CATALOG_CATEGORY_KEYS } from './translations';

export type CatalogCategoryKey = (typeof CATALOG_CATEGORY_KEYS)[number];

const CATEGORY_ALIAS_MAP: Record<string, CatalogCategoryKey> = {
  all: 'Tümü',
  tumu: 'Tümü',
  'tümü': 'Tümü',
  script: 'Script & Sistemler',
  scripts: 'Script & Sistemler',
  sistem: 'Script & Sistemler',
  sistemler: 'Script & Sistemler',
  'script & sistemler': 'Script & Sistemler',
  mlo: 'MLO & Mekanlar',
  maps: 'MLO & Mekanlar',
  mekan: 'MLO & Mekanlar',
  mekanlar: 'MLO & Mekanlar',
  'mlo & mekanlar': 'MLO & Mekanlar',
  vehicle: 'Araç Paketleri',
  vehicles: 'Araç Paketleri',
  car: 'Araç Paketleri',
  cars: 'Araç Paketleri',
  arac: 'Araç Paketleri',
  'araç': 'Araç Paketleri',
  'araç paketleri': 'Araç Paketleri',
  eup: 'Kıyafet & EUP',
  clothing: 'Kıyafet & EUP',
  kiyafet: 'Kıyafet & EUP',
  'kıyafet': 'Kıyafet & EUP',
  'kıyafet & eup': 'Kıyafet & EUP',
  mod: 'Modlar & Eklentiler',
  mods: 'Modlar & Eklentiler',
  modlar: 'Modlar & Eklentiler',
  'modlar & eklentiler': 'Modlar & Eklentiler',
  tool: 'Program & Araçlar',
  tools: 'Program & Araçlar',
  program: 'Program & Araçlar',
  'program & araçlar': 'Program & Araçlar',
};

/**
 * Resolves a `?category=` query parameter (ASCII slug or localized Turkish key)
 * to a canonical catalog category key, returning null when unrecognized.
 */
export function resolveCatalogCategoryParam(
  raw: string | null | undefined
): CatalogCategoryKey | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const asciiLower = trimmed.toLowerCase();
  if (asciiLower in CATEGORY_ALIAS_MAP) {
    return CATEGORY_ALIAS_MAP[asciiLower];
  }

  const trLower = trimmed.toLocaleLowerCase('tr-TR');
  if (trLower in CATEGORY_ALIAS_MAP) {
    return CATEGORY_ALIAS_MAP[trLower];
  }

  return null;
}
