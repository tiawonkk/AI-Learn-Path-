import { useSyncExternalStore } from 'react';
import {
  ALL_SUBMODULES,
  SUBMODULE_MAP,
  TRACKS,
  TRACK_MAP,
  getRankInfo,
  getTrackStats,
} from '@/data/curriculum';
import { loadBoardFromIndexedDb, saveBoardToIndexedDb } from '@/lib/boardStorage';
import {
  persistSubmissionArtifact,
  scheduleWorkspaceAutoSave,
  syncProfileToSupabase,
} from '@/lib/hybridPersistence';
import type {
  ChallengeProgress,
  CustomTaskItem,
  DrawerTab,
  JudgeExecutionResult,
  PomodoroMode,
  SubModule,
  SubmissionRecord,
  ThemeMode,
  TrackSpec,
  UserBoardProfile,
  WorkspaceState,
  WorkspaceView,
} from '@/types/curriculum';

export const STORAGE_KEY = 'ai_mastery_hub_v1';

export const POMO_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

function createDefaultProfile(): UserBoardProfile {
  return {
    boardId: 'board-guest-local',
    userId: 'guest-local',
    username: 'guest_learner',
    displayName: 'AI Learner',
    goalLabel: '0-to-Professional AI Engineer',
    authMode: 'guest',
    provider: 'guest',
    publicBoardEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function createDefaultState(): WorkspaceState {
  return {
    profile: createDefaultProfile(),
    theme: 'light',
    activeView: 'dashboard',
    activeTrackId: 'track-01',
    activeSubModuleId: '1.1',
    drawerOpen: false,
    activeDrawerTab: 'timer',
    pomodoro: {
      mode: 'focus',
      remainingSec: POMO_DURATIONS.focus,
      running: false,
      targetEndMs: null,
      sessionsCompleted: 0,
      muted: false,
    },
    xp: 0,
    streakDays: 1,
    lastActivityDate: null,
    bookmarkedIds: [],
    completedLessonIds: [],
    lessonStepBySubId: {},
    syntaxCheckPassedIds: [],
    challenges: {},
    submissionsByModule: {},
    codeDrafts: {},
    notes: {},
    tasks: {},
  };
}

const SERVER_SNAPSHOT: WorkspaceState = createDefaultState();

let clientCache: WorkspaceState | null = null;
const listeners = new Set<() => void>();

function normalizeState(parsed: Partial<WorkspaceState> | null | undefined): WorkspaceState {
  const def = createDefaultState();
  if (!parsed || typeof parsed !== 'object') return def;

  const validSub = parsed.activeSubModuleId && SUBMODULE_MAP[parsed.activeSubModuleId];
  const validTrack =
    parsed.activeTrackId && TRACK_MAP[parsed.activeTrackId]
      ? parsed.activeTrackId
      : validSub
        ? validSub.trackId
        : def.activeTrackId;

  const normalizedChallenges: Record<string, ChallengeProgress> =
    parsed.challenges && typeof parsed.challenges === 'object' ? parsed.challenges : {};

  const computedXp = Object.entries(normalizedChallenges).reduce((sum, [subId, prog]) => {
    if (prog?.solved) {
      const sub = SUBMODULE_MAP[subId];
      return sum + (prog.xpEarned || sub?.challenge.xp_reward || 0);
    }
    return sum;
  }, 0);

  const validView: WorkspaceView =
    parsed.activeView === 'lesson' || parsed.activeView === 'exam'
      ? parsed.activeView
      : 'dashboard';

  const validTab: DrawerTab =
    parsed.activeDrawerTab === 'notes' ||
    parsed.activeDrawerTab === 'tasks' ||
    parsed.activeDrawerTab === 'backup'
      ? parsed.activeDrawerTab
      : 'timer';

  return {
    ...def,
    ...parsed,
    profile: {
      ...def.profile,
      ...(parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : {}),
    },
    theme: parsed.theme === 'dark' ? 'dark' : 'light',
    activeView: validView,
    activeTrackId: validTrack,
    activeSubModuleId: validSub ? validSub.id : TRACK_MAP[validTrack].subModules[0].id,
    drawerOpen: Boolean(parsed.drawerOpen),
    activeDrawerTab: validTab,
    pomodoro: {
      ...def.pomodoro,
      ...(parsed.pomodoro || {}),
      running: false,
      targetEndMs: null,
    },
    xp: computedXp,
    streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays >= 1 ? parsed.streakDays : 1,
    lastActivityDate: typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
    bookmarkedIds: Array.isArray(parsed.bookmarkedIds) ? parsed.bookmarkedIds : [],
    completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
    lessonStepBySubId:
      parsed.lessonStepBySubId && typeof parsed.lessonStepBySubId === 'object'
        ? parsed.lessonStepBySubId
        : {},
    syntaxCheckPassedIds: Array.isArray(parsed.syntaxCheckPassedIds)
      ? parsed.syntaxCheckPassedIds
      : [],
    challenges: normalizedChallenges,
    submissionsByModule:
      parsed.submissionsByModule && typeof parsed.submissionsByModule === 'object'
        ? parsed.submissionsByModule
        : {},
    codeDrafts: parsed.codeDrafts && typeof parsed.codeDrafts === 'object' ? parsed.codeDrafts : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    tasks: parsed.tasks && typeof parsed.tasks === 'object' ? parsed.tasks : {},
  };
}

function readFromStorage(): WorkspaceState {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw) as Partial<WorkspaceState>);
  } catch {
    return createDefaultState();
  }
}

