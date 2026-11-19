import type { TrackSpec } from '@/types/curriculum';

export const TRACK_02: TrackSpec = {
  id: 'track-02',
  number: 2,
  shortLabel: '02',
  name: 'NumPy & Pandas',
  categoryLabel: 'NumPy & Pandas',
  subtitle: 'Data Foundation: N-Dimensional Tensors, Matrix Math, DataFrame Cleaning & Feature Bridges',
  badgeHex: '#DDA9FF',
  prerequisiteTrackId: 'track-01',
  pdfSourceLabel: 'Module 02 PDF — NumPy & Pandas for ML/DL (Pages 1–7)',
  libraries: ['numpy', 'pandas'],
  module_wrapup: {
    certificate_title: 'NumPy & Pandas Data Engineering',
    certificate_subtitle: 'Mastered tensor shapes, vectorized matrix math, DataFrame cleaning, grouping, encoding, and float32 model bridges.',
    key_takeaways: [
      'NumPy stores homogeneous numbers in contiguous C-backed ndarrays—orders of magnitude faster than Python lists for 1M+ samples.',
      'Always verify .shape, .ndim, and .dtype (float32 for Deep Learning) before passing tensors into layers to prevent matmul shape errors.',
      'Vectorized standardization (X - np.mean(X, axis=0)) / np.std(X, axis=0) and matrix multiplication X @ W + b replace slow Python for-loops.',
      'np.argmax converts class probability vectors into predicted class indices; np.where acts as vectorized if-else thresholding.',
      'Pandas DataFrames inspect tabular data via .head(), .info(), .describe(), and .isnull().sum(), and slice via label (.loc) or position (.iloc).',
      'Standard industry flow: Raw CSV -> Pandas DataFrame (fillna, groupby feature engineering, get_dummies) -> NumPy float32 array -> ML/DL model.',
    ],
    quick_reference_headers: ['Library / Stage', 'Essential Functions & Roles'],
    quick_reference_rows: [
      ['NumPy (np)', '.shape, .ndim, .dtype, .reshape(2, -1), A @ B, np.mean(), np.std(), np.argmax(), np.where(), np.concatenate()'],
      ['Pandas (pd)', 'pd.read_csv(), .head(), .info(), .describe(), .isnull().sum(), .fillna(), .loc/.iloc, .value_counts(), .groupby(), pd.get_dummies(), .to_numpy()'],
      ['ML/DL Bridge', 'CSV -> Pandas DataFrame (Clean & One-Hot Encode) -> .to_numpy().astype(np.float32) -> Scikit-Learn / PyTorch'],
    ],
  },
  subModules: [
    {
      id: '2.1',
      trackId: 'track-02',
      order: 1,
      code: '2.1',
      title: 'NumPy Arrays, Tensor Dimensions & Reshape',
      subtitle: 'Inspecting .shape, .ndim, .dtype and flattening 2D images into 1D/2D model tensors.',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Easy',
      estMinutes: 20,
      theory: {
        intro:
          'Plain Python lists store every number as a separate boxed object in memory, making 1 million patient records or pixels sluggish. NumPy stores numbers contiguously in a dense C-backed ndarray.',
        why_it_matters:
          'Most beginner Deep Learning crashes look like `RuntimeError: mat1 and mat2 shapes cannot be multiplied`. Checking .shape, .ndim, and .dtype catches tensor mismatches before training starts.',
        history_brief:
          'Created in 2005 by Travis Oliphant by unifying Numeric and Numarray, NumPy became the shared numerical backbone behind Pandas, Scikit-Learn, and PyTorch.',
        visual_diagram_id: 'np-tensor-dims',
        key_rule: 'Use arr.reshape(batch, -1) to let NumPy auto-compute the flattened feature dimension.',
        syntax_breakdown: [
          { token: 'np.array(...)', syntax: 'm = np.array([[1, 2, 3], [4, 5, 6]])', description: 'Creates a 2D matrix with shape (2, 3).' },
          { token: '.shape / .ndim', syntax: 'm.shape -> (2, 3), m.ndim -> 2', description: 'Inspects axis lengths and rank of the tensor.' },
          { token: '.dtype', syntax: 'm.astype(np.float32)', description: 'DL models expect float32 rather than default int64.' },
          { token: '.reshape()', syntax: 'img.reshape(1, -1)', description: 'Reshapes a (28, 28) image into a (1, 784) feature vector.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Cast a NumPy matrix to float32 and flatten it into a single row vector.',
        codeTemplate: `arr = np.array(grid, dtype=np.___0___)\nflat = arr.___1___(1, -1)`,
        blanks: [
          { id: 'b0', answer: 'float32', placeholder: 'dtype' },
          { id: 'b1', answer: 'reshape', placeholder: 'method' },
        ],
        wordBank: ['reshape', 'float32', 'int64', 'flatten_to', 'ndim'],
        hint: 'Deep Learning expects float32 precision, and .reshape(1, -1) auto-computes column count.',
        explanation: 'Using dtype=np.float32 converts ints to 32-bit floats; reshape(1, -1) packs all items into 1 row.',
      },
      challenge: {
        id: 'chal-2-1',
        difficulty_kyu: '6 Kyu',
        xp_reward: 160,
        title: 'Tensor Inspector & Image Flattener',
        instructions:
          'Implement inspect_and_flatten(grid_2d) to inspect a 2D pixel list/array and convert it into a float32 row vector ready for a neural network.',
        requirements: [
          'Convert grid_2d into a NumPy array with dtype np.float32.',
          'Validate that the converted array has ndim == 2 (raise ValueError otherwise).',
          'Return {"orig_shape": arr.shape, "ndim": arr.ndim, "dtype": str(arr.dtype), "flat": arr.reshape(1, -1)}.',
        ],
        starter_file_url: '/starters/track02_01_numpy_shapes.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 NumPy Tests Pass',
        default_tasks: [
          'Convert input to np.float32 ndarray.',
          'Guard ndim != 2 with ValueError.',
          'Verify .reshape(1, -1) produces (1, rows * cols).',
        ],
        starter_code: `import numpy as np

def inspect_and_flatten(grid_2d):
    # Convert to float32 array, check ndim == 2, flatten to (1, -1)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '2.1-s1',
              name: 'Flattens 2x3 matrix into (1, 6) float32 tensor',
              visibility: 'sample',
              testCode: `
res = inspect_and_flatten([[1, 2, 3], [4, 5, 6]])
assert res["orig_shape"] == (2, 3)
assert res["ndim"] == 2
assert res["dtype"] == "float32"
assert res["flat"].shape == (1, 6)
assert str(res["flat"].dtype) == "float32"
`,
            },
            {
              id: '2.1-s2',
              name: 'Flattens 28x28 synthetic image to (1, 784)',
              visibility: 'sample',
              testCode: `
img = np.ones((28, 28))
res = inspect_and_flatten(img)
assert res["orig_shape"] == (28, 28)
assert res["flat"].shape == (1, 784)
`,
            },
            {
              id: '2.1-h1',
              name: 'Rejects 1D or 3D tensors with ValueError',
              visibility: 'hidden',
              testCode: `
for bad in [[1, 2, 3], np.zeros((2, 2, 3))]:
    ok = False
    try:
        inspect_and_flatten(bad)
    except ValueError:
        ok = True
    assert ok, "Non-2D input must raise ValueError"
`,
            },
            {
              id: '2.1-h2',
              name: 'Preserves exact element order during reshape',
              visibility: 'hidden',
              testCode: `
res = inspect_and_flatten([[10, 20], [30, 40]])
assert np.allclose(res["flat"], np.array([[10.0, 20.0, 30.0, 40.0]], dtype=np.float32))
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Always verify .shape, .ndim, and .dtype before matrix multiplications.',
          'reshape(1, -1) flattens 2D grids without manually computing total pixel count.',
        ],
        reflection_prompt: 'Note why Deep Learning frameworks prefer float32 over float64 or int64.',
      },
    },
    {
      id: '2.2',
      trackId: 'track-02',
      order: 2,
      code: '2.2',
      title: 'Vectorized Math, Broadcasting & Linear Layer',
      subtitle: 'Standardization, matrix multiplication (@), np.argmax, and np.where without Python loops.',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Medium',
      estMinutes: 25,
      theory: {
        intro:
          'Every dense neural network layer computes `Z = X @ W + b`. NumPy broadcasting lets you normalize entire matrices and convert logits into decisions in one vectorized line.',
        why_it_matters:
          'Feature standardization prevents large-scale columns (like salary) from dominating small-scale columns (like age), while @ runs C/BLAS dot products at peak speed.',
        history_brief:
          'Python 3.5 introduced the dedicated `@` matrix multiplication operator (PEP 465) specifically to clarify numerical & deep learning code.',
        visual_diagram_id: 'np-matmul-broadcast',
        key_rule: 'Standardize columns via (X - np.mean(X, axis=0)) / np.std(X, axis=0), then project with X @ W + b.',
        syntax_breakdown: [
          { token: 'Standardize', syntax: '(X - X.mean(axis=0)) / X.std(axis=0)', description: 'Centers each feature column at mean 0, std 1.' },
          { token: 'A @ B', syntax: 'logits = (X_norm @ W) + b', description: 'Matrix multiplication plus bias broadcasting.' },
          { token: 'np.argmax', syntax: 'np.argmax(logits, axis=1)', description: 'Returns index of largest logit/probability per sample.' },
          { token: 'np.where', syntax: 'np.where(probs >= 0.5, 1, 0)', description: 'Vectorized conditional mapping across entire arrays.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute matrix multiplication logits and pick the winning class index per row.',
        codeTemplate: `logits = (X_norm ___0___ W) + b\npred_classes = np.___1___(logits, axis=1)`,
        blanks: [
          { id: 'b0', answer: '@', placeholder: 'op' },
          { id: 'b1', answer: 'argmax', placeholder: 'fn' },
        ],
        wordBank: ['argmax', '@', '*', 'max', 'where'],
        hint: 'Use @ for matrix multiplication (not elementwise *) and np.argmax to obtain the winning index.',
        explanation: '@ performs true linear algebra matrix multiplication; np.argmax(..., axis=1) returns the column index with the highest score.',
      },
      challenge: {
        id: 'chal-2-2',
        difficulty_kyu: '5 Kyu',
        xp_reward: 180,
        title: 'NumPy Neural Layer Simulator',
        instructions:
          'Implement standardize_features(X) and run_linear_classifier(X, W, b, pass_class_min=1) using vectorized NumPy operations.',
        requirements: [
          'standardize_features(X): returns (X - mean) / std along axis=0; replace 0 std with 1.0 to avoid NaN.',
          'run_linear_classifier(X, W, b, pass_class_min=1): standardizes X, computes logits = X_norm @ W + b, pred_classes = np.argmax(logits, axis=1), and labels = np.where(pred_classes >= pass_class_min, "Pass", "Fail").',
          'Return {"logits": logits, "pred_classes": pred_classes, "labels": labels}.',
        ],
        starter_file_url: '/starters/track02_02_matmul.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Vectorized Math Tests Pass',
        default_tasks: [
          'Handle zero-variance columns safely in standardize_features().',
          'Implement X_norm @ W + b without Python loops.',
          'Apply np.argmax(axis=1) and np.where() for class decisions.',
        ],
        starter_code: `import numpy as np

def standardize_features(X):
    # Compute mean & std along axis=0 (replace 0 std with 1.0)
    pass

def run_linear_classifier(X, W, b, pass_class_min=1):
    # Standardize X, compute logits = X_norm @ W + b, apply argmax & where
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '2.2-s1',
              name: 'Standardizes feature columns to mean 0 and std 1',
              visibility: 'sample',
              testCode: `
X = np.array([[100.0, 20.0], [150.0, 35.0], [200.0, 50.0]])
Xn = standardize_features(X)
assert np.allclose(Xn.mean(axis=0), [0.0, 0.0], atol=1e-6)
assert np.allclose(Xn.std(axis=0), [1.0, 1.0], atol=1e-6)
`,
            },
            {
              id: '2.2-s2',
              name: 'Computes logits, argmax classes, and Pass/Fail labels',
              visibility: 'sample',
              testCode: `
X = np.array([[100.0, 20.0], [150.0, 35.0], [200.0, 50.0]])
W = np.array([[1.0, 0.0, -1.0], [0.5, 0.5, -0.5]])
b = np.array([[0.0, 0.2, 0.0]])
out = run_linear_classifier(X, W, b, pass_class_min=1)
assert out["logits"].shape == (3, 3)
assert list(out["pred_classes"]) == [2, 1, 0]
assert list(out["labels"]) == ["Pass", "Pass", "Fail"]
`,
            },
            {
              id: '2.2-h1',
              name: 'Safely handles constant column (std == 0) without NaN',
              visibility: 'hidden',
              testCode: `
X = np.array([[5.0, 10.0], [5.0, 20.0]])
Xn = standardize_features(X)
assert not np.isnan(Xn).any(), "Zero std column produced NaN"
assert np.allclose(Xn[:, 0], [0.0, 0.0])
`,
            },
            {
              id: '2.2-h2',
              name: 'Respects custom pass_class_min threshold',
              visibility: 'hidden',
              testCode: `
X = np.array([[0.0, 0.0], [10.0, 10.0]])
W = np.array([[-1.0, 1.0], [-1.0, 1.0]])
b = np.zeros((1, 2))
out = run_linear_classifier(X, W, b, pass_class_min=2)
assert list(out["labels"]) == ["Fail", "Fail"]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Vectorized NumPy operations eliminate slow Python loops.',
          'Always guard std == 0 columns before dividing during standardization.',
        ],
        reflection_prompt: 'Note how bias shape (1, classes) broadcasts cleanly across every sample row in X_norm @ W + b.',
      },
    },
    {
      id: '2.3',
      trackId: 'track-02',
      order: 3,
      code: '2.3',
      title: 'Pandas DataFrames: Inspection & Slicing',
      subtitle: 'Navigating labeled rows/columns with .head(), .isnull().sum(), .loc, .iloc, and .value_counts().',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Medium',
      estMinutes: 20,
      theory: {
        intro:
          'Real business datasets arrive as mixed-type CSV tables containing text, dates, numbers, and missing cells. Pandas DataFrames give you programmable Excel power in Python.',
        why_it_matters:
          '80% of an AI engineer’s project time goes into auditing schemas, counting NaNs, checking target imbalance, and slicing subsets before modeling.',
        history_brief:
          'Wes McKinney created Pandas in 2008 at AQR Capital Management to perform fast panel-data analysis in Python.',
        visual_diagram_id: 'pd-dataframe-anatomy',
        key_rule: 'df.loc[row_condition, col_names] selects by label/boolean mask; df.iloc[row_idx, col_idx] slices strictly by integer position.',
        syntax_breakdown: [
          { token: '.isnull().sum()', syntax: 'df.isnull().sum()', description: 'Counts missing (NaN) cells per column.' },
          { token: '.loc[...]', syntax: 'df.loc[df["age"] > 25, "city"]', description: 'Label & boolean-condition selection.' },
          { token: '.iloc[...]', syntax: 'df.iloc[0:2, 0:2]', description: 'Integer-position slicing (stop exclusive).' },
          { token: '.value_counts()', syntax: 'df["purchased"].value_counts()', description: 'Detects target class distribution / imbalance.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Select cities where age >= 30 using label indexing, and slice the first 2 rows & columns by integer position.',
        codeTemplate: `cities = df.___0___[df["age"] >= 30, "city"]\nslice_df = df.___1___[:2, :2]`,
        blanks: [
          { id: 'b0', answer: 'loc', placeholder: 'label' },
          { id: 'b1', answer: 'iloc', placeholder: 'pos' },
        ],
        wordBank: ['iloc', 'loc', 'slice', 'where', 'at'],
        hint: 'Use .loc for boolean/column-name indexing and .iloc for integer positions.',
        explanation: '.loc matches boolean conditions and column names; .iloc slices strictly by 0-based row and column integers.',
      },
      challenge: {
        id: 'chal-2-3',
        difficulty_kyu: '5 Kyu',
        xp_reward: 180,
        title: 'DataFrame Audit & Slicer',
        instructions:
          'Implement audit_dataframe(df, min_age) to audit missing values, check target balance, filter adult customers with .loc, and slice top features with .iloc.',
        requirements: [
          'missing_map: dict mapping each column name to integer count of missing values (native int).',
          'target_counts: dict from df["purchased"].value_counts().to_dict() with native int keys/values.',
          'filtered_cities: list of city names where df["age"] >= min_age using .loc.',
          'preview_slice: df.iloc[:2, :2] returned as a DataFrame.',
        ],
        starter_file_url: '/starters/track02_03_pandas_slice.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Pandas Audit Tests Pass',
        default_tasks: [
          'Compute df.isnull().sum() per column.',
          'Filter rows with df.loc[df["age"] >= min_age, "city"].',
          'Check df.iloc[:2, :2] behavior on small tables.',
        ],
        starter_code: `import pandas as pd

def audit_dataframe(df, min_age=28):
    # Return missing_map, target_counts, filtered_cities, preview_slice
    pass
`,
        test_suite: {
          requiredPackages: ['pandas', 'numpy'],
          pyTests: [
            {
              id: '2.3-s1',
              name: 'Audits missing counts and target balance',
              visibility: 'sample',
              testCode: `
import numpy as np
df = pd.DataFrame({
    "city": ["Jakarta", "Bandung", "Jakarta", "Surabaya"],
    "age": [25, 32, np.nan, 45],
    "purchased": [0, 1, 0, 1]
})
out = audit_dataframe(df, min_age=30)
assert out["missing_map"] == {"city": 0, "age": 1, "purchased": 0}
assert out["target_counts"] == {0: 2, 1: 2}
assert out["filtered_cities"] == ["Bandung", "Surabaya"]
assert out["preview_slice"].shape == (2, 2)
`,
            },
            {
              id: '2.3-s2',
              name: 'Uses inclusive >= min_age filter',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({"city": ["Medan", "Bali"], "age": [28, 27], "purchased": [1, 0]})
out = audit_dataframe(df, min_age=28)
assert out["filtered_cities"] == ["Medan"]
`,
            },
            {
              id: '2.3-h1',
              name: 'Handles single-row DataFrame safely on iloc[:2, :2]',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({"city": ["Solo"], "age": [40], "purchased": [1]})
out = audit_dataframe(df, min_age=18)
assert out["preview_slice"].shape == (1, 2)
assert out["filtered_cities"] == ["Solo"]
`,
            },
            {
              id: '2.3-h2',
              name: 'Converts counts cleanly to native Python ints',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({"city": ["A", "B"], "age": [None, None], "purchased": [1, 1]})
out = audit_dataframe(df, min_age=20)
assert out["missing_map"]["age"] == 2
assert out["filtered_cities"] == []
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          '.isnull().sum() and .value_counts() are your first health checks on every dataset.',
          'Remember: .loc uses labels/conditions; .iloc uses 0-based integer positions.',
        ],
        reflection_prompt: 'What could go wrong if you feed a column with NaN values directly into Scikit-Learn?',
      },
    },
    {
      id: '2.4',
      trackId: 'track-02',
      order: 4,
      code: '2.4',
      title: 'Filtering, Grouping & Aggregation',
      subtitle: 'Boolean masking, split-apply-combine with .groupby(), .agg(), and sorting tabular data.',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Medium',
      estMinutes: 20,
      theory: {
        intro:
          'Before training any AI model, you constantly slice subsets ("only high-value customers") and summarize segments ("average salary per city"). Pandas does this in one readable line with **boolean masks** and **`.groupby()`**.',
        why_it_matters:
          'Split-Apply-Combine (`groupby` + `agg`) lets you discover hidden patterns across categories and build rich group-level features.',
        history_brief:
          'Hadley Wickham popularized the Split-Apply-Combine strategy, which Pandas turned into one of Python’s most iconic APIs.',
        visual_diagram_id: 'pd-groupby-split',
        key_rule: 'Combine multiple filter conditions with `&` (AND) or `|` (OR) and wrap each condition in parentheses: `df[(df["age"] >= 25) & (df["salary_m"] > 10)]`.',
        syntax_breakdown: [
          { token: 'Boolean Mask', syntax: 'df[df["salary_m"] >= 10]', description: 'Keeps only rows where the condition is True.' },
          { token: '.groupby()', syntax: 'df.groupby("city")["salary_m"].mean()', description: 'Splits rows by city and computes mean salary.' },
          { token: '.sort_values()', syntax: 'df.sort_values("salary_m", ascending=False)', description: 'Sorts rows from highest to lowest.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Filter rows where `score >= 80` and compute the average `score` per `team`.',
        codeTemplate: `top = df[df["score"] >= 80]\navg_by_team = top.___0___("team")["score"].___1___()`,
        blanks: [
          { id: 'b0', answer: 'groupby', placeholder: 'split' },
          { id: 'b1', answer: 'mean', placeholder: 'agg' },
        ],
        wordBank: ['groupby', 'mean', 'filter', 'split', 'avg'],
        hint: 'Use `.groupby("team")` followed by `.mean()`.',
        explanation: '`.groupby()` partitions the table by category, and `.mean()` summarizes each group cleanly.',
      },
      challenge: {
        id: 'chal-2-4-group',
        difficulty_kyu: '5 Kyu',
        xp_reward: 170,
        title: 'Segment Filter & Group Aggregator',
        instructions:
          'Implement `summarize_high_earners(df, min_salary=10.0)` to filter rows where `salary_m >= min_salary`, compute average `salary_m` per `city`, and return the top city name.',
        requirements: [
          'Filter `df` to keep only rows with `salary_m >= min_salary`.',
          'Compute `city_means = filtered.groupby("city")["salary_m"].mean().to_dict()`.',
          'Find `top_city` (the city with the highest average salary).',
          'Return `{"count": len(filtered), "city_means": city_means, "top_city": top_city}`.',
        ],
        starter_file_url: '/starters/track02_04_groupby.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 GroupBy Tests Pass',
        default_tasks: [
          'Apply a boolean mask for salary_m >= min_salary.',
          'Group by city and compute mean salary_m.',
          'Return count, city_means dict, and top_city.',
        ],
        starter_code: `import pandas as pd

def summarize_high_earners(df, min_salary=10.0):
    # 1. Filter rows where salary_m >= min_salary
    # 2. Group by "city" and compute mean of "salary_m"
    # 3. Return {"count": ..., "city_means": ..., "top_city": ...}
    pass
`,
        test_suite: {
          requiredPackages: ['pandas'],
          pyTests: [
            {
              id: '2.4g-s1',
              name: 'Filters and groups sample city salaries correctly',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({
    "city": ["Jakarta", "Bandung", "Jakarta", "Surabaya", "Bandung"],
    "salary_m": [8.0, 12.0, 14.0, 20.0, 10.0],
})
out = summarize_high_earners(df, min_salary=10.0)
assert out["count"] == 4, f"Expected count 4, got {out['count']}"
assert abs(out["city_means"]["Bandung"] - 11.0) < 1e-6
assert out["top_city"] == "Surabaya"
`,
            },
            {
              id: '2.4g-s2',
              name: 'Respects custom min_salary threshold',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({"city": ["A", "B", "B"], "salary_m": [9.0, 15.0, 25.0]})
out = summarize_high_earners(df, min_salary=12.0)
assert out["count"] == 2 and out["top_city"] == "B"
`,
            },
            {
              id: '2.4g-h1',
              name: 'Computes exact floating-point group means',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({"city": ["X", "X", "Y"], "salary_m": [10.0, 20.0, 14.0]})
out = summarize_high_earners(df, min_salary=10.0)
assert abs(out["city_means"]["X"] - 15.0) < 1e-6 and out["top_city"] == "X"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Boolean masks (`df[df["col"] >= val]`) filter rows cleanly without loops.',
          '`.groupby(key)[col].mean()` implements Split-Apply-Combine in one readable expression.',
        ],
        reflection_prompt: 'What real-world business question could you answer with `.groupby()`?',
      },
    },
    {
      id: '2.5',
      trackId: 'track-02',
      order: 5,
      code: '2.5',
      title: 'Preparing Data for ML/DL',
      subtitle: 'Imputing NaNs, one-hot encoding text categories, and aligning float32 X and y tensors.',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Medium',
      estMinutes: 25,
      theory: {
        intro:
          'Scikit-Learn and PyTorch reject raw strings and NaN cells. This stage transforms dirty mixed DataFrames into clean, encoded `float32` feature matrices `X` and target vectors `y`.',
        why_it_matters:
          'Every real-world tabular project follows this bridge: Impute missing values -> One-Hot Encode categories -> Convert `.to_numpy().astype(np.float32)` -> Verify `X.shape[0] == y.shape[0]`.',
        history_brief:
          'Pandas unified tabular encoding with NumPy arrays so data wrangling and deep learning tensors live in one workflow.',
        visual_diagram_id: 'pd-ml-tensor-bridge',
        key_rule: 'Impute missing values BEFORE encoding/scaling, and convert categoricals with pd.get_dummies(..., dtype=int).',
        syntax_breakdown: [
          { token: '.fillna()', syntax: 'df["age"].fillna(df["age"].median())', description: 'Replaces NaN with robust median.' },
          { token: '.groupby()', syntax: 'df.groupby("city")["salary_m"].mean()', description: 'Aggregates numeric stats per category.' },
          { token: 'pd.get_dummies()', syntax: 'pd.get_dummies(df, columns=["city"], dtype=int)', description: 'One-hot encodes text columns into 0/1 flags.' },
          { token: '.to_numpy()', syntax: 'X = df_clean.drop(columns=["y"]).to_numpy().astype(np.float32)', description: 'Produces DL-ready float32 matrix X.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Impute missing ages with the median, then one-hot encode the "city" column as integers.',
        codeTemplate: `df["age"] = df["age"].___0___(df["age"].median())\ndf_enc = pd.___1___(df, columns=["city"], dtype=int)`,
        blanks: [
          { id: 'b0', answer: 'fillna', placeholder: 'impute' },
          { id: 'b1', answer: 'get_dummies', placeholder: 'encode' },
        ],
        wordBank: ['get_dummies', 'fillna', 'dropna', 'one_hot', 'replace'],
        hint: 'fillna() fills missing NaN cells, and pd.get_dummies() performs one-hot encoding in Pandas.',
        explanation: 'fillna(median) preserves rows while removing NaNs; pd.get_dummies converts string categories into 0/1 columns.',
      },
      challenge: {
        id: 'chal-2-4',
        difficulty_kyu: '4 Kyu',
        xp_reward: 200,
        title: 'Pandas-to-NumPy ML Bridge',
        instructions:
          'Clean missing age, compute city salary averages, add annual_salary, one-hot encode city, and return float32 NumPy tensors.',
        requirements: [
          'Work on df.copy() so caller DataFrame is untouched.',
          'Fill missing "age" with median of "age".',
          'Compute city_avg_salary = df_c.groupby("city")["salary_m"].mean().to_dict().',
          'Add column "annual_salary" = df_c["salary_m"] * 12.',
          'One-hot encode "city" via pd.get_dummies(..., columns=["city"], dtype=int).',
          'Split X = drop("bought_product").to_numpy().astype(np.float32) and y = df_encoded["bought_product"].to_numpy().',
          'Return {"X": X, "y": y, "city_avg_salary": city_avg_salary, "columns": list(df_encoded.columns)}.',
        ],
        starter_file_url: '/starters/track02_04_bridge.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Bridge Tests Pass',
        default_tasks: [
          'Impute NaN age with median before conversion.',
          'Engineer annual_salary = salary_m * 12.',
          'Verify X.dtype == np.float32 and no NaNs remain.',
        ],
        starter_code: `import numpy as np
import pandas as pd

def prepare_ml_tensors(df):
    # Clean missing ages, compute city salary mean, add annual_salary,
    # one-hot encode city, and return float32 X and y arrays
    pass
`,
        test_suite: {
          requiredPackages: ['pandas', 'numpy'],
          pyTests: [
            {
              id: '2.4-s1',
              name: 'Executes Module 02 Colab dataset bridge cleanly',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({
    "city": ["Jakarta", "Bandung", "Jakarta", "Surabaya", "Bandung"],
    "age": [25, 32, np.nan, 45, 29],
    "salary_m": [8.0, 12.0, 9.5, 20.0, 11.0],
    "bought_product": [0, 1, 0, 1, 1]
})
out = prepare_ml_tensors(df)
assert out["X"].dtype == np.float32
assert not np.isnan(out["X"]).any()
assert out["X"].shape == (5, 6)
assert out["y"].shape == (5,)
assert abs(out["city_avg_salary"]["Jakarta"] - 8.75) < 1e-6
assert "annual_salary" in out["columns"]
`,
            },
            {
              id: '2.4-s2',
              name: 'Does not mutate input DataFrame',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({"city": ["A", "B"], "age": [20.0, np.nan], "salary_m": [5.0, 10.0], "bought_product": [0, 1]})
_ = prepare_ml_tensors(df)
assert df["age"].isnull().sum() == 1
`,
            },
            {
              id: '2.4-h1',
              name: 'Verifies exact median imputation & annual_salary column math',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({
    "city": ["X", "X", "Y", "Y"],
    "age": [10.0, 30.0, 50.0, np.nan],
    "salary_m": [2.0, 4.0, 6.0, 8.0],
    "bought_product": [0, 0, 1, 1]
})
out = prepare_ml_tensors(df)
assert abs(out["X"][3, 0] - 30.0) < 1e-5
assert abs(out["city_avg_salary"]["Y"] - 7.0) < 1e-6
`,
            },
            {
              id: '2.4-h2',
              name: 'Checks y values match target column exactly',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({"city": ["A", "A"], "age": [22, 24], "salary_m": [10.0, 15.0], "bought_product": [1, 0]})
out = prepare_ml_tensors(df)
assert list(out["y"]) == [1, 0]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'The standard data bridge goes CSV -> Pandas cleaning & encoding -> NumPy float32.',
          'Median imputation resists skewed extreme outliers much better than mean.',
        ],
        reflection_prompt: 'Note how groupby() lets you craft aggregate features per segment.',
      },
    },
    {
      id: '2.6',
      trackId: 'track-02',
      order: 6,
      code: '2.6',
      title: 'NumPy & Pandas Final Exam: Feature Store',
      subtitle: 'Capstone Assessment combining missing-target drops, IQR clipping, encoding, and Z-score float32 export.',
      categoryLabel: 'NumPy & Pandas',
      difficulty: 'Hard',
      estMinutes: 35,
      theory: {
        intro:
          'Production feature stores combine Pandas sanitization with NumPy standardization so upstream sensor/transaction glitches never destabilize neural weights.',
        why_it_matters:
          'Passing this capstone proves you can convert messy business CSVs into standardized, outlier-safe float32 matrices ready for Scikit-Learn or PyTorch.',
        history_brief:
          'Modern ML feature platforms automate the exact NumPy + Pandas transformations you build in this assessment.',
        visual_diagram_id: 'pd-bridge-capstone',
        key_rule: 'Drop NaN targets -> Impute numeric medians -> Clip IQR outliers -> One-Hot Encode -> Standardize -> float32.',
        syntax_breakdown: [
          { token: 'np.clip', syntax: 'np.clip(vals, q1 - 1.5*iqr, q3 + 1.5*iqr)', description: 'Caps extreme outliers safely.' },
          { token: 'Z-Score', syntax: '(X - mean) / std', description: 'Standardizes feature columns after encoding.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute IQR bounds and clip extreme feature values cleanly using NumPy.',
        codeTemplate: `iqr = q3 - q1\ncol_clipped = np.___0___(col_vals, q1 - 1.5 * iqr, q3 + 1.5 * ___1___)`,
        blanks: [
          { id: 'b0', answer: 'clip', placeholder: 'fn' },
          { id: 'b1', answer: 'iqr', placeholder: 'span' },
        ],
        wordBank: ['clip', 'iqr', 'clamp', 'std', 'mean'],
        hint: 'NumPy provides np.clip(arr, low, high) using 1.5 * iqr fences.',
        explanation: 'IQR outlier clipping keeps row counts intact while taming extreme values before Z-score scaling.',
      },
      challenge: {
        id: 'chal-2-5',
        difficulty_kyu: '3 Kyu',
        xp_reward: 400,
        is_final_exam: true,
        title: 'NumPy & Pandas Final Exam: Tabular Feature Store',
        instructions:
          'Implement build_feature_store(df, target_col="label") turning dirty tabular data into standardized float32 tensors with outlier clipping.',
        requirements: [
          'Copy input df and drop rows where target_col is NaN.',
          'For every numeric feature column (excluding target_col): impute NaN with median, then clip values to [Q1 - 1.5*IQR, Q3 + 1.5*IQR].',
          'For every string/object/category column (excluding target_col): fill NaN with "Unknown", then apply pd.get_dummies(..., dtype=int).',
          'Extract y as np.ndarray; extract X as float32 and Z-score standardize each column (guard std == 0 -> 1.0).',
          'Return {"X": X_std.astype(np.float32), "y": y, "feature_names": feature_names}.',
        ],
        starter_file_url: '/starters/track02_05_capstone.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 4 Capstone Pipeline Tests Pass',
        default_tasks: [
          'Drop missing target rows first so y has zero NaNs.',
          'Impute numeric medians BEFORE computing Q1/Q3 IQR bounds.',
          'Standardize X after get_dummies and verify float32 dtype.',
        ],
        starter_code: `import numpy as np
import pandas as pd

def build_feature_store(df, target_col="label"):
    # Clean target, impute & clip numeric cols, encode categoricals,
    # standardize X to float32, and return X, y, and feature_names
    pass
`,
        test_suite: {
          requiredPackages: ['pandas', 'numpy'],
          pyTests: [
            {
              id: '2.5-s1',
              name: 'Sanitizes NaNs, clips outlier, encodes categories, and standardizes',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({
    "segment": ["Pro", "Free", None, "Pro", "Free", "Pro"],
    "spend": [10.0, 12.0, np.nan, 11.0, 9.0, 9999.0],
    "label": [1, 0, 0, 1, 0, np.nan]
})
out = build_feature_store(df, target_col="label")
assert out["X"].shape[0] == 5, "Must drop row with NaN label"
assert out["y"].shape == (5,)
assert out["X"].dtype == np.float32
assert not np.isnan(out["X"]).any()
assert "segment_Unknown" in out["feature_names"]
assert np.allclose(out["X"].mean(axis=0), 0.0, atol=1e-5)
`,
            },
            {
              id: '2.5-s2',
              name: 'Clips extreme feature outlier inside remaining rows',
              visibility: 'sample',
              testCode: `
df = pd.DataFrame({
    "val": [10.0, 11.0, 12.0, 13.0, 1000.0],
    "label": [0, 0, 1, 1, 1]
})
out = build_feature_store(df)
assert np.allclose(out["X"].std(axis=0), [1.0], atol=1e-4)
`,
            },
            {
              id: '2.5-h1',
              name: 'Handles constant numeric column without NaN after standardization',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({
    "const": [5.0, 5.0, 5.0],
    "cat": ["A", "B", "A"],
    "label": [1, 0, 1]
})
out = build_feature_store(df)
assert not np.isnan(out["X"]).any()
assert np.allclose(out["X"][:, 0], [0.0, 0.0, 0.0])
`,
            },
            {
              id: '2.5-h2',
              name: 'Verifies exact IQR clipping math before standardization',
              visibility: 'hidden',
              testCode: `
df = pd.DataFrame({
    "x": [1.0, 2.0, 3.0, 4.0, 100.0],
    "label": [0, 0, 0, 1, 1]
})
out = build_feature_store(df)
assert abs(out["X"][4, 0] - 1.7483) < 0.05, f"Outlier wasn't IQR-clipped properly, z={out['X'][4,0]}"
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Dropping missing target rows upfront prevents invalid supervision labels.',
          'Order matters: impute -> IQR clip -> one-hot encode -> Z-score standardize.',
        ],
        reflection_prompt: 'Download your Track 02 completion summary before advancing to Machine Learning!',
      },
    },
  ],
};
