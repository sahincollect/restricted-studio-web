# Design Specification: Isometric Kış Noir Pixel Town Hub (`Seçenek A` — 9-Building District)

**Date:** 2026-11-14  
**Scope:** Homepage (`/`, `app/page.tsx`), scoped homepage stylesheet (`app/pixel-town.css`), `?category=` URL parsing on `/katalog` (`app/katalog/page.tsx`), transparent pixel-art building sprites (`public/assets/town/*`), localization updates (`lib/translations.ts`), and non-destructive backup/rollback guarantees.  
**Target Aesthetic:** Restricted Studio Dark Noir + Winter Pixel Hub-World (`#080808` obsidian night sky & streets, `#8B0000` / `#A50000` crimson beacons and accents, `#F0F0F0` chalk snow, `#FFB84D` warm lantern/window lighting, `#B8E1FF` frost rim highlights) — delivering the spatial feel of being inside a moody retro/HD-2D pixel game hub district without any actual playable mini-game gimmicks.

---

## 1. Intent & Why

1. **Spatial Pixel Game Hub Experience:**  
   Replace the previous bento split layout on `/` with a cohesive **Isometric Winter Noir Pixel Town (`Seçenek A`)** where every core Restricted Studio destination and major catalog pillar is represented as an illustrated isometric pixel building with a readable hanging signboard. Visitors click buildings—just like entering buildings in a pixel game hub—to open `/katalog`, `/katalog?category=...`, `/dashboard`, `/discord`, `/status`, İtemsatış 3D Secure, or the Open-Source Engineering modal.
2. **Product Category Awareness Without Clutter:**  
   Showcase the flagship store categories (**Script Dükkânı · 3.561**, **MLO Galerisi · 1.298**, **Araç Garajı · 1.152**) alongside the **Merkez Katalog Kalesi (6.446+)** on the front street so first-time visitors immediately grasp product breadth and enter `/katalog` pre-filtered to what they need.
3. **Strict Zero-Gimmick Corporate Authority:**  
   Preserve serious Noir authority (`0% Escrow`, `0.04 ms`, `6.446+`, backdoor-free source code). No playable walking characters, WASD movement loops, Pacman Easter eggs, Ctrl+K popups, or cartoonish pastel village colors.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Desktop (`>= 901px`) Single-Screen Hub:** Fit the top HUD bar, open-sky brand marquee, full 9-building isometric street stage, and bottom RPG-style live inspector bar cleanly inside a locked `100dvh` viewport (`overflow: hidden`) with zero scrollbars.
- **Mobile (`<= 900px`, tested at `390x844`) Scrollable Storefront Grid:** Cleanly reflow the 9 buildings into a touch-friendly 2-column facade showcase grid with prominent signboards (`>= 44px` tap targets), preserving visual artwork and mobile drawer parity while allowing smooth vertical scrolling.
- **Live & Deterministic Data:** Populate counts directly from `lib/catalog-stats.json` (`total: 6446`, category breakdowns) and passively poll `/api/health` on mount so the *Sistem Durumu İstasyonu* building displays live operational status & response time without blocking initial render.
- **Zero Garbled Signage in 4 Languages:** Update all 9 signboards, tooltips, and inspector descriptions cleanly across `TR / EN / RU / FR` via TypeScript HTML overlays (`JetBrains Mono` bold uppercase at `<= 14px`, `Pixelify Sans` strictly for large headings `>= 20px`) rather than baking English/Turkish text into raster artwork.
- **Zero Boxed Photo Cutouts:** Buildings must integrate organically as **transparent-background PNG isometric sprites** sitting directly over an SVG isometric cobblestone plaza and winter pine diorama—not 9 rectangular bordered cards pasted onto a page.
- **Guaranteed Instant Rollback:** Preserve all existing backups (`backup/homepage-noir`, `backup-homepage-noir-v1`, `components/HomePageBackup.tsx` for `413f59d`) AND tag the current live pixel bento (`39930af`) as `backup-homepage-pixel-bento-v1` while keeping `components/PixelHomePage.tsx` untouched on disk so reverting `/` to either previous homepage is a one-line export switch in `app/page.tsx`.

