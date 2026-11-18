import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SITE_URL, canonicalUrl } from '../lib/site-config.ts';

test('site-config resolves canonical www domain without trailing slash', () => {
  assert.equal(SITE_URL, 'https://www.restrictedstudio.shop');
  assert.equal(canonicalUrl('/'), 'https://www.restrictedstudio.shop/');
  assert.equal(canonicalUrl('/katalog'), 'https://www.restrictedstudio.shop/katalog');
  assert.equal(canonicalUrl('hakkimizda'), 'https://www.restrictedstudio.shop/hakkimizda');
});

test('sitemap.ts and robots.ts define complete canonical routes and sitemap reference', () => {
  const sitemapSrc = fs.readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  const robotsSrc = fs.readFileSync(new URL('../app/robots.ts', import.meta.url), 'utf8');

  for (const route of ['/', '/katalog', '/lisanslar', '/hizmetler/web-kurulum', '/hizmetler/discord-bot', '/hakkimizda', '/status', '/iletisim']) {
    assert.ok(sitemapSrc.includes(route), `sitemap.ts missing route: ${route}`);
  }
  assert.ok(sitemapSrc.includes('/yasal/'), 'sitemap.ts must include legal routes');
  assert.ok(robotsSrc.includes('/sitemap.xml'), 'robots.ts must expose sitemap.xml');
  assert.ok(robotsSrc.includes('/yasal/'), 'robots.ts must allow /yasal/ routes');
  assert.ok(robotsSrc.includes('/.well-known/security.txt'), 'robots.ts must allow security.txt');
  const secTxt = fs.readFileSync(new URL('../public/.well-known/security.txt', import.meta.url), 'utf8');
  assert.ok(secTxt.includes('mailto:info@restrictedstudio.shop'));
  const layoutSrc = fs.readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.ok(layoutSrc.includes('ICON_VERSION'), 'layout.tsx must version favicon/icon URLs for Search cache invalidation');
  const legalMetaSrc = fs.readFileSync(new URL('../lib/legal-docs.ts', import.meta.url), 'utf8');
  const legalContentSrc = fs.readFileSync(new URL('../lib/legal-doc-content.ts', import.meta.url), 'utf8');
  const combinedLegalSrc = `${legalMetaSrc}\n${legalContentSrc}`;
  assert.equal(/mersis|vergi dairesi\s*:/i.test(combinedLegalSrc), false, 'legal docs must not contain placeholder corporate imprint fields');
  assert.ok(legalContentSrc.includes('yerel geliştirme/test'), 'TR terms must state educational / local sandbox scope');
  assert.ok(legalContentSrc.includes('rücu etme'), 'TR terms must state user indemnification / recourse clause');
  assert.ok(legalContentSrc.includes('OLDUĞU GİBİ'), 'TR terms must include AS-IS liability disclaimer');
  assert.ok(legalContentSrc.includes('const EN_DOCS:'), 'legal-doc-content.ts must define full EN translations');
  assert.ok(legalContentSrc.includes('const RU_DOCS:'), 'legal-doc-content.ts must define full RU translations');
  assert.ok(legalContentSrc.includes('const FR_DOCS:'), 'legal-doc-content.ts must define full FR translations');
  assert.ok(legalContentSrc.includes('indemnify, defend, and hold Restricted Studio harmless'), 'EN terms must include indemnification clause');
  assert.ok(legalContentSrc.includes('право регрессного требования'), 'RU terms must include indemnification / recourse clause');
  assert.ok(legalContentSrc.includes('action récursoire'), 'FR terms must include indemnification / recourse clause');
  assert.equal(/\bleak(ed|s)?\b/i.test(combinedLegalSrc), false, 'legal docs must not contain self-incriminating terminology');
});
