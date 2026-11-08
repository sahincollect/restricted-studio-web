import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

// Admin yetkilendirme kontrolü
async function verifyAdminAuth(request: Request) {
  const adminSupabase = createAdminSupabase();

  // 1. Header'da ADMIN_SECRET_KEY kontrolü
  const secretHeader = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET_KEY || 'RESTRICTED_ADMIN_SECRET_2026_V1';
  if (secretHeader && secretHeader === expectedSecret) {
    return { authorized: true };
  }

  // 2. Bearer token ile Admin Email kontrolü
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: userData } = await adminSupabase.auth.getUser(token);
    const adminEmail = process.env.ADMIN_EMAIL || 'emreador@gmail.com';
    if (userData?.user?.email && userData.user.email.toLowerCase() === adminEmail.toLowerCase()) {
      return { authorized: true };
    }
  }

  return { authorized: false };
}

// 1. GET: İstatistikleri, kullanılmamış kodları ve kullanıcı lisanslarını listele
export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const adminSupabase = createAdminSupabase();

  // A. Kullanılmamış ve son üretilen kodlar
  const { data: codes } = await adminSupabase
    .from('redeem_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  // B. Kullanıcı lisansları (HWID ve Durum)
  const { data: licenses } = await adminSupabase
    .from('user_licenses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return NextResponse.json({
    success: true,
    codes: codes || [],
    licenses: licenses || [],
  });
}

// 2. POST: Toplu Kod Üretici veya İşlem Yöneticisi (HWID Sıfırlama / Banlama)
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const adminSupabase = createAdminSupabase();
  const body = await request.json();
  const action = body.action;

  // A. Toplu Kod Üretimi
  if (action === 'generate_codes') {
    const productName = body.product_name || 'R-AI';
    const durationDays = Number(body.duration_days) || 30;
    const count = Math.min(Math.max(Number(body.count) || 1, 1), 500); // 1 - 500 arası

    const newCodes: Array<{ code: string; product_name: string; duration_days: number }> = [];

    for (let i = 0; i < count; i++) {
      const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const code = `${productName}-${p1}-${p2}-${p3}`;
      newCodes.push({
        code,
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

    const { error } = await adminSupabase
      .from('user_licenses')
      .update({ hwid: null })
      .eq('id', licenseId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'HWID kilidi başarıyla sıfırlandı. Müşteri yeni cihazdan giriş yapabilir.' });
  }

  // C. Lisans Banlama / Durum Değiştirme
  if (action === 'toggle_ban') {
    const licenseId = body.license_id;
    const newStatus = body.status === 'banned' ? 'banned' : 'active';

    const { error } = await adminSupabase
      .from('user_licenses')
      .update({ status: newStatus })
      .eq('id', licenseId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Lisans durumu '${newStatus}' olarak güncellendi.` });
  }

  return NextResponse.json({ success: false, message: 'Geçersiz işlem.' }, { status: 400 });
}
