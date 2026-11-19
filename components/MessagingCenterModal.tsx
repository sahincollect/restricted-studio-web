'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';
import type { OrderMessageRecord, OrderRecord } from '@/lib/orders-pure';

interface MessagingUserSummary {
  displayName: string;
  avatarUrl: string | null;
  isGuest: boolean;
  telegramLinked: boolean;
}

interface MessagingCopy {
  title: string;
  subtitle: string;
  onlinePill: string;
  newTopicBtn: string;
  backToList: string;
  closeLbl: string;
  threadsTitle: string;
  filterAll: string;
  filterSupport: string;
  filterOrders: string;
  badgeSupport: string;
  badgeOrder: string;
  emptyThreads: string;
  composeTitle: string;
  composeSubtitle: string;
  topicLabel: string;
  topics: string[];
  otherTopic: string;
  customTopicPlaceholder: string;
  quickStartsLabel: string;
  quickStarts: string[];
  messageLabel: string;
  messagePlaceholder: string;
  replyPlaceholder: string;
  sendBtn: string;
  sendingBtn: string;
  openInAccount: string;
  tgConnected: string;
  tgPrompt: string;
  guestHeading: string;
  guestDesc: string;
  guestLoginBtn: string;
  guestRegisterBtn: string;
  guestContactBtn: string;
  statusLabels: Record<string, string>;
}

