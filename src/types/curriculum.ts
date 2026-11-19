export type TrackId = 'track-01' | 'track-02' | 'track-03' | 'track-04' | 'track-05';
export type TrackNumber = 1 | 2 | 3 | 4 | 5;
export type ThemeMode = 'light' | 'dark';
export type PomodoroMode = 'focus' | 'short' | 'long';
export type DrawerTab = 'timer' | 'notes' | 'tasks' | 'backup';
export type WorkspaceView = 'dashboard' | 'lesson' | 'exam';
export type ValidationMode = 'py_unit_test' | 'csv_metric_eval' | 'ipynb_ast_check';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type KyuRank =
  | '8 Kyu'
  | '7 Kyu'
  | '6 Kyu'
  | '5 Kyu'
  | '4 Kyu'
  | '3 Kyu'
  | '2 Kyu'
  | '1 Kyu';

export type DiagramId =
  // Track 01: Python (11)
  | 'py-io-stream'
  | 'py-datatype-boxes'
  | 'py-memory-vars'
  | 'py-operators-alu'
  | 'py-branch-flow'
  | 'py-loop-stepper'
  | 'py-list-indexer'
  | 'py-dict-set-map'
  | 'py-function-machine'
  | 'py-oop-blueprint'
  | 'py-capstone-arch'
  // Track 02: NumPy & Pandas (6)
  | 'np-tensor-dims'
  | 'np-matmul-broadcast'
  | 'pd-dataframe-anatomy'
  | 'pd-groupby-split'
  | 'pd-ml-tensor-bridge'
  | 'pd-bridge-capstone'
  // Track 03: Machine Learning (10)
  | 'ml-data-cleaning'
  | 'ml-eda-distribution'
  | 'ml-pipeline-leakage'
  | 'ml-regression-fit'
  | 'ml-classification-boundary'
  | 'ml-ensemble-boost'
  | 'ml-unsupervised-pca'
  | 'ml-eval-metrics'
  | 'ml-storytelling-shap'
  | 'ml-capstone-pipeline'
  // Track 04: Deep Learning (8)
  | 'dl-math-neuron'
  | 'dl-mlp-activations'
  | 'dl-gradient-descent'
  | 'dl-cnn-kernel'
  | 'dl-rnn-lstm'
  | 'dl-transformer-attn'
  | 'dl-generative-latent'
  | 'dl-capstone-moons'
  // Track 05: Agentic AI (6)
  | 'ai-structured-json'
  | 'ai-rag-pipeline'
  | 'ai-tool-calling'
  | 'ai-react-langgraph'
  | 'ai-multiagent-hitl'
  | 'ai-capstone-multiagent';

export interface SyntaxItem {
  token: string;
  syntax: string;
  description: string;
}

export interface SyntaxBlank {
  id: string;
  answer: string;
  placeholder?: string;
}

export interface SyntaxCheckSpec {
  prompt: string;
  /** Template using ___0___, ___1___ placeholders for blanks */
  codeTemplate: string;
  blanks: SyntaxBlank[];
  wordBank: string[];
  hint: string;
  explanation: string;
}

export interface LessonSummarySpec {
  key_takeaways: string[];
  reflection_prompt: string;
}

export interface PyTestCase {
  id: string;
  name: string;
  visibility: 'sample' | 'hidden';
  setupCode?: string;
  testCode: string;
  stdinInputs?: string[];
  rerunUserCode?: boolean;
  overrideVars?: Record<string, string | number | boolean>;
  hint?: string;
}

export interface CsvEvaluationSpec {
  taskType: 'binary_classification' | 'regression';
  idColumnCandidates: string[];
  targetColumnCandidates: string[];
  primaryMetric: 'f1' | 'accuracy' | 'rmse' | 'mae';
  thresholdOperator: '>=' | '<=';
  passingThreshold: number;
  baselineMetric: number;
  groundTruth: number[];
  trainCsvUrl: string;
  testFeaturesCsvUrl: string;
  sampleCsvHint: string;
}

export interface IpynbCheckRule {
  id: string;
  name: string;
  visibility: 'sample' | 'hidden';
  kind: 'import' | 'regex' | 'executed_cells' | 'output_contains';
  pattern?: string;
  minCount?: number;
  description: string;
}

