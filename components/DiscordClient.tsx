'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DiscordClient() {
  const { t } = useI18n();

  return (
    <div style={styles.container}>
      {/* Background Ambient Glow */}
      <div style={styles.glowTop} aria-hidden="true" />
      <div style={styles.glowBottom} aria-hidden="true" />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={styles.brandLink}>
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" style={styles.brandLogo} />
              <span className="brand-logo-shimmer" style={{ ...styles.brandText, color: undefined }}>
                Restricted Studio
              </span>
            </Link>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'rgba(240, 240, 240, 0.72)',
                borderLeft: '1px solid rgba(240, 240, 240, 0.2)',
                paddingLeft: '12px',
              }}
            >
              {t.common.itemsatisTrust}
            </span>
          </div>

          <nav style={styles.headerNav}>
            <LanguageSwitcher compact />
            <Link href="/" style={styles.navLink}>
              {t.common.home}
            </Link>
            <Link
              href="/katalog"
              className="nav-katalog-shimmer"
              style={{ ...styles.navLink, color: undefined, fontWeight: 700 }}
            >
              {t.common.catalog}
            </Link>
            <Link href="/dashboard" style={styles.navPortalBtn}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ marginRight: '6px' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {t.common.clientPortal}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.card}>
          {/* Status Badge */}
          <div style={styles.badgeWrapper}>
            <span style={styles.statusBadge}>
              <span style={styles.statusDot} />
              {t.discordPage.statusBadge}
            </span>
          </div>

          {/* Discord Icon with Glow Aura */}
          <div style={styles.iconContainer}>
            <div style={styles.iconAura} />
            <div style={styles.iconCircle}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="#F0F0F0">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
          </div>

          {/* Heading & Intro */}
          <h1 style={styles.title}>{t.discordPage.title}</h1>
          <p style={styles.description}>{t.discordPage.description}</p>

          {/* Feature Highlights Grid */}
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>{t.discordPage.features[0].title}</h3>
              <p style={styles.featureDesc}>{t.discordPage.features[0].desc}</p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0F0F0" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>{t.discordPage.features[1].title}</h3>
              <p style={styles.featureDesc}>{t.discordPage.features[1].desc}</p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>{t.discordPage.features[2].title}</h3>
              <p style={styles.featureDesc}>{t.discordPage.features[2].desc}</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={styles.actionsContainer}>
            <a
              href="https://www.itemsatis.com/p/saintstudio"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.primaryBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>{t.discordPage.primaryBtn}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7M17 7H8M17 7V16" />
              </svg>
            </a>

            <Link href="/katalog" style={styles.secondaryBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>{t.discordPage.secondaryBtn}</span>
            </Link>

            <Link href="/" style={styles.tertiaryBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{t.discordPage.tertiaryBtn}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>{t.discordPage.footerCopyright}</p>
        <p style={styles.footerSubtext}>{t.discordPage.footerSub}</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#080808',
    color: '#F0F0F0',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
    backgroundImage:
      'var(--grain-svg), radial-gradient(rgba(240, 240, 240, 0.065) 1px, transparent 1px), linear-gradient(155deg, #080808 0%, #080808 58%, #450000 84%, #8B0000 100%)',
    backgroundSize: '160px 160px, 5px 5px, 100% 100%',
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: '14%',
    width: '44vw',
    height: '85vh',
    clipPath: 'polygon(18% 0%, 44% 0%, 88% 100%, 42% 100%)',
    background:
      'linear-gradient(to top, rgba(240, 240, 240, 0.08) 0%, rgba(165, 0, 0, 0.16) 35%, rgba(8, 8, 8, 0.9) 85%)',
    pointerEvents: 'none',
  },
  glowBottom: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(8, 8, 8, 0.4) 1px, transparent 1px)',
    backgroundSize: '4px 4px',
    pointerEvents: 'none',
  },
  header: {
    width: '100%',
    borderBottom: '1.5px solid rgba(240, 240, 240, 0.3)',
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(8, 8, 8, 0.94)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#F0F0F0',
  },
  brandLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '0px',
    objectFit: 'cover',
    border: '1.5px solid #F0F0F0',
    filter: 'grayscale(100%) contrast(1.25)',
  },
  brandText: {
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.08em',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  navLink: {
    color: 'rgba(240, 240, 240, 0.72)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
  navPortalBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 700,
    padding: '7px 14px',
    borderRadius: '0px',
    border: '1.5px solid #F0F0F0',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '780px',
    backgroundColor: '#080808',
    border: '2px solid #F0F0F0',
    borderRadius: '0px',
    padding: '48px 36px',
    boxShadow: '8px 8px 0 #A50000',
    textAlign: 'center',
  },
  badgeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '0px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    color: '#F0F0F0',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '0px',
    backgroundColor: '#F0F0F0',
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  iconAura: {
    display: 'none',
  },
  iconCircle: {
    position: 'relative',
    width: '84px',
    height: '84px',
    borderRadius: '0px',
    backgroundColor: '#8B0000',
    border: '2px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '5px 5px 0 #080808',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#F0F0F0',
    letterSpacing: '-0.02em',
    marginBottom: '14px',
    lineHeight: 1.2,
  },
  description: {
    fontSize: '15px',
    color: 'rgba(240, 240, 240, 0.72)',
    lineHeight: 1.65,
    maxWidth: '620px',
    margin: '0 auto 36px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '36px',
    textAlign: 'left',
  },
  featureCard: {
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.28)',
    borderRadius: '0px',
    padding: '20px 18px',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '0px',
    backgroundColor: '#080808',
    border: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#F0F0F0',
    marginBottom: '6px',
  },
  featureDesc: {
    fontSize: '12px',
    color: 'rgba(240, 240, 240, 0.65)',
    lineHeight: 1.5,
  },
  actionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1.5px solid rgba(240, 240, 240, 0.2)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    border: '1.5px solid #F0F0F0',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 700,
    padding: '12px 22px',
    borderRadius: '0px',
    transition: 'all 0.15s ease',
    boxShadow: '4px 4px 0 #8B0000',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#F0F0F0',
    color: '#080808',
    border: '1.5px solid #F0F0F0',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 700,
    padding: '12px 22px',
    borderRadius: '0px',
    transition: 'all 0.15s ease',
    boxShadow: '4px 4px 0 #A50000',
  },
  tertiaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0e0e0e',
    color: '#F0F0F0',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 20px',
    borderRadius: '0px',
    border: '1.5px solid rgba(240, 240, 240, 0.42)',
    transition: 'all 0.15s ease',
  },
  footer: {
    padding: '32px 20px',
    textAlign: 'center',
    borderTop: '1.5px solid rgba(240, 240, 240, 0.2)',
    zIndex: 1,
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(240, 240, 240, 0.72)',
    marginBottom: '6px',
  },
  footerSubtext: {
    fontSize: '11px',
    color: 'rgba(240, 240, 240, 0.5)',
  },
};
