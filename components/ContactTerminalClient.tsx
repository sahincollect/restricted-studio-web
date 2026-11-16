'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Locale } from '@/lib/i18n';

const CONTACT_EMAIL = 'info@restrictedstudio.shop';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

interface ContactCopy {
  eyebrow: string;
  heading: string;
  lead: string;
  emailLabel: string;
  copyBtn: string;
  copiedBtn: string;
  storeLabel: string;
  storeValue: string;
  storeSub: string;
  slaLabel: string;
  slaValue: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailInputLabel: string;
  emailInputPlaceholder: string;
  topicLabel: string;
  customTopicLabel: string;
  customTopicPlaceholder: string;
  otherOption: string;
  topics: string[];
  messageLabel: string;
  messagePlaceholder: string;
  submitBtn: string;
  dispatchedNote: string;
  statusLink: string;
  mailGreeting: string;
  senderField: string;
  replyField: string;
  defaultSubject: string;
}

const CONTACT_I18N: Record<Locale, ContactCopy> = {
  tr: {
    eyebrow: 'KURUMSAL İLETİŞİM',
    heading: 'Bizimle İletişime Geçin',
    lead: 'Paket lisansları, 15+ toplu alım süreçleri ve kurumsal teknik destek talepleriniz için resmi iletişim kanallarımız üzerinden ekibimize ulaşabilirsiniz.',
    emailLabel: 'RESMİ E-POSTA',
    copyBtn: 'Kopyala',
    copiedBtn: 'Kopyalandı ✓',
    storeLabel: 'ONAYLI SATIŞ KANALI',
    storeValue: 'İtemsatış Resmi Mağazası',
    storeSub: 'Güvenli ödeme ve doğrulanmış mağaza profili',
    slaLabel: 'YANIT SÜRESİ',
    slaValue: 'Ortalama 2 saat içinde (7/24 aktif destek)',
    formTitle: 'İletişim Formu',
    formSubtitle: 'Form verileri cihazınızdaki e-posta istemcisi üzerinden resmi adresimize taslak olarak hazırlanır.',
    nameLabel: 'Ad Soyad / Kurum',
    namePlaceholder: 'Örn. Ahmet Yılmaz',
    emailInputLabel: 'E-posta Adresiniz',
    emailInputPlaceholder: 'ad@alanadi.com',
    topicLabel: 'Konu',
    customTopicLabel: 'Konu Başlığı',
    customTopicPlaceholder: 'Talebinizin konusunu yazın',
    otherOption: 'Diğer',
    topics: [
      'Paket & Katalog Danışmanlığı',
      'Toplu Alım & %50 İndirim Talebi (15+)',
      'Teknik Destek & Kurulum',
      'Kurumsal İş Birliği & Özel Proje',
    ],
    messageLabel: 'Mesajınız',
    messagePlaceholder: 'Talep ettiğiniz paketleri veya projenizle ilgili detayları belirtin...',
    submitBtn: 'E-posta İstemcisiyle Gönder',
    dispatchedNote: 'E-posta uygulamanız açıldı. Yönlendirme gerçekleşmezse doğrudan',
    statusLink: 'Durum',
    mailGreeting: 'Merhaba Restricted Studio ekibi,',
    senderField: 'Gönderen',
    replyField: 'Yanıt Adresi',
    defaultSubject: 'Restricted Studio Kurumsal İletişim',
  },
  en: {
    eyebrow: 'CORPORATE CONTACT',
    heading: 'Contact Our Team',
    lead: 'Reach our team through our official channels for package licensing, 15+ bulk purchasing inquiries, and technical support.',
    emailLabel: 'OFFICIAL EMAIL',
    copyBtn: 'Copy',
    copiedBtn: 'Copied ✓',
    storeLabel: 'VERIFIED STOREFRONT',
    storeValue: 'İtemsatış Official Store',
    storeSub: 'Escrow-backed checkout and verified merchant profile',
    slaLabel: 'RESPONSE TIME',
    slaValue: 'Within 2 hours on average (24/7 coverage)',
    formTitle: 'Send a Message',
    formSubtitle: 'Prepares a draft directly in your default email application.',
    nameLabel: 'Name / Organization',
    namePlaceholder: 'e.g. Alex Morgan',
    emailInputLabel: 'Your Email',
    emailInputPlaceholder: 'name@company.com',
    topicLabel: 'Subject',
    customTopicLabel: 'Subject Title',
    customTopicPlaceholder: 'Enter your subject',
    otherOption: 'Other',
    topics: [
      'Catalog & Package Consultation',
      'Bulk Licensing (15+ Packs · 50% Off)',
      'Technical Support & Setup',
      'Enterprise Partnership & Custom Work',
    ],
    messageLabel: 'Message',
    messagePlaceholder: 'Briefly describe the packages or inquiry details...',
    submitBtn: 'Open in Email Client',
    dispatchedNote: 'Your email client was launched. If nothing opened, write directly to',
    statusLink: 'Status',
    mailGreeting: 'Hello Restricted Studio team,',
    senderField: 'Sender',
    replyField: 'Reply-To',
    defaultSubject: 'Restricted Studio Corporate Inquiry',
  },
  ru: {
    eyebrow: 'КОРПОРАТИВНЫЕ КОНТАКТЫ',
    heading: 'Связаться с нами',
    lead: 'Свяжитесь с нашей командой по официальным каналам по вопросам лицензирования, оптовых заказов (15+ со скидкой 50%) и техподдержки.',
    emailLabel: 'ОФИЦИАЛЬНАЯ ПОЧТА',
    copyBtn: 'Копировать',
    copiedBtn: 'Скопировано ✓',
    storeLabel: 'ОФИЦИАЛЬНЫЙ МАГАЗИН',
    storeValue: 'Проверенный профиль İtemsatış',
    storeSub: 'Безопасная оплата и подтверждённый продавец',
    slaLabel: 'ВРЕМЯ ОТВЕТА',
    slaValue: 'В среднем до 2 часов (поддержка 24/7)',
    formTitle: 'Форма обратной связи',
    formSubtitle: 'Создаёт черновик письма в вашем почтовом клиенте.',
    nameLabel: 'Имя / Проект',
    namePlaceholder: 'Напр. Алексей',
    emailInputLabel: 'Ваш Email',
    emailInputPlaceholder: 'name@domain.com',
    topicLabel: 'Тема обращения',
    customTopicLabel: 'Укажите тему',
    customTopicPlaceholder: 'Краткая тема запроса',
    otherOption: 'Другое',
    topics: [
      'Консультация по каталогу и пакетам',
      'Оптовый заказ (15+ пакетов · скидка 50%)',
      'Техническая поддержка и установка',
      'Индивидуальный проект и сотрудничество',
    ],
    messageLabel: 'Сообщение',
    messagePlaceholder: 'Опишите интересующие пакеты или детали вашего запроса...',
    submitBtn: 'Открыть почтовый клиент',
    dispatchedNote: 'Почтовый клиент запущен. При необходимости напишите напрямую на',
    statusLink: 'Статус',
    mailGreeting: 'Здравствуйте, команда Restricted Studio,',
    senderField: 'Отправитель',
    replyField: 'Обратный адрес',
    defaultSubject: 'Запрос в Restricted Studio',
  },
  fr: {
    eyebrow: 'CONTACT ENTREPRISE',
    heading: 'Contacter notre équipe',
    lead: 'Contactez notre équipe via nos canaux officiels pour le catalogue, les achats en volume (15+ avec 50 % de remise) et le support technique.',
    emailLabel: 'E-MAIL OFFICIEL',
    copyBtn: 'Copier',
    copiedBtn: 'Copié ✓',
    storeLabel: 'BOUTIQUE VÉRIFIÉE',
    storeValue: 'Boutique Officielle İtemsatış',
    storeSub: 'Paiement sécurisé et profil vendeur certifié',
    slaLabel: 'DÉLAI DE RÉPONSE',
    slaValue: 'Sous 2 heures en moyenne (support 24/7)',
    formTitle: 'Envoyer un message',
    formSubtitle: 'Prépare un brouillon directement dans votre messagerie par défaut.',
    nameLabel: 'Nom / Organisation',
    namePlaceholder: 'Ex. Camille Laurent',
    emailInputLabel: 'Votre e-mail',
    emailInputPlaceholder: 'nom@domaine.com',
    topicLabel: 'Objet',
    customTopicLabel: 'Précisez l’objet',
    customTopicPlaceholder: 'Titre de votre demande',
    otherOption: 'Autre',
    topics: [
      'Conseil catalogue & licences',
      'Achat en volume (15+ packs · -50 %)',
      'Support technique & installation',
      'Partenariat & projet sur mesure',
    ],
    messageLabel: 'Message',
    messagePlaceholder: 'Décrivez brièvement les ressources souhaitées ou votre demande...',
    submitBtn: 'Envoyer via messagerie',
    dispatchedNote: 'Votre client e-mail a été ouvert. Sinon, écrivez directement à',
    statusLink: 'Statut',
    mailGreeting: 'Bonjour l’équipe Restricted Studio,',
    senderField: 'Expéditeur',
    replyField: 'Adresse de réponse',
    defaultSubject: 'Demande entreprise Restricted Studio',
  },
};

