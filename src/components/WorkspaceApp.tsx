'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { CapstoneExamView } from '@/components/CapstoneExamView';
import { LessonFlowView } from '@/components/LessonFlowView';
import { PersonalBoardModal } from '@/components/PersonalBoardModal';
import { RoadmapDashboard } from '@/components/RoadmapDashboard';
import { ToastContainer } from '@/components/ToastContainer';
import { TopBar } from '@/components/TopBar';
import { UtilityDrawer } from '@/components/UtilityDrawer';
import {
  SUBMODULE_MAP,
  TRACK_MAP,
  getContinueLearningTarget,
  isSubModuleUnlocked,
} from '@/data/curriculum';
import { usePomodoro } from '@/hooks/usePomodoro';
import { fetchAuthenticatedUserProfile } from '@/lib/hybridPersistence';
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  getChallengeProgress,
  hydrateBoardFromIndexedDb,
  useWorkspaceState,
  workspaceActions,
} from '@/lib/workspaceStore';
import type { SubModule, ToastItem, TrackSpec } from '@/types/curriculum';

interface WorkspaceAppProps {
  tracks: TrackSpec[];
  isPersonalBoardRoute?: boolean;
}

export function WorkspaceApp({ tracks, isPersonalBoardRoute }: WorkspaceAppProps) {
  const state = useWorkspaceState();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [boardModalOpen, setBoardModalOpen] = useState(false);

  const notify = useCallback(
    (message: string, tone: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    },
    []
  );

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    void hydrateBoardFromIndexedDb();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    void fetchAuthenticatedUserProfile().then((prof) => {
      if (prof) {
        void workspaceActions.setAuthenticatedProfile(prof);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void fetchAuthenticatedUserProfile().then((prof) => {
          if (prof) {
            void workspaceActions.setAuthenticatedProfile(prof);
          }
        });
      } else {
        void workspaceActions.switchToGuestBoard();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const { alertActive, togglePlayPause, switchMode, reset, toggleMute } =
    usePomodoro(state.pomodoro, notify);

  const activeSubModule = SUBMODULE_MAP[state.activeSubModuleId] ?? tracks[0].subModules[0];
  const activeTrack = TRACK_MAP[activeSubModule.trackId] ?? tracks[0];
  const activeProgress = getChallengeProgress(state, activeSubModule.id);
  const codeDraft = state.codeDrafts[activeSubModule.id] ?? '';
  const continueTarget = getContinueLearningTarget(
    state.challenges,
    state.activeSubModuleId
  );

  const handleOpenSubModule = (subId: string) => {
    const target = SUBMODULE_MAP[subId];
    if (!target) return;
    if (!isSubModuleUnlocked(target, state.challenges)) {
      notify(`Complete the previous module first to unlock ${target.code}.`, 'error');
      return;
    }
    workspaceActions.openSubModule(subId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLockedClick = (sub: SubModule, prev: SubModule | null) => {
    notify(
      prev
        ? `Complete Module ${prev.code} first to unlock ${sub.code}.`
        : `Module ${sub.code} is currently locked.`,
      'info'
    );
  };

  const handleToggleBookmark = (subId: string) => {
    const added = workspaceActions.toggleBookmark(subId);
    notify(added ? 'Lesson bookmarked!' : 'Bookmark removed.', 'info');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        profile={state.profile}
        isPersonalBoardRoute={isPersonalBoardRoute}
        xp={state.xp}
        streakDays={state.streakDays}
        theme={state.theme}
        pomodoro={state.pomodoro}
        drawerOpen={state.drawerOpen}
        activeView={state.activeView}
        continueLabel={
          state.xp > 0 ? `Continue (${continueTarget.code})` : 'Continue Learning'
        }
        onGoHome={() => {
          workspaceActions.goToDashboard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenBoardModal={() => setBoardModalOpen(true)}
        onContinueLearning={() => handleOpenSubModule(continueTarget.id)}
        onToggleDrawer={() => workspaceActions.openDrawer()}
        onToggleTheme={workspaceActions.toggleTheme}
      />

      <main className="flex-1">
        {state.activeView === 'dashboard' && (
          <RoadmapDashboard
            tracks={tracks}
            state={state}
            onOpenSubModule={handleOpenSubModule}
            onLockedClick={handleLockedClick}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {state.activeView !== 'dashboard' && !activeSubModule.challenge.is_final_exam && (
          <LessonFlowView
            key={activeSubModule.id}
            track={activeTrack}
            subModule={activeSubModule}
            progress={activeProgress}
            codeDraft={codeDraft}
            noteText={state.notes[activeSubModule.id] ?? ''}
            currentStep={state.lessonStepBySubId[activeSubModule.id] ?? 1}
            syntaxCheckAlreadyPassed={state.syntaxCheckPassedIds.includes(
              activeSubModule.id
            )}
            isBookmarked={state.bookmarkedIds.includes(activeSubModule.id)}
            onBackToRoadmap={() => {
              workspaceActions.goToDashboard();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSubModule={handleOpenSubModule}
            onToggleBookmark={() => handleToggleBookmark(activeSubModule.id)}
            onNotify={notify}
          />
        )}

        {state.activeView !== 'dashboard' && activeSubModule.challenge.is_final_exam && (
          <CapstoneExamView
            key={activeSubModule.id}
            track={activeTrack}
            subModule={activeSubModule}
            progress={activeProgress}
            codeDraft={codeDraft}
            state={state}
            isBookmarked={state.bookmarkedIds.includes(activeSubModule.id)}
            onBackToRoadmap={() => {
              workspaceActions.goToDashboard();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSubModule={handleOpenSubModule}
            onToggleBookmark={() => handleToggleBookmark(activeSubModule.id)}
            onNotify={notify}
          />
        )}
      </main>

      <UtilityDrawer
        open={state.drawerOpen}
        activeTab={state.activeDrawerTab}
        subModule={activeSubModule}
        state={state}
        pomodoro={state.pomodoro}
        alertActive={alertActive}
        onSelectTab={(tab) => workspaceActions.openDrawer(tab)}
        onClose={workspaceActions.closeDrawer}
        onTogglePlayPause={togglePlayPause}
        onSwitchMode={switchMode}
        onResetTimer={reset}
        onToggleMute={toggleMute}
        onNotify={notify}
      />

      <PersonalBoardModal
        open={boardModalOpen}
        state={state}
        isPersonalBoardRoute={isPersonalBoardRoute}
        onClose={() => setBoardModalOpen(false)}
        onNotify={notify}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
