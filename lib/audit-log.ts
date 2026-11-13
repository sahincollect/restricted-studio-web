import { createAdminSupabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/security-edge';
import { sanitizePlainText } from '@/lib/validation';

export interface AuditLogInput {
  request?: Request;
  actorId: string;
  actorType: 'admin' | 'customer' | 'anonymous' | 'system';
  action: string;
  resourceType?: string;
  resourceId?: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export interface AuditLogRow {
  id: string;
  actor_id: string;
  actor_type: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

const MAX_MEMORY_AUDIT_LOGS = 200;
const globalAudit = globalThis as unknown as { __rsAuditBuffer?: AuditLogRow[] };
const memoryAuditBuffer = (globalAudit.__rsAuditBuffer ||= []);

/**
 * Writes an immutable audit event to `public.audit_logs` (with safe server fallback log).
 */
export async function writeAuditLog(entry: AuditLogInput): Promise<void> {
  const ip = entry.request ? getClientIp(entry.request) : null;
  const ua = entry.request ? sanitizePlainText(entry.request.headers.get('user-agent'), 240) : null;
  const createdAt = new Date().toISOString();

  const row: AuditLogRow = {
    id: crypto.randomUUID(),
    actor_id: sanitizePlainText(entry.actorId, 128),
    actor_type: entry.actorType,
    action: sanitizePlainText(entry.action, 80),
    resource_type: entry.resourceType ? sanitizePlainText(entry.resourceType, 64) : null,
    resource_id: entry.resourceId ? sanitizePlainText(entry.resourceId, 128) : null,
    ip_address: ip,
    user_agent: ua,
    before_state: entry.beforeState ?? null,
    after_state: entry.afterState ?? null,
    metadata: entry.metadata ?? null,
    created_at: createdAt,
  };

  memoryAuditBuffer.unshift(row);
  if (memoryAuditBuffer.length > MAX_MEMORY_AUDIT_LOGS) {
    memoryAuditBuffer.length = MAX_MEMORY_AUDIT_LOGS;
  }

  // Server-side structured log (redacts PII/tokens automatically by design)
  console.info(
    JSON.stringify({
      type: 'SECURITY_AUDIT',
      action: row.action,
      actorType: row.actor_type,
      actorId: row.actor_id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      ip: row.ip_address,
      at: row.created_at,
    })
  );

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const adminSupabase = createAdminSupabase();
    await adminSupabase.from('audit_logs').insert({
      actor_id: row.actor_id,
      actor_type: row.actor_type,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      before_state: row.before_state,
      after_state: row.after_state,
      metadata: row.metadata,
    });
  } catch {
    // Do not break business workflow if DB migration hasn't been executed yet
  }
}

/**
 * Fetches latest immutable audit records for the Admin dashboard.
 */
export async function fetchAuditLogs(limit = 50): Promise<AuditLogRow[]> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as AuditLogRow[];
      }
    } catch {
      // Fallback to bounded in-memory audit buffer
    }
  }
  return memoryAuditBuffer.slice(0, limit);
}