### Non-Goals
- No WASD keyboard walking, NPC dialogue trees, quest trackers, inventory grids, or HTML5 game engines (Phaser/Pixi).
- No changes to `/katalog` visual theme (other than supporting `?category=` deep-linking), `/dashboard`, `/login`, `/register`, `/discord`, or `/status`.
- No inline script execution or external third-party CDNs outside existing allowlisted Google Fonts in `app/layout.tsx` (`middleware.ts` CSP compliance).

### Anti-Goals (Must Never Occur)
- Do **not** shrink the wide desktop isometric diorama onto a `390px` phone screen where signboards become microscopic (`< 8px`) and overlapping hitboxes fail taps.
- Do **not** use `object-fit: cover` across a single combined town image with `%` coordinate hotzones (causes building/hotspot alignment drift between `16:10` and `16:9` aspect ratios).
- Do **not** ship generated pixel sprites with dark grey rectangular bounding boxes, muddy edges, or AI-hallucinated gibberish letters painted onto rooftop signs.
- Do **not** let `html:has(.pixel-noir-shell)` in `app/globals.css` trap `< 900px` mobile screens in `overflow: hidden` if vertical facade cards exceed `100dvh`.

---

## 3. Constraints

1. **CSP & Runtime Security (`middleware.ts`, `lib/security-edge.ts`):** Render strictly with React DOM, inline `<svg>`, pure Canvas2D (`PixelWinterCanvas`), external `<img src="/assets/..." />`, and external target links with `rel="noopener noreferrer"`.
2. **Global Snow Interference (`WinterSnow.tsx`, `app/globals.css`):** `PixelTownHomePage` keeps the root class `.pixel-noir-shell` so `WinterSnow.tsx` continues suppressing smooth anti-aliased snow on `/` while stepped integer `PixelWinterCanvas` snow renders across the night town. Update `app/globals.css` lines `59-69` so `.pixel-noir-shell` locks `100dvh` + `overflow: hidden` strictly on `@media (min-width: 901px)` (allowing mobile vertical flow under `@media (max-width: 900px)` with horizontal `overflow-x: hidden`).
3. **Typography (`app/layout.tsx`):** `Pixelify Sans` (`>= 20px` display titles only, avoiding `<= 14px` uppercase Turkish `C/G/Z/Ş/İ` kerning artifacts), `JetBrains Mono` (all building signboards, telemetry pills, inspector readout), and `Inter` (modal body copy).
4. **Data Accuracy:** Never hardcode stale static numbers where `lib/catalog-stats.json` already provides `total` (`6446`) and category counts (`Script & Sistemler: 3561`, `MLO & Mekanlar: 1298`, `Araç Paketleri: 1152`).

---

## 4. Approaches Considered & Selected

- **Approach A — Fixed `100dvh` Isometric Winter Noir Hub-Town (`16:9` coordinate stage + transparent PNG building sprites + SVG cobblestone/lanterns + Bottom RPG Inspector HUD + 9-building commerce scope):** *(Selected & Approved by User)*  
  Keeps every building visible at first load without panning, puts category storefronts alongside core destinations, adapts cleanly to a scrollable 2-column facade grid on mobile, and anchors HTML signboards directly to fixed stage coordinates so percentages never drift.
- **Approach B — Horizontal Side-Scrolling Noir Street (2600px Panning):** *(Rejected)*  
  Hides half the destinations off-screen until horizontal scrolling; introduces scroll friction on standard desktop mice.
- **Approach C — Top-Down 2.5D Tactical Map + Side Inspector Panel:** *(Rejected)*  
  Roof-heavy camera angle weakens street-level shopfront signage identity compared to 3/4 isometric facades.

---

## 5. Town Architecture & 9-Building District Layout

### Desktop Spatial Wireframe (`>= 901px`, `100dvh` locked)