export interface ChallengeTestSuite {
  pyTests?: PyTestCase[];
  requiredPackages?: string[];
  csvSpec?: CsvEvaluationSpec;
  ipynbRules?: IpynbCheckRule[];
}

export interface ChallengeSpec {
  id: string;
  difficulty_kyu: KyuRank;
  xp_reward: number;
  is_final_exam?: boolean;
  title: string;
  instructions: string;
  requirements: string[];
  starter_file_url: string;
  starter_code: string;
  colab_notebook_url: string;
  validation_mode: ValidationMode;
  test_suite: ChallengeTestSuite;
  passing_threshold: number;
  passing_label: string;
  default_tasks: string[];
}

export interface TheorySpec {
  intro: string;
  why_it_matters: string;
  history_brief: string;
  visual_diagram_id: DiagramId;
  syntax_breakdown: SyntaxItem[];
  key_rule?: string;
}

export interface SubModule {
  id: string;
  trackId: TrackId;
  order: number;
  code: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  difficulty: DifficultyLevel;
  estMinutes: number;
  theory: TheorySpec;
  syntaxCheck: SyntaxCheckSpec;
  challenge: ChallengeSpec;
  summary: LessonSummarySpec;
}

export interface ModuleWrapup {
  key_takeaways: string[];
  quick_reference_headers: string[];
  quick_reference_rows: string[][];
  certificate_title: string;
  certificate_subtitle: string;
}

export interface TrackSpec {
  id: TrackId;
  number: TrackNumber;
  shortLabel: string;
  name: string;
  categoryLabel: string;
  subtitle: string;
  badgeHex: string;
  prerequisiteTrackId?: TrackId;
  pdfSourceLabel: string;
  libraries: string[];
  module_wrapup: ModuleWrapup;
  subModules: SubModule[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  visibility: 'sample' | 'hidden';
  passed: boolean;
  message: string;
}

export interface JudgeMetricBreakdown {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface JudgeExecutionResult {
  subModuleId: string;
  mode: ValidationMode;
  runKind: 'sample' | 'submit';
  passed: boolean;
  score: number;
  scoreLabel: string;
  durationMs: number;
  xpAwarded: number;
  stdout: string;
  error?: string;
  sampleResults: TestCaseResult[];
  hiddenResults: TestCaseResult[];
  metrics?: JudgeMetricBreakdown[];
  timestamp: string;
  submittedFilename?: string;
}

export interface ChallengeProgress {
  solved: boolean;
  bestScore: number;
  attempts: number;
  xpEarned: number;
  lastSubmittedAt?: string;
  lastExecutionMs?: number;
  submittedFilename?: string;
  lastSummary?: string;
  colabUrl: string;
}

export interface CustomTaskItem {
  id: string;
  text: string;
  done: boolean;
  isDefault?: boolean;
}

export interface PomodoroState {
  mode: PomodoroMode;
  remainingSec: number;
  running: boolean;
  targetEndMs: number | null;
  sessionsCompleted: number;
  muted: boolean;
}

export interface UserBoardProfile {
  boardId: string;
  userId?: string;
  username: string;
  displayName: string;
  goalLabel: string;
  authMode: 'guest' | 'supabase';
  provider?: 'google' | 'github' | 'guest';
  publicBoardEnabled: boolean;
  createdAt: string;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  moduleId: string;
  filename: string;
  mimeType: string;
  codeContent: string;
  fileUrl?: string;
  storagePath?: string;
  score: number;
  scoreLabel: string;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  executionMs: number;
  createdAt: string;
}

export interface WorkspaceState {
  profile: UserBoardProfile;
  theme: ThemeMode;
  activeView: WorkspaceView;
  activeTrackId: TrackId;
  activeSubModuleId: string;
  drawerOpen: boolean;
  activeDrawerTab: DrawerTab;
  pomodoro: PomodoroState;
  xp: number;
  streakDays: number;
  lastActivityDate: string | null;
  bookmarkedIds: string[];
  completedLessonIds: string[];
  lessonStepBySubId: Record<string, number>;
  syntaxCheckPassedIds: string[];
  challenges: Record<string, ChallengeProgress>;
  submissionsByModule: Record<string, SubmissionRecord[]>;
  codeDrafts: Record<string, string>;
  notes: Record<string, string>;
  tasks: Record<string, CustomTaskItem[]>;
}

export interface ToastItem {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
}
