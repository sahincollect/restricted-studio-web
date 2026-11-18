'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Locale } from '@/lib/i18n';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

interface CatalogChoice {
  href: string;
  tag: string;
  title: string;
  desc: string;
}

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
  catalogChoicesTitle: string;
  catalogChoices: CatalogChoice[];
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
    catalogChoicesTitle: 'İLERLEMEK İSTEDİĞİNİZ ALANI SEÇİN',
    catalogChoices: [
      {
        href: '/lisanslar',
        tag: 'VİTRİN · İTEMSATIŞ',
        title: 'Lisanslar',
        desc: 'Dijital yazılım abonelikleri ve mağaza ilanları',
      },
      {
        href: '/katalog',
        tag: '6.446+ AÇIK KAYNAK',
        title: 'FiveM / RedM',
        desc: 'Script, MLO, Araç Paketleri, Kıyafet & Mod arşivi',
      },
      {
        href: '/hizmetler/web-kurulum',
        tag: 'HİZMET · FORM',
        title: 'Web Sitesi Kurulum Hizmeti',
        desc: 'Size özel kurumsal site veya topluluk portalı başvurusu',
      },
      {
        href: '/hizmetler/discord-bot',
        tag: 'HİZMET · FORM',
        title: 'Discord Bot Hizmetleri',
        desc: 'FiveM/RedM SQL bağlantılı ve özel bot talebi',
      },
    ],
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
    catalogChoicesTitle: 'CHOOSE YOUR DESTINATION',
    catalogChoices: [
      {
        href: '/lisanslar',
        tag: 'SHOWCASE · İTEMSATIŞ',
        title: 'Licenses',
        desc: 'Digital subscriptions & verified store listings',
      },
      {
        href: '/katalog',
        tag: '6,446+ OPEN SOURCE',
        title: 'FiveM / RedM',
        desc: 'Scripts, MLO interiors, vehicles & EUP packages',
      },
      {
        href: '/hizmetler/web-kurulum',
        tag: 'SERVICE · BRIEF',
        title: 'Website Setup Service',
        desc: 'Request a custom Next.js portal or store build',
      },
      {
        href: '/hizmetler/discord-bot',
        tag: 'SERVICE · BRIEF',
        title: 'Discord Bot Services',
        desc: 'Custom whitelist, ticket & SQL-linked Discord bots',
      },
    ],
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
    catalogChoicesTitle: 'ВЫБЕРИТЕ НАПРАВЛЕНИЕ',
    catalogChoices: [
      {
        href: '/lisanslar',
        tag: 'ВИТРИНА · İTEMSATIŞ',
        title: 'Лицензии',
        desc: 'Цифровые подписки и проверенные объявления',
      },
      {
        href: '/katalog',
        tag: '6 446+ ПАКЕТОВ',
        title: 'FiveM / RedM',
        desc: 'Скрипты, интерьеры MLO, авто и одежда EUP',
      },
      {
        href: '/hizmetler/web-kurulum',
        tag: 'УСЛУГА · ЗАЯВКА',
        title: 'Создание веб-сайта',
        desc: 'Индивидуальный сайт или портал под ключ',
      },
      {
        href: '/hizmetler/discord-bot',
        tag: 'УСЛУГА · ЗАЯВКА',
        title: 'Услуги Discord-ботов',
        desc: 'Кастомные боты и интеграция с FiveM/RedM',
      },
    ],
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
    catalogChoicesTitle: 'CHOISISSEZ VOTRE SECTION',
    catalogChoices: [
      {
        href: '/lisanslar',
        tag: 'VITRINE · İTEMSATIŞ',
        title: 'Licences',
        desc: 'Abonnements numériques & offres vérifiées',
      },
      {
        href: '/katalog',
        tag: '6 446+ OPEN SOURCE',
        title: 'FiveM / RedM',
        desc: 'Scripts, intérieurs MLO, véhicules & tenues EUP',
      },
      {
        href: '/hizmetler/web-kurulum',
        tag: 'SERVICE · FORMULAIRE',
        title: 'Création de Site Web',
        desc: 'Demande de site sur mesure ou boutique dédiée',
      },
      {
        href: '/hizmetler/discord-bot',
        tag: 'SERVICE · FORMULAIRE',
        title: 'Services Bot Discord',
        desc: 'Bots personnalisés et passerelle FiveM/RedM',
      },
    ],
  },
};

export interface SiteNavbarProps {
  activePath?:
    | '/'
    | '/katalog'
    | '/lisanslar'
    | '/hakkimizda'
    | '/status'
    | '/iletisim'
    | '/dashboard'
    | '/login'
    | '/hizmetler/web-kurulum'
    | '/hizmetler/discord-bot';
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
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const catalogDropRef = useRef<HTMLDivElement | null>(null);

