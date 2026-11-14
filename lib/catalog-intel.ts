import type { Locale } from './i18n';

export type CatalogSystemKey =
  | 'phone'
  | 'vehicle'
  | 'police'
  | 'heist'
  | 'nightlife'
  | 'mlo'
  | 'clothing'
  | 'security'
  | 'script';

export interface CatalogItemIntel {
  studio: string | null;
  systemKey: CatalogSystemKey;
  roleLabel: string;
  summary: string;
  frameworks: string[];
  versionTag: string | null;
}

const STUDIO_RULES: Array<{ name: string; pattern: RegExp }> = [
  { name: 'Restricted Studio', pattern: /\brestricted\s*studio\b/i },
  { name: 'Fiv3Devs', pattern: /\bfiv3devs?\b/i },
  { name: 'Gabz', pattern: /\bgabz\b/i },
  { name: 'K4MB1', pattern: /\bk4mb1\b/i },
  { name: 'LB', pattern: /\blb\b/i },
  { name: 'JG', pattern: /\bjg\b/i },
  { name: 'Okok', pattern: /\bokok\b/i },
  { name: 'Quasar', pattern: /\bquasar\b|\bqs\b/i },
  { name: '0Resmon', pattern: /\b0resmon\b|\b0r\b/i },
  { name: 'Oxlyn', pattern: /\boxlyn\b/i },
  { name: 'Codem', pattern: /\bcodem\b/i },
  { name: 'Rcore', pattern: /\brcore\b/i },
  { name: 'Pscripts', pattern: /\bpscripts?\b/i },
  { name: 'TStudio', pattern: /\btstudio\b/i },
  { name: 'Molo', pattern: /\bmolo\b/i },
  { name: 'RTX', pattern: /\brtx\b/i },
  { name: 'Diables', pattern: /\bdiables\b/i },
  { name: 'Illenium', pattern: /\billenium\b/i },
  { name: 'Waveshield', pattern: /\bwaveshield\b/i },
  { name: 'Onx', pattern: /\bonx\b/i },
  { name: '17mov', pattern: /\b17mov\b/i },
  { name: 'Envi', pattern: /\benvi\b/i },
  { name: 'UM', pattern: /\bum\b/i },
  { name: 'Brunx', pattern: /\bbrunx\b/i },
  { name: 'Kiiya', pattern: /\bkiiya\b/i },
  { name: 'Prodigy', pattern: /\bprodigy\b/i },
  { name: 'Soloty', pattern: /\bsoloty\b/i },
  { name: 'Whiteboyz', pattern: /\bwhiteboyz\w*\b/i },
  { name: 'Ikx3', pattern: /\bikx3\b/i },
  { name: 'Patamods', pattern: /\bpatamods\b/i },
  { name: 'MXC', pattern: /\bmxc\b/i },
  { name: 'Mickystudio', pattern: /\bmickystudio\b|\bmicky\b/i },
  { name: 'Ziaders', pattern: /\bziaders\b/i },
  { name: 'JulyGee', pattern: /\bjulygee\b/i },
  { name: 'BMW', pattern: /\bbmw\b/i },
  { name: 'Mercedes', pattern: /\bmercedes\b|\bamg\b|\bbrabus\b/i },
  { name: 'Audi', pattern: /\baudi\b/i },
  { name: 'Porsche', pattern: /\bporsche\b/i },
  { name: 'Ferrari', pattern: /\bferrari\b/i },
  { name: 'Toyota', pattern: /\btoyota\b/i },
  { name: 'Ford', pattern: /\bford\b/i },
  { name: 'Lamborghini', pattern: /\blambo(?:rghini)?\b/i },
];

type RoleRule = {
  id: string;
  systemKey: CatalogSystemKey;
  pattern: RegExp;
  labels: Record<Locale, string>;
  summaries: Record<Locale, string>;
};

