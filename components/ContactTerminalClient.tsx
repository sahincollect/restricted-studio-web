'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import { LEGAL_FORM_COPY } from '@/lib/legal-docs';
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
  const { locale } = useI18n();
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
    <div className="st-page-shell">
      <SiteNavbar activePath="/iletisim" />

      <main className="st-main">
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{copy.eyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{copy.heading}</h1>
              <p className="st-subhero-desc">{copy.lead}</p>
            </div>

            <div className="st-subhero-stats">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">7/24</span>
                <span className="st-stat-chip-lbl">{copy.slaLabel}</span>
              </div>
              <Link href="/status" className="st-stat-chip">
                <span className="st-stat-chip-val" style={{ color: 'var(--accent-coral)' }}>
                  %100
                </span>
                <span className="st-stat-chip-lbl">{copy.statusLink} →</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="st-container st-contact-grid">
          {/* Left Asymmetric Light Channel Card */}
          <aside className="st-contact-light-card">
            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#EA580C',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.emailLabel}
              </span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ fontSize: '15px', fontWeight: 700, color: '#111113', wordBreak: 'break-all' }}
              >
                {CONTACT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="st-pill-btn is-dark is-sm"
                style={{ alignSelf: 'flex-start', marginTop: '6px' }}
              >
                {copied ? copy.copiedBtn : copy.copyBtn}
              </button>
            </div>

            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#EA580C',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.storeLabel}
              </span>
              <a
                href={ITEMSATIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '15px', fontWeight: 700, color: '#111113' }}
              >
                {copy.storeValue} ↗
              </a>
              <span style={{ fontSize: '12.5px', color: 'var(--text-dark-muted)' }}>
                {copy.storeSub}
              </span>
            </div>

            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#EA580C',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.slaLabel}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111113' }}>
                {copy.slaValue}
              </span>
            </div>
          </aside>

          {/* Right Form */}
          <div className="st-contact-form-card spotlight-surface">
            <h2 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em' }}>
              {copy.formTitle}
            </h2>
            <p style={{ marginTop: '6px', marginBottom: '22px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {copy.formSubtitle}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="st-field-group">
                <label htmlFor="contact-name" className="st-field-label">
                  {copy.nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  className="st-input"
                  required
                />
              </div>

              <div className="st-field-group">
                <label htmlFor="contact-email" className="st-field-label">
                  {copy.emailInputLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder={copy.emailInputPlaceholder}
                  className="st-input"
                  required
                />
              </div>

              <div className="st-field-group">
                <label htmlFor="contact-topic" className="st-field-label">
                  {copy.topicLabel}
                </label>
                <select
                  id="contact-topic"
                  value={topicIndex}
                  onChange={(e) => setTopicIndex(e.target.value)}
                  className="st-select"
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
                <div className="st-field-group">
                  <label htmlFor="contact-custom-subject" className="st-field-label">
                    {copy.customTopicLabel}
                  </label>
                  <input
                    id="contact-custom-subject"
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={copy.customTopicPlaceholder}
                    className="st-input"
                  />
                </div>
              )}

              <div className="st-field-group">
                <label htmlFor="contact-msg" className="st-field-label">
                  {copy.messageLabel}
                </label>
                <textarea
                  id="contact-msg"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                  className="st-textarea"
                  required
                />
              </div>

              <button type="submit" className="st-pill-btn is-light is-full">
                {copy.submitBtn} →
              </button>

              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(LEGAL_FORM_COPY[locale] || LEGAL_FORM_COPY.tr).contactMailNotePrefix}
                <Link href="/yasal/kvkk" className="st-cookie-link">
                  {(LEGAL_FORM_COPY[locale] || LEGAL_FORM_COPY.tr).kvkkLink}
                </Link>
                {' & '}
                <Link href="/yasal/gizlilik" className="st-cookie-link">
                  {(LEGAL_FORM_COPY[locale] || LEGAL_FORM_COPY.tr).privacyLink}
                </Link>
                {(LEGAL_FORM_COPY[locale] || LEGAL_FORM_COPY.tr).contactMailNoteSuffix}
              </p>
            </form>

            {dispatched && (
              <div className="rs-auth-alert is-info" style={{ marginTop: '16px' }}>
                <span>
                  {copy.dispatchedNote}{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent-coral)', fontWeight: 600 }}>
                    {CONTACT_EMAIL}
                  </a>
                </span>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
