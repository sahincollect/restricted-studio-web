import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe, verifyTurnstileToken } from '@/lib/security-server';
import { ServiceRequestSchema, escapeHtml, sanitizePlainText } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';
import { notifyServiceRequestTelegram } from '@/lib/notifications';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_TO_EMAIL = 'info@restrictedstudio.shop';
const DEFAULT_FROM_EMAIL = 'Restricted Studio <noreply@restrictedstudio.shop>';

const SERVICE_TITLES: Record<'web-kurulum' | 'discord-bot', string> = {
  'web-kurulum': 'Web Sitesi Kurulum Hizmeti',
  'discord-bot': 'Discord Bot Hizmetleri',
};

function buildEmailHtml(params: {
  requestId: string;
  submittedAt: string;
  serviceTitle: string;
  fullName: string;
  email: string;
  discordHandle: string;
  packageTier: string;
  budget: string;
  timeline: string;
  projectScope: string;
  selectedFeatures: string[];
  details: string;
  locale: string;
  kvkkAccepted?: boolean;
}): string {
  const rows: Array<[string, string]> = [
    ['Başvuru Kodu', params.requestId],
    ['Tarih (UTC)', params.submittedAt],
    ['Hizmet Kategorisi', params.serviceTitle],
    ['Ad Soyad / Kurum', params.fullName],
    ['E-posta (Reply-To)', params.email],
    ['Discord / İletişim', params.discordHandle || '-'],
    ['Seçilen Paket / Tür', params.packageTier],
    ['Alan Adı / Sunucu / Hosting', params.projectScope || '-'],
    ['Tahmini Bütçe', params.budget],
    ['Hedef Teslim Süresi', params.timeline],
    ['Ek Modüller', params.selectedFeatures.length > 0 ? params.selectedFeatures.join(', ') : 'Standart kapsam'],
    ['Arayüz Dili', params.locale.toUpperCase()],
    ['KVKK & Gizlilik Onayı', params.kvkkAccepted ? 'Onaylandı' : 'Belirtilmedi'],
  ];

  const rowsHtml = rows
    .map(
      ([label, val]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #262328;color:#a1a1aa;font-size:13px;width:210px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #262328;color:#ffffff;font-size:13.5px;font-weight:600;vertical-align:top;">${escapeHtml(val)}</td>
        </tr>`
    )
    .join('');

  return `
  <div style="background:#0d0c0d;padding:28px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
    <div style="max-width:640px;margin:0 auto;background:#141316;border:1px solid #2a272c;border-radius:20px;overflow:hidden;">
      <div style="padding:22px 24px;background:linear-gradient(135deg,#1d1210 0%,#141316 100%);border-bottom:1px solid #2a272c;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ef5b38;">RESTRICTED STUDIO · OTOMATİK HİZMET TALEBİ</div>
        <h1 style="margin:8px 0 0;font-size:20px;font-weight:600;color:#ffffff;">${escapeHtml(params.serviceTitle)}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${rowsHtml}
      </table>
      <div style="padding:18px 24px;background:#0f0e11;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ef5b38;margin-bottom:8px;">PROJE DETAYLARI &amp; TALEPLER</div>
        <div style="white-space:pre-wrap;font-size:13.5px;line-height:1.6;color:#e4e4e7;">${escapeHtml(params.details)}</div>
      </div>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'service_request', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodySafe(request, 16384);
  if (!parsed.ok) return parsed.response;

  const validated = ServiceRequestSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        message: validated.error.issues[0]?.message || 'Form alanlarını lütfen eksiksiz ve geçerli doldurun.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const data = validated.data;
  const turnstile = await verifyTurnstileToken(data.turnstileToken, guard.ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { success: false, message: turnstile.message },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message: 'Otomatik e-posta servisi geçici olarak yapılandırılmamış. Lütfen daha sonra tekrar deneyin.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const requestId = `RS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = new Date().toISOString();
  const serviceTitle = SERVICE_TITLES[data.serviceType];
  const fullName = sanitizePlainText(data.fullName, 100);
  const email = sanitizePlainText(data.email, 120).toLowerCase();
  const discordHandle = sanitizePlainText(data.discordHandle, 80);
  const packageTier = sanitizePlainText(data.packageTier, 100);
  const budget = sanitizePlainText(data.budget, 80);
  const timeline = sanitizePlainText(data.timeline, 80);
  const projectScope = sanitizePlainText(data.projectScope, 140);
  const selectedFeatures = (data.selectedFeatures || []).map((f) => sanitizePlainText(f, 80)).filter(Boolean);
  const details = sanitizePlainText(data.details, 2500);

  const toEmail = process.env.SERVICE_NOTIFY_EMAIL?.trim() || DEFAULT_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;

  const textBody = [
    `Başvuru Kodu: ${requestId}`,
    `Tarih (UTC): ${submittedAt}`,
    `Hizmet: ${serviceTitle}`,
    `Ad Soyad / Kurum: ${fullName}`,
    `E-posta: ${email}`,
    `Discord / İletişim: ${discordHandle || '-'}`,
    `Paket / Tür: ${packageTier}`,
    `Alan Adı / Sunucu / Hosting: ${projectScope || '-'}`,
    `Bütçe: ${budget}`,
    `Hedef Süre: ${timeline}`,
    `Ek Modüller: ${selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Standart kapsam'}`,
    '',
    '--- Proje Detayları ---',
    details,
  ].join('\n');

  try {
    const resendRes = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Hizmet Talebi · ${requestId}] ${serviceTitle} — ${fullName}`,
        html: buildEmailHtml({
          requestId,
          submittedAt,
          serviceTitle,
          fullName,
          email,
          discordHandle,
          packageTier,
          budget,
          timeline,
          projectScope,
          selectedFeatures,
          details,
          locale: data.locale,
          kvkkAccepted: data.kvkkAccepted,
        }),
        text: textBody,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => '');
      console.error('Resend API error:', resendRes.status, errText.slice(0, 300));
      return NextResponse.json(
        {
          success: false,
          message: 'Talebiniz şu anda otomatik e-posta sunucusuna iletilemedi. Lütfen tekrar deneyin veya İletişim sayfasından bize ulaşın.',
        },
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const resendPayload = (await resendRes.json().catch(() => ({}))) as { id?: string };

    await writeAuditLog({
      request,
      actorId: email.slice(0, 64),
      actorType: 'customer',
      action: 'SERVICE_REQUEST_DISPATCHED',
      resourceType: data.serviceType,
      resourceId: requestId,
      metadata: {
        packageTier,
        budget,
        resendId: resendPayload.id || null,
      },
    });

    await notifyServiceRequestTelegram({
      requestId,
      serviceTitle,
      fullName,
      email,
      discordHandle,
      packageTier,
      budget,
    });

    return NextResponse.json(
      {
        success: true,
        requestId,
        message: 'Talebiniz otomatik olarak ekibimize e-posta ile iletildi.',
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Service request dispatch failed:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json(
      {
        success: false,
        message: 'E-posta servisine bağlanırken zaman aşımı oluştu. Lütfen tekrar deneyin.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
