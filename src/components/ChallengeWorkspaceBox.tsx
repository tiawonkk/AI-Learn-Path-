'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  FileUp,
  History,
  Play,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { JudgeOutputPanel } from '@/components/JudgeOutputPanel';
import { PythonCodeEditor } from '@/components/PythonCodeEditor';
import { parseCsvContent } from '@/lib/csvJudge';
import { downloadSubmissionArtifact } from '@/lib/hybridPersistence';
import { inspectNotebookSummary } from '@/lib/ipynbJudge';
import { runJudgeEvaluation } from '@/lib/judgeEngine';
import { highlightPython } from '@/lib/pythonHighlight';
import {
  copyToClipboard,
  useWorkspaceState,
  workspaceActions,
} from '@/lib/workspaceStore';
import type {
  ChallengeProgress,
  JudgeExecutionResult,
  SubModule,
} from '@/types/curriculum';

interface ChallengeWorkspaceBoxProps {
  subModule: SubModule;
  progress: ChallengeProgress;
  codeDraft: string;
  onPassed?: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void;
}

export function ChallengeWorkspaceBox({
  subModule,
  progress,
  codeDraft,
  onPassed,
  onNotify,
}: ChallengeWorkspaceBoxProps) {
  const { challenge } = subModule;
  const mode = challenge.validation_mode;

  const [running, setRunning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<JudgeExecutionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadedFileText, setUploadedFileText] = useState('');
  const [showColabSnippet, setShowColabSnippet] = useState(false);
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'editor' | 'history'>('editor');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const wsState = useWorkspaceState();
  const submissionHistory = wsState.submissionsByModule[subModule.id] ?? [];

  const activeCode = codeDraft !== '' ? codeDraft : challenge.starter_code;
  const acceptedExt =
    mode === 'py_unit_test' ? '.py' : mode === 'csv_metric_eval' ? '.csv' : '.ipynb';

  const csvPreview =
    mode === 'csv_metric_eval' && uploadedFileText ? parseCsvContent(uploadedFileText) : null;
  const ipynbPreview =
    mode === 'ipynb_ast_check' && uploadedFileText
      ? inspectNotebookSummary(uploadedFileText)
      : null;

  const handleFileLoad = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(acceptedExt)) {
      onNotify(`Expected a ${acceptedExt} file for this challenge.`, 'error');
      return;
    }

    const text = await file.text();
    setUploadedFilename(file.name);
    setUploadedFileText(text);

    if (mode === 'py_unit_test') {
      workspaceActions.setCodeDraft(subModule.id, text);
      onNotify(`Loaded ${file.name} into the Python editor.`, 'info');
    } else if (mode === 'csv_metric_eval') {
      const parsed = parseCsvContent(text);
      onNotify(`Loaded ${file.name} (${parsed.rowCount} rows).`, 'info');
    } else {
      const summary = inspectNotebookSummary(text);
      onNotify(
        summary.valid
          ? `Loaded ${file.name} (${summary.codeCells} code cells).`
          : `Invalid .ipynb file: ${summary.error}`,
        summary.valid ? 'info' : 'error'
      );
    }
  };

  const handleRun = async (runKind: 'sample' | 'submit') => {
    if (running) return;

    if (mode !== 'py_unit_test' && !uploadedFileText.trim()) {
      onNotify(`Please upload or paste your ${acceptedExt} file first.`, 'error');
      return;
    }

    setRunning(true);
    setStatusText('Initializing evaluation sandbox...');

    try {
      const evalResult = await runJudgeEvaluation({
        subModule,
        runKind,
        code: activeCode,
        uploadedText: mode === 'py_unit_test' ? activeCode : uploadedFileText,
        submittedFilename:
          uploadedFilename || (mode === 'py_unit_test' ? 'solution.py' : undefined),
        onStatus: setStatusText,
      });

      setResult(evalResult);

      if (runKind === 'submit') {
        const submittedContent = mode === 'py_unit_test' ? activeCode : uploadedFileText;
        const submittedName =
          uploadedFilename ||
          (mode === 'py_unit_test'
            ? `solution_${subModule.id.replace('.', '_')}.py`
            : `submission_${subModule.id.replace('.', '_')}${acceptedExt}`);
        const { newlySolved, xpDelta } = workspaceActions.recordJudgeSubmission(
          subModule,
          evalResult,
          submittedContent,
          submittedName
        );
        if (evalResult.passed) {
          onNotify(
            newlySolved
              ? `Challenge passed! +${xpDelta} XP earned.`
              : 'Challenge passed again!',
            'success'
          );
          onPassed?.();
        } else {
          onNotify('Some checks failed. Review the feedback below.', 'error');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected evaluation error.';
      onNotify(message, 'error');
      setResult({
        subModuleId: subModule.id,
        mode,
        runKind,
        passed: false,
        score: 0,
        scoreLabel: 'Execution Error',
        durationMs: 1,
        xpAwarded: 0,
        stdout: '',
        error: message,
        sampleResults: [],
        hiddenResults: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setRunning(false);
      setStatusText('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Challenge Instructions Card */}
      <div className="ed-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-pill px-3 py-1 font-mono text-xs font-semibold text-text-sub">
              {challenge.passing_label}
            </span>
            <span className="rounded-full bg-brand-soft px-3 py-1 font-mono text-xs font-semibold text-brand">
              +{challenge.xp_reward} XP
            </span>
          </div>

          {progress.solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lavender-soft px-3 py-1 text-xs font-bold text-plum">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Completed
            </span>
          )}
        </div>

        <h3 className="mt-3 text-lg font-bold text-text-main">{challenge.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-text-sub">
          {challenge.instructions}
        </p>

        <ul className="mt-4 space-y-2 rounded-xl bg-surface-subtle p-4 text-xs leading-relaxed text-text-sub">
          {challenge.requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-bold text-brand shadow-xs">
                {idx + 1}
              </span>
              <span>{req}</span>
            </li>
          ))}
        </ul>

        {/* Starter & Colab Links */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <a
            href={challenge.colab_notebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-subtle px-3.5 py-2 text-xs font-semibold text-text-main transition-colors hover:border-brand hover:text-brand"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Google Colab
          </a>

          <a
            href={challenge.starter_file_url}
            download
            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text-sub transition-colors hover:border-border-strong hover:text-text-main"
          >
            <Download className="h-3.5 w-3.5" />
            Download Starter ({acceptedExt})
          </a>

          {mode === 'csv_metric_eval' && challenge.test_suite.csvSpec && (
            <>
              <a
                href={challenge.test_suite.csvSpec.trainCsvUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text-sub hover:border-border-strong hover:text-text-main"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-plum" />
                train.csv
              </a>
              <a
                href={challenge.test_suite.csvSpec.testFeaturesCsvUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text-sub hover:border-border-strong hover:text-text-main"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#F19BB6]" />
                test_X.csv
              </a>
            </>
          )}

          {mode !== 'py_unit_test' && (
            <button
              type="button"
              onClick={() => setShowColabSnippet((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text-sub hover:border-border-strong"
            >
              <Code className="h-3.5 w-3.5" />
              {showColabSnippet ? 'Hide Colab Snippet' : 'View Colab Snippet'}
            </button>
          )}
        </div>

        {showColabSnippet && mode !== 'py_unit_test' && (
          <div className="mt-4 overflow-hidden rounded-xl bg-code-surface p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-[#B8B0C0]">
                Colab Starter Reference
              </span>
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyToClipboard(challenge.starter_code);
                  onNotify(ok ? 'Copied snippet!' : 'Copy failed.', ok ? 'info' : 'error');
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#3A363F] px-2.5 py-0.5 font-mono text-[11px] text-white hover:bg-[#544D5B]"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <pre className="max-h-56 overflow-auto font-mono text-xs leading-relaxed text-white">
              <code>{highlightPython(challenge.starter_code)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Workspace Tab Switcher: Editor vs My Submissions History */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setWorkspaceTab('editor')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
            workspaceTab === 'editor'
              ? 'bg-[#532B71] text-white'
              : 'border border-border-soft bg-surface text-text-sub hover:border-border-strong hover:text-text-main'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" />
          <span>Solution Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => setWorkspaceTab('history')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
            workspaceTab === 'history'
              ? 'bg-[#532B71] text-white'
              : 'border border-border-soft bg-surface text-text-sub hover:border-border-strong hover:text-text-main'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>My Submissions History ({submissionHistory.length})</span>
        </button>
      </div>

      {/* My Submissions History Tab */}
      {workspaceTab === 'history' && (
        <div className="ed-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-text-main">
                Saved Works &amp; Attempt History
              </h4>
              <p className="font-mono text-[11px] text-text-muted">
                Bucket path: works/{wsState.profile.userId || 'guest-local'}/{subModule.id}/
              </p>
            </div>
            <span className="rounded-full bg-lavender-soft px-3 py-1 font-mono text-[11px] font-bold text-plum">
              {wsState.profile.authMode === 'supabase' ? 'Supabase + IndexedDB' : 'IndexedDB Offline Store'}
            </span>
          </div>

          {submissionHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong bg-surface-subtle p-8 text-center">
              <p className="text-xs font-semibold text-text-main">
                No submissions saved for Module {subModule.code} yet.
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Click &quot;Submit Solution&quot; in the Solution Workspace to store your code or uploaded file here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissionHistory.map((item) => {
                const isExpanded = expandedSubId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border-soft bg-surface-subtle p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-plum" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-[#F19BB6]" />
                        )}
                        <div>
                          <div className="font-mono text-xs font-bold text-text-main">
                            {item.filename}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-muted">
                            <span>{item.scoreLabel}</span>
                            <span>•</span>
                            <span>
                              {item.passedTests}/{item.totalTests} checks
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.executionMs} ms
                            </span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSubId(isExpanded ? null : item.id)
                          }
                          className="cursor-pointer rounded-full border border-border-soft bg-surface px-3 py-1 text-xs font-semibold text-text-sub hover:text-text-main"
                        >
                          {isExpanded ? 'Hide Code' : 'Inspect'}
                        </button>

                        {mode === 'py_unit_test' && (
                          <button
                            type="button"
                            onClick={() => {
                              workspaceActions.setCodeDraft(subModule.id, item.codeContent);
                              setWorkspaceTab('editor');
                              onNotify(`Loaded ${item.filename} into editor.`, 'info');
                            }}
                            className="cursor-pointer rounded-full bg-lavender-soft px-3 py-1 text-xs font-bold text-plum hover:opacity-90"
                          >
                            Load in Editor
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            await downloadSubmissionArtifact(item);
                            onNotify(`Downloaded ${item.filename}!`, 'success');
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-sunshine px-3 py-1 text-xs font-bold text-charcoal hover:bg-sunshine-hover"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-code-border bg-code-surface p-3.5 font-mono text-xs leading-relaxed text-white">
                        <code>
                          {item.filename.endsWith('.py')
                            ? highlightPython(item.codeContent)
                            : item.codeContent}
                        </code>
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Code Editor + File Dropzone */}
      {workspaceTab === 'editor' && (
      <div className="ed-card space-y-4 p-6">
        {mode === 'py_unit_test' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-brand" />
                <span className="text-sm font-bold text-text-main">Python Editor</span>
                <span className="font-mono text-xs text-text-muted">
                  (Runs safely via Pyodide)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(activeCode);
                    onNotify(ok ? 'Copied Python code!' : 'Copy failed.', ok ? 'info' : 'error');
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-soft bg-surface-subtle px-3 py-1 text-xs font-semibold text-text-sub hover:text-text-main"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    workspaceActions.resetCodeDraft(subModule);
                    setUploadedFilename('');
                    onNotify('Reset to starter code.', 'info');
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-soft bg-surface-subtle px-3 py-1 text-xs font-semibold text-text-sub hover:text-text-main"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>

            <PythonCodeEditor
              value={activeCode}
              filename={uploadedFilename || `solution_${subModule.id.replace('.', '_')}.py`}
              onChange={(next) => workspaceActions.setCodeDraft(subModule.id, next)}
            />
          </div>
        )}

        {/* Drag-and-Drop File Upload Zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileLoad(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
            dragOver
              ? 'border-brand bg-brand-soft text-brand'
              : 'border-border-strong bg-surface-subtle text-text-sub hover:border-brand'
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand shadow-xs">
            <FileUp className="h-5 w-5" />
          </span>
          <div className="text-xs font-semibold text-text-main">
            {uploadedFilename
              ? `Loaded: ${uploadedFilename} (Drop or click to replace)`
              : mode === 'py_unit_test'
                ? 'Optional: Drop a .py file here to load into editor'
                : mode === 'csv_metric_eval'
                  ? 'Drag & drop predictions.csv here (or click to browse)'
                  : 'Drag & drop executed Colab .ipynb here (or click to browse)'}
          </div>
          <span className="font-mono text-[11px] text-text-muted">
            Accepted: {acceptedExt}
            {mode === 'csv_metric_eval' && challenge.test_suite.csvSpec
              ? ` • ${challenge.test_suite.csvSpec.groundTruth.length} rows`
              : ''}
          </span>
          <input
            type="file"
            accept={acceptedExt}
            onChange={(e) => {
              handleFileLoad(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="hidden"
          />
        </label>

        {mode !== 'py_unit_test' && (
          <div>
            <button
              type="button"
              onClick={() => setShowRawPaste((v) => !v)}
              className="cursor-pointer font-mono text-xs font-medium text-text-muted underline hover:text-brand"
            >
              {showRawPaste
                ? `Hide raw ${acceptedExt} input`
                : `Or paste raw ${acceptedExt} content directly`}
            </button>

            {showRawPaste && (
              <textarea
                value={uploadedFileText}
                onChange={(e) => {
                  setUploadedFileText(e.target.value);
                  if (!uploadedFilename) setUploadedFilename(`pasted${acceptedExt}`);
                }}
                rows={5}
                spellCheck={false}
                placeholder={
                  mode === 'csv_metric_eval'
                    ? challenge.test_suite.csvSpec?.sampleCsvHint ?? 'id,prediction\n0,1'
                    : 'Paste raw .ipynb JSON here...'
                }
                className="mt-2.5 w-full rounded-xl border border-code-border bg-code-surface p-3 font-mono text-xs text-white outline-none focus:border-plum"
              />
            )}
          </div>
        )}

        {mode === 'csv_metric_eval' && csvPreview && (
          <div className="rounded-xl border border-border-soft bg-surface-subtle p-3.5">
            <div className="mb-2 flex items-center justify-between font-mono text-xs font-semibold">
              <span className="text-text-main">Preview: {uploadedFilename}</span>
              <span className="rounded-full bg-lavender-soft px-2.5 py-0.5 text-plum">
                {csvPreview.rowCount} rows detected
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border-soft bg-surface">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-subtle text-text-muted">
                    {csvPreview.headers.map((h, i) => (
                      <th key={i} className="px-2.5 py-1.5 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.rows.slice(0, 4).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-border-soft last:border-b-0">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2.5 py-1.5 text-text-main">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mode === 'ipynb_ast_check' && ipynbPreview && (
          <div className="rounded-xl border border-border-soft bg-surface-subtle p-3.5 font-mono text-xs">
            {ipynbPreview.valid ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-text-main">
                <span>
                  {uploadedFilename} • nbformat {ipynbPreview.nbformat}
                </span>
                <span className="rounded-full bg-lavender-soft px-2.5 py-0.5 text-plum">
                  {ipynbPreview.codeCells} cells · {ipynbPreview.cellsWithOutput} with outputs
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#F19BB6]">
                <AlertCircle className="h-4 w-4" />
                <span>{ipynbPreview.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={running}
              onClick={() => handleRun('sample')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-bold text-text-main transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>
                {mode === 'py_unit_test'
                  ? 'Run Sample Tests'
                  : mode === 'csv_metric_eval'
                    ? 'Validate CSV Schema'
                    : 'Preview Notebook AST'}
              </span>
            </button>

            <button
              type="button"
              disabled={running}
              onClick={() => handleRun('submit')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Solution</span>
            </button>
          </div>

          <span className="font-mono text-xs text-text-muted">
            Attempts: {progress.attempts}
          </span>
        </div>
      </div>
      )}

      {/* Judge Output Panel */}
      <JudgeOutputPanel running={running} statusText={statusText} result={result} />
    </div>
  );
}
