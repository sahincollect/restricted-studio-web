'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import '../app/pixel-home.css';
import '../app/pixel-town.css';
import catalogStats from '@/lib/catalog-stats.json';
import { CATALOG_CATEGORY_KEYS } from '@/lib/translations';
import {
  ITEMSATIS_STORE_URL,
  PIXEL_TOWN_BUILDINGS,
  deriveStatusBadgeState,
  getTownBuildingBadge,
  type PixelTownBuildingAction,
  type PixelTownBuildingId,
  type PixelTownBuildingSpec,
  type TownHealthSnapshot,
} from '@/lib/pixel-town-config';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PixelWinterCanvas from '@/components/PixelWinterCanvas';

type ModalId = 'about' | 'solutions' | 'engineering' | 'faq' | null;
type CodeTabKey = 'bridge' | 'security' | 'database';

const DEFAULT_BUILDING_ID: PixelTownBuildingId = 'catalog';

const TOWN_PINES: readonly [number, number][] = [
  [60, 570],
  [245, 580],
  [415, 565],
  [1110, 355],
];

const TOWN_LANTERNS: readonly [number, number][] = [
  [530, 222],
  [975, 212],
  [325, 482],
  [738, 438],
  [755, 622],
  [998, 618],
];

const TOWN_ROAD_SEGMENTS: readonly string[] = [
  // Upper row connecting portal -> status -> discord
  'M 560 248 L 845 188 L 1118 242 L 1108 260 L 845 208 L 568 266 Z',
  // North-south central avenue: status -> catalog plaza -> mlo
  'M 833 196 L 857 196 L 862 420 L 888 632 L 862 634 L 836 420 Z',
  // Mid-tier diagonal: engineering -> itemsatis -> catalog plaza
  'M 186 456 L 444 490 L 840 402 L 846 420 L 442 510 L 180 474 Z',
  // Lower storefront boulevard: itemsatis -> scripts -> mlo -> vehicles
  'M 438 504 L 636 614 L 878 620 L 1126 608 L 1128 626 L 876 638 L 628 632 L 424 518 Z',
  // West connector spur: engineering -> scripts
  'M 210 470 L 340 554 L 632 614 L 624 630 L 328 568 L 198 482 Z',
];

const TOWN_BLDG_PADS: readonly [number, number][] = [
  [621, 224],
  [845, 174],
  [1101, 224],
  [198, 444],
  [442, 480],
  [634, 600],
  [877, 606],
  [1120, 592],
];

function HolidayPixelTreeSvg() {
  return (
    <svg
      className="px-holiday-pine"
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="5" y="0" width="1" height="1" fill="#ffb84d" />
      <rect x="4" y="1" width="3" height="2" fill="#2f7a4d" />
      <rect x="3" y="3" width="5" height="2" fill="#266840" />
      <rect x="2" y="5" width="7" height="2" fill="#2f7a4d" />
      <rect x="1" y="7" width="9" height="3" fill="#1f5836" />
      <rect x="4" y="10" width="3" height="3" fill="#6b4428" />
      <rect x="4" y="4" width="1" height="1" fill="#e03030" />
      <rect x="7" y="6" width="1" height="1" fill="#b8e1ff" />
      <rect x="3" y="8" width="1" height="1" fill="#ffb84d" />
      <rect x="6" y="8" width="1" height="1" fill="#e03030" />
    </svg>
  );
}

