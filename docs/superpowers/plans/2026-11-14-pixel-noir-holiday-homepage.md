# Kış Noir Modern Pixel Art Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Freeze a guaranteed single-step backup of the existing Bento Noir homepage (`413f59d`) and rebuild `/` from scratch in an isolated Kış Noir Modern Pixel Art architecture (`#080808` obsidian, `#A50000` crimson, `#F0F0F0` chalk snow, `#FFB84D` lantern amber) that works cleanly on desktop (`1440x900`, `1366x768`) and mobile (`390x844`) with zero scrollbars and zero impact on other routes.

**Architecture:** Isolate the new homepage into dedicated files (`components/PixelHomePage.tsx`, `components/PixelWinterCanvas.tsx`, `components/PixelCoreMonitor.tsx`, `app/pixel-home.css`, and `public/assets/pixel-holiday-*.png`) while preserving `413f59d` via Git branch `backup/homepage-noir`, annotated tag `backup-homepage-noir-v1`, and `components/HomePageBackup.tsx`. Suppress global smooth circle snowfall (`WinterSnow`) only when `.pixel-noir-shell` is mounted in the DOM so rolling back `app/page.tsx` automatically restores every visual behavior without editing subpages or `globals.css` bento sections.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Grid + custom crisp pixel bevel rules, pure Canvas2D pixel particle rendering, Google Fonts `Pixelify Sans` + `JetBrains Mono` (strict-CSP compatible), headless Microsoft Edge CDP verification.

**Spec:** `docs/superpowers/specs/2026-11-14-pixel-noir-holiday-homepage-design.md`

## Global Constraints
- Palette lock: `#080808` obsidian, `#A50000` / `#8B0000` crimson, `#F0F0F0` chalk snow white, with restrained `#FFB84D` warm holiday lantern amber and `#B8E1FF` frost accents.
- Zero gimmicks: no mini-games, Ctrl+K popups, or F8 debug overlays.
- Viewport lock: both desktop (`1440x900`, `1366x768`) and mobile (`390x844`) must satisfy `scrollWidth <= innerWidth` and `scrollHeight <= innerHeight` (`100dvh`, `overflow: hidden`).
- Strict CSP compliance: no inline event handlers or third-party runtime animation libraries; fonts loaded strictly from existing `fonts.googleapis.com` link in `app/layout.tsx`.
- Full i18n parity (`tr`, `en`, `ru`, `fr`) using existing `TRANSLATIONS` and `INTERACTIVE_I18N` with Cyrillic + Turkish glyph coverage (`Pixelify Sans` + `JetBrains Mono` + `Inter`).
- Zero regressions or unintended changes on `/katalog`, `/dashboard`, `/status`, `/login`, `/register`, and `/discord`.

## Review Focus
1. **Smooth vs. Pixel Snow Collision on `/`:** Global `<WinterSnow />` in `app/layout.tsx` renders anti-aliased circles at `zIndex: 45` over all routes; it must stay hidden on `/` while `.pixel-noir-shell` exists and automatically resume when navigated away or rolled back.
2. **Hero Left-Side Contrast Against Pixel Citadel Art:** Bright snow/lantern pixels must stay framed on the right (`>= 45%`) fading into pure `#080808` on the left so white headlines and subtitles exceed crisp legibility contrast.
3. **Turkish & Russian Glyph Fallback:** Display headlines (`ŞİFRESİZ KOD`, `YÜKSEK PERFORMANS`, `MÜŞTERİ PORTALI`, Cyrillic strings) must render crisply in `Pixelify Sans` without falling back mid-word to Arial/sans-serif glyphs.
4. **Desktop & Mobile `100dvh` Overflow / Clipping:** Even under tight desktop (`1366x768`) and mobile (`390x844`) viewports, CTA buttons, twin cards, and `PixelCoreMonitor` (`STANDBY / PROD / STRESS` toggle + stepped chart) must fit without vertical scroll or clipped controls.
5. **1-Line Lossless Rollback Fidelity:** Switching `app/page.tsx` back to `HomePageBackup` (or checking out `backup/homepage-noir -- app/page.tsx`) must restore the exact prior UI cleanly without stale CSS overrides.

