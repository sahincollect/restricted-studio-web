# Design Specification: Kış Noir Modern Pixel Art Homepage & Safe Rollback

**Date:** 2026-11-14  
**Scope:** Homepage (`/`, `app/page.tsx`) redesign + guaranteed single-step rollback to `413f59d`  
**Target Aesthetic:** Modern HD-2D / Indie Pixel Art (*Eastward / Katana ZERO / Celeste* winter atmosphere) anchored to Restricted Studio's Kış Noir palette (`#080808` obsidian, `#A50000` crimson, `#F0F0F0` chalk snow, `#FFB84D` warm lantern amber, `#B8E1FF` frost highlight).

---

## 1. Intent & Constraints

1. **Full Visual & Structural Overhaul from Scratch ("sıfırdan"):**  
   Rebuild the homepage presentation layer from the ground up into a cohesive, modern **Winter Holiday Pixel Art** experience while preserving 100% of functional routes, catalog stats, modals, and `TR / EN / RU / FR` multi-language support.
2. **Guaranteed Instant Rollback:**  
   Before modifying any source code on `/`, freeze the pre-change homepage (`413f59d`) with:
   - Git branch `backup/homepage-noir` and annotated tag `backup-homepage-noir-v1` pointing to `413f59d`.
   - Verbatim component snapshot `components/HomePageBackup.tsx` plus zero edits to legacy `.bento-*`, `.bcm-*`, `.showcase-*`, `.device-*` rules in `app/globals.css`.
   - Isolated new homepage components (`components/PixelHomePage.tsx`, `components/PixelWinterCanvas.tsx`, `components/PixelCoreMonitor.tsx`) and scoped stylesheet (`app/pixel-home.css`).
   - Result: Reverting `/` to the exact prior Bento Noir layout requires either restoring `app/page.tsx` to `HomePageBackup` (1-line change) or checking out `backup/homepage-noir -- app/page.tsx`, without affecting `/katalog`, `/dashboard`, `/status`, `/login`, `/register`, or `/discord`.
3. **Zero Gimmicks / Corporate Discipline:**  
   Do not add playable mini-games, Ctrl+K popups, F8 debug consoles, or childish cartoon clutter. All holiday touches serve atmospheric pixel craft and product authority.
4. **Strict CSP & Viewport Lock:**  
   - Must work under `middleware.ts` strict CSP nonce rules (`<img />`, pure Canvas2D, CSS styling, Google Fonts already allowlisted in `app/layout.tsx`).
   - Desktop (`1440x900`, `1366x768`) and mobile (`390x844`) stay strictly locked within `100dvh` (`overflow: hidden`) with zero horizontal overflow (`scrollWidth <= innerWidth`), using `.pixel-noir-shell` alongside updated `:has(.pixel-noir-shell)` viewport lock rules in `app/globals.css`.
5. **Multilingual Glyph Integrity:**  
   Load `Pixelify Sans` (supports `latin`, `latin-ext` including Turkish `ÇĞİÖŞÜçğıöşü`, `cyrillic` for Russian, and French accents) alongside `JetBrains Mono` so Turkish/Russian/French display titles and telemetry tags render crisply with zero fallback font mismatches.

---

## 2. Approaches Considered & Selected

- **Selected Approach — Kış Noir Pixel + Zero-Scroll Single Screen + Custom HD-2D Pixel Art Assets + Interactive Pixel HUD:**  
  Maintains Restricted Studio's dark obsidian/crimson visual DNA across the site while giving `/` unmistakable winter pixel craftsmanship: stepped pixel bevel borders, quantized dithered backdrops, animated Canvas2D pixel snowfall/ember glints, stepped pixel telemetry waveforms, and custom crisp HD-2D holiday citadel/vault/beacon pixel illustrations.
- **Rejected Alternatives:**
  1. *Warm Navy/Green Cozy Village:* Breaks brand continuity with `/katalog`, `/dashboard`, and `/status`.
  2. *Scrollable Panoramic World:* Loses the signature zero-scroll entrance impact requested for desktop/mobile lock.
  3. *Pure CSS/SVG Geometry Only:* Lacks the handcrafted lighting, brick dithering, pine silhouettes, and architectural depth of modern HD-2D pixel scenes.

---

## 3. Spatial Architecture & Page Zones

