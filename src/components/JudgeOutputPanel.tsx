'use client';

import {
  CheckCircle2,
  Clock,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-react';
import type { JudgeExecutionResult } from '@/types/curriculum';

interface JudgeOutputPanelProps {
  running: boolean;
  statusText: string;
  result: JudgeExecutionResult | null;
}

export function JudgeOutputPanel({
  running,
  statusText,
  result,
}: JudgeOutputPanelProps) {
  return (
    <section
      aria-label="Automated Judge Output"
      className="overflow-hidden rounded-2xl border border-code-border bg-code-surface text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-code-border bg-code-header px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#FACF4E]" strokeWidth={2.2} />
          <span className="font-mono text-xs font-semibold text-white">
            Judge Execution Output
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold">
          {result && !running && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3A363F] px-2.5 py-0.5 text-[#E6E0EC]">
              <Clock className="h-3 w-3" />
              {result.durationMs} ms
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              running
                ? 'bg-[#FACF4E]/20 text-[#FACF4E]'
                : !result
                  ? 'bg-[#3A363F] text-[#B8B0C0]'
                  : result.passed
                    ? 'bg-[#DDA9FF]/20 text-[#DDA9FF]'
                    : 'bg-[#F19BB6]/20 text-[#F19BB6]'
            }`}
          >
            {running
              ? 'Running...'
              : !result
                ? 'Ready'
                : result.passed
                  ? result.runKind === 'submit'
                    ? 'Passed'
                    : 'Sample Passed'
                  : 'Needs Attention'}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4 font-mono text-xs">
        {running && (
          <div className="rounded-xl border border-[#FACF4E]/35 bg-[#FACF4E]/10 p-3 text-[#FACF4E]">
            <div className="font-semibold">Executing validation checks...</div>
            <div className="mt-1 text-[11px] text-[#E6E0EC]">
              {statusText || 'Booting runtime...'}
            </div>
          </div>
        )}

        {!running && !result && (
          <div className="rounded-xl bg-[#2E2B30] p-3.5 text-[#B8B0C0]">
            Click <strong className="text-white">Run Sample Tests</strong> to test your progress, or{' '}
            <strong className="text-[#FACF4E]">Submit Solution</strong> to run the full hidden test suite and earn XP.
          </div>
        )}

        {!running && result && (
          <>
            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${
                result.passed
                  ? 'border-[#DDA9FF]/40 bg-[#DDA9FF]/12 text-[#DDA9FF]'
                  : 'border-[#F19BB6]/40 bg-[#F19BB6]/12 text-[#F19BB6]'
              }`}
            >
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#DDA9FF]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-[#F19BB6]" />
                )}
                <div>
                  <div className="font-semibold text-white">{result.scoreLabel}</div>
                  {result.submittedFilename && (
                    <div className="text-[11px] opacity-80">
                      File: {result.submittedFilename}
                    </div>
                  )}
                </div>
              </div>

              {result.xpAwarded > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FACF4E] px-2.5 py-0.5 text-[11px] font-bold text-[#232124]">
                  <Zap className="h-3 w-3" />+{result.xpAwarded} XP
                </span>
              )}
            </div>

            {result.metrics && result.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {result.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-code-border bg-[#2E2B30] p-2.5"
                  >
                    <div className="text-[10px] uppercase text-[#B8B0C0]">
                      {m.label}
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-bold ${
                        m.highlight ? 'text-[#FACF4E]' : 'text-white'
                      }`}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.error && (
              <div className="rounded-xl border border-[#F19BB6]/40 bg-[#F19BB6]/10 p-3 text-[#F19BB6]">
                <div className="font-semibold">Traceback / Schema Message</div>
                <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed text-white/90">
                  {result.error}
                </pre>
              </div>
            )}

            {result.sampleResults.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-[#B8B0C0]">
                  Sample Checks ({result.sampleResults.filter((r) => r.passed).length}/
                  {result.sampleResults.length})
                </div>
                {result.sampleResults.map((tc) => (
                  <div
                    key={tc.id}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 ${
                      tc.passed
                        ? 'border-[#DDA9FF]/30 bg-[#DDA9FF]/10 text-white'
                        : 'border-[#F19BB6]/35 bg-[#F19BB6]/10 text-white'
                    }`}
                  >
                    {tc.passed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DDA9FF]" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F19BB6]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{tc.name}</div>
                      <div className="mt-0.5 break-words text-[11px] text-[#E6E0EC]">
                        {tc.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.hiddenResults.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-[#B8B0C0]">
                  Hidden Evaluation Checks ({result.hiddenResults.filter((r) => r.passed).length}/
                  {result.hiddenResults.length})
                </div>
                {result.hiddenResults.map((tc) => (
                  <div
                    key={tc.id}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 ${
                      tc.passed
                        ? 'border-[#DDA9FF]/30 bg-[#DDA9FF]/10 text-white'
                        : 'border-[#F19BB6]/35 bg-[#F19BB6]/10 text-white'
                    }`}
                  >
                    {tc.passed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DDA9FF]" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F19BB6]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{tc.name}</div>
                      <div className="mt-0.5 break-words text-[11px] text-[#E6E0EC]">
                        {tc.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.stdout.trim() && (
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-wider text-[#B8B0C0]">
                  Console Output
                </div>
                <pre className="max-h-40 overflow-auto rounded-xl border border-code-border bg-[#1D1B1E] p-3 text-[11.5px] text-white">
                  {result.stdout}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
