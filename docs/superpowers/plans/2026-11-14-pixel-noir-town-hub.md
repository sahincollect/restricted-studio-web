# Isometric Kış Noir Pixel Town Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/` (`app/page.tsx`) into a 9-building Isometric Winter Noir Pixel Game Hub-Town (`Seçenek A`) with clickable transparent pixel buildings, localized signboards, live RPG inspector HUD, `/katalog?category=` deep links, responsive mobile storefront grid, and single-line rollback safety.

**Architecture:** `PixelTownHomePage` wraps `.pixel-noir-shell.pixel-town-shell` so it reuses `app/pixel-home.css` navigation, mobile drawer, accessibility-trapped modals, and global smooth-snow suppression (`WinterSnow.tsx` + `PixelWinterCanvas.tsx`), while adding a dedicated `app/pixel-town.css` layout for a proportional `16:9` isometric SVG-road town stage (`1280x720` logical space) populated with 9 transparent RGBA pixel building sprites (`public/assets/town/*.png`) and a persistent bottom inspector HUD backed by `lib/catalog-stats.json` and `/api/health`. On mobile (`<= 980px`), `app/globals.css` unlocks vertical scrolling specifically for `.pixel-town-shell` so all 9 buildings render cleanly as a 2-column touchable storefront grid without shrinking signboards or altering prior backup targets.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, `node:test` (`node --experimental-strip-types --test`), Python 3 + Pillow 13.0 (`PIL`) for sprite alpha keying, custom CSS + SVG crisp pixel streets.

**Spec:** `docs/superpowers/specs/2026-11-14-pixel-noir-town-hub-design.md`

## Global Constraints

- Exact Restricted Studio Noir palette: obsidian ground `#080808`, elevated obsidian `#0e0e10`, deep crimson `#8B0000` / `#A50000` / `#d41c1c`, chalk snow `#F0F0F0`, warm lantern amber `#FFB84D`, frost accent `#B8E1FF`.
- Zero playable mini-game logic (no WASD, Pacman, Ctrl+K, F8 gimmicks, or canvas/WebGL game loops).
- Strict CSP compliance (`middleware.ts`, `lib/security-edge.ts`): React DOM, `<img />`, inline `<svg>`, pure Canvas2D (`PixelWinterCanvas`), external links with `target="_blank" rel="noopener noreferrer"`.
- Typography: `Pixelify Sans` strictly for large headings (`>= 20px`); `JetBrains Mono` bold uppercase for all 9 building signboards, counts, and inspector HUD labels (`<= 14px`) to keep Turkish/Cyrillic/French diacritics razor sharp; `Inter` for modal prose.
- Viewport behavior: Desktop (`>= 901px` / `>= 981px` matching `.px-nav` breakpoint) locked at `100dvh` (`overflow: hidden`); mobile (`<= 980px`) vertically scrollable (`overflow-y: auto`, `overflow-x: hidden`).
- Preserve all prior backups: leave `backup/homepage-noir`, `backup-homepage-noir-v1` (`413f59d`), `components/HomePageBackup.tsx`, and `components/PixelHomePage.tsx` intact; add annotated git tag `backup-homepage-pixel-bento-v1` at `39930af` before code edits.
- All product stats pull dynamically from `lib/catalog-stats.json` (`total: 6446`, `Script & Sistemler: 3561`, `MLO & Mekanlar: 1298`, `Araç Paketleri: 1152`).

## Review Focus