function getClientSnapshot(): WorkspaceState {
  if (!clientCache) {
    clientCache = readFromStorage();
  }
  return clientCache;
}

function getServerSnapshot(): WorkspaceState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commitState(next: WorkspaceState): void {
  clientCache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors cleanly
    }
    void saveBoardToIndexedDb(next.profile.boardId, next);
    document.documentElement.setAttribute('data-theme', next.theme);
  }
  listeners.forEach((fn) => fn());
}

export async function hydrateBoardFromIndexedDb(): Promise<void> {
  if (typeof window === 'undefined') return;
  const cur = getClientSnapshot();
  const idbState = await loadBoardFromIndexedDb<Partial<WorkspaceState>>(cur.profile.boardId);
  if (!idbState) {
    void saveBoardToIndexedDb(cur.profile.boardId, cur);
    return;
  }
  const hasLocalProgress =
    Object.keys(cur.challenges).length > 0 || Object.keys(cur.notes).length > 0;
  const normalizedIdb = normalizeState(idbState);
  const hasIdbProgress =
    Object.keys(normalizedIdb.challenges).length > 0 ||
    Object.keys(normalizedIdb.notes).length > 0;

  if (!hasLocalProgress && hasIdbProgress) {
    commitState(normalizedIdb);
  }
}

function getNextStreak(cur: WorkspaceState): { streakDays: number; lastActivityDate: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!cur.lastActivityDate) {
    return { streakDays: Math.max(1, cur.streakDays), lastActivityDate: today };
  }
  if (cur.lastActivityDate === today) {
    return { streakDays: cur.streakDays, lastActivityDate: today };
  }
  const prevMs = new Date(`${cur.lastActivityDate}T00:00:00Z`).getTime();
  const todayMs = new Date(`${today}T00:00:00Z`).getTime();
  const diffDays = Math.round((todayMs - prevMs) / 86400000);
  return {
    streakDays: diffDays === 1 ? cur.streakDays + 1 : 1,
    lastActivityDate: today,
  };
}

