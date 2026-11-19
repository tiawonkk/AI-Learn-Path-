import type {
  JudgeExecutionResult,
  PyTestCase,
  SubModule,
  TestCaseResult,
} from '@/types/curriculum';

interface PyodideInterface {
  loadPackage: (packages: string | string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (key: string, value: unknown) => void;
    delete: (key: string) => void;
  };
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_CDNS = [
  {
    scriptUrl: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js',
    indexUrl: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  },
  {
    scriptUrl: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js',
    indexUrl: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
  },
];

let pyodideSingletonPromise: Promise<PyodideInterface> | null = null;
const loadedPackages = new Set<string>();

function loadScriptTag(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-pyodide-src="${src}"]`);
    if (existing) {
      if (typeof window.loadPyodide === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.pyodideSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Pyodide runtime from ${src}`));
    document.head.appendChild(script);
  });
}

export async function getPyodideRuntime(
  onStatus?: (msg: string) => void
): Promise<PyodideInterface> {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only run in the browser.');
  }

  if (!pyodideSingletonPromise) {
    pyodideSingletonPromise = (async () => {
      let lastError: unknown = null;
      for (const cdn of PYODIDE_CDNS) {
        try {
          onStatus?.('Loading Python WebAssembly runtime...');
          await loadScriptTag(cdn.scriptUrl);
          if (typeof window.loadPyodide !== 'function') {
            throw new Error('window.loadPyodide not exposed after script load');
          }
          onStatus?.('Booting CPython WASM interpreter...');
          const pyodide = await window.loadPyodide({ indexURL: cdn.indexUrl });
          return pyodide;
        } catch (err) {
          lastError = err;
        }
      }
      pyodideSingletonPromise = null;
      throw lastError instanceof Error
        ? lastError
        : new Error('Unable to initialize Pyodide WebAssembly runtime.');
    })();
  }

  return pyodideSingletonPromise;
}

const PYTHON_JUDGE_HARNESS = `
import builtins
import io
import json
import sys
import traceback

def _run_judge_harness(user_code: str, tests_json: str) -> str:
    tests = json.loads(tests_json)
    orig_stdout = sys.stdout
    orig_stderr = sys.stderr
    orig_input = builtins.input

    ns = {"__name__": "__challenge__"}
    compile_stdout = io.StringIO()
    compile_stderr = io.StringIO()

    def _default_input(prompt=""):
        if prompt:
            print(prompt, end="")
        return "Learner"

    try:
        sys.stdout = compile_stdout
        sys.stderr = compile_stderr
        builtins.input = _default_input
        compiled = compile(user_code, "<solution.py>", "exec")
        exec(compiled, ns, ns)
    except Exception:
        tb = traceback.format_exc()
        sys.stdout = orig_stdout
        sys.stderr = orig_stderr
        builtins.input = orig_input
        return json.dumps({
            "compileError": tb,
            "stdout": compile_stdout.getvalue(),
            "results": []
        })
    finally:
        sys.stdout = orig_stdout
        sys.stderr = orig_stderr
        builtins.input = orig_input

    results = []
    has_rerun = any(tc.get("rerunUserCode") for tc in tests)
    combined_stdout = [] if has_rerun else [compile_stdout.getvalue()]

    for tc in tests:
        tc_stdout = io.StringIO()
        inputs = list(tc.get("stdinInputs") or [])
        input_idx = {"i": 0}

        def _tc_input(prompt=""):
            if prompt:
                print(prompt, end="")
            idx = input_idx["i"]
            input_idx["i"] = idx + 1
            if idx < len(inputs):
                return str(inputs[idx])
            return ""

        test_ns = {"__name__": "__challenge__"} if tc.get("rerunUserCode") else dict(ns)
        test_ns["_captured_stdout"] = ""

        try:
            sys.stdout = tc_stdout
            builtins.input = _tc_input

            setup_code = tc.get("setupCode") or ""
            if setup_code.strip():
                exec(compile(setup_code, "<setup>", "exec"), test_ns, test_ns)

            import ast
            if tc.get("rerunUserCode"):
                override_vars = tc.get("overrideVars") or {}
                test_ns.update(override_vars)
                skipped = set()
                user_tree = ast.parse(user_code, mode="exec")
                filtered_body = []
                for node in user_tree.body:
                    if (
                        isinstance(node, ast.Assign)
                        and len(node.targets) == 1
                        and isinstance(node.targets[0], ast.Name)
                        and node.targets[0].id in override_vars
                        and node.targets[0].id not in skipped
                    ):
                        skipped.add(node.targets[0].id)
                        continue
                    filtered_body.append(node)
                user_mod = ast.Module(body=filtered_body, type_ignores=[])
                exec(compile(user_mod, "<solution.py>", "exec"), test_ns, test_ns)

            # Execute test assertions while keeping _captured_stdout synced after every statement
            lines = tc.get("testCode", "").strip()
            tree = ast.parse(lines, mode="exec")
            for node in tree.body:
                test_ns["_captured_stdout"] = tc_stdout.getvalue()
                mod = ast.Module(body=[node], type_ignores=[])
                exec(compile(mod, f"<{tc['id']}>", "exec"), test_ns, test_ns)
            test_ns["_captured_stdout"] = tc_stdout.getvalue()

            out_str = tc_stdout.getvalue()
            if out_str:
                combined_stdout.append(f"[{tc['name']}]\\n{out_str}")
            results.append({
                "id": tc["id"],
                "name": tc["name"],
                "visibility": tc["visibility"],
                "passed": True,
                "message": "Passed"
            })
        except AssertionError as ae:
            msg = str(ae).strip() or "Assertion failed"
            if tc["visibility"] == "hidden" and not str(ae).strip():
                msg = "Hidden edge-case assertion failed"
            results.append({
                "id": tc["id"],
                "name": tc["name"],
                "visibility": tc["visibility"],
                "passed": False,
                "message": msg
            })
        except Exception as exc:
            err_msg = f"{type(exc).__name__}: {exc}"
            results.append({
                "id": tc["id"],
                "name": tc["name"],
                "visibility": tc["visibility"],
                "passed": False,
                "message": err_msg
            })
        finally:
            sys.stdout = orig_stdout
            builtins.input = orig_input

    return json.dumps({
        "compileError": None,
        "stdout": "\\n".join([s for s in combined_stdout if s.strip()]),
        "results": results
    })
`;

