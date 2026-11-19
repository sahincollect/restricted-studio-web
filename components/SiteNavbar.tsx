'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MessagingCenterModal from '@/components/MessagingCenterModal';
import type { Locale } from '@/lib/i18n';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

interface CatalogChoice {
  href: string;
  badge: string;
  title: string;
  desc: string;
  icon: 'code' | 'key' | 'web' | 'bot';
}

function renderChoiceIcon(icon: CatalogChoice['icon']) {
  switch (icon) {
    case 'code':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'key':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="M21 2l-9.6 9.6" />
          <path d="M15.5 7.5l3 3L22 7l-3-3" />
        </svg>
      );
    case 'web':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <circle cx="7" cy="6.5" r="0.8" fill="currentColor" />
          <circle cx="10" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'bot':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <path d="M12 7V3" />
          <circle cx="9.5" cy="13" r="1.2" fill="currentColor" />
          <circle cx="14.5" cy="13" r="1.2" fill="currentColor" />
        </svg>
      );
  }
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
    catalogChoicesTitle: 'KATALOG VE HİZMETLER',
    catalogChoices: [
      {
        href: '/katalog',
        badge: '6.446+',
        title: 'FiveM / RedM',
        desc: 'Script, MLO, Araç Paketleri, Kıyafet & Mod arşivi',
        icon: 'code',
      },
      {
        href: '/lisanslar',
        badge: '19 İlan',
        title: 'Lisanslar',
        desc: 'Yapay zeka, tasarım & medya dijital abonelikleri',
        icon: 'key',
      },
      {
        href: '/hizmetler/web-kurulum',
        badge: 'HİZMET',
        title: 'Web Sitesi Kurulum Hizmeti',
        desc: 'Markaya veya sunucuya özel Next.js site başvurusu',
        icon: 'web',
      },
      {
        href: '/hizmetler/discord-bot',
        badge: 'HİZMET',
        title: 'Discord Bot Hizmetleri',
        desc: 'SQL/txAdmin bağlantılı ve özel otomasyon botları',
        icon: 'bot',
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
    catalogChoicesTitle: 'CATALOG & SERVICES',
    catalogChoices: [
      {
        href: '/katalog',
        badge: '6,446+',
        title: 'FiveM / RedM',
        desc: 'Scripts, MLO interiors, vehicles & EUP packages',
        icon: 'code',
      },
      {
        href: '/lisanslar',
        badge: '19 Packs',
        title: 'Licenses',
        desc: 'Verified AI, design & media digital subscriptions',
        icon: 'key',
      },
      {
        href: '/hizmetler/web-kurulum',
        badge: 'SERVICE',
        title: 'Website Setup Service',
        desc: 'Custom Next.js storefront or community portal brief',
        icon: 'web',
      },
      {
        href: '/hizmetler/discord-bot',
        badge: 'SERVICE',
        title: 'Discord Bot Services',
        desc: 'Whitelist, ticket & SQL-linked Discord automation',
        icon: 'bot',
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
    catalogChoicesTitle: 'КАТАЛОГ И УСЛУГИ',
    catalogChoices: [
      {
        href: '/katalog',
        badge: '6 446+',
        title: 'FiveM / RedM',
        desc: 'Скрипты, интерьеры MLO, авто и одежда EUP',
        icon: 'code',
      },
      {
        href: '/lisanslar',
        badge: '19',
        title: 'Лицензии',
        desc: 'AI-подписки, софт и дизайн-инструменты İtemsatış',
        icon: 'key',
      },
      {
        href: '/hizmetler/web-kurulum',
        badge: 'УСЛУГА',
        title: 'Создание веб-сайта',
        desc: 'Заявка на разработку сайта или портала под ключ',
        icon: 'web',
      },
      {
        href: '/hizmetler/discord-bot',
        badge: 'УСЛУГА',
        title: 'Услуги Discord-ботов',
        desc: 'Кастомные боты и интеграция с FiveM/RedM',
        icon: 'bot',
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
    catalogChoicesTitle: 'CATALOGUE & SERVICES',
    catalogChoices: [
      {
        href: '/katalog',
        badge: '6 446+',
        title: 'FiveM / RedM',
        desc: 'Scripts, intérieurs MLO, véhicules & tenues EUP',
        icon: 'code',
      },
      {
        href: '/lisanslar',
        badge: '19',
        title: 'Licences',
        desc: 'Abonnements IA, design & médias vérifiés',
        icon: 'key',
      },
      {
        href: '/hizmetler/web-kurulum',
        badge: 'SERVICE',
        title: 'Création de Site Web',
        desc: 'Demande de site Next.js sur mesure ou vitrine',
        icon: 'web',
      },
      {
        href: '/hizmetler/discord-bot',
        badge: 'SERVICE',
        title: 'Services Bot Discord',
        desc: 'Bots personnalisés et passerelle FiveM/RedM',
        icon: 'bot',
      },
    ],
  },
};

const ACCOUNT_NAV_COPY: Record<
  Locale,
  {
    account: string;
    guest: string;
    loginBtn: string;
    viewProfile: string;
    logout: string;
    loggingOut: string;
    ordersBadge: (n: number) => string;
    notificationsTitle: string;
    notificationsEmpty: string;
    markAllRead: string;
    messagesBtn: string;
  }
> = {
  tr: {
    account: 'Hesabım',
    guest: 'Misafir Hesap',
    loginBtn: 'Giriş Yap / Hesap',
    viewProfile: 'Profili Gör',
    logout: 'Çıkış',
    loggingOut: 'Çıkış yapılıyor...',
    ordersBadge: (n) => `${n} aktif sipariş`,
    notificationsTitle: 'Bildirimler',
    notificationsEmpty: 'Yeni bildiriminiz bulunmuyor.',
    markAllRead: 'Tümünü Oku',
    messagesBtn: 'Canlı Mesajlaşma',
  },
  en: {
    account: 'My Account',
    guest: 'Guest Account',
    loginBtn: 'Sign In / Account',
    viewProfile: 'View Profile',
    logout: 'Sign Out',
    loggingOut: 'Signing out...',
    ordersBadge: (n) => `${n} active orders`,
    notificationsTitle: 'Notifications',
    notificationsEmpty: 'No new notifications yet.',
    markAllRead: 'Mark All Read',
    messagesBtn: 'Messages',
  },
  ru: {
    account: 'Аккаунт',
    guest: 'Гость',
    loginBtn: 'Войти / Аккаунт',
    viewProfile: 'Открыть профиль',
    logout: 'Выйти',
    loggingOut: 'Выход...',
    ordersBadge: (n) => `Активных заказов: ${n}`,
    notificationsTitle: 'Уведомления',
    notificationsEmpty: 'Новых уведомлений пока нет.',
    markAllRead: 'Прочитать все',
    messagesBtn: 'Сообщения',
  },
  fr: {
    account: 'Mon compte',
    guest: 'Compte invité',
    loginBtn: 'Connexion / Compte',
    viewProfile: 'Voir le profil',
    logout: 'Déconnexion',
    loggingOut: 'Déconnexion...',
    ordersBadge: (n) => `${n} commande(s) active(s)`,
    notificationsTitle: 'Notifications',
    notificationsEmpty: 'Aucune nouvelle notification.',
    markAllRead: 'Tout marquer lu',
    messagesBtn: 'Messagerie',
  },
};

const NAV_AVATAR_PRESETS: Record<string, string> = {
  'preset:ember': 'linear-gradient(135deg,#ef5b38,#8f2612)',
  'preset:crimson': 'linear-gradient(135deg,#A50000,#3d0808)',
  'preset:obsidian': 'linear-gradient(135deg,#27272a,#09090b)',
  'preset:minimal': 'linear-gradient(135deg,#1f2937,#0f172a)',
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
    | '/hesabim'
    | '/siparisler'
    | '/login'
    | '/hizmetler/web-kurulum'
    | '/hizmetler/discord-bot'
    | `/yasal/${string}`;
  mainOrigin?: string;
  cartCount?: number;
  onCartOpen?: () => void;
}

interface AccountNavSummary {
  authenticated: boolean;
  displayName?: string;
  avatarUrl?: string;
  isGuest?: boolean;
  pendingOrdersCount?: number;
}

interface NavNotificationItem {
  id: string;
  referenceCode?: string | null;
  kind?: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
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
  const accountCopy = ACCOUNT_NAV_COPY[locale] || ACCOUNT_NAV_COPY.tr;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msgModalInitialRef, setMsgModalInitialRef] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NavNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountSummary, setAccountSummary] = useState<AccountNavSummary | null>(null);
  const catalogDropRef = useRef<HTMLDivElement | null>(null);
  const accountDropRef = useRef<HTMLDivElement | null>(null);
  const notifDropRef = useRef<HTMLDivElement | null>(null);

  const unreadMsgCount = notifications.filter((n) => !n.readAt && n.kind === 'admin_message').length;

  const openMessagingCenter = (refCode: string | null = null) => {
    setCatalogMenuOpen(false);
    setAccountMenuOpen(false);
    setNotifMenuOpen(false);
    setDrawerOpen(false);
    setMsgModalInitialRef(refCode);
    setMsgModalOpen(true);
  };

  useEffect(() => {
    if (mainOrigin || typeof window === 'undefined') return;
    const chatParam = new URLSearchParams(window.location.search).get('chat');
    if (chatParam) {
      setMsgModalInitialRef(chatParam === 'open' ? null : chatParam);
      setMsgModalOpen(true);
    }
  }, [mainOrigin, pathname]);

  const current = activePath || pathname || '/';
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  useEffect(() => {
    setDrawerOpen(false);
    setCatalogMenuOpen(false);
    setAccountMenuOpen(false);
    setNotifMenuOpen(false);
    setMobileAccountOpen(false);
    if (current.startsWith('/katalog') || current.startsWith('/lisanslar') || current.startsWith('/hizmetler')) {
      setMobileCatalogOpen(true);
    }
  }, [pathname, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setCatalogMenuOpen(false);
        setAccountMenuOpen(false);
        setNotifMenuOpen(false);
      }
    };
    const onOutsideClick = (e: MouseEvent) => {
      if (catalogDropRef.current && !catalogDropRef.current.contains(e.target as Node)) {
        setCatalogMenuOpen(false);
      }
      if (accountDropRef.current && !accountDropRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (notifDropRef.current && !notifDropRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutsideClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutsideClick);
    };
  }, []);

  const handleAccountLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ scope: 'current' }),
      });
    } catch {
      // ignore network error; proceed to clear UI state
    }
    setAccountSummary({ authenticated: false });
    setAccountMenuOpen(false);
    setMobileAccountOpen(false);
    setDrawerOpen(false);
    setLoggingOut(false);
    if (
      current.startsWith('/hesabim') ||
      current.startsWith('/dashboard') ||
      current.startsWith('/siparisler')
    ) {
      window.location.replace('/login?clear_session=1');
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (mainOrigin) return;
    let cancelled = false;
    const pullSummary = () => {
      fetch('/api/account?summary=1', { cache: 'no-store', credentials: 'same-origin' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data && data.authenticated) {
            setAccountSummary({
              authenticated: true,
              displayName: data.profile?.displayName || 'Üye',
              avatarUrl: data.profile?.avatarUrl || 'preset:ember',
              isGuest: Boolean(data.profile?.isGuest),
              pendingOrdersCount: Number(data.pendingOrdersCount || 0),
            });
          }
        })
        .catch(() => undefined);
    };
    pullSummary();
    const onAccountUpdated = (ev: Event) => {
      const detail = (ev as CustomEvent<{ displayName?: string; avatarUrl?: string | null; isGuest?: boolean }>).detail;
      if (detail?.displayName) {
        setAccountSummary((prev) => ({
          authenticated: true,
          displayName: detail.displayName,
          avatarUrl: detail.avatarUrl || prev?.avatarUrl || 'preset:ember',
          isGuest: detail.isGuest ?? prev?.isGuest,
          pendingOrdersCount: prev?.pendingOrdersCount ?? 0,
        }));
      } else {
        pullSummary();
      }
    };
    window.addEventListener('rs-account-updated', onAccountUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('rs-account-updated', onAccountUpdated);
    };
  }, [mainOrigin, pathname]);

  useEffect(() => {
    if (mainOrigin || !accountSummary?.authenticated) return;
    let cancelled = false;
    const pullNotifications = () => {
      fetch('/api/notifications', { cache: 'no-store', credentials: 'same-origin' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.success) {
            setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
            setUnreadCount(Number(data.unreadCount || 0));
          }
        })
        .catch(() => undefined);
    };
    pullNotifications();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') pullNotifications();
    }, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [mainOrigin, accountSummary?.authenticated]);

  const handleMarkNotificationsRead = async (notificationId?: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'mark_read', notificationId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } catch {
      // ignore
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return current === '/';
    if (href === '/katalog') {
      return (
        current === '/katalog' ||
        current.startsWith('/katalog/') ||
        current === '/lisanslar' ||
        current.startsWith('/hizmetler/')
      );
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
        <span className="st-cat-choice-icon" aria-hidden="true">
          {renderChoiceIcon(choice.icon)}
        </span>
        <div className="st-cat-choice-main">
          <div className="st-cat-choice-title-row">
            <strong className="st-cat-choice-title">{choice.title}</strong>
            <span className="st-cat-choice-badge">{choice.badge}</span>
          </div>
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
                <Image
                  src="/assets/newlogo.png"
                  alt="Restricted Studio"
                  width={34}
                  height={34}
                  sizes="34px"
                  priority
                  className="st-brand-mark"
                />
                <span className="st-brand-name">RESTRICTED STUDIO</span>
              </a>
            ) : (
              <Link href="/" className="st-brand-link" aria-label={`Restricted Studio ${labels.home}`}>
                <Image
                  src="/assets/newlogo.png"
                  alt="Restricted Studio"
                  width={34}
                  height={34}
                  sizes="34px"
                  priority
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
              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="st-circle-btn st-circle-itemsatis"
                title={labels.itemsatis}
                aria-label={labels.itemsatis}
              >
                <Image
                  src="/assets/itemsatis-icon.png"
                  alt="İtemsatış"
                  width={18}
                  height={18}
                  sizes="18px"
                  style={{ borderRadius: '4px', objectFit: 'contain' }}
                />
              </a>

              {mainOrigin ? (
                <a
                  href={siteLink('/?chat=open')}
                  className="st-circle-btn"
                  title={accountCopy.messagesBtn}
                  aria-label={accountCopy.messagesBtn}
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
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openMessagingCenter(null)}
                  className="st-circle-btn st-circle-msg"
                  title={accountCopy.messagesBtn}
                  aria-label={accountCopy.messagesBtn}
                  style={{ position: 'relative' }}
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
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  {unreadMsgCount > 0 && (
                    <span className="st-notif-badge">{unreadMsgCount > 9 ? '9+' : unreadMsgCount}</span>
                  )}
                </button>
              )}

              {mainOrigin ? (
                <a
                  href={siteLink('/hesabim')}
                  className="st-circle-btn"
                  title={accountCopy.account}
                  aria-label={accountCopy.account}
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
              ) : accountSummary?.authenticated ? (
                <>
                  <div className="st-nav-account-wrap" ref={notifDropRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifMenuOpen((prev) => !prev);
                        setAccountMenuOpen(false);
                      }}
                      className="st-circle-btn"
                      title={accountCopy.notificationsTitle}
                      aria-label={accountCopy.notificationsTitle}
                      aria-expanded={notifMenuOpen}
                      aria-haspopup="menu"
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
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="st-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </button>

                    {notifMenuOpen && (
                      <div className="st-notif-dropdown" role="menu" aria-label={accountCopy.notificationsTitle}>
                        <div className="st-notif-head">
                          <strong style={{ fontSize: '12.5px', color: '#fff' }}>
                            {accountCopy.notificationsTitle} {unreadCount > 0 ? `(${unreadCount})` : ''}
                          </strong>
                          {notifications.length > 0 && (
                            <button
                              type="button"
                              onClick={() => void handleMarkNotificationsRead()}
                              className="st-notif-mark-btn"
                            >
                              {accountCopy.markAllRead}
                            </button>
                          )}
                        </div>

                        <div className="st-notif-list">
                          {notifications.length === 0 ? (
                            <div style={{ padding: '14px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                              {accountCopy.notificationsEmpty}
                            </div>
                          ) : (
                            notifications.slice(0, 8).map((n) =>
                              n.kind === 'admin_message' && n.referenceCode ? (
                                <button
                                  key={n.id}
                                  type="button"
                                  className={`st-notif-item ${!n.readAt ? 'is-unread' : ''}`}
                                  onClick={() => {
                                    if (!n.readAt) void handleMarkNotificationsRead(n.id);
                                    openMessagingCenter(n.referenceCode || null);
                                  }}
                                >
                                  <span className="st-notif-item-title">{n.title}</span>
                                  <span className="st-notif-item-body">{n.body}</span>
                                </button>
                              ) : (
                                <Link
                                  key={n.id}
                                  href={n.href}
                                  prefetch={false}
                                  className={`st-notif-item ${!n.readAt ? 'is-unread' : ''}`}
                                  onClick={() => {
                                    if (!n.readAt) void handleMarkNotificationsRead(n.id);
                                    setNotifMenuOpen(false);
                                  }}
                                >
                                  <span className="st-notif-item-title">{n.title}</span>
                                  <span className="st-notif-item-body">{n.body}</span>
                                </Link>
                              )
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="st-nav-account-wrap" ref={accountDropRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen((prev) => !prev);
                        setNotifMenuOpen(false);
                      }}
                      className="st-circle-btn is-account-active"
                    title={`${accountSummary.displayName || accountCopy.account}${
                      accountSummary.pendingOrdersCount
                        ? ` · ${accountCopy.ordersBadge(accountSummary.pendingOrdersCount)}`
                        : ''
                    }`}
                    aria-label={accountCopy.account}
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                  >
                    {accountSummary.avatarUrl &&
                    (accountSummary.avatarUrl.startsWith('https://') ||
                      accountSummary.avatarUrl.startsWith('data:image/')) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={accountSummary.avatarUrl}
                        alt={accountSummary.displayName || accountCopy.account}
                        width={34}
                        height={34}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '999px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#fff',
                          background:
                            NAV_AVATAR_PRESETS[accountSummary.avatarUrl || 'preset:ember'] ||
                            NAV_AVATAR_PRESETS['preset:ember'],
                        }}
                      >
                        {(accountSummary.displayName || 'Ü').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    {(accountSummary.pendingOrdersCount ?? 0) > 0 && (
                      <span className="st-account-order-dot" aria-hidden="true" />
                    )}
                  </button>

                  {accountMenuOpen && (
                    <div className="st-account-dropdown" role="menu" aria-label={accountCopy.account}>
                      <div className="st-account-drop-head">
                        <strong className="st-account-drop-name">
                          {accountSummary.displayName || accountCopy.account}
                        </strong>
                        {(accountSummary.pendingOrdersCount ?? 0) > 0 && (
                          <span className="st-account-drop-badge">
                            {accountCopy.ordersBadge(accountSummary.pendingOrdersCount || 0)}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/hesabim"
                        prefetch={false}
                        role="menuitem"
                        className="st-account-drop-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <span>{accountCopy.viewProfile}</span>
                        <span aria-hidden="true">→</span>
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void handleAccountLogout()}
                        disabled={loggingOut}
                        className="st-account-drop-item is-danger"
                      >
                        <span>{loggingOut ? accountCopy.loggingOut : accountCopy.logout}</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  className="st-circle-btn"
                  title={accountCopy.loginBtn}
                  aria-label={accountCopy.loginBtn}
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
            {mainOrigin ? (
              <a
                href={siteLink('/?chat=open')}
                className="st-pill-btn is-light is-full"
                onClick={() => setDrawerOpen(false)}
              >
                {accountCopy.messagesBtn} 💬
              </a>
            ) : (
              <button
                type="button"
                className="st-pill-btn is-light is-full"
                onClick={() => openMessagingCenter(null)}
              >
                {accountCopy.messagesBtn}
                {unreadMsgCount > 0 ? ` (${unreadMsgCount})` : ''} 💬
              </button>
            )}

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
                href={siteLink('/hesabim')}
                className="st-pill-btn is-ember is-full"
                onClick={() => setDrawerOpen(false)}
              >
                {accountCopy.account} →
              </a>
            ) : accountSummary?.authenticated ? (
              <div className="st-mobile-account-box">
                <button
                  type="button"
                  className="st-pill-btn is-ember is-full st-mobile-account-trigger"
                  onClick={() => setMobileAccountOpen((p) => !p)}
                  aria-expanded={mobileAccountOpen}
                >
                  <span>
                    {accountSummary.displayName || accountCopy.account}
                    {(accountSummary.pendingOrdersCount ?? 0) > 0
                      ? ` (${accountSummary.pendingOrdersCount})`
                      : ''}
                  </span>
                  <span aria-hidden="true">{mobileAccountOpen ? '−' : '▾'}</span>
                </button>

                {mobileAccountOpen && (
                  <div className="st-mobile-account-submenu">
                    <Link
                      href="/hesabim"
                      prefetch={false}
                      className="st-account-drop-item"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span>{accountCopy.viewProfile}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                    {unreadCount > 0 && (
                      <Link
                        href="/hesabim?tab=orders"
                        prefetch={false}
                        className="st-account-drop-item"
                        onClick={() => {
                          void handleMarkNotificationsRead();
                          setDrawerOpen(false);
                        }}
                      >
                        <span>{accountCopy.notificationsTitle} ({unreadCount})</span>
                        <span aria-hidden="true">🔔</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleAccountLogout()}
                      disabled={loggingOut}
                      className="st-account-drop-item is-danger"
                    >
                      <span>{loggingOut ? accountCopy.loggingOut : accountCopy.logout}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="st-pill-btn is-ember is-full"
                onClick={() => setDrawerOpen(false)}
              >
                {accountCopy.loginBtn} →
              </Link>
            )}

            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="st-pill-btn is-itemsatis is-full"
            >
              <Image
                src="/assets/itemsatis-icon.png"
                alt="İtemsatış"
                width={16}
                height={16}
                sizes="16px"
                style={{ borderRadius: '4px', objectFit: 'contain' }}
              />
              <span>{labels.itemsatis} ↗</span>
            </a>
          </div>
        </div>
      )}

      {!mainOrigin && (
        <MessagingCenterModal
          open={msgModalOpen}
          initialRef={msgModalInitialRef}
          onClose={() => setMsgModalOpen(false)}
        />
      )}
    </>
  );
}
