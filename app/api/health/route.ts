import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import { createAdminSupabase } from '@/lib/supabase';
import catalogStats from '@/lib/catalog-stats.json';

export type ComponentHealthState = 'operational' | 'degraded' | 'outage';

export interface ServiceProbeResult {
  id: string;
  name: string;
  description: string;
  status: ComponentHealthState;
  latencyMs: number;
  detail: string;
}

export interface UptimeMonitorSummary {
  name: string;
  status: ComponentHealthState;
  uptime24h: string | null;
  uptime7d: string | null;
  uptime30d: string | null;
  uptime90d: string | null;
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

async function probeAuthAndOAuth(): Promise<ServiceProbeResult> {
  const started = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - started));

    if (!res.ok) {
      return {
        id: 'auth',
        name: 'Kimlik Doğrulama & Google OAuth',
        description: 'Müşteri girişi, OAuth PKCE ve oturum yenileme servisleri',
        status: res.status >= 500 ? 'outage' : 'degraded',
        latencyMs,
        detail: `Auth servisi HTTP ${res.status} döndü`,
      };
    }

    const json = (await res.json()) as {
      external?: { google?: boolean; email?: boolean };
    };
    const googleEnabled = json?.external?.google === true;
    const emailEnabled = json?.external?.email === true;

    if (!googleEnabled) {
      return {
        id: 'auth',
        name: 'Kimlik Doğrulama & Google OAuth',
        description: 'Müşteri girişi, OAuth PKCE ve oturum yenileme servisleri',
        status: 'degraded',
        latencyMs,
        detail: 'Auth geçidi aktif, Google OAuth devre dışı görünüyor',
      };
    }

    return {
      id: 'auth',
      name: 'Kimlik Doğrulama & Google OAuth',
      description: 'Müşteri girişi, OAuth PKCE ve oturum yenileme servisleri',
      status: latencyMs > 1800 ? 'degraded' : 'operational',
      latencyMs,
      detail: emailEnabled
        ? 'Google OAuth & E-posta girişi aktif'
        : 'Google OAuth aktif',
    };
  } catch {
    return {
      id: 'auth',
      name: 'Kimlik Doğrulama & Google OAuth',
      description: 'Müşteri girişi, OAuth PKCE ve oturum yenileme servisleri',
      status: 'outage',
      latencyMs: Math.round(performance.now() - started),
      detail: 'Kimlik doğrulama geçidine ulaşılamadı',
    };
  }
}

async function probeDatabase(): Promise<ServiceProbeResult> {
  const started = performance.now();
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { error } = await adminSupabase
        .from('user_licenses')
        .select('id', { count: 'exact', head: true });
      const latencyMs = Math.max(1, Math.round(performance.now() - started));

      if (error) {
        return {
          id: 'database',
          name: 'Veritabanı & Lisans Motoru',
          description: 'PostgreSQL RLS katmanı, HWID doğrulama ve lisans sorguları',
          status: 'degraded',
          latencyMs,
          detail: 'Veritabanı sorgusu hata döndürdü',
        };
      }

      return {
        id: 'database',
        name: 'Veritabanı & Lisans Motoru',
        description: 'PostgreSQL RLS katmanı, HWID doğrulama ve lisans sorguları',
        status: latencyMs > 1800 ? 'degraded' : 'operational',
        latencyMs,
        detail: 'PostgreSQL lisans tablosu doğrulandı',
      };
    } catch {
      return {
        id: 'database',
        name: 'Veritabanı & Lisans Motoru',
        description: 'PostgreSQL RLS katmanı, HWID doğrulama ve lisans sorguları',
        status: 'outage',
        latencyMs: Math.round(performance.now() - started),
        detail: 'Veritabanı bağlantısı zaman aşımına uğradı',
      };
    }
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - started));
    const healthy = res.status < 500;
    return {
      id: 'database',
      name: 'Veritabanı & Lisans Motoru',
      description: 'PostgreSQL RLS katmanı, HWID doğrulama ve lisans sorguları',
      status: !healthy ? 'outage' : latencyMs > 1800 ? 'degraded' : 'operational',
      latencyMs,
      detail: healthy
        ? 'Veritabanı REST geçidi yanıt veriyor'
        : `REST geçidi HTTP ${res.status} döndü`,
    };
  } catch {
    return {
      id: 'database',
      name: 'Veritabanı & Lisans Motoru',
      description: 'PostgreSQL RLS katmanı, HWID doğrulama ve lisans sorguları',
      status: 'outage',
      latencyMs: Math.round(performance.now() - started),
      detail: 'Veritabanı geçidine erişilemiyor',
    };
  }
}

