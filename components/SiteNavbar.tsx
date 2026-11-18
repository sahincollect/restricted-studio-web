'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Locale } from '@/lib/i18n';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

interface NavLabels {
  home: string;
  catalog: string;
  licenses: string;
  about: string;
  status: string;
  contact: string;
  portal: string;
  itemsatis: string;
  cart: string;
  openMenu: string;
  closeMenu: string;
}

const NAV_COPY: Record<Locale, NavLabels> = {
  tr: {
    home: 'Ana Sayfa',
    catalog: 'Katalog',
    licenses: 'Lisanslar',
    about: 'Hakkımızda',
    status: 'Durum',
    contact: 'İletişim',
    portal: 'Müşteri Portalı',
    itemsatis: 'İtemsatış Mağazası',
    cart: 'Sepet',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
  },
  en: {
    home: 'Home',
    catalog: 'Catalog',
    licenses: 'Licenses',
    about: 'About',
    status: 'Status',
    contact: 'Contact',
    portal: 'Client Portal',
    itemsatis: 'İtemsatış Store',
    cart: 'Cart',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    licenses: 'Лицензии',
    about: 'О нас',
    status: 'Статус',
    contact: 'Контакты',
    portal: 'Портал',
    itemsatis: 'Магазин İtemsatış',
    cart: 'Корзина',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
  },
  fr: {
    home: 'Accueil',
    catalog: 'Catalogue',
    licenses: 'Licences',
    about: 'À propos',
    status: 'Statut',
    contact: 'Contact',
    portal: 'Portail Client',
    itemsatis: 'Boutique İtemsatış',
    cart: 'Panier',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
};

export interface SiteNavbarProps {
  activePath?: '/' | '/katalog' | '/lisanslar' | '/hakkimizda' | '/status' | '/iletisim' | '/dashboard' | '/login';
  mainOrigin?: string;
  cartCount?: number;
  onCartOpen?: () => void;
}

export default function SiteNavbar({
  activePath,
  mainOrigin = '',
  cartCount = 0,
  onCartOpen,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const labels = NAV_COPY[locale] || NAV_COPY.tr;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = activePath || pathname || '/';
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navItems: { href: string; label: string; isStatusRoute?: boolean }[] = [
    { href: '/', label: labels.home },
    { href: '/katalog', label: labels.catalog },
    { href: '/lisanslar', label: labels.licenses },
    { href: '/hakkimizda', label: labels.about },
    { href: '/status', label: labels.status, isStatusRoute: true },
    { href: '/iletisim', label: labels.contact },
  ];

  const isActive = (href: string) => {
    if (href === '/') return current === '/';
    return current === href || current.startsWith(`${href}/`);
  };

  const renderLink = (href: string, className: string, content: React.ReactNode, onClick?: () => void, isStatusRoute?: boolean) => {
    if (mainOrigin && !isStatusRoute) {
      return (
        <a key={href} href={siteLink(href)} className={className} onClick={onClick}>
          {content}
        </a>
      );
    }
    return (
      <Link key={href} href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <header className="st-navbar-wrap" id="navbar">
        <div className="st-navbar">
          <div className="st-nav-left">
            {mainOrigin ? (
              <a href={siteLink('/')} className="st-brand-link" aria-label={`Restricted Studio ${labels.home}`}>
                <img
                  src="/assets/newlogo.png"
                  alt="Restricted Studio"
                  width={34}
                  height={34}
                  className="st-brand-mark"
                />
                <span className="st-brand-name">RESTRICTED STUDIO</span>
              </a>
            ) : (
              <Link href="/" className="st-brand-link" aria-label={`Restricted Studio ${labels.home}`}>
                <img
                  src="/assets/newlogo.png"
                  alt="Restricted Studio"
                  width={34}
                  height={34}
                  className="st-brand-mark"
                />
                <span className="st-brand-name">RESTRICTED STUDIO</span>
              </Link>
            )}
          </div>

          <nav className="st-nav-center" aria-label={labels.home}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return renderLink(
                item.href,
                `st-nav-link ${active ? 'is-active' : ''}`,
                <>
                  <span>{item.label}</span>
                  {active && <span className="st-nav-dot" aria-hidden="true" />}
                </>,
                undefined,
                item.isStatusRoute
              );
            })}
          </nav>

          <div className="st-nav-right">
            {onCartOpen && (
              <button
                type="button"
                onClick={onCartOpen}
                className={`st-nav-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
                aria-label={labels.cart}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
                <span>{labels.cart}</span>
                {cartCount > 0 && <span className="st-nav-cart-count">{cartCount}</span>}
              </button>
            )}

            <div className="st-nav-lang-desktop">
              <LanguageSwitcher compact />
            </div>

            <div className="st-nav-circles">
              {mainOrigin ? (
                <a
                  href={siteLink('/iletisim')}
                  className="st-circle-btn"
                  title={labels.contact}
                  aria-label={labels.contact}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              ) : (
                <Link
                  href="/iletisim"
                  className="st-circle-btn"
                  title={labels.contact}
                  aria-label={labels.contact}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </Link>
              )}

              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="st-circle-btn"
                title={labels.itemsatis}
                aria-label={labels.itemsatis}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                  <path d="M3 9l2-5h14l2 5" />
                  <path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </a>

              {mainOrigin ? (
                <a
                  href={siteLink('/dashboard')}
                  className="st-circle-btn"
                  title={labels.portal}
                  aria-label={labels.portal}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </a>
              ) : (
                <Link
                  href="/dashboard"
                  className="st-circle-btn"
                  title={labels.portal}
                  aria-label={labels.portal}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </Link>
              )}
            </div>

            <button
              type="button"
              className={`st-mobile-toggle ${drawerOpen ? 'is-open' : ''}`}
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? labels.closeMenu : labels.openMenu}
              aria-expanded={drawerOpen}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="st-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={labels.openMenu}
        >
          <div className="st-mobile-drawer-head">
            <span className="st-mobile-drawer-label">{t.common.langLabel}</span>
            <LanguageSwitcher compact />
          </div>

          <div className="st-mobile-drawer-links">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return renderLink(
                item.href,
                `st-mobile-link ${active ? 'is-active' : ''}`,
                <>
                  <span>{item.label}</span>
                  <span aria-hidden="true">→</span>
                </>,
                () => setDrawerOpen(false),
                item.isStatusRoute
              );
            })}
          </div>

          <div className="st-mobile-drawer-ctas">
            {onCartOpen && (
              <button
                type="button"
                className="st-pill-btn is-light is-full"
                onClick={() => {
                  setDrawerOpen(false);
                  onCartOpen();
                }}
              >
                {labels.cart} ({cartCount})
              </button>
            )}

            {mainOrigin ? (
              <a
                href={siteLink('/dashboard')}
                className="st-pill-btn is-ember is-full"
                onClick={() => setDrawerOpen(false)}
              >
                {labels.portal} →
              </a>
            ) : (
              <Link
                href="/dashboard"
                className="st-pill-btn is-ember is-full"
                onClick={() => setDrawerOpen(false)}
              >
                {labels.portal} →
              </Link>
            )}

            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="st-pill-btn is-outline is-full"
            >
              {labels.itemsatis} ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