- `?category=` URL parameters with mixed case, Turkish characters, whitespace, or invalid strings (e.g., `?category=SCRIPTS`, `?category=Script%20%26%20Sistemler`, `?category=unknown`) cleanly resolve or return `null` instead of leaving `/katalog` stuck on an empty filtered list → pinned in Task 1 unit tests (`resolveCatalogCategoryParam`).
- Isometric stage coordinates (`left%`, `top%`, `width%`, `height%` in `1280x720` space) could collide with each other or overlap the top-left `.px-town-marquee` sky zone or `.px-nav` edge → pinned in Task 1 geometric validation test (`validateTownLayoutGeometry`) and Task 5 screenshot audits at `1366x768` & `1440x900`.
- Long localized Cyrillic/French strings on narrow hanging pixel signboards (`signTitle`, `badge`) could clip or wrap awkwardly → pinned in Task 2 translation parity & signboard character-budget tests across `tr`, `en`, `ru`, `fr`.
- Non-blocking `/api/health` fetch could fail, return HTTP 500, or omit `responseTimeMs`/`status` and crash or leave `DURUM İSTASYONU` blank → pinned in Task 4 (`deriveStatusBadgeState` safe fallback test + error-free browser verification).
- Mobile (`<= 980px`, `390x844`) scroll lock from `app/globals.css` `html:has(.pixel-noir-shell)` could clip cards below row 3 if not scoped cleanly around `.pixel-town-shell`, without breaking rollback to `.pixel-noir-shell` (`PixelHomePage`) → pinned in Task 4 CSS check & Task 5 mobile viewport scrollHeight/scrollWidth assertions.

---

### Task 1: Backup Tag, URL Category Resolver, and Town Building Config

**Files:**
- Create: `lib/catalog-query.ts`
- Create: `lib/pixel-town-config.ts`
- Create: `scripts/test-pixel-town.mjs`
- Modify: `app/katalog/page.tsx:1-30,190-206`

**Interfaces:**
- Consumes: `CATALOG_CATEGORY_KEYS` (`lib/translations.ts:3-11`), `catalog-stats.json` (`total`, `counts`)
- Produces:
  - `lib/catalog-query.ts`: `export type CatalogCategoryKey = (typeof CATALOG_CATEGORY_KEYS)[number];` and `export function resolveCatalogCategoryParam(raw: string | null | undefined): CatalogCategoryKey | null`
  - `lib/pixel-town-config.ts`: `export type PixelTownBuildingId = 'status' | 'discord' | 'portal' | 'catalog' | 'engineering' | 'itemsatis' | 'scripts' | 'mlo' | 'vehicles';`, `export interface PixelTownBuildingSpec`, `export const PIXEL_TOWN_BUILDINGS: readonly PixelTownBuildingSpec[]`, `export function getTownBuildingBadge(id: PixelTownBuildingId, localizedDefaultBadge: string, healthState?: TownHealthSnapshot | null): string`, `export function deriveStatusBadgeState(payload: unknown): TownHealthSnapshot | null`, `export function validateTownLayoutGeometry(buildings: readonly PixelTownBuildingSpec[]): { ok: boolean; errors: string[] }`

- [ ] **Step 1: Create backup git tag for `39930af`**

Run: `git tag -f -a backup-homepage-pixel-bento-v1 39930af -m "Backup Kış Noir Pixel Split-Bento homepage before Isometric Town Hub"`  
Expected: `git show-ref --tags` shows both `backup-homepage-noir-v1` and `backup-homepage-pixel-bento-v1`.

- [ ] **Step 2: Write failing tests in `scripts/test-pixel-town.mjs` covering `resolveCatalogCategoryParam`, `PIXEL_TOWN_BUILDINGS`, `validateTownLayoutGeometry`, and `deriveStatusBadgeState`**

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.equal(resolveCatalogCategoryParam('  Script & Sistemler  '), 'Script & Sistemler');
    assert.equal(resolveCatalogCategoryParam('Tümü'), 'Tümü');
    assert.equal(resolveCatalogCategoryParam('nonexistent'), null);
    assert.equal(resolveCatalogCategoryParam(''), null);
    assert.equal(resolveCatalogCategoryParam(null), null);
  });
});

