# Triadic Noir Interactive Stage, Arcade, Console Easter Egg & Simplified Featured Catalog Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cursor-reactive crimson spotlight + 3D wireframe monolith background, playable Triadic Noir Pac-Man + F8/DevTools console Easter eggs on `/` and globally, and simplify `/katalog` while making filters functional with Featured & Most-Clicked ranking.

**Architecture:** Zero external runtime packages; pure React 19 / TypeScript / Canvas2D components integrated into the strict nonce CSP Next.js 15 App Router shell. Catalog popularity combines curated FiveM featured defaults with a live `/api/catalog/clicks` counter backed by optional Supabase `catalog_popularity` table + in-memory & localStorage fallback.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vanilla CSS, Canvas2D, Supabase (optional table fallback).

**Spec:** `docs/superpowers/specs/2026-11-14-noir-interactive-catalog-arcade-design.md`

## Global Constraints
- Strict nonce CSP (`lib/security-edge.ts`): no `unsafe-eval`, no external CDN scripts, no un-nonced inline scripts.
- Preserve Triadic Noir palette (`#080808`, `#8B0000`/`#A50000`, `#E8E5DE`/`#F0F0F0`) and desktop `is-viewport-locked` on `/`.
- Full 4-language support (`tr`, `en`, `ru`, `fr`) in `lib/translations.ts` for all visible strings.
- Validate inputs strictly in `/api/catalog/clicks` (`RS-CAT-\d{4}`), fail safe if Supabase table is not yet created.

## Review Focus
1. Arrow keys / WASD on `/` for Pac-Man must NOT scroll anything or hijack typing inside open modals (`about`, `solutions`, `engineering`, `faq`) or `F8` console input.
2. Small desktop heights (`1366x768`, `max-height: 760px`) and mobile (`390x844`) on `/` must render `.bento-card-showcase` + 3D monolith + chassis cleanly without clipping or overflow.
3. Clicking catalog cards / quick-view or "Add to Cart" triggers popularity tracking once per item per rapid interaction without breaking cart UX or blocking clicks.
4. Clicking active sidebar category / collection tab must clearly highlight (`is-active` / `active` CSS fix) and second-click on a tag chip must clear the tag filter.
5. `window.rs` DevTools Easter egg and `F8`/`Ctrl+K` command console must work safely without throwing on SSR (`typeof window !== 'undefined'`).

---

### Task 1: Translations, Popularity Seed & Database Schema + `/api/catalog/clicks`
**Files:**
- Modify: `supabase/schema.sql`
- Create: `lib/catalog-featured.ts`
- Create: `app/api/catalog/clicks/route.ts`
- Modify: `lib/translations.ts`

- [ ] Add `public.catalog_popularity` table + atomic `increment_catalog_click` RPC + RLS read policy in `supabase/schema.sql`.
- [ ] Create `lib/catalog-featured.ts` exporting curated featured/baseline click weights for real `RS-CAT-*` items verified against `lib/catalog-data.json`.
- [ ] Implement `/api/catalog/clicks` (`GET` returns `{ counts, source }` merging baseline + Supabase or in-memory map; `POST` validates `itemId` (`/^RS-CAT-\d{4,6}$/`) + bounded rate-limit and increments click count safely).
- [ ] Extend `TranslationDictionary` + `tr`, `en`, `ru`, `fr` entries in `lib/translations.ts` for catalog views (`Öne Çıkanlar`, `En Çok Tıklananlar`), showcase modes (`PAC-RUN`, `CORE`, `F8`), arcade UI, and F8 console hints.

