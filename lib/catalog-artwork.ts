export interface CatalogArtworkInput {
  id: string;
  title: string;
  category: string;
  image?: string;
}

const THEME_RULES: Array<{ file: string; pattern: RegExp }> = [
  {
    file: '/assets/catalog/phone-hud.jpg',
    pattern: /phone|hud|tablet|dispatch|mdt|ui|menu|loading|radio|multi\s*char|appearance|inventory|notify/i,
  },
  {
    file: '/assets/catalog/vehicle-garage.jpg',
    pattern:
      /car|veh|lsc|mechanic|garage|dealer|bmw|mercedes|audi|porsche|gtr|ford|chevy|dodge|lambo|ferrari|bike|moto|racing|drift|tuning|rims/i,
  },
  {
    file: '/assets/catalog/police-ems.jpg',
    pattern: /police|lspd|bcso|sheriff|sahp|ems|hospital|pillbox|medic|ambulance|fire|prison|jail|court|gov/i,
  },
  {
    file: '/assets/catalog/heist-crime.jpg',
    pattern: /heist|robbery|bank|fleeca|pacific|vault|drug|weed|cocaine|meth|gang|mafia|cartel|vagos|ballas|weapon|gun|revolver/i,
  },
  {
    file: '/assets/catalog/nightlife-casino.jpg',
    pattern: /club|bar|tequi|casino|diamond|lounge|cafe|restaurant|burger|pizza|coffee|cinema|arcade|shop|store|market/i,
  },
  {
    file: '/assets/catalog/mansion-interior.jpg',
    pattern: /mlo|mansion|villa|house|home|apt|apartment|hotel|motel|paleto|sandy|roxwood|map|church|grave|gym|office|interior/i,
  },
  {
    file: '/assets/catalog/clothing-eup.jpg',
    pattern: /cloth|eup|outfit|uniform|wardrobe|shirt|jacket|pants|shoe|hat|mask|vest|backpack|hair|tattoo|ped/i,
  },
  {
    file: '/assets/catalog/security-dev.jpg',
    pattern: /shield|anti|cheat|admin|panel|dumper|log|script|core|bridge|framework|sql|job|craft|farm|mine|fish/i,
  },
];

const CATEGORY_FALLBACK: Record<string, string> = {
  'Araç Paketleri': '/assets/catalog/vehicle-garage.jpg',
  'MLO & Mekanlar': '/assets/catalog/mansion-interior.jpg',
  'Kıyafet & EUP': '/assets/catalog/clothing-eup.jpg',
  'Script & Sistemler': '/assets/catalog/security-dev.jpg',
  'Modlar & Eklentiler': '/assets/catalog/security-dev.jpg',
  'Program & Araçlar': '/assets/catalog/security-dev.jpg',
};

export function getCatalogItemArtwork(item: CatalogArtworkInput): string {
  if (item.image && typeof item.image === 'string') {
    return item.image;
  }

  const haystack = `${item.title} ${item.category}`;
  for (const rule of THEME_RULES) {
    if (rule.pattern.test(haystack)) {
      return rule.file;
    }
  }

  return CATEGORY_FALLBACK[item.category] || '/assets/catalog/security-dev.jpg';
}
