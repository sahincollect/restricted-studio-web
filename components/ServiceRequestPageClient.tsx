'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import TurnstileWidget from '@/components/TurnstileWidget';
import type { Locale } from '@/lib/i18n';

export type ServiceKind = 'web-kurulum' | 'discord-bot';

interface ServiceConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  stat1Val: string;
  stat1Label: string;
  stat2Val: string;
  stat2Label: string;
  sideEyebrow: string;
  sideHeading: string;
  sideBody: string;
  sideStepsTitle: string;
  sideSteps: string[];
  switchLabel: string;
  switchHref: string;
  switchTitle: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  discordLabel: string;
  discordPlaceholder: string;
  tierLabel: string;
  tiers: string[];
  scopeLabel: string;
  scopePlaceholder: string;
  addonsLabel: string;
  addons: string[];
  budgetLabel: string;
  budgets: string[];
  timelineLabel: string;
  timelines: string[];
  detailsLabel: string;
  detailsPlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  successTitle: string;
  successDesc: string;
  successRefLabel: string;
  resetBtn: string;
  errorFallback: string;
}

const SERVICE_COPY: Record<Locale, Record<ServiceKind, ServiceConfig>> = {
  tr: {
    'web-kurulum': {
      eyebrow: 'ÖZEL YAZILIM & WEB MİMARİSİ',
      title: 'Web Sitesi Kurulum Hizmeti',
      subtitle:
        'Markanıza veya FiveM/RedM projenize özel, yüksek hızlı Next.js arayüzler, müşteri portalları ve güvenli ödeme/lisans altyapıları.',
      stat1Val: 'Otomatik',
      stat1Label: 'Anlık Mail İletimi',
      stat2Val: '3–14 Gün',
      stat2Label: 'Ortalama Teslim',
      sideEyebrow: 'KAPSAM VE TESLİMAT',
      sideHeading: 'Sıfırdan Üretime Anahtar Teslim Kurulum',
      sideBody:
        'Formu gönderdiğiniz anda bilgileriniz doğrudan resmi ekibimize e-posta olarak iletilir ve teknik değerlendirme başlatılır.',
      sideStepsTitle: 'STANDART TESLİMAT İÇERİĞİ',
      sideSteps: [
        'Modern responsive arayüz (Masaüstü + Mobil uyumlu)',
        'SSL, sıkı güvenlik başlıkları ve Cloudflare optimizasyonu',
        'Çok dilli yapı, SEO şeması ve yüksek hız skoru',
        'Talebe göre admin paneli, Supabase veritabanı ve API bağlantısı',
      ],
      switchLabel: 'DİĞER HİZMET',
      switchHref: '/hizmetler/discord-bot',
      switchTitle: 'Discord Bot Hizmetleri →',
      formTitle: 'Web Kurulum Başvuru Formu',
      formSubtitle: 'Formu doldurup gönderdiğinizde talebiniz info@restrictedstudio.shop adresine otomatik iletilir.',
      nameLabel: 'Ad Soyad / Marka / Ekip',
      namePlaceholder: 'Örn. Ahmet Yılmaz / Nova Roleplay',
      emailLabel: 'E-posta Adresiniz (Yanıt İçin)',
      emailPlaceholder: 'ad@alanadi.com',
      discordLabel: 'Discord Kullanıcı Adı',
      discordPlaceholder: 'Örn. ahmety veya ahmet#0001',
      tierLabel: 'İstenilen Web Sitesi Türü',
      tiers: [
        'FiveM / RedM Sunucu & Topluluk Portalı',
        'Kurumsal Firma / Ajans Web Sitesi',
        'Dijital Mağaza & Lisans Satış Sistemi',
        'Özel Yönetim Paneli / Web Uygulaması',
      ],
      scopeLabel: 'Alan Adı (Domain) veya Mevcut Site Bilgisi',
      scopePlaceholder: 'Örn. projem.com veya yeni domain',
      addonsLabel: 'Eklenmesini İstediğiniz Özellikler',
      addons: [
        'Çoklu Dil (TR / EN / RU / FR)',
        'Üye & Lisans Müşteri Portalı',
        'İtemsatış / Ödeme Akışı Entegrasyonu',
        'Otomatik E-posta Formları (Resend)',
        'Admin Yönetim & İçerik Paneli',
        'Özel Marka Animasyonları',
      ],
      budgetLabel: 'Tahmini Bütçe Aralığı',
      budgets: ['2.500₺ – 5.000₺', '5.000₺ – 12.000₺', '12.000₺ – 25.000₺', '25.000₺+ (Özel Kurumsal)'],
      timelineLabel: 'Hedef Teslim Süresi',
      timelines: ['3–5 Gün (Öncelikli)', '1–2 Hafta (Standart)', '3–4 Hafta (Kapsamlı)', 'Esnek / Planlanabilir'],
      detailsLabel: 'Proje Detayları ve İstekleriniz',
      detailsPlaceholder:
        'Beğendiğiniz örnek siteleri, bulunmasını istediğiniz sayfaları ve özel entegrasyon taleplerinizi yazın...',
      submitBtn: 'Talebi Otomatik Gönder',
      submittingBtn: 'Gönderiliyor...',
      successTitle: 'Web Kurulum Talebiniz Alındı',
      successDesc: 'Bilgileriniz otomatik olarak info@restrictedstudio.shop adresine iletildi. Ekibimiz verdiğiniz e-posta adresi üzerinden dönüş yapacaktır.',
      successRefLabel: 'BAŞVURU REFERANS NO',
      resetBtn: 'Yeni Talep Oluştur',
      errorFallback: 'Talebiniz gönderilirken bir hata oluştu. Lütfen alanları kontrol edip tekrar deneyin.',
    },
    'discord-bot': {
      eyebrow: 'ÖZEL DISCORD OTOMASYONU',
      title: 'Discord Bot Hizmetleri',
      subtitle:
        'FiveM/RedM veritabanı köprüleri, ticket/whitelist otomasyonları, moderasyon guard modülleri ve tam açık kaynak Discord bot geliştirme.',
      stat1Val: 'Otomatik',
      stat1Label: 'Anlık Mail İletimi',
      stat2Val: '7/24 Aktif',
      stat2Label: 'Kesintisiz Mimari',
      sideEyebrow: 'BOT MİMARİSİ VE GÜVENLİK',
      sideHeading: 'Yüksek Performanslı Özel Bot Çözümleri',
      sideBody:
        'Başvuruyu gönderdiğiniz anda teknik gereksinimleriniz otomatik olarak ekibimize e-posta ile iletilir.',
      sideStepsTitle: 'TEKNİK STANDARTLAR',
      sideSteps: [
        'Modern Slash (/) komutları, butonlar ve etkileşimli modallar',
        'FiveM / RedM MariaDB & txAdmin canlı veri senkronizasyonu',
        'Role-guard, anti-raid ve kapsamlı denetim kayıtları (Log)',
        'Açık kaynak kod teslimi veya 7/24 bulut barındırma seçeneği',
      ],
      switchLabel: 'DİĞER HİZMET',
      switchHref: '/hizmetler/web-kurulum',
      switchTitle: 'Web Sitesi Kurulum Hizmeti →',
      formTitle: 'Discord Bot Başvuru Formu',
      formSubtitle: 'Formu doldurup gönderdiğinizde talebiniz info@restrictedstudio.shop adresine otomatik iletilir.',
      nameLabel: 'Ad Soyad / Sunucu Adı',
      namePlaceholder: 'Örn. Emir Kaya / Horizon RP',
      emailLabel: 'E-posta Adresiniz (Yanıt İçin)',
      emailPlaceholder: 'ad@alanadi.com',
      discordLabel: 'Discord Kullanıcı Adı / ID',
      discordPlaceholder: 'Örn. emirkaya veya sunucu davet linki',
      tierLabel: 'İstenilen Bot Türü',
      tiers: [
        'FiveM / RedM Whitelist & Oyuncu Yönetim Botu',
        'Gelişmiş Ticket & Destek Otomasyon Botu',
        'Moderasyon, Guard & Detaylı Log Botu',
        'Ekonomi, Market & Çekiliş Botu',
        'Tüm Sistemler Bir Arada (Tam Paket Özel Bot)',
      ],
      scopeLabel: 'Barındırma Tercihi / Sunucu Üye Sayısı',
      scopePlaceholder: 'Örn. 7/24 Hosting Dahil · ~1.500 üye',
      addonsLabel: 'İstediğiniz Modüller & Entegrasyonlar',
      addons: [
        'FiveM / RedM SQL & txAdmin Köprüsü',
        'Otomatik Ses Kanalı & Rol Atama',
        'İtemsatış / Webhook Bildirim Akışı',
        'Web Panel Üzerinden Kontrol',
        'Kayıt (Register) & Ceza Puan Sistemi',
        'Tam Açık Kaynak Kod Teslimi',
      ],
      budgetLabel: 'Tahmini Bütçe Aralığı',
      budgets: ['1.000₺ – 2.500₺', '2.500₺ – 6.000₺', '6.000₺ – 15.000₺', '15.000₺+ (Kurumsal Özel Bot)'],
      timelineLabel: 'Hedef Teslim Süresi',
      timelines: ['2–3 Gün (Hızlı)', '1 Hafta (Standart)', '2–3 Hafta (Kapsamlı)', 'Esnek / Planlanabilir'],
      detailsLabel: 'İstediğiniz Komutlar ve Bot İşleyişi',
      detailsPlaceholder:
        'Botun yapmasını istediğiniz işlemleri, özel komut isimlerini, log kanallarını veya entegrasyonları yazın...',
      submitBtn: 'Talebi Otomatik Gönder',
      submittingBtn: 'Gönderiliyor...',
      successTitle: 'Discord Bot Talebiniz Alındı',
      successDesc: 'Bilgileriniz otomatik olarak info@restrictedstudio.shop adresine iletildi. Ekibimiz kısa sürede size ulaşacaktır.',
      successRefLabel: 'BAŞVURU REFERANS NO',
      resetBtn: 'Yeni Talep Oluştur',
      errorFallback: 'Talebiniz gönderilirken bir hata oluştu. Lütfen alanları kontrol edip tekrar deneyin.',
    },
  },
  en: {
    'web-kurulum': {
      eyebrow: 'CUSTOM WEB ARCHITECTURE',
      title: 'Website Setup Service',
      subtitle:
        'High-speed Next.js storefronts, customer licensing portals, and custom corporate sites tailored to your FiveM/RedM community or brand.',
      stat1Val: 'Automatic',
      stat1Label: 'Instant Email Dispatch',
      stat2Val: '3–14 Days',
      stat2Label: 'Average Delivery',
      sideEyebrow: 'SCOPE & DELIVERY',
      sideHeading: 'Turnkey Engineering From Design to Launch',
      sideBody:
        'Once submitted, your project brief is sent directly to our engineering inbox for rapid technical review.',
      sideStepsTitle: 'INCLUDED IN EVERY BUILD',
      sideSteps: [
        'Responsive desktop & mobile UI tailored to your brand',
        'SSL, strict security headers & Cloudflare readiness',
        'Multi-language setup, structured SEO & fast Core Web Vitals',
        'Optional admin dashboard, Supabase DB & checkout flows',
      ],
      switchLabel: 'OTHER SERVICE',
      switchHref: '/hizmetler/discord-bot',
      switchTitle: 'Discord Bot Services →',
      formTitle: 'Website Project Brief',
      formSubtitle: 'Automatically dispatched to info@restrictedstudio.shop upon submission.',
      nameLabel: 'Full Name / Brand',
      namePlaceholder: 'e.g. Alex Morgan / Apex Roleplay',
      emailLabel: 'Your Email (For Reply)',
      emailPlaceholder: 'you@domain.com',
      discordLabel: 'Discord Username',
      discordPlaceholder: 'e.g. alexm',
      tierLabel: 'Website Type',
      tiers: [
        'FiveM / RedM Community Portal',
        'Corporate / Studio Website',
        'Digital Storefront & License Portal',
        'Custom Dashboard / Web Application',
      ],
      scopeLabel: 'Domain Status / Reference Site',
      scopePlaceholder: 'e.g. myproject.com (need domain setup too)',
      addonsLabel: 'Desired Features',
      addons: [
        'Multi-Language Support (TR/EN/RU/FR)',
        'Member & License Portal',
        'Checkout / İtemsatış Integration',
        'Automated Transactional Emails',
        'Admin Management Dashboard',
        'Custom Brand Animations',
      ],
      budgetLabel: 'Estimated Budget',
      budgets: ['$80 – $150', '$150 – $350', '$350 – $750', '$750+ (Enterprise)'],
      timelineLabel: 'Target Timeline',
      timelines: ['3–5 Days (Priority)', '1–2 Weeks (Standard)', '3–4 Weeks (Comprehensive)', 'Flexible'],
      detailsLabel: 'Project Details & Requirements',
      detailsPlaceholder: 'Describe pages, design references, integrations, and key requirements...',
      submitBtn: 'Submit Request Automatically',
      submittingBtn: 'Sending...',
      successTitle: 'Website Request Dispatched',
      successDesc: 'Your project details have been automatically emailed to info@restrictedstudio.shop.',
      successRefLabel: 'REFERENCE ID',
      resetBtn: 'Submit Another Request',
      errorFallback: 'Could not send request. Please verify the fields and try again.',
    },
    'discord-bot': {
      eyebrow: 'CUSTOM DISCORD AUTOMATION',
      title: 'Discord Bot Services',
      subtitle:
        'Custom FiveM/RedM database bridges, ticket/whitelist systems, anti-raid guard modules, and full open-source Discord bots.',
      stat1Val: 'Automatic',
      stat1Label: 'Instant Email Dispatch',
      stat2Val: '24/7 Ready',
      stat2Label: 'Reliable Architecture',
      sideEyebrow: 'BOT ARCHITECTURE',
      sideHeading: 'Production-Grade Custom Discord Systems',
      sideBody:
        'Your specification is sent automatically to our engineering team for scoping and architecture setup.',
      sideStepsTitle: 'ENGINEERING STANDARDS',
      sideSteps: [
        'Modern Slash commands, interactive buttons & modals',
        'Live FiveM/RedM MariaDB & txAdmin integration',
        'Role guard, anti-nuke & full audit logging',
        'Open-source code delivery or managed 24/7 hosting',
      ],
      switchLabel: 'OTHER SERVICE',
      switchHref: '/hizmetler/web-kurulum',
      switchTitle: 'Website Setup Service →',
      formTitle: 'Discord Bot Request Form',
      formSubtitle: 'Automatically dispatched to info@restrictedstudio.shop upon submission.',
      nameLabel: 'Full Name / Server Name',
      namePlaceholder: 'e.g. Jordan / Horizon RP',
      emailLabel: 'Your Email (For Reply)',
      emailPlaceholder: 'you@domain.com',
      discordLabel: 'Discord Username / Server Invite',
      discordPlaceholder: 'e.g. jordan.dev',
      tierLabel: 'Bot Category',
      tiers: [
        'FiveM / RedM Whitelist & Application Bot',
        'Advanced Ticket & Support System',
        'Moderation, Security Guard & Logging Bot',
        'Economy, Storefront & Giveaway Bot',
        'All-In-One Custom Server Bot',
      ],
      scopeLabel: 'Hosting Preference / Member Count',
      scopePlaceholder: 'e.g. Managed 24/7 Hosting · ~1,500 members',
      addonsLabel: 'Requested Modules',
      addons: [
        'FiveM / RedM SQL & txAdmin Bridge',
        'Auto Voice Channels & Role Sync',
        'Store / Webhook Alerts',
        'Web Control Panel',
        'Verification & Penalty Points',
        'Full Open-Source Delivery',
      ],
      budgetLabel: 'Estimated Budget',
      budgets: ['$35 – $75', '$75 – $180', '$180 – $450', '$450+ (Full Suite)'],
      timelineLabel: 'Target Timeline',
      timelines: ['2–3 Days (Fast)', '1 Week (Standard)', '2–3 Weeks (Custom)', 'Flexible'],
      detailsLabel: 'Commands & Workflow Details',
      detailsPlaceholder: 'List commands, role workflows, logs, or FiveM database events needed...',
      submitBtn: 'Submit Request Automatically',
      submittingBtn: 'Sending...',
      successTitle: 'Discord Bot Request Dispatched',
      successDesc: 'Your specifications were automatically emailed to info@restrictedstudio.shop.',
      successRefLabel: 'REFERENCE ID',
      resetBtn: 'Submit Another Request',
      errorFallback: 'Could not send request. Please verify the fields and try again.',
    },
  },
  ru: {
    'web-kurulum': {
      eyebrow: 'ВЕБ-АРХИТЕКТУРА ПОД КЛЮЧ',
      title: 'Услуга создания веб-сайта',
      subtitle:
        'Высокоскоростные сайты на Next.js, порталы лицензий и корпоративные витрины для серверов FiveM/RedM и брендов.',
      stat1Val: 'Авто',
      stat1Label: 'Мгновенная отправка',
      stat2Val: '3–14 дн.',
      stat2Label: 'Срок разработки',
      sideEyebrow: 'СОСТАВ И ЗАПУСК',
      sideHeading: 'От дизайна до запуска под ключ',
      sideBody:
        'После отправки заявка автоматически поступает на официальную почту нашей команды.',
      sideStepsTitle: 'СТАНДАРТНЫЕ ВОЗМОЖНОСТИ',
      sideSteps: [
        'Адаптивный интерфейс для ПК и смартфонов',
        'SSL, строгие заголовки безопасности и Cloudflare',
        'Мультиязычность, SEO-разметка и быстрая загрузка',
        'При необходимости: админ-панель, база Supabase и приём платежей',
      ],
      switchLabel: 'ДРУГАЯ УСЛУГА',
      switchHref: '/hizmetler/discord-bot',
      switchTitle: 'Разработка Discord-ботов →',
      formTitle: 'Заявка на создание сайта',
      formSubtitle: 'Данные автоматически отправляются на info@restrictedstudio.shop.',
      nameLabel: 'Имя / Проект',
      namePlaceholder: 'Напр. Алексей / Nova RP',
      emailLabel: 'Ваш Email',
      emailPlaceholder: 'name@domain.com',
      discordLabel: 'Ваш Discord',
      discordPlaceholder: 'Напр. alexey_dev',
      tierLabel: 'Тип сайта',
      tiers: [
        'Портал сервера FiveM / RedM',
        'Корпоративный сайт / Портфолио',
        'Цифровой магазин и кабинет лицензий',
        'Индивидуальная веб-панель',
      ],
      scopeLabel: 'Домен или текущий сайт',
      scopePlaceholder: 'Напр. myserver.ru (нужна помощь с доменом)',
      addonsLabel: 'Дополнительные модули',
      addons: [
        'Мультиязычность (TR/EN/RU/FR)',
        'Личный кабинет и лицензии',
        'Интеграция с İtemsatış / оплатой',
        'Автоматическая отправка писем',
        'Панель администратора',
        'Фирменные анимации',
      ],
      budgetLabel: 'Бюджет',
      budgets: ['$80 – $150', '$150 – $350', '$350 – $750', '$750+ (Корпоративный)'],
      timelineLabel: 'Сроки',
      timelines: ['3–5 дней', '1–2 недели', '3–4 недели', 'Гибкий график'],
      detailsLabel: 'Детали проекта',
      detailsPlaceholder: 'Опишите страницы, функции и пожелания по дизайну...',
      submitBtn: 'Отправить заявку автоматически',
      submittingBtn: 'Отправка...',
      successTitle: 'Заявка отправлена',
      successDesc: 'Информация автоматически доставлена на info@restrictedstudio.shop.',
      successRefLabel: 'НОМЕР ЗАЯВКИ',
      resetBtn: 'Создать новую заявку',
      errorFallback: 'Ошибка при отправке заявки. Проверьте поля и повторите попытку.',
    },
    'discord-bot': {
      eyebrow: 'АВТОМАТИЗАЦИЯ DISCORD',
      title: 'Разработка Discord-ботов',
      subtitle:
        'Кастомные боты с интеграцией FiveM/RedM, системами тикетов/вайтлиста, защитой сервера и открытым кодом.',
      stat1Val: 'Авто',
      stat1Label: 'Мгновенная отправка',
      stat2Val: '24/7',
      stat2Label: 'Надёжная работа',
      sideEyebrow: 'АРХИТЕКТУРА БОТА',
      sideHeading: 'Стабильные боты под задачи сервера',
      sideBody:
        'Технические требования автоматически пересылаются на почту команды сразу после отправки формы.',
      sideStepsTitle: 'ЧТО ВХОДИТ',
      sideSteps: [
        'Slash-команды, кнопки, меню и модальные окна',
        'Синхронизация с MariaDB FiveM/RedM и txAdmin',
        'Анти-рейд, защита ролей и расширенные логи',
        'Передача исходного кода или 24/7 хостинг',
      ],
      switchLabel: 'ДРУГАЯ УСЛУГА',
      switchHref: '/hizmetler/web-kurulum',
      switchTitle: 'Услуга создания веб-сайта →',
      formTitle: 'Заявка на Discord-бота',
      formSubtitle: 'Данные автоматически отправляются на info@restrictedstudio.shop.',
      nameLabel: 'Имя / Название сервера',
      namePlaceholder: 'Напр. Дмитрий / Horizon RP',
      emailLabel: 'Ваш Email',
      emailPlaceholder: 'name@domain.com',
      discordLabel: 'Ваш Discord',
      discordPlaceholder: 'Напр. dmitry#0001',
      tierLabel: 'Тип бота',
      tiers: [
        'Бот вайтлиста и заявок FiveM / RedM',
        'Тикет-система и поддержка',
        'Модерация, защита и логи',
        'Экономика, магазин и розыгрыши',
        'Комплексный бот всё-в-одном',
      ],
      scopeLabel: 'Хостинг / Размер сервера',
      scopePlaceholder: 'Напр. Хостинг 24/7 · ~1 500 участников',
      addonsLabel: 'Необходимые модули',
      addons: [
        'Мост с FiveM SQL / txAdmin',
        'Временные голосовые каналы и авто-роли',
        'Уведомления о заказах / Webhook',
        'Веб-панель управления',
        'Верификация и система предупреждений',
        'Полный открытый исходный код',
      ],
      budgetLabel: 'Бюджет',
      budgets: ['$35 – $75', '$75 – $180', '$180 – $450', '$450+ (Полный комплекс)'],
      timelineLabel: 'Сроки',
      timelines: ['2–3 дня', '1 неделя', '2–3 недели', 'Гибкий график'],
      detailsLabel: 'Требования к командам и логике',
      detailsPlaceholder: 'Укажите нужные команды, логи, роли и интеграции...',
      submitBtn: 'Отправить заявку автоматически',
      submittingBtn: 'Отправка...',
      successTitle: 'Заявка на бота отправлена',
      successDesc: 'Параметры автоматически доставлены на info@restrictedstudio.shop.',
      successRefLabel: 'НОМЕР ЗАЯВКИ',
      resetBtn: 'Отправить ещё заявку',
      errorFallback: 'Не удалось отправить заявку. Проверьте корректность данных.',
    },
  },
  fr: {
    'web-kurulum': {
      eyebrow: 'ARCHITECTURE WEB SUR MESURE',
      title: 'Création de Site Web',
      subtitle:
        'Sites Next.js rapides, portails clients et boutiques numériques conçus pour votre serveur FiveM/RedM ou votre entreprise.',
      stat1Val: 'Auto',
      stat1Label: 'Envoi E-mail Direct',
      stat2Val: '3–14 Jours',
      stat2Label: 'Délai Moyen',
      sideEyebrow: 'LIVRAISON CLÉ EN MAIN',
      sideHeading: 'Conception complète jusqu’à la mise en ligne',
      sideBody:
        'Votre cahier des charges est transmis automatiquement par e-mail à notre équipe technique dès validation.',
      sideStepsTitle: 'INCLUS PAR DÉFAUT',
      sideSteps: [
        'Design responsive optimisé bureau et mobile',
        'Certificat SSL, en-têtes stricts & Cloudflare',
        'Multilingue, SEO structuré et performances optimales',
        'En option : espace client, base Supabase et administration',
      ],
      switchLabel: 'AUTRE SERVICE',
      switchHref: '/hizmetler/discord-bot',
      switchTitle: 'Services Bot Discord →',
      formTitle: 'Brief Projet Web',
      formSubtitle: 'Transmis automatiquement à info@restrictedstudio.shop.',
      nameLabel: 'Nom / Organisation',
      namePlaceholder: 'Ex. Camille Laurent',
      emailLabel: 'Votre E-mail',
      emailPlaceholder: 'nom@domaine.com',
      discordLabel: 'Identifiant Discord',
      discordPlaceholder: 'Ex. camille.dev',
      tierLabel: 'Type de site souhaité',
      tiers: [
        'Portail Communautaire FiveM / RedM',
        'Site Vitrine / Entreprise',
        'Boutique Numérique & Espace Licences',
        'Tableau de bord / Application Web',
      ],
      scopeLabel: 'Nom de domaine ou site existant',
      scopePlaceholder: 'Ex. monprojet.fr (domaine à prévoir)',
      addonsLabel: 'Fonctionnalités souhaitées',
      addons: [
        'Multilingue (TR/EN/RU/FR)',
        'Portail Client & Licences',
        'Paiement / Lien İtemsatış',
        'E-mails Transactionnels Automatiques',
        'Panneau d’Administration',
        'Animations Sur Mesure',
      ],
      budgetLabel: 'Budget estimé',
      budgets: ['80€ – 150€', '150€ – 350€', '350€ – 750€', '750€+ (Entreprise)'],
      timelineLabel: 'Délai souhaité',
      timelines: ['3–5 Jours', '1–2 Semaines', '3–4 Semaines', 'Flexible'],
      detailsLabel: 'Détails du projet',
      detailsPlaceholder: 'Précisez les pages, fonctionnalités et références souhaitées...',
      submitBtn: 'Envoyer la demande automatiquement',
      submittingBtn: 'Envoi...',
      successTitle: 'Demande transmise avec succès',
      successDesc: 'Vos informations ont été envoyées automatiquement à info@restrictedstudio.shop.',
      successRefLabel: 'RÉFÉRENCE',
      resetBtn: 'Nouvelle demande',
      errorFallback: 'Échec de l’envoi. Veuillez vérifier les champs et réessayer.',
    },
    'discord-bot': {
      eyebrow: 'AUTOMATISATION DISCORD',
      title: 'Services Bot Discord',
      subtitle:
        'Bots Discord sur mesure avec liaison base de données FiveM/RedM, tickets/whitelist, sécurité anti-raid et code source.',
      stat1Val: 'Auto',
      stat1Label: 'Envoi E-mail Direct',
      stat2Val: '24/7',
      stat2Label: 'Haute Disponibilité',
      sideEyebrow: 'ARCHITECTURE BOT',
      sideHeading: 'Des systèmes Discord fiables et rapides',
      sideBody:
        'Votre demande technique est automatiquement envoyée par e-mail à notre équipe.',
      sideStepsTitle: 'STANDARDS TECHNIQUES',
      sideSteps: [
        'Commandes Slash modernes, boutons et modales',
        'Passerelle MariaDB FiveM/RedM & txAdmin',
        'Protection anti-raid, gestion des rôles et logs complets',
        'Livraison code open-source ou hébergement 24/7 inclus',
      ],
      switchLabel: 'AUTRE SERVICE',
      switchHref: '/hizmetler/web-kurulum',
      switchTitle: 'Création de Site Web →',
      formTitle: 'Demande Bot Discord',
      formSubtitle: 'Transmis automatiquement à info@restrictedstudio.shop.',
      nameLabel: 'Nom / Nom du serveur',
      namePlaceholder: 'Ex. Lucas / Horizon RP',
      emailLabel: 'Votre E-mail',
      emailPlaceholder: 'nom@domaine.com',
      discordLabel: 'Identifiant Discord',
      discordPlaceholder: 'Ex. lucas.rp',
      tierLabel: 'Catégorie de bot',
      tiers: [
        'Bot Whitelist & Candidatures FiveM / RedM',
        'Système de Tickets & Support Avancé',
        'Modération, Sécurité Guard & Logs',
        'Économie, Boutique & Concours',
        'Bot Complet Sur Mesure',
      ],
      scopeLabel: 'Hébergement / Taille du serveur',
      scopePlaceholder: 'Ex. Hébergement 24/7 · ~1 500 membres',
      addonsLabel: 'Modules souhaités',
      addons: [
        'Pont FiveM SQL & txAdmin',
        'Salons vocaux temporaires & rôles auto',
        'Alertes commandes / Webhooks',
        'Interface Web de contrôle',
        'Vérification & sanctions',
        'Code source complet livré',
      ],
      budgetLabel: 'Budget estimé',
      budgets: ['35€ – 75€', '75€ – 180€', '180€ – 450€', '450€+ (Suite complète)'],
      timelineLabel: 'Délai souhaité',
      timelines: ['2–3 Jours', '1 Semaine', '2–3 Semaines', 'Flexible'],
      detailsLabel: 'Commandes et flux souhaités',
      detailsPlaceholder: 'Décrivez les commandes, rôles, logs et automatisations attendues...',
      submitBtn: 'Envoyer la demande automatiquement',
      submittingBtn: 'Envoi...',
      successTitle: 'Demande Bot transmise',
      successDesc: 'Votre cahier des charges a été envoyé automatiquement à info@restrictedstudio.shop.',
      successRefLabel: 'RÉFÉRENCE',
      resetBtn: 'Nouvelle demande',
      errorFallback: 'Impossible d’envoyer la demande. Vérifiez les informations saisies.',
    },
  },
};

