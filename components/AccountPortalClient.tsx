'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import ShopierLogo from '@/components/ShopierLogo';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import { useI18n } from '@/components/I18nProvider';
import type { DashboardSessionMeta } from '@/lib/customer-session';
import type { UserProfileRecord } from '@/lib/account-store';
import type { OrderMessageRecord, OrderRecord, OrderStatus } from '@/lib/orders-store';
import { formatCountdownMmSs, getOrderRemainingSeconds } from '@/lib/order-timer';
import type { Locale } from '@/lib/i18n';

interface AccountPortalClientProps {
  initialProfile: UserProfileRecord;
  initialOrders: OrderRecord[];
  initialLicenseCount: number;
  initialSessionMeta: DashboardSessionMeta;
  initialTab?: 'orders' | 'profile' | 'security';
  initialOrderRef?: string;
}

const PRESET_AVATARS: Array<{ id: string; label: string; bg: string; border: string }> = [
  { id: 'preset:ember', label: 'Ember', bg: 'linear-gradient(135deg,#ef5b38,#8f2612)', border: '#ef5b38' },
  { id: 'preset:crimson', label: 'Crimson', bg: 'linear-gradient(135deg,#A50000,#3d0808)', border: '#dc2626' },
  { id: 'preset:obsidian', label: 'Obsidian', bg: 'linear-gradient(135deg,#27272a,#09090b)', border: '#71717a' },
  { id: 'preset:minimal', label: 'Carbon', bg: 'linear-gradient(135deg,#1f2937,#0f172a)', border: '#94a3b8' },
];

const STATUS_META: Record<
  Locale,
  Record<OrderStatus, { label: string; tone: 'warn' | 'info' | 'ok' | 'muted' }>
> = {
  tr: {
    pending_payment: { label: 'Ödeme Bekliyor', tone: 'warn' },
    paid: { label: 'Ödendi', tone: 'info' },
    preparing: { label: 'Hazırlanıyor', tone: 'info' },
    delivered: { label: 'Teslim Edildi', tone: 'ok' },
    cancelled: { label: 'İptal Edildi', tone: 'muted' },
    refunded: { label: 'İade Edildi', tone: 'muted' },
  },
  en: {
    pending_payment: { label: 'Awaiting Payment', tone: 'warn' },
    paid: { label: 'Paid', tone: 'info' },
    preparing: { label: 'Preparing', tone: 'info' },
    delivered: { label: 'Delivered', tone: 'ok' },
    cancelled: { label: 'Cancelled', tone: 'muted' },
    refunded: { label: 'Refunded', tone: 'muted' },
  },
  ru: {
    pending_payment: { label: 'Ожидает оплаты', tone: 'warn' },
    paid: { label: 'Оплачен', tone: 'info' },
    preparing: { label: 'В подготовке', tone: 'info' },
    delivered: { label: 'Доставлен', tone: 'ok' },
    cancelled: { label: 'Отменён', tone: 'muted' },
    refunded: { label: 'Возврат', tone: 'muted' },
  },
  fr: {
    pending_payment: { label: 'En attente', tone: 'warn' },
    paid: { label: 'Payé', tone: 'info' },
    preparing: { label: 'En préparation', tone: 'info' },
    delivered: { label: 'Livré', tone: 'ok' },
    cancelled: { label: 'Annulé', tone: 'muted' },
    refunded: { label: 'Remboursé', tone: 'muted' },
  },
};

const ACCT_UI: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabOrders: string;
    tabProfile: string;
    tabSecurity: string;
    slaTitle: string;
    slaText: string;
    noOrdersTitle: string;
    noOrdersDesc: string;
    goCatalog: string;
    goLicenses: string;
    payShopierBtn: string;
    paymentWindowLbl: string;
    verifyPayBtn: string;
    verifyingPayBtn: string;
    vaultTitle: string;
    vaultCode: string;
    vaultLink: string;
    vaultNote: string;
    chatTitle: string;
    chatPlaceholder: string;
    chatSendBtn: string;
    profileTitle: string;
    avatarUploadBtn: string;
    avatarClearBtn: string;
    avatarHint: string;
    displayNameLbl: string;
    usernameLbl: string;
    discordLbl: string;
    serverLbl: string;
    bioLbl: string;
    localeLbl: string;
    saveProfileBtn: string;
    securityTitle: string;
    linkedProvidersLbl: string;
    curPassLbl: string;
    newPassLbl: string;
    updatePassBtn: string;
    logoutAllBtn: string;
    licensesShortcut: string;
    copyText: string;
    copiedText: string;
    steps: [string, string, string, string];
  }