```text
+-------------------------------------------------------------------------+
| .px-nav: [14px Pine + RS] RESTRICTED STUDIO | [İtemsatış] | [Biz Kimiz] |
|          [Çözümler] [KATALOG] [SSS] | [TR EN RU FR] [Discord] [PORTAL]  |
+-------------------------------------------------------------------------+
|  +------------------------------+      [9] DURUM        [8] DİSCORD     |
|  | RESTRICTED STUDIO · 2026     |          İSTASYONU        KULESİ      |
|  | KARARLI ALTYAPI.             |                                       |
|  | ŞEFFAF MÜHENDİSLİK.          |  [4] MÜŞTERİ          [[1]] MERKEZ    |
|  | 6.446+ · 0.04ms · %0 Escrow  |      PORTALI             KATALOG      |
|  +------------------------------+                         KALESİ 6.446+ |
|                                                                         |
|    [5] KOD LAB          [6] İTEMSATIŞ                                   |
|        %0 ESCROW            VEZNESİ    [7a] SCRIPT  [7b] MLO  [7c] ARAÇ |
|                                             3.561       1.298     1.152 |
+-------------------------------------------------------------------------+
| .px-town-hud: [LED] > SEÇİLİ: MERKEZ KATALOG · 6.446+ Açık Kaynak Modül |
|               0.04 ms · %0 Escrow · Tüm Arşiv          [BİNAAYA GİR ->] |
+-------------------------------------------------------------------------+
```

### The 9 Interactive Buildings (`lib/pixel-town-config.ts`)

Each building has a deterministic `id`, depth row (`zIndex`), `left% / top% / width% / height%` inside the fixed `16:9` stage container (`1280 x 720` logical coordinate box), transparent sprite path, accent tone (`crimson` | `amber` | `frost`), and action target:

| # | Building ID | Row / Grid Zone (`1280x720` Logical Anchor) | Destination / Action | Default Localized Signboard (`TR`) & Badge | Sprite Subject |
|---|---|---|---|---|---|
| 1 | `status` | Upper-Right Ridge (`left: 60%`, `top: 6%`) | `<Link href="/status">` | `DURUM İSTASYONU` · Live `/api/health` (`OPERASYONEL` / ms or `AKTİF`) | Brutalist pixel telemetry relay station with blinking crimson/emerald antenna spire |
| 2 | `discord` | Far Upper-Right (`left: 79%`, `top: 8%`) | `<Link href="/discord">` | `DİSCORD KULESİ` · `7/24 DESTEK` | Tall snowy Noir watchtower with crimson beacon beam & warm amber lantern balcony |
| 3 | `portal` | Upper-Center-Left (`left: 41%`, `top: 19%`) | `<Link href="/dashboard">` | `MÜŞTERİ PORTALI` · `LİSANS` | Fortified pixel gatehouse / security terminal booth with red laser-grid gate & card reader light |
| 4 | `catalog` | Central Landmark Plaza (`left: 61%`, `top: 29%`, tallest/largest landmark) | `<Link href="/katalog">` | `MERKEZ KATALOG` · `6.446+ PAKET` | Grand Neo-Noir gothic pixel citadel HQ with crimson arched portal doors & snowy stepped roof |
| 5 | `engineering` | Mid-Left Wing (`left: 11%`, `top: 40%`) | `<button onClick={() => openModal('engineering')}>` | `KOD LAB` · `%0 ESCROW` | Heavy vault-door brick workshop with glowing code console windows & copper server vents |
| 6 | `itemsatis` | Lower-Left Plaza (`left: 29%`, `top: 46%`) | `<a href={ITEMSATIS_URL} target="_blank" rel="noopener noreferrer">` | `İTEMSATIŞ VEZNESİ` · `3D SECURE` | Exchange kiosk booth with armored teller shutter, crimson awning & shield seal |
| 7 | `scripts` | Front Commerce Row Left (`left: 48%`, `top: 56%`) | `<Link href="/katalog?category=scripts">` | `SCRIPT DÜKKÂNI` · `3.561` | Cyber-terminal storefront with glowing amber Lua screen bay window & snowy awning |
| 8 | `mlo` | Front Commerce Row Mid (`left: 66%`, `top: 57%`) | `<Link href="/katalog?category=mlo">` | `MLO GALERİSİ` · `1.298` | Modern concrete & warm-glass 2-story interior showcase studio with drafting window light |
| 9 | `vehicles` | Front Commerce Row Right (`left: 83%`, `top: 54%`) | `<Link href="/katalog?category=vehicles">` | `ARAÇ GARAJI` · `1.152` | Noir custom tuner garage bay with ribbed roll-up door open slightly showing crimson tail-lights inside |

