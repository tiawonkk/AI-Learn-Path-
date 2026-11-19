'use client';

import {
  ArrowRight,
  Cloud,
  Flame,
  GraduationCap,
  HardDrive,
  Moon,
  PanelRightOpen,
  Sun,
  Zap,
} from 'lucide-react';
import { formatClock } from '@/hooks/usePomodoro';
import type {
  PomodoroState,
  ThemeMode,
  UserBoardProfile,
  WorkspaceView,
} from '@/types/curriculum';

interface TopBarProps {
  profile: UserBoardProfile;
  isPersonalBoardRoute?: boolean;
  xp: number;
  streakDays: number;
  theme: ThemeMode;
  pomodoro: PomodoroState;
  drawerOpen: boolean;
  activeView: WorkspaceView;
  continueLabel: string;
  onGoHome: () => void;
  onOpenBoardModal: () => void;
  onContinueLearning: () => void;
  onToggleDrawer: () => void;
  onToggleTheme: () => void;
}

export function TopBar({
  profile,
  isPersonalBoardRoute,
  xp,
  streakDays,
  theme,
  pomodoro,
  drawerOpen,
  activeView,
  continueLabel,
  onGoHome,
  onOpenBoardModal,
  onContinueLearning,
  onToggleDrawer,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        {/* Brand Title + Subtitle */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-85"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <div className="text-base font-bold tracking-tight text-text-main">
              AI Mastery Hub
            </div>
            <p className="hidden text-xs text-text-muted sm:block">
              Learn AI step-by-step from Python to Agentic AI
            </p>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1-User Personal Board Pill */}
          <button
            type="button"
            onClick={onOpenBoardModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold text-text-main transition-colors hover:border-plum"
            title="Manage Personal Learning Board & Auth"
          >
            {profile.authMode === 'supabase' ? (
              <Cloud className="h-3.5 w-3.5 text-plum" strokeWidth={2.2} />
            ) : (
              <HardDrive className="h-3.5 w-3.5 text-plum" strokeWidth={2.2} />
            )}
            <span className="max-w-[110px] truncate">{profile.displayName}</span>
            <span className="rounded-full bg-lavender-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-plum">
              {isPersonalBoardRoute
                ? '/board'
                : profile.authMode === 'supabase'
                  ? 'Cloud'
                  : 'Guest'}
            </span>
          </button>

          {/* XP & Streak Pill */}
          <div className="flex items-center gap-3 rounded-full border border-border-soft bg-surface-subtle px-3.5 py-1.5 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 text-text-main">
              <Zap className="h-3.5 w-3.5 text-[#FACF4E]" strokeWidth={2.3} />
              <span className="font-mono">{xp} XP</span>
            </span>
            <span className="h-3 w-px bg-border-strong" />
            <span className="inline-flex items-center gap-1 text-text-sub" title="Study Streak">
              <Flame className="h-3.5 w-3.5 text-[#F19BB6]" strokeWidth={2.3} />
              <span>{streakDays}d streak</span>
            </span>
          </div>

          {/* Utility Dock Toggle */}
          <button
            type="button"
            onClick={onToggleDrawer}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              drawerOpen
                ? 'border-plum bg-lavender-soft text-plum'
                : 'border-border-soft bg-surface text-text-sub hover:border-border-strong hover:text-text-main'
            }`}
          >
            <PanelRightOpen className="h-4 w-4" strokeWidth={2} />
            <span>
              {pomodoro.running
                ? `Study Tools (${formatClock(pomodoro.remainingSec)})`
                : 'Study Tools'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Charcoal Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface text-text-sub transition-colors hover:border-border-strong hover:text-text-main"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={2} />
            )}
          </button>

          {/* Primary Sunshine Yellow CTA: Continue Learning -> */}
          {activeView === 'dashboard' && (
            <button
              type="button"
              onClick={onContinueLearning}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-sunshine px-4 py-2 text-xs font-bold text-charcoal shadow-sm transition-colors hover:bg-sunshine-hover"
            >
              <span>{continueLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