const ROLE_RULES: RoleRule[] = [
  {
    id: 'phone',
    systemKey: 'phone',
    pattern: /\b(phone|smartphone|mphone|tablet)\b/i,
    labels: {
      tr: 'Telefon & Tablet',
      en: 'Phone & Tablet',
      ru: 'Телефон и планшет',
      fr: 'Téléphone & Tablette',
    },
    summaries: {
      tr: 'Oyun içi akıllı telefon, iletişim ve uygulama arayüzü paketi.',
      en: 'In-game smartphone, messaging, and interactive app script.',
      ru: 'Внутриигровой смартфон, связь и пакет приложений.',
      fr: 'Système de smartphone en jeu, messagerie et applications.',
    },
  },
  {
    id: 'multichar',
    systemKey: 'script',
    pattern: /\b(multichar\w*|appearance|spawn|identity)\b/i,
    labels: {
      tr: 'Karakter & Giriş',
      en: 'Character & Spawn',
      ru: 'Персонаж и спавн',
      fr: 'Personnage & Spawn',
    },
    summaries: {
      tr: 'Çoklu karakter seçimi, görünüm ve giriş ekranı sistemi.',
      en: 'Multi-character selection, appearance, and spawn UI package.',
      ru: 'Выбор персонажа, внешности и экрана входа на сервер.',
      fr: 'Sélection multi-personnages, apparence et interface de spawn.',
    },
  },
  {
    id: 'inventory',
    systemKey: 'script',
    pattern: /\b(inventory|backpack|stash)\b/i,
    labels: {
      tr: 'Envanter & Eşya',
      en: 'Inventory & Storage',
      ru: 'Инвентарь и хранение',
      fr: 'Inventaire & Stockage',
    },
    summaries: {
      tr: 'Eşya yönetimi, sandık, ağırlık ve slot arayüzü sistemi.',
      en: 'Item management, stash containers, and slot UI system.',
      ru: 'Управление предметами, слотами и контейнерами.',
      fr: 'Gestion d’objets, coffres et interface d’inventaire.',
    },
  },
  {
    id: 'hud',
    systemKey: 'script',
    pattern: /\b(hud|loading|menu|notify|radial)\b/i,
    labels: {
      tr: 'HUD & Arayüz',
      en: 'HUD & UI System',
      ru: 'HUD и интерфейс',
      fr: 'HUD & Interface',
    },
    summaries: {
      tr: 'Oyuncu durumu, bildirim, menü veya yükleme ekranı arayüzü.',
      en: 'Player status HUD, notifications, menu, or loading UI.',
      ru: 'Интерфейс статуса игрока, меню, уведомлений и загрузки.',
      fr: 'Interface joueur HUD, notifications, menus ou écran de chargement.',
    },
  },
  {
    id: 'banking',
    systemKey: 'script',
    pattern: /\b(bank|banking|billing|atm|crypto|economy)\b/i,
    labels: {
      tr: 'Banka & Ekonomi',
      en: 'Banking & Finance',
      ru: 'Банк и экономика',
      fr: 'Banque & Économie',
    },
    summaries: {
      tr: 'Oyun içi bankacılık, IBAN transfer, fatura ve hesap yönetimi.',
      en: 'In-game banking, account transfers, billing, and finance logic.',
      ru: 'Банковские переводы, счета, ATM и финансовая система.',
      fr: 'Système bancaire en jeu, virements, factures et comptes.',
    },
  },
  {
    id: 'police',
    systemKey: 'police',
    pattern: /\b(police|lspd|bcso|sahp|mrpd|mdt|cad|dispatch|ems|hospital|pillbox|medic|ambulance|prison|jail|doj)\b/i,
    labels: {
      tr: 'Polis / EMS / MDT',
      en: 'Police / EMS / MDT',
      ru: 'Полиция / EMS / MDT',
      fr: 'Police / EMS / MDT',
    },
    summaries: {
      tr: 'Kolluk kuvvetleri, hastane veya acil müdahale dispatch/harita paketi.',
      en: 'Law enforcement, medical, MDT dispatch, or facility resource.',
      ru: 'Пакет для полиции, скорой помощи, MDT и госструктур.',
      fr: 'Ressource pour forces de l’ordre, EMS, MDT ou hôpital.',
    },
  },
  {
    id: 'heist',
    systemKey: 'heist',
    pattern: /\b(heist|robbery|fleeca|pacific|vault|drug|weed|cocaine|meth|gang|mafia|cartel|vagos|ballas|weapon|gun)\b/i,
    labels: {
      tr: 'Soygun & İllegal',
      en: 'Heist & Illegal',
      ru: 'Ограбления и криминал',
      fr: 'Braquage & Illégal',
    },
    summaries: {
      tr: 'Soygun senaryosu, kasa kırma, çete veya silah sistemi paketi.',
      en: 'Robbery progression, gang activity, or weapon gameplay system.',
      ru: 'Ограбления, криминальные сценарии, банды и оружие.',
      fr: 'Scénario de braquage, activité de gang ou pack d’armes.',
    },
  },
  {
    id: 'garage',
    systemKey: 'vehicle',
    pattern: /\b(garage|mechanic|lsc|dealership|tuning|handling|carplay|racing|drift)\b/i,
    labels: {
      tr: 'Garaj & Mekanik',
      en: 'Garage & Mechanic',
      ru: 'Гараж и тюнинг',
      fr: 'Garage & Mécanique',
    },
    summaries: {
      tr: 'Araç garajı, galeri, mekanik tamir veya handling yönetim sistemi.',
      en: 'Vehicle storage, dealership, mechanic tuning, or handling control.',
      ru: 'Гаражи, автосалоны, механики и настройка поведения авто.',
      fr: 'Gestion de garage, concessionnaire, atelier ou physique véhicule.',
    },
  },
  {
    id: 'nightlife',
    systemKey: 'nightlife',
    pattern: /\b(club|nightclub|bar|tequi|casino|diamond|lounge|cafe|restaurant|burger|pizza|coffee|arcade|park|cinema)\b/i,
    labels: {
      tr: 'Mekan & İşletme',
      en: 'Venue & Business',
      ru: 'Заведения и бизнес',
      fr: 'Lieu & Commerce',
    },
    summaries: {
      tr: 'Sosyal mekan, gece kulübü, kafe, restoran veya eğlence işletmesi.',
      en: 'Social venue, nightclub, restaurant, casino, or player business.',
      ru: 'Клубы, рестораны, казино и интерактивные заведения.',
      fr: 'Lieu social, boîte de nuit, restaurant, casino ou commerce.',
    },
  },
  {
    id: 'housing',
    systemKey: 'mlo',
    pattern: /\b(housing|mansion|villa|house|motel|apartment|shell|hotel|gym|office|church|roxwood|paleto|sandy)\b/i,
    labels: {
      tr: 'Konut & Harita',
      en: 'Housing & Map',
      ru: 'Жильё и карты',
      fr: 'Logement & Map',
    },
    summaries: {
      tr: 'Ev, malikane, motel, shell veya özel bölge harita/iç mekan paketi.',
      en: 'Housing, mansion, motel, interior shell, or custom map zone.',
      ru: 'Дома, особняки, отели, интерьеры shell или карты регионов.',
      fr: 'Logements, villas, motels, shells ou zones de carte.',
    },
  },
  {
    id: 'security',
    systemKey: 'security',
    pattern: /\b(shield|anticheat|anti\s*cheat|dumper|decrypt|fixer|admin)\b/i,
    labels: {
      tr: 'Güvenlik & Araçlar',
      en: 'Security & Utility',
      ru: 'Защита и утилиты',
      fr: 'Sécurité & Outils',
    },
    summaries: {
      tr: 'Sunucu koruması, anti-cheat, yetkili paneli veya geliştirici aracı.',
      en: 'Server protection, anti-cheat guard, admin, or developer utility.',
      ru: 'Защита сервера, античит, админ-панель и инструменты разработки.',
      fr: 'Protection serveur, anti-triche, admin ou utilitaire développeur.',
    },
  },
];