---

### Task 1: Freeze Homepage Backup Snapshot (`backup/homepage-noir`)

**Files:**
- Create: `components/HomePageBackup.tsx` (verbatim copy of current `app/page.tsx`)

**Interfaces:**
- Produces: Git branch `backup/homepage-noir`, annotated tag `backup-homepage-noir-v1`, component `components/HomePageBackup.tsx` (`export default function HomePageBackup()`).

- [ ] **Step 1: Create Git backup branch & annotated tag at current commit `413f59d`**

Run in `C:\Users\yesah\OneDrive\Desktop\restricted-studio-web`:
```powershell
git branch backup/homepage-noir 413f59d
git tag -a backup-homepage-noir-v1 413f59d -m "Pre-pixel-art Noir Bento homepage snapshot"
git show-ref backup/homepage-noir
git tag -l backup-homepage-noir-v1
```
Expected: both refs print `413f59d...`.

- [ ] **Step 2: Create verbatim component backup `components/HomePageBackup.tsx`**

Copy current `app/page.tsx` into `components/HomePageBackup.tsx` (renaming only the default exported symbol to `HomePageBackup` if desired, leaving every JSX element and legacy Bento class intact).

- [ ] **Step 3: Type-check and commit the backup snapshot**

Run:
```powershell
npx tsc --noEmit
git add components/HomePageBackup.tsx
git commit -m "backup: snapshot pre-pixel-art Noir Bento homepage"
```
Expected: exit code 0, clean git status.

---

### Task 2: Generate & Verify Custom HD-2D Winter Pixel Art Assets

**Files:**
- Create: `public/assets/pixel-holiday-citadel.png`
- Create: `public/assets/pixel-holiday-vault.png`
- Create: `public/assets/pixel-holiday-beacon.png`
- Create: `public/assets/pixel-holiday-skyline.png`

**Interfaces:**
- Produces: 4 verified static raster images served under `/assets/pixel-holiday-*.png` with crisp pixel clusters and dark obsidian vignettes.

- [ ] **Step 1: Generate all 4 pixel art scenes via `image-generator` subagents**

Dispatch parallel `image-generator` tasks specifying modern indie HD-2D pixel art (*Eastward / Katana ZERO* crisp pixel clusters, zero text/words, zero watermarks, strictly locked color palette):
1. `pixel-holiday-citadel`: wide landscape (`16:9` / `1024x576`), modern dark pixel-art obsidian citadel tower and snowy gothic gable roof positioned strictly on the right half under a diagonal crimson skylight beam (`#A50000`), tiny glowing golden amber lantern windows (`#FFB84D`), frost pine silhouettes, soft falling pixel snow; solid `#080808` obsidian negative space on the left half for clean UI text overlay.
2. `pixel-holiday-vault`: square/landscape scene (`800x520`), modern indie pixel-art snow-frosted steel server vault gate half-open revealing glowing crimson hardware blades (`#A50000`) and a tiny holiday wreath/warm amber console light (`#FFB84D`) in `#080808` dark noir framing.
3. `pixel-holiday-beacon`: landscape scene (`800x520`), modern indie pixel-art lone cloaked figure standing on a snow-drifted pixel ridge looking toward a monumental obsidian lighthouse tower projecting a diagonal crimson searchlight (`#A50000`) and golden beacon core (`#FFB84D`) against starry night sky.
4. `pixel-holiday-skyline`: tall portrait/vertical architectural strip (`720x960`), subtle dark `#080808` snowy industrial server monolith skyline with minimal crimson aircraft warning pixel beacons, soft icy blue highlights, and warm pixel apartment dots cleanly dimmed for background HUD legibility.

- [ ] **Step 2: Visually inspect every generated image via `read_file` and verify crispness/palette**