### Isometric Stage Mechanics (Zero Drift Guarantee)
- Inside `.pixel-noir-shell`, `.px-town-viewport` fills `flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;`.
- Inside `.px-town-viewport`, `.px-town-stage` uses JavaScript/CSS uniform bounding fit or `aspect-ratio: 16 / 9` (`width: min(100%, calc((100dvh - 140px) * 16 / 9)); height: auto;`) so the `1280 x 720` stage coordinates remain proportional on `1366x768`, `1440x900`, `1920x1080`, and ultra-wide screens.
- Behind `.px-town-stage` sits a subtle radial obsidian/crimson winter mist gradient extending edge-to-edge across `.px-town-viewport`, plus the full-viewport `PixelWinterCanvas` animated snowfall overlay (`z-index: 25`, `pointer-events: none`) so snow falls seamlessly across buildings, streets, and margins.

### Ground, Roads & Holiday Props Layer (`.px-town-roads`)
Rendered cleanly as a crisp SVG layer (`viewBox="0 0 1280 720"`, `shapeRendering="crispEdges"`) beneath the 9 building sprites:
- Isometric 2:1 dimmed cobblestone lanes (`#131317` curb fill, `1px` `#2A2A32` pixel joint ticks) linking the Front Commerce Row (`scripts`, `mlo`, `vehicles`), Lower-Left (`itemsatis`, `engineering`), Central Plaza (`catalog`), and Upper Ridge (`portal`, `status`, `discord`).
- A central stepped octagon/diamond snowy plaza plinth beneath *Merkez Katalog Kalesi* with subtle crimson perimeter trim.
- 6–8 miniature pixel street lanterns (amber `#FFB84D` pixel flame + soft radial glow) along road junctions and 4 crisp pixel snow-covered pine trees (`#16201D` + `#F0F0F0` snow + `#A50000` tiny ornaments) placed intentionally in road gaps where they never occlude signboards.
- Sky Backdrop: Top sky region integrates `/assets/pixel-holiday-skyline.png` at controlled low opacity (`0.22`) masked downward with a smooth fade into `#080808` ground darkness so foreground transparent building sprites maintain high figure-ground contrast.

### Building Signboards & Interactive States
- Each building element (`<Link>` or `<button type="button">`) contains:
  1. `<img src={building.sprite} className="px-bldg-sprite" />` (`image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain;`) with subtle drop shadow (`filter: drop-shadow(...)` replaced/augmented on hover with crimson/amber rim aura).
  2. **Always-Visible Pixel Door/Eave Glow Layer:** On `:hover` / `:focus-visible` / `.is-active`, CSS reveals a crisp stepped pixel reticle bracket `[  ]` at corners + warms an under-building doorway light pool + shifts the signboard border to `#FFB84D` or `#D41C1C` and nudges the building `-3px` upward (`step-end` crisp pixel lift, respecting `prefers-reduced-motion`).
  3. **Hanging Pixel Signboard (`.px-bldg-sign`):** Positioned cleanly above/over the building's roof peak or street entrance using stepped border (`2px solid`), `#0B0B0E` obsidian plaque fill, tiny crisp 10px/12px geometric SVG icon + short uppercase `JetBrains Mono` title + compact crimson/amber count badge. At `1280px–1440px`, every signboard has at least `14px` clear gap from neighboring signboards (verified during browser screenshot audit).

