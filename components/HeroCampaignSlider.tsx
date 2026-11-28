'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const GTAVI_RENTAL_URL =
  'https://www.itemsatis.com/gta-6/gta-vi-ultimate-edition-playstation-48-saat-6103139.html';

const AUTO_ADVANCE_MS = 6500;

interface SliderLocaleCopy {
  ariaLabel: string;
  prevAria: string;
  nextAria: string;
  slide1: {
    tabLabel: string;
    badgePrimary: string;
    badgeSecondary: string;
    title: string;
    subtitle: string;
    priceValue: string;
    priceNoteTop: string;
    priceNoteBottom: string;
    primaryCta: string;
    secondaryCta: string;
  };
  slide2: {
    tabLabel: string;
    badgePrimary: string;
    badgeSecondary: string;
    title: string;
    subtitle: string;
    unitLabel: string;
    unitPrice: string;
    bulkLabel: string;
    bulkPrice: string;
    bulkBadge: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

const SLIDER_COPY: Record<Locale, SliderLocaleCopy> = {
  tr: {
    ariaLabel: 'Öne çıkan kampanyalar',
    prevAria: 'Önceki slayt',
    nextAria: 'Sonraki slayt',
    slide1: {
      tabLabel: 'GTA VI · 499 TL',
      badgePrimary: 'GTA VI · PLAYSTATION 5',
      badgeSecondary: '48 SAAT KİRALAMA',
      title: 'GTA VI Ultimate Edition',
      subtitle: 'PlayStation 48 Saat Dijital Erişim · Orijinal Lisanslı Hesap',
      priceValue: '499 TL',
      priceNoteTop: '48 Saat Teknik Erişim Garantisi',
      priceNoteBottom: 'İtemsatış #6103139 · Çevrimdışı Kullanım',
      primaryCta: 'Detayları İncele',
      secondaryCta: 'Satın Al',
    },
    slide2: {
      tabLabel: 'FiveM 6.400+ · 100₺ / 50₺',
      badgePrimary: 'FİVEM 6.400+ KAMPANYA',
      badgeSecondary: '%0 ESCROW · AÇIK KAYNAK',
      title: 'FiveM 6.400+ Kampanya!',
      subtitle: 'Script, MLO, Araç Paketleri ve EUP arşivinde şeffaf sabit fiyat',
      unitLabel: 'ADET FİYATI',
      unitPrice: '100 TL',
      bulkLabel: 'TOPLU ALIMDA (15+)',
      bulkPrice: '50 TL',
      bulkBadge: '%50 İNDİRİM',
      primaryCta: 'Kataloğu Keşfet',
      secondaryCta: 'Öne Çıkanlar',
    },
  },
  en: {
    ariaLabel: 'Featured campaigns',
    prevAria: 'Previous slide',
    nextAria: 'Next slide',
    slide1: {
      tabLabel: 'GTA VI · 499 TL',
      badgePrimary: 'GTA VI · PLAYSTATION 5',
      badgeSecondary: '48-HOUR RENTAL',
      title: 'GTA VI Ultimate Edition',
      subtitle: 'PlayStation 48-Hour Digital Access · Official Licensed Account',
      priceValue: '499 TL',
      priceNoteTop: '48-Hour Technical Access Guarantee',
      priceNoteBottom: 'İtemsatış #6103139 · Offline Play',
      primaryCta: 'View Details',
      secondaryCta: 'Buy Now',
    },
    slide2: {
      tabLabel: 'FiveM 6,400+ · 100₺ / 50₺',
      badgePrimary: 'FIVEM 6,400+ CAMPAIGN',
      badgeSecondary: '0% ESCROW · OPEN SOURCE',
      title: 'FiveM 6,400+ Campaign!',
      subtitle: 'Flat pricing across Scripts, MLOs, Vehicle Fleets & EUP packs',
      unitLabel: 'SINGLE ITEM',
      unitPrice: '100 TL',
      bulkLabel: 'BULK ORDER (15+)',
      bulkPrice: '50 TL',
      bulkBadge: '50% OFF',
      primaryCta: 'Explore Catalog',
      secondaryCta: 'Featured Picks',
    },
  },
  ru: {
    ariaLabel: 'Избранные акции',
    prevAria: 'Предыдущий слайд',
    nextAria: 'Следующий слайд',
    slide1: {
      tabLabel: 'GTA VI · 499 TL',
      badgePrimary: 'GTA VI · PLAYSTATION 5',
      badgeSecondary: 'АРЕНДА 48 ЧАСОВ',
      title: 'GTA VI Ultimate Edition',
      subtitle: 'Цифровой доступ PlayStation на 48 часов · Лицензионный аккаунт',
      priceValue: '499 TL',
      priceNoteTop: 'Гарантия доступа 48 часов',
      priceNoteBottom: 'İtemsatış #6103139 · Офлайн режим',
      primaryCta: 'Подробнее',
      secondaryCta: 'Купить',
    },
    slide2: {
      tabLabel: 'FiveM 6 400+ · 100₺ / 50₺',
      badgePrimary: 'АКЦИЯ FIVEM 6 400+',
      badgeSecondary: 'БЕЗ ESCROW · OPEN SOURCE',
      title: 'FiveM 6 400+ Акция!',
      subtitle: 'Скрипты, MLO, автопарки и EUP по единой фиксированной цене',
      unitLabel: 'ЗА ШТУКУ',
      unitPrice: '100 TL',
      bulkLabel: 'ОПТОМ (ОТ 15 ШТ.)',
      bulkPrice: '50 TL',
      bulkBadge: '-50%',
      primaryCta: 'Открыть каталог',
      secondaryCta: 'Избранное',
    },
  },
  fr: {
    ariaLabel: 'Campagnes mises en avant',
    prevAria: 'Diapositive précédente',
    nextAria: 'Diapositive suivante',
    slide1: {
      tabLabel: 'GTA VI · 499 TL',
      badgePrimary: 'GTA VI · PLAYSTATION 5',
      badgeSecondary: 'LOCATION 48H',
      title: 'GTA VI Ultimate Edition',
      subtitle: 'Accès numérique PlayStation 48h · Compte officiel sous licence',
      priceValue: '499 TL',
      priceNoteTop: 'Garantie d’accès technique 48h',
      priceNoteBottom: 'İtemsatış #6103139 · Mode hors-ligne',
      primaryCta: 'Voir les détails',
      secondaryCta: 'Acheter',
    },
    slide2: {
      tabLabel: 'FiveM 6 400+ · 100₺ / 50₺',
      badgePrimary: 'CAMPAGNE FIVEM 6 400+',
      badgeSecondary: '0% ESCROW · OPEN SOURCE',
      title: 'FiveM 6 400+ Campagne !',
      subtitle: 'Tarif fixe transparent sur les Scripts, MLO, Véhicules et EUP',
      unitLabel: 'À L’UNITÉ',
      unitPrice: '100 TL',
      bulkLabel: 'EN LOT (15+)',
      bulkPrice: '50 TL',
      bulkBadge: '-50%',
      primaryCta: 'Explorer le catalogue',
      secondaryCta: 'En vedette',
    },
  },
};

export default function HeroCampaignSlider() {
  const { locale } = useI18n();
  const copy = SLIDER_COPY[locale] || SLIDER_COPY.tr;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const slideCount = 2;

  const goTo = useCallback((idx: number) => {
    setActiveIndex(((idx % slideCount) + slideCount) % slideCount);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, []);

  useEffect(() => {
    if (paused || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveIndex((prev) => (prev + 1) % slideCount);
      }
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [paused, activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  return (
    <div
      className="st-campaign-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`st-campaign-viewport ${activeIndex === 0 ? 'is-vice-active' : 'is-ember-active'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="st-campaign-track"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {/* SLIDE 1: GTA VI — 499 TL (Full GTA VI Vice Palette + Official Rockstar Photo) */}
          <article
            className="st-campaign-slide is-gtavi-slide"
            aria-hidden={activeIndex !== 0}
          >
            <div className="st-campaign-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/gtavi-rockstar-banner.jpg"
                alt="GTA VI Ultimate Edition PlayStation 48 Saat — 499 TL"
                className="st-campaign-img is-gtavi-img"
                loading="eager"
                decoding="async"
              />
              <div className="st-campaign-scrim is-vice-scrim" aria-hidden="true" />
              <div className="st-campaign-corner-vi" aria-hidden="true">
                VI
              </div>
            </div>

            <div className="st-campaign-content">
              <div className="st-campaign-badges">
                <span className="st-campaign-badge is-vice">{copy.slide1.badgePrimary}</span>
                <span className="st-campaign-badge is-vice-ghost">{copy.slide1.badgeSecondary}</span>
              </div>

              <h2 className="st-campaign-title is-vice-title">{copy.slide1.title}</h2>
              <p className="st-campaign-sub">{copy.slide1.subtitle}</p>

              <div className="st-campaign-gtavi-price-box">
                <span className="st-campaign-gtavi-price">{copy.slide1.priceValue}</span>
                <span className="st-campaign-price-sep" aria-hidden="true" />
                <div className="st-campaign-price-meta">
                  <strong>{copy.slide1.priceNoteTop}</strong>
                  <span>{copy.slide1.priceNoteBottom}</span>
                </div>
              </div>

              <div className="st-campaign-actions">
                <Link
                  href="/GTAVI"
                  tabIndex={activeIndex === 0 ? 0 : -1}
                  className="st-campaign-btn is-vice-primary"
                >
                  <span>{copy.slide1.primaryCta}</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={GTAVI_RENTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={activeIndex === 0 ? 0 : -1}
                  className="st-campaign-btn is-vice-secondary"
                >
                  <span>{copy.slide1.secondaryCta}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>

          {/* SLIDE 2: FiveM 6.400+ Kampanya! Adet 100 TL · Toplu Alımda 50 TL (Obsidian & Orange Palette) */}
          <article
            className="st-campaign-slide is-fivem-slide"
            aria-hidden={activeIndex !== 1}
          >
            <div className="st-campaign-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/fivem-campaign-banner.jpg"
                alt="FiveM 6400+ Kampanya — Adet 100 TL, Toplu Alımda 50 TL"
                className="st-campaign-img is-fivem-img"
                loading="eager"
                decoding="async"
              />
              <div className="st-campaign-scrim is-ember-scrim" aria-hidden="true" />
            </div>

            <div className="st-campaign-content">
              <div className="st-campaign-badges">
                <span className="st-campaign-badge is-ember">{copy.slide2.badgePrimary}</span>
                <span className="st-campaign-badge is-ember-ghost">{copy.slide2.badgeSecondary}</span>
              </div>

              <h2 className="st-campaign-title is-ember-title">{copy.slide2.title}</h2>
              <p className="st-campaign-sub">{copy.slide2.subtitle}</p>

              <div className="st-campaign-pricing-tiers">
                <div className="st-campaign-tier">
                  <span className="st-campaign-tier-lbl">{copy.slide2.unitLabel}</span>
                  <strong className="st-campaign-tier-val">{copy.slide2.unitPrice}</strong>
                </div>

                <span className="st-campaign-tier-arrow" aria-hidden="true">
                  →
                </span>

                <div className="st-campaign-tier is-highlight">
                  <div className="st-campaign-tier-top">
                    <span className="st-campaign-tier-lbl">{copy.slide2.bulkLabel}</span>
                    <span className="st-campaign-tier-off">{copy.slide2.bulkBadge}</span>
                  </div>
                  <strong className="st-campaign-tier-val">{copy.slide2.bulkPrice}</strong>
                </div>
              </div>

              <div className="st-campaign-actions">
                <Link
                  href="/katalog"
                  tabIndex={activeIndex === 1 ? 0 : -1}
                  className="st-campaign-btn is-ember-primary"
                >
                  <span>{copy.slide2.primaryCta}</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/katalog?view=featured"
                  tabIndex={activeIndex === 1 ? 0 : -1}
                  className="st-campaign-btn is-ember-secondary"
                >
                  <span>{copy.slide2.secondaryCta}</span>
                </Link>
              </div>
            </div>
          </article>
        </div>

        {/* Left / Right Subtle Navigation Arrows */}
        <button
          type="button"
          onClick={goPrev}
          className="st-campaign-arrow is-prev"
          aria-label={copy.prevAria}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="st-campaign-arrow is-next"
          aria-label={copy.nextAria}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Bottom 2-Tab Progress Switcher */}
      <div className="st-campaign-tabs" role="tablist" aria-label={copy.ariaLabel}>
        <button
          type="button"
          role="tab"
          aria-selected={activeIndex === 0}
          onClick={() => goTo(0)}
          className={`st-campaign-tab is-vice-tab ${activeIndex === 0 ? 'is-active' : ''}`}
        >
          <span className="st-campaign-tab-num">01</span>
          <span className="st-campaign-tab-text">{copy.slide1.tabLabel}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeIndex === 1}
          onClick={() => goTo(1)}
          className={`st-campaign-tab is-ember-tab ${activeIndex === 1 ? 'is-active' : ''}`}
        >
          <span className="st-campaign-tab-num">02</span>
          <span className="st-campaign-tab-text">{copy.slide2.tabLabel}</span>
        </button>
      </div>
    </div>
  );
}
