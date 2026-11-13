import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import { createAdminSupabase } from '@/lib/supabase';
import catalogStats from '@/lib/catalog-stats.json';

export type ComponentHealthState = 'operational' | 'degraded' | 'outage';
export type PublicServiceId = 'web' | 'auth' | 'database' | 'catalog';

export interface ServiceProbeResult {
  id: PublicServiceId;
  status: ComponentHealthState;
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

async function probeAuthService(): Promise<ServiceProbeResult> {
  const started = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const latencyMs = Math.round(performance.now() - started);

    if (!res.ok) {
      return {
        id: 'auth',
        status: res.status >= 500 ? 'outage' : 'degraded',
      };
    }

    const json = (await res.json()) as {
      external?: { google?: boolean };
    };

    if (json?.external?.google !== true) {
      return { id: 'auth', status: 'degraded' };
    }

    return {
      id: 'auth',
      status: latencyMs > 1800 ? 'degraded' : 'operational',
    };
  } catch {
    return { id: 'auth', status: 'outage' };
  }
}

async function probeDataService(): Promise<ServiceProbeResult> {
  const started = performance.now();
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { error } = await adminSupabase
        .from('user_licenses')
        .select('id', { count: 'exact', head: true });
      const latencyMs = Math.round(performance.now() - started);

      if (error) {
        return { id: 'database', status: 'degraded' };
      }

      return {
        id: 'database',
        status: latencyMs > 1800 ? 'degraded' : 'operational',
      };
    } catch {
      return { id: 'database', status: 'outage' };
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
    const latencyMs = Math.round(performance.now() - started);
    if (res.status >= 500) {
      return { id: 'database', status: 'outage' };
    }
    return {
      id: 'database',
      status: latencyMs > 1800 ? 'degraded' : 'operational',
    };
  } catch {
    return { id: 'database', status: 'outage' };
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

  const [authProbe, dbProbe, uptimeData] = await Promise.all([
    probeAuthService(),
    probeDataService(),
    probeUptimeRobot(),
  ]);

  const catalogTotal = typeof catalogStats?.total === 'number' ? catalogStats.total : 0;
  const catalogProbe: ServiceProbeResult = {
    id: 'catalog',
    status: catalogTotal > 0 ? 'operational' : 'degraded',
  };

  const webProbe: ServiceProbeResult = {
    id: 'web',
    status: 'operational',
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