Inspect all 4 generated files with `read_file`. Reject and regenerate any image containing embedded words/gibberish text, bright left-side clutter over hero text area, or blurry painterly gradients instead of clean pixel blocks.

- [ ] **Step 3: Copy & nearest-neighbor optimize final assets into `public/assets/pixel-holiday-*.png`**

Use a short Node/Python image script (nearest-neighbor downscale to crisp pixel resolution such as `640x360` / `480x320` so `image-rendering: pixelated` produces ultra-sharp pixel clusters at small bundle size) and save into `public/assets/pixel-holiday-*.png`. Re-verify dimensions and file sizes, then commit assets:
```powershell
git add public/assets/pixel-holiday-*.png
git commit -m "assets: add custom modern winter pixel art scenes for homepage"
```

---

### Task 3: Configure Pixel Typography & Non-Destructive Smooth-Snow Suppression

**Files:**
- Modify: `app/layout.tsx:130-136`
- Modify: `components/WinterSnow.tsx:24-40,143-155`
- Modify: `app/globals.css:54-66`

**Interfaces:**
- Consumes: CSS selector `.pixel-noir-shell`.
- Produces: Google Font `--font-pixel: 'Pixelify Sans'` available cleanly; `WinterSnow` renders smooth snow everywhere except when `.pixel-noir-shell` is active in DOM.

- [ ] **Step 1: Add `Pixelify Sans` (`cyrillic` + `latin-ext` + `latin`) to `app/layout.tsx` `<head>` font stylesheet**

Edit the existing `fonts.googleapis.com/css2?...` `<link>` in `app/layout.tsx` line 133 to include `&family=Pixelify+Sans:wght@400;500;600;700`, and define `--font-pixel` CSS custom property in `app/globals.css`.

- [ ] **Step 2: Guard `WinterSnow.tsx` against `.pixel-noir-shell`**

In `components/WinterSnow.tsx`, add `className="global-winter-snow"` to the rendered `<canvas>` and inside `render()` check `if (isVisible && !document.querySelector('.pixel-noir-shell'))` (calling `ctx.clearRect(0, 0, width, height)` when `.pixel-noir-shell` is present so switching between `/` and `/katalog` transitions seamlessly in client navigation!).

- [ ] **Step 3: Extend root viewport lock selector in `app/globals.css` (`lines 54-66`)**

Add `html:has(.pixel-noir-shell), html:has(.pixel-noir-shell) body` to the viewport-lock rule alongside `.noir-entrance-shell` AND add `html:has(.pixel-noir-shell) .global-winter-snow { display: none !important; }` cleanly. Verify subpages remain untouched.

- [ ] **Step 4: Run `npx tsc --noEmit` and commit**

Run:
```powershell
npx tsc --noEmit
git add app/layout.tsx components/WinterSnow.tsx app/globals.css
git commit -m "chore: load Pixelify Sans and isolate smooth WinterSnow from pixel homepage"
```

---

### Task 4: Build Interactive Pixel Canvas & `PixelCoreMonitor` Components

**Files:**
- Create: `components/PixelWinterCanvas.tsx`
- Create: `components/PixelCoreMonitor.tsx`

**Interfaces:**
- Produces:
  - `export default function PixelWinterCanvas(): React.JSX.Element`
  - `export default function PixelCoreMonitor(): React.JSX.Element`
- Consumes: `useI18n()` (`INTERACTIVE_I18N[locale].showcase`, `t`), `catalogStats` from `@/lib/catalog-stats.json`.

- [ ] **Step 1: Implement `components/PixelWinterCanvas.tsx`**

Build a crisp Canvas2D overlay (`className="px-snow-canvas"`, `aria-hidden="true"`, `image-rendering: pixelated`) positioned inside `.pixel-noir-shell`:
- Draws integer-snapped `2px`/`3px` chalk white (`#F0F0F0`) and frost blue (`#B8E1FF`) pixel flakes moving cleanly in stepped subpixel columns + twinkling 2px warm amber/crimson star pixels (`#FFB84D`, `#A50000`).
- Pointer listener tracks cursor position and draws a quantized `16px` grid-snapped soft crimson pixel illumination halo when pointer hovers interactive panes (disabled on touch/coarse pointers or `prefers-reduced-motion`).
- Automatically pauses on `document.visibilityState !== 'visible'`.

