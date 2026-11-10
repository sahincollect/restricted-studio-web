import { NextResponse } from 'next/server';
import { createAdminSupabase, isAdminUser } from '@/lib/supabase';

// Müşteri lisansı doğrulanmış kullanıcılar için R-AI kurulum dosyası indirme bağlantısı üretir.
// Dosya public/ altında SERVİS EDİLMEZ; barındırılan adres R_AI_DOWNLOAD_URL ortam değişkeninden gelir.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Oturum bulunamadı.' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const adminSupabase = createAdminSupabase();

    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: 'Geçersiz oturum.' }, { status: 401 });
    }

    const downloadUrl = process.env.R_AI_DOWNLOAD_URL;
    if (!downloadUrl) {
      return NextResponse.json(
        { success: false, message: 'İndirme bağlantısı henüz yapılandırılmadı. Lütfen destek ile iletişime geçin.' },
        { status: 503 }
      );
    }

    if (!isAdminUser(userData.user)) {
      const { data: license } = await adminSupabase
        .from('user_licenses')
        .select('status, expires_at')
        .eq('user_id', userData.user.id)
        .eq('product_name', 'R-AI')
        .maybeSingle();

      const valid = license && license.status === 'active' && new Date(license.expires_at) > new Date();
      if (!valid) {
        return NextResponse.json(
          { success: false, message: 'İndirme için geçerli bir R-AI lisansı gereklidir.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, url: downloadUrl });
  } catch {
    return NextResponse.json({ success: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