  const current = activePath || pathname || '/';
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  useEffect(() => {
    setDrawerOpen(false);
    setCatalogMenuOpen(false);
    if (current.startsWith('/katalog') || current.startsWith('/hizmetler')) {
      setMobileCatalogOpen(true);
    }
  }, [pathname, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setCatalogMenuOpen(false);
      }
    };
    const onOutsideClick = (e: MouseEvent) => {
      if (catalogDropRef.current && !catalogDropRef.current.contains(e.target as Node)) {
        setCatalogMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutsideClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutsideClick);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return current === '/';
    if (href === '/katalog') {
      return current === '/katalog' || current.startsWith('/katalog/') || current.startsWith('/hizmetler/');
    }
    return current === href || current.startsWith(`${href}/`);
  };

  const renderLink = (
    href: string,
    className: string,
    content: React.ReactNode,
    onClick?: () => void,
    isStatusRoute?: boolean
  ) => {
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

  const renderChoiceLink = (choice: CatalogChoice, className: string, onClick?: () => void) => {
    const body = (
      <>
        <div className="st-cat-choice-main">
          <span className="st-cat-choice-tag">{choice.tag}</span>
          <strong className="st-cat-choice-title">{choice.title}</strong>
          <span className="st-cat-choice-desc">{choice.desc}</span>
        </div>
        <span className="st-cat-choice-arrow" aria-hidden="true">
          →
        </span>
      </>
    );

    if (mainOrigin) {
      return (
        <a key={choice.href} href={siteLink(choice.href)} className={className} onClick={onClick}>
          {body}
        </a>
      );
    }
    return (
      <Link key={choice.href} href={choice.href} className={className} onClick={onClick}>
        {body}
      </Link>
    );
  };

  const plainNavItems: { href: string; label: string; isStatusRoute?: boolean }[] = [
    { href: '/lisanslar', label: labels.licenses },
    { href: '/hakkimizda', label: labels.about },
    { href: '/status', label: labels.status, isStatusRoute: true },
    { href: '/iletisim', label: labels.contact },
  ];

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
            {renderLink(
              '/',
              `st-nav-link ${isActive('/') ? 'is-active' : ''}`,
              <>
                <span>{labels.home}</span>
                {isActive('/') && <span className="st-nav-dot" aria-hidden="true" />}
              </>
            )}

            <div className="st-nav-dropdown-wrap" ref={catalogDropRef}>
              <button
                type="button"
                className={`st-nav-link st-nav-dropdown-trigger ${
                  isActive('/katalog') || catalogMenuOpen ? 'is-active' : ''
                }`}
                onClick={() => setCatalogMenuOpen((prev) => !prev)}
                aria-expanded={catalogMenuOpen}
                aria-haspopup="menu"
              >
                <span>{labels.catalog}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className={`st-nav-caret ${catalogMenuOpen ? 'is-open' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {isActive('/katalog') && <span className="st-nav-dot" aria-hidden="true" />}
              </button>

              {catalogMenuOpen && (
                <div className="st-catalog-dropdown" role="menu" aria-label={labels.catalog}>
                  <div className="st-catalog-dropdown-head">{labels.catalogChoicesTitle}</div>
                  <div className="st-catalog-dropdown-grid">
                    {labels.catalogChoices.map((choice) =>
                      renderChoiceLink(
                        choice,
                        `st-cat-choice-card ${current === choice.href ? 'is-current' : ''}`,
                        () => setCatalogMenuOpen(false)
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {plainNavItems.map((item) => {
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  aria-hidden="true"
                >
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
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2.2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </a>
              ) : (
                <Link
                  href="/iletisim"
                  className="st-circle-btn"
                  title={labels.contact}
                  aria-label={labels.contact}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2.2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </Link>
              )}

              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="st-circle-btn st-circle-itemsatis"
                title={labels.itemsatis}
                aria-label={labels.itemsatis}
              >
                <img
                  src="/assets/itemsatis-icon.png"
                  alt="İtemsatış"
                  width={18}
                  height={18}
                  style={{ borderRadius: '4px', objectFit: 'contain' }}
                />
              </a>

              {mainOrigin ? (
                <a
                  href={siteLink('/dashboard')}
                  className="st-circle-btn"
                  title={labels.portal}
                  aria-label={labels.portal}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    aria-hidden="true"
                  >
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
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    aria-hidden="true"
                  >
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
            {renderLink(
              '/',
              `st-mobile-link ${isActive('/') ? 'is-active' : ''}`,
              <>
                <span>{labels.home}</span>
                <span aria-hidden="true">→</span>
              </>,
              () => setDrawerOpen(false)
            )}

            <div className="st-mobile-cat-group">
              <button
                type="button"
                className={`st-mobile-link st-mobile-cat-toggle ${isActive('/katalog') ? 'is-active' : ''}`}
                onClick={() => setMobileCatalogOpen((p) => !p)}
                aria-expanded={mobileCatalogOpen}
              >
                <span>{labels.catalog}</span>
                <span aria-hidden="true">{mobileCatalogOpen ? '−' : '+'}</span>
              </button>

              {mobileCatalogOpen && (
                <div className="st-mobile-cat-choices">
                  {labels.catalogChoices.map((choice) =>
                    renderChoiceLink(
                      choice,
                      `st-mobile-subchoice ${current === choice.href ? 'is-active' : ''}`,
                      () => setDrawerOpen(false)
                    )
                  )}
                </div>
              )}
            </div>

            {plainNavItems.map((item) => {
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