export function useWorkspaceState(): WorkspaceState {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function getTasksForSubModule(
  state: WorkspaceState,
  sub: SubModule
): CustomTaskItem[] {
  const existing = state.tasks[sub.id];
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  return sub.challenge.default_tasks.map((text, idx) => ({
    id: `${sub.id}-default-${idx}`,
    text,
    done: false,
    isDefault: true,
  }));
}

export function getChallengeProgress(
  state: WorkspaceState,
  subId: string
): ChallengeProgress {
  return (
    state.challenges[subId] ?? {
      solved: false,
      bestScore: 0,
      attempts: 0,
      xpEarned: 0,
      colabUrl: '',
    }
  );
}

export const workspaceActions = {
  updateUserProfile(
    partial: Partial<
      Pick<UserBoardProfile, 'displayName' | 'username' | 'goalLabel' | 'publicBoardEnabled'>
    >
  ) {
    const cur = getClientSnapshot();
    const nextProfile: UserBoardProfile = {
      ...cur.profile,
      displayName: (partial.displayName ?? cur.profile.displayName).trim() || 'AI Learner',
      username: (partial.username ?? cur.profile.username).trim() || 'guest_learner',
      goalLabel:
        (partial.goalLabel ?? cur.profile.goalLabel).trim() ||
        '0-to-Professional AI Engineer',
      publicBoardEnabled:
        typeof partial.publicBoardEnabled === 'boolean'
          ? partial.publicBoardEnabled
          : cur.profile.publicBoardEnabled,
    };
    commitState({ ...cur, profile: nextProfile });
    void syncProfileToSupabase(nextProfile, cur.xp, cur.streakDays);
  },

  async setAuthenticatedProfile(profile: UserBoardProfile) {
    const cur = getClientSnapshot();
    const savedBoard = await loadBoardFromIndexedDb<Partial<WorkspaceState>>(profile.boardId);
    if (savedBoard) {
      const merged = normalizeState({ ...savedBoard, profile });
      commitState(merged);
      void syncProfileToSupabase(profile, merged.xp, merged.streakDays);
    } else {
      const next = { ...cur, profile };
      commitState(next);
      void syncProfileToSupabase(profile, next.xp, next.streakDays);
    }
  },

  async switchToGuestBoard() {
    const guestProfile = createDefaultProfile();
    const savedGuest = await loadBoardFromIndexedDb<Partial<WorkspaceState>>(guestProfile.boardId);
    if (savedGuest) {
      commitState(normalizeState({ ...savedGuest, profile: guestProfile }));
    } else {
      const cur = getClientSnapshot();
      commitState({ ...cur, profile: guestProfile });
    }
  },

  setTheme(theme: ThemeMode) {
    const cur = getClientSnapshot();
    commitState({ ...cur, theme });
  },

  toggleTheme() {
    const cur = getClientSnapshot();
    commitState({ ...cur, theme: cur.theme === 'dark' ? 'light' : 'dark' });
  },

  goToDashboard() {
    const cur = getClientSnapshot();
    commitState({ ...cur, activeView: 'dashboard' });
  },

  abandonUnfinishedLesson(subModuleId: string) {
    const cur = getClientSnapshot();
    const isSolved = Boolean(cur.challenges[subModuleId]?.solved);
    if (isSolved) {
      commitState({ ...cur, activeView: 'dashboard' });
      return;
    }

    const nextSteps = { ...cur.lessonStepBySubId };
    delete nextSteps[subModuleId];

    const nextDrafts = { ...cur.codeDrafts };
    delete nextDrafts[subModuleId];

    const nextSyntaxPassed = cur.syntaxCheckPassedIds.filter(
      (id) => id !== subModuleId
    );

    commitState({
      ...cur,
      activeView: 'dashboard',
      lessonStepBySubId: nextSteps,
      codeDrafts: nextDrafts,
      syntaxCheckPassedIds: nextSyntaxPassed,
    });
  },

  openSubModule(subModuleId: string, step?: number) {
    const sub = SUBMODULE_MAP[subModuleId];
    if (!sub) return;
    const cur = getClientSnapshot();
    const view: WorkspaceView = sub.challenge.is_final_exam ? 'exam' : 'lesson';
    const isSolved = Boolean(cur.challenges[sub.id]?.solved);
    const nextSteps =
      typeof step === 'number'
        ? { ...cur.lessonStepBySubId, [sub.id]: step }
        : !isSolved
          ? { ...cur.lessonStepBySubId, [sub.id]: 1 }
          : cur.lessonStepBySubId;
    commitState({
      ...cur,
      activeView: view,
      activeTrackId: sub.trackId,
      activeSubModuleId: sub.id,
      lessonStepBySubId: nextSteps,
    });
  },

  setLessonStep(subModuleId: string, step: number) {
    const cur = getClientSnapshot();
    const clamped = Math.max(1, Math.min(4, step));
    commitState({
      ...cur,
      lessonStepBySubId: { ...cur.lessonStepBySubId, [subModuleId]: clamped },
    });
  },

  markSyntaxCheckPassed(subModuleId: string) {
    const cur = getClientSnapshot();
    if (cur.syntaxCheckPassedIds.includes(subModuleId)) return;
    commitState({
      ...cur,
      syntaxCheckPassedIds: [...cur.syntaxCheckPassedIds, subModuleId],
    });
  },

  markLessonCompleted(subModuleId: string) {
    const cur = getClientSnapshot();
    const streak = getNextStreak(cur);
    const nextCompleted = cur.completedLessonIds.includes(subModuleId)
      ? cur.completedLessonIds
      : [...cur.completedLessonIds, subModuleId];
    commitState({
      ...cur,
      completedLessonIds: nextCompleted,
      streakDays: streak.streakDays,
      lastActivityDate: streak.lastActivityDate,
    });
  },

  toggleBookmark(subModuleId: string): boolean {
    const cur = getClientSnapshot();
    const exists = cur.bookmarkedIds.includes(subModuleId);
    const nextBookmarks = exists
      ? cur.bookmarkedIds.filter((id) => id !== subModuleId)
      : [...cur.bookmarkedIds, subModuleId];
    commitState({ ...cur, bookmarkedIds: nextBookmarks });
    return !exists;
  },

  openDrawer(tab?: DrawerTab) {
    const cur = getClientSnapshot();
    if (cur.drawerOpen && tab && cur.activeDrawerTab === tab) {
      commitState({ ...cur, drawerOpen: false });
      return;
    }
    commitState({
      ...cur,
      drawerOpen: true,
      activeDrawerTab: tab ?? cur.activeDrawerTab,
    });
  },

  closeDrawer() {
    const cur = getClientSnapshot();
    commitState({ ...cur, drawerOpen: false });
  },

  setCodeDraft(subModuleId: string, code: string) {
    const cur = getClientSnapshot();
    commitState({
      ...cur,
      codeDrafts: { ...cur.codeDrafts, [subModuleId]: code },
    });
  },

  resetCodeDraft(sub: SubModule) {
    const cur = getClientSnapshot();
    const nextDrafts = { ...cur.codeDrafts };
    delete nextDrafts[sub.id];
    commitState({ ...cur, codeDrafts: nextDrafts });
  },

  setNote(subModuleId: string, text: string) {
    const cur = getClientSnapshot();
    const next = {
      ...cur,
      notes: { ...cur.notes, [subModuleId]: text },
    };
    commitState(next);
    const sub = SUBMODULE_MAP[subModuleId];
    if (sub) {
      scheduleWorkspaceAutoSave({
        profile: next.profile,
        moduleId: subModuleId,
        notesMarkdown: text,
        colabUrl: getChallengeProgress(next, subModuleId).colabUrl,
        tasks: getTasksForSubModule(next, sub),
      });
    }
  },

  setColabUrl(subModuleId: string, colabUrl: string) {
    const cur = getClientSnapshot();
    const prev = getChallengeProgress(cur, subModuleId);
    const next = {
      ...cur,
      challenges: {
        ...cur.challenges,
        [subModuleId]: { ...prev, colabUrl },
      },
    };
    commitState(next);
    const sub = SUBMODULE_MAP[subModuleId];
    if (sub) {
      scheduleWorkspaceAutoSave({
        profile: next.profile,
        moduleId: subModuleId,
        notesMarkdown: next.notes[subModuleId] ?? '',
        colabUrl,
        tasks: getTasksForSubModule(next, sub),
      });
    }
  },

  toggleTask(sub: SubModule, taskId: string) {
    const cur = getClientSnapshot();
    const list = getTasksForSubModule(cur, sub).map((item) =>
      item.id === taskId ? { ...item, done: !item.done } : item
    );
    const next = {
      ...cur,
      tasks: { ...cur.tasks, [sub.id]: list },
    };
    commitState(next);
    scheduleWorkspaceAutoSave({
      profile: next.profile,
      moduleId: sub.id,
      notesMarkdown: next.notes[sub.id] ?? '',
      colabUrl: getChallengeProgress(next, sub.id).colabUrl,
      tasks: list,
    });
  },

  addCustomTask(sub: SubModule, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const cur = getClientSnapshot();
    const list = getTasksForSubModule(cur, sub);
    const nextTasks: CustomTaskItem[] = [
      ...list,
      {
        id: `${sub.id}-custom-${Date.now()}`,
        text: trimmed,
        done: false,
        isDefault: false,
      },
    ];
    const next = {
      ...cur,
      tasks: { ...cur.tasks, [sub.id]: nextTasks },
    };
    commitState(next);
    scheduleWorkspaceAutoSave({
      profile: next.profile,
      moduleId: sub.id,
      notesMarkdown: next.notes[sub.id] ?? '',
      colabUrl: getChallengeProgress(next, sub.id).colabUrl,
      tasks: nextTasks,
    });
  },

  deleteCustomTask(sub: SubModule, taskId: string) {
    const cur = getClientSnapshot();
    const list = getTasksForSubModule(cur, sub).filter((item) => item.id !== taskId);
    const next = {
      ...cur,
      tasks: { ...cur.tasks, [sub.id]: list },
    };
    commitState(next);
    scheduleWorkspaceAutoSave({
      profile: next.profile,
      moduleId: sub.id,
      notesMarkdown: next.notes[sub.id] ?? '',
      colabUrl: getChallengeProgress(next, sub.id).colabUrl,
      tasks: list,
    });
  },

  recordJudgeSubmission(
    sub: SubModule,
    result: JudgeExecutionResult,
    submittedContent?: string,
    submittedFilename?: string
  ): { newlySolved: boolean; xpDelta: number } {
    if (result.runKind !== 'submit') {
      return { newlySolved: false, xpDelta: 0 };
    }
    const cur = getClientSnapshot();
    const prev = getChallengeProgress(cur, sub.id);
    const wasSolved = prev.solved;
    const nowSolved = wasSolved || result.passed;
    const xpDelta = !wasSolved && result.passed ? sub.challenge.xp_reward : 0;
    const nextXpEarned = nowSolved ? prev.xpEarned || sub.challenge.xp_reward : 0;

    const streak = result.passed
      ? getNextStreak(cur)
      : { streakDays: cur.streakDays, lastActivityDate: cur.lastActivityDate };

    const allTests = [...result.sampleResults, ...result.hiddenResults];
    const passedTests = allTests.filter((t) => t.passed).length;
    const totalTests = Math.max(allTests.length, 1);

    const ext =
      sub.challenge.validation_mode === 'py_unit_test'
        ? '.py'
        : sub.challenge.validation_mode === 'csv_metric_eval'
          ? '.csv'
          : '.ipynb';
    const mimeType =
      ext === '.py'
        ? 'text/x-python'
        : ext === '.csv'
          ? 'text/csv'
          : 'application/x-ipynb+json';
    const safeFilename =
      submittedFilename ||
      result.submittedFilename ||
      `solution_${sub.id.replace('.', '_')}${ext}`;

    const submissionId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newRecord: SubmissionRecord = {
      id: submissionId,
      userId: cur.profile.userId || 'guest-local',
      moduleId: sub.id,
      filename: safeFilename,
      mimeType,
      codeContent: submittedContent ?? cur.codeDrafts[sub.id] ?? sub.challenge.starter_code,
      score: result.score,
      scoreLabel: result.scoreLabel,
      passed: result.passed,
      passedTests,
      totalTests,
      executionMs: result.durationMs,
      createdAt: result.timestamp,
    };

    const existingHistory = cur.submissionsByModule[sub.id] ?? [];
    const nextHistory = [newRecord, ...existingHistory].slice(0, 25);

    const nextChallenges: Record<string, ChallengeProgress> = {
      ...cur.challenges,
      [sub.id]: {
        ...prev,
        solved: nowSolved,
        bestScore: Math.max(prev.bestScore, result.score),
        attempts: prev.attempts + 1,
        xpEarned: nextXpEarned,
        lastSubmittedAt: result.timestamp,
        lastExecutionMs: result.durationMs,
        submittedFilename: result.submittedFilename ?? prev.submittedFilename,
        lastSummary: result.scoreLabel,
      },
    };

    const nextCompleted =
      result.passed && sub.challenge.is_final_exam && !cur.completedLessonIds.includes(sub.id)
        ? [...cur.completedLessonIds, sub.id]
        : cur.completedLessonIds;

    const nextXpTotal = cur.xp + xpDelta;
    commitState({
      ...cur,
      xp: nextXpTotal,
      streakDays: streak.streakDays,
      lastActivityDate: streak.lastActivityDate,
      completedLessonIds: nextCompleted,
      challenges: nextChallenges,
      submissionsByModule: {
        ...cur.submissionsByModule,
        [sub.id]: nextHistory,
      },
    });

    // Persist file artifact to IndexedDB + Supabase Storage `works/{user_id}/{module_id}/`
    void persistSubmissionArtifact(cur.profile, newRecord).then((saved) => {
      if (saved.storagePath) {
        const latest = getClientSnapshot();
        const modList = latest.submissionsByModule[sub.id] ?? [];
        const updatedList = modList.map((item) =>
          item.id === saved.id ? saved : item
        );
        commitState({
          ...latest,
          submissionsByModule: {
            ...latest.submissionsByModule,
            [sub.id]: updatedList,
          },
        });
      }
    });

    void syncProfileToSupabase(cur.profile, nextXpTotal, streak.streakDays);

    return { newlySolved: !wasSolved && result.passed, xpDelta };
  },

  updatePomodoro(patch: Partial<WorkspaceState['pomodoro']>) {
    const cur = getClientSnapshot();
    commitState({
      ...cur,
      pomodoro: { ...cur.pomodoro, ...patch },
    });
  },

  importSnapshot(rawState: Partial<WorkspaceState>) {
    commitState(normalizeState(rawState));
  },

  resetAll() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    commitState(createDefaultState());
  },
};

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildJsonBackup(state: WorkspaceState): string {
  return JSON.stringify(
    {
      app: 'AI Mastery Hub',
      version: 2,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2
  );
}

export function buildTrackResumeMarkdown(track: TrackSpec, state: WorkspaceState): string {
  const tStats = getTrackStats(track, state.challenges);
  const rank = getRankInfo(state.xp);
  const lines: string[] = [
    `# Track ${track.shortLabel}: ${track.name} — Completion Summary`,
    `- **Certificate:** ${track.module_wrapup.certificate_title}`,
    `- **Learner Level:** ${rank.rank} (${rank.title}) — ${state.xp} Total XP`,
    `- **Track Completion:** ${tStats.solved}/${tStats.total} modules (${tStats.pct}%)`,
    `- **Exported:** ${new Date().toISOString()}`,
    '',
    '## Key Takeaways',
    ...track.module_wrapup.key_takeaways.map((item) => `- ${item}`),
    '',
    '## Quick Reference Summary',
    `| ${track.module_wrapup.quick_reference_headers.join(' | ')} |`,
    `| ${track.module_wrapup.quick_reference_headers.map(() => '---').join(' | ')} |`,
    ...track.module_wrapup.quick_reference_rows.map((row) => `| ${row.join(' | ')} |`),
    '',
    '## Personal Study Notes & Progress',
  ];

  for (const sub of track.subModules) {
    const ch = getChallengeProgress(state, sub.id);
    const note = (state.notes[sub.id] ?? '').trim();
    lines.push(`### Module ${sub.code}: ${sub.title}`);
    lines.push(
      `- Status: ${ch.solved ? `Completed (${ch.lastSummary || `${ch.bestScore}%`})` : 'In Progress'} | XP: ${ch.xpEarned}`
    );
    if (ch.colabUrl.trim()) {
      lines.push(`- Colab Notebook: ${ch.colabUrl.trim()}`);
    }
    if (note) {
      lines.push('- **Study Notes:**');
      lines.push(note);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function buildFullPortfolioMarkdown(state: WorkspaceState): string {
  const rank = getRankInfo(state.xp);
  const solvedTotal = ALL_SUBMODULES.filter((s) => state.challenges[s.id]?.solved).length;
  const lines: string[] = [
    '# AI Mastery Hub — Study Portfolio & Notes',
    `- **Exported:** ${new Date().toISOString()}`,
    `- **Total XP:** ${state.xp} XP | **Streak:** ${state.streakDays} day(s) | **Rank:** ${rank.rank} (${rank.title})`,
    `- **Completed Modules:** ${solvedTotal}/${ALL_SUBMODULES.length}`,
    `- **Pomodoro Focus Sessions:** ${state.pomodoro.sessionsCompleted}`,
    '',
  ];

  for (const track of TRACKS) {
    lines.push(buildTrackResumeMarkdown(track, state));
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
