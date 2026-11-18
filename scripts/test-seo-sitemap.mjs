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
  assert.ok(robotsSrc.includes('/sitemap.xml'), 'robots.ts must expose sitemap.xml');
  assert.ok(robotsSrc.includes('/.well-known/security.txt'), 'robots.ts must allow security.txt');
  const secTxt = fs.readFileSync(new URL('../public/.well-known/security.txt', import.meta.url), 'utf8');
  assert.ok(secTxt.includes('mailto:info@restrictedstudio.shop'));
  const layoutSrc = fs.readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.ok(layoutSrc.includes('ICON_VERSION'), 'layout.tsx must version favicon/icon URLs for Search cache invalidation');
});