const CATEGORY_DEFAULTS: Record<
  string,
  {
    systemKey: CatalogSystemKey;
    labels: Record<Locale, string>;
    summaries: Record<Locale, string>;
  }
> = {
  'Script & Sistemler': {
    systemKey: 'script',
    labels: { tr: 'FiveM Script', en: 'FiveM Script', ru: 'Скрипт FiveM', fr: 'Script FiveM' },
    summaries: {
      tr: 'Açık kaynak FiveM sunucu script paketi · Hızlı teslimat.',
      en: 'Open-source FiveM server script resource · Ready to deploy.',
      ru: 'Скрипт для сервера FiveM с открытым кодом · Быстрая выдача.',
      fr: 'Script serveur FiveM open-source · Prêt à déployer.',
    },
  },
  'MLO & Mekanlar': {
    systemKey: 'mlo',
    labels: { tr: 'MLO İç Mekan', en: 'MLO Interior', ru: 'MLO Интерьер', fr: 'Intérieur MLO' },
    summaries: {
      tr: 'Oyun dünyasına entegre 3D iç mekan ve harita MLO paketi.',
      en: 'Custom 3D interior & world mapping MLO archive package.',
      ru: '3D-интерьер и маппинг MLO для интеграции на сервер.',
      fr: 'Pack d’intérieur 3D et mapping MLO prêt pour serveur.',
    },
  },
  'Araç Paketleri': {
    systemKey: 'vehicle',
    labels: { tr: 'Araç Modeli', en: 'Vehicle Asset', ru: 'Транспорт', fr: 'Véhicule' },
    summaries: {
      tr: 'Sunucuya doğrudan eklenebilen add-on araç veya paket dosyası.',
      en: 'FiveM-ready add-on vehicle model or curated fleet pack.',
      ru: 'Add-on модель автомобиля или автопарк для сервера FiveM.',
      fr: 'Modèle de véhicule add-on ou pack flotte prêt pour FiveM.',
    },
  },
  'Kıyafet & EUP': {
    systemKey: 'clothing',
    labels: { tr: 'Kıyafet & EUP', en: 'Clothing & EUP', ru: 'Одежда и EUP', fr: 'Vêtements & EUP' },
    summaries: {
      tr: 'Sivil, çete veya resmi kurumlar için optimize kıyafet / saç paketi.',
      en: 'Civilian, department uniform, or character customization EUP pack.',
      ru: 'Пакет одежды, формы EUP и кастомизации персонажей.',
      fr: 'Pack tenues civiles, uniformes EUP ou coiffures FiveM.',
    },
  },
  'Modlar & Eklentiler': {
    systemKey: 'heist',
    labels: { tr: 'Mod & Eklenti', en: 'Mod & Add-on', ru: 'Мод и аддон', fr: 'Mod & Add-on' },
    summaries: {
      tr: 'Silah, grafik, animasyon veya oynanış geliştirme eklenti paketi.',
      en: 'Weapon, visual graphics, animation, or gameplay add-on pack.',
      ru: 'Оружие, графика, анимации и игровые модификации.',
      fr: 'Pack d’armes, graphismes, animations ou amélioration gameplay.',
    },
  },
  'Program & Araçlar': {
    systemKey: 'security',
    labels: { tr: 'Güvenlik & Araç', en: 'Security & Tool', ru: 'Утилита', fr: 'Outil & Sécurité' },
    summaries: {
      tr: 'Geliştirici yardımcısı, koruma veya sunucu yönetim yazılımı.',
      en: 'Developer utility, anti-cheat protection, or server tool.',
      ru: 'Инструмент разработчика, античит или утилита управления.',
      fr: 'Outil développeur, protection anti-triche ou utilitaire.',
    },
  },
};

