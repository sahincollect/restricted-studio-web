import test from 'node:test';
import assert from 'node:assert/strict';
import { ServiceRequestSchema, escapeHtml } from '../lib/validation.ts';

test('escapeHtml neutralizes angle brackets and quotes safely', () => {
  const escaped = escapeHtml(`<script>alert("xss")</script> & 'test'`);
  assert.equal(escaped.includes('<'), false);
  assert.equal(escaped.includes('>'), false);
  assert.equal(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;');
});

test('ServiceRequestSchema accepts valid web-kurulum and discord-bot payloads', () => {
  const webRes = ServiceRequestSchema.safeParse({
    serviceType: 'web-kurulum',
    fullName: 'Ahmet Yilmaz',
    email: 'ahmet@example.com',
    discordHandle: 'ahmety',
    packageTier: 'FiveM / RedM Sunucu & Topluluk Portalı',
    budget: '5.000₺ – 12.000₺',
    timeline: '1–2 Hafta (Standart)',
    projectScope: 'ornek.shop',
    selectedFeatures: ['Çoklu Dil (TR / EN / RU / FR)', 'Otomatik E-posta Formları (Resend)'],
    details: 'Modern anasayfa, basvuru formu ve lisans vitrini istiyorum.',
    locale: 'tr',
  });
  assert.equal(webRes.success, true);

  const botRes = ServiceRequestSchema.safeParse({
    serviceType: 'discord-bot',
    fullName: 'Emir Kaya',
    email: 'emir@horizonrp.com',
    packageTier: 'FiveM / RedM Whitelist & Oyuncu Yönetim Botu',
    budget: '2.500₺ – 6.000₺',
    timeline: '1 Hafta (Standart)',
    details: 'txAdmin ve MariaDB baglantili whitelist ve ticket otomasyonu talep ediyorum.',
  });
  assert.equal(botRes.success, true);
});

test('ServiceRequestSchema rejects invalid emails, short details, and populated honeypot', () => {
  const badEmail = ServiceRequestSchema.safeParse({
    serviceType: 'web-kurulum',
    fullName: 'Test User',
    email: 'not-an-email',
    packageTier: 'Kurumsal Site',
    budget: '2.500₺ – 5.000₺',
    timeline: '3–5 Gün',
    details: 'Bu aciklama on karakterden uzundur.',
  });
  assert.equal(badEmail.success, false);

  const botHoneypot = ServiceRequestSchema.safeParse({
    serviceType: 'discord-bot',
    fullName: 'Bot Trap',
    email: 'bot@example.com',
    packageTier: 'Guard Botu',
    budget: '1.000₺ – 2.500₺',
    timeline: '2–3 Gün',
    details: 'Bu aciklama on karakterden uzundur.',
    website_url: 'http://spam.example.com',
  });
  assert.equal(botHoneypot.success, false);
});
