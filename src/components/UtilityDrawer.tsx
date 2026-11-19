'use client';

import { useState } from 'react';
import {
  Check,
  CheckSquare,
  Download,
  Eye,
  FileJson,
  FileText,
  NotebookPen,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { formatClock } from '@/hooks/usePomodoro';
import { getBoardSyncCapabilities } from '@/lib/boardStorage';
import {
  POMO_DURATIONS,
  buildFullPortfolioMarkdown,
  buildJsonBackup,
  downloadTextFile,
  getTasksForSubModule,
  workspaceActions,
} from '@/lib/workspaceStore';
import type {
  DrawerTab,
  PomodoroMode,
  PomodoroState,
  SubModule,
  WorkspaceState,
} from '@/types/curriculum';

interface UtilityDrawerProps {
  open: boolean;
  activeTab: DrawerTab;
  subModule: SubModule;
  state: WorkspaceState;
  pomodoro: PomodoroState;
  alertActive: boolean;
  onSelectTab: (tab: DrawerTab) => void;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  onResetTimer: () => void;
  onToggleMute: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void;
}

export function UtilityDrawer({
  open,
  activeTab,
  subModule,
  state,
  pomodoro,
  alertActive,
  onSelectTab,
  onClose,
  onTogglePlayPause,
  onSwitchMode,
  onResetTimer,
  onToggleMute,
  onNotify,
}: UtilityDrawerProps) {
  const [notePreview, setNotePreview] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  if (!open) return null;

  const tasks = getTasksForSubModule(state, subModule);
  const noteText = state.notes[subModule.id] ?? '';

  // Circular Pomodoro SVG ring math
  const totalDur = POMO_DURATIONS[pomodoro.mode];
  const pct = Math.max(0, Math.min(1, pomodoro.remainingSec / totalDur));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  const tabs: Array<{ id: DrawerTab; label: string; icon: typeof Timer }> = [
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'backup', label: 'Export', icon: Download },
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    workspaceActions.addCustomTask(subModule, newTaskText);
    setNewTaskText('');
  };

  const handleExportModuleNoteMd = () => {
    const content = [
      `# Module ${subModule.code}: ${subModule.title} — Study Notes`,
      `Exported: ${new Date().toISOString()}`,
      '',
      noteText.trim() || '_No notes recorded yet._',
      '',
      '## Key Takeaways',
      ...subModule.summary.key_takeaways.map((k) => `- ${k}`),
    ].join('\n');
    downloadTextFile(
      `module-${subModule.code}-notes.md`,
      content,
      'text/markdown'
    );
    onNotify(`Exported module-${subModule.code}-notes.md!`, 'success');
  };

  const handleExportPortfolioMd = () => {
    const dateSlug = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `ai-mastery-notes-${dateSlug}.md`,
      buildFullPortfolioMarkdown(state),
      'text/markdown'
    );
    onNotify('Exported full study notes (.MD)!', 'success');
  };

  const handleExportJson = () => {
    const dateSlug = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `ai-mastery-backup-${dateSlug}.json`,
      buildJsonBackup(state),
      'application/json'
    );
    onNotify('Exported progress backup (.JSON)!', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = (parsed?.state ?? parsed) as Partial<WorkspaceState>;
        if (!imported || typeof imported !== 'object' || !imported.challenges) {
          throw new Error('Invalid JSON');
        }
        workspaceActions.importSnapshot(imported);
        onNotify('Restored workspace progress!', 'success');
      } catch {
        onNotify('Invalid .JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-label="Study Tools Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-gentle-fade flex h-full w-full max-w-[420px] flex-col border-l border-border-soft bg-surface shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-text-main">Study Tools</h2>
            <p className="font-mono text-[11px] text-text-muted">
              Linked to Module {subModule.code}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close study tools drawer"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface-subtle text-text-sub hover:text-text-main"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pill Tabs */}
        <div className="grid grid-cols-4 gap-1.5 border-b border-border-soft bg-surface-subtle p-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-text-sub hover:bg-surface hover:text-text-main'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. Circular Pomodoro Timer */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <div
                className={`flex flex-col items-center rounded-2xl border p-6 text-center transition-colors ${
                  alertActive
                    ? 'border-plum bg-lavender-soft'
                    : 'border-border-soft bg-surface-subtle'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-border-soft"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke={pomodoro.mode === 'focus' ? '#532B71' : '#FACF4E'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="font-mono text-3xl font-bold tracking-tight text-text-main">
                      {formatClock(pomodoro.remainingSec)}
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      {pomodoro.mode === 'focus'
                        ? 'Focus'
                        : pomodoro.mode === 'short'
                          ? 'Short Break'
                          : 'Long Break'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-full bg-surface px-3 py-1 font-mono text-xs font-semibold text-text-sub">
                  Sessions completed: {pomodoro.sessionsCompleted}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'focus', label: '25m Focus' },
                  { id: 'short', label: '5m Break' },
                  { id: 'long', label: '15m Rest' },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSwitchMode(m.id)}
                    className={`cursor-pointer rounded-full py-2 text-xs font-semibold transition-colors ${
                      pomodoro.mode === m.id
                        ? 'bg-brand-soft text-brand'
                        : 'border border-border-soft bg-surface text-text-sub hover:border-border-strong'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  {pomodoro.running ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Start Timer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onResetTimer}
                  title="Reset timer"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface text-text-sub hover:text-text-main"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onToggleMute}
                  title={pomodoro.muted ? 'Unmute chime' : 'Mute chime'}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface text-text-sub hover:text-text-main"
                >
                  {pomodoro.muted ? (
                    <VolumeX className="h-4 w-4 text-[#F19BB6]" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. Smart Study Notes */}
          {activeTab === 'notes' && (
            <div className="flex h-full flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-text-main">
                  Module {subModule.code} Notes
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNotePreview(false)}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      !notePreview
                        ? 'bg-brand-soft text-brand'
                        : 'bg-surface-pill text-text-sub'
                    }`}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotePreview(true)}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      notePreview
                        ? 'bg-brand-soft text-brand'
                        : 'bg-surface-pill text-text-sub'
                    }`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>

              {notePreview ? (
                <div className="min-h-[260px] rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <MarkdownPreview source={noteText} />
                </div>
              ) : (
                <textarea
                  value={noteText}
                  onChange={(e) => workspaceActions.setNote(subModule.id, e.target.value)}
                  rows={12}
                  placeholder={`Jot down Markdown study notes for Module ${subModule.code}...`}
                  className="w-full flex-1 resize-y rounded-2xl border border-border-soft bg-surface-subtle p-4 font-mono text-xs leading-relaxed text-text-main outline-none focus:border-brand focus:bg-surface"
                />
              )}

              <button
                type="button"
                onClick={handleExportModuleNoteMd}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface py-2.5 text-xs font-bold text-text-main transition-colors hover:border-brand hover:text-brand"
              >
                <Download className="h-3.5 w-3.5" />
                Export Module {subModule.code} Notes (.MD)
              </button>
            </div>
          )}

          {/* 3. Study Task Checklist */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-text-muted">
                Module {subModule.code} Goals ({tasks.filter((t) => t.done).length}/
                {tasks.length} done)
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add personal goal or Colab task..."
                  className="flex-1 rounded-full border border-border-soft bg-surface-subtle px-3.5 py-2 text-xs text-text-main outline-none focus:border-brand focus:bg-surface"
                />
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </form>

              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`flex items-start justify-between gap-2.5 rounded-xl border p-3 transition-colors ${
                      task.done
                        ? 'border-plum/30 bg-lavender-soft'
                        : 'border-border-soft bg-surface-subtle'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => workspaceActions.toggleTask(subModule, task.id)}
                      className="flex flex-1 cursor-pointer items-start gap-2.5 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          task.done
                            ? 'border-[#532B71] bg-[#532B71] text-white'
                            : 'border-border-strong bg-surface'
                        }`}
                      >
                        {task.done && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span
                        className={`text-xs leading-snug ${
                          task.done
                            ? 'text-text-muted line-through'
                            : 'font-medium text-text-main'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>

                    {!task.isDefault && (
                      <button
                        type="button"
                        onClick={() => workspaceActions.deleteCustomTask(subModule, task.id)}
                        aria-label="Delete custom task"
                        className="cursor-pointer p-0.5 text-text-muted hover:text-[#F19BB6]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Personal Board & Full Export */}
          {activeTab === 'backup' && (
            <div className="space-y-3">
              {/* 1-User = 1-Personal-Board Profile Card */}
              <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-main">1-User Personal Board</span>
                  <span className="rounded-full bg-lavender-soft px-2.5 py-0.5 font-mono text-[10px] font-bold text-plum">
                    {state.profile.boardId}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-text-muted">
                    Learner Name
                  </label>
                  <input
                    type="text"
                    value={state.profile.displayName}
                    onChange={(e) =>
                      workspaceActions.updateUserProfile({ displayName: e.target.value })
                    }
                    className="w-full rounded-xl border border-border-soft bg-surface px-3 py-1.5 text-xs text-text-main outline-none focus:border-plum"
                  />
                </div>
                <p className="font-mono text-[10.5px] text-text-muted">
                  Sync: {getBoardSyncCapabilities().modeLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportPortfolioMd}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle p-4 text-left transition-colors hover:border-plum"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-soft text-plum">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-text-main">
                    Export Study Notes &amp; Progress (.MD)
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Combines takeaways and all personal notes into Markdown.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle p-4 text-left transition-colors hover:border-plum"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sunshine-soft text-text-main">
                  <FileJson className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-text-main">
                    Download Full Backup (.JSON)
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Save complete XP, progress, and drafts for restore.
                  </div>
                </div>
              </button>

              <label className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle p-4 text-left transition-colors hover:border-plum">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-soft text-text-main">
                  <Upload className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-text-main">
                    Restore from Backup (.JSON)
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Load previously saved progress snapshot.
                  </div>
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Reset all XP, unlocked modules, notes, and drafts in this browser?'
                    )
                  ) {
                    workspaceActions.resetAll();
                    onNotify('Workspace progress reset.', 'info');
                  }
                }}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#F19BB6] bg-rose-soft py-2.5 text-xs font-semibold text-text-main transition-colors hover:opacity-90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Workspace Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
