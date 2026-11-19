'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  Download,
  Sparkles,
} from 'lucide-react';
import { ChallengeWorkspaceBox } from '@/components/ChallengeWorkspaceBox';
import { ConceptVisualizer } from '@/components/ConceptVisualizer';
import { getNextSubModule, getTrackStats } from '@/data/curriculum';
import {
  buildTrackResumeMarkdown,
  downloadTextFile,
  workspaceActions,
} from '@/lib/workspaceStore';
import type {
  ChallengeProgress,
  SubModule,
  TrackSpec,
  WorkspaceState,
} from '@/types/curriculum';

interface CapstoneExamViewProps {
  track: TrackSpec;
  subModule: SubModule;
  progress: ChallengeProgress;
  codeDraft: string;
  state: WorkspaceState;
  isBookmarked: boolean;
  onBackToRoadmap: () => void;
  onOpenSubModule: (subId: string) => void;
  onToggleBookmark: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void;
}

export function CapstoneExamView({
  track,
  subModule,
  progress,
  codeDraft,
  state,
  isBookmarked,
  onBackToRoadmap,
  onOpenSubModule,
  onToggleBookmark,
  onNotify,
}: CapstoneExamViewProps) {
  const nextSub = getNextSubModule(subModule);
  const trackStats = getTrackStats(track, state.challenges);

  const handleDownloadSummary = () => {
    const md = buildTrackResumeMarkdown(track, state);
    const filename = `${track.id}-completion-summary-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    downloadTextFile(filename, md, 'text/markdown');
    onNotify(`Downloaded ${filename}!`, 'success');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-7 md:px-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToRoadmap}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            progress.solved
              ? 'border-border-soft bg-surface text-text-sub hover:border-border-strong hover:text-text-main'
              : 'border-[#F19BB6] bg-rose-soft text-text-main hover:opacity-90'
          }`}
        >
          {progress.solved ? (
            <ArrowLeft className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-[#F19BB6]" />
          )}
          <span>
            {progress.solved
              ? 'Back to Course Roadmap'
              : 'Keluar Exam (Ulang dari Awal)'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1 text-xs font-semibold text-text-main">
            <Award className="h-3.5 w-3.5 text-[#F19BB6]" />
            Capstone Assessment • Track {track.shortLabel}
          </span>
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark exam'}
            className={`cursor-pointer rounded-full border p-2 transition-colors ${
              isBookmarked
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-border-soft bg-surface text-text-muted hover:text-text-main'
            }`}
          >
            <Bookmark
              className="h-4 w-4"
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Capstone Header */}
      <header className="ed-card space-y-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              Final Module Exam ({subModule.code})
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-main">
              {subModule.title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-text-sub">
              {subModule.subtitle}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-text-sub">
          {subModule.theory.intro}
        </p>

        <ConceptVisualizer diagramId={subModule.theory.visual_diagram_id} />
      </header>

      {/* Automated Assessment Workspace */}
      <ChallengeWorkspaceBox
        key={subModule.id}
        subModule={subModule}
        progress={progress}
        codeDraft={codeDraft}
        onPassed={() => workspaceActions.markLessonCompleted(subModule.id)}
        onNotify={onNotify}
      />

      {/* Downloadable Completion Summary (Unlocked on Pass) */}
      {progress.solved && (
        <section
          aria-label="Track Completion Summary"
          className="animate-gentle-fade ed-card space-y-5 border-plum/30 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sunshine-soft px-3 py-1 text-xs font-bold text-text-main">
                <Sparkles className="h-3.5 w-3.5 text-plum" />
                Track {track.shortLabel} Complete • {trackStats.earnedXp} XP Earned
              </span>
              <h2 className="mt-2.5 text-xl font-bold text-text-main">
                {track.module_wrapup.certificate_title}
              </h2>
              <p className="mt-1 text-sm text-text-sub">
                {track.module_wrapup.certificate_subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSummary}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-sunshine px-4 py-2.5 text-xs font-bold text-charcoal transition-colors hover:bg-sunshine-hover"
            >
              <Download className="h-4 w-4" />
              <span>Download Summary (.MD)</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-subtle p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Track Key Takeaways
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-text-sub">
              {track.module_wrapup.key_takeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onBackToRoadmap}
              className="cursor-pointer rounded-full border border-border-soft bg-surface px-4 py-2 text-xs font-semibold text-text-sub hover:text-text-main"
            >
              Return to Course Roadmap
            </button>

            {nextSub && (
              <button
                type="button"
                onClick={() => onOpenSubModule(nextSub.id)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#532B71] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#44215E]"
              >
                <span>Start Next Track: {nextSub.code}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
