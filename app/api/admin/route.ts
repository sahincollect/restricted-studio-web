import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminSupabase } from '@/lib/supabase';
import { verifyAdminSecret } from '@/lib/admin-secret';
import {
  attachAdminElevatedCookies,
  resolveElevatedAdminSession,
} from '@/lib/admin-session';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import { AdminActionSchema } from '@/lib/validation';
import { fetchAuditLogs, writeAuditLog } from '@/lib/audit-log';

interface AdminAuthContext {
  authorized: boolean;
  actorId: string;
  viaSecretHeader: boolean;
  rotatedSub?: string;
  rotatedFamilyId?: string;
}

async function verifyAdminAuth(request: Request): Promise<AdminAuthContext> {
  // 1. Zero-Trust MFA-verified elevated session cookie (or rotated refresh)
  const elevated = await resolveElevatedAdminSession(request);
  if (elevated.authenticated && elevated.claims) {
    return {
      authorized: true,
      actorId: elevated.claims.sub,
      viaSecretHeader: false,
      rotatedSub: elevated.rotatedSub,
      rotatedFamilyId: elevated.rotatedFamilyId,
    };
  }

  // 2. Machine-to-machine CLI header secret (requires ADMIN_SECRET_KEY >= 32 bytes in env)
  if (verifyAdminSecret(request.headers.get('x-admin-secret'))) {
    return {
      authorized: true,
      actorId: 'cli-admin-secret',
      viaSecretHeader: true,
    };
  }

  return { authorized: false, actorId: 'unauthorized', viaSecretHeader: false };
}

function finalizeAdminResponse(
  request: Request,
  auth: AdminAuthContext,
  payload: Record<string, any>,
  status = 200
) {
  const res = NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
  if (auth.rotatedSub) {
    attachAdminElevatedCookies(request, res, auth.rotatedSub, auth.rotatedFamilyId);
  }
  return res;
}

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'admin_api');
  if (!guard.ok) return guard.response;

  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const auditLogs = await fetchAuditLogs(60);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return finalizeAdminResponse(request, auth, {
        success: true,
        dbConfigured: false,
        codes: [],
        licenses: [],
        auditLogs,
      });
    }

    const adminSupabase = createAdminSupabase();
    const [{ data: codes }, { data: licenses }] = await Promise.all([
      adminSupabase
        .from('redeem_codes')
        .select('id, code, product_name, duration_days, is_used, used_by, used_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
      adminSupabase
        .from('user_licenses')
        .select('id, user_id, product_name, hwid, status, expires_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    return finalizeAdminResponse(request, auth, {
      success: true,
      dbConfigured: true,
      codes: codes || [],
      licenses: licenses || [],
      auditLogs,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Yönetici verileri şu anda yüklenemiyor.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(request: Request) {
  const hasSecretHeader = verifyAdminSecret(request.headers.get('x-admin-secret'));
  const guard = guardApiRequest(request, 'admin_api', {
    checkSameOrigin: !hasSecretHeader,
  });
  if (!guard.ok) return guard.response;

  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      await writeAuditLog({
        request,
        actorId: 'unknown',
        actorType: 'admin',
        action: 'ADMIN_UNAUTHORIZED_MUTATION_BLOCKED',
      });
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim veya MFA oturumu eksik.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const parsed = await parseJsonBodySafe(request, 16384);
    if (!parsed.ok) return parsed.response;

    const validated = AdminActionSchema.safeParse(parsed.data);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: validated.error.issues[0]?.message || 'Geçersiz yönetici işlem parametreleri.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return finalizeAdminResponse(
        request,
        auth,
        {
          success: false,
          message: 'Veritabanı servis anahtarı (SUPABASE_SERVICE_ROLE_KEY) yapılandırılmadığı için yazma işlemi yapılamıyor.',
        },
        503
      );
    }

    const adminSupabase = createAdminSupabase();
    const input = validated.data;

    // A. Toplu Kod Üretimi
    if (input.action === 'generate_codes') {
      const { product_name: productName, duration_days: durationDays, count } = input;
      const newCodes: Array<{ code: string; product_name: string; duration_days: number }> = [];

      for (let i = 0; i < count; i++) {
        const p1 = crypto.randomBytes(3).toString('hex').toUpperCase();
        const p2 = crypto.randomBytes(3).toString('hex').toUpperCase();
        const p3 = crypto.randomBytes(3).toString('hex').toUpperCase();
        newCodes.push({
          code: `${productName}-${p1}-${p2}-${p3}`,
          product_name: productName,
          duration_days: durationDays,
        });
      }

      const { data, error } = await adminSupabase
        .from('redeem_codes')
        .insert(newCodes)
        .select('id, code');

      if (error || !data) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Kod üretimi veritabanında tamamlanamadı.' },
          500
        );
      }

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_CODES_GENERATED',
        resourceType: 'redeem_codes',
        afterState: { productName, durationDays, count },
        metadata: { codeIdsCount: data.length },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: `${count} adet ${durationDays} günlük ${productName} kodu başarıyla üretildi.`,
        generated_codes: data.map((c) => c.code),
      });
    }

    // B. HWID Sıfırlama (before/after diff audit)
    if (input.action === 'reset_hwid') {
      const { data: beforeRow } = await adminSupabase
        .from('user_licenses')
        .select('id, user_id, product_name, status, hwid')
        .eq('id', input.license_id)
        .maybeSingle();

      if (!beforeRow) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Lisans kaydı bulunamadı.' },
          404
        );
      }

      const { error } = await adminSupabase
        .from('user_licenses')
        .update({ hwid: null })
        .eq('id', input.license_id);

      if (error) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'HWID sıfırlama işlemi tamamlanamadı.' },
          500
        );
      }

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_HWID_RESET',
        resourceType: 'user_license',
        resourceId: input.license_id,
        beforeState: { hwid: beforeRow.hwid, status: beforeRow.status },
        afterState: { hwid: null, status: beforeRow.status },
        metadata: { targetUserId: beforeRow.user_id, product: beforeRow.product_name },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: 'HWID kilidi başarıyla sıfırlandı. Müşteri yeni cihazdan giriş yapabilir.',
      });
    }

    // C. Lisans Durum Değişikliği (Ban / Unban + before/after audit)
    if (input.action === 'toggle_ban') {
      const { data: beforeRow } = await adminSupabase
        .from('user_licenses')
        .select('id, user_id, product_name, status, hwid')
        .eq('id', input.license_id)
        .maybeSingle();

      if (!beforeRow) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Lisans kaydı bulunamadı.' },
          404
        );
      }

      const { error } = await adminSupabase
        .from('user_licenses')
        .update({ status: input.status })
        .eq('id', input.license_id);

      if (error) {
        return finalizeAdminResponse(
          request,
          auth,
          { success: false, message: 'Lisans durumu güncellenemedi.' },
          500
        );
      }

      await writeAuditLog({
        request,
        actorId: auth.actorId,
        actorType: 'admin',
        action: 'ADMIN_LICENSE_STATUS_CHANGE',
        resourceType: 'user_license',
        resourceId: input.license_id,
        beforeState: { status: beforeRow.status },
        afterState: { status: input.status },
        metadata: { targetUserId: beforeRow.user_id, product: beforeRow.product_name },
      });

      return finalizeAdminResponse(request, auth, {
        success: true,
        message: `Lisans durumu '${input.status}' olarak güncellendi.`,
      });
    }

    return finalizeAdminResponse(request, auth, { success: false, message: 'Geçersiz işlem.' }, 400);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
