import fs from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { createAdminSupabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site-config';
import {
  createTelegramAdminBindUrl,
  createTelegramCustomerBindUrl,
  escapeTelegramHtml,
  getTelegramBotToken,
  getTelegramBotUsername,
  getTelegramWebhookSecret,
  isTelegramConfigured,
  verifyTelegramStartToken,
} from '@/lib/telegram-tokens';

export {
  createTelegramAdminBindUrl,
  createTelegramCustomerBindUrl,
  escapeTelegramHtml,
  getTelegramBotToken,
  getTelegramBotUsername,
  getTelegramWebhookSecret,
  isTelegramConfigured,
  verifyTelegramStartToken,
};

const LOCAL_ADMIN_CHATS_FILE = path.join(process.cwd(), '.data', 'telegram-admin-chats.json');

interface AdminTelegramChatEntry {
  chatId: string;
  username: string | null;
  linkedAt: string;
}

const globalTg = globalThis as unknown as {
  __rsTgAdminChats?: AdminTelegramChatEntry[];
};

async function telegramApiCall<T = unknown>(
  method: string,
  payload?: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const token = getTelegramBotToken();
  if (!token) return { ok: false, description: 'TELEGRAM_BOT_TOKEN missing' };

  const bodyStr = payload ? JSON.stringify(payload) : undefined;
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/${method}`,
        method: payload ? 'POST' : 'GET',
        family: 4, // Avoid Windows IPv6 dual-stack stalls while remaining native TLS on Vercel
        timeout: 6000,
        headers: bodyStr
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(bodyStr, 'utf8'),
            }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            resolve({
              ok: Boolean(parsed?.ok),
              result: parsed?.result as T,
              description: typeof parsed?.description === 'string' ? parsed.description : undefined,
            });
          } catch {
            resolve({ ok: false, description: 'Invalid JSON from Telegram API' });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Telegram API timeout'));
    });
    req.on('error', (err) => {
      resolve({ ok: false, description: err.message });
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function sendTelegramMessage(
  chatId: string | number,
  textHtml: string,
  button?: { text: string; url: string }
): Promise<boolean> {
  const cleanId = String(chatId).trim();
  if (!cleanId) return false;

  const body: Record<string, unknown> = {
    chat_id: cleanId,
    text: textHtml.slice(0, 3900),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (button?.url && button.url.startsWith('https://')) {
    body.reply_markup = {
      inline_keyboard: [[{ text: button.text.slice(0, 48), url: button.url }]],
    };
  }

  const res = await telegramApiCall('sendMessage', body);
  return res.ok;
}

async function readLocalAdminChats(): Promise<AdminTelegramChatEntry[]> {
  if (globalTg.__rsTgAdminChats) return globalTg.__rsTgAdminChats;
  if (process.env.VERCEL !== '1') {
    try {
      const raw = await fs.readFile(LOCAL_ADMIN_CHATS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalTg.__rsTgAdminChats = parsed;
        return parsed;
      }
    } catch {
      // missing
    }
  }
  globalTg.__rsTgAdminChats = [];
  return globalTg.__rsTgAdminChats;
}

async function writeLocalAdminChats(entries: AdminTelegramChatEntry[]): Promise<void> {
  globalTg.__rsTgAdminChats = entries;
  if (process.env.VERCEL === '1') return;
  try {
    await fs.mkdir(path.dirname(LOCAL_ADMIN_CHATS_FILE), { recursive: true });
    await fs.writeFile(LOCAL_ADMIN_CHATS_FILE, JSON.stringify(entries, null, 2), 'utf8');
  } catch {
    // ignore fs error
  }
}

export async function listAdminTelegramChatEntries(): Promise<{
  envIds: string[];
  boundEntries: AdminTelegramChatEntry[];
  allChatIds: string[];
}> {
  const envIds = (process.env.TELEGRAM_ADMIN_CHAT_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^-?\d+$/.test(s));

  let boundEntries: AdminTelegramChatEntry[] = [];
  let loadedFromDb = false;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { data, error } = await adminSupabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'telegram_admin_chats')
        .maybeSingle();
      if (!error) {
        loadedFromDb = true;
        const list = (data?.value as { chats?: AdminTelegramChatEntry[] } | null)?.chats;
        if (Array.isArray(list)) {
          boundEntries = list;
        }
      }
    } catch {
      // table may not be migrated yet
    }
  }

  if (!loadedFromDb) {
    boundEntries = await readLocalAdminChats();
  }

  const allChatIds = Array.from(new Set([...envIds, ...boundEntries.map((b) => b.chatId)]));
  return { envIds, boundEntries, allChatIds };
}

export async function saveBoundAdminTelegramChatId(
  chatId: string | number,
  username?: string | null
): Promise<void> {
  const cleanId = String(chatId).trim();
  if (!/^-?\d+$/.test(cleanId)) return;

  const { boundEntries } = await listAdminTelegramChatEntries();
  const next: AdminTelegramChatEntry[] = [
    { chatId: cleanId, username: username || null, linkedAt: new Date().toISOString() },
    ...boundEntries.filter((e) => e.chatId !== cleanId),
  ].slice(0, 10);

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      await adminSupabase.from('admin_settings').upsert({
        key: 'telegram_admin_chats',
        value: { chats: next },
        updated_at: new Date().toISOString(),
      });
    } catch {
      // fallback cleanly
    }
  }

  await writeLocalAdminChats(next);
}

export async function notifyAdminTelegram(
  textHtml: string,
  button?: { text: string; path?: string }
): Promise<{ sent: number; failed: number }> {
  if (!isTelegramConfigured()) return { sent: 0, failed: 0 };
  const { allChatIds } = await listAdminTelegramChatEntries();
  if (allChatIds.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  const fullUrl = button?.path ? `${SITE_URL}${button.path}` : `${SITE_URL}/admin`;
  const btn = button ? { text: button.text, url: fullUrl } : undefined;

  for (const id of allChatIds) {
    const ok = await sendTelegramMessage(id, textHtml, btn);
    if (ok) sent++;
    else failed++;
  }
  return { sent, failed };
}

export async function setupTelegramWebhook(webhookUrl: string, secretToken: string) {
  return telegramApiCall('setWebhook', {
    url: webhookUrl,
    secret_token: secretToken,
    allowed_updates: ['message'],
    drop_pending_updates: false,
  });
}

export async function getTelegramWebhookInfo() {
  return telegramApiCall<{
    url?: string;
    pending_update_count?: number;
    last_error_message?: string;
  }>('getWebhookInfo');
}

export async function getTelegramBotProfile() {
  return telegramApiCall<{ id: number; username?: string; first_name?: string }>('getMe');
}
