import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Discord Sunucumuz Yakında Sizlerle — Restricted Studio',
  description: 'Restricted Studio resmi Discord topluluk ve teknik destek altyapısı çok yakında yayında.',
};

export default function DiscordPage() {
  return (
    <div style={styles.container}>
      {/* Background Ambient Glow */}
      <div style={styles.glowTop} aria-hidden="true" />
      <div style={styles.glowBottom} aria-hidden="true" />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.brandLink}>
            <img src="/assets/Restricted.jpg" alt="Restricted Studio" style={styles.brandLogo} />
            <span style={styles.brandText}>Restricted Studio</span>
          </Link>

          <nav style={styles.headerNav}>
            <Link href="/" style={styles.navLink}>
              Ana Sayfa
            </Link>
            <Link href="/katalog" style={styles.navLink}>
              Katalog
            </Link>
            <Link href="/dashboard" style={styles.navPortalBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Müşteri Portalı
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
              YAPILANDIRMA AŞAMASINDA
            </span>
          </div>

          {/* Discord Icon with Glow Aura */}
          <div style={styles.iconContainer}>
            <div style={styles.iconAura} />
            <div style={styles.iconCircle}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
          </div>

          {/* Heading & Intro */}
          <h1 style={styles.title}>Discord Sunucumuz Yakında Sizlerle</h1>
          <p style={styles.description}>
            Topluluk ve teknik destek altyapımızı daha hızlı, güvenli ve kusursuz bir deneyim
            sunmak amacıyla yapılandırıyoruz. Çok yakında resmi Discord sunucumuz üzerinden
            kesintisiz destek ve paylaşımlarla hizmetinizde olacağız.
          </p>

          {/* Feature Highlights Grid */}
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Birebir Ticket Desteği</h3>
              <p style={styles.featureDesc}>
                FiveM mimarisi, script kurulumları ve R-AI çalışma istasyonu için doğrudan geliştirici ekibiyle iletişim.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Otomatik Rol &amp; Lisans</h3>
              <p style={styles.featureDesc}>
                İtemsatış veya portal üzerinden edindiğiniz lisanslar otomatik doğrulanarak özel müşteri rolleriniz atanacak.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Erken Erişim &amp; İndirimler</h3>
              <p style={styles.featureDesc}>
                Yayınlanacak yeni MLO mekanlar, güncellemeler ve topluluğa özel kampanya duyurularına ilk erişim hakkı.
              </p>
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
              <span>İtemsatış Mağazamıza Git</span>
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
              <span>Paket Kataloğunu İncele</span>
            </Link>

            <Link href="/" style={styles.tertiaryBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Telif Hakkı &copy; 2026 Restricted Studio. Tüm hakları saklıdır.
        </p>
        <p style={styles.footerSubtext}>
          Sorularınız ve satın alımlarınız için İtemsatış mağazamız üzerinden bize 7/24 ulaşabilirsiniz.
        </p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#08080b',
    color: '#ffffff',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
    backgroundImage:
      'radial-gradient(circle at 50% 15%, rgba(88, 101, 242, 0.12) 0%, transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 24px)',
  },
  glowTop: {
    position: 'absolute',
    top: '-150px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, rgba(88, 101, 242, 0.15) 50%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  glowBottom: {
    position: 'absolute',
    bottom: '-100px',
    right: '10%',
    width: '450px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(88, 101, 242, 0.08) 0%, transparent 70%)',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  header: {
    width: '100%',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(8, 8, 11, 0.8)',
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
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#ffffff',
  },
  brandLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  brandText: {
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#a1a1aa',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  navPortalBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(14, 15, 22, 0.88)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '48px 36px',
    boxShadow: '0 30px 100px rgba(0, 0, 0, 0.7), 0 0 50px rgba(88, 101, 242, 0.06)',
    backdropFilter: 'blur(30px)',
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
    borderRadius: '999px',
    backgroundColor: 'rgba(88, 101, 242, 0.12)',
    border: '1px solid rgba(88, 101, 242, 0.25)',
    color: '#8ea1e1',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#5865F2',
    boxShadow: '0 0 10px #5865F2',
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  iconAura: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(88, 101, 242, 0.22)',
    filter: 'blur(24px)',
  },
  iconCircle: {
    position: 'relative',
    width: '84px',
    height: '84px',
    borderRadius: '22px',
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
    border: '1px solid rgba(88, 101, 242, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.03em',
    marginBottom: '14px',
    lineHeight: 1.2,
  },
  description: {
    fontSize: '15px',
    color: '#94a3b8',
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
    backgroundColor: 'rgba(20, 22, 32, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px 18px',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '6px',
  },
  featureDesc: {
    fontSize: '12px',
    color: '#71717a',
    lineHeight: 1.5,
  },
  actionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 22px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 18px rgba(0, 113, 227, 0.35)',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 22px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 18px rgba(0, 113, 227, 0.3)',
  },
  tertiaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#d4d4d8',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.2s ease',
  },
  footer: {
    padding: '32px 20px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    zIndex: 1,
  },
  footerText: {
    fontSize: '12px',
    color: '#71717a',
    marginBottom: '6px',
  },
  footerSubtext: {
    fontSize: '11px',
    color: '#52525b',
  },
};
