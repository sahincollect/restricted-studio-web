'use client';

import React from 'react';
import Link from 'next/link';
import ShopierLogo from '@/components/ShopierLogo';
import type { Locale } from '@/lib/i18n';

export const SHOPIER_UI_COPY: Record<
  Locale,
  {
    payWithShopier: string;
    payShort: string;
    creatingListing: string;
    altItemsatis: string;
    slaShortBadge: string;
    slaNotice: string;
    notePlaceholder: string;
    authTitle: string;
    authDesc: string;
    authAction: string;
    readyTitle: string;
    refLabel: string;
    amountLabel: string;
    openPaymentBtn: string;
    openChatBtn: string;
    popupHint: string;
    closeBtn: string;
  }
> = {
  tr: {
    payWithShopier: 'Shopier ile Hemen Öde (Referanslı)',
    payShort: 'Shopier ile Öde',
    creatingListing: 'Özel Shopier ilanı & referans oluşturuluyor...',
    altItemsatis: 'İtemsatış ile Öde (Alternatif)',
    slaShortBadge: 'Teslimat: 2 Saat (Yoğunlukta 6–24 Sa)',
    slaNotice:
      'Ürünlerimiz ortalama 2 saat içerisinde teslim edilmektedir. Yoğunluk vb. durumlarda teslimat süresi 6 ila 24 saate uzayabilmektedir.',
    notePlaceholder: 'Sunucu adı / Discord @kullanıcı / teslimat notu (opsiyonel)',
    authTitle: 'Hesap Oturumu Gerekli',
    authDesc:
      'Size özel referans numarası ve 1-1 ürün teslimat sohbet odası açılabilmesi için önce hesabınıza giriş yapın.',
    authAction: 'Giriş Yap & Devam Et',
    readyTitle: 'Özel Shopier Ödeme İlanınız Hazır',
    refLabel: 'Referans No',
    amountLabel: 'Tutar',
    openPaymentBtn: 'Shopier Ödeme Sayfasını Aç',
    openChatBtn: 'Özel Teslimat Sohbetine Git',
    popupHint:
      'Ödemenizi tamamladıktan sonra sipariş durumunuzu ve teslimat sohbetinizi "Hesabım" üzerinden anlık takip edebilirsiniz.',
    closeBtn: 'Kapat',
  },
  en: {
    payWithShopier: 'Pay Now with Shopier (Tracked Ref)',
    payShort: 'Pay via Shopier',
    creatingListing: 'Creating custom Shopier listing & reference...',
    altItemsatis: 'Pay via İtemsatış (Alternative)',
    slaShortBadge: 'Delivery: ~2h (6–24h at peak)',
    slaNotice:
      'Our products are delivered within 2 hours on average. Depending on order volume, delivery may extend to 6–24 hours.',
    notePlaceholder: 'Server name / Discord handle / delivery note (optional)',
    authTitle: 'Sign In Required',
    authDesc:
      'Please sign in first so we can bind a unique reference number and open your private 1-on-1 delivery chat room.',
    authAction: 'Sign In & Continue',
    readyTitle: 'Custom Shopier Checkout Ready',
    refLabel: 'Reference No',
    amountLabel: 'Amount',
    openPaymentBtn: 'Open Shopier Payment Page',
    openChatBtn: 'Open Private Delivery Chat',
    popupHint:
      'After completing payment on Shopier, track live status and receive files directly inside your private delivery chat.',
    closeBtn: 'Close',
  },
  ru: {
    payWithShopier: 'Оплатить через Shopier (с кодом)',
    payShort: 'Оплатить Shopier',
    creatingListing: 'Создание индивидуального лота Shopier...',
    altItemsatis: 'Через İtemsatış (альтернатива)',
    slaShortBadge: 'Доставка: ~2 ч (до 6–24 ч в пик)',
    slaNotice:
      'Наши продукты доставляются в среднем в течение 2 часов. При высокой нагрузке срок доставки может увеличиться до 6–24 часов.',
    notePlaceholder: 'Название сервера / Discord @username (необязательно)',
    authTitle: 'Требуется вход в аккаунт',
    authDesc:
      'Войдите в аккаунт, чтобы мы могли создать персональный номер заказа и приватный чат выдачи товара.',
    authAction: 'Войти и продолжить',
    readyTitle: 'Персональная ссылка Shopier готова',
    refLabel: 'Номер заказа',
    amountLabel: 'Сумма',
    openPaymentBtn: 'Открыть оплату Shopier',
    openChatBtn: 'Перейти в чат выдачи',
    popupHint:
      'После оплаты отслеживайте статус и получайте файлы в личном чате выдачи в разделе «Аккаунт».',
    closeBtn: 'Закрыть',
  },
  fr: {
    payWithShopier: 'Payer via Shopier (Suivi)',
    payShort: 'Payer Shopier',
    creatingListing: 'Création de l’annonce Shopier personnalisée...',
    altItemsatis: 'Via İtemsatış (Alternatif)',
    slaShortBadge: 'Livraison : ~2 h (6–24 h en pic)',
    slaNotice:
      'Nos produits sont livrés sous 2 heures en moyenne. Selon l’affluence, le délai de livraison peut s’étendre à 6–24 heures.',
    notePlaceholder: 'Nom du serveur / Discord @pseudo / note (optionnel)',
    authTitle: 'Connexion requise',
    authDesc:
      'Connectez-vous afin d’attribuer un numéro de référence unique et d’ouvrir votre salon de livraison privé.',
    authAction: 'Se connecter & Continuer',
    readyTitle: 'Paiement Shopier personnalisé prêt',
    refLabel: 'Référence',
    amountLabel: 'Montant',
    openPaymentBtn: 'Ouvrir la page Shopier',
    openChatBtn: 'Ouvrir le salon de livraison',
    popupHint:
      'Une fois le paiement effectué, suivez votre commande et recevez vos fichiers dans votre salon privé.',
    closeBtn: 'Fermer',
  },
};

