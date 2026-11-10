import { NextResponse } from 'next/server';
import { createAdminSupabase, isAdminUser } from '@/lib/supabase';
import { verifyAdminSecret } from '@/lib/admin-secret';
import { hasValidAdminSession } from '@/lib/admin-session';
import crypto from 'crypto';

const ALLOWED_PRODUCTS = ['R-AI', 'RESTRICTED-FIVEM'];
const ALLOWED_DURATIONS = [30, 90, 365, 9999];

// Admin yetkilendirme kontrolü
async function verifyAdminAuth(request: Request) {
  // 0. Kullanıcı adı/parola ile açılmış imzalı oturum çerezi
  if (hasValidAdminSession(request)) {
    return { authorized: true };
  }

  // 1. Header'da ADMIN_SECRET_KEY kontrolü (ortam değişkeni zorunlu, varsayılan değer yok)
  if (verifyAdminSecret(request.headers.get('x-admin-secret'))) {
    return { authorized: true };
  }

  // 2. Bearer token ile yönetici hesabı kontrolü (user_metadata güvenilmez, kullanılmaz)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const adminSupabase = createAdminSupabase();
    const { data: userData } = await adminSupabase.auth.getUser(token);
    if (isAdminUser(userData?.user)) {
      return { authorized: true };
    }
  }

  return { authorized: false };
}

// 1. GET: İstatistikleri, kullanılmamış kodları ve kullanıcı lisanslarını listele
export async function GET(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const adminSupabase = createAdminSupabase();

    const { data: codes } = await adminSupabase
      .from('redeem_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    const { data: licenses } = await adminSupabase
      .from('user_licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    return NextResponse.json({
      success: true,
      codes: codes || [],
      licenses: licenses || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}

// 2. POST: Toplu Kod Üretici veya İşlem Yöneticisi (HWID Sıfırlama / Banlama)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const adminSupabase = createAdminSupabase();
    const body = await request.json();
    const action = body.action;

    // A. Toplu Kod Üretimi
    if (action === 'generate_codes') {
      const productName = String(body.product_name || 'R-AI');
      const durationDays = Number(body.duration_days) || 30;
      const count = Math.min(Math.max(Number(body.count) || 1, 1), 500);

      if (!ALLOWED_PRODUCTS.includes(productName)) {
        return NextResponse.json({ success: false, message: 'Geçersiz ürün adı.' }, { status: 400 });
      }
      if (!ALLOWED_DURATIONS.includes(durationDays)) {
        return NextResponse.json({ success: false, message: 'Geçersiz süre.' }, { status: 400 });
      }

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

      const { data, error } = await adminSupabase.from('redeem_codes').insert(newCodes).select();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `${count} adet ${durationDays} günlük ${productName} kodu başarıyla üretildi.`,
        generated_codes: data.map((c) => c.code),
      });
    }

    // B. HWID Sıfırlama
    if (action === 'reset_hwid') {
      const licenseId = body.license_id;
      if (!licenseId) {
        return NextResponse.json({ success: false, message: 'Lisans ID belirtilmedi.' }, { status: 400 });
      }

      const { error } = await adminSupabase.from('user_licenses').update({ hwid: null }).eq('id', licenseId);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'HWID kilidi başarıyla sıfırlandı. Müşteri yeni cihazdan giriş yapabilir.',
      });
    }

    // C. Lisans Banlama / Durum Değiştirme
    if (action === 'toggle_ban') {
      const licenseId = body.license_id;
      if (!licenseId) {
        return NextResponse.json({ success: false, message: 'Lisans ID belirtilmedi.' }, { status: 400 });
      }
      const newStatus = body.status === 'banned' ? 'banned' : 'active';

      const { error } = await adminSupabase.from('user_licenses').update({ status: newStatus }).eq('id', licenseId);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Lisans durumu '${newStatus}' olarak güncellendi.` });
    }

    return NextResponse.json({ success: false, message: 'Geçersiz işlem.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