export function extractFrameworks(title: string): string[] {
  const out: string[] = [];
  if (/\b(qbox|qbx)\b/i.test(title)) out.push('Qbox');
  if (/\b(qb|qbcore|qb-core)\b/i.test(title)) out.push('QBCore');
  if (/\besx\b/i.test(title)) out.push('ESX');
  if (/\box\b|\box_/i.test(title)) out.push('Ox');
  if (/\bstandalone\b/i.test(title)) out.push('Standalone');
  return out;
}

export function extractVersionTag(title: string): string | null {
  const m = title.match(/\b(V\d+(?:\.\d+)?|AIO|Rework|Redesign|Update)\b/i);
  if (!m) return null;
  const raw = m[1];
  return /^v/i.test(raw) || /^aio$/i.test(raw) ? raw.toUpperCase() : raw;
}

export function analyzeCatalogItem(
  item: { id: string; title: string; category: string; source: string },
  locale: Locale
): CatalogItemIntel {
  let studio: string | null = null;
  for (const rule of STUDIO_RULES) {
    if (rule.pattern.test(item.title)) {
      studio = rule.name;
      break;
    }
  }

  const frameworks = extractFrameworks(item.title);
  const versionTag = extractVersionTag(item.title);

  const isMloCategory = item.category === 'MLO & Mekanlar';
  const isClothingCategory = item.category === 'Kıyafet & EUP';
  const mloAllowedRoles = new Set(['police', 'heist', 'nightlife', 'housing']);

  let matchedRole: RoleRule | null = null;
  if (!isClothingCategory) {
    for (const rule of ROLE_RULES) {
      if (isMloCategory && !mloAllowedRoles.has(rule.id)) continue;
      if (rule.pattern.test(item.title)) {
        matchedRole = rule;
        break;
      }
    }
  }

  const categoryDef = CATEGORY_DEFAULTS[item.category] || CATEGORY_DEFAULTS['Script & Sistemler'];
  const systemKey = matchedRole ? matchedRole.systemKey : categoryDef.systemKey;
  const roleLabel = matchedRole ? matchedRole.labels[locale] : categoryDef.labels[locale];
  const baseSummary = matchedRole ? matchedRole.summaries[locale] : categoryDef.summaries[locale];

  const prefixes: string[] = [];
  if (studio && !baseSummary.toLowerCase().includes(studio.toLowerCase())) {
    prefixes.push(studio);
  }
  if (frameworks.length > 0) {
    prefixes.push(frameworks.join(' / '));
  }

  const summary = prefixes.length > 0 ? `${prefixes.join(' · ')} — ${baseSummary}` : baseSummary;

  return {
    studio,
    systemKey,
    roleLabel,
    summary,
    frameworks,
    versionTag,
  };
}

