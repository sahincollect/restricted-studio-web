import fs from 'node:fs/promises';
import path from 'node:path';
import { createAdminSupabase } from '@/lib/supabase';
import type { Locale } from '@/lib/i18n';

export interface UserProfileRecord {
  userId: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  discordHandle: string;
  discordId: string | null;
  authProviders: string[];
  serverName: string;
  bio: string;
  preferredLocale: Locale;
  isGuest: boolean;
  updatedAt: string;
}

const LOCAL_PROFILES_FILE = path.join(process.cwd(), '.data', 'user-profiles.json');
const globalProfiles = globalThis as unknown as {
  __rsUserProfiles?: Record<string, UserProfileRecord>;
};

async function readLocalProfilesMap(): Promise<Record<string, UserProfileRecord>> {
  if (globalProfiles.__rsUserProfiles) return globalProfiles.__rsUserProfiles;
  if (process.env.VERCEL !== '1') {
    try {
      const raw = await fs.readFile(LOCAL_PROFILES_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, UserProfileRecord>;
      globalProfiles.__rsUserProfiles = parsed || {};
      return globalProfiles.__rsUserProfiles;
    } catch {
      // ignore missing file
    }
  }
  globalProfiles.__rsUserProfiles ||= {};
  return globalProfiles.__rsUserProfiles;
}

async function writeLocalProfilesMap(map: Record<string, UserProfileRecord>): Promise<void> {
  globalProfiles.__rsUserProfiles = map;
  if (process.env.VERCEL === '1') return;
  try {
    await fs.mkdir(path.dirname(LOCAL_PROFILES_FILE), { recursive: true });
    await fs.writeFile(LOCAL_PROFILES_FILE, JSON.stringify(map, null, 2), 'utf8');
  } catch {
    // ignore fs error
  }
}

function defaultDisplayName(email?: string, name?: string): string {
  if (name && name.trim()) return name.trim().slice(0, 48);
  if (email) {
    return email
      .replace(
        /@(kullanici\.restrictedstudio\.shop|anon\.restrictedstudio\.shop|restrictedstudio\.com|restrictedstudio\.local|restricted\.studio|gmail\.com)$/i,
        ''
      )
      .slice(0, 48);
  }
  return 'Üye';
}

function deriveProviderList(authUser: {
  app_metadata?: Record<string, unknown> | null;
  identities?: Array<{ provider?: string }> | null;
}): string[] {
  const out = new Set<string>();
  const primary = authUser.app_metadata?.provider;
  if (typeof primary === 'string' && primary) out.add(primary);
  const providersArr = authUser.app_metadata?.providers;
  if (Array.isArray(providersArr)) {
    for (const p of providersArr) {
      if (typeof p === 'string' && p) out.add(p);
    }
  }
  if (Array.isArray(authUser.identities)) {
    for (const ident of authUser.identities) {
      if (ident?.provider) out.add(ident.provider);
    }
  }
  if (out.size === 0) out.add('email');
  return Array.from(out);
}

export async function getUserProfile(sessionUser: {
  id: string;
  email?: string;
  name?: string;
}): Promise<{
  profile: UserProfileRecord;
  storageBackend: 'supabase-table' | 'supabase-meta' | 'local-file' | 'memory-only';
}> {
  const isGuest = Boolean(sessionUser.email?.toLowerCase().endsWith('@anon.restrictedstudio.shop'));
  const fallbackName = defaultDisplayName(sessionUser.email, sessionUser.name);

  let authMetaProfile: Partial<UserProfileRecord> | null = null;
  let providers: string[] = isGuest ? ['guest'] : ['email'];

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      // 1. Try dedicated user_profiles table
      const { data: row, error: tableErr } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      // 2. Also fetch auth user metadata (carries OAuth providers, avatars & fallback profile state)
      const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(sessionUser.id);
      const authUser = authUserRes?.user;
      if (authUser) {
        providers = deriveProviderList(authUser);
        const um = (authUser.user_metadata || {}) as Record<string, unknown>;
        const rawAvatar =
          typeof um.rs_avatar_url === 'string'
            ? um.rs_avatar_url
            : typeof um.avatar_url === 'string'
            ? um.avatar_url
            : typeof um.picture === 'string'
            ? um.picture
            : null;
        const discordHandle =
          typeof um.rs_discord_handle === 'string'
            ? um.rs_discord_handle
            : providers.includes('discord') && typeof um.full_name === 'string'
            ? um.full_name
            : providers.includes('discord') && typeof um.name === 'string'
            ? um.name
            : '';

        authMetaProfile = {
          displayName:
            typeof um.rs_display_name === 'string' && um.rs_display_name
              ? um.rs_display_name
              : typeof um.full_name === 'string' && um.full_name
              ? um.full_name
              : fallbackName,
          username:
            typeof um.username === 'string' && um.username
              ? um.username
              : fallbackName.toLowerCase().replace(/[^a-z0-9._-]/g, ''),
          avatarUrl: rawAvatar,
          discordHandle,
          discordId:
            typeof um.provider_id === 'string' && providers.includes('discord')
              ? um.provider_id
              : null,
          serverName: typeof um.rs_server_name === 'string' ? um.rs_server_name : '',
          bio: typeof um.rs_bio === 'string' ? um.rs_bio : '',
          preferredLocale:
            um.rs_locale === 'en' || um.rs_locale === 'ru' || um.rs_locale === 'fr'
              ? um.rs_locale
              : 'tr',
        };
      }

      if (!tableErr && row) {
        return {
          storageBackend: 'supabase-table',
          profile: {
            userId: sessionUser.id,
            email: sessionUser.email || authUser?.email || '',
            displayName: row.display_name || authMetaProfile?.displayName || fallbackName,
            username: row.username || authMetaProfile?.username || fallbackName,
            avatarUrl: row.avatar_url ?? authMetaProfile?.avatarUrl ?? null,
            discordHandle: row.discord_handle || authMetaProfile?.discordHandle || '',
            discordId: row.discord_id || authMetaProfile?.discordId || null,
            authProviders:
              Array.isArray(row.auth_providers) && row.auth_providers.length > 0
                ? row.auth_providers
                : providers,
            serverName: row.server_name || '',
            bio: row.bio || '',
            preferredLocale:
              row.preferred_locale === 'en' ||
              row.preferred_locale === 'ru' ||
              row.preferred_locale === 'fr'
                ? row.preferred_locale
                : 'tr',
            isGuest,
            updatedAt: row.updated_at || new Date().toISOString(),
          },
        };
      }

      if (authMetaProfile) {
        return {
          storageBackend: 'supabase-meta',
          profile: {
            userId: sessionUser.id,
            email: sessionUser.email || authUser?.email || '',
            displayName: authMetaProfile.displayName || fallbackName,
            username: authMetaProfile.username || fallbackName,
            avatarUrl: authMetaProfile.avatarUrl ?? null,
            discordHandle: authMetaProfile.discordHandle || '',
            discordId: authMetaProfile.discordId ?? null,
            authProviders: providers,
            serverName: authMetaProfile.serverName || '',
            bio: authMetaProfile.bio || '',
            preferredLocale: authMetaProfile.preferredLocale || 'tr',
            isGuest,
            updatedAt: new Date().toISOString(),
          },
        };
      }
    } catch {
      // Fallback cleanly to local profile store
    }
  }

  const map = await readLocalProfilesMap();
  const localHit = map[sessionUser.id];
  if (localHit) {
    return {
      storageBackend: process.env.VERCEL === '1' ? 'memory-only' : 'local-file',
      profile: localHit,
    };
  }

  return {
    storageBackend: process.env.VERCEL === '1' ? 'memory-only' : 'local-file',
    profile: {
      userId: sessionUser.id,
      email: sessionUser.email || '',
      displayName: fallbackName,
      username: fallbackName.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'uye',
      avatarUrl: null,
      discordHandle: '',
      discordId: null,
      authProviders: providers,
      serverName: '',
      bio: '',
      preferredLocale: 'tr',
      isGuest,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function updateUserProfile(
  sessionUser: { id: string; email?: string; name?: string },
  patch: {
    displayName: string;
    username?: string;
    discordHandle?: string;
    serverName?: string;
    bio?: string;
    preferredLocale?: Locale;
    avatarUrl?: string | null;
  }
): Promise<{
  profile: UserProfileRecord;
  persistent: boolean;
}> {
  const current = await getUserProfile(sessionUser);
  const nowIso = new Date().toISOString();

  const updated: UserProfileRecord = {
    ...current.profile,
    displayName: patch.displayName,
    username: patch.username || current.profile.username,
    discordHandle: patch.discordHandle ?? current.profile.discordHandle,
    serverName: patch.serverName ?? current.profile.serverName,
    bio: patch.bio ?? current.profile.bio,
    preferredLocale: patch.preferredLocale ?? current.profile.preferredLocale,
    avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : current.profile.avatarUrl,
    updatedAt: nowIso,
  };

  let persistent = false;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createAdminSupabase();
      const { error: upsertErr } = await adminSupabase.from('user_profiles').upsert({
        user_id: updated.userId,
        display_name: updated.displayName,
        username: updated.username,
        avatar_url: updated.avatarUrl,
        discord_handle: updated.discordHandle,
        discord_id: updated.discordId,
        auth_providers: updated.authProviders,
        server_name: updated.serverName,
        bio: updated.bio,
        preferred_locale: updated.preferredLocale,
        updated_at: nowIso,
      });

      const { data: existingAuth } = await adminSupabase.auth.admin.getUserById(updated.userId);
      const prevMeta = existingAuth?.user?.user_metadata || {};
      await adminSupabase.auth.admin.updateUserById(updated.userId, {
        user_metadata: {
          ...prevMeta,
          username: updated.username,
          rs_display_name: updated.displayName,
          rs_avatar_url: updated.avatarUrl,
          rs_discord_handle: updated.discordHandle,
          rs_server_name: updated.serverName,
          rs_bio: updated.bio,
          rs_locale: updated.preferredLocale,
        },
      });
      if (!upsertErr || existingAuth?.user) {
        persistent = true;
      }
    } catch {
      // Fall through to local store
    }
  }

  const map = await readLocalProfilesMap();
  map[updated.userId] = updated;
  await writeLocalProfilesMap(map);

  return {
    profile: updated,
    persistent: persistent || process.env.VERCEL !== '1',
  };
}

export async function syncProfileFromOAuth(params: {
  userId: string;
  email?: string;
  provider: 'google' | 'discord' | 'email';
  displayName: string;
  avatarUrl?: string | null;
  discordHandle?: string;
  discordId?: string | null;
}): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const adminSupabase = createAdminSupabase();
    const { data: existing } = await adminSupabase
      .from('user_profiles')
      .select('display_name, avatar_url, discord_handle, discord_id, auth_providers')
      .eq('user_id', params.userId)
      .maybeSingle();

    const prevProviders = Array.isArray(existing?.auth_providers)
      ? existing.auth_providers
      : [];
    const nextProviders = Array.from(new Set([...prevProviders, params.provider]));

    await adminSupabase.from('user_profiles').upsert({
      user_id: params.userId,
      display_name: existing?.display_name || params.displayName,
      username: params.displayName
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '')
        .slice(0, 36),
      avatar_url: existing?.avatar_url || params.avatarUrl || null,
      discord_handle: existing?.discord_handle || params.discordHandle || '',
      discord_id: existing?.discord_id || params.discordId || null,
      auth_providers: nextProviders,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal if user_profiles table hasn't been created yet
  }
}