### Top-Left Sky Marquee (`.px-town-marquee`)
Anchored cleanly in the top-left negative-space zone (`top: 2%`, `left: 1.5%`, max width ~`36%` of stage so it sits strictly in empty sky above `engineering` & left of `portal`):
- Compact dark pixel badge (`RESTRICTED STUDIO · YILBAŞI SÜRÜMÜ 2026`),
- Compact headline in `Pixelify Sans` (`>= 20px`): *KARARLI ALTYAPI. ŞEFFAF MÜHENDİSLİK.*,
- 3 crisp inline mono pills from stats (`6.446+ Açık Kaynak`, `0.04 ms`, `%0 Escrow`).

### Bottom RPG-Style Live Inspector HUD (`.px-town-hud`)
Anchored persistently at the bottom of `.pixel-noir-shell` (`height: 54px`, crisp `2px` pixel frame):
- Defaults on initial load to the landmark **`catalog`** building (`MERKEZ KATALOG`), and updates instantaneously on `onMouseEnter` / `onFocus` / touch selection of any of the 9 buildings.
- Displays:
  - Left: Animated 6px pixel indicator square + `[İLÇE // KATEGORİ]` eyebrow + active building title (`JetBrains Mono` bold / `Pixelify Sans` `18px`),
  - Center: Single-line crisp summary + 2 telemetry chips (e.g. `3.561 Modül · 0.00 ms Idle · %0 Escrow`),
  - Right: Primary action pill button reflecting the active building (`BİNAAYA GİR →` / modal trigger) so keyboard users or touch/hover explorers see both context and action cleanly. Also shows live `/api/health` summary latency/state whenever `status` is active or as a subtle right-side status LED.

### Mobile Responsive Transformation (`<= 900px`, tested at `390x844`)
- Isometric map stage `.px-town-stage` switches seamlessly via responsive CSS / dual-adaptive markup or CSS grid transformation into:
  - Compact top marquee banner (stacked above the buildings),
  - **2-column Touchable Pixel Storefront Grid** (`display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;`): each card displays its transparent building sprite on an obsidian night mini-plinth with starry horizon line, its full localized signboard title, badge (`3.561`, `6.446+`, etc.), short 1-line subtitle, and clear full-card click target (`catalog` spanning full 2 columns at the top as Hero Citadel landmark!).
  - Compact mobile inspector bar or top/bottom sticky summary bar is omitted/replaced inline by each card's explicit label + subtitle so mobile users don't get stuck hovering; vertical scroll unlocks cleanly (`height: auto; overflow-y: auto`) under `@media (max-width: 900px)`.

### Navigation Bar & Modals Parity (`.px-nav`, `px-modal-backdrop`)
- Keep `.px-nav` actions (`about`, `solutions`, `/katalog`, `faq`, `<LanguageSwitcher compact />`, Discord link, `/dashboard` Customer Portal pill, and full `.px-mobile-drawer`). Note: `engineering` modal stays directly accessible from clicking **KOD LAB** building AND inside `.px-nav` / `.px-mobile-drawer`.
- Reuse the accessible focus-trapped modal system from `components/PixelHomePage.tsx` (`about`, `solutions`, `engineering`, `faq` with `Escape` close, `Tab` trap, focus restore).

---

## 6. `/katalog?category=...` Deep Linking & Shared Helpers

1. **Pure Helper `lib/catalog-query.ts`:**  
   Export `resolveCatalogCategoryParam(raw: string | null | undefined): CatalogCategoryKey | null` mapping canonical ASCII slugs AND exact category strings safely:
   - `'scripts' | 'script' | 'Script & Sistemler'` → `'Script & Sistemler'`
   - `'mlo' | 'maps' | 'Mekanlar' | 'MLO & Mekanlar'` → `'MLO & Mekanlar'`
   - `'vehicles' | 'cars' | 'arac' | 'Araç Paketleri'` → `'Araç Paketleri'`
   - `'eup' | 'clothing' | 'kiyafet' | 'Kıyafet & EUP'` → `'Kıyafet & EUP'`
   - `'mods' | 'modlar' | 'Modlar & Eklentiler'` → `'Modlar & Eklentiler'`
   - `'tools' | 'program' | 'Program & Araçlar'` → `'Program & Araçlar'`
   - Case-insensitive normalized match; returns `null` for unknown/empty values (safely falling back to `'Tümü'`).