export async function runPythonUnitTests(params: {
  subModule: SubModule;
  code: string;
  runKind: 'sample' | 'submit';
  submittedFilename?: string;
  onStatus?: (msg: string) => void;
}): Promise<JudgeExecutionResult> {
  const { subModule, code, runKind, submittedFilename, onStatus } = params;
  const started = performance.now();
  const allTests: PyTestCase[] = subModule.challenge.test_suite.pyTests ?? [];
  const selectedTests =
    runKind === 'sample'
      ? allTests.filter((t) => t.visibility === 'sample')
      : allTests;

  const pyodide = await getPyodideRuntime(onStatus);
  const reqPkgs = (subModule.challenge.test_suite.requiredPackages ?? []).filter(
    (p) => !loadedPackages.has(p)
  );
  if (reqPkgs.length > 0) {
    onStatus?.(`Loading Python WASM packages: ${reqPkgs.join(', ')}...`);
    await pyodide.loadPackage(reqPkgs);
    reqPkgs.forEach((p) => loadedPackages.add(p));
  }

  onStatus?.(
    runKind === 'sample'
      ? 'Executing sample unit tests...'
      : 'Running full Judge suite (Sample + Hidden)...'
  );

  pyodide.globals.set('_judge_user_code', code);
  pyodide.globals.set('_judge_tests_json', JSON.stringify(selectedTests));

  try {
    const rawJson = String(
      await pyodide.runPythonAsync(
        `${PYTHON_JUDGE_HARNESS}\n_run_judge_harness(_judge_user_code, _judge_tests_json)`
      )
    );
    const parsed = JSON.parse(rawJson) as {
      compileError: string | null;
      stdout: string;
      results: TestCaseResult[];
    };

    const durationMs = Math.max(1, Math.round(performance.now() - started));

    if (parsed.compileError) {
      return {
        subModuleId: subModule.id,
        mode: 'py_unit_test',
        runKind,
        passed: false,
        score: 0,
        scoreLabel: '0% (Syntax / Runtime Error)',
        durationMs,
        xpAwarded: 0,
        stdout: parsed.stdout || '',
        error: parsed.compileError,
        sampleResults: [],
        hiddenResults: [],
        timestamp: new Date().toISOString(),
        submittedFilename,
      };
    }

    const sampleResults = parsed.results.filter((r) => r.visibility === 'sample');
    const hiddenResults = parsed.results.filter((r) => r.visibility === 'hidden');
    const totalCount = parsed.results.length;
    const passedCount = parsed.results.filter((r) => r.passed).length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    const passed =
      runKind === 'submit'
        ? score >= subModule.challenge.passing_threshold && totalCount > 0
        : score === 100 && totalCount > 0;

    return {
      subModuleId: subModule.id,
      mode: 'py_unit_test',
      runKind,
      passed,
      score,
      scoreLabel: `${passedCount}/${totalCount} Tests (${score}%)`,
      durationMs,
      xpAwarded: runKind === 'submit' && passed ? subModule.challenge.xp_reward : 0,
      stdout: parsed.stdout || '',
      sampleResults,
      hiddenResults,
      metrics: [
        {
          label: 'Sample Tests',
          value: `${sampleResults.filter((r) => r.passed).length}/${sampleResults.length}`,
        },
        ...(runKind === 'submit'
          ? [
              {
                label: 'Hidden Tests',
                value: `${hiddenResults.filter((r) => r.passed).length}/${hiddenResults.length}`,
                highlight: true,
              },
            ]
          : []),
        { label: 'Pass Rate', value: `${score}%`, highlight: passed },
      ],
      timestamp: new Date().toISOString(),
      submittedFilename,
    };
  } finally {
    pyodide.globals.delete('_judge_user_code');
    pyodide.globals.delete('_judge_tests_json');
  }
}