const MSG_I18N: Record<Locale, MessagingCopy> = {
  tr: {
    title: 'Canlı Mesajlaşma Merkezi',
    subtitle: 'Restricted Studio ekibiyle doğrudan yazışın; sipariş ve destek görüşmelerinizi tek ekrandan yönetin.',
    onlinePill: 'Ekip Aktif · Ort. 2 saat SLA',
    newTopicBtn: 'Yeni Mesaj',
    backToList: '← Konuşmalar',
    closeLbl: 'Pencereyi kapat',
    threadsTitle: 'Görüşmeleriniz',
    filterAll: 'Tümü',
    filterSupport: 'Destek',
    filterOrders: 'Siparişler',
    badgeSupport: 'DESTEK',
    badgeOrder: 'SİPARİŞ',
    emptyThreads: 'Henüz aktif görüşmeniz yok. Sağdaki alandan hemen mesaj başlatabilirsiniz.',
    composeTitle: 'Yeni Destek / Bilgi Mesajı Başlat',
    composeSubtitle: 'Konuyu seçin ve mesajınızı yazın; ekibimize Telegram üzerinden anlık düşer.',
    topicLabel: 'KONU SEÇİMİ',
    topics: [
      'Kurulum & Teknik Destek',
      'Paket & Script Danışmanlığı',
      'Ödeme / Shopier Yardımı',
      'Özel Proje & Bot Talebi',
    ],
    otherTopic: 'Diğer',
    customTopicPlaceholder: 'Konu başlığı yazın...',
    quickStartsLabel: 'Tek tıkla hazır başlatıcılar:',
    quickStarts: [
      'Kurulum ve yapılandırma konusunda destek almak istiyorum.',
      'Sunucuma uygun paket ve 15+ toplu indirim hakkında bilgi alabilir miyim?',
      'Ödeme / teslimat sürecim hakkında bilgi almak istiyorum.',
    ],
    messageLabel: 'MESAJINIZ',
    messagePlaceholder: 'Talebinizi, sunucu detayınızı veya sorunuzu yazın... (Göndermek için Enter)',
    replyPlaceholder: 'Yanıtınızı yazın... (Enter ile gönder, Shift+Enter alt satır)',
    sendBtn: 'Mesajı Gönder',
    sendingBtn: 'Gönderiliyor...',
    openInAccount: 'Hesabımda Aç ↗',
    tgConnected: 'Telegram yanıt bildiriminiz bağlı',
    tgPrompt: 'Yanıt gelince Telegram’dan bildirim al →',
    guestHeading: 'Birebir Mesajlaşmaya Başlayın',
    guestDesc:
      'Görüşme geçmişinizin size özel saklanması ve yetkililer yanıt yazdığında anında bildirim alabilmeniz için hesabınızla giriş yapın.',
    guestLoginBtn: 'Giriş Yap & Mesaj At',
    guestRegisterBtn: 'Ücretsiz Hesap Oluştur',
    guestContactBtn: 'Hesapsız İletişim Formuna Git (/iletisim)',
    statusLabels: {
      pending_payment: 'Ödeme Bekliyor',
      paid: 'Ödendi',
      preparing: 'Aktif / Görüşmede',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
      refunded: 'İade Edildi',
    },
  },
  en: {
    title: 'Live Messaging Center',
    subtitle: 'Message Restricted Studio engineers directly; manage support & order chats in one place.',
    onlinePill: 'Team Active · ~2h avg SLA',
    newTopicBtn: 'New Message',
    backToList: '← Threads',
    closeLbl: 'Close messaging window',
    threadsTitle: 'Conversations',
    filterAll: 'All',
    filterSupport: 'Support',
    filterOrders: 'Orders',
    badgeSupport: 'SUPPORT',
    badgeOrder: 'ORDER',
    emptyThreads: 'No conversations yet. Start a direct thread on the right.',
    composeTitle: 'Start a Direct Support Conversation',
    composeSubtitle: 'Pick a topic and send your question; our team receives an instant Telegram ping.',
    topicLabel: 'TOPIC',
    topics: [
      'Setup & Technical Support',
      'Package & Script Consultation',
      'Payment / Shopier Help',
      'Custom Bot & Web Inquiry',
    ],
    otherTopic: 'Other',
    customTopicPlaceholder: 'Enter custom subject...',
    quickStartsLabel: 'Quick starters:',
    quickStarts: [
      'I would like help with installation and setup.',
      'Can I get details on packages and 15+ bulk pricing?',
      'I have a question about my payment or delivery.',
    ],
    messageLabel: 'YOUR MESSAGE',
    messagePlaceholder: 'Describe your question or project details... (Enter to send)',
    replyPlaceholder: 'Write a message... (Enter sends, Shift+Enter for new line)',
    sendBtn: 'Send Message',
    sendingBtn: 'Sending...',
    openInAccount: 'Open in Account ↗',
    tgConnected: 'Telegram reply alerts enabled',
    tgPrompt: 'Enable Telegram reply alerts →',
    guestHeading: 'Start 1-on-1 Direct Messaging',
    guestDesc:
      'Sign in so your chat history stays private to your account and you receive live bell & Telegram reply alerts.',
    guestLoginBtn: 'Sign In & Chat',
    guestRegisterBtn: 'Create Free Account',
    guestContactBtn: 'Open Public Contact Page (/iletisim)',
    statusLabels: {
      pending_payment: 'Awaiting Payment',
      paid: 'Paid',
      preparing: 'Active / In Progress',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    },
  },
  ru: {
    title: 'Центр сообщений',
    subtitle: 'Прямой чат с командой Restricted Studio: вопросы, поддержка и заказы в одном окне.',
    onlinePill: 'Команда онлайн · SLA ~2 ч',
    newTopicBtn: 'Новый чат',
    backToList: '← Диалоги',
    closeLbl: 'Закрыть окно сообщений',
    threadsTitle: 'Ваши диалоги',
    filterAll: 'Все',
    filterSupport: 'Поддержка',
    filterOrders: 'Заказы',
    badgeSupport: 'ПОДДЕРЖКА',
    badgeOrder: 'ЗАКАЗ',
    emptyThreads: 'Диалогов пока нет. Напишите нам справа.',
    composeTitle: 'Начать прямое обращение',
    composeSubtitle: 'Выберите тему и отправьте вопрос — команда сразу получит уведомление в Telegram.',
    topicLabel: 'ТЕМА',
    topics: [
      'Установка и техподдержка',
      'Подбор пакетов и скриптов',
      'Оплата / Shopier',
      'Индивидуальный проект и боты',
    ],
    otherTopic: 'Другое',
    customTopicPlaceholder: 'Укажите тему...',
    quickStartsLabel: 'Быстрый старт:',
    quickStarts: [
      'Нужна помощь с установкой и настройкой.',
      'Подскажите по пакетам и оптовой скидке 15+.',
      'Есть вопрос по оплате и доставке.',
    ],
    messageLabel: 'СООБЩЕНИЕ',
    messagePlaceholder: 'Опишите вопрос или детали проекта... (Enter — отправить)',
    replyPlaceholder: 'Напишите ответ... (Enter — отправить, Shift+Enter — перенос)',
    sendBtn: 'Отправить',
    sendingBtn: 'Отправка...',
    openInAccount: 'Открыть в профиле ↗',
    tgConnected: 'Telegram-уведомления включены',
    tgPrompt: 'Включить уведомления в Telegram →',
    guestHeading: 'Начните личный чат с командой',
    guestDesc:
      'Войдите в аккаунт, чтобы переписка сохранялась за вами и вы получали уведомления об ответах.',
    guestLoginBtn: 'Войти и написать',
    guestRegisterBtn: 'Создать аккаунт',
    guestContactBtn: 'Перейти на страницу контактов (/iletisim)',
    statusLabels: {
      pending_payment: 'Ожидает оплаты',
      paid: 'Оплачен',
      preparing: 'Активен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
      refunded: 'Возврат',
    },
  },
  fr: {
    title: 'Messagerie en direct',
    subtitle: 'Échangez directement avec Restricted Studio : support technique et suivi de commandes réunis.',
    onlinePill: 'Équipe active · SLA ~2h',
    newTopicBtn: 'Nouveau sujet',
    backToList: '← Discussions',
    closeLbl: 'Fermer la messagerie',
    threadsTitle: 'Vos discussions',
    filterAll: 'Tout',
    filterSupport: 'Support',
    filterOrders: 'Commandes',
    badgeSupport: 'SUPPORT',
    badgeOrder: 'COMMANDE',
    emptyThreads: 'Aucune discussion pour le moment. Envoyez votre premier message à droite.',
    composeTitle: 'Démarrer une discussion directe',
    composeSubtitle: 'Choisissez un sujet et écrivez votre message ; notre équipe est alertée sur Telegram.',
    topicLabel: 'SUJET',
    topics: [
      'Installation & Support Technique',
      'Conseil Packs & Scripts',
      'Paiement / Shopier',
      'Projet sur mesure & Bot Discord',
    ],
    otherTopic: 'Autre',
    customTopicPlaceholder: 'Précisez le sujet...',
    quickStartsLabel: 'Modèles rapides :',
    quickStarts: [
      'J’ai besoin d’aide pour l’installation et la configuration.',
      'Je souhaite des informations sur les packs et la remise 15+.',
      'J’ai une question concernant mon paiement ou ma livraison.',
    ],
    messageLabel: 'VOTRE MESSAGE',
    messagePlaceholder: 'Décrivez votre besoin ou question... (Entrée pour envoyer)',
    replyPlaceholder: 'Écrivez votre message... (Entrée = envoyer, Maj+Entrée = ligne)',
    sendBtn: 'Envoyer',
    sendingBtn: 'Envoi...',
    openInAccount: 'Ouvrir dans Mon Compte ↗',
    tgConnected: 'Alertes Telegram activées',
    tgPrompt: 'Activer les alertes Telegram →',
    guestHeading: 'Démarrez une discussion 1-à-1',
    guestDesc:
      'Connectez-vous pour conserver votre historique privé et recevoir nos notifications de réponse en direct.',
    guestLoginBtn: 'Se connecter & Écrire',
    guestRegisterBtn: 'Créer un compte gratuit',
    guestContactBtn: 'Aller sur Contact (/iletisim)',
    statusLabels: {
      pending_payment: 'En attente',
      paid: 'Payé',
      preparing: 'Actif',
      delivered: 'Livré',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
    },
  },
};