2. **Integrate into `app/katalog/page.tsx`:**  
   In the existing `URLSearchParams(window.location.search)` `useEffect` (lines `193-204`), read `const catParam = params.get('category');` and if `resolveCatalogCategoryParam(catParam)` returns a match, call `setSelectedCategory(matchedCategory)`.

---

## 7. Custom Sprite Production & Post-Processing Pipeline

1. **Generate 9 Isometric Pixel Building Illustrations via `image-generator`:**  
   Prompt requirements for all 9 assets (can run in parallel batches):
   - Perspective: Strict **3/4 isometric view**, front-left & front-right facades visible, top snowy flat/stepped roof.
   - Background: **100% solid pure black (`#000000`) void**, ZERO sky gradient, ZERO ground rectangle extending to image edges, ZERO ground fog blobs touching frame borders — only the isolated isometric building + tiny immediate base plinth inside frame center with breathing margin around all 4 edges.
   - Style: Modern gritty HD-2D dark Noir pixel art (`Eastward` / `Katana ZERO` night palette: deep obsidian charcoal masonry `#121216`–`#282830`, chalk snow `#EAEAEF` on roof ledges, selective glowing `#A50000` crimson signage accents & warm `#FFB84D` tungsten window glows). **STRICTLY ZERO TEXT OR LETTERS IN THE ARTWORK** (signboards are rendered via crisp HTML/CSS over the sprite).
2. **Deterministic Transparency & Crisp Pixel Processing (`scripts/process-pixel-sprites.py`):**  
   Write a reproducible Python Pillow script using corner-seeded flood-fill + distance-based dark halo cleanup:
   - Reads raw generated image, flood-fills from `(0, 0)` and outer edge pixels (`rgb <= tolerance`, plus anti-fringed smooth alpha falloff across outer perimeter pixels so edges blend cleanly into `#080808` without white/grey halos),
   - Trims excess empty transparent margin (`bbox` crop with consistent bottom-center alignment padding),
   - Saves optimized crisp RGBA PNGs to `public/assets/town/<building-id>.png` (`status.png`, `discord.png`, `portal.png`, `catalog.png`, `engineering.png`, `itemsatis.png`, `scripts.png`, `mlo.png`, `vehicles.png`).
3. **Visual Quality Gate:** Inspect EVERY processed PNG via `read_file` before integrating; regenerate/adjust threshold if any interior dark walls become transparent OR outer black background box remains visible.

---

## 8. File Map & Component Architecture

