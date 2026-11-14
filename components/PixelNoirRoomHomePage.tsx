'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import catalogStats from '../lib/catalog-stats.json';
import { useI18n } from '../components/I18nProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LivingPixelRoomCanvas from '../components/LivingPixelRoomCanvas';
import { PIXEL_ROOM_HOTSPOTS } from '../lib/pixel-room-config';
import '../app/pixel-room.css';

type ModalId = 'about' | 'solutions' | 'engineering' | 'faq' | null;
type CodeTabKey = 'bridge' | 'security' | 'database';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

export default function PixelNoirRoomHomePage() {
  const { t, formatNumber, formatPercent } = useI18n();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const codeSnippets: Record<CodeTabKey, { label: string; code: string }> = {
    bridge: {
      label: 'bridge.lua',
      code: `-- ${t.home.modals.codeComments.bridge}
local Bridge = {}

function Bridge.GetFramework()
    if GetResourceState("qbx_core") == "started" then
        return "qbox"
    elseif GetResourceState("qb-core") == "started" then
        return "qbcore"
    elseif GetResourceState("es_extended") == "started" then
        return "esx"
    end
end

return Bridge`,
    },
    security: {
      label: 'security.lua',
      code: `-- ${t.home.modals.codeComments.security}
local function VerifyPlayerAction(source, targetCoords)
    local ped = GetPlayerPed(source)
    if not DoesEntityExist(ped) then return false end

    local dist = #(GetEntityCoords(ped) - targetCoords)
    if dist > 3.5 then
        return false
    end

    return true
end`,
    },
    database: {
      label: 'schema.sql',
      code: `-- ${t.home.modals.codeComments.database}
CREATE TABLE IF NOT EXISTS \`restricted_records\` (
    \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`citizenid\` VARCHAR(50) NOT NULL,
    \`data\` LONGTEXT NOT NULL,
    INDEX \`idx_citizen\` (\`citizenid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    },
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add('is-viewport-locked');
    body.classList.add('is-viewport-locked');
    window.scrollTo(0, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      html.classList.remove('is-viewport-locked');
      body.classList.remove('is-viewport-locked');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Smooth spring-damped parallax camera controller (mouse + gentle idle drift)
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastMoveTime = Date.now();
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 .. 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 .. 1
      targetX = Math.max(-1, Math.min(1, nx));
      targetY = Math.max(-1, Math.min(1, ny));
      lastMoveTime = Date.now();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const tick = () => {
      const idleMs = Date.now() - lastMoveTime;
      if (idleMs > 2400) {
        // Gentle autonomous camera sway when mouse is idle
        const tSec = Date.now() * 0.00055;
        targetX = Math.sin(tSec) * 0.42;
        targetY = Math.cos(tSec * 0.7) * 0.18;
      }

      currentX += (targetX - currentX) * 0.065;
      currentY += (targetY - currentY) * 0.065;

      el.style.setProperty('--px', currentX.toFixed(4));
      el.style.setProperty('--py', currentY.toFixed(4));

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const statRows = Object.entries(catalogStats.counts as Record<string, number>).sort(
    (a, b) => b[1] - a[1]
  );

  const openModal = (id: Exclude<ModalId, null>) => {
    setMobileMenuOpen(false);
    setActiveModal(id);
  };

  return (
    <div ref={shellRef} className="living-room-shell">
      {/* ===============================================================
           3-LAYER PIXEL TOWN PARALLAX STAGE (FAR + MID + FOREGROUND)
           =============================================================== */}
      <LivingPixelRoomCanvas />

      {/* ===============================================================
           TOP FLOATING PILL NAVBAR
           =============================================================== */}
      <header className="bento-pill-nav" id="navbar">
        <div className="bpn-brand-group">
          <Link href="/" className="bpn-brand" aria-label={`Restricted Studio ${t.common.home}`}>
            <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="bpn-logo" />
            <div className="bpn-brand-text">
              <span className="bpn-title">RESTRICTED STUDIO</span>
              <span className="bpn-trust-mobile">
                <img src="/assets/itemsatis-icon.png" alt="" width={10} height={10} />
                {t.common.itemsatisTrust}
              </span>
            </div>
          </Link>

          <span className="bpn-brand-divider" aria-hidden="true" />

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bpn-trust-badge"
            title={t.common.itemsatisOfficialStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={13}
              height={13}
              className="bpn-trust-icon"
            />
            <span>{t.common.itemsatisTrust}</span>
          </a>
        </div>

        <nav className="bpn-menu" aria-label={t.common.home}>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'about' ? 'is-active' : ''}`}
            onClick={() => openModal('about')}
          >
            {t.home.nav.about}
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'solutions' ? 'is-active' : ''}`}
            onClick={() => openModal('solutions')}
          >
            {t.home.nav.solutions}
          </button>
          <Link href="/katalog" className="bpn-link bpn-link-highlight">
            {t.home.nav.catalog}
          </Link>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'engineering' ? 'is-active' : ''}`}
            onClick={() => openModal('engineering')}
          >
            {t.home.nav.engineering}
          </button>
          <button
            type="button"
            className={`bpn-link ${activeModal === 'faq' ? 'is-active' : ''}`}
            onClick={() => openModal('faq')}
          >
            {t.home.nav.faq}
          </button>
        </nav>

        <div className="bpn-actions">
          <LanguageSwitcher compact className="bpn-lang-desktop" />

          <Link
            href="/katalog"
            className="bpn-icon-btn"
            title={t.home.nav.searchTitle}
            aria-label={t.home.nav.searchTitle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>

          <a
            href={ITEMSATIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bpn-itemsatis-btn"
            title={t.common.itemsatisStore}
            aria-label={t.common.itemsatisStore}
          >
            <img
              src="/assets/itemsatis-icon.png"
              alt={t.common.itemsatisShort}
              width={15}
              height={15}
              className="bpn-itemsatis-img"
            />
            <span className="bpn-itemsatis-label">{t.common.itemsatisShort.toUpperCase()}</span>
          </a>

          <Link
            href="/iletisim"
            className="bpn-icon-btn"
            title="İletişim: info@restrictedstudio.shop"
            aria-label="İletişim"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </Link>

          <Link href="/dashboard" className="bpn-portal-btn">
            <span className="bpn-portal-dot" aria-hidden="true" />
            <span>{t.home.nav.portal}</span>
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={t.common.openMenu}
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`bpn-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} style={{ zIndex: 25 }}>
        <div style={{ padding: '4px 0 8px', borderBottom: '1px solid rgba(240,240,240,0.16)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(240,240,240,0.65)', letterSpacing: '0.08em' }}>
            {t.common.langLabel.toUpperCase()}
          </span>
          <LanguageSwitcher compact />
        </div>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('about')}>
          <span>{t.home.drawer.about}</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('solutions')}>
          <span>{t.home.drawer.solutions}</span>
          <span>↗</span>
        </button>
        <Link href="/katalog" className="bmn-link-btn" style={{ background: '#A50000' }}>
          <span>{t.home.drawer.catalog}</span>
          <span>→</span>
        </Link>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('engineering')}>
          <span>{t.home.drawer.engineering}</span>
          <span>↗</span>
        </button>
        <button type="button" className="bmn-link-btn" onClick={() => openModal('faq')}>
          <span>{t.home.drawer.faq}</span>
          <span>↗</span>
        </button>
        <Link href="/dashboard" className="bmn-link-btn" style={{ background: '#F0F0F0', color: '#080808' }}>
          <span>{t.home.drawer.portal}</span>
          <span>→</span>
        </Link>
        <a
          href={ITEMSATIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bmn-link-btn"
        >
          <span>{t.home.drawer.itemsatis}</span>
          <span>↗</span>
        </a>
        <Link href="/iletisim" className="bmn-link-btn">
          <span>İLETİŞİM (MAİL)</span>
          <span>→</span>
        </Link>
        <Link href="/status" className="bmn-link-btn">
          <span>{t.home.drawer.status}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ===============================================================
           ARCHITECTURAL NOIR BLADE DIRECTORY (INTEGRATED RIGHT FACADE SIGN)
           =============================================================== */}
      <main className="living-room-hotspots" aria-label="Şehir Yönlendirme Tabelası">
        <aside className="px-blade-directory" aria-label="Şehir Yönlendirme Tabelası">
          <div className="px-blade-header">
            <span className="px-blade-pulse" aria-hidden="true" />
            <span className="px-blade-eyebrow">RESTRICTED // DİZİN</span>
          </div>

          <div className="px-blade-list">
            {PIXEL_ROOM_HOTSPOTS.map((spot) => {
              const isActive =
                spot.action.type === 'modal' && activeModal === spot.action.modal;
              const itemClass = `px-blade-item px-blade-item--${spot.tone} ${
                isActive ? 'is-active' : ''
              }`;

              if (spot.action.type === 'route') {
                return (
                  <Link key={spot.id} href={spot.action.href} className={itemClass}>
                    <span className="px-blade-num">{spot.shortNum}</span>
                    <span className="px-blade-text">{spot.badge}</span>
                    <span className="px-blade-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                );
              }

              const modalTarget = spot.action.modal;
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={itemClass}
                  onClick={() => openModal(modalTarget)}
                >
                  <span className="px-blade-num">{spot.shortNum}</span>
                  <span className="px-blade-text">{spot.badge}</span>
                  <span className="px-blade-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </main>

      {/* ===============================================================
           IN-VIEWPORT NOIR MODALS
           =============================================================== */}
      {activeModal && (
        <div
          className="noir-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div className="noir-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="noir-modal-head">
              <div>
                <p className="noir-modal-eyebrow">
                  {activeModal === 'about' && t.home.modals.aboutEyebrow}
                  {activeModal === 'solutions' && t.home.modals.solutionsEyebrow}
                  {activeModal === 'engineering' && t.home.modals.engineeringEyebrow}
                  {activeModal === 'faq' && t.home.modals.faqEyebrow}
                </p>
                <h2 className="noir-modal-title">
                  {activeModal === 'about' && t.home.modals.aboutTitle}
                  {activeModal === 'solutions' && t.home.modals.solutionsTitle}
                  {activeModal === 'engineering' && t.home.modals.engineeringTitle}
                  {activeModal === 'faq' && t.home.modals.faqTitle}
                </h2>
              </div>
              <button
                type="button"
                className="noir-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label={t.common.close}
              >
                ✕
              </button>
            </div>

            {activeModal === 'about' && (
              <div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'rgba(240,240,240,0.85)', marginBottom: '12px' }}>
                  <strong>{t.home.modals.aboutLeadBold}</strong>
                  {t.home.modals.aboutLeadRest}
                </p>

                <div className="noir-modal-grid-3">
                  {t.home.modals.aboutCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <table className="noir-compare-table">
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
              </div>
            )}

            {activeModal === 'solutions' && (
              <div>
                <div className="noir-modal-grid-2">
                  {t.home.modals.solutionsCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                      <div className="noir-chip-row">
                        <span className="noir-chip">{card.chips[0]}</span>
                        <span className="noir-chip">{card.chips[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    border: '1.5px solid rgba(240,240,240,0.28)',
                    background: '#0e0e0e',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    <span>
                      {t.home.modals.archiveDistribution} ({formatNumber(catalogStats.total)}{' '}
                      {t.home.modals.archivePackagesUnit})
                    </span>
                    <Link href="/katalog" style={{ color: '#A50000', textDecoration: 'underline' }}>
                      {t.home.modals.openCatalogLink}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {statRows.map(([cat, count]) => {
                      const pct = Math.round((count / catalogStats.total) * 100);
                      return (
                        <div key={cat}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              marginBottom: '3px',
                            }}
                          >
                            <span>{t.catalog.categoryLabels[cat] || cat}</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatNumber(count)} ({formatPercent(pct)})
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#080808', border: '1px solid rgba(240,240,240,0.2)' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: '#A50000',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'engineering' && (
              <div>
                <div className="noir-modal-grid-3" style={{ marginTop: 0, marginBottom: '16px' }}>
                  {t.home.modals.engineeringCards.map((card) => (
                    <div key={card.title} className="noir-info-box">
                      <h4>{card.title}</h4>
                      <p>{card.body}</p>
                    </div>
                  ))}
                </div>

                <div className="noir-code-tabs">
                  {(Object.keys(codeSnippets) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`noir-code-tab ${codeTab === key ? 'active' : ''}`}
                      onClick={() => setCodeTab(key)}
                    >
                      {codeSnippets[key].label}
                    </button>
                  ))}
                </div>

                <pre className="noir-code-pre">
                  <code>{codeSnippets[codeTab].code}</code>
                </pre>
              </div>
            )}

            {activeModal === 'faq' && (
              <div>
                {t.home.modals.faqItems.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className={`noir-faq-item ${isOpen ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="noir-faq-trigger"
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className="noir-faq-body">{item.a}</div>}
                    </div>
                  );
                })}

                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <Link href="/katalog" className="btn btn-itemsatis" style={{ flex: '1 1 200px' }}>
                    {t.home.modals.goToCatalog}
                  </Link>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-discord-solid"
                    style={{ flex: '1 1 200px' }}
                  >
                    {t.home.modals.itemsatisLink}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