export interface ShopierCheckoutOrderSummary {
  referenceCode: string;
  checkoutUrl: string;
  chatUrl: string;
  title: string;
  totalAmount: number;
  slaNotice: string;
}

export type ShopierCheckoutResponse =
  | {
      ok: true;
      order: ShopierCheckoutOrderSummary;
    }
  | {
      ok: false;
      requiresAuth: boolean;
      message: string;
    };

export async function requestShopierCheckout(
  payload:
    | { source: 'catalog'; itemIds: string[]; note?: string }
    | { source: 'store'; productId: string; quantity?: number; note?: string }
): Promise<ShopierCheckoutResponse> {
  try {
    const res = await fetch('/api/shopier/checkout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.status === 401 || data?.requiresAuth) {
      return {
        ok: false,
        requiresAuth: true,
        message: data?.message || 'Lütfen devam etmek için hesabınıza giriş yapın.',
      };
    }
    if (!res.ok || !data?.success || !data?.checkoutUrl || !data?.order?.referenceCode) {
      return {
        ok: false,
        requiresAuth: false,
        message: data?.message || 'Shopier ödeme bağlantısı oluşturulamadı.',
      };
    }
    return {
      ok: true,
      order: {
        referenceCode: data.order.referenceCode,
        checkoutUrl: data.checkoutUrl,
        chatUrl:
          data.chatUrl ||
          `/hesabim?tab=orders&ref=${encodeURIComponent(data.order.referenceCode)}`,
        title: data.order.title || 'Sipariş',
        totalAmount: Number(data.order.totalAmount || 0),
        slaNotice: data.slaNotice || '',
      },
    };
  } catch {
    return {
      ok: false,
      requiresAuth: false,
      message: 'Ağ hatası oluştu, lütfen tekrar deneyin.',
    };
  }
}

export function ShopierCheckoutStatusBox({
  locale,
  redirectPath,
  requiresAuth,
  errorMessage,
  createdOrder,
  onClear,
}: {
  locale: Locale;
  redirectPath: string;
  requiresAuth: boolean;
  errorMessage: string | null;
  createdOrder: ShopierCheckoutOrderSummary | null;
  onClear?: () => void;
}) {
  const copy = SHOPIER_UI_COPY[locale] || SHOPIER_UI_COPY.tr;

  if (!requiresAuth && !errorMessage && !createdOrder) {
    return null;
  }

  if (requiresAuth) {
    return (
      <div className="rs-shopier-box is-auth" role="alert">
        <div className="rs-shopier-box-head">
          <strong>{copy.authTitle}</strong>
          {onClear && (
            <button type="button" onClick={onClear} className="rs-shopier-dismiss" aria-label={copy.closeBtn}>
              ✕
            </button>
          )}
        </div>
        <p className="rs-shopier-box-text">{copy.authDesc}</p>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="st-pill-btn is-ember is-sm is-full"
        >
          {copy.authAction} →
        </Link>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rs-shopier-box is-error" role="alert">
        <div className="rs-shopier-box-head">
          <span>{errorMessage}</span>
          {onClear && (
            <button type="button" onClick={onClear} className="rs-shopier-dismiss" aria-label={copy.closeBtn}>
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  if (createdOrder) {
    return (
      <div className="rs-shopier-box is-ready" role="status">
        <div className="rs-shopier-box-head">
          <strong>{copy.readyTitle}</strong>
          {onClear && (
            <button type="button" onClick={onClear} className="rs-shopier-dismiss" aria-label={copy.closeBtn}>
              ✕
            </button>
          )}
        </div>
        <div className="rs-shopier-meta">
          <span>
            {copy.refLabel}: <strong>{createdOrder.referenceCode}</strong>
          </span>
          <span>
            {copy.amountLabel}: <strong>{createdOrder.totalAmount.toLocaleString('tr-TR')} TL</strong>
          </span>
        </div>
        <p className="rs-shopier-sla">{copy.slaNotice}</p>
        <p className="rs-shopier-hint">{copy.popupHint}</p>
        <div className="rs-shopier-actions">
          <a
            href={createdOrder.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="st-pill-btn is-shopier is-sm is-full"
          >
            <ShopierLogo width={16} height={16} />
            <span>{copy.openPaymentBtn} ↗</span>
          </a>
          <Link href={createdOrder.chatUrl} className="st-pill-btn is-light is-sm is-full">
            {copy.openChatBtn} →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
