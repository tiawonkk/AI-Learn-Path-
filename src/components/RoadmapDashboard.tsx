'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Search,
} from 'lucide-react';
import {
  ALL_SUBMODULES,
  getPreviousSubModule,
  getTrackStats,
  isSubModuleUnlocked,
} from '@/data/curriculum';
import type {
  DifficultyLevel,
  SubModule,
  TrackId,
  TrackSpec,
  WorkspaceState,
} from '@/types/curriculum';

interface RoadmapDashboardProps {
  tracks: TrackSpec[];
  state: WorkspaceState;
  onOpenSubModule: (subId: string) => void;
  onLockedClick: (sub: SubModule, prev: SubModule | null) => void;
  onToggleBookmark: (subId: string) => void;
}

function DifficultyIndicator({ level }: { level: DifficultyLevel }) {
  const activeCount = level === 'Easy' ? 1 : level === 'Medium' ? 2 : 3;
  const barColor =
    level === 'Easy'
      ? 'bg-[#532B71] dark:bg-[#DDA9FF]'
      : level === 'Medium'
        ? 'bg-[#FACF4E]'
        : 'bg-[#F19BB6]';
  const badgeClasses =
    level === 'Easy'
      ? 'bg-lavender-soft text-plum'
      : level === 'Medium'
        ? 'bg-sunshine-soft text-text-main'
        : 'bg-rose-soft text-text-main';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses}`}
    >
      <span className="inline-flex items-end gap-0.5" aria-hidden="true">
        <span className={`w-1 rounded-full ${activeCount >= 1 ? barColor : 'bg-current opacity-25'} h-1.5`} />
        <span className={`w-1 rounded-full ${activeCount >= 2 ? barColor : 'bg-current opacity-25'} h-2.5`} />
        <span className={`w-1 rounded-full ${activeCount >= 3 ? barColor : 'bg-current opacity-25'} h-3.5`} />
      </span>
      <span>{level}</span>
    </span>
  );
}

function PillToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        checked
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-border-soft bg-surface text-text-sub hover:border-border-strong'
      }`}
    >
      <span
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-border-strong'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function RoadmapDashboard({
  tracks,
  state,
  onOpenSubModule,
  onLockedClick,
  onToggleBookmark,
}: RoadmapDashboardProps) {
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all' | TrackId>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'completed' | 'locked'>('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [examsOnly, setExamsOnly] = useState(false);

  const solvedCount = ALL_SUBMODULES.filter(
    (s) => state.challenges[s.id]?.solved
  ).length;
  const overallPct = Math.round((solvedCount / ALL_SUBMODULES.length) * 100);

  const filteredModules = ALL_SUBMODULES.filter((sub) => {
    const solved = Boolean(state.challenges[sub.id]?.solved);
    const unlocked = isSubModuleUnlocked(sub, state.challenges);
    const bookmarked = state.bookmarkedIds.includes(sub.id);

    if (trackFilter !== 'all' && sub.trackId !== trackFilter) return false;
    if (difficultyFilter !== 'all' && sub.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'completed' && !solved) return false;
    if (statusFilter === 'available' && (!unlocked || solved)) return false;
    if (statusFilter === 'locked' && unlocked) return false;
    if (hideCompleted && solved) return false;
    if (bookmarkedOnly && !bookmarked) return false;
    if (examsOnly && !sub.challenge.is_final_exam) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hay = `${sub.code} ${sub.title} ${sub.subtitle} ${sub.categoryLabel}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-7 md:px-8">
      {/* Collapsible Progress Tracker Accordion Bar */}
      <section aria-label="Course Progress Tracker" className="ed-card overflow-hidden">
        <button
          type="button"
          onClick={() => setTrackerOpen((v) => !v)}
          aria-expanded={trackerOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-hover"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-text-main">Progress Tracker</span>
            <span className="rounded-full bg-surface-pill px-3 py-0.5 font-mono text-xs font-semibold text-text-sub">
              {solvedCount}/{ALL_SUBMODULES.length} lessons completed ({overallPct}%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-2 w-36 overflow-hidden rounded-full bg-surface-pill sm:block">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            {trackerOpen ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </div>
        </button>

        {trackerOpen && (
          <div className="animate-gentle-fade grid grid-cols-1 gap-4 border-t border-border-soft px-6 py-5 sm:grid-cols-2 lg:grid-cols-5">
            {tracks.map((track) => {
              const stats = getTrackStats(track, state.challenges);
              const isSelected = trackFilter === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() =>
                    setTrackFilter((cur) => (cur === track.id ? 'all' : track.id))
                  }
                  className={`cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand-soft'
                      : 'border-border-soft bg-surface-subtle hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-text-muted">
                      TRACK {track.shortLabel}
                    </span>
                    <span className="font-mono text-xs font-bold text-text-main">
                      {stats.pct}%
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-main">{track.name}</div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-pill">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${stats.pct}%`,
                        backgroundColor: track.badgeHex,
                      }}
                    />
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] text-text-muted">
                    {stats.solved}/{stats.total} modules
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Filter & Search Bar */}
      <section aria-label="Filter and Search Lessons" className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons & challenges..."
              aria-label="Search lessons and challenges"
              className="w-full rounded-full border border-border-soft bg-surface py-2.5 pr-4 pl-10 text-sm text-text-main shadow-xs outline-none transition-colors focus:border-brand"
            />
          </div>

          {/* Track / Category Dropdown Pill */}
          <select
            aria-label="Filter by Track"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as 'all' | TrackId)}
            className="cursor-pointer rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-main outline-none hover:border-border-strong focus:border-brand"
          >
            <option value="all">All Tracks (01–05)</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortLabel} — {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown Pill */}
          <select
            aria-label="Filter by Difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as 'all' | DifficultyLevel)}
            className="cursor-pointer rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-main outline-none hover:border-border-strong focus:border-brand"
          >
            <option value="all">Difficulty: All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Dropdown Pill */}
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as 'all' | 'available' | 'completed' | 'locked'
              )
            }
            className="cursor-pointer rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-main outline-none hover:border-border-strong focus:border-brand"
          >
            <option value="all">Status: All (All Open)</option>
            <option value="available">Not Completed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Clean Pill Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <PillToggle
              label="Hide Completed"
              checked={hideCompleted}
              onChange={setHideCompleted}
            />
            <PillToggle
              label="Bookmarked"
              checked={bookmarkedOnly}
              onChange={setBookmarkedOnly}
            />
            <PillToggle
              label="Final Exams Only"
              checked={examsOnly}
              onChange={setExamsOnly}
            />
          </div>

          <span className="text-xs font-medium text-text-muted">
            Showing {filteredModules.length} of {ALL_SUBMODULES.length} lessons
          </span>
        </div>
      </section>

      {/* 3-Column Card Grid */}
      {filteredModules.length === 0 ? (
        <div className="ed-card p-10 text-center">
          <p className="text-sm font-semibold text-text-main">
            No lessons match your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTrackFilter('all');
              setDifficultyFilter('all');
              setStatusFilter('all');
              setHideCompleted(false);
              setBookmarkedOnly(false);
              setExamsOnly(false);
            }}
            className="mt-3 cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section
          aria-label="Course Roadmap Grid"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredModules.map((sub) => {
            const solved = Boolean(state.challenges[sub.id]?.solved);
            const unlocked = isSubModuleUnlocked(sub, state.challenges);
            const prevSub = getPreviousSubModule(sub);
            const isBookmarked = state.bookmarkedIds.includes(sub.id);
            const isExam = Boolean(sub.challenge.is_final_exam);

            return (
              <article
                key={sub.id}
                className={`ed-card flex flex-col justify-between p-6 ${
                  unlocked ? 'ed-card-interactive' : 'opacity-75'
                }`}
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-surface-pill px-3 py-1 text-[11px] font-semibold text-text-sub">
                        {sub.categoryLabel}
                      </span>
                      <DifficultyIndicator level={sub.difficulty} />
                      {isExam && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-soft px-2.5 py-0.5 text-[11px] font-semibold text-text-main">
                          <Award className="h-3 w-3 text-[#F19BB6]" />
                          Final Exam
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(sub.id)}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                      className={`cursor-pointer rounded-full p-1.5 transition-colors ${
                        isBookmarked
                          ? 'bg-brand-soft text-brand'
                          : 'text-text-muted hover:bg-surface-pill hover:text-text-main'
                      }`}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* Card Title & Subtitle */}
                  <h3 className="mt-4 font-mono text-[15px] font-bold leading-snug text-text-main">
                    {sub.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-muted">
                    {sub.subtitle}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-text-sub">
                      {isExam ? `Exam ${sub.code}` : `Module ${sub.code}`}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="font-mono font-semibold text-text-muted">
                      +{sub.challenge.xp_reward} XP
                    </span>
                  </div>

                  {!unlocked ? (
                    <button
                      type="button"
                      onClick={() => onLockedClick(sub, prevSub)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-surface-pill px-3 py-1.5 text-xs font-semibold text-text-muted"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Locked</span>
                    </button>
                  ) : solved ? (
                    <button
                      type="button"
                      onClick={() => onOpenSubModule(sub.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-lavender-soft px-3.5 py-1.5 text-xs font-bold text-plum transition-colors hover:opacity-90"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                      <span>Completed ✓</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenSubModule(sub.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#532B71] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#44215E]"
                    >
                      <span>{isExam ? 'Start Exam' : 'Start Lesson'}</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.3} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