> = {
  tr: {
    eyebrow: 'HESABIM & TESLİMAT MERKEZİ',
    title: 'Profil Ayarları ve Kişiye Özel Teslimat',
    subtitle: 'Shopier siparişlerinizi takip edin, size özel teslimat sohbetinden yetkililerle görüşün ve hesap ayarlarınızı yönetin.',
    tabOrders: 'Siparişler & Teslimat Sohbeti',
    tabProfile: 'Profil & Fotoğraf',
    tabSecurity: 'Güvenlik & Bağlantılar',
    slaTitle: 'KURUMSAL TESLİMAT STANDARTI',
    slaText: 'Ürünlerimiz ortalama 2 saat içerisinde teslim edilmektedir. Yoğunluk vb. durumlarda teslimat süresi 6 ila 24 saate uzayabilmektedir.',
    noOrdersTitle: 'Henüz Shopier siparişiniz bulunmuyor',
    noOrdersDesc: 'Katalogdan veya dijital lisans vitrininden seçtiğiniz ürünler için Shopier ödeme linki ve kişiye özel teslimat odası otomatik olarak açılır.',
    goCatalog: 'Kataloğu İncele',
    goLicenses: 'Lisans Vitrini',
    payShopierBtn: "Shopier'de Öde ↗",
    paymentWindowLbl: 'Kalan Süre',
    verifyPayBtn: 'Ödemeyi Kontrol Et',
    verifyingPayBtn: 'Kontrol Ediliyor...',
    vaultTitle: 'TESLİMAT KASASI (KURUMSAL TESLİM)',
    vaultCode: 'Aktivasyon / Lisans Kodu',
    vaultLink: 'Teslimat Dosyası / Bağlantısı',
    vaultNote: 'Kurulum & Teslimat Notu',
    chatTitle: 'Kişiye Özel Teslimat Sohbeti',
    chatPlaceholder: 'Discord kullanıcı adınızı, sunucu bilginizi veya teslimat sorunuzu yazın...',
    chatSendBtn: 'Gönder',
    profileTitle: 'Profil Bilgileri & Fotoğraf',
    avatarUploadBtn: 'Fotoğraf Yükle (PNG/JPG)',
    avatarClearBtn: 'Temizle',
    avatarHint: 'En fazla 256 KB boyutunda PNG, JPG veya WEBP yükleyebilir ya da hazır stüdyo teması seçebilirsiniz.',
    displayNameLbl: 'GÖRÜNEN AD',
    usernameLbl: 'KULLANICI ADI',
    discordLbl: 'DİSCORD KULLANICI ADI',
    serverLbl: 'SUNUCU / PROJE ADI',
    bioLbl: 'HAKKINDA / TESLİMAT NOTU',
    localeLbl: 'TERCİH EDİLEN DİL',
    saveProfileBtn: 'Profil Ayarlarını Kaydet',
    securityTitle: 'Bağlı Giriş Yöntemleri & Şifre',
    linkedProvidersLbl: 'Aktif Giriş Kanalları',
    curPassLbl: 'MEVCUT ŞİFRE (varsa)',
    newPassLbl: 'YENİ ŞİFRE',
    updatePassBtn: 'Şifreyi Güncelle',
    logoutAllBtn: 'Tüm Cihazlardan Çıkış Yap',
    licensesShortcut: 'Lisans Portalı',
    copyText: 'Kopyala',
    copiedText: 'Kopyalandı',
    steps: ['Referans Oluşturuldu', 'Shopier Ödeme', 'Hazırlanıyor (2s–24s)', 'Teslim Edildi'],
  },
  en: {
    eyebrow: 'MY ACCOUNT & DELIVERY WORKSPACE',
    title: 'Profile Settings & Private Delivery Chat',
    subtitle: 'Track Shopier orders, chat directly with fulfillment engineers in your private order room, and manage profile settings.',
    tabOrders: 'Orders & Delivery Chat',
    tabProfile: 'Profile & Avatar',
    tabSecurity: 'Security & Logins',
    slaTitle: 'FULFILLMENT SLA POLICY',
    slaText: 'Digital products are delivered within 2 hours on average. During high volume or verification queues, delivery may extend to 6–24 hours.',
    noOrdersTitle: 'No Shopier orders yet',
    noOrdersDesc: 'Checking out from the Catalog or Store creates a custom Shopier payment link and opens a private 1-on-1 delivery room here.',
    goCatalog: 'Browse Catalog',
    goLicenses: 'License Store',
    payShopierBtn: 'Pay on Shopier ↗',
    paymentWindowLbl: 'Expires in',
    verifyPayBtn: 'Verify Payment',
    verifyingPayBtn: 'Checking...',
    vaultTitle: 'DIGITAL DELIVERY VAULT',
    vaultCode: 'Activation / License Code',
    vaultLink: 'Download / Delivery URL',
    vaultNote: 'Delivery & Setup Notes',
    chatTitle: 'Private Order Delivery Chat',
    chatPlaceholder: 'Share your Discord handle, server details, or questions for delivery...',
    chatSendBtn: 'Send',
    profileTitle: 'Profile Identity & Avatar',
    avatarUploadBtn: 'Upload Photo (PNG/JPG)',
    avatarClearBtn: 'Clear',
    avatarHint: 'Upload a PNG, JPG, or WEBP up to 256 KB, or choose a studio preset emblem below.',
    displayNameLbl: 'DISPLAY NAME',
    usernameLbl: 'USERNAME',
    discordLbl: 'DISCORD HANDLE',
    serverLbl: 'SERVER / PROJECT NAME',
    bioLbl: 'BIO / DEFAULT DELIVERY NOTE',
    localeLbl: 'INTERFACE LANGUAGE',
    saveProfileBtn: 'Save Profile Settings',
    securityTitle: 'Connected Providers & Password',
    linkedProvidersLbl: 'Linked Sign-In Methods',
    curPassLbl: 'CURRENT PASSWORD (if set)',
    newPassLbl: 'NEW PASSWORD',
    updatePassBtn: 'Update Password',
    logoutAllBtn: 'Sign Out All Devices',
    licensesShortcut: 'License Portal',
    copyText: 'Copy',
    copiedText: 'Copied',
    steps: ['Reference Created', 'Shopier Payment', 'Preparing (2h–24h)', 'Delivered'],
  },
  ru: {
    eyebrow: 'МОЙ АККАУНТ И ДОСТАВКА',
    title: 'Профиль и персональный чат выдачи',
    subtitle: 'Отслеживайте заказы Shopier, общайтесь с инженерами выдачи в личной комнате заказа и настраивайте профиль.',
    tabOrders: 'Заказы и чат доставки',
    tabProfile: 'Профиль и фото',
    tabSecurity: 'Безопасность',
    slaTitle: 'СРОКИ ВЫДАЧИ ЗАКАЗОВ',
    slaText: 'В среднем заказы выдаются в течение 2 часов. При высокой нагрузке срок выдачи может составлять от 6 до 24 часов.',
    noOrdersTitle: 'У вас пока нет заказов Shopier',
    noOrdersDesc: 'При оформлении в каталоге или магазине автоматически создаётся ссылка Shopier и персональный чат доставки.',
    goCatalog: 'В каталог',
    goLicenses: 'Магазин лицензий',
    payShopierBtn: 'Оплатить в Shopier ↗',
    paymentWindowLbl: 'Осталось',
    verifyPayBtn: 'Проверить оплату',
    verifyingPayBtn: 'Проверка...',
    vaultTitle: 'ХРАНИЛИЩЕ ВЫДАЧИ',
    vaultCode: 'Ключ активации',
    vaultLink: 'Ссылка на скачивание',
    vaultNote: 'Инструкция по установке',
    chatTitle: 'Персональный чат доставки',
    chatPlaceholder: 'Укажите ваш Discord, проект или вопрос по доставке...',
    chatSendBtn: 'Отправить',
    profileTitle: 'Данные профиля и аватар',
    avatarUploadBtn: 'Загрузить фото (PNG/JPG)',
    avatarClearBtn: 'Удалить',
    avatarHint: 'PNG, JPG или WEBP до 256 КБ либо выберите фирменный стиль ниже.',
    displayNameLbl: 'ИМЯ В ПРОФИЛЕ',
    usernameLbl: 'ЛОГИН',
    discordLbl: 'DISCORD ТЕГ',
    serverLbl: 'СЕРВЕР / ПРОЕКТ',
    bioLbl: 'О СЕБЕ / ЗАМЕТКА',
    localeLbl: 'ЯЗЫК ИНТЕРФЕЙСА',
    saveProfileBtn: 'Сохранить профиль',
    securityTitle: 'Способы входа и пароль',
    linkedProvidersLbl: 'Подключённые провайдеры',
    curPassLbl: 'ТЕКУЩИЙ ПАРОЛЬ (если задан)',
    newPassLbl: 'НОВЫЙ ПАРОЛЬ',
    updatePassBtn: 'Обновить пароль',
    logoutAllBtn: 'Выйти со всех устройств',
    licensesShortcut: 'Портал лицензий',
    copyText: 'Копировать',
    copiedText: 'Скопировано',
    steps: ['Заказ создан', 'Оплата Shopier', 'Подготовка (2ч–24ч)', 'Выдано'],
  },
  fr: {
    eyebrow: 'MON COMPTE & LIVRAISON',
    title: 'Paramètres du profil et salon de livraison privé',
    subtitle: 'Suivez vos commandes Shopier, échangez dans votre espace de livraison personnel et configurez votre profil.',
    tabOrders: 'Commandes & Chat privé',
    tabProfile: 'Profil & Photo',
    tabSecurity: 'Sécurité & Connexions',
    slaTitle: 'DÉLAI DE LIVRAISON',
    slaText: 'Nos produits numériques sont livrés en moyenne sous 2 heures. En cas de forte affluence, le délai peut aller de 6 à 24 heures.',
    noOrdersTitle: 'Aucune commande Shopier pour le moment',
    noOrdersDesc: 'Le passage par Shopier dans le catalogue ou la boutique génère un lien de paiement et un salon de livraison dédié.',
    goCatalog: 'Voir le catalogue',
    goLicenses: 'Boutique Licences',
    payShopierBtn: 'Payer sur Shopier ↗',
    paymentWindowLbl: 'Expire dans',
    verifyPayBtn: 'Vérifier le paiement',
    verifyingPayBtn: 'Vérification...',
    vaultTitle: 'COFFRE DE LIVRAISON',
    vaultCode: 'Code / Licence',
    vaultLink: 'Lien de téléchargement',
    vaultNote: 'Notes d’installation',
    chatTitle: 'Salon de livraison privé',
    chatPlaceholder: 'Indiquez votre pseudo Discord, serveur ou question...',
    chatSendBtn: 'Envoyer',
    profileTitle: 'Identité & Photo de profil',
    avatarUploadBtn: 'Importer photo (PNG/JPG)',
    avatarClearBtn: 'Effacer',
    avatarHint: 'PNG, JPG ou WEBP jusqu’à 256 Ko, ou sélectionnez un emblème studio ci-dessous.',
    displayNameLbl: 'NOM AFFICHÉ',
    usernameLbl: 'NOM D’UTILISATEUR',
    discordLbl: 'IDENTIFIANT DISCORD',
    serverLbl: 'SERVEUR / PROJET',
    bioLbl: 'BIO / NOTE PAR DÉFAUT',
    localeLbl: 'LANGUE',
    saveProfileBtn: 'Enregistrer le profil',
    securityTitle: 'Connexions & Mot de passe',
    linkedProvidersLbl: 'Méthodes connectées',
    curPassLbl: 'MOT DE PASSE ACTUEL',
    newPassLbl: 'NOUVEAU MOT DE PASSE',
    updatePassBtn: 'Mettre à jour',
    logoutAllBtn: 'Déconnecter tous les appareils',
    licensesShortcut: 'Portail Licences',
    copyText: 'Copier',
    copiedText: 'Copié',
    steps: ['Référence créée', 'Paiement Shopier', 'Préparation (2h–24h)', 'Livré'],
  },
};

