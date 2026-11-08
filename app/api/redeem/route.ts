import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Oturum bilgisi bulunamadı.' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const adminSupabase = createAdminSupabase();

    // 1. Kullanıcıyı token ile doğrula
    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: 'Geçersiz oturum. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }

    const user = userData.user;
    const body = await request.json();
    const rawCode = String(body.code || '').trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json({ success: false, message: 'Lütfen geçerli bir aktivasyon kodu giriniz.' }, { status: 400 });
    }

    // 2. Kodu redeem_codes tablosunda kontrol et
    const { data: codeData, error: codeError } = await adminSupabase
      .from('redeem_codes')
      .select('*')
      .eq('code', rawCode)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ success: false, message: 'Girdiğiniz aktivasyon kodu geçersiz.' }, { status: 404 });
    }

    if (codeData.is_used) {
      return NextResponse.json({ success: false, message: 'Bu aktivasyon kodu daha önce kullanılmış.' }, { status: 400 });
    }

    const durationDays = Number(codeData.duration_days) || 30;
    const productName = codeData.product_name || 'R-AI';

    // 3. Kod durumunu is_used = true olarak güncelle (Atomik kontrol: dönen satır sayısını doğrula)
    const { data: updatedRows, error: updateCodeError } = await adminSupabase
      .from('redeem_codes')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString(),
      })
      .eq('id', codeData.id)
      .eq('is_used', false)
      .select('id');

    if (updateCodeError || !updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ success: false, message: 'Bu kod az önce kullanıldı veya işlem çakışması oluştu.' }, { status: 409 });
    }

    // 4. Kullanıcının mevcut lisansını kontrol et (Varsa süresini uzat, yoksa yeni ekle)
    const { data: existingLicense } = await adminSupabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_name', productName)
      .maybeSingle();

    const now = new Date();
    let newExpiry: Date;

    if (existingLicense && new Date(existingLicense.expires_at) > now) {
      // Mevcut sürenin üzerine ekle
      newExpiry = new Date(new Date(existingLicense.expires_at).getTime() + durationDays * 86400000);
    } else {
      // Bugünden itibaren başlat
      newExpiry = new Date(now.getTime() + durationDays * 86400000);
    }

    if (existingLicense) {
      await adminSupabase
        .from('user_licenses')
        .update({
          expires_at: newExpiry.toISOString(),
          status: 'active',
        })
        .eq('id', existingLicense.id);
    } else {
      await adminSupabase.from('user_licenses').insert({
        user_id: user.id,
        product_name: productName,
        status: 'active',
        expires_at: newExpiry.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${productName} lisansınız ${durationDays} gün boyunca başarıyla aktive edildi!`,
      expires_at: newExpiry.toISOString(),
      duration_days: durationDays,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