function BuildingSignIcon({ id }: { id: PixelTownBuildingId }) {
  return (
    <svg
      className="px-sign-icon"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {id === 'status' && (
        <>
          <rect x="1" y="6" width="2" height="3" />
          <rect x="4" y="4" width="2" height="5" />
          <rect x="7" y="1" width="2" height="8" />
        </>
      )}
      {id === 'discord' && (
        <>
          <rect x="1" y="2" width="8" height="5" />
          <rect x="3" y="4" width="1" height="1" fill="#080808" />
          <rect x="6" y="4" width="1" height="1" fill="#080808" />
          <rect x="2" y="7" width="2" height="2" />
        </>
      )}
      {id === 'portal' && (
        <>
          <rect x="3" y="1" width="4" height="3" />
          <rect x="2" y="4" width="6" height="5" />
          <rect x="4" y="6" width="2" height="2" fill="#080808" />
        </>
      )}
      {id === 'catalog' && (
        <>
          <rect x="1" y="1" width="3" height="3" />
          <rect x="6" y="1" width="3" height="3" />
          <rect x="1" y="6" width="3" height="3" />
          <rect x="6" y="6" width="3" height="3" />
        </>
      )}
      {id === 'engineering' && (
        <>
          <rect x="1" y="4" width="2" height="2" />
          <rect x="3" y="2" width="1" height="2" />
          <rect x="3" y="6" width="1" height="2" />
          <rect x="7" y="4" width="2" height="2" />
          <rect x="6" y="2" width="1" height="2" />
          <rect x="6" y="6" width="1" height="2" />
        </>
      )}
      {id === 'itemsatis' && (
        <>
          <rect x="3" y="1" width="4" height="2" />
          <rect x="1" y="3" width="8" height="6" />
          <rect x="4" y="5" width="2" height="2" fill="#080808" />
        </>
      )}
      {id === 'scripts' && (
        <>
          <rect x="1" y="2" width="8" height="6" />
          <rect x="2" y="4" width="4" height="1" fill="#080808" />
          <rect x="2" y="6" width="6" height="1" fill="#080808" />
        </>
      )}
      {id === 'mlo' && (
        <>
          <rect x="4" y="1" width="2" height="1" />
          <rect x="2" y="2" width="6" height="2" />
          <rect x="1" y="4" width="8" height="5" />
          <rect x="4" y="6" width="2" height="3" fill="#080808" />
        </>
      )}
      {id === 'vehicles' && (
        <>
          <rect x="2" y="3" width="6" height="2" />
          <rect x="1" y="5" width="8" height="3" />
          <rect x="2" y="8" width="2" height="1" />
          <rect x="6" y="8" width="2" height="1" />
        </>
      )}
    </svg>
  );
}

function TownRoadsSvg() {
  return (
    <svg
      className="px-town-roads"
      viewBox="0 0 1280 720"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Cobblestone isometric lanes */}
      {TOWN_ROAD_SEGMENTS.map((d) => (
        <path
          key={d}
          d={d}
          fill="#13161e"
          stroke="#272e3e"
          strokeWidth="2"
          opacity="0.88"
        />
      ))}

      {/* Isometric foundation plinths beneath each district building */}
      {TOWN_BLDG_PADS.map(([px, py]) => (
        <polygon
          key={`pad-${px}-${py}`}
          points={`${px},${py - 36} ${px + 86},${py} ${px},${py + 36} ${px - 86},${py}`}
          fill="#12141b"
          stroke="#283042"
          strokeWidth="1.5"
          opacity="0.9"
        />
      ))}

      {/* Central Citadel Isometric Plaza Pad */}
      <polygon
        points="845,358 995,412 845,468 695,412"
        fill="#16161d"
        stroke="#464d60"
        strokeWidth="2"
      />
      <polygon
        points="845,368 972,412 845,456 718,412"
        fill="#1c1115"
        stroke="#a50000"
        strokeWidth="2"
      />

      {/* Snow-frosted pixel pine props clear of signboards and buildings */}
      {TOWN_PINES.map(([px, py]) => (
        <g key={`${px}-${py}`} transform={`translate(${px}, ${py})`}>
          <rect x="12" y="34" width="6" height="8" fill="#4f3320" />
          <rect x="2" y="24" width="26" height="10" fill="#183426" />
          <rect x="5" y="14" width="20" height="10" fill="#214634" />
          <rect x="8" y="6" width="14" height="8" fill="#285841" />
          <rect x="12" y="0" width="6" height="6" fill="#e6edf5" />
          <rect x="6" y="13" width="18" height="2" fill="#dce6f2" />
          <rect x="3" y="23" width="24" height="2" fill="#dce6f2" />
          <rect x="9" y="17" width="3" height="3" fill="#d92b2b" />
          <rect x="18" y="27" width="3" height="3" fill="#f5a623" />
          <rect x="7" y="28" width="2" height="2" fill="#7dd3fc" />
        </g>
      ))}

      {/* Glowing winter pixel street lanterns */}
      {TOWN_LANTERNS.map(([lx, ly]) => (
        <g key={`${lx}-${ly}`} transform={`translate(${lx}, ${ly})`}>
          <rect x="-6" y="-8" width="16" height="16" fill="#f5a623" opacity="0.16" />
          <rect x="1" y="4" width="2" height="14" fill="#2e3440" />
          <rect x="-1" y="0" width="6" height="5" fill="#101218" />
          <rect x="0" y="1" width="4" height="3" fill="#f5a623" />
        </g>
      ))}
    </svg>
  );
}

