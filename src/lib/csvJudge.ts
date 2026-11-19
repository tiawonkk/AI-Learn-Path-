import type {
  CsvEvaluationSpec,
  JudgeExecutionResult,
  JudgeMetricBreakdown,
  SubModule,
  TestCaseResult,
} from '@/types/curriculum';

export interface ParsedCsvPreview {
  headers: string[];
  rows: string[][];
  rowCount: number;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseCsvContent(rawText: string): ParsedCsvPreview {
  const cleaned = rawText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return { headers: [], rows: [], rowCount: 0 };
  }
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const firstLine = lines[0];
  const delimiter =
    firstLine.includes(',') || !firstLine.includes(';') ? ',' : ';';
  const headers = splitCsvLine(firstLine, delimiter).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => splitCsvLine(line, delimiter));

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const cand of candidates) {
    const idx = lower.indexOf(cand.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function failCsvResult(params: {
  subModule: SubModule;
  runKind: 'sample' | 'submit';
  durationMs: number;
  error: string;
  sampleResults: TestCaseResult[];
  hiddenResults?: TestCaseResult[];
  filename?: string;
}): JudgeExecutionResult {
  return {
    subModuleId: params.subModule.id,
    mode: 'csv_metric_eval',
    runKind: params.runKind,
    passed: false,
    score: 0,
    scoreLabel: 'Validation Failed',
    durationMs: params.durationMs,
    xpAwarded: 0,
    stdout: '',
    error: params.error,
    sampleResults: params.sampleResults,
    hiddenResults: params.hiddenResults ?? [],
    timestamp: new Date().toISOString(),
    submittedFilename: params.filename,
  };
}

export function evaluateCsvSubmission(params: {
  subModule: SubModule;
  csvText: string;
  runKind: 'sample' | 'submit';
  submittedFilename?: string;
}): JudgeExecutionResult {
  const started = performance.now();
  const { subModule, csvText, runKind, submittedFilename } = params;
  const spec = subModule.challenge.test_suite.csvSpec as CsvEvaluationSpec | undefined;

  if (!spec) {
    return failCsvResult({
      subModule,
      runKind,
      durationMs: 1,
      error: 'CSV evaluation spec is missing for this challenge.',
      sampleResults: [],
      filename: submittedFilename,
    });
  }

  const parsed = parseCsvContent(csvText);
  const expectedN = spec.groundTruth.length;

  const sampleResults: TestCaseResult[] = [];
  const hiddenResults: TestCaseResult[] = [];

  // Sample Check 1: Non-empty & header detection
  const hasHeaders = parsed.headers.length >= 1 && parsed.rows.length > 0;
  sampleResults.push({
    id: `${subModule.id}-csv-header`,
    name: 'CSV Schema & Header Presence',
    visibility: 'sample',
    passed: hasHeaders,
    message: hasHeaders
      ? `Detected columns: [${parsed.headers.join(', ')}] (${parsed.rowCount} rows)`
      : 'CSV file is empty or missing data rows.',
  });

  if (!hasHeaders) {
    return failCsvResult({
      subModule,
      runKind,
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      error: 'Uploaded CSV is empty or has no prediction rows.',
      sampleResults,
      filename: submittedFilename,
    });
  }

  // Resolve target column
  let targetIdx = findColumnIndex(parsed.headers, spec.targetColumnCandidates);
  if (targetIdx === -1 && parsed.headers.length <= 2) {
    targetIdx = parsed.headers.length - 1;
  }

  const hasTargetCol = targetIdx !== -1;
  sampleResults.push({
    id: `${subModule.id}-csv-col`,
    name: 'Prediction Column Recognized',
    visibility: 'sample',
    passed: hasTargetCol,
    message: hasTargetCol
      ? `Using prediction column "${parsed.headers[targetIdx]}"`
      : `Could not find target column (${spec.targetColumnCandidates.join(', ')}).`,
  });

  // Sample Check 3: Row count matches expected validation rows
  const rowCountMatch = parsed.rowCount === expectedN;
  sampleResults.push({
    id: `${subModule.id}-csv-count`,
    name: `Row Count Alignment (${expectedN} rows)`,
    visibility: 'sample',
    passed: rowCountMatch,
    message: rowCountMatch
      ? `Exact match: ${parsed.rowCount} prediction rows`
      : `Expected ${expectedN} rows, found ${parsed.rowCount}.`,
  });

  if (!hasTargetCol || !rowCountMatch) {
    return failCsvResult({
      subModule,
      runKind,
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      error: !hasTargetCol
        ? `Target prediction column not found. Expected one of: ${spec.targetColumnCandidates.join(', ')}.`
        : `Row count mismatch: expected ${expectedN} rows, received ${parsed.rowCount}.`,
      sampleResults,
      filename: submittedFilename,
    });
  }

  // Extract aligned prediction vector
  const idIdx = findColumnIndex(parsed.headers, spec.idColumnCandidates);
  const preds = new Array<number>(expectedN).fill(Number.NaN);
  let parseError: string | null = null;

  for (let r = 0; r < parsed.rows.length; r += 1) {
    const row = parsed.rows[r];
    const rawVal = row[targetIdx];
    const numVal = Number(rawVal);
    if (rawVal === undefined || rawVal === '' || Number.isNaN(numVal) || !Number.isFinite(numVal)) {
      parseError = `Non-numeric or missing prediction at row ${r + 1}: "${rawVal ?? ''}"`;
      break;
    }

    if (idIdx !== -1) {
      const rowId = Number(row[idIdx]);
      if (!Number.isInteger(rowId) || rowId < 0 || rowId >= expectedN) {
        parseError = `Invalid id "${row[idIdx]}" at row ${r + 1}; expected integers 0..${expectedN - 1}.`;
        break;
      }
      preds[rowId] = numVal;
    } else {
      preds[r] = numVal;
    }
  }

  if (!parseError && preds.some((v) => Number.isNaN(v))) {
    parseError = `Duplicate or missing id values detected across 0..${expectedN - 1}.`;
  }

  const cleanValues = !parseError;
  sampleResults.push({
    id: `${subModule.id}-csv-clean`,
    name: 'Numeric Integrity (No NaN / Missing IDs)',
    visibility: 'sample',
    passed: cleanValues,
    message: cleanValues ? 'All predictions are finite numbers.' : (parseError ?? 'Invalid values'),
  });

  if (!cleanValues) {
    return failCsvResult({
      subModule,
      runKind,
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      error: parseError ?? 'Invalid CSV values.',
      sampleResults,
      filename: submittedFilename,
    });
  }

  if (runKind === 'sample') {
    const durationMs = Math.max(1, Math.round(performance.now() - started));
    return {
      subModuleId: subModule.id,
      mode: 'csv_metric_eval',
      runKind: 'sample',
      passed: true,
      score: 100,
      scoreLabel: 'Schema Validated (Ready to Submit)',
      durationMs,
      xpAwarded: 0,
      stdout: `Validated ${expectedN} prediction rows from ${submittedFilename || 'uploaded CSV'}. Click "Submit to Judge" to score against hidden ground truth.`,
      sampleResults,
      hiddenResults: [],
      metrics: [
        { label: 'Rows Validated', value: `${expectedN}/${expectedN}` },
        { label: 'Schema Check', value: 'PASS', highlight: true },
      ],
      timestamp: new Date().toISOString(),
      submittedFilename,
    };
  }

  // Hidden Ground-Truth Metric Calculation
  const truth = spec.groundTruth;
  let primaryScore = 0;
  let scoreDisplay = '';
  let metrics: JudgeMetricBreakdown[] = [];
  let passed = false;

  if (spec.taskType === 'binary_classification') {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    for (let i = 0; i < expectedN; i += 1) {
      const predBin = preds[i] >= 0.5 ? 1 : 0;
      const trueBin = truth[i] >= 0.5 ? 1 : 0;
      if (predBin === 1 && trueBin === 1) tp += 1;
      else if (predBin === 1 && trueBin === 0) fp += 1;
      else if (predBin === 0 && trueBin === 1) fn += 1;
      else tn += 1;
    }

    const accuracy = (tp + tn) / expectedN;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    primaryScore = spec.primaryMetric === 'accuracy' ? accuracy : f1;
    passed =
      spec.thresholdOperator === '>='
        ? primaryScore >= spec.passingThreshold
        : primaryScore <= spec.passingThreshold;

    const metricName = spec.primaryMetric === 'accuracy' ? 'Accuracy' : 'F1-Score';
    scoreDisplay = `${metricName}: ${primaryScore.toFixed(4)}`;

    hiddenResults.push({
      id: `${subModule.id}-hidden-metric`,
      name: `Ground-Truth ${metricName} ${spec.thresholdOperator} ${spec.passingThreshold.toFixed(2)}`,
      visibility: 'hidden',
      passed,
      message: passed
        ? `Achieved ${primaryScore.toFixed(4)} (beat baseline ${spec.baselineMetric.toFixed(2)} and threshold ${spec.passingThreshold.toFixed(2)}).`
        : `Achieved ${primaryScore.toFixed(4)}, below required ${spec.thresholdOperator} ${spec.passingThreshold.toFixed(2)}.`,
    });

    hiddenResults.push({
      id: `${subModule.id}-hidden-cm`,
      name: 'Confusion Matrix Integrity Check',
      visibility: 'hidden',
      passed: tp > 0,
      message: `TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}`,
    });

    metrics = [
      { label: 'F1-Score', value: f1.toFixed(4), highlight: spec.primaryMetric === 'f1' },
      { label: 'Accuracy', value: `${(accuracy * 100).toFixed(2)}%`, highlight: spec.primaryMetric === 'accuracy' },
      { label: 'Precision', value: precision.toFixed(4) },
      { label: 'Recall', value: recall.toFixed(4) },
    ];
  } else {
    let sqErrSum = 0;
    let absErrSum = 0;
    let sumTrue = 0;
    for (let i = 0; i < expectedN; i += 1) {
      const err = preds[i] - truth[i];
      sqErrSum += err * err;
      absErrSum += Math.abs(err);
      sumTrue += truth[i];
    }
    const rmse = Math.sqrt(sqErrSum / expectedN);
    const mae = absErrSum / expectedN;
    const meanTrue = sumTrue / expectedN;
    let ssTot = 0;
    for (let i = 0; i < expectedN; i += 1) {
      ssTot += (truth[i] - meanTrue) ** 2;
    }
    const r2 = ssTot > 0 ? 1 - sqErrSum / ssTot : 0;

    primaryScore = spec.primaryMetric === 'mae' ? mae : rmse;
    passed =
      spec.thresholdOperator === '<='
        ? primaryScore <= spec.passingThreshold
        : primaryScore >= spec.passingThreshold;

    const metricName = spec.primaryMetric.toUpperCase();
    scoreDisplay = `${metricName}: ${primaryScore.toFixed(4)}`;

    hiddenResults.push({
      id: `${subModule.id}-hidden-rmse`,
      name: `Ground-Truth ${metricName} ${spec.thresholdOperator} ${spec.passingThreshold.toFixed(2)}`,
      visibility: 'hidden',
      passed,
      message: passed
        ? `Achieved ${primaryScore.toFixed(4)} (beat baseline ${spec.baselineMetric.toFixed(2)}).`
        : `Achieved ${primaryScore.toFixed(4)}, missed threshold ${spec.thresholdOperator} ${spec.passingThreshold.toFixed(2)}.`,
    });

    metrics = [
      { label: 'RMSE', value: rmse.toFixed(4), highlight: spec.primaryMetric === 'rmse' },
      { label: 'MAE', value: mae.toFixed(4), highlight: spec.primaryMetric === 'mae' },
      { label: 'R² Score', value: r2.toFixed(4) },
      { label: 'Baseline', value: spec.baselineMetric.toFixed(2) },
    ];
  }

  const durationMs = Math.max(1, Math.round(performance.now() - started));
  const normalizedPct =
    spec.taskType === 'binary_classification'
      ? Math.round(primaryScore * 100)
      : passed
        ? Math.max(85, Math.min(100, Math.round((1 - primaryScore / spec.baselineMetric) * 100)))
        : Math.max(10, Math.min(79, Math.round((spec.passingThreshold / Math.max(primaryScore, 0.01)) * 75)));

  return {
    subModuleId: subModule.id,
    mode: 'csv_metric_eval',
    runKind: 'submit',
    passed,
    score: normalizedPct,
    scoreLabel: scoreDisplay,
    durationMs,
    xpAwarded: passed ? subModule.challenge.xp_reward : 0,
    stdout: `Evaluated ${expectedN} predictions against hidden validation ground truth.\nResult: ${scoreDisplay} | Threshold: ${spec.thresholdOperator} ${spec.passingThreshold}`,
    sampleResults,
    hiddenResults,
    metrics,
    timestamp: new Date().toISOString(),
    submittedFilename,
  };
}
