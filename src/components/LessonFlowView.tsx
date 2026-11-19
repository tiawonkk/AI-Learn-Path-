'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Eye,
  HelpCircle,
  Lightbulb,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { ChallengeWorkspaceBox } from '@/components/ChallengeWorkspaceBox';
import { ConceptVisualizer } from '@/components/ConceptVisualizer';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { getNextSubModule } from '@/data/curriculum';
import { highlightPython } from '@/lib/pythonHighlight';
import { workspaceActions } from '@/lib/workspaceStore';
import type {
  ChallengeProgress,
  SubModule,
  TrackSpec,
} from '@/types/curriculum';

interface LessonFlowViewProps {
  track: TrackSpec;
  subModule: SubModule;
  progress: ChallengeProgress;
  codeDraft: string;
  noteText: string;
  currentStep: number;
  syntaxCheckAlreadyPassed: boolean;
  isBookmarked: boolean;
  onBackToRoadmap: () => void;
  onOpenSubModule: (subId: string) => void;
  onToggleBookmark: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void;
}

const STEP_LABELS = [
  '1. Concept & Visual',
  '2. Quick Syntax Check',
  '3. Hands-On Challenge',
  '4. Summary & Notes',
];

export function LessonFlowView({
  track,
  subModule,
  progress,
  codeDraft,
  noteText,
  currentStep,
  syntaxCheckAlreadyPassed,
  isBookmarked,
  onBackToRoadmap,
  onOpenSubModule,
  onToggleBookmark,
  onNotify,
}: LessonFlowViewProps) {
  const step = Math.max(1, Math.min(4, currentStep));
  const { theory, syntaxCheck, summary } = subModule;
  const nextSub = getNextSubModule(subModule);

  // Step 2: Fill-in-the-blank state
  const [blankValues, setBlankValues] = useState<string[]>(() =>
    syntaxCheck.blanks.map((b) => (syntaxCheckAlreadyPassed ? b.answer : ''))
  );
  const [syntaxResult, setSyntaxResult] = useState<'idle' | 'pass' | 'retry'>(() =>
    syntaxCheckAlreadyPassed ? 'pass' : 'idle'
  );
  const [showHint, setShowHint] = useState(false);

  // Step 4: Notes preview toggle
  const [notePreview, setNotePreview] = useState(false);

  const setStep = (targetStep: number) => {
    workspaceActions.setLessonStep(subModule.id, targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTapWordToken = (token: string) => {
    const firstEmpty = blankValues.findIndex((v) => v.trim() === '');
    const targetIdx = firstEmpty !== -1 ? firstEmpty : blankValues.length - 1;
    const next = [...blankValues];
    next[targetIdx] = token;
    setBlankValues(next);
    setSyntaxResult('idle');
  };

  const handleCheckSyntax = () => {
    const allCorrect = syntaxCheck.blanks.every(
      (b, idx) => (blankValues[idx] ?? '').trim() === b.answer
    );
    if (allCorrect) {
      setSyntaxResult('pass');
      workspaceActions.markSyntaxCheckPassed(subModule.id);
      onNotify('Syntax check passed! Moving closer to full mastery.', 'success');
    } else {
      setSyntaxResult('retry');
    }
  };

  const renderCodeTemplate = () => {
    const parts = syntaxCheck.codeTemplate.split(/(___\d+___)/g);
    return (
      <pre className="overflow-x-auto rounded-2xl bg-code-surface p-5 font-mono text-[13.5px] leading-8 text-white">
        <code>
          {parts.map((part, idx) => {
            const match = part.match(/^___(\d+)___$/);
            if (!match) {
              return <span key={idx}>{highlightPython(part)}</span>;
            }
            const bIdx = Number(match[1]);
            const blank = syntaxCheck.blanks[bIdx];
            const val = blankValues[bIdx] ?? '';
            const isCorrect =
              syntaxResult === 'pass' ||
              (syntaxResult === 'retry' && val.trim() === blank?.answer);
            const isWrong = syntaxResult === 'retry' && val.trim() !== blank?.answer;

            return (
              <input
                key={idx}
                type="text"
                value={val}
                aria-label={`Code blank ${bIdx + 1}`}
                placeholder={blank?.placeholder || '___'}
                onChange={(e) => {
                  const next = [...blankValues];
                  next[bIdx] = e.target.value;
                  setBlankValues(next);
                  setSyntaxResult('idle');
                }}
                style={{ width: `${Math.max(7, (val || blank?.placeholder || '').length + 3)}ch` }}
                className={`mx-1 inline-block rounded-lg border px-2 py-0.5 text-center font-mono text-xs font-bold outline-none transition-colors ${
                  isCorrect
                    ? 'border-[#DDA9FF] bg-[#DDA9FF]/20 text-[#DDA9FF]'
                    : isWrong
                      ? 'border-[#F19BB6] bg-[#F19BB6]/20 text-[#F19BB6]'
                      : 'border-code-border bg-[#2E2B30] text-[#FACF4E] focus:border-[#FACF4E]'
                }`}
              />
            );
          })}
        </code>
      </pre>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-7 md:px-6">
      {/* Breadcrumb + Progress Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToRoadmap}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-sub transition-colors hover:border-border-strong hover:text-text-main"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Course Roadmap</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface-pill px-3 py-1 font-mono text-xs font-semibold text-text-sub">
              {track.name} • Module {subModule.code}
            </span>
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
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

        {/* Sololearn Top Progress Stepper */}
        <div className="ed-card p-4">
          <div className="mb-2.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-text-main">{STEP_LABELS[step - 1]}</span>
            <span className="font-mono text-text-muted">Step {step} of 4</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => {
              const reached =
                s <= step ||
                (s === 2 && syntaxCheckAlreadyPassed) ||
                progress.solved;
              const isCurrent = s === step;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!reached}
                  onClick={() => reached && setStep(s)}
                  title={STEP_LABELS[s - 1]}
                  className={`h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-sunshine'
                      : reached
                        ? 'cursor-pointer bg-plum hover:opacity-90'
                        : 'cursor-not-allowed bg-surface-pill'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 1 — Concept & Interactive Visual */}
      {step === 1 && (
        <section className="animate-gentle-fade space-y-6">
          <div className="ed-card space-y-5 p-6 md:p-8">
            <div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                Step 1 • Concept Overview
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-main">
                {subModule.title}
              </h1>
              <p className="mt-1.5 text-sm text-text-muted">{subModule.subtitle}</p>
            </div>

            <div className="space-y-3.5 text-[15px] leading-[1.7] text-text-sub">
              <p>{theory.intro}</p>
              <p>{theory.why_it_matters}</p>
              <p className="rounded-xl bg-surface-subtle p-4 text-xs leading-relaxed text-text-muted">
                <strong className="text-text-main">Quick Context: </strong>
                {theory.history_brief}
              </p>
            </div>

            {theory.key_rule && (
              <div className="flex items-start gap-2.5 rounded-xl border border-sunshine/60 bg-sunshine-soft p-4 text-xs leading-relaxed text-text-main">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                <div>
                  <strong>Key Principle: </strong>
                  {theory.key_rule}
                </div>
              </div>
            )}

            {/* Syntax Pills */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {theory.syntax_breakdown.map((item) => (
                <div
                  key={item.token}
                  className="rounded-xl border border-border-soft bg-surface-subtle p-3.5"
                >
                  <div className="font-mono text-xs font-bold text-plum">
                    {item.token}
                  </div>
                  <div className="mt-1 overflow-x-auto rounded-lg bg-code-surface px-2.5 py-1.5 font-mono text-[11.5px] text-white">
                    {highlightPython(item.syntax)}
                  </div>
                  <p className="mt-1.5 text-xs text-text-sub">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <ConceptVisualizer diagramId={theory.visual_diagram_id} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 — Quick Syntax Check */}
      {step === 2 && (
        <section className="animate-gentle-fade space-y-6">
          <div className="ed-card space-y-5 p-6 md:p-8">
            <div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                Step 2 • Quick Syntax Check
              </span>
              <h2 className="mt-3 text-xl font-bold text-text-main">
                Complete the Code Snippet
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-sub">
                {syntaxCheck.prompt}
              </p>
            </div>

            {renderCodeTemplate()}

            {/* Tap-to-Complete Word Bank */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-text-muted">
                Tap a token below to fill the next blank (or type directly above):
              </div>
              <div className="flex flex-wrap gap-2">
                {syntaxCheck.wordBank.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => handleTapWordToken(token)}
                    className="cursor-pointer rounded-full border border-border-strong bg-surface-subtle px-3.5 py-1.5 font-mono text-xs font-semibold text-text-main transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                  >
                    {token}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setBlankValues(syntaxCheck.blanks.map(() => ''));
                    setSyntaxResult('idle');
                  }}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-main"
                >
                  Clear blanks
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main"
              >
                <HelpCircle className="h-4 w-4" />
                <span>{showHint ? 'Hide hint' : 'Need a hint?'}</span>
              </button>

              <button
                type="button"
                onClick={handleCheckSyntax}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
              >
                Check Answer
              </button>
            </div>

            {showHint && (
              <div className="rounded-xl bg-surface-subtle p-3.5 text-xs text-text-sub">
                <strong>Hint:</strong> {syntaxCheck.hint}
              </div>
            )}

            {syntaxResult === 'pass' && (
              <div className="rounded-xl border border-plum/30 bg-lavender-soft p-4 text-xs text-text-main">
                <div className="flex items-center gap-2 font-bold text-plum">
                  <CheckCircle2 className="h-4 w-4 text-plum" />
                  <span>Nice work!</span>
                </div>
                <p className="mt-1 leading-relaxed">{syntaxCheck.explanation}</p>
              </div>
            )}

            {syntaxResult === 'retry' && (
              <div className="rounded-xl border border-[#F19BB6] bg-rose-soft p-4 text-xs text-text-main">
                Not quite yet — check the highlighted slots and try again! Hint: {syntaxCheck.hint}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-sub hover:text-text-main"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={syntaxResult !== 'pass' && !syntaxCheckAlreadyPassed}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span>Continue to Challenge</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — Hands-On Coding Challenge / File Submission */}
      {step === 3 && (
        <section className="animate-gentle-fade space-y-6">
          <ChallengeWorkspaceBox
            key={subModule.id}
            subModule={subModule}
            progress={progress}
            codeDraft={codeDraft}
            onNotify={onNotify}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-sub hover:text-text-main"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {!progress.solved && (
                <span className="text-xs text-text-muted">
                  Pass &quot;Submit Solution&quot; to continue
                </span>
              )}
              <button
                type="button"
                disabled={!progress.solved}
                onClick={() => setStep(4)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4 — Lesson Summary & Personal Reflection */}
      {step === 4 && (
        <section className="animate-gentle-fade space-y-6">
          <div className="ed-card space-y-5 p-6 md:p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender-soft px-3 py-1 text-xs font-semibold text-plum">
                <Sparkles className="h-3.5 w-3.5" />
                Step 4 • Key Takeaways
              </span>
              <h2 className="mt-3 text-xl font-bold text-text-main">
                What You Mastered in {subModule.code}
              </h2>
            </div>

            <ul className="space-y-2.5 rounded-xl bg-surface-subtle p-4 text-sm leading-relaxed text-text-sub">
              {summary.key_takeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-plum"
                    strokeWidth={2.3}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Inline Personal Reflection Notes */}
            <div className="space-y-2.5 border-t border-border-soft pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Personal Reflection &amp; Study Notes
                  </h3>
                  <p className="text-xs text-text-muted">{summary.reflection_prompt}</p>
                </div>

                <div className="flex gap-1.5">
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
                <div className="min-h-[140px] rounded-xl border border-border-soft bg-surface-subtle p-4">
                  <MarkdownPreview source={noteText} />
                </div>
              ) : (
                <textarea
                  value={noteText}
                  onChange={(e) => workspaceActions.setNote(subModule.id, e.target.value)}
                  rows={5}
                  placeholder="Write your takeaway or snippet in Markdown (auto-saved)..."
                  className="w-full rounded-xl border border-border-soft bg-surface-subtle p-3.5 font-mono text-xs leading-relaxed text-text-main outline-none focus:border-brand focus:bg-surface"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text-sub hover:text-text-main"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Challenge
            </button>

            <button
              type="button"
              onClick={() => {
                workspaceActions.markLessonCompleted(subModule.id);
                if (nextSub) {
                  onNotify(`Lesson ${subModule.code} complete! Opening ${nextSub.code}.`, 'success');
                  onOpenSubModule(nextSub.id);
                } else {
                  onNotify(`Lesson ${subModule.code} complete!`, 'success');
                  onBackToRoadmap();
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              <span>
                {nextSub
                  ? `Complete & Unlock ${nextSub.code}`
                  : 'Complete & Return to Roadmap'}
              </span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