interface TownActionElementProps {
  action: PixelTownBuildingAction;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  dataAttrs?: Record<string, string | undefined>;
  onHover?: () => void;
  onFocus?: () => void;
  onModalOpen: (id: 'engineering') => void;
  children: React.ReactNode;
}

function TownActionElement({
  action,
  className,
  style,
  ariaLabel,
  dataAttrs,
  onHover,
  onFocus,
  onModalOpen,
  children,
}: TownActionElementProps) {
  if (action.kind === 'route') {
    return (
      <Link
        href={action.href}
        className={className}
        style={style}
        aria-label={ariaLabel}
        onMouseEnter={onHover}
        onFocus={onFocus}
        {...dataAttrs}
      >
        {children}
      </Link>
    );
  }

  if (action.kind === 'external') {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        aria-label={ariaLabel}
        onMouseEnter={onHover}
        onFocus={onFocus}
        {...dataAttrs}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={ariaLabel}
      onMouseEnter={onHover}
      onFocus={onFocus}
      onClick={() => onModalOpen(action.modalId)}
      {...dataAttrs}
    >
      {children}
    </button>
  );
}

export default function PixelTownHomePage(): React.JSX.Element {
  const { t, formatNumber } = useI18n();
  const [activeBuildingId, setActiveBuildingId] =
    useState<PixelTownBuildingId>(DEFAULT_BUILDING_ID);
  const [healthState, setHealthState] = useState<TownHealthSnapshot | null>(null);
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const modalPanelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const codeSnippets: Record<CodeTabKey, { label: string; code: string }> = useMemo(
    () => ({
      bridge: {
        label: 'bridge.lua',
        code: `-- ${t.home.modals.codeComments.bridge}
local Framework = {}

CreateThread(function()
  if GetResourceState('qbx_core') == 'started' then
    Framework.Name = 'qbox'
  elseif GetResourceState('qb-core') == 'started' then
    Framework.Name = 'qb'
    Framework.Core = exports['qb-core']:GetCoreObject()
  elseif GetResourceState('es_extended') == 'started' then
    Framework.Name = 'esx'
    Framework.Core = exports['es_extended']:getSharedObject()
  end
end)`,
      },
      security: {
        label: 'server_validate.lua',
        code: `-- ${t.home.modals.codeComments.security}
RegisterNetEvent('restricted:server:completeDelivery', function(missionId, checkpoint)
  local src = source
  local Player = Framework.GetPlayer(src)
  if not Player then return end

  local ped = GetPlayerPed(src)
  if #(GetEntityCoords(ped) - checkpoint) > 6.5 then
    return DropPlayer(src, '[Restricted Shield] Invalid coordinates')
  end

  if Player.AddMoney('bank', Config.RewardAmount) then
    TriggerClientEvent('restricted:client:notify', src, 'success')
  end
end)`,
      },
      database: {
        label: 'schema.sql',
        code: `-- ${t.home.modals.codeComments.database}
CREATE TABLE IF NOT EXISTS \`restricted_licenses\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`license_key\` VARCHAR(64) NOT NULL,
  \`owner_discord\` VARCHAR(32) NOT NULL,
  \`package_slug\` VARCHAR(96) NOT NULL,
  \`active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_license_key\` (\`license_key\`),
  KEY \`idx_owner_active\` (\`owner_discord\`, \`active\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      },
    }),
    [t.home.modals.codeComments]
  );

  // Non-blocking health check enriching the Status Station signboard and HUD latency
  useEffect(() => {
    const controller = new AbortController();

    async function fetchHealth() {
      try {
        const res = await fetch('/api/health', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json: unknown = await res.json();
        const parsed = deriveStatusBadgeState(json);
        if (parsed) setHealthState(parsed);
      } catch {
        // Silent degradation: fallback to localized nominal label
      }
    }

    fetchHealth();
    return () => controller.abort();
  }, []);

  // Close overlays cleanly on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeModal) {
        setActiveModal(null);
      } else if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, mobileMenuOpen]);

  // Modal focus containment & restoration
  useEffect(() => {
    if (!activeModal) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = modalPanelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );

    const firstFocusable = getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [activeModal]);

  const openModal = useCallback((id: Exclude<ModalId, null>) => {
    setMobileMenuOpen(false);
    setActiveModal(id);
  }, []);

  const activeSpec: PixelTownBuildingSpec =
    PIXEL_TOWN_BUILDINGS.find((b) => b.id === activeBuildingId) ??
    PIXEL_TOWN_BUILDINGS[3];
  const activeCopy = t.home.town.buildings[activeSpec.id];
  const activeLiveBadge = getTownBuildingBadge(
    activeSpec.id,
    activeCopy.badge,
    catalogStats,
    healthState
  );

  return (
    <div className="pixel-noir-shell pixel-town-shell">
      <PixelWinterCanvas />
      <div className="px-scanline-layer" aria-hidden="true" />

      {/* ================================================================
          TOP PIXEL HEADER BAR (58px, strict Brand / Nav / Actions parity)
          ================================================================ */}
      <header className="px-nav" id="navbar">
        <div className="px-nav-brand-group">
          <Link href="/" className="px-brand" aria-label={`Restricted Studio ${t.common.home}`}>
            <span className="px-logo-frame">
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" />
            </span>
            <span className="px-brand-text">
              <span className="px-brand-title-row">
                <span className="px-brand-title">RESTRICTED STUDIO</span>
                <HolidayPixelTreeSvg />
              </span>
              <span className="px-trust-mobile">
                <img src="/assets/itemsatis-icon.png" alt="" width={10} height={10} />
                {t.common.itemsatisTrust}
              </span>
            </span>
          </Link>

          <span className="px-nav-divider" aria-hidden="true" />

          <a
            href={ITEMSATIS_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-trust-badge"
            title={t.common.itemsatisOfficialStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={14}
              height={14}
            />
            <span>{t.common.itemsatisTrust}</span>
          </a>
        </div>

        <nav className="px-nav-menu" aria-label={t.common.home}>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'about' ? ' is-active' : ''}`}
            onClick={() => openModal('about')}
          >
            {t.home.nav.about}
          </button>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'solutions' ? ' is-active' : ''}`}
            onClick={() => openModal('solutions')}
          >
            {t.home.nav.solutions}
          </button>
          <Link href="/katalog" className="px-nav-link is-highlight">
            {t.home.nav.catalog}
          </Link>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'engineering' ? ' is-active' : ''}`}
            onClick={() => openModal('engineering')}
          >
            {t.home.nav.engineering}
          </button>
          <button
            type="button"
            className={`px-nav-link${activeModal === 'faq' ? ' is-active' : ''}`}
            onClick={() => openModal('faq')}
          >
            {t.home.nav.faq}
          </button>
        </nav>

        <div className="px-nav-actions">
          <LanguageSwitcher compact className="px-lang-desktop" />

          <Link
            href="/katalog"
            className="px-icon-btn"
            title={t.home.nav.searchTitle}
            aria-label={t.home.nav.searchTitle}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
            </svg>
          </Link>

          <a
            href={ITEMSATIS_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-itemsatis-btn"
            title={t.common.itemsatisStore}
            aria-label={t.common.itemsatisStore}
          >
            <img src="/assets/itemsatis-icon.png" alt={t.common.itemsatisShort} width={14} height={14} />
            <span>{t.common.itemsatisShort.toUpperCase()}</span>
          </a>

          <Link
            href="/discord"
            className="px-icon-btn"
            title={t.home.nav.discordTitle}
            aria-label={t.home.nav.discordTitle}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
            </svg>
          </Link>

          <Link href="/dashboard" className="px-portal-btn">
            <span className="px-portal-sq" aria-hidden="true" />
            <span>{t.home.nav.portal}</span>
          </Link>

          <button
            type="button"
            className="px-mobile-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="px-mobile-drawer"
            aria-label={t.common.openMenu}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="px-drawer-backdrop"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        id="px-mobile-drawer"
        className={`px-mobile-drawer${mobileMenuOpen ? ' open' : ''}`}
      >
        <div className="px-drawer-lang">
          <span className="px-drawer-lang-label">{t.common.langLabel}</span>
          <LanguageSwitcher compact />
        </div>

        <button type="button" className="px-drawer-btn" onClick={() => openModal('about')}>
          <span>{t.home.drawer.about}</span>
          <span>↗</span>
        </button>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('solutions')}>
          <span>{t.home.drawer.solutions}</span>
          <span>↗</span>
        </button>
        <Link
          href="/katalog"
          className="px-drawer-btn is-crimson"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>{t.home.drawer.catalog}</span>
          <span>→</span>
        </Link>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('engineering')}>
          <span>{t.home.drawer.engineering}</span>
          <span>↗</span>
        </button>
        <button type="button" className="px-drawer-btn" onClick={() => openModal('faq')}>
          <span>{t.home.drawer.faq}</span>
          <span>↗</span>
        </button>
        <Link
          href="/dashboard"
          className="px-drawer-btn is-light"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>{t.home.drawer.portal}</span>
          <span>→</span>
        </Link>
        <a
          href={ITEMSATIS_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-drawer-btn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>{t.home.drawer.itemsatis}</span>
          <span>↗</span>
        </a>
        <Link
          href="/discord"
          className="px-drawer-btn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>{t.home.drawer.discord}</span>
          <span>→</span>
        </Link>
        <Link
          href="/status"
          className="px-drawer-btn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>{t.home.drawer.status}</span>
          <span>→</span>
        </Link>
      </div>

      {/* ================================================================
          ISOMETRIC WINTER PIXEL TOWN STAGE (Desktop 16:9 / Mobile 2-col Grid)
          ================================================================ */}
      <main className="px-town-viewport">
        <div className="px-town-stage">
          <div className="px-town-sky" aria-hidden="true">
            <img
              src="/assets/pixel-holiday-skyline.png"
              alt=""
              className="px-town-sky-img"
              draggable={false}
            />
          </div>
          <div className="px-town-vignette" aria-hidden="true" />
          <TownRoadsSvg />

          {/* Top-Left Negative Space Sky Marquee */}
          <section className="px-town-marquee" aria-label={t.home.town.marqueeEyebrow}>
            <span className="px-eyebrow">
              <span className="px-town-marquee-dot" aria-hidden="true" />
              <span>{t.home.town.marqueeEyebrow}</span>
            </span>
            <h1 className="px-town-title">{t.home.town.marqueeTitle}</h1>
            <p className="px-town-marquee-hint">{t.home.town.hudHint}</p>
          </section>

          {/* 9 Interactive Isometric Town Buildings */}
          {PIXEL_TOWN_BUILDINGS.map((b) => {
            const bCopy = t.home.town.buildings[b.id];
            const liveBadge = getTownBuildingBadge(
              b.id,
              bCopy.badge,
              catalogStats,
              healthState
            );
            const isSelected = activeBuildingId === b.id;

            const styleVars = {
              '--bx': `${b.x}%`,
              '--by': `${b.y}%`,
              '--bw': `${b.w}%`,
              '--bh': `${b.h}%`,
              '--bz': b.zIndex,
            } as React.CSSProperties;

            return (
              <TownActionElement
                key={b.id}
                action={b.action}
                className={`px-bldg${isSelected ? ' is-selected' : ''}`}
                style={styleVars}
                ariaLabel={`${bCopy.signTitle} — ${bCopy.summary}`}
                dataAttrs={{
                  'data-bldg': b.id,
                  'data-tone': b.tone,
                  'data-featured-mobile': b.featuredMobile ? 'true' : undefined,
                }}
                onHover={() => setActiveBuildingId(b.id)}
                onFocus={() => setActiveBuildingId(b.id)}
                onModalOpen={(id) => openModal(id)}
              >
                <span className="px-bldg-reticle" aria-hidden="true" />
                <span className="px-bldg-sprite-wrap">
                  <img
                    src={b.sprite}
                    alt={bCopy.signTitle}
                    className="px-bldg-sprite"
                    draggable={false}
                  />
                </span>

                <span className="px-bldg-mobile-body">
                  <span className="px-bldg-sign">
                    <BuildingSignIcon id={b.id} />
                    <span className="px-sign-title">{bCopy.signTitle}</span>
                    <span className="px-sign-badge">{liveBadge}</span>
                  </span>

                  <span className="px-bldg-mobile-meta">
                    <span className="px-bldg-mobile-summary">{bCopy.summary}</span>
                    <span className="px-bldg-mobile-cta">
                      <span>{bCopy.ctaLabel}</span>
                      <span>→</span>
                    </span>
                  </span>
                </span>
              </TownActionElement>
            );
          })}
        </div>
      </main>

      {/* ================================================================
          BOTTOM RPG BUILDING INSPECTOR HUD (Desktop)
          ================================================================ */}
      <footer className="px-town-hud" aria-live="polite">
        <div className="px-hud-left">
          <span className="px-hud-tag">[ {t.home.town.hudSelectedPrefix} ]</span>
          <span className="px-hud-pip" data-tone={activeSpec.tone} aria-hidden="true" />
          <strong className="px-hud-title">{activeCopy.signTitle}</strong>
          <span className="px-hud-chip">{activeCopy.category}</span>
          <span className="px-hud-badge">{activeLiveBadge}</span>
        </div>

        <p className="px-hud-summary">{activeCopy.summary}</p>

        <div className="px-hud-right">
          <span
            className={`px-hud-health${healthState?.state === 'degraded' ? ' is-degraded' : ''}`}
          >
            <span className="px-hud-health-dot" aria-hidden="true" />
            <span>
              {healthState?.state === 'degraded'
                ? t.home.town.statusDegraded
                : t.home.town.statusNominal}
              {healthState?.responseTimeMs != null ? ` · ${healthState.responseTimeMs} ms` : ''}
            </span>
          </span>

          <TownActionElement
            action={activeSpec.action}
            className="px-btn px-btn-crimson px-btn-compact"
            onModalOpen={(id) => openModal(id)}
          >
            <span>{activeCopy.ctaLabel} →</span>
          </TownActionElement>
        </div>
      </footer>

      {/* ================================================================
          ACCESSIBLE PIXEL MODALS (About / Solutions / Engineering / FAQ)
          ================================================================ */}
      {activeModal && (
        <div
          className="px-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="px-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="px-modal-panel" ref={modalPanelRef}>
            <div className="px-modal-head">
              <div>
                <p className="px-modal-eyebrow">
                  {activeModal === 'about' && t.home.modals.aboutEyebrow}
                  {activeModal === 'solutions' && t.home.modals.solutionsEyebrow}
                  {activeModal === 'engineering' && t.home.modals.engineeringEyebrow}
                  {activeModal === 'faq' && t.home.modals.faqEyebrow}
                </p>
                <h2 id="px-modal-title" className="px-modal-title">
                  {activeModal === 'about' && t.home.modals.aboutTitle}
                  {activeModal === 'solutions' && t.home.modals.solutionsTitle}
                  {activeModal === 'engineering' && t.home.modals.engineeringTitle}
                  {activeModal === 'faq' && t.home.modals.faqTitle}
                </h2>
              </div>

              <button
                type="button"
                className="px-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label={t.common.close}
              >
                ×
              </button>
            </div>

            {activeModal === 'about' && (
              <>
                <p className="px-modal-lead">
                  <strong>{t.home.modals.aboutLeadBold}</strong>
                  {t.home.modals.aboutLeadRest}
                </p>

                <div className="px-modal-grid-3">
                  {t.home.modals.aboutCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <table className="px-compare-table">
                  <thead>
                    <tr>
                      {t.home.modals.compareHeaders.map((hdr) => (
                        <th key={hdr}>{hdr}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.home.modals.compareRows.map(([c1, c2, c3]) => (
                      <tr key={c1}>
                        <td>{c1}</td>
                        <td>{c2}</td>
                        <td>{c3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeModal === 'solutions' && (
              <>
                <div className="px-modal-grid-2">
                  {t.home.modals.solutionsCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                      <div className="px-chip-row">
                        {card.chips.map((chip) => (
                          <span key={chip} className="px-chip">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-archive-modal-wrap">
                  <div className="px-archive-modal-head">
                    <span>
                      {t.home.modals.archiveDistribution} ({formatNumber(catalogStats.total)}{' '}
                      {t.home.modals.archivePackagesUnit})
                    </span>
                    <Link href="/katalog" onClick={() => setActiveModal(null)}>
                      {t.home.modals.openCatalogLink}
                    </Link>
                  </div>
                  <div className="px-archive-bars">
                    {CATALOG_CATEGORY_KEYS.filter((k) => k !== 'Tümü').map((cat) => {
                      const count =
                        (catalogStats.counts as Record<string, number>)[cat] ?? 0;
                      const pct = Math.max(
                        4,
                        Math.round((count / Math.max(1, catalogStats.total)) * 100)
                      );
                      return (
                        <div key={cat} className="px-archive-row">
                          <div className="px-archive-label">
                            <span>{t.catalog.categoryLabels[cat] ?? cat}</span>
                            <b>{formatNumber(count)}</b>
                          </div>
                          <div className="px-segment-track">
                            <div className="px-segment-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeModal === 'engineering' && (
              <>
                <div className="px-modal-grid-3" style={{ marginBottom: '14px' }}>
                  {t.home.modals.engineeringCards.map((card) => (
                    <div key={card.title} className="px-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <div className="px-code-tabs">
                  {(Object.keys(codeSnippets) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`px-code-tab${codeTab === key ? ' active' : ''}`}
                      onClick={() => setCodeTab(key)}
                    >
                      {codeSnippets[key].label}
                    </button>
                  ))}
                </div>

                <pre className="px-code-pre">
                  <code>{codeSnippets[codeTab].code}</code>
                </pre>
              </>
            )}

            {activeModal === 'faq' && (
              <>
                {t.home.modals.faqItems.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className={`px-faq-item${isOpen ? ' active' : ''}`}>
                      <button
                        type="button"
                        className="px-faq-trigger"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                      >
                        <span>{item.q}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className="px-faq-body">{item.a}</div>}
                    </div>
                  );
                })}

                <div className="px-modal-cta-row">
                  <Link
                    href="/katalog"
                    className="px-btn px-btn-crimson"
                    onClick={() => setActiveModal(null)}
                  >
                    {t.home.modals.goToCatalog}
                  </Link>
                  <a
                    href={ITEMSATIS_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-btn px-btn-ghost"
                  >
                    {t.home.modals.itemsatisLink}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