describe('pixel-town-config', () => {
  it('defines 9 unique buildings with valid actions, sprites, and non-overlapping safe geometry', () => {
    assert.equal(PIXEL_TOWN_BUILDINGS.length, 9);
    const ids = new Set(PIXEL_TOWN_BUILDINGS.map((b) => b.id));
    assert.equal(ids.size, 9);
    const geom = validateTownLayoutGeometry(PIXEL_TOWN_BUILDINGS);
    assert.equal(geom.ok, true, geom.errors.join('; '));
  });

  it('derives safe status snapshot on valid or malformed health payloads and formats category badges from catalog-stats', () => {
    assert.equal(deriveStatusBadgeState(null), null);
    assert.equal(deriveStatusBadgeState({ status: 'broken', responseTimeMs: 'fast' }), null);
    const okSnap = deriveStatusBadgeState({ status: 'operational', responseTimeMs: 42 });
    assert.deepEqual(okSnap, { state: 'operational', responseTimeMs: 42 });
    assert.equal(getTownBuildingBadge('scripts', '3.500+'), '3.561');
    assert.equal(getTownBuildingBadge('catalog', '6.400+'), '6.446+');
    assert.equal(getTownBuildingBadge('status', 'AKTİF', okSnap), '42 ms');
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs`  
Expected: FAIL (`Cannot find module '../lib/catalog-query.ts'`).

- [ ] **Step 4: Implement `resolveCatalogCategoryParam` in `lib/catalog-query.ts`**

Create `lib/catalog-query.ts` importing `CATALOG_CATEGORY_KEYS` (`import { CATALOG_CATEGORY_KEYS } from './translations.ts';` with explicit `.ts` or Next/Node-compatible relative import — wait: verify how `scripts/test-pixel-home.mjs` imports files! In `tsconfig.json`, check if `.ts` extension works or omit/enable via TypeScript; remember `scripts/test-pixel-home.mjs` uses `../lib/pixel-core-telemetry.ts`, and `pixel-core-telemetry.ts` has no relative `.ts` imports. In Node 24 `--experimental-strip-types`, relative TS-to-TS imports require explicit `.ts` extension OR check `tsconfig.json` `allowImportingTsExtensions` before importing `translations`). Inspect `tsconfig.json` first line-check during implementation: either define/reuse category list cleanly or enable extensionless Next + Node compatibility by keeping pure constants in `lib/catalog-query.ts` mapped identically to `CATALOG_CATEGORY_KEYS` (checked in tests!). Map slugs (`scripts`, `script`, `mlo`, `maps`, `vehicles`, `cars`, `arac`, `eup`, `clothing`, `kiyafet`, `mods`, `modlar`, `tools`, `program`, `all`, `tumu`) plus exact normalized keys from `CATALOG_CATEGORY_KEYS`.

- [ ] **Step 5: Implement `lib/pixel-town-config.ts`**

Define all 9 `PIXEL_TOWN_BUILDINGS` strictly matching Section 5 of the spec (`status`, `discord`, `portal`, `catalog`, `engineering`, `itemsatis`, `scripts`, `mlo`, `vehicles`), their `%` coordinates (`x, y, w, h, zIndex` verified against marquee sky region `x < 39 && y < 34`), `sprite: '/assets/town/<id>.png'`, action metadata (`{ kind: 'route', href }`, `{ kind: 'modal', modalId: 'engineering' }`, `{ kind: 'external', href: 'https://www.itemsatis.com/p/saintstudio' }`), `getTownBuildingBadge` formatting `catalogStats.total` / category counts with `tr-TR` thousand dot (`6.446+`, `3.561`, `1.298`, `1.152`), and `validateTownLayoutGeometry` asserting bounds `[2..96]`, non-overlap with the top-left `.px-town-marquee` zone (`0..38%` x `0..33%`), and sign center spacing `>= 8%` between building sign anchors.

- [ ] **Step 6: Wire `resolveCatalogCategoryParam` into `app/katalog/page.tsx`**

In `app/katalog/page.tsx:193-204`, import `resolveCatalogCategoryParam` from `@/lib/catalog-query` and parse `const catParam = params.get('category');` inside the mount `useEffect`; if resolved, call `setSelectedCategory(matchedCategory)`.

- [ ] **Step 7: Run tests & commit**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs && npx tsc --noEmit`  
Expected: PASS (3/3 unit tests pass, zero TypeScript errors).  
Commit: `feat: add catalog category query resolver and pixel town district config`

---

### Task 2: 4-Locale Town Hub Dictionary (`TR / EN / RU / FR`)

**Files:**
- Modify: `lib/translations.ts:135-136,640-641,1195-1196,1750-1751,2305-2306`
- Modify: `scripts/test-pixel-town.mjs`

**Interfaces:**
- Consumes: `PixelTownBuildingId` (`lib/pixel-town-config.ts`)
- Produces: `TranslationDictionary['home']['town']` containing `marqueeEyebrow`, `marqueeTitle`, `hudSelectedPrefix`, `hudHint`, `statusNominal`, `statusDegraded`, `buildings: Record<PixelTownBuildingId, { signTitle: string; badge: string; category: string; summary: string; ctaLabel: string }>` across `tr`, `en`, `ru`, `fr`.

- [ ] **Step 1: Add localization parity & character-budget test in `scripts/test-pixel-town.mjs`**

Assert for each locale in `['tr', 'en', 'ru', 'fr']`:
- `TRANSLATIONS[loc].home.town` exists with non-empty `marqueeEyebrow`, `marqueeTitle`, `hudSelectedPrefix`, `hudHint`, `statusNominal`, `statusDegraded`.
- Every `id` in `PIXEL_TOWN_BUILDINGS` exists in `TRANSLATIONS[loc].home.town.buildings[id]` with non-empty `signTitle` (`<= 22` chars so single-line/2-line signboard plaque never clips), `badge` (`<= 14` chars), `category`, `summary`, and `ctaLabel`.

- [ ] **Step 2: Run test to verify failure**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs`  
Expected: FAIL (`Cannot read properties of undefined (reading 'buildings')`).

- [ ] **Step 3: Extend `TranslationDictionary['home']` and populate `tr`, `en`, `ru`, `fr` in `lib/translations.ts`**

Add the typed `town` block to `TranslationDictionary['home']` and fluent, concise noir copy for all 4 locales (`tr`, `en`, `ru`, `fr`) covering marquee text, inspector prefixes, health labels (`OPERASYONEL` / `ONLINE` / `АКТИВЕН` / `OPÉRATIONNEL`), and all 9 buildings.

- [ ] **Step 4: Run tests & commit**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs && npx tsc --noEmit`  
Expected: PASS (all unit tests & TypeScript checks green).  
Commit: `feat: add 4-locale pixel town signage and inspector translations`

---

### Task 3: Generate & Post-Process 9 Transparent Isometric Pixel Building Sprites

**Files:**
- Create: `scripts/process-pixel-sprites.py`
- Create: `public/assets/town/status.png`
- Create: `public/assets/town/discord.png`
- Create: `public/assets/town/portal.png`
- Create: `public/assets/town/catalog.png`
- Create: `public/assets/town/engineering.png`
- Create: `public/assets/town/itemsatis.png`
- Create: `public/assets/town/scripts.png`
- Create: `public/assets/town/mlo.png`
- Create: `public/assets/town/vehicles.png`

**Interfaces:**
- Consumes: Raw `image-generator` outputs saved in temporary scratch/input folder
- Produces: Crisp RGBA transparent PNG sprites in `public/assets/town/<id>.png` matching `PIXEL_TOWN_BUILDINGS[n].sprite`.

- [ ] **Step 1: Write `scripts/process-pixel-sprites.py`**

Implement a deterministic Pillow script (`process_sprite(input_path, output_path, threshold=18, target_max_width=512)`) using a BFS flood-fill starting from all border pixels (`x=0, x=w-1, y=0, y=h-1`) where `max(R, G, B) <= threshold` (removing exterior obsidian black void without punching holes inside interior dark shadows!), applying 1px soft dark-edge alpha attenuation to immediate border pixels, cropping tightly to the non-transparent bounding box (`getbbox()`) plus `4px` transparent padding, and resizing proportionally (`Image.Resampling.NEAREST` or integer downscale so crisp pixel edges stay jagged/clean) into `public/assets/town/<id>.png`. Include a `--self-test` mode creating a synthetic black-bordered pixel square with interior `#050505` pocket and verifying outer pixels turn transparent (`alpha == 0`) while the protected interior dark window stays opaque (`alpha == 255`).

- [ ] **Step 2: Run script self-test**

Run: `python scripts/process-pixel-sprites.py --self-test`  
Expected: Output `SELF-TEST PASS` with exit code `0`.

- [ ] **Step 3: Generate all 9 raw pixel building illustrations via `image-generator` subagents**

Dispatch `image-generator` calls (strictly specifying: 3/4 isometric perspective, snow-dusted obsidian stone & brushed dark metal building architecture, `#A50000` crimson & `#FFB84D` amber glowing windows/awnings, **100% isolated centered sprite on solid pure `#000000` void with generous black margin on all 4 sides**, **STRICTLY NO TEXT / NO LETTERS** on any signs):
1. `catalog`: Towering Noir gothic server citadel HQ with crimson arched portal, twin spires, snowy stepped roofs
2. `status`: Industrial telemetry relay tower with blinking red/emerald beacon dish and snowy cooling fins
3. `discord`: Tall snow-frosted noir communications watchtower with crimson lighthouse beam and lantern balcony
4. `portal`: Fortified security gatehouse booth with steel turnstile canopy and warm keypad display light
5. `engineering`: Heavy vault-door red-brick & obsidian workshop with glowing cyan/amber code monitor window
6. `itemsatis`: Armored street kiosk counter with roll-up shutter, red awning stripe, shield emblem relief (no words)
7. `scripts`: Compact cyberpunk noodle-shop-scale storefront selling Lua tech terminals, glowing amber screen window, snowy awning
8. `mlo`: Architectural 2-story dark concrete & glass loft gallery studio with illuminated miniature room interior visible
9. `vehicles`: Brutalist roll-up garage bay half-open revealing glowing crimson sports tail-lights inside

- [ ] **Step 4: Process raw outputs to `public/assets/town/*.png` and visually inspect EVERY PNG with `read_file`**

Run `python scripts/process-pixel-sprites.py ...` for all 9 assets, inspect all 9 final PNGs via `read_file`, regenerate or tune `threshold` if any building has a chopped wall, visible outer box, baked unreadable text, or blurry anti-aliased haze.

- [ ] **Step 5: Commit processed sprites and extraction script**

Commit: `assets: add 9 transparent isometric noir pixel building sprites`

---

### Task 4: Implement `PixelTownHomePage.tsx`, Scoped `app/pixel-town.css`, Mobile Scroll Fix, and Wire `app/page.tsx`

**Files:**
- Modify: `app/globals.css:54-74`
- Create: `app/pixel-town.css`
- Create: `components/PixelTownHomePage.tsx`
- Modify: `app/page.tsx:1`

**Interfaces:**
- Consumes: `PIXEL_TOWN_BUILDINGS`, `getTownBuildingBadge`, `deriveStatusBadgeState` (`lib/pixel-town-config.ts`), `PixelWinterCanvas` (`components/PixelWinterCanvas.tsx`), `LanguageSwitcher` (`components/LanguageSwitcher.tsx`), `useI18n` (`components/I18nProvider.tsx`), `catalog-stats.json`, existing `.px-nav`, `.px-mobile-drawer`, `.px-modal-*`, `.px-btn` rules (`app/pixel-home.css`)
- Produces: Default homepage component exported by `app/page.tsx`.

- [ ] **Step 1: Refine `app/globals.css:54-74` so `.pixel-town-shell` unlocks vertical scroll strictly on `<= 980px`**

Add `@media (max-width: 980px)` rule overriding `html:has(.pixel-town-shell)` and `html:has(.pixel-town-shell) body` to `height: auto !important; max-height: none !important; min-height: 100dvh !important; overflow-y: auto !important; overflow-x: hidden !important;`, leaving desktop `100dvh` lock and `PixelHomePage.tsx` (`.pixel-noir-shell` without `.pixel-town-shell`) untouched.

- [ ] **Step 2: Create `app/pixel-town.css`**

Define scoped layout rules under `.pixel-town-shell`:
- Desktop (`>= 981px`): flex column (`gap: 8px; padding: 10px 14px;`), `.px-town-viewport` (`flex: 1; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;`), `.px-town-stage` (`position: relative; aspect-ratio: 16 / 9; width: min(100%, calc((100dvh - 134px) * 16 / 9)); max-height: 100%;`), sky backdrop vignette using `/assets/pixel-holiday-skyline.png` at `opacity: 0.2`, `.px-town-roads` SVG overlay, `.px-town-marquee` pinned at top-left negative-space sky (`left: 1.5%; top: 2.5%; max-width: 35%;`), `.px-bldg` hotspots positioned with percentage anchors & crisp `pixelated` sprite rendering (`drop-shadow` + `:hover / :focus-visible / .is-selected` amber/crimson underglow + step-lift + corner reticle), stepped `.px-bldg-sign` plaques in `JetBrains Mono` (`10px–11px`), and `.px-town-hud` bottom inspector (`height: 54px`, 3-zone RPG readout bar).
- Mobile (`<= 980px`): switch `.pixel-town-shell` to `height: auto; min-height: 100dvh; overflow: visible;` (with `.px-snow-canvas` fixed to viewport), transform `.px-town-stage` into vertical flow where `.px-town-roads` hides cleanly, `.px-town-marquee` sits full-width at top, and the 9 buildings arrange cleanly into a **2-column responsive storefront grid** (`grid-template-columns: repeat(2, minmax(0, 1fr))` with `catalog` spanning `1 / -1` featured full-width at top), each rendering an individual obsidian night-plinth card with full sprite, signboard, live badge, 1-line summary, and `>= 44px` tap target; hide duplicate hover-only `.px-town-hud` on mobile (`<= 980px`).
- `prefers-reduced-motion: reduce`: disable hover lift transition / pulse animations.

- [ ] **Step 3: Build `components/PixelTownHomePage.tsx`**

Implement:
- Imports `../app/pixel-home.css` and `../app/pixel-town.css`.
- Exact top `.px-nav` + `.px-mobile-drawer` + focus-trapped modals (`'about' | 'solutions' | 'engineering' | 'faq'`) parity with `PixelHomePage.tsx`.
- Default `activeBuildingId` state initialized to `'catalog'`, updating on `onMouseEnter` and `onFocus` for all 9 buildings.
- Single non-blocking `useEffect` fetch to `/api/health` (`cache: 'no-store'`, abort/unmount safe, parsed through `deriveStatusBadgeState`) enriching `status` building badge & HUD latency display.
- Deterministic SVG `<svg className="px-town-roads" viewBox="0 0 1280 720" shapeRendering="crispEdges" aria-hidden="true">` rendering dark isometric cobblestone lanes linking the 3 tiers, crimson-trimmed plaza pad under `catalog`, glowing street lanterns, and 4 compact holiday pixel pines placed clear of signboards.
- Bottom RPG Inspector HUD bar `.px-town-hud` displaying active building badge, `signTitle`, `summary`, count chips, and clicking enters the destination (`Link` / `button` / `a`).

- [ ] **Step 4: Switch `app/page.tsx` export to `PixelTownHomePage`**

Replace line 1 of `app/page.tsx` with `export { default } from '@/components/PixelTownHomePage';`.

- [ ] **Step 5: Run TypeScript check and unit tests, then commit**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs scripts/test-pixel-home.mjs && npx tsc --noEmit`  
Expected: PASS cleanly.  
Commit: `feat: implement isometric pixel noir town homepage hub`

---

### Task 5: Full Build, Production Runtime Audit, and Multi-Viewport Visual Inspection

**Files:**
- Verification artifacts (temporary scripts/screenshots stored in agent scratch folder, never polluting repo)

- [ ] **Step 1: Run complete unit tests, typecheck, and Next.js production build**

Run: `node --experimental-strip-types --test scripts/test-pixel-town.mjs scripts/test-pixel-home.mjs && npx tsc --noEmit && npm run build`  
Expected: Zero errors, Next.js build succeeds across all routes (`/`, `/katalog`, `/dashboard`, `/status`, `/discord`, `/login`, `/register`).

- [ ] **Step 2: Launch `npm run start` and verify DOM/layout metrics across viewports in Playwright/headless browser**

Test against `http://localhost:3000`:
1. **`1440x900` desktop:** Zero horizontal/vertical page overflow (`documentElement.scrollHeight <= innerHeight`, `scrollWidth <= innerWidth`), all 9 `.px-bldg` images load (`complete && naturalWidth > 0`), all 9 signboards are within viewport bounds and non-overlapping, hovering/focusing `scripts` updates `.px-town-hud`, clicking `engineering` opens accessible focus-trapped modal (`Escape` closes), clicking `scripts` navigates to `/katalog?category=scripts` and pre-selects `'Script & Sistemler'`, language switcher updates labels across `EN/RU/FR/TR`, zero `console.error` / `pageerror`. Capture default, hovered, and modal screenshots.
2. **`1366x768` laptop:** Confirm `16:9` town fits cleanly within `768px` height with zero clipped roofs or HUD overlap. Capture screenshot.
3. **`390x844` mobile:** Confirm `scrollWidth <= innerWidth` (zero horizontal overflow), all 9 building cards visible and cleanly tappable in the 2-column grid (vertical scroll works smoothly), mobile drawer toggles cleanly. Capture screenshots.

- [ ] **Step 3: Inspect EVERY captured screenshot via `read_file` and fix any visual spacing/contrast/overlap issue**

Verify signboards are readable at a glance, buildings sit cleanly on roads with zero square sprite boxes, lighting matches `#080808` + `#A50000` + `#FFB84D`, and mobile cards look intentional. Fix and re-verify if anything looks clipped or uneven.

---

## Self-Review

1. **Spec coverage:** Every section of `docs/superpowers/specs/2026-11-14-pixel-noir-town-hub-design.md` maps directly to a task: Task 1 covers backup tag, `?category=` resolver + `/katalog` integration, and `lib/pixel-town-config.ts`; Task 2 covers 4-locale strings; Task 3 covers the 9 sprite generations & Pillow alpha extraction; Task 4 covers `app/globals.css`, `app/pixel-town.css`, `components/PixelTownHomePage.tsx`, and `app/page.tsx`; Task 5 covers full verification & multi-viewport visual checks.
2. **Step scan:** Every step specifies exact file paths, function signatures, test assertions, and verification commands without placeholder TBDs or redundant whole-component transcripts.
3. **Type consistency:** `PixelTownBuildingId`, `PIXEL_TOWN_BUILDINGS`, `resolveCatalogCategoryParam`, `deriveStatusBadgeState`, `getTownBuildingBadge`, `validateTownLayoutGeometry`, and `TranslationDictionary['home']['town']` match identically across Tasks 1, 2, 3, and 4.
4. **Review Focus coverage:** All 5 Review Focus failure modes (`?category=` normalization, geometry non-overlap vs marquee, 4-locale signboard bounds, `/api/health` fault tolerance, mobile `<= 980px` scroll unlock without hurting `PixelHomePage` rollback) have pinned automated or browser assertions.
5. **Proportion:** Concise task plan aligned proportionally with the design doc.