- [ ] **Step 2: Implement `components/PixelCoreMonitor.tsx`**

Build the right-column tactical pixel telemetry monitor reusing `INTERACTIVE_I18N[locale].showcase` strings across `tr`, `en`, `ru`, `fr`:
- Load profile buttons (`idle`, `128p`, `256p`) labeled cleanly with localized `STANDBY · 0P`, `PROD · 128P`, `STRESS · 256P`.
- **Quantized Stair-Step Capacity SVG (`capacity-step-svg`):** Converts each load profile into sharp orthogonal stair-step `<path>` geometry (`H ... V ...`) with an SVG `<pattern>` hatched pixel crimson fill (`crimsonPixelHatch`) and a pulsing `6x6` crisp pixel square peak marker (`<rect />` instead of `<circle />`).
- **4-Column KPI Strip & Pixel-Segmented Archive Progress Bars:** Clean `4px` segmented progress fill bars for top 3 categories, SLA list (`0% ESCROW`), dual CTA links (`/katalog`, `/status`).
- **Mobile (`<= 980px`) Compact Parity Bar:** Preserves compact summary metrics, `/status` link pill, AND interactive `STANDBY / PROD / STRESS` buttons right above the stair-step capacity graph so toggling load profiles works on mobile `390x844` too.

- [ ] **Step 3: Type-check & commit Task 4**

Run:
```powershell
npx tsc --noEmit
git add components/PixelWinterCanvas.tsx components/PixelCoreMonitor.tsx
git commit -m "feat: add PixelWinterCanvas and PixelCoreMonitor components"
```

---

### Task 5: Build `PixelHomePage.tsx`, `app/pixel-home.css` & Wire `app/page.tsx`

**Files:**
- Create: `app/pixel-home.css`
- Create: `components/PixelHomePage.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PixelWinterCanvas`, `PixelCoreMonitor`, `ItemsatisLogo`, `LanguageSwitcher`, `useI18n()`, `catalogStats`.
- Produces: Scoped `.pixel-noir-shell` homepage rendered cleanly from `app/page.tsx` importing `./pixel-home.css`.

- [ ] **Step 1: Author scoped pixel aesthetic stylesheet `app/pixel-home.css`**

Write strictly scoped CSS classes (`.pixel-noir-shell`, `.px-nav`, `.px-grid`, `.px-hero`, `.px-card`, `.px-core`, `.px-modal`, `.px-drawer`):
- Pixel bevel panel borders (`border: 2px solid ...`, hard `4px 4px 0` shadow offsets, zero border-radius).
- Stepped tactile hover translations (`translate(-2px, -2px)` + offset shadow growth) on pixel buttons and twin cards.
- Crisp `image-rendering: pixelated` styling + left obsidian gradient vignette (`linear-gradient(90deg, #080808 0%, rgba(8,8,8,0.92) 44%, rgba(8,8,8,0.28) 100%)`) on `.px-hero-art` so typography always has `>10:1` contrast.
- Full responsive grid rules at `max-height: 790px`, `max-width: 980px`, and `max-width: 480px` fitting `1440x900`, `1366x768`, and `390x844` into `100dvh` cleanly.

- [ ] **Step 2: Author `components/PixelHomePage.tsx`**

