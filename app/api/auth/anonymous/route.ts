import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST() {
  try {
    const adminSupabase = createAdminSupabase();
    const anonId = crypto.randomBytes(5).toString('hex').toLowerCase();
    const email = `anon_${anonId}@restrictedstudio.local`;
    const password = crypto.randomBytes(16).toString('hex');
    const displayTag = `Anonim #${anonId.slice(0, 4).toUpperCase()}`;

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: displayTag,
        is_anonymous: true,
      },
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { success: false, message: error?.message || 'Anonim oturum oluşturulamadı.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email,
      password,
      username: displayTag,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Sunucu hatası.' },
      { status: 500 }
    );
  }
}
