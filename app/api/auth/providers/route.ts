import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) {
      return NextResponse.json(
        { google: false, discord: false },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const json = (await res.json()) as { external?: Record<string, boolean> };
    return NextResponse.json(
      {
        google: Boolean(json?.external?.google),
        discord: Boolean(json?.external?.discord),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { google: false, discord: false },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