### Task 2: Cursor Crimson Spotlight, 3D Wireframe Monolith & Showcase Terminal (`PAC-RUN` + `CORE` + `F8`)
**Files:**
- Create: `components/CursorSpotlight.tsx`
- Create: `components/MonolithStage.tsx`
- Create: `components/ShowcaseTerminal.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] Build `CursorSpotlight.tsx` to update `--spot-x` / `--spot-y` on `.spotlight-surface` cards via `pointermove` + `rAF` (respecting `prefers-reduced-motion`).
- [ ] Build `MonolithStage.tsx` rendering an animated 3D perspective wireframe octagram monolith, orbital wireframe rings, perspective horizon grid floor, and inverted crimson light beam reacting smoothly to cursor X/Y over `.bento-card-showcase`.
- [ ] Build `ShowcaseTerminal.tsx` housing segmented tabs:
  - `PAC-RUN`: Complete Triadic Noir Pac-Man canvas game (13x11 classic wrapped corridor grid, auto-attract demo until player presses Play/Arrow/WASD, 3 crimson AI ghosts, `0% ESCROW` power pellets that turn ghosts edible, score + `localStorage` best score, restart, mobile D-pad controls).
  - `CORE`: Interactive `Restricted Core` telemetry console with server load toggles (`IDLE`, `128P`, `256P`) dynamically updating `tick`, `sql`, curve, and TPS readout.
  - `F8`: Inline quick terminal displaying Easter egg outputs and allowing direct command execution.
- [ ] Wire `MonolithStage` + `ShowcaseTerminal` + `CursorSpotlight` into `app/page.tsx` without disturbing desktop `is-viewport-locked` or mobile responsiveness.

### Task 3: Dual Console Easter Egg (`DevTools window.rs` + Global `F8` / `Ctrl+K` Command Overlay)
**Files:**
- Create: `components/ConsoleEasterEgg.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] Build `ConsoleEasterEgg.tsx` (mounted in `app/layout.tsx`) with:
  - Styled `%c` DevTools console ASCII art + `window.rs` API (`help()`, `status()`, `pack()`, `matrix()`, `pacman()`, `noclip()`).
  - Global `F8` / `Ctrl+K` (or custom window event `rs:open-console`) modal overlay styled in FiveM F8 noir monospace with instant search across `catalog-data.json` + Easter egg commands (`help`, `noclip`, `godmode`, `resmon`, `matrix`, `pacman`, `catalog`, `status`, `lang <code>`, `clear`) + Konami code listener (`↑↑↓↓←→←→BA`) triggering Crimson Overdrive HUD badge!
  - Listen safely without interfering with form inputs, selects, or open dialogs.

### Task 4: Catalog Menu Simplification, Bug Fixes & Featured / Most-Clicked UX
**Files:**
- Modify: `app/katalog/page.tsx`
- Modify: `app/globals.css`

- [ ] Fix `.sb-cat-item.is-active` CSS bug so active category clearly highlights.
- [ ] Remove verbose clutter on `/katalog`: trim long hero `chs-desc` paragraph, remove redundant sidebar sort block (use single topbar sort control with new modes), trim `verifiedStoreDesc` & campaign boilerplate paragraphs, and remove bottom redundant `catalog-trust-strip`.
- [ ] Add functional collection filter pills in sidebar (`Tümü`, `★ Öne Çıkanlar`, `▲ En Çok Tıklananlar`), toggleable quick-search tags (click again clears), crisp compact campaign meter (`cart.length / 16`), and minimal action links.
- [ ] Add **En Çok Tıklananlar / Öne Çıkanlar** top strip (top 4 most clicked items when viewing default catalog without active search) + click badges (`★` / click count) on catalog cards + interactive **Paket Önizleme Modalı** when clicking any catalog card title/visual (logs click to `/api/catalog/clicks`, displays full title/ID/category, copy title, add/remove cart, Discord link).
- [ ] Wire `CursorSpotlight` onto `.catalog-card-v2` and `.catalog-sidebar-inner`.

### Task 5: Build Verification, Runtime Typecheck & Live Headless Browser Visual Inspection
- [ ] Run `npx tsc --noEmit` and `npm run build` in `C:\Users\yesah\OneDrive\Desktop\restricted-studio-web`.
- [ ] Boot local Next.js server temporarily (or headless Edge verification against `npm run start`) to capture screenshots of `/` and `/katalog` (desktop 1440x900, laptop 1366x768, mobile 390x844), test `/api/catalog/clicks`, verify zero console errors and visually inspect rendered pixels before stopping local test server.