```text
+------------------------------------------------------------------------+
| HEADER (.px-nav): [16px Pixel Tree + RS Logo] RESTRICTED STUDIO        |
|   [İtemsatış Badge]   BİZ KİMİZ · ÇÖZÜMLER · KATALOG · MÜHENDİSLİK · SSS|
|   [TR EN RU FR]  [Search]  [İtemsatış]  [Discord]  [MÜŞTERİ PORTALI ->] |
+------------------------------------+-----------------------------------+
| HERO PIXEL SCENE (.px-hero)        | PIXEL CORE HUD (.px-core)         |
|  * RESTRICTED STUDIO · YILBAŞI 2026|  [RS] RESTRICTED CORE             |
|  Background: pixel-holiday-citadel |       [AKTİF · v3.4]              |
|  Overlay: Canvas2D pixel snow +    |  Benchmark: STANDBY | PROD |STRESS|
|  warm crimson/amber pixel glints   |  4 KPI: 0.04ms | 1.1ms | %0 |6.446|
|  Headline (Pixelify Sans)          |  PIXEL-STEPPED CAPACITY GRAPH     |
|  Subhead (6.446+ open source)      |  (Quantized stair-step SVG +      |
|  [KATALOĞU KEŞFET ->] [İTEMSATIŞ]  |   glowing square pixel peak marker|
|  6.446+ | 0.04 ms | %100           |   over subtle core winter pixel bg|
+------------------+-----------------+  ARCHIVE SEGMENTED PIXEL BARS     |
| TWIN CARD 1      | TWIN CARD 2     |  & CORPORATE STANDARD + CTAs      |
| pixel-vault art  | pixel-beacon art|  [KATALOĞU AÇ ->] [SİSTEM DURUMU] |
| ŞİFRESİZ KOD     | DISCORD         |                                   |
+------------------+-----------------+-----------------------------------+
```

### Zone Breakdown

1. **Pixel Navigation Frame (`.px-nav`):**
   - Double-stepped crisp pixel frame (`2px solid rgba(240,240,240,0.28)` + crimson corner pixels `::before/::after` accents, zero rounded corners).
   - Minimal 14x14 pixel pine-with-crimson-star SVG glyph beside `/assets/rslogo.jpg` brand block (subtle holiday signature in the chrome without clutter).
   - Preserves all desktop nav items (`about`, `solutions`, `/katalog`, `engineering`, `faq`), compact `<LanguageSwitcher compact />`, search link, İtemsatış link, Discord link, Customer Portal button, and full mobile drawer.

2. **Hero Architectural Winter Pixel Stage (`.px-hero`):**
   - **Generated Asset:** `/assets/pixel-holiday-citadel.png` — Modern dark pixel art winter citadel/monolith coated in fresh pixel snow under an angled crimson skylight beam, glowing warm amber tower windows and subtle crimson festive garlands; strictly framed on the right/background with deep `#080808` negative space on the left so headline contrast remains `> 10:1`.
   - **Live Canvas Layer (`PixelWinterCanvas` & Smooth Snow Suppression):**  
     `PixelWinterCanvas` renders full-viewport (`position: absolute; inset: 0; pointer-events: none` across `.pixel-noir-shell`) using strict integer pixel-snapped `2px`/`3px` square snow crystals and subtle twinkling warm amber/crimson window sparks concentrated over `.px-hero` and `.px-core` (plus coarse `16px` grid-quantized cursor lantern illumination).  
     To prevent `app/layout.tsx`'s global smooth anti-aliased `<WinterSnow />` (`ctx.arc` + rotated lines) from overlapping `/` with non-pixel circles, `WinterSnow.tsx` skips drawing while `.pixel-noir-shell` exists in DOM (reinforced by a CSS rule under `html:has(.pixel-noir-shell)` in `app/pixel-home.css`), restoring normal `<WinterSnow />` immediately on other routes and on rollback without editing `app/layout.tsx`.
   - **Holiday Eyebrow Badge:** Pixel-stepped badge showing localized `"RESTRICTED STUDIO · YILBAŞI PIXEL 2026"` (`tr`, `en`, `ru`, `fr` cleanly added to `lib/translations.ts` or reusing `home.hero.eyebrow` cleanly updated for this edition).
   - **Typography & CTAs:** Display headline in `Pixelify Sans`, subtitle in `Inter`, dual tactile pixel-bevel buttons (primary chalk/crimson button with hard 2px pixel shadow shift on hover/active, secondary obsidian steel-framed button), inline KPIs.

3. **Twin Lower Pixel Feature Cards (`.px-sub-row`):**
   - **Card 1 (`Şifresiz Kod` / opens `engineering` modal):** Uses `/assets/pixel-holiday-vault.png` (modern pixel art snow-frosted vault gate + glowing open-source script terminal in `#080808 / #A50000 / #F0F0F0 / #FFB84D`). Rendered with `image-rendering: pixelated` and crimson bevel accent.
   - **Card 2 (`Discord` / links to `/discord`):** Uses `/assets/pixel-holiday-beacon.png` (modern pixel art lonely hooded figure on a snowy ridge facing a glowing crimson winter lighthouse beacon). Rendered with `image-rendering: pixelated` and chalk bevel accent.

