/**
 * Curated Featured catalog items & baseline click popularity weights.
 * Every ID below is verified against lib/catalog-data.json.
 * Runtime clicks tracked via /api/catalog/clicks merge directly on top of these baselines.
 */

export const FEATURED_BASELINE_CLICKS: Record<string, number> = {
  'RS-CAT-0013': 184, // LB Phone
  'RS-CAT-0011': 162, // Gabz - Complete Town & City Interior MLO Archive
  'RS-CAT-0046': 148, // Pscripts Ox Inventory Redesign
  'RS-CAT-0022': 135, // UM Ronin Multicharacter [Qbox / QB / ESX]
  'RS-CAT-0001': 129, // Fiv3Devs - Los Santos Customs (LSC MLO Interior)
  'RS-CAT-0005': 118, // Oxlyn - Tactical Modular Backpack System V3
  'RS-CAT-0356': 112, // RTX Roxwood County Water Park
  'RS-CAT-0258': 104, // Diables Pillbox Hospital V2 Update
  'RS-CAT-0201': 96,  // Okok Banking V2
  'RS-CAT-0017': 91,  // JG Advanced Garages V3
  'RS-CAT-0028': 86,  // Onx Emergency Police EMS Vehicle Pack
  'RS-CAT-0032': 82,  // Gabz Lore Friendly Vehicles Summer Update
  'RS-CAT-0009': 78,  // JulyGee - High-End EUP & Outfit Wardrobe Collection
  'RS-CAT-0015': 74,  // Ziaders Unbranded Clothing Pack V2
  'RS-CAT-0043': 69,  // Do It Digital 30 Police Weapon Pack
  'RS-CAT-0128': 64,  // Oxlyn Advanced Handling Editor
};

export const FEATURED_CATALOG_IDS = new Set<string>(Object.keys(FEATURED_BASELINE_CLICKS));

export function isFeaturedCatalogItem(id: string): boolean {
  return FEATURED_CATALOG_IDS.has(id);
}

export function getItemPopularityScore(
  id: string,
  liveClicks: Record<string, number>
): number {
  const baseline = FEATURED_BASELINE_CLICKS[id] || 0;
  const recorded = liveClicks[id] || 0;
  return baseline + recorded;
}
