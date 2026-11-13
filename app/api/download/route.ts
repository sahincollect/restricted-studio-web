import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { writeAuditLog } from '@/lib/audit-log';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'download');
  if (!guard.ok) return guard.response;

  try {
    const session = await resolveCustomerSession(request);
    if (!session.authenticated || !session.user) {
      const res = NextResponse.json(
        { success: false, message: 'Oturum bulunamadı veya süresi doldu.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
      if (session.clearCookies) clearCustomerSessionCookies(request, res);
      return res;
    }

    const downloadUrl = process.env.R_AI_DOWNLOAD_URL;
    if (!downloadUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'İndirme bağlantısı henüz yapılandırılmadı. Lütfen destek ile iletişime geçin.',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Lisans doğrulama servisi şu anda erişilemiyor.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const adminSupabase = createAdminSupabase();
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isDesignatedAdmin = Boolean(adminEmail && session.user.email?.toLowerCase() === adminEmail);

    if (!isDesignatedAdmin) {
      const { data: license } = await adminSupabase
        .from('user_licenses')
        .select('id, status, expires_at')
        .eq('user_id', session.user.id)
        .eq('product_name', 'R-AI')
        .maybeSingle();

      const valid = license && license.status === 'active' && new Date(license.expires_at) > new Date();
      if (!valid) {
        return NextResponse.json(
          { success: false, message: 'İndirme için geçerli bir R-AI lisansı gereklidir.' },
          { status: 403, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    await writeAuditLog({
      request,
      actorId: session.user.id,
      actorType: 'customer',
      action: 'DOWNLOAD_URL_ISSUED',
      resourceType: 'product',
      resourceId: 'R-AI',
    });

    const res = NextResponse.json(
      { success: true, url: downloadUrl },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.refreshedTokens) {
      attachCustomerCookies(request, res, session.refreshedTokens);
    }
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