async function probeUptimeRobot(): Promise<{
  configured: boolean;
  monitors: UptimeMonitorSummary[];
}> {
  const apiKey = process.env.UPTIMEROBOT_API_KEY?.trim();
  if (!apiKey) {
    return { configured: false, monitors: [] };
  }

  try {
    const body = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      custom_uptime_ratios: '1-7-30-90',
    });

    const res = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return { configured: false, monitors: [] };

    const data = (await res.json()) as {
      stat?: string;
      monitors?: Array<{
        friendly_name?: string;
        status?: number;
        custom_uptime_ratio?: string;
      }>;
    };

    if (data?.stat !== 'ok' || !Array.isArray(data.monitors)) {
      return { configured: false, monitors: [] };
    }

    const monitors: UptimeMonitorSummary[] = data.monitors.slice(0, 10).map((m) => {
      const ratios = (m.custom_uptime_ratio || '').split('-');
      const mappedStatus: ComponentHealthState =
        m.status === 2 ? 'operational' : m.status === 8 ? 'degraded' : m.status === 9 ? 'outage' : 'degraded';

      return {
        name: String(m.friendly_name || 'Servis'),
        status: mappedStatus,
        uptime24h: ratios[0] ? `${Number(ratios[0]).toFixed(2)}%` : null,
        uptime7d: ratios[1] ? `${Number(ratios[1]).toFixed(2)}%` : null,
        uptime30d: ratios[2] ? `${Number(ratios[2]).toFixed(2)}%` : null,
        uptime90d: ratios[3] ? `${Number(ratios[3]).toFixed(2)}%` : null,
      };
    });

    return { configured: true, monitors };
  } catch {
    return { configured: false, monitors: [] };
  }
}

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  const requestStart = performance.now();

  const [authProbe, dbProbe, uptimeData] = await Promise.all([
    probeAuthAndOAuth(),
    probeDatabase(),
    probeUptimeRobot(),
  ]);

  const catalogStart = performance.now();
  const catalogTotal = typeof catalogStats?.total === 'number' ? catalogStats.total : 0;
  const catalogLatency = Math.max(1, Math.round(performance.now() - catalogStart));
  const catalogProbe: ServiceProbeResult = {
    id: 'catalog',
    name: 'Katalog & İndeks Dağıtımı',
    description: 'Script arşivi, arama indeksi ve güvenli dosya yönlendirmesi',
    status: catalogTotal > 0 ? 'operational' : 'degraded',
    latencyMs: catalogLatency,
    detail:
      catalogTotal > 0
        ? `${catalogTotal.toLocaleString('tr-TR')} paket indeksi hazır`
        : 'Katalog indeksi yüklenemedi',
  };

  const region = process.env.VERCEL_REGION || 'local-node';
  const webProbe: ServiceProbeResult = {
    id: 'web',
    name: 'Web Platform & Edge Ağı',
    description: 'Ana site, güvenlik middleware ve oturum cookie altyapısı',
    status: 'operational',
    latencyMs: Math.max(1, Math.round(performance.now() - requestStart)),
    detail: `Toplam uç kontrol süresi · Bölge: ${region}`,
  };

  const services: ServiceProbeResult[] = [webProbe, authProbe, dbProbe, catalogProbe];

  let overall: ComponentHealthState = 'operational';
  if (services.some((s) => s.status === 'outage')) {
    overall = 'outage';
  } else if (services.some((s) => s.status === 'degraded')) {
    overall = 'degraded';
  }

  return NextResponse.json(
    {
      status: overall,
      checkedAt: new Date().toISOString(),
      region,
      historicalMonitoring: uptimeData.configured,
      monitors: uptimeData.monitors,
      services,
    },
    {
      status: overall === 'outage' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
