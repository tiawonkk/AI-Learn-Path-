'use client';

import {
  loadArtifactBlobFromIndexedDb,
  saveArtifactBlobToIndexedDb,
} from '@/lib/boardStorage';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import type {
  CustomTaskItem,
  SubmissionRecord,
  UserBoardProfile,
} from '@/types/curriculum';

const WORKSPACE_SAVE_TIMERS = new Map<string, ReturnType<typeof setTimeout>>();

export interface EnabledAuthProviders {
  email: boolean;
  google: boolean;
  github: boolean;
}

export async function fetchEnabledAuthProviders(): Promise<EnabledAuthProviders> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { email: false, google: false, github: false };
  }
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    });
    if (!res.ok) return { email: true, google: false, github: false };
    const data = (await res.json()) as {
      external?: { email?: boolean; google?: boolean; github?: boolean };
    };
    return {
      email: Boolean(data.external?.email ?? true),
      google: Boolean(data.external?.google),
      github: Boolean(data.external?.github),
    };
  } catch {
    return { email: true, google: false, github: false };
  }
}

export async function signInWithOAuthProvider(
  provider: 'google' | 'github'
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        'Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.',
    };
  }

  // Pre-check provider status so user never lands on a raw Supabase 400 JSON error page
  const enabled = await fetchEnabledAuthProviders();
  if (!enabled[provider]) {
    const label = provider === 'google' ? 'Google' : 'GitHub';
    return {
      ok: false,
      error: `Provider ${label} belum diaktifkan di Supabase Dashboard (Authentication → Providers → ${label}). Gunakan Email & Password atau aktifkan ${label} terlebih dahulu.`,
    };
  }

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/board` : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' };
  }
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/board` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) return { ok: false, error: error.message };
  if (data.session) {
    return { ok: true, message: 'Account created and signed in!' };
  }
  return {
    ok: true,
    message: 'Check your email inbox to confirm your account, then sign in.',
  };
}

export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchAuthenticatedUserProfile(): Promise<UserBoardProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const providerRaw = user.app_metadata?.provider;
  const provider: 'google' | 'github' | 'guest' =
    providerRaw === 'google' || providerRaw === 'github' ? providerRaw : 'guest';

  let row: {
    username?: string;
    display_name?: string;
    public_board_enabled?: boolean;
    created_at?: string;
  } | null = null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, public_board_enabled, created_at')
      .eq('id', user.id)
      .maybeSingle();
    if (!error && data) {
      row = data;
    }
  } catch {
    // profiles table may not be migrated yet — gracefully fall back to auth metadata
  }

  const fallbackUsername =
    (user.user_metadata?.user_name as string | undefined) ??
    (user.email ? user.email.split('@')[0] : `learner_${user.id.slice(0, 6)}`);

  return {
    boardId: `board-${user.id}`,
    userId: user.id,
    username: row?.username || fallbackUsername,
    displayName:
      row?.display_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      fallbackUsername,
    goalLabel: '0-to-Professional AI Engineer',
    authMode: 'supabase',
    provider,
    publicBoardEnabled: Boolean(row?.public_board_enabled),
    createdAt: row?.created_at || user.created_at || new Date().toISOString(),
  };
}

export async function syncProfileToSupabase(
  profile: UserBoardProfile,
  totalXp: number,
  currentStreak: number
): Promise<void> {
  if (profile.authMode !== 'supabase' || !profile.userId) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('profiles').upsert(
      {
        id: profile.userId,
        username: profile.username,
        display_name: profile.displayName,
        total_xp: totalXp,
        current_streak: currentStreak,
        public_board_enabled: profile.publicBoardEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // Ignore cleanly if SQL migration has not been applied yet
  }
}

/**
 * Debounced auto-save for user_workspace (notes_markdown, colab_url, tasks_json).
 */
export function scheduleWorkspaceAutoSave(params: {
  profile: UserBoardProfile;
  moduleId: string;
  notesMarkdown: string;
  colabUrl: string;
  tasks: CustomTaskItem[];
}): void {
  if (params.profile.authMode !== 'supabase' || !params.profile.userId) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const key = `${params.profile.userId}:${params.moduleId}`;
  const existing = WORKSPACE_SAVE_TIMERS.get(key);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    WORKSPACE_SAVE_TIMERS.delete(key);
    await supabase.from('user_workspace').upsert(
      {
        user_id: params.profile.userId,
        module_id: params.moduleId,
        notes_markdown: params.notesMarkdown,
        colab_url: params.colabUrl,
        tasks_json: params.tasks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    );
  }, 800);

  WORKSPACE_SAVE_TIMERS.set(key, timer);
}

/**
 * Stores a submission artifact (.py, .ipynb, .csv) in:
 * - Supabase Storage private bucket `works/{user_id}/{module_id}/` + `submissions` table when signed in
 * - IndexedDB `artifacts` object store always (for instant local inspection & Guest Mode fallback)
 */
export async function persistSubmissionArtifact(
  profile: UserBoardProfile,
  record: SubmissionRecord
): Promise<SubmissionRecord> {
  const blob = new Blob([record.codeContent], { type: record.mimeType });

  // Always cache full file blob locally in IndexedDB for instant offline access
  await saveArtifactBlobToIndexedDb({
    id: record.id,
    boardId: profile.boardId,
    moduleId: record.moduleId,
    filename: record.filename,
    mimeType: record.mimeType,
    blob,
    createdAt: record.createdAt,
  });

  if (profile.authMode !== 'supabase' || !profile.userId || !isSupabaseConfigured()) {
    return record;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return record;

  const safeFilename = record.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${profile.userId}/${record.moduleId}/${Date.now()}_${safeFilename}`;

  let uploadedPath: string | undefined;
  const { error: uploadErr } = await supabase.storage
    .from('works')
    .upload(storagePath, blob, { contentType: record.mimeType, upsert: true });

  if (!uploadErr) {
    uploadedPath = storagePath;
  }

  await supabase.from('submissions').insert({
    id: record.id,
    user_id: profile.userId,
    module_id: record.moduleId,
    code_content: record.codeContent,
    file_url: uploadedPath ?? null,
    filename: record.filename,
    score: record.score,
    passed_tests: record.passedTests,
    total_tests: record.totalTests,
    execution_ms: record.executionMs,
    passed: record.passed,
    created_at: record.createdAt,
  });

  return {
    ...record,
    storagePath: uploadedPath,
    fileUrl: uploadedPath,
  };
}

/**
 * Downloads a past submission artifact from Supabase Storage (signed URL) or IndexedDB blob fallback.
 */
export async function downloadSubmissionArtifact(record: SubmissionRecord): Promise<void> {
  // Try IndexedDB blob first (instant & works offline)
  const localArtifact = await loadArtifactBlobFromIndexedDb(record.id);
  if (localArtifact?.blob) {
    const url = URL.createObjectURL(localArtifact.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  // Try Supabase signed URL if stored in private `works` bucket
  if (record.storagePath) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase.storage
        .from('works')
        .createSignedUrl(record.storagePath, 60);
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
  }

  // Fallback directly from saved codeContent
  const fallbackBlob = new Blob([record.codeContent], {
    type: record.mimeType || 'text/plain',
  });
  const url = URL.createObjectURL(fallbackBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = record.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
