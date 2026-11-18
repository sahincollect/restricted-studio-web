'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
import { useI18n } from '@/components/I18nProvider';
import { getLegalNavItems, type LegalDocSlug } from '@/lib/legal-docs';
import { COOKIE_INVENTORY, getLegalDocument } from '@/lib/legal-doc-content';
import type { Locale } from '@/lib/i18n';

const LEGAL_UI_COPY: Record<
  Locale,
  {
    navAriaLabel: string;
    cookieTableHeading: string;
    tableName: string;
    tableStorage: string;
    tablePurpose: string;
    tableDuration: string;
    tableType: string;
    contactTitle: string;
    contactDesc: string;
    contactCta: string;
  }
> = {
  tr: {
    navAriaLabel: 'Yasal Belgeler',
    cookieTableHeading: '3. Kullanılan Çerez ve Depolama Envanteri',
    tableName: 'Anahtar Adı',
    tableStorage: 'Tür',
    tablePurpose: 'Kullanım Amacı',
    tableDuration: 'Saklama Süresi',
    tableType: 'Kategori',
    contactTitle: 'Veri ve Hak Başvuruları',
    contactDesc:
      'KVKK kapsamındaki bilgi talepleriniz, veri silme istekleriniz veya telif/Uyar-Kaldır bildirimleriniz için doğrudan e-posta üzerinden ulaşabilirsiniz.',
    contactCta: 'İletişim Sayfası',
  },
  en: {
    navAriaLabel: 'Legal Documents',
    cookieTableHeading: '3. Cookie & Browser Storage Inventory',
    tableName: 'Key Name',
    tableStorage: 'Storage',
    tablePurpose: 'Purpose',
    tableDuration: 'Duration',
    tableType: 'Category',
    contactTitle: 'Privacy & Takedown Requests',
    contactDesc:
      'For data access, deletion requests, or Law No. 5846 / DMCA copyright notices, please reach us directly via email.',
    contactCta: 'Contact Page',
  },
  ru: {
    navAriaLabel: 'Правовые документы',
    cookieTableHeading: '3. Используемые Cookie и хранилище',
    tableName: 'Имя ключа',
    tableStorage: 'Хранилище',
    tablePurpose: 'Назначение',
    tableDuration: 'Срок',
    tableType: 'Категория',
    contactTitle: 'Запросы по данным и правам',
    contactDesc:
      'По вопросам удаления данных, KVKK или уведомлений DMCA обращайтесь напрямую по электронной почте.',
    contactCta: 'Контакты',
  },
  fr: {
    navAriaLabel: 'Documents légaux',
    cookieTableHeading: '3. Inventaire des Cookies et du Stockage Local',
    tableName: 'Identifiant',
    tableStorage: 'Stockage',
    tablePurpose: 'Finalité',
    tableDuration: 'Durée',
    tableType: 'Catégorie',
    contactTitle: 'Demandes Données & DMCA',
    contactDesc:
      'Pour toute demande d’accès, de suppression ou de retrait au titre des droits d’auteur, contactez-nous par e-mail.',
    contactCta: 'Page Contact',
  },
};

export default function LegalDocumentClient({ slug }: { slug: LegalDocSlug }) {
  const { locale } = useI18n();
  const doc = getLegalDocument(locale, slug);
  const navItems = getLegalNavItems(locale);
  const ui = LEGAL_UI_COPY[locale] || LEGAL_UI_COPY.tr;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${doc.title} | Restricted Studio`;
    }
  }, [doc.title]);

  return (
    <div className="st-page-shell">
      <SiteNavbar activePath={doc.href} />

      <main className="st-main">
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box" style={{ alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '780px' }}>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{doc.eyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{doc.title}</h1>
              <p className="st-subhero-desc">{doc.summary}</p>
              <div
                style={{
                  marginTop: '14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                }}
              >
                {doc.updatedAt} · Restricted Studio
              </div>
            </div>
          </div>
        </section>

        <section className="st-section" style={{ paddingTop: '8px' }}>
          <div className="st-container">
            <nav className="st-legal-tabs" aria-label={ui.navAriaLabel}>
              {navItems.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`st-filter-pill ${item.slug === slug ? 'is-active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="st-legal-layout">
              <div className="st-legal-doc-card">
                {doc.sections.map((section) => (
                  <article key={section.heading} className="st-legal-section">
                    <h2 className="st-legal-h2">{section.heading}</h2>
                    {section.paragraphs.map((p, idx) => (
                      <p key={idx} className="st-legal-p">
                        {p}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="st-legal-ul">
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}

                {slug === 'cerez' && (
                  <article className="st-legal-section">
                    <h2 className="st-legal-h2">{ui.cookieTableHeading}</h2>
                    <div className="st-compare-table-wrap" style={{ marginTop: '14px' }}>
                      <table className="st-table">
                        <thead>
                          <tr>
                            <th>{ui.tableName}</th>
                            <th>{ui.tableStorage}</th>
                            <th>{ui.tablePurpose}</th>
                            <th>{ui.tableDuration}</th>
                            <th>{ui.tableType}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {COOKIE_INVENTORY.map((row) => (
                            <tr key={row.name}>
                              <td style={{ fontFamily: 'var(--font-mono)', color: '#ffffff', fontWeight: 600 }}>
                                {row.name}
                              </td>
                              <td>{row.storage[locale] || row.storage.tr}</td>
                              <td>{row.purpose[locale] || row.purpose.tr}</td>
                              <td>{row.duration[locale] || row.duration.tr}</td>
                              <td style={{ color: 'var(--accent-coral)' }}>
                                {row.type[locale] || row.type.tr}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                )}
              </div>

              <aside className="st-sidebar-card" style={{ height: 'fit-content' }}>
                <span className="st-sidebar-title">{ui.contactTitle}</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {ui.contactDesc}
                </p>
                <a
                  href="mailto:info@restrictedstudio.shop"
                  className="st-pill-btn is-light is-sm is-full"
                >
                  info@restrictedstudio.shop
                </a>
                <Link href="/iletisim" className="st-pill-btn is-outline is-sm is-full">
                  {ui.contactCta}
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