export function normalizeSearchText(input: string): string {
  return input
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/gi, 'g')
    .replace(/ü/gi, 'u')
    .replace(/ş/gi, 's')
    .replace(/ö/gi, 'o')
    .replace(/ç/gi, 'c')
    .toLowerCase()
    .replace(/[-_/[\]().,:+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Bilingual TR <-> EN FiveM search expansion so Turkish terms find English archive titles.
const SEARCH_SYNONYMS: Record<string, string[]> = {
  polis: ['police', 'lspd', 'bcso', 'sahp', 'mrpd', 'sheriff', 'cop'],
  police: ['polis', 'lspd', 'bcso', 'sahp', 'mrpd'],
  soygun: ['heist', 'robbery', 'fleeca', 'pacific', 'vault', 'vangelico'],
  heist: ['robbery', 'soygun', 'vault'],
  hastane: ['hospital', 'pillbox', 'ems', 'medic', 'ambulance'],
  telefon: ['phone', 'smartphone', 'mphone'],
  phone: ['telefon', 'smartphone', 'mphone'],
  banka: ['bank', 'banking', 'atm'],
  garaj: ['garage', 'parking'],
  mekanik: ['mechanic', 'lsc', 'bennys', 'tuning'],
  envanter: ['inventory', 'stash', 'backpack'],
  arac: ['vehicle', 'car', 'dealership'],
  araba: ['vehicle', 'car'],
  kiyafet: ['clothing', 'eup', 'outfit', 'wardrobe'],
  uniforma: ['eup', 'uniform', 'police'],
  ev: ['house', 'housing', 'apartment', 'motel'],
  malikane: ['mansion', 'villa'],
  uyusturucu: ['drug', 'weed', 'cocaine', 'meth'],
  silah: ['weapon', 'gun', 'guns'],
  kuyumcu: ['jewelry', 'vangelico'],
  kumarhane: ['casino', 'diamond'],
  balik: ['fishing'],
  maden: ['mining', 'mine'],
  karakter: ['multicharacter', 'multichar', 'character'],
  harita: ['map', 'mlo'],
  anticheat: ['shield', 'waveshield', 'reason', 'fivecrack'],
};

export function scoreSearchMatch(
  normalizedTitle: string,
  normalizedSearchKey: string,
  tokens: string[],
  rawQueryNormalized: string,
  popScore: number,
  isFeatured: boolean,
  isVerified: boolean
): number {
  if (tokens.length === 0) return 0;

  let directTokenHits = 0;
  let titleWordBoundaryHits = 0;

  for (const token of tokens) {
    const expansions = SEARCH_SYNONYMS[token] ? [token, ...SEARCH_SYNONYMS[token]] : [token];
    const matchedVariant = expansions.find((variant) => normalizedSearchKey.includes(variant));
    if (!matchedVariant) {
      return -1;
    }

    if (normalizedTitle.includes(matchedVariant)) {
      directTokenHits += 1;
      const paddedTitle = ` ${normalizedTitle} `;
      if (paddedTitle.includes(` ${matchedVariant} `) || paddedTitle.includes(` ${matchedVariant}`)) {
        titleWordBoundaryHits += 1;
      }
    }
  }

  let score = directTokenHits * 40 + titleWordBoundaryHits * 55;
  if (rawQueryNormalized && normalizedTitle === rawQueryNormalized) {
    score += 500;
  } else if (rawQueryNormalized && normalizedTitle.startsWith(rawQueryNormalized)) {
    score += 260;
  } else if (rawQueryNormalized && normalizedTitle.includes(rawQueryNormalized)) {
    score += 140;
  }

  if (isFeatured) score += 65;
  if (isVerified) score += 45;
  score += Math.min(popScore, 300) * 0.2;

  return score;
}

export function splitTitleHighlight(
  title: string,
  query: string
): Array<{ text: string; match: boolean }> {
  const cleaned = query.trim();
  if (!cleaned) return [{ text: title, match: false }];

  const rawTokens = cleaned
    .split(/[\s\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
  if (rawTokens.length === 0) return [{ text: title, match: false }];

  const expanded = new Set<string>();
  for (const tok of rawTokens) {
    expanded.add(tok);
    const syn = SEARCH_SYNONYMS[normalizeSearchText(tok)];
    if (syn) syn.forEach((s) => expanded.add(s));
  }

  const patternBody = Array.from(expanded)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!patternBody) return [{ text: title, match: false }];

  const regex = new RegExp(`(${patternBody})`, 'gi');
  return title
    .split(regex)
    .map((part, idx) => ({
      text: part,
      match: idx % 2 === 1,
    }))
    .filter((segment) => segment.text.length > 0);
}
