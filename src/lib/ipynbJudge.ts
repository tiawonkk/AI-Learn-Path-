import type {
  IpynbCheckRule,
  JudgeExecutionResult,
  SubModule,
  TestCaseResult,
} from '@/types/curriculum';

interface RawNotebookCell {
  cell_type?: string;
  source?: string | string[];
  execution_count?: number | null;
  outputs?: Array<{
    output_type?: string;
    text?: string | string[];
    data?: Record<string, string | string[]>;
  }>;
}

interface RawNotebook {
  nbformat?: number;
  nbformat_minor?: number;
  cells?: RawNotebookCell[];
}

export interface NotebookSummary {
  valid: boolean;
  error?: string;
  nbformat: string;
  totalCells: number;
  codeCells: number;
  executedCells: number;
  cellsWithOutput: number;
  detectedImports: string[];
  combinedCode: string;
  combinedOutputs: string;
}

function joinText(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join('') : String(value);
}

export function inspectNotebookSummary(rawText: string): NotebookSummary {
  try {
    const parsed = JSON.parse(rawText) as RawNotebook;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cells)) {
      return {
        valid: false,
        error: 'Invalid .ipynb structure: missing "cells" array.',
        nbformat: 'unknown',
        totalCells: 0,
        codeCells: 0,
        executedCells: 0,
        cellsWithOutput: 0,
        detectedImports: [],
        combinedCode: '',
        combinedOutputs: '',
      };
    }

    const codeCellTexts: string[] = [];
    const outputTexts: string[] = [];
    const importMatches = new Set<string>();
    let codeCells = 0;
    let executedCells = 0;
    let cellsWithOutput = 0;

    for (const cell of parsed.cells) {
      if (cell.cell_type !== 'code') continue;
      codeCells += 1;
      const src = joinText(cell.source);
      codeCellTexts.push(src);

      const lines = src.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        const imp = trimmed.match(/^(?:import|from)\s+([a-zA-Z0-9_.]+)/);
        if (imp?.[1]) {
          importMatches.add(imp[1].split('.')[0]);
        }
      }

      const cellOutParts: string[] = [];
      if (Array.isArray(cell.outputs)) {
        for (const out of cell.outputs) {
          const streamText = joinText(out.text);
          if (streamText.trim()) cellOutParts.push(streamText);
          if (out.data) {
            const plain = joinText(out.data['text/plain']);
            if (plain.trim()) cellOutParts.push(plain);
          }
        }
      }

      const hasOutput = cellOutParts.length > 0;
      if (hasOutput) {
        cellsWithOutput += 1;
        outputTexts.push(cellOutParts.join('\n'));
      }
      if (typeof cell.execution_count === 'number' || hasOutput) {
        executedCells += 1;
      }
    }

    return {
      valid: true,
      nbformat: `${parsed.nbformat ?? 4}.${parsed.nbformat_minor ?? 0}`,
      totalCells: parsed.cells.length,
      codeCells,
      executedCells,
      cellsWithOutput,
      detectedImports: Array.from(importMatches),
      combinedCode: codeCellTexts.join('\n\n'),
      combinedOutputs: outputTexts.join('\n\n'),
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Unable to parse .ipynb JSON.',
      nbformat: 'invalid',
      totalCells: 0,
      codeCells: 0,
      executedCells: 0,
      cellsWithOutput: 0,
      detectedImports: [],
      combinedCode: '',
      combinedOutputs: '',
    };
  }
}

