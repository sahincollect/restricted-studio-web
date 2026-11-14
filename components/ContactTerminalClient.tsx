'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const CONTACT_EMAIL = 'info@restrictedstudio.shop';
const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

const SUBJECT_PRESETS = [
  'Katalog & Paket Danışmanlığı (100 TL Sabit Fiyat)',
  '15+ Toplu Alım (%50 İndirim) Talebi',
  'Teknik Destek & Kurulum Yardımı',
  'Kurumsal / Özel Proje İşbirliği',
];

export default function ContactTerminalClient() {
  const { t } = useI18n();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECT_PRESETS[0]);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

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
    const cleanSubject = subject.trim() || 'Restricted Studio İletişim Talebi';
    const bodyLines = [
      senderName.trim() ? `Gönderen: ${senderName.trim()}` : '',
      senderEmail.trim() ? `Yanıt Adresi: ${senderEmail.trim()}` : '',
      senderName.trim() || senderEmail.trim() ? '----------------------------------------' : '',
      message.trim() || 'Merhaba Restricted Studio ekibi,',
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
    <div style={styles.shell}>
      {/* Scanline & Vignette Retro Overlay */}
      <div style={styles.scanlines} aria-hidden="true" />
      <div style={styles.ambientGlow} aria-hidden="true" />

      {/* Top Retro-Noir Navigation Bar */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={styles.brandLink}>
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" style={styles.brandLogo} />
              <span className="brand-logo-shimmer" style={styles.brandText}>
                RESTRICTED STUDIO
              </span>
            </Link>
            <span style={styles.trustTag}>{t.common.itemsatisTrust}</span>
          </div>

          <nav style={styles.headerNav}>
            <LanguageSwitcher compact />
            <Link href="/" style={styles.navLink}>
              {t.common.home}
            </Link>
            <Link href="/katalog" className="nav-katalog-shimmer" style={styles.navLinkHighlight}>
              {t.common.catalog}
            </Link>
            <Link href="/status" style={styles.navLink}>
              SİSTEM DURUMU
            </Link>
            <Link href="/dashboard" style={styles.navPortalBtn}>
              {t.common.clientPortal} →
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Retro Mail Terminal */}
      <main style={styles.main}>
        <div style={styles.terminalWindow}>
          {/* Retro Terminal Title Bar */}
          <div style={styles.terminalBar}>
            <div style={styles.terminalDots}>
              <span style={{ ...styles.termDot, background: '#e01b24' }} />
              <span style={{ ...styles.termDot, background: '#e8a848' }} />
              <span style={{ ...styles.termDot, background: '#4da6e8' }} />
            </div>
            <div style={styles.terminalTitle}>
              RS-MAIL // TERMINAL v2.4 — [{CONTACT_EMAIL.toUpperCase()}]
            </div>
            <div style={styles.terminalStatus}>
              <span style={styles.onlineLed} />
              <span>HAT AKTİF</span>
            </div>
          </div>

          <div style={styles.terminalBody}>
            {/* Left Column: Direct Mail Address Card & Retro Telemetry */}
            <div style={styles.leftCol}>
              <div style={styles.eyebrowBadge}>
                <span style={styles.onlineLed} />
                <span>RESMİ E-POSTA & DESTEK MERKEZİ</span>
              </div>

              <h1 style={styles.heading}>İLETİŞİM TERMİNALİ</h1>
              <p style={styles.lead}>
                Paket içerikleri, 15+ toplu alım (%50 indirim) sepetleri, lisans teslimatı veya teknik
                destek talepleriniz için doğrudan resmi e-posta adresimize yazabilirsiniz.
              </p>

              {/* Direct Email Box with Copy & One-Click Mailto */}
              <div style={styles.emailHighlightBox}>
                <div style={styles.emailBoxLabel}>DOĞRUDAN E-POSTA ADRESİ</div>
                <div style={styles.emailAddressRow}>
                  <a href={`mailto:${CONTACT_EMAIL}`} style={styles.emailAddressLink}>
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div style={styles.emailActionRow}>
                  <button type="button" onClick={handleCopyEmail} style={styles.copyBtn}>
                    {copied ? '✓ ADRES KOPYALANDI' : '📋 ADRESİ KOPYALA'}
                  </button>
                  <a href={`mailto:${CONTACT_EMAIL}`} style={styles.directMailLink}>
                    ✉ DOĞRUDAN MAİL UYGULAMASINI AÇ →
                  </a>
                </div>
              </div>

              {/* Channel Specs */}
              <div style={styles.specsGrid}>
                <div style={styles.specCard}>
                  <div style={styles.specKey}>ORTALAMA YANIT SÜRESİ</div>
                  <div style={styles.specVal}>&lt; 2 Saat (7/24 Aktif Nöbet)</div>
                </div>
                <div style={styles.specCard}>
                  <div style={styles.specKey}>KURUMSAL MAĞAZA GÜVENCESİ</div>
                  <div style={styles.specVal}>
                    <a
                      href={ITEMSATIS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#f5ba5b', textDecoration: 'underline' }}
                    >
                      İtemsatış Resmi Mağaza ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Retro E-Mail Composer */}
            <form onSubmit={handleSubmit} style={styles.formCol}>
              <div style={styles.formHeader}>
                <span>YENİ MESAJ OLUŞTUR</span>
                <span style={{ color: '#ff6b75' }}>ALICI: {CONTACT_EMAIL}</span>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="contact-name" style={styles.label}>
                    İSİM / SUNUCU ADI
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Örn: Ahmet / Los Santos RP"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="contact-email" style={styles.label}>
                    YANIT E-POSTA ADRESİNİZ
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="contact-subject" style={styles.label}>
                  KONU SEÇİMİ VEYA BAŞLIK
                </label>
                <div style={styles.presetChips}>
                  {SUBJECT_PRESETS.map((preset) => {
                    const active = subject === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSubject(preset)}
                        style={{
                          ...styles.presetChip,
                          ...(active ? styles.presetChipActive : {}),
                        }}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="contact-message" style={styles.label}>
                  MESAJINIZ
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Talep ettiğiniz paketleri, sorunuzu veya proje detaylarını buraya yazın..."
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.formFooter}>
                <button type="submit" style={styles.submitBtn}>
                  <span>✉ MESAJI GÖNDER ({CONTACT_EMAIL})</span>
                  <span>→</span>
                </button>

                {dispatched && (
                  <p style={styles.dispatchNote}>
                    E-posta istemciniz açıldı. Eğer otomatik açılmadıysa doğrudan{' '}
                    <strong style={{ color: '#fff' }}>{CONTACT_EMAIL}</strong> adresine mail
                    gönderebilirsiniz.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    backgroundColor: '#07080d',
    color: '#eef1f8',
    fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    backgroundImage:
      'radial-gradient(circle at 18% 20%, rgba(224, 27, 36, 0.14) 0%, transparent 38%), radial-gradient(circle at 84% 78%, rgba(232, 168, 72, 0.1) 0%, transparent 36%)',
  },
  scanlines: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
    background:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
  },
  ambientGlow: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.85)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: 'rgba(9, 10, 15, 0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1.5px solid rgba(224, 27, 36, 0.45)',
  },
  headerInner: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  brandLogo: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.25)',
    objectFit: 'cover',
  },
  brandText: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.1em',
  },
  trustTag: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'rgba(240, 242, 248, 0.65)',
    borderLeft: '1px solid rgba(255,255,255,0.16)',
    paddingLeft: '12px',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  navLink: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11.5px',
    fontWeight: 700,
    color: 'rgba(240, 242, 248, 0.78)',
    textDecoration: 'none',
  },
  navLinkHighlight: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11.5px',
    fontWeight: 800,
    textDecoration: 'none',
  },
  navPortalBtn: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    fontWeight: 800,
    padding: '7px 14px',
    borderRadius: '6px',
    backgroundColor: '#9e111b',
    border: '1px solid rgba(255, 110, 120, 0.5)',
    color: '#ffffff',
    textDecoration: 'none',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 20px 56px',
    position: 'relative',
    zIndex: 5,
  },
  terminalWindow: {
    width: '100%',
    maxWidth: '1120px',
    backgroundColor: 'rgba(11, 13, 20, 0.95)',
    border: '2px solid #c92230',
    boxShadow: '0 0 0 2px #040508, 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 36px rgba(224, 27, 36, 0.22)',
  },
  terminalBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 16px',
    background: 'linear-gradient(90deg, #21070b 0%, #3d0b13 50%, #1c070b 100%)',
    borderBottom: '2px solid #c92230',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
  },
  terminalDots: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  termDot: {
    width: '9px',
    height: '9px',
    display: 'inline-block',
    border: '1px solid rgba(0,0,0,0.6)',
  },
  terminalTitle: {
    color: '#ffd6da',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  terminalStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#9ef0b8',
    fontSize: '10px',
  },
  onlineLed: {
    width: '7px',
    height: '7px',
    backgroundColor: '#38e578',
    boxShadow: '0 0 8px #38e578',
    display: 'inline-block',
  },
  terminalBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '28px',
    padding: '28px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  eyebrowBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    padding: '5px 10px',
    backgroundColor: 'rgba(224, 27, 36, 0.14)',
    border: '1px solid rgba(224, 27, 36, 0.5)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#ff858d',
  },
  heading: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: 900,
    letterSpacing: '-0.01em',
    color: '#ffffff',
    margin: 0,
  },
  lead: {
    fontSize: '14px',
    lineHeight: 1.65,
    color: 'rgba(228, 233, 245, 0.78)',
    margin: 0,
  },
  emailHighlightBox: {
    padding: '18px',
    backgroundColor: '#07090f',
    border: '2px solid #e8a848',
    boxShadow: 'inset 0 0 0 2px #171208, 0 10px 24px rgba(0,0,0,0.65)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emailBoxLabel: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: '#f5ba5b',
  },
  emailAddressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
  },
  emailAddressLink: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: 'clamp(16px, 2.1vw, 22px)',
    fontWeight: 900,
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '0.02em',
    wordBreak: 'break-all',
  },
  emailActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  copyBtn: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    fontWeight: 800,
    padding: '8px 12px',
    backgroundColor: '#241808',
    border: '1.5px solid #e8a848',
    color: '#ffd48a',
    cursor: 'pointer',
  },
  directMailLink: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    fontWeight: 800,
    padding: '8px 12px',
    backgroundColor: '#8c0c17',
    border: '1.5px solid #ff5460',
    color: '#ffffff',
    textDecoration: 'none',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    marginTop: 'auto',
  },
  specCard: {
    padding: '12px 14px',
    backgroundColor: 'rgba(17, 20, 30, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  specKey: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '9.5px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: 'rgba(220, 226, 240, 0.58)',
    marginBottom: '4px',
  },
  specVal: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '12px',
    fontWeight: 700,
    color: '#eef1f8',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '20px',
    backgroundColor: '#080a10',
    border: '1.5px solid rgba(255, 255, 255, 0.14)',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.06em',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: 'rgba(230, 235, 245, 0.78)',
  },
  presetChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '4px',
  },
  presetChip: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '10px',
    fontWeight: 700,
    padding: '5px 8px',
    backgroundColor: '#111521',
    border: '1px solid #2b344d',
    color: '#c7d2eb',
    cursor: 'pointer',
    textAlign: 'left',
  },
  presetChipActive: {
    backgroundColor: '#2b0910',
    borderColor: '#ff4754',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0d1018',
    border: '1.5px solid #2c354d',
    color: '#ffffff',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '12.5px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0d1018',
    border: '1.5px solid #2c354d',
    color: '#ffffff',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '12.5px',
    lineHeight: 1.55,
    resize: 'vertical',
    outline: 'none',
  },
  formFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '4px',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    backgroundColor: '#b81422',
    border: '2px solid #ff6b75',
    boxShadow: '0 6px 20px rgba(224, 27, 36, 0.4)',
    color: '#ffffff',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.06em',
    cursor: 'pointer',
  },
  dispatchNote: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '11px',
    color: '#9ef0b8',
    lineHeight: 1.5,
    margin: 0,
  },
};
