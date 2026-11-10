# Catalog Order Guide Pop-up Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the catalog order guide pop-up with visual workflow diagrams, an interactive copyable message template, trust badges, and optional session/daily persistence to prevent customer confusion on İtemsatış.

**Architecture:** Extend `app/katalog/page.tsx` client component with local persistence checks (`localStorage`), an interactive copy-to-clipboard message template with live toast feedback, and an accessible, responsive dark-glass dialog matching Restricted Studio's aesthetic.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS (inline + global).

**Spec:** [Approved Design Doc: Yaklaşım 3](#)

## Global Constraints
- Framework: Next.js App Router with `'use client'`.
- Styling: Dark obsidian (`#08080b`, `#0d0e15`), crimson accent (`#e30000`), itemsatis blue (`#0071e3`).
- Responsiveness: Flawless layout on both mobile (touch targets >= 44px, max-height 92vh, overscroll contain) and desktop.
- Accessibility: Native dialog semantics, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, click-outside dismiss.

---

### Task 1: Session & Daily Persistence State Management
- [ ] Add `dontShowToday` state in `CatalogPage`.
- [ ] Implement `useEffect` check on mount: check `localStorage.getItem('rs_hide_order_guide_until')`.
- [ ] If stored expiry timestamp is valid and in the future, set `showGuideModal(false)`.
- [ ] When closing with `dontShowToday` checked, save `Date.now() + 24 * 60 * 60 * 1000` to `localStorage`.
- [ ] Ensure manual trigger button ("ℹ️ Sipariş Yönergeleri") always opens the modal regardless of storage.

### Task 2: Implement Enhanced Visual Guide & Copyable Template Box
- [ ] Add `sampleMessage` constant with pre-formatted inquiry text.
- [ ] Create interactive template card inside modal with a dedicated "Örnek Mesajı Kopyala" button.
- [ ] Add state `templateCopied` to give instant visual feedback ("✓ Kopyalandı!").
- [ ] Build the 3-step visual flowchart row with icons (`1. Paket Seç` → `2. Satıcıya Soru Sor` → `3. Özel Teslimat`).
- [ ] Add trust & speed badges row:
  - ⚡ 15 Dk Ortalama Yanıt
  - 🛡️ Temiz Açık Kaynak Garantisi
  - 💳 İtemsatış 3D Secure
- [ ] Add "Bugün tekrar gösterme" checkbox control next to dismiss button.

### Task 3: Build Verification & Deployment
- [ ] Run `npm run build` to verify Next.js TypeScript compilation and static page generation.
- [ ] Stage, commit with message `feat: enhance catalog order guide popup with interactive template, visual flowchart and persistence`.
- [ ] Push to `origin/main` for automated Vercel deployment.
