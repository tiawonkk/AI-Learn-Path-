import { evaluateCsvSubmission } from '@/lib/csvJudge';
import { evaluateIpynbSubmission } from '@/lib/ipynbJudge';
import { runPythonUnitTests } from '@/lib/pyodideRunner';
import type { JudgeExecutionResult, SubModule } from '@/types/curriculum';

export interface RunJudgeParams {
  subModule: SubModule;
  runKind: 'sample' | 'submit';
  code?: string;
  uploadedText?: string;
  submittedFilename?: string;
  onStatus?: (msg: string) => void;
}

export async function runJudgeEvaluation(
  params: RunJudgeParams
): Promise<JudgeExecutionResult> {
  const { subModule, runKind, code, uploadedText, submittedFilename, onStatus } = params;
  const mode = subModule.challenge.validation_mode;

  if (mode === 'py_unit_test') {
    const source = (uploadedText ?? code ?? '').trim();
    if (!source) {
      return {
        subModuleId: subModule.id,
        mode,
        runKind,
        passed: false,
        score: 0,
        scoreLabel: 'Empty Submission',
        durationMs: 1,
        xpAwarded: 0,
        stdout: '',
        error: 'Editor or uploaded .py file is empty. Write your Python solution before running the Judge.',
        sampleResults: [],
        hiddenResults: [],
        timestamp: new Date().toISOString(),
        submittedFilename,
      };
    }
    return runPythonUnitTests({
      subModule,
      code: uploadedText ?? code ?? '',
      runKind,
      submittedFilename,
      onStatus,
    });
  }

  if (mode === 'csv_metric_eval') {
    onStatus?.('Parsing prediction CSV & evaluating validation metrics...');
    return evaluateCsvSubmission({
      subModule,
      csvText: uploadedText ?? '',
      runKind,
      submittedFilename,
    });
  }

  onStatus?.('Inspecting .ipynb JSON AST, imports & execution outputs...');
  return evaluateIpynbSubmission({
    subModule,
    ipynbText: uploadedText ?? '',
    runKind,
    submittedFilename,
  });
}