export interface MessagingCenterModalProps {
  open: boolean;
  initialRef?: string | null;
  onClose: () => void;
}

export default function MessagingCenterModal({
  open,
  initialRef = null,
  onClose,
}: MessagingCenterModalProps) {
  const { locale } = useI18n();
  const copy = MSG_I18N[locale] || MSG_I18N.tr;

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userMeta, setUserMeta] = useState<MessagingUserSummary | null>(null);
  const [threads, setThreads] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'support' | 'orders'>('all');
  const [mode, setMode] = useState<'compose' | 'thread'>('compose');
  const [selectedRef, setSelectedRef] = useState<string | null>(initialRef);
  const [activeThread, setActiveThread] = useState<OrderRecord | null>(null);
  const [messages, setMessages] = useState<OrderMessageRecord[]>([]);
  const [mobileShowPane, setMobileShowPane] = useState<'list' | 'pane'>('pane');

  // Compose & reply state
  const [topicIdx, setTopicIdx] = useState<number | 'custom'>(0);
  const [customTopic, setCustomTopic] = useState('');
  const [draftText, setDraftText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const hasAutoSelectedRef = useRef(false);

  const loadMessagingState = useCallback(
    async (explicitRef?: string | null, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const refQuery = explicitRef ? `?ref=${encodeURIComponent(explicitRef)}` : '';
        const res = await fetch(`/api/messages${refQuery}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => null);
        if (!data || !data.authenticated) {
          setAuthenticated(false);
          setThreads([]);
          setActiveThread(null);
          setMessages([]);
          return;
        }
        setAuthenticated(true);
        setUserMeta(data.user || null);
        const list = Array.isArray(data.threads) ? (data.threads as OrderRecord[]) : [];
        setThreads(list);

        const resolvedRef = explicitRef || data.activeRef || null;
        if (resolvedRef && (explicitRef || (!hasAutoSelectedRef.current && list.length > 0 && initialRef !== 'new'))) {
          hasAutoSelectedRef.current = true;
          setSelectedRef(resolvedRef);
          setActiveThread(data.activeThread || null);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setMode('thread');
        } else if (!hasAutoSelectedRef.current) {
          hasAutoSelectedRef.current = true;
          setMode('compose');
        } else if (data.activeThread && selectedRef && data.activeThread.referenceCode === selectedRef) {
          setActiveThread(data.activeThread);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch {
        // leave current state
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [initialRef, selectedRef]
  );

  useEffect(() => {
    if (!open) {
      hasAutoSelectedRef.current = false;
      return;
    }
    setErrorMsg(null);
    if (initialRef === 'new') {
      hasAutoSelectedRef.current = true;
      setMode('compose');
      setSelectedRef(null);
      setMobileShowPane('pane');
      void loadMessagingState(null, false);
    } else if (initialRef) {
      hasAutoSelectedRef.current = true;
      setSelectedRef(initialRef);
      setMode('thread');
      setMobileShowPane('pane');
      void loadMessagingState(initialRef, false);
    } else {
      void loadMessagingState(null, false);
    }
  }, [open, initialRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live refresh active thread every 7s while modal stays open
  useEffect(() => {
    if (!open || !authenticated || mode !== 'thread' || !selectedRef) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadMessagingState(selectedRef, true);
      }
    }, 7000);
    return () => window.clearInterval(id);
  }, [open, authenticated, mode, selectedRef, loadMessagingState]);

  useEffect(() => {
    if (mode === 'thread' && messages.length > 0) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [mode, messages.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const isSup = t.source === 'support' || t.paymentProvider === 'direct';
      if (filter === 'support') return isSup;
      if (filter === 'orders') return !isSup;
      return true;
    });
  }, [threads, filter]);

  const hasSupportAndOrders = useMemo(() => {
    let hasSup = false;
    let hasOrd = false;
    for (const t of threads) {
      if (t.source === 'support' || t.paymentProvider === 'direct') hasSup = true;
      else hasOrd = true;
    }
    return hasSup && hasOrd;
  }, [threads]);

  const selectThread = async (ref: string) => {
    setSelectedRef(ref);
    setMode('thread');
    setMobileShowPane('pane');
    setErrorMsg(null);
    setDraftText('');
    await loadMessagingState(ref, false);
  };

  const handleStartNew = () => {
    setMode('compose');
    setSelectedRef(null);
    setActiveThread(null);
    setMobileShowPane('pane');
    setErrorMsg(null);
    setDraftText('');
  };

  const submitMessage = async () => {
    const clean = draftText.trim();
    if (!clean || sending) return;
    setSending(true);
    setErrorMsg(null);

    const topicText =
      topicIdx === 'custom'
        ? customTopic.trim() || copy.topics[0]
        : copy.topics[topicIdx] || copy.topics[0];

    try {
      const payload =
        mode === 'thread' && selectedRef
          ? { referenceCode: selectedRef, body: clean }
          : { topic: topicText, body: clean };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Mesaj gönderilemedi.');
      }

      setDraftText('');
      if (mode === 'compose' && data.referenceCode) {
        setSelectedRef(data.referenceCode);
        setActiveThread(data.order || null);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setMode('thread');
        await loadMessagingState(data.referenceCode, true);
      } else if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (data.order) setActiveThread(data.order);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Bağlantı hatası.');
    } finally {
      setSending(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submitMessage();
    }
  };

  if (!open) return null;

  return (
    <div
      className="rs-msg-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rs-msg-window">
        {/* Top Bar */}
        <header className="rs-msg-topbar">
          <div className="rs-msg-topbar-left">
            <div className="rs-msg-brand-badge" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <div className="rs-msg-title-row">
                <h2 className="rs-msg-title">{copy.title}</h2>
                <span className="rs-msg-online-pill">
                  <span className="rs-msg-online-dot" aria-hidden="true" />
                  {copy.onlinePill}
                </span>
              </div>
              <p className="rs-msg-subtitle">{copy.subtitle}</p>
            </div>
          </div>

          <div className="rs-msg-topbar-actions">
            {authenticated && (
              <button type="button" onClick={handleStartNew} className="st-pill-btn is-ember is-sm">
                + {copy.newTopicBtn}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rs-msg-close-btn"
              aria-label={copy.closeLbl}
              title={copy.closeLbl}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Body */}
        {loading && authenticated === null ? (
          <div className="rs-msg-center-state">Yükleniyor...</div>
        ) : authenticated === false ? (
          <div className="rs-msg-guest-box">
            <div className="rs-msg-guest-card">
              <div className="rs-msg-guest-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>{copy.guestHeading}</h3>
              <p>{copy.guestDesc}</p>

              <div className="rs-msg-guest-actions">
                <Link
                  href="/login?redirect=/?chat=new"
                  prefetch={false}
                  onClick={onClose}
                  className="st-pill-btn is-ember"
                >
                  {copy.guestLoginBtn} →
                </Link>
                <Link
                  href="/register?redirect=/?chat=new"
                  prefetch={false}
                  onClick={onClose}
                  className="st-pill-btn is-light"
                >
                  {copy.guestRegisterBtn}
                </Link>
              </div>

              <Link
                href="/iletisim"
                onClick={onClose}
                style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textDecoration: 'underline', marginTop: '6px' }}
              >
                {copy.guestContactBtn} ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className={`rs-msg-body ${mobileShowPane === 'pane' ? 'is-mobile-pane' : 'is-mobile-list'}`}>
            {/* Sidebar: Thread List */}
            <aside className="rs-msg-sidebar">
              <div className="rs-msg-sidebar-head">
                <span className="rs-msg-sidebar-lbl">{copy.threadsTitle} ({threads.length})</span>
                {hasSupportAndOrders && (
                  <div className="rs-msg-filter-row">
                    {(['all', 'support', 'orders'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`rs-msg-filter-pill ${filter === key ? 'is-active' : ''}`}
                      >
                        {key === 'all' ? copy.filterAll : key === 'support' ? copy.filterSupport : copy.filterOrders}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rs-msg-thread-list">
                {filteredThreads.length === 0 ? (
                  <div className="rs-msg-thread-empty">{copy.emptyThreads}</div>
                ) : (
                  filteredThreads.map((t) => {
                    const isSup = t.source === 'support' || t.paymentProvider === 'direct';
                    const isSel = mode === 'thread' && t.referenceCode === selectedRef;
                    return (
                      <button
                        key={t.referenceCode}
                        type="button"
                        onClick={() => void selectThread(t.referenceCode)}
                        className={`rs-msg-thread-btn ${isSel ? 'is-selected' : ''}`}
                      >
                        <div className="rs-msg-thread-top">
                          <span className={`rs-msg-type-tag ${isSup ? 'is-support' : 'is-order'}`}>
                            {isSup ? copy.badgeSupport : copy.badgeOrder}
                          </span>
                          <span className="rs-msg-thread-date">
                            {new Date(t.updatedAt || t.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="rs-msg-thread-title">{t.title}</div>
                        <div className="rs-msg-thread-sub">
                          <span>{t.referenceCode}</span>
                          <span>{copy.statusLabels[t.status] || t.status}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Main Pane */}
            <section className="rs-msg-pane">
              {mode === 'compose' ? (
                <div className="rs-msg-compose-wrap">
                  <div className="rs-msg-pane-head">
                    <div>
                      <button
                        type="button"
                        onClick={() => setMobileShowPane('list')}
                        className="rs-msg-mobile-back"
                      >
                        {copy.backToList}
                      </button>
                      <h3 className="rs-msg-pane-title">{copy.composeTitle}</h3>
                      <p className="rs-msg-pane-sub">{copy.composeSubtitle}</p>
                    </div>
                  </div>

                  <div className="rs-msg-compose-section">
                    <span className="rs-msg-field-lbl">{copy.topicLabel}</span>
                    <div className="rs-msg-chip-grid">
                      {copy.topics.map((topic, idx) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setTopicIdx(idx)}
                          className={`rs-msg-topic-chip ${topicIdx === idx ? 'is-selected' : ''}`}
                        >
                          {topic}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setTopicIdx('custom')}
                        className={`rs-msg-topic-chip ${topicIdx === 'custom' ? 'is-selected' : ''}`}
                      >
                        {copy.otherTopic}
                      </button>
                    </div>

                    {topicIdx === 'custom' && (
                      <input
                        type="text"
                        maxLength={80}
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder={copy.customTopicPlaceholder}
                        className="st-input"
                        style={{ marginTop: '8px' }}
                      />
                    )}
                  </div>

                  <div className="rs-msg-compose-section">
                    <span className="rs-msg-field-lbl">{copy.quickStartsLabel}</span>
                    <div className="rs-msg-starter-list">
                      {copy.quickStarts.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setDraftText(q)}
                          className="rs-msg-starter-btn"
                        >
                          “{q}”
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rs-msg-compose-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="rs-msg-compose-input" className="rs-msg-field-lbl">
                      {copy.messageLabel}
                    </label>
                    <textarea
                      id="rs-msg-compose-input"
                      rows={4}
                      maxLength={1500}
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder={copy.messagePlaceholder}
                      className="st-input rs-msg-textarea"
                    />
                  </div>

                  {errorMsg && <div className="rs-msg-error">{errorMsg}</div>}

                  <div className="rs-msg-compose-footer">
                    <Link
                      href="/hesabim?tab=orders"
                      prefetch={false}
                      onClick={onClose}
                      className="rs-msg-tg-hint"
                    >
                      {userMeta?.telegramLinked ? `✓ ${copy.tgConnected}` : copy.tgPrompt}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void submitMessage()}
                      disabled={sending || !draftText.trim()}
                      className="st-pill-btn is-ember"
                    >
                      {sending ? copy.sendingBtn : copy.sendBtn} →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rs-msg-thread-wrap">
                  <div className="rs-msg-pane-head">
                    <div style={{ minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => setMobileShowPane('list')}
                        className="rs-msg-mobile-back"
                      >
                        {copy.backToList}
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="rs-order-ref">{activeThread?.referenceCode || selectedRef}</span>
                        <span className="rs-status-badge is-info">
                          {copy.statusLabels[activeThread?.status || 'preparing'] || activeThread?.status}
                        </span>
                      </div>
                      <h3 className="rs-msg-pane-title" style={{ marginTop: '4px' }}>
                        {activeThread?.title || copy.title}
                      </h3>
                    </div>

                    <Link
                      href={`/hesabim?tab=orders&ref=${encodeURIComponent(activeThread?.referenceCode || selectedRef || '')}`}
                      prefetch={false}
                      onClick={onClose}
                      className="st-pill-btn is-outline is-sm"
                    >
                      {copy.openInAccount}
                    </Link>
                  </div>

                  <div className="rs-chat-feed rs-msg-feed">
                    {messages.map((m) => (
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
                    ))}
                    <div ref={feedEndRef} />
                  </div>

                  {errorMsg && <div className="rs-msg-error">{errorMsg}</div>}

                  <div className="rs-msg-reply-bar">
                    <textarea
                      rows={2}
                      maxLength={1500}
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder={copy.replyPlaceholder}
                      className="st-input rs-msg-reply-input"
                    />
                    <button
                      type="button"
                      onClick={() => void submitMessage()}
                      disabled={sending || !draftText.trim()}
                      className="st-pill-btn is-ember"
                    >
                      {sending ? '...' : copy.sendBtn}
                    </button>
                  </div>

                  <div className="rs-msg-pane-foot">
                    <Link
                      href="/hesabim?tab=orders"
                      prefetch={false}
                      onClick={onClose}
                      className="rs-msg-tg-hint"
                    >
                      {userMeta?.telegramLinked ? `✓ ${copy.tgConnected}` : copy.tgPrompt}
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