export default function ServiceRequestPageClient({ serviceType }: { serviceType: ServiceKind }) {
  const { locale } = useI18n();
  const copy = (SERVICE_COPY[locale] || SERVICE_COPY.tr)[serviceType];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [discordHandle, setDiscordHandle] = useState('');
  const [packageTier, setPackageTier] = useState(copy.tiers[0]);
  const [projectScope, setProjectScope] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [budget, setBudget] = useState(copy.budgets[1] || copy.budgets[0]);
  const [timeline, setTimeline] = useState(copy.timelines[1] || copy.timelines[0]);
  const [details, setDetails] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  useEffect(() => {
    setPackageTier(copy.tiers[0]);
    setBudget(copy.budgets[1] || copy.budgets[0]);
    setTimeline(copy.timelines[1] || copy.timelines[0]);
    setSelectedFeatures([]);
  }, [locale, serviceType]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((item) => item !== feat) : [...prev, feat].slice(0, 12)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          fullName,
          email,
          discordHandle,
          packageTier,
          projectScope,
          selectedFeatures,
          budget,
          timeline,
          details,
          locale,
          website_url: websiteUrl,
          turnstileToken,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        requestId?: string;
        message?: string;
      };

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || copy.errorFallback);
        setTurnstileResetSignal((n) => n + 1);
      } else {
        setSubmittedRefId(json.requestId || 'RS-OK');
      }
    } catch {
      setErrorMsg(copy.errorFallback);
      setTurnstileResetSignal((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRefId(null);
    setErrorMsg(null);
    setFullName('');
    setEmail('');
    setDiscordHandle('');
    setProjectScope('');
    setSelectedFeatures([]);
    setDetails('');
    setTurnstileResetSignal((n) => n + 1);
  };

  return (
    <div className="st-page-shell">
      <SiteNavbar activePath={serviceType === 'web-kurulum' ? '/hizmetler/web-kurulum' : '/hizmetler/discord-bot'} />

      <main className="st-main">
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{copy.eyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{copy.title}</h1>
              <p className="st-subhero-desc">{copy.subtitle}</p>
            </div>

            <div className="st-subhero-stats">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">{copy.stat1Val}</span>
                <span className="st-stat-chip-lbl">{copy.stat1Label}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val" style={{ color: 'var(--accent-coral)' }}>
                  {copy.stat2Val}
                </span>
                <span className="st-stat-chip-lbl">{copy.stat2Label}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="st-container st-contact-grid">
          <aside className="st-contact-light-card">
            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#c83918',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.sideEyebrow}
              </span>
              <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#111113', lineHeight: 1.25 }}>
                {copy.sideHeading}
              </h2>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-dark-muted)' }}>{copy.sideBody}</p>
            </div>

            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#c83918',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.sideStepsTitle}
              </span>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {copy.sideSteps.map((step) => (
                  <li
                    key={step}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#111113',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ef5b38',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="st-contact-channel">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#c83918',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.switchLabel}
              </span>
              <Link
                href={copy.switchHref}
                className="st-pill-btn is-dark is-sm"
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                {copy.switchTitle}
              </Link>
            </div>
          </aside>

          <div className="st-contact-form-card spotlight-surface">
            <h2 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em' }}>{copy.formTitle}</h2>
            <p style={{ marginTop: '6px', marginBottom: '22px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {copy.formSubtitle}
            </p>

            {submittedRefId ? (
              <div className="st-service-success-card">
                <span className="st-service-success-badge">RESEND · OK</span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>{copy.successTitle}</h3>
                <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                  {copy.successDesc}
                </p>
                <div className="st-service-ref-box">
                  <span>{copy.successRefLabel}</span>
                  <strong>{submittedRefId}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <button type="button" onClick={handleReset} className="st-pill-btn is-light">
                    {copy.resetBtn}
                  </button>
                  <Link href="/" className="st-pill-btn is-outline">
                    ←
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                />

                {errorMsg && (
                  <div className="rs-auth-alert is-error" style={{ marginBottom: '16px' }}>
                    {errorMsg}
                  </div>
                )}

                <div className="st-service-two-col">
                  <div className="st-field-group">
                    <label htmlFor="svc-name" className="st-field-label">
                      {copy.nameLabel}
                    </label>
                    <input
                      id="svc-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={copy.namePlaceholder}
                      className="st-input"
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="st-field-group">
                    <label htmlFor="svc-email" className="st-field-label">
                      {copy.emailLabel}
                    </label>
                    <input
                      id="svc-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="st-input"
                      maxLength={120}
                      required
                    />
                  </div>
                </div>

                <div className="st-service-two-col">
                  <div className="st-field-group">
                    <label htmlFor="svc-discord" className="st-field-label">
                      {copy.discordLabel}
                    </label>
                    <input
                      id="svc-discord"
                      type="text"
                      value={discordHandle}
                      onChange={(e) => setDiscordHandle(e.target.value)}
                      placeholder={copy.discordPlaceholder}
                      className="st-input"
                      maxLength={80}
                    />
                  </div>

                  <div className="st-field-group">
                    <label htmlFor="svc-scope" className="st-field-label">
                      {copy.scopeLabel}
                    </label>
                    <input
                      id="svc-scope"
                      type="text"
                      value={projectScope}
                      onChange={(e) => setProjectScope(e.target.value)}
                      placeholder={copy.scopePlaceholder}
                      className="st-input"
                      maxLength={140}
                    />
                  </div>
                </div>

                <div className="st-field-group">
                  <label htmlFor="svc-tier" className="st-field-label">
                    {copy.tierLabel}
                  </label>
                  <select
                    id="svc-tier"
                    value={packageTier}
                    onChange={(e) => setPackageTier(e.target.value)}
                    className="st-select"
                  >
                    {copy.tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="st-field-group">
                  <span className="st-field-label">{copy.addonsLabel}</span>
                  <div className="st-service-addons">
                    {copy.addons.map((addon) => {
                      const active = selectedFeatures.includes(addon);
                      return (
                        <button
                          key={addon}
                          type="button"
                          onClick={() => toggleFeature(addon)}
                          className={`st-service-addon-pill ${active ? 'is-active' : ''}`}
                          aria-pressed={active}
                        >
                          <span aria-hidden="true">{active ? '✓' : '+'}</span>
                          <span>{addon}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="st-service-two-col">
                  <div className="st-field-group">
                    <label htmlFor="svc-budget" className="st-field-label">
                      {copy.budgetLabel}
                    </label>
                    <select
                      id="svc-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="st-select"
                    >
                      {copy.budgets.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="st-field-group">
                    <label htmlFor="svc-timeline" className="st-field-label">
                      {copy.timelineLabel}
                    </label>
                    <select
                      id="svc-timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="st-select"
                    >
                      {copy.timelines.map((tl) => (
                        <option key={tl} value={tl}>
                          {tl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="st-field-group">
                  <label htmlFor="svc-details" className="st-field-label">
                    {copy.detailsLabel}
                  </label>
                  <textarea
                    id="svc-details"
                    rows={5}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={copy.detailsPlaceholder}
                    className="st-textarea"
                    minLength={10}
                    maxLength={2500}
                    required
                  />
                </div>

                <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileResetSignal} />

                <button type="submit" disabled={submitting} className="st-pill-btn is-light is-full">
                  {submitting ? copy.submittingBtn : `${copy.submitBtn} →`}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