4. **Right Column: `PixelCoreMonitor` (`.px-core`):**
   - Replaces the glossy wireframe `MonolithStage` backdrop on `/` with an atmospheric dark winter pixel skyline backdrop (`/assets/pixel-holiday-skyline.png` at controlled dark opacity + subtle pixel scanline/snow drift) behind a redesigned pixel-art tactical HUD (`PixelCoreMonitor.tsx`).
   - Interactive load profile switchers (`STANDBY 0P`, `PROD 128P`, `STRESS 256P`) drive:
     - 4 pixel KPI tiles (`0.04 ms`, `1.1 ms`, `0%`, `6.446+`) with crisp stepped separators.
     - **Quantized Step-Area Capacity Chart:** Converts telemetry into crisp orthogonal stair-step `<path>` geometry (`M ... H ... V ...`) with crimson dithered/hatched SVG fill pattern and a pulsing 6px square pixel apex marker (replacing the rounded circle/smooth spline).
     - **Pixel-Segmented Progress Bars:** Category breakdown bars rendered with 4px stepped pixel tick segments (`repeating-linear-gradient` mask) over `#A50000`.
     - Bottom CTA row linking to `/katalog` and `/status`.

5. **In-Viewport Modals (`about`, `solutions`, `engineering`, `faq`):**
   - Preserved cleanly inside `PixelHomePage.tsx` with sharp pixel-beveled modal chrome (`.px-modal-panel`, crisp 2px pixel border + offset hard shadow) matching the rest of the screen.

6. **Custom Art Production & Asset Verification:**
   - Generate the 4 pixel-art images via `image-generator` with strict prompts specifying modern indie HD-2D pixel art, crisp square pixel clusters, limited obsidian/crimson/snow/amber palette, zero blurry painting/photorealism, and clean dark left vignette for readable UI typography.
   - Visually inspect each generated image using `read_file`, regenerate if blurry/muddy/text-corrupted, then resize & optimize cleanly into `public/assets/pixel-holiday-*.png` (crisp nearest-neighbor / integer downscale so pixel edges remain razor-sharp).

7. **Mobile (`390x844`) Zero-Scroll Budget & Interactive Parity:**
   - Compacts cleanly into `100dvh` (`overflow: hidden`) using a 2-row grid (`minmax(0, 1.38fr) minmax(0, 0.70fr)`):
     - **Top row:** Compact `.px-hero` (`pixel-holiday-citadel.png` preserved at `opacity: 0.48`, headline + concise subhead + dual CTA buttons; inline 3-stat strip hidden on mobile because the stats appear in `.px-core`) + twin lower sub-cards (`pixel-holiday-vault.png` and `pixel-holiday-beacon.png` remain mounted and visible inside compact frames).
     - **Bottom row (`.px-core` compact horizontal HUD):** Keeps `/assets/pixel-holiday-skyline.png` behind the frame; Left pane holds brand title, compact `/status` link pill, and the 3-metric compact grid (`0.04 ms / 0% / 6.446+`); Right pane keeps the compact `STANDBY / PROD / STRESS` pill switcher **interactive** right above the quantized stair-step SVG capacity graph, while desktop-only extras (detailed 4-KPI subtitles, archive breakdown bars, SLA list, desktop bridge footer) collapse cleanly at `<= 980px`.

---

## 4. Verification Criteria

- **Backup Verification:** Verify `git show-ref backup/homepage-noir` and `git tag -l backup-homepage-noir-v1` resolve to `413f59d`, and confirm `/katalog`, `/dashboard`, `/status` diffs are empty (`git diff -- components/StatusBoard.tsx ...`).
- **Build & Type Safety:** `npx tsc --noEmit` and `npm run build` pass cleanly with exit code 0.
- **Browser Visual & Functional Verification (Headless Edge CDP):**
  - Render `/` at `1440x900`, `1366x768`, and `390x844` in `tr` and `en`.
  - Assert zero horizontal AND zero vertical overflow (`scrollWidth <= innerWidth` and `scrollHeight <= innerHeight`).
  - Assert zero console errors, zero uncaught exceptions, all 4 `pixel-holiday-*.png` images loaded (`complete && naturalWidth > 0`), telemetry profile toggle (`STANDBY` / `STRESS 256P`) updates DOM values cleanly, global smooth `<WinterSnow />` does not paint circles over `/`, and clicking `Şifresiz Kod` / nav buttons opens & closes pixel modals properly.
  - Capture screenshots and inspect them with `read_file` to verify crisp readability, pixel art cohesion, balanced composition, and zero clipped text.