export default function ContactTerminalClient() {
  const { locale, t } = useI18n();
  const copy = CONTACT_I18N[locale] || CONTACT_I18N.tr;

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [topicIndex, setTopicIndex] = useState<string>('0');
  const [customSubject, setCustomSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const selectedSubject =
    topicIndex === 'other'
      ? customSubject.trim() || copy.defaultSubject
      : copy.topics[Number(topicIndex)] || copy.topics[0];

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const buildMailtoHref = () => {
    const cleanSubject = selectedSubject || copy.defaultSubject;
    const bodyLines = [
      senderName.trim() ? `${copy.senderField}: ${senderName.trim()}` : '',
      senderEmail.trim() ? `${copy.replyField}: ${senderEmail.trim()}` : '',
      senderName.trim() || senderEmail.trim() ? '---' : '',
      message.trim() || copy.mailGreeting,
    ].filter(Boolean);

    const params = new URLSearchParams({
      subject: cleanSubject,
      body: bodyLines.join('\n'),
    });
    return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatched(true);
    window.location.href = buildMailtoHref();
  };

  return (
    <div className="rs-contact-shell">
      <header className="rs-contact-topbar">
        <div className="rs-contact-header-inner">
          <Link href="/" className="rs-contact-brand">
            <img src="/assets/rslogo.jpg" alt="Restricted Studio" width={28} height={28} className="rs-contact-logo" />
            <span className="rs-contact-brand-name">RESTRICTED STUDIO</span>
          </Link>

          <nav className="rs-contact-nav" aria-label={copy.eyebrow}>
            <Link href="/" className="rs-contact-nav-link">
              {t.common.home}
            </Link>
            <Link href="/katalog" className="rs-contact-nav-link nav-katalog-shimmer">
              {t.common.catalog}
            </Link>
            <Link href="/lisanslar" className="rs-contact-nav-link nav-katalog-shimmer">
              {t.common.licenses}
            </Link>
            <Link href="/status" className="rs-contact-nav-link rs-contact-status-link">
              {copy.statusLink}
            </Link>
            <LanguageSwitcher compact />
            <Link href="/dashboard" className="rs-contact-portal-btn">
              {t.common.clientPortal} →
            </Link>
          </nav>
        </div>
      </header>

      <main className="rs-contact-main">
        <div className="rs-contact-grid">
          <section className="rs-contact-info" aria-labelledby="contact-page-heading">
            <div className="rs-contact-eyebrow">
              <span className="rs-contact-eyebrow-bar" aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>

            <h1 id="contact-page-heading" className="rs-contact-title">
              {copy.heading}
            </h1>
            <p className="rs-contact-lead">{copy.lead}</p>

            <dl className="rs-contact-directory">
              <div className="rs-contact-dir-row">
                <dt>{copy.emailLabel}</dt>
                <dd className="rs-contact-email-dd">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="rs-contact-email-link">
                    {CONTACT_EMAIL}
                  </a>
                  <button type="button" onClick={handleCopyEmail} className="rs-contact-copy-btn">
                    {copied ? copy.copiedBtn : copy.copyBtn}
                  </button>
                </dd>
              </div>

              <div className="rs-contact-dir-row">
                <dt>{copy.storeLabel}</dt>
                <dd>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rs-contact-store-link"
                  >
                    {copy.storeValue} ↗
                  </a>
                  <span className="rs-contact-dir-sub">{copy.storeSub}</span>
                </dd>
              </div>

              <div className="rs-contact-dir-row">
                <dt>{copy.slaLabel}</dt>
                <dd>{copy.slaValue}</dd>
              </div>
            </dl>
          </section>

          <section className="rs-contact-card" aria-labelledby="contact-form-heading">
            <div className="rs-contact-card-head">
              <h2 id="contact-form-heading" className="rs-contact-form-title">
                {copy.formTitle}
              </h2>
              <p className="rs-contact-form-sub">{copy.formSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="rs-contact-form">
              <div className="rs-contact-field-row">
                <div className="rs-contact-field">
                  <label htmlFor="contact-name">{copy.nameLabel}</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={copy.namePlaceholder}
                  />
                </div>

                <div className="rs-contact-field">
                  <label htmlFor="contact-email">{copy.emailInputLabel}</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder={copy.emailInputPlaceholder}
                  />
                </div>
              </div>

              <div className="rs-contact-field">
                <label htmlFor="contact-topic">{copy.topicLabel}</label>
                <select
                  id="contact-topic"
                  value={topicIndex}
                  onChange={(e) => setTopicIndex(e.target.value)}
                >
                  {copy.topics.map((topic, idx) => (
                    <option key={topic} value={String(idx)}>
                      {topic}
                    </option>
                  ))}
                  <option value="other">{copy.otherOption}</option>
                </select>
              </div>

              {topicIndex === 'other' && (
                <div className="rs-contact-field">
                  <label htmlFor="contact-custom-subject">{copy.customTopicLabel}</label>
                  <input
                    id="contact-custom-subject"
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={copy.customTopicPlaceholder}
                    required
                  />
                </div>
              )}

              <div className="rs-contact-field">
                <label htmlFor="contact-message">{copy.messageLabel}</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                  required
                />
              </div>

              <button type="submit" className="rs-contact-submit">
                <span>{copy.submitBtn}</span>
                <span aria-hidden="true">→</span>
              </button>

              {dispatched && (
                <p className="rs-contact-dispatch-note" role="status">
                  {copy.dispatchedNote}{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