| File | Role | Action |
|---|---|---|
| `components/PixelTownHomePage.tsx` | New 9-building Isometric Winter Noir Town Hub client component (top nav, sky marquee, SVG isometric road/lantern layer, 9 building hotspots with localized signboards, bottom RPG inspector HUD, `/api/health` poll, focus-trapped modals, mobile facade cards) | **Create** |
| `lib/pixel-town-config.ts` | Static coordinate anchors (`x, y, w, h, zIndex`), action types (`route` / `modal` / `external`), building icon tokens, and helper to derive localized labels/stats from `catalog-stats.json` & `translations.ts` | **Create** |
| `lib/catalog-query.ts` | Pure URL `?category=` slug resolver (`resolveCatalogCategoryParam`) | **Create** |
| `app/pixel-town.css` | Dedicated stylesheet scoped cleanly under `.pixel-town-shell` / `.pixel-noir-shell` for town stage coordinates, transparent sprite shadows, hover beacon beams, signboards, inspector HUD, and mobile 2-column storefront grid | **Create** |
| `scripts/process-pixel-sprites.py` | Corner-seeded transparency extractor & trim script using Python `PIL` (`Pillow`) | **Create** |
| `public/assets/town/*.png` | 9 processed RGBA transparent isometric pixel building sprites | **Create** |
| `scripts/test-pixel-town.mjs` | Unit tests covering `resolveCatalogCategoryParam`, building config integrity across all 9 lots, and 4-locale town translation key parity (`tr`, `en`, `ru`, `fr`) | **Create** |
| `lib/translations.ts` | Add `home.town` block to `TranslationDictionary` across all 4 locales (`tr`, `en`, `ru`, `fr`) | **Modify** |
| `app/katalog/page.tsx` | Parse `?category=` via `resolveCatalogCategoryParam` on initial mount | **Modify** |
| `app/globals.css` | Refine `html:has(.pixel-noir-shell)` viewport lock rule to `@media (min-width: 901px)` so mobile `< 900px` scrolls cleanly if 9-card grid exceeds viewport height, while preserving desktop `100dvh` lock and global `<WinterSnow />` suppression | **Modify** |
| `app/page.tsx` | Switch root homepage export from `PixelHomePage` to `PixelTownHomePage` (keeping `PixelHomePage.tsx` and `HomePageBackup.tsx` intact for instant rollback) | **Modify** |

---

## 9. Architect's Engineering Calls (For User Visibility)

The following implementation details were resolved cleanly on your behalf (all straightforward to adjust):
1. **Live Backup Safety:** Before editing any files, tag `39930af` as `backup-homepage-pixel-bento-v1` (and push the tag alongside the existing `backup/homepage-noir` -> `413f59d`) and leave `components/PixelHomePage.tsx` untouched so reverting between Desktop Bento (`413f59d`), Pixel Split (`39930af`), and Pixel Town (`new`) remains trivial.
2. **Default Selected Building on Page Load:** Pre-select **`catalog` (`MERKEZ KATALOG`)** in the bottom RPG Inspector HUD on initial desktop load so the bottom bar shows real data (`6.446+ Modül · 0.04 ms`) right away instead of an empty "Hover over a building" placeholder.
3. **HTML/SVG Signboards vs. Painted Text:** Generate text-free building illustrations and render all building signboards cleanly in code using `JetBrains Mono` bold plaques so `TR / EN / RU / FR` language switching updates every street sign live with crisp character shapes.
4. **Mobile Vertical Flow vs. Cramped Clip:** Switch `< 900px` viewports from hard `overflow: hidden` to vertical scrolling over a 2-column storefront grid (keeping `Merkez Katalog` full-width at top) so all 9 buildings remain large, legible, and comfortably tappable on `390x844` phones.
5. **Non-Blocking Live Status Poll:** Passively call `/api/health` once after mount to enrich the `SİSTEM DURUMU İSTASYONU` building badge (`OPERASYONEL` + latency ms) without delaying SSR/first paint.

---

## 10. Verification & Testing Plan

1. **Automated Unit Tests:**  
   Run `node --experimental-strip-types --test scripts/test-pixel-town.mjs scripts/test-pixel-home.mjs` to validate `?category=` slug parsing, town coordinate bounds, and translation dictionary parity across `tr`, `en`, `ru`, and `fr`.
2. **Typecheck & Production Build:**  
   Run `npx tsc --noEmit` and `npm run build` (`next build`) and confirm exit status `0` with zero warnings breaking static/dynamic routes.
3. **Headless Browser & Responsive Visual Verification:**  
   Launch Next.js production server (`npm run start`) and capture rendered screenshots across:
   - `1440x900` desktop default + hovered building state + open modal state (`engineering`),
   - `1366x768` smaller laptop viewport (confirm zero signboard overlap, zero vertical clipping inside `100dvh`),
   - `390x844` mobile viewport (confirm zero horizontal overflow, clean 2-column storefront facades, working mobile drawer).
   Verify `/katalog?category=scripts` navigation pre-selects `Script & Sistemler`, check zero `console.error` / `pageerror` / broken image `naturalWidth === 0` logs, and inspect screenshots directly via `read_file`.