export function renderAvatarVisual(avatarUrl: string | null | undefined, displayName: string, size = 44) {
  const preset = PRESET_AVATARS.find((p) => p.id === avatarUrl);
  const initial = (displayName || 'U').trim().slice(0, 2).toUpperCase();

  if (avatarUrl && !preset) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        className="rs-avatar-img"
        style={{ width: size, height: size, borderRadius: '999px', objectFit: 'cover' }}
      />
    );
  }

  return (
    <span
      className="rs-avatar-fallback"
      style={{
        width: size,
        height: size,
        background: preset ? preset.bg : 'linear-gradient(135deg,#27272a,#121216)',
        borderColor: preset ? preset.border : 'rgba(255,255,255,0.2)',
        fontSize: Math.max(11, Math.round(size * 0.34)),
      }}
    >
      {initial}
    </span>
  );
}

export default function AccountPortalClient({
  initialProfile,
  initialOrders,
  initialLicenseCount,
  initialSessionMeta,
  initialTab = 'orders',
  initialOrderRef,
}: AccountPortalClientProps) {
  const { locale, setLocale, formatNumber } = useI18n();
  const ui = ACCT_UI[locale] || ACCT_UI.tr;
  const statusMap = STATUS_META[locale] || STATUS_META.tr;

  const [tab, setTab] = useState<'orders' | 'profile' | 'security'>(initialTab);
  const [profile, setProfile] = useState<UserProfileRecord>(initialProfile);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [selectedRef, setSelectedRef] = useState<string | null>(() => {
    if (initialOrderRef && initialOrders.some((o) => o.referenceCode === initialOrderRef)) {
      return initialOrderRef;
    }
    return initialOrders[0]?.referenceCode || null;
  });

  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(
    () => orders.find((o) => o.referenceCode === selectedRef) || null
  );
  const [messages, setMessages] = useState<OrderMessageRecord[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [verifyingPay, setVerifyingPay] = useState(false);
  const [pendingRemainingSecs, setPendingRemainingSecs] = useState<number>(900);
  const autoExpiredVerifyRef = useRef<string | null>(null);
  const [tgState, setTgState] = useState<{
    configured: boolean;
    linked: boolean;
    username: string | null;
    bindUrl: string | null;
    busy: boolean;
  }>({
    configured: false,
    linked: Boolean(initialProfile.telegramLinked),
    username: initialProfile.telegramUsername || null,
    bindUrl: null,
    busy: false,
  });

  // Profile form
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [username, setUsername] = useState(initialProfile.username);
  const [discordHandle, setDiscordHandle] = useState(initialProfile.discordHandle);
  const [serverName, setServerName] = useState(initialProfile.serverName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [preferredLocale, setPreferredLocale] = useState<Locale>(initialProfile.preferredLocale);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [profileSaving, setProfileSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const loadTelegramNotifState = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setTgState((prev) => ({
          ...prev,
          configured: Boolean(data.telegramBotConfigured),
          linked: Boolean(data.telegramLinked),
          username: data.telegramUsername || null,
          bindUrl: data.telegramBindUrl || null,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadTelegramNotifState();
  }, [loadTelegramNotifState]);

  const handleUnlinkTelegram = async () => {
    setTgState((prev) => ({ ...prev, busy: true }));
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'unlink_telegram' }),
      });
      if (res.ok) {
        await loadTelegramNotifState();
      }
    } finally {
      setTgState((prev) => ({ ...prev, busy: false }));
    }
  };

  const loadOrderThread = useCallback(async (ref: string, silent = false) => {
    if (!silent) setChatLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveOrder(data.order);
        setMessages(data.messages || []);
        setOrders((prev) => prev.map((o) => (o.referenceCode === ref ? data.order : o)));
      }
    } catch {
      // ignore transient poll error
    } finally {
      if (!silent) setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRef && tab === 'orders') {
      void loadOrderThread(selectedRef);
    }
  }, [selectedRef, tab, loadOrderThread]);

  useEffect(() => {
    if (!selectedRef || tab !== 'orders') return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadOrderThread(selectedRef, true);
      }
    }, 12000);
    return () => window.clearInterval(id);
  }, [selectedRef, tab, loadOrderThread]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef || !chatText.trim() || chatSending) return;
    setChatSending(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(selectedRef)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ body: chatText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Mesaj gönderilemedi.');
      }
      setChatText('');
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err: unknown) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Hata oluştu.' });
    } finally {
      setChatSending(false);
    }
  };

  const handleVerifyPayment = useCallback(async () => {
    if (!selectedRef || verifyingPay) return;
    setVerifyingPay(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(selectedRef)}/verify`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Kontrol başarısız.');
      if (data.order) {
        setActiveOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.referenceCode === selectedRef ? data.order : o)));
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      setNotice({ type: data.matched ? 'ok' : 'err', text: data.message });
    } catch (err: unknown) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Kontrol hatası.' });
    } finally {
      setVerifyingPay(false);
    }
  }, [selectedRef, verifyingPay]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'pending_payment' || activeOrder.paymentProvider !== 'shopier') {
      return;
    }
    const tick = () => {
      const secs = getOrderRemainingSeconds(activeOrder);
      setPendingRemainingSecs(secs);
      if (secs === 0 && autoExpiredVerifyRef.current !== activeOrder.referenceCode) {
        autoExpiredVerifyRef.current = activeOrder.referenceCode;
        void handleVerifyPayment();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [activeOrder, handleVerifyPayment]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setNotice({ type: 'err', text: 'Yalnızca PNG, JPG veya WEBP dosyası seçebilirsiniz.' });
      return;
    }
    if (file.size > 256 * 1024) {
      setNotice({ type: 'err', text: 'Profil fotoğrafı en fazla 256 KB olmalıdır.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setNotice(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim() || undefined,
          discordHandle: discordHandle.trim(),
          serverName: serverName.trim(),
          bio: bio.trim(),
          preferredLocale,
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Profil güncellenemedi.');
      }
      setProfile(data.profile);
      setAvatarUrl(data.profile.avatarUrl);
      if (preferredLocale !== locale) {
        setLocale(preferredLocale);
      }
      setNotice({ type: 'ok', text: data.message });
    } catch (err: unknown) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Hata oluştu.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Şifre güncellenemedi.');
      setCurrentPassword('');
      setNewPassword('');
      setNotice({ type: 'ok', text: data.message });
    } catch (err: unknown) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Hata oluştu.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ scope: 'all' }),
    }).catch(() => undefined);
    window.location.replace('/login?clear_session=1');
  };

  const stepIndex = useMemo(() => {
    if (!activeOrder) return 0;
    if (activeOrder.status === 'delivered') return 3;
    if (activeOrder.status === 'paid' || activeOrder.status === 'preparing') return 2;
    return 1;
  }, [activeOrder]);

  return (
    <div className="rs-portal-shell">
      <SiteNavbar activePath="/hesabim" />

      <div style={{ position: 'relative', flex: 1, minWidth: 0, overflowX: 'clip' }}>
        <HeroPrismBackdrop />

        <main className="rs-portal-main" style={{ position: 'relative', zIndex: 2 }}>
          <section className="rs-acct-header">
            <div className="rs-acct-identity">
              {renderAvatarVisual(avatarUrl ?? profile.avatarUrl, profile.displayName, 64)}
              <div>
                <div className="st-eyebrow">
                  <span className="st-eyebrow-dot" aria-hidden="true" />
                  <span>{ui.eyebrow}</span>
                </div>
                <h1 className="st-subhero-title" style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>
                  {profile.displayName}
                </h1>
                <div className="rs-acct-meta-row">
                  <span>{profile.email || `@${profile.username}`}</span>
                  {profile.discordHandle && <span>· Discord: {profile.discordHandle}</span>}
                  <span>· Lisanslar: {initialLicenseCount}</span>
                </div>
              </div>
            </div>

            <div className="rs-acct-actions">
              <Link href="/dashboard" className="st-pill-btn is-outline is-sm">
                {ui.licensesShortcut}
              </Link>
            </div>
          </section>

          <section className="rs-acct-overview-grid" aria-label="Account summary">
            <button
              type="button"
              onClick={() => {
                setTab('orders');
                setNotice(null);
              }}
              className={`rs-acct-overview-card ${tab === 'orders' ? 'is-active' : ''}`}
            >
              <span className="rs-acct-ov-kicker">{ui.tabOrders}</span>
              <strong className="rs-acct-ov-val">
                {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} / {orders.length}
              </strong>
              <span className="rs-acct-ov-meta">2s – 24s SLA · 1-1</span>
            </button>

            <Link href="/dashboard" className="rs-acct-overview-card">
              <span className="rs-acct-ov-kicker">{ui.licensesShortcut}</span>
              <strong className="rs-acct-ov-val">{initialLicenseCount}</strong>
              <span className="rs-acct-ov-meta">R-AI &amp; HWID →</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setTab('profile');
                setNotice(null);
              }}
              className={`rs-acct-overview-card ${tab === 'profile' || tab === 'security' ? 'is-active' : ''}`}
            >
              <span className="rs-acct-ov-kicker">{ui.tabProfile}</span>
              <strong className="rs-acct-ov-val">
                {(profile.authProviders || []).length}{' '}
                {locale === 'en'
                  ? 'Providers'
                  : locale === 'ru'
                  ? 'Канал.'
                  : locale === 'fr'
                  ? 'Canaux'
                  : 'Kanal'}
              </strong>
              <span className="rs-acct-ov-meta">
                {profile.discordHandle || profile.serverName || ui.tabSecurity}
              </span>
            </button>
          </section>

          <nav className="st-legal-tabs" aria-label={ui.title}>
            <button
              type="button"
              onClick={() => {
                setTab('orders');
                setNotice(null);
              }}
              className={`st-filter-pill ${tab === 'orders' ? 'is-active' : ''}`}
            >
              {ui.tabOrders} ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('profile');
                setNotice(null);
              }}
              className={`st-filter-pill ${tab === 'profile' ? 'is-active' : ''}`}
            >
              {ui.tabProfile}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('security');
                setNotice(null);
              }}
              className={`st-filter-pill ${tab === 'security' ? 'is-active' : ''}`}
            >
              {ui.tabSecurity}
            </button>
          </nav>

          {notice && (
            <div className={`rs-auth-alert ${notice.type === 'err' ? 'is-error' : 'is-info'}`} role="status">
              <span>{notice.text}</span>
            </div>
          )}

          {tab === 'orders' && (
            <div className="rs-orders-workspace">
              {/* Orders List */}
              <aside className="rs-portal-panel rs-orders-list-card">
                <div className="rs-sla-banner">
                  <span className="rs-sla-tag">{ui.slaTitle}</span>
                  <p>{ui.slaText}</p>
                </div>

                {tgState.configured && (
                  <div className="rs-tg-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '12.5px', color: '#e0f2fe' }}>
                        Telegram Anlık Bildirim
                      </strong>
                      <span className={`rs-status-badge ${tgState.linked ? 'is-ok' : 'is-warn'}`}>
                        {tgState.linked
                          ? tgState.username
                            ? `Bağlı (@${tgState.username})`
                            : 'Bağlı'
                          : 'Bağlı Değil'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {tgState.linked
                        ? 'Ödeme onayı, yetkili yanıtı ve ürün hazır bildirimleri Telegram hesabınıza anında iletilir.'
                        : 'Ürününüz hazır olduğunda ve yeni mesaj geldiğinde ücretsiz Telegram bildirimi almak için bota bağlanın.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {tgState.linked ? (
                        <button
                          type="button"
                          onClick={() => void handleUnlinkTelegram()}
                          disabled={tgState.busy}
                          className="st-pill-btn is-outline is-sm"
                        >
                          Bağlantıyı Kes
                        </button>
                      ) : (
                        <>
                          {tgState.bindUrl && (
                            <a
                              href={tgState.bindUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="st-pill-btn is-ember is-sm"
                            >
                              Telegram Bildirimlerini Aç ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => void loadTelegramNotifState()}
                            className="st-pill-btn is-outline is-sm"
                          >
                            Durumu Yenile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {orders.length === 0 ? (
                  <div style={{ padding: '24px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '15px' }}>{ui.noOrdersTitle}</strong>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {ui.noOrdersDesc}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <Link href="/katalog" className="st-pill-btn is-ember is-sm">
                        {ui.goCatalog}
                      </Link>
                      <Link href="/lisanslar" className="st-pill-btn is-outline is-sm">
                        {ui.goLicenses}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rs-orders-items">
                    {orders.map((ord) => {
                      const sm = statusMap[ord.status] || statusMap.pending_payment;
                      const isSel = ord.referenceCode === selectedRef;
                      return (
                        <button
                          key={ord.referenceCode}
                          type="button"
                          onClick={() => setSelectedRef(ord.referenceCode)}
                          className={`rs-order-list-btn ${isSel ? 'is-selected' : ''}`}
                        >
                          <div className="rs-order-list-top">
                            <span className="rs-order-ref">{ord.referenceCode}</span>
                            <span className={`rs-status-badge is-${sm.tone}`}>{sm.label}</span>
                          </div>
                          <div className="rs-order-title">{ord.title}</div>
                          <div className="rs-order-meta">
                            <span>{formatNumber(ord.totalAmount)} TL</span>
                            <span>{new Date(ord.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </aside>

              {/* Selected Order & 1-1 Private Delivery Chat */}
              <section className="rs-portal-panel rs-order-detail-card">
                {!activeOrder ? (
                  <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {ui.noOrdersDesc}
                  </div>
                ) : (
                  <>
                    <div className="rs-order-detail-head">
                      <div>
                        <span className="rs-order-ref">{activeOrder.referenceCode}</span>
                        <h2 style={{ fontSize: '19px', fontWeight: 700, marginTop: '4px' }}>
                          {activeOrder.title}
                        </h2>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {formatNumber(activeOrder.totalAmount)} TL · {activeOrder.items.length} kalem
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {activeOrder.status === 'pending_payment' && activeOrder.shopierCheckoutUrl && (
                          <>
                            {activeOrder.paymentProvider === 'shopier' && (
                              <span className="rs-status-badge is-warn">
                                {ui.paymentWindowLbl}: {formatCountdownMmSs(pendingRemainingSecs)}
                              </span>
                            )}
                            {pendingRemainingSecs > 0 && (
                              <a
                                href={activeOrder.shopierCheckoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="st-pill-btn is-shopier is-sm"
                              >
                                <ShopierLogo width={15} height={15} />
                                <span>{ui.payShopierBtn}</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => void handleVerifyPayment()}
                              disabled={verifyingPay}
                              className="st-pill-btn is-light is-sm"
                            >
                              {verifyingPay ? ui.verifyingPayBtn : ui.verifyPayBtn}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Corporate Delivery Progress Stepper */}
                    <div className="rs-order-stepper" aria-label="Order timeline">
                      {ui.steps.map((label, idx) => (
                        <div
                          key={label}
                          className={`rs-order-step ${idx <= stepIndex ? 'is-done' : ''} ${
                            idx === stepIndex ? 'is-current' : ''
                          }`}
                        >
                          <span className="rs-order-step-dot">{idx + 1}</span>
                          <span className="rs-order-step-lbl">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pinned Corporate Delivery Vault */}
                    {activeOrder.deliveryPayload && (
                      <div className="rs-delivery-vault">
                        <div className="rs-delivery-vault-head">{ui.vaultTitle}</div>
                        {activeOrder.deliveryPayload.licenseCode && (
                          <div className="rs-delivery-row">
                            <span>{ui.vaultCode}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <code className="rs-vault-code">{activeOrder.deliveryPayload.licenseCode}</code>
                              <button
                                type="button"
                                className="st-pill-btn is-light is-sm"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(
                                    activeOrder.deliveryPayload!.licenseCode || ''
                                  );
                                  setCopiedKey(true);
                                  setTimeout(() => setCopiedKey(false), 1800);
                                }}
                              >
                                {copiedKey ? ui.copiedText : ui.copyText}
                              </button>
                            </div>
                          </div>
                        )}
                        {activeOrder.deliveryPayload.downloadUrl && (
                          <div className="rs-delivery-row">
                            <span>{ui.vaultLink}</span>
                            <a
                              href={activeOrder.deliveryPayload.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="st-pill-btn is-ember is-sm"
                            >
                              Dosyayı Aç / İndir ↗
                            </a>
                          </div>
                        )}
                        <div className="rs-delivery-notes">
                          <strong>{ui.vaultNote}:</strong>
                          <p>{activeOrder.deliveryPayload.instructions}</p>
                        </div>
                      </div>
                    )}

                    {/* Private 1-on-1 Order Delivery Chat */}
                    <div className="rs-chat-section">
                      <div className="rs-chat-head">
                        <span>{ui.chatTitle}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          🔒 Birebir Şifreli Oda
                        </span>
                      </div>

                      <div className="rs-chat-feed">
                        {chatLoading ? (
                          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Sohbet yükleniyor...
                          </div>
                        ) : (
                          messages.map((m) => (
                            <div
                              key={m.id}
                              className={`rs-chat-msg is-${m.senderRole} ${
                                m.messageType === 'delivery_bundle' ? 'is-bundle' : ''
                              }`}
                            >
                              <div className="rs-chat-msg-meta">
                                <strong>{m.senderName}</strong>
                                <span>{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                              </div>
                              <p className="rs-chat-msg-body">{m.body}</p>
                            </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendChat} className="rs-chat-composer">
                        <input
                          type="text"
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          placeholder={ui.chatPlaceholder}
                          maxLength={1500}
                          className="st-input"
                        />
                        <button
                          type="submit"
                          disabled={chatSending || !chatText.trim()}
                          className="st-pill-btn is-ember is-sm"
                        >
                          {ui.chatSendBtn}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {tab === 'profile' && (
            <section className="rs-portal-panel spotlight-surface" style={{ maxWidth: '760px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{ui.profileTitle}</h2>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
                <div className="rs-avatar-picker-row">
                  {renderAvatarVisual(avatarUrl, displayName, 72)}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarFile}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="st-pill-btn is-light is-sm"
                      >
                        {ui.avatarUploadBtn}
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl(null)}
                          className="st-pill-btn is-outline is-sm"
                        >
                          {ui.avatarClearBtn}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAvatarUrl(preset.id)}
                          className={`rs-preset-dot ${avatarUrl === preset.id ? 'is-selected' : ''}`}
                          style={{ background: preset.bg, borderColor: preset.border }}
                          title={preset.label}
                          aria-label={preset.label}
                        />
                      ))}
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{ui.avatarHint}</span>
                    </div>
                  </div>
                </div>

                <div className="rs-portal-grid-2" style={{ gap: '14px' }}>
                  <div className="rs-auth-field">
                    <label className="rs-auth-label">{ui.displayNameLbl}</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={48}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="st-input"
                    />
                  </div>
                  <div className="rs-auth-field">
                    <label className="rs-auth-label">{ui.usernameLbl}</label>
                    <input
                      type="text"
                      minLength={3}
                      maxLength={40}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="st-input"
                    />
                  </div>
                  <div className="rs-auth-field">
                    <label className="rs-auth-label">{ui.discordLbl}</label>
                    <input
                      type="text"
                      maxLength={64}
                      value={discordHandle}
                      onChange={(e) => setDiscordHandle(e.target.value)}
                      placeholder="kullanici#0000"
                      className="st-input"
                    />
                  </div>
                  <div className="rs-auth-field">
                    <label className="rs-auth-label">{ui.serverLbl}</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="Örn: Restricted Roleplay"
                      className="st-input"
                    />
                  </div>
                </div>

                <div className="rs-auth-field">
                  <label className="rs-auth-label">{ui.localeLbl}</label>
                  <select
                    value={preferredLocale}
                    onChange={(e) => setPreferredLocale(e.target.value as Locale)}
                    className="st-select"
                  >
                    <option value="tr">Türkçe (TR)</option>
                    <option value="en">English (EN)</option>
                    <option value="ru">Русский (RU)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>

                <div className="rs-auth-field">
                  <label className="rs-auth-label">{ui.bioLbl}</label>
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="st-input"
                  />
                </div>

                <div>
                  <button type="submit" disabled={profileSaving} className="st-pill-btn is-ember">
                    {profileSaving ? '...' : ui.saveProfileBtn}
                  </button>
                </div>
              </form>
            </section>
          )}

          {tab === 'security' && (
            <section className="rs-portal-panel spotlight-surface" style={{ maxWidth: '720px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{ui.securityTitle}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{ui.linkedProvidersLbl}</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.authProviders.map((p) => (
                    <span key={p} className="st-filter-pill is-active" style={{ padding: '4px 12px', fontSize: '11.5px' }}>
                      {p.toUpperCase()}
                    </span>
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    FID #{initialSessionMeta.familyId.slice(0, 10)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {profile.authProviders.includes('email') && (
                  <div className="rs-auth-field">
                    <label className="rs-auth-label">{ui.curPassLbl}</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="st-input"
                    />
                  </div>
                )}
                <div className="rs-auth-field">
                  <label className="rs-auth-label">{ui.newPassLbl}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="st-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={pwSaving} className="st-pill-btn is-light is-sm">
                    {pwSaving ? '...' : ui.updatePassBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLogoutAll()}
                    className="st-pill-btn is-outline is-sm"
                  >
                    {ui.logoutAllBtn}
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