Assemble:
- `.pixel-noir-shell` wrapper + `<PixelWinterCanvas />`
- Pixel top navigation bar with subtle 14x14 crisp SVG pixel pine + crimson star emblem beside `/assets/rslogo.jpg`, İtemsatış badge, nav modal triggers (`about`, `solutions`, `/katalog`, `engineering`, `faq`), `<LanguageSwitcher compact />`, search link, İtemsatış link, Discord link, Customer Portal CTA, and mobile drawer.
- Left column: `.px-hero` backed by `/assets/pixel-holiday-citadel.png` (`Pixelify Sans` headline + subhead + dual CTAs + inline KPIs) and twin sub-cards (`/assets/pixel-holiday-vault.png` -> `engineering` modal; `/assets/pixel-holiday-beacon.png` -> `/discord`).
- Right column: `.px-core` backed by `/assets/pixel-holiday-skyline.png` + `<PixelCoreMonitor />`.
- Full pixel-styled overlay modals (`about`, `solutions`, `engineering`, `faq`).

- [ ] **Step 3: Wire `app/page.tsx` cleanly to `PixelHomePage`**

Import `'../app/pixel-home.css';` directly inside `components/PixelHomePage.tsx` and update `app/page.tsx` to a clean 1-line re-export (`export { default } from '@/components/PixelHomePage';`). That way, rolling back `app/page.tsx` to `export { default } from '@/components/HomePageBackup';` leaves `pixel-home.css` completely unloaded on `/`.

- [ ] **Step 4: Type-check & commit Task 5**

Run:
```powershell
npx tsc --noEmit
git add app/pixel-home.css components/PixelHomePage.tsx app/page.tsx
git commit -m "feat: implement Kış Noir Pixel Art holiday homepage"
```

---

### Task 6: Production Build, Headless Edge CDP Visual & Functional Verification

**Files:**
- Verification scratch script in `<artifactDir>/scratch/verify_pixel_home.mjs` (not committed to repo)

- [ ] **Step 1: Verify Git backup integrity and untouched subpages**

Run:
```powershell
git show-ref backup/homepage-noir
git tag -l backup-homepage-noir-v1
git diff --name-only 413f59d HEAD -- app/katalog app/dashboard app/status components/StatusBoard.tsx components/DashboardClient.tsx
```
Expected: backup refs resolve to `413f59d`, and zero changes inside subpage directories/components.

- [ ] **Step 2: Run full TypeScript check & production build**

Run:
```powershell
npx tsc --noEmit
npm run build
```
Expected: exit code 0, `/` compiles cleanly with zero warnings/errors.

- [ ] **Step 3: Run headless Edge CDP verification against `next start`**

Write and execute `<artifactDir>/scratch/verify_pixel_home.mjs` to test:
1. `/` at `1440x900` (`tr`), `1440x900` (`en`), `1366x768` (`tr`), `390x844` (`tr`).
2. Assert zero horizontal & zero vertical overflow (`scrollWidth <= innerWidth && scrollHeight <= innerHeight`) across all 4 viewports.
3. Assert `.global-winter-snow` is hidden (`display === 'none'` / not painting circles) on `/`, `canvas.px-snow-canvas` is present and active, and `document.fonts.check('700 24px "Pixelify Sans"')` passes cleanly.
4. Assert all 4 `/assets/pixel-holiday-*.png` images exist in DOM with `complete === true && naturalWidth > 0` across both `1440x900` and `390x844`.
5. Click `STRESS · 256P` button on desktop (`1440x900`) AND mobile (`390x844`) — assert telemetry text updates (`0.07 ms` / `59.8 TPS`), click `Şifresiz Kod` card — assert engineering modal opens cleanly and closes via `Escape`.
6. Verify `/katalog` and `/status` load cleanly with `WinterSnow` active (not suppressed on subpages) and zero console/page errors.
7. Capture full viewport screenshots (`pixel_home_tr_1440.png`, `pixel_home_en_1440.png`, `pixel_home_tr_1366.png`, `pixel_home_modal_1440.png`, `pixel_home_tr_390.png`) and inspect ALL of them with `read_file`.

- [ ] **Step 4: Fix any visual/layout contrast issues found during inspection and push `main` + `backup/homepage-noir`**

If any visual refinement is needed, apply, rebuild, re-run `verify_pixel_home.mjs`, commit cleanly, and verify final git status before reporting.
