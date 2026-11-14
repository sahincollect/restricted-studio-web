import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import catalogStats from '../lib/catalog-stats.json' with { type: 'json' };
import { CATALOG_CATEGORY_KEYS, TRANSLATIONS } from '../lib/translations.ts';
import { resolveCatalogCategoryParam } from '../lib/catalog-query.ts';
import {
  PIXEL_TOWN_BUILDINGS,
  deriveStatusBadgeState,
  getTownBuildingBadge,
  validateTownLayoutGeometry,
} from '../lib/pixel-town-config.ts';

describe('catalog-query', () => {
  it('resolves slug aliases and exact categories case-insensitively and rejects unknown inputs', () => {
    assert.equal(resolveCatalogCategoryParam('scripts'), 'Script & Sistemler');
    assert.equal(resolveCatalogCategoryParam('SCRIPTS'), 'Script & Sistemler');
    assert.equal(resolveCatalogCategoryParam('mlo'), 'MLO & Mekanlar');
    assert.equal(resolveCatalogCategoryParam('vehicles'), 'Araç Paketleri');
    assert.equal(resolveCatalogCategoryParam('eup'), 'Kıyafet & EUP');
    assert.equal(resolveCatalogCategoryParam('mods'), 'Modlar & Eklentiler');
    assert.equal(resolveCatalogCategoryParam('tools'), 'Program & Araçlar');
    assert.equal(resolveCatalogCategoryParam('  Script & Sistemler  '), 'Script & Sistemler');
    assert.equal(resolveCatalogCategoryParam('Tümü'), 'Tümü');
    assert.equal(resolveCatalogCategoryParam('nonexistent'), null);
    assert.equal(resolveCatalogCategoryParam(''), null);
    assert.equal(resolveCatalogCategoryParam(null), null);

    for (const alias of ['scripts', 'mlo', 'vehicles', 'eup', 'mods', 'tools', 'all']) {
      const resolved = resolveCatalogCategoryParam(alias);
      assert.ok(resolved !== null && CATALOG_CATEGORY_KEYS.includes(resolved));
    }
  });
});

describe('pixel-town-config', () => {
  it('defines 9 unique buildings with valid actions, sprites, and non-overlapping safe geometry', () => {
    assert.equal(PIXEL_TOWN_BUILDINGS.length, 9);
    const ids = new Set(PIXEL_TOWN_BUILDINGS.map((b) => b.id));
    assert.equal(ids.size, 9);

    for (const building of PIXEL_TOWN_BUILDINGS) {
      assert.match(building.sprite, /^\/assets\/town\/[a-z]+\.png$/);
      if (building.action.kind === 'route' || building.action.kind === 'external') {
        assert.ok(building.action.href.length > 0);
      }
    }

    const geom = validateTownLayoutGeometry(PIXEL_TOWN_BUILDINGS);
    assert.equal(geom.ok, true, geom.errors.join('; '));
  });

  it('derives safe status snapshot on valid or malformed health payloads and formats category badges from catalog-stats', () => {
    assert.equal(deriveStatusBadgeState(null), null);
    assert.equal(deriveStatusBadgeState({ status: 'broken', responseTimeMs: 'fast' }), null);

    const okSnap = deriveStatusBadgeState({ status: 'operational', responseTimeMs: 42 });
    assert.deepEqual(okSnap, { state: 'operational', responseTimeMs: 42 });

    const degradedNoPing = deriveStatusBadgeState({ status: 'degraded' });
    assert.deepEqual(degradedNoPing, { state: 'degraded', responseTimeMs: null });

    assert.equal(getTownBuildingBadge('scripts', '3.500+', catalogStats), '3.561');
    assert.equal(getTownBuildingBadge('mlo', '1.200+', catalogStats), '1.298');
    assert.equal(getTownBuildingBadge('vehicles', '1.100+', catalogStats), '1.152');
    assert.equal(getTownBuildingBadge('catalog', '6.400+', catalogStats), '6.446+');
    assert.equal(getTownBuildingBadge('status', 'AKTİF', catalogStats, okSnap), '42 ms');
    assert.equal(getTownBuildingBadge('status', 'AKTİF', catalogStats, null), 'AKTİF');
  });
});

describe('pixel-town-translations', () => {
  it('provides complete 4-locale town strings with compact signboard character budgets', () => {
    for (const loc of ['tr', 'en', 'ru', 'fr']) {
      const town = TRANSLATIONS[loc].home.town;
      assert.ok(town, `${loc}: missing home.town`);
      assert.ok(town.marqueeEyebrow.length > 0, `${loc}: marqueeEyebrow empty`);
      assert.ok(town.marqueeTitle.length > 0, `${loc}: marqueeTitle empty`);
      assert.ok(town.hudSelectedPrefix.length > 0, `${loc}: hudSelectedPrefix empty`);
      assert.ok(town.hudHint.length > 0, `${loc}: hudHint empty`);
      assert.ok(town.statusNominal.length > 0, `${loc}: statusNominal empty`);
      assert.ok(town.statusDegraded.length > 0, `${loc}: statusDegraded empty`);

      for (const building of PIXEL_TOWN_BUILDINGS) {
        const copy = town.buildings[building.id];
        assert.ok(copy, `${loc}: missing building ${building.id}`);
        assert.ok(
          copy.signTitle.length > 0 && copy.signTitle.length <= 22,
          `${loc}.${building.id}.signTitle out of bounds (${copy.signTitle.length}): ${copy.signTitle}`
        );
        assert.ok(
          copy.badge.length > 0 && copy.badge.length <= 14,
          `${loc}.${building.id}.badge out of bounds (${copy.badge.length}): ${copy.badge}`
        );
        assert.ok(copy.category.length > 0, `${loc}.${building.id}.category empty`);
        assert.ok(copy.summary.length > 0, `${loc}.${building.id}.summary empty`);
        assert.ok(copy.ctaLabel.length > 0, `${loc}.${building.id}.ctaLabel empty`);
      }
    }
  });
});