function evaluateRule(rule: IpynbCheckRule, summary: NotebookSummary): TestCaseResult {
  if (rule.kind === 'import' || rule.kind === 'regex') {
    const rx = new RegExp(rule.pattern ?? '', 'm');
    const ok = rx.test(summary.combinedCode);
    return {
      id: rule.id,
      name: rule.name,
      visibility: rule.visibility,
      passed: ok,
      message: ok ? `Verified: ${rule.description}` : `Missing required pattern: ${rule.description}`,
    };
  }

  if (rule.kind === 'executed_cells') {
    const req = rule.minCount ?? 1;
    const ok = summary.cellsWithOutput >= req;
    return {
      id: rule.id,
      name: rule.name,
      visibility: rule.visibility,
      passed: ok,
      message: ok
        ? `Found ${summary.cellsWithOutput} executed cells with saved outputs (required >= ${req}).`
        : `Only ${summary.cellsWithOutput} cell(s) have saved outputs (required >= ${req}). Run cells in Colab before downloading .ipynb!`,
    };
  }

  if (rule.kind === 'output_contains') {
    const rx = new RegExp(rule.pattern ?? '', 'm');
    const ok = rx.test(summary.combinedOutputs);
    return {
      id: rule.id,
      name: rule.name,
      visibility: rule.visibility,
      passed: ok,
      message: ok
        ? `Output verified: ${rule.description}`
        : `Executed outputs missing expected signature: ${rule.description}`,
    };
  }

  return {
    id: rule.id,
    name: rule.name,
    visibility: rule.visibility,
    passed: false,
    message: 'Unknown notebook rule kind.',
  };
}

export function evaluateIpynbSubmission(params: {
  subModule: SubModule;
  ipynbText: string;
  runKind: 'sample' | 'submit';
  submittedFilename?: string;
}): JudgeExecutionResult {
  const started = performance.now();
  const { subModule, ipynbText, runKind, submittedFilename } = params;
  const summary = inspectNotebookSummary(ipynbText);

  if (!summary.valid) {
    return {
      subModuleId: subModule.id,
      mode: 'ipynb_ast_check',
      runKind,
      passed: false,
      score: 0,
      scoreLabel: 'Invalid .ipynb JSON',
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      xpAwarded: 0,
      stdout: '',
      error: summary.error ?? 'Not a valid Jupyter/Colab .ipynb notebook.',
      sampleResults: [
        {
          id: `${subModule.id}-ipynb-json`,
          name: 'Valid Jupyter Notebook (.ipynb) Schema',
          visibility: 'sample',
          passed: false,
          message: summary.error ?? 'Invalid JSON',
        },
      ],
      hiddenResults: [],
      timestamp: new Date().toISOString(),
      submittedFilename,
    };
  }

  const rules = subModule.challenge.test_suite.ipynbRules ?? [];
  const activeRules =
    runKind === 'sample' ? rules.filter((r) => r.visibility === 'sample') : rules;

  const evaluated = activeRules.map((rule) => evaluateRule(rule, summary));
  const sampleResults: TestCaseResult[] = [
    {
      id: `${subModule.id}-ipynb-json`,
      name: `Notebook Schema (nbformat ${summary.nbformat}, ${summary.codeCells} code cells)`,
      visibility: 'sample',
      passed: summary.codeCells > 0,
      message:
        summary.codeCells > 0
          ? `Imports detected: ${summary.detectedImports.join(', ') || 'none'}`
          : 'Notebook contains zero code cells.',
    },
    ...evaluated.filter((r) => r.visibility === 'sample'),
  ];
  const hiddenResults = evaluated.filter((r) => r.visibility === 'hidden');

  const allChecks = [...sampleResults, ...hiddenResults];
  const passedCount = allChecks.filter((r) => r.passed).length;
  const score = allChecks.length > 0 ? Math.round((passedCount / allChecks.length) * 100) : 0;
  const passed =
    runKind === 'submit'
      ? score >= subModule.challenge.passing_threshold && allChecks.length > 0
      : score === 100 && allChecks.length > 0;

  const durationMs = Math.max(1, Math.round(performance.now() - started));

  return {
    subModuleId: subModule.id,
    mode: 'ipynb_ast_check',
    runKind,
    passed,
    score,
    scoreLabel: `${passedCount}/${allChecks.length} Checks (${score}%)`,
    durationMs,
    xpAwarded: runKind === 'submit' && passed ? subModule.challenge.xp_reward : 0,
    stdout:
      summary.combinedOutputs.trim() ||
      '(No saved cell outputs found inside notebook yet — execute all cells in Colab and save/download .ipynb.)',
    sampleResults,
    hiddenResults,
    metrics: [
      { label: 'Code Cells', value: String(summary.codeCells) },
      { label: 'Cells w/ Output', value: String(summary.cellsWithOutput), highlight: summary.cellsWithOutput >= 2 },
      { label: 'Rules Passed', value: `${passedCount}/${allChecks.length}`, highlight: passed },
    ],
    timestamp: new Date().toISOString(),
    submittedFilename,
  };
}
