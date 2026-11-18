import type { Locale } from './i18n';

export type LegalDocSlug =
  | 'kvkk'
  | 'gizlilik'
  | 'cerez'
  | 'kullanim-kosullari'
  | 'teslimat-ve-iade';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: LegalDocSlug;
  href: `/yasal/${LegalDocSlug}`;
  navLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const LEGAL_DOC_ORDER: readonly LegalDocSlug[] = [
  'kvkk',
  'gizlilik',
  'cerez',
  'kullanim-kosullari',
  'teslimat-ve-iade',
];

export const LEGAL_NAV_META: Record<
  LegalDocSlug,
  {
    href: `/yasal/${LegalDocSlug}`;
    navLabel: Record<Locale, string>;
  }
> = {
  kvkk: {
    href: '/yasal/kvkk',
    navLabel: {
      tr: 'KVKK Aydınlatma',
      en: 'KVKK / Data Notice',
      ru: 'Уведомление KVKK',
      fr: 'Notice Données (KVKK)',
    },
  },
  gizlilik: {
    href: '/yasal/gizlilik',
    navLabel: {
      tr: 'Gizlilik Politikası',
      en: 'Privacy Policy',
      ru: 'Конфиденциальность',
      fr: 'Confidentialité',
    },
  },
  cerez: {
    href: '/yasal/cerez',
    navLabel: {
      tr: 'Çerez Politikası',
      en: 'Cookie Policy',
      ru: 'Файлы Cookie',
      fr: 'Cookies',
    },
  },
  'kullanim-kosullari': {
    href: '/yasal/kullanim-kosullari',
    navLabel: {
      tr: 'Kullanım Koşulları & DMCA',
      en: 'Terms & DMCA',
      ru: 'Условия & DMCA',
      fr: 'Conditions & DMCA',
    },
  },
  'teslimat-ve-iade': {
    href: '/yasal/teslimat-ve-iade',
    navLabel: {
      tr: 'Teslimat & İade',
      en: 'Delivery & Refunds',
      ru: 'Доставка и возврат',
      fr: 'Livraison & Retours',
    },
  },
};

export function getLegalNavItems(
  locale: Locale
): Array<{ slug: LegalDocSlug; href: string; label: string }> {
  return LEGAL_DOC_ORDER.map((slug) => ({
    slug,
    href: LEGAL_NAV_META[slug].href,
    label: LEGAL_NAV_META[slug].navLabel[locale] ?? LEGAL_NAV_META[slug].navLabel.tr,
  }));
}

export const LEGAL_FORM_COPY: Record<
  Locale,
  {
    kvkkLink: string;
    privacyLink: string;
    termsLink: string;
    serviceConsentPrefix: string;
    serviceConsentSuffix: string;
    serviceConsentErr: string;
    registerConsentPrefix: string;
    registerConsentSuffix: string;
    registerConsentErr: string;
    contactMailNotePrefix: string;
    contactMailNoteSuffix: string;
  }
> = {
  tr: {
    kvkkLink: 'KVKK Aydınlatma Metni',
    privacyLink: 'Gizlilik Politikası',
    termsLink: 'Kullanım Koşulları',
    serviceConsentPrefix: 'Başvuru bilgilerimin değerlendirilmesi ve dönüş yapılması amacıyla ',
    serviceConsentSuffix: ' kapsamında işlenmesini okudum ve onaylıyorum.',
    serviceConsentErr: 'Devam etmek için KVKK ve Gizlilik onay kutusunu işaretlemelisiniz.',
    registerConsentPrefix: 'Hesap oluşturulması sürecinde ',
    registerConsentSuffix: ' metinlerini okudum ve kabul ediyorum.',
    registerConsentErr: 'Kayıt olmak için KVKK ve Kullanım Koşulları onayı gereklidir.',
    contactMailNotePrefix: 'Gönder butonu varsayılan e-posta istemcinizi açar; paylaşılan iletişim verileri ',
    contactMailNoteSuffix: ' çerçevesinde işlenir.',
  },
  en: {
    kvkkLink: 'KVKK Data Notice',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms of Use',
    serviceConsentPrefix: 'I have read and agree to the processing of my request under the ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Please accept the Data Notice & Privacy Policy to submit.',
    registerConsentPrefix: 'I have read and accept the ',
    registerConsentSuffix: ' for account creation.',
    registerConsentErr: 'Please accept the Data Notice & Terms of Use to register.',
    contactMailNotePrefix: 'Submitting opens your email client; inquiry details are handled under the ',
    contactMailNoteSuffix: '.',
  },
  ru: {
    kvkkLink: 'Уведомлением KVKK',
    privacyLink: 'Политикой конфиденциальности',
    termsLink: 'Условиями использования',
    serviceConsentPrefix: 'Я ознакомился(лась) и согласен(на) на обработку заявки согласно ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Для отправки заявки необходимо принять условия обработки данных.',
    registerConsentPrefix: 'Я принимаю положения документов: ',
    registerConsentSuffix: '.',
    registerConsentErr: 'Для регистрации необходимо принять условия обработки данных.',
    contactMailNotePrefix: 'Кнопка открывает почтовый клиент; данные обрабатываются согласно ',
    contactMailNoteSuffix: '.',
  },
  fr: {
    kvkkLink: 'Notice Données (KVKK)',
    privacyLink: 'Politique de confidentialité',
    termsLink: 'Conditions d’utilisation',
    serviceConsentPrefix: 'J’ai lu et j’accepte le traitement de ma demande conformément à la ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Veuillez accepter la notice de confidentialité pour envoyer la demande.',
    registerConsentPrefix: 'J’ai lu et j’accepte les documents suivants : ',
    registerConsentSuffix: '.',
    registerConsentErr: 'Veuillez accepter les conditions légales pour créer un compte.',
    contactMailNotePrefix: 'L’envoi ouvre votre messagerie ; vos échanges relèvent de la ',
    contactMailNoteSuffix: '.',
  },
};
