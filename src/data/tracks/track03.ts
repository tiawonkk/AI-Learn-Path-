import {
  TRACK03_EXAM_TRUTH,
  TRACK03_REG_TRUTH,
} from '@/lib/datasets';
import type { TrackSpec } from '@/types/curriculum';

export const TRACK_03: TrackSpec = {
  id: 'track-03',
  number: 3,
  shortLabel: '03',
  name: 'Machine Learning',
  categoryLabel: 'Machine Learning',
  subtitle:
    'End-to-End ML Sequence: Data Cleaning, EDA, Feature Engineering, Regression, Classification, Ensembles, Unsupervised, Evaluation & Storytelling',
  badgeHex: '#532B71',
  prerequisiteTrackId: 'track-02',
  pdfSourceLabel: 'Module 03 — End-to-End Machine Learning Engineering',
  libraries: ['scikit-learn', 'xgboost', 'lightgbm', 'numpy', 'pandas'],
  module_wrapup: {
    certificate_title: 'Classical Machine Learning Engineering',
    certificate_subtitle:
      'Mastered the complete end-to-end ML workflow from data cleaning and EDA through model families, tuning, and data storytelling.',
    key_takeaways: [
      'Garbage in, garbage out: handle missing values, duplicates, and outliers before touching any algorithm.',
      'EDA reveals skewed distributions, IQR outliers, correlations, and class imbalance so you pick the right preprocessing and metric.',
      'Prevent Data Leakage by splitting train/test first and fitting scalers/encoders strictly on X_train.',
      'Match models to data geometry: Linear/Ridge/Lasso for smooth trends, SVM/KNN/Logistic for boundaries, Random Forest/XGBoost/LightGBM for tabular dominance, K-Means/DBSCAN/PCA when labels do not exist.',
      'Never trust Accuracy on imbalanced datasets—evaluate with Precision, Recall, F1-Score, ROC-AUC, and cross-validation.',
      'Great ML engineers close the loop with Data Storytelling: translating feature importance/SHAP and metrics into clear business actions.',
    ],
    quick_reference_headers: ['ML Stage', 'Core Methods & Guardrails'],
    quick_reference_rows: [
      ['1. Cleaning & EDA', 'drop_duplicates(), fillna(median), IQR outlier fences, skewness, correlation, class balance check.'],
      ['2. Split & Features', 'train_test_split(stratify=y), StandardScaler fitted ONLY on X_train, One-Hot Encoding.'],
      ['3. Regression & Classif.', 'Linear/Ridge/Lasso, Decision Tree, Logistic Regression, SVM (margin/kernel), KNN (distance).'],
      ['4. Ensembles & Unsup.', 'Random Forest (Bagging), XGBoost/LightGBM (Boosting), K-Means, DBSCAN, PCA.'],
      ['5. Eval & Storytelling', 'Cross-Val, MAE/RMSE, Precision/Recall/F1/ROC-AUC, SHAP feature impact narrative.'],
    ],
  },
  subModules: [
    {
      id: '3.1',
      trackId: 'track-03',
      order: 1,
      code: '3.1',
      title: 'ML Mindset & Data Cleaning',
      subtitle: 'What ML learns, garbage-in garbage-out, missing values, duplicates, and outlier handling.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Easy',
      estMinutes: 18,
      theory: {
        intro:
          'Machine Learning learns mathematical patterns directly from historical examples instead of hard-coded `if/else` rules. Because models trust your data blindly, **Data Cleaning** is the #1 driver of real-world accuracy.',
        why_it_matters:
          'Duplicate rows bias model weights, `NaN` values crash training loops, and corrupted sensor outliers pull regression lines wildly off target.',
        history_brief:
          'In production ML teams, engineers spend 60–70% of project time auditing and cleaning data before comparing algorithms.',
        visual_diagram_id: 'ml-data-cleaning',
        key_rule: 'Always remove exact duplicates, impute missing values cleanly, and cap/flag impossible outliers BEFORE modeling.',
        syntax_breakdown: [
          { token: '.drop_duplicates()', syntax: 'df = df.drop_duplicates()', description: 'Removes identical duplicate rows.' },
          { token: '.fillna()', syntax: 'df["income"] = df["income"].fillna(med)', description: 'Fills missing numeric cells with median.' },
          { token: 'Outlier Clip', syntax: 'df["age"].clip(lower=18, upper=100)', description: 'Tames impossible values without losing rows.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Remove duplicate rows and fill missing values in `"income"` with the median.',
        codeTemplate: `df = df.___0___()\ndf["income"] = df["income"].___1___(df["income"].median())`,
        blanks: [
          { id: 'b0', answer: 'drop_duplicates', placeholder: 'dedupe' },
          { id: 'b1', answer: 'fillna', placeholder: 'impute' },
        ],
        wordBank: ['drop_duplicates', 'fillna', 'dropna', 'unique', 'clean'],
        hint: 'Use `.drop_duplicates()` and `.fillna(...)`.',
        explanation: 'Deduplicating and median-imputing guarantees clean rows before EDA and modeling.',
      },
      challenge: {
        id: 'chal-3-1',
        difficulty_kyu: '5 Kyu',
        xp_reward: 170,
        title: 'Clean a Dirty Customer Dataset',
        instructions:
          'Implement `clean_customer_data(df)` that removes duplicate rows, fills missing `"income"` with its median, clips `"age"` to `[18, 90]`, and returns the cleaned DataFrame.',
        requirements: [
          'Work on a copy (`df.copy()`) so the input DataFrame is not mutated.',
          'Drop exact duplicate rows with `.drop_duplicates()`.',
          'Fill missing `"income"` values with the median of `"income"`.',
          'Clip `"age"` to the range `[18, 90]` and reset the index (`reset_index(drop=True)`).',
        ],
        starter_file_url: '/starters/track03_01_cleaning.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Cleaning Checks Pass',
        default_tasks: [
          'Copy the DataFrame and remove duplicate rows.',
          'Impute missing income values using median.',
          'Clip age to [18, 90] and reset_index(drop=True).',
        ],
        starter_code: `import pandas as pd

def clean_customer_data(df):
    # 1. Copy df and drop duplicate rows
    # 2. Fill missing "income" with median
    # 3. Clip "age" to [18, 90] and reset_index(drop=True)
    pass
`,
        test_suite: {
          requiredPackages: ['pandas', 'numpy'],
          pyTests: [
            {
              id: '3.1-s1',
              name: 'Removes duplicates, fills NaN income, and clips age',
              visibility: 'sample',
              testCode: `
import numpy as np
raw = pd.DataFrame({
    "age": [25, 25, 140, 12],
    "income": [50.0, 50.0, np.nan, 80.0],
})
out = clean_customer_data(raw)
assert len(out) == 3, f"Expected 3 unique rows, got {len(out)}"
assert out["income"].isnull().sum() == 0
assert out["age"].max() == 90 and out["age"].min() == 18
assert abs(out.loc[1, "income"] - 65.0) < 1e-6
`,
            },
            {
              id: '3.1-s2',
              name: 'Does not mutate original DataFrame',
              visibility: 'sample',
              testCode: `
import numpy as np
raw = pd.DataFrame({"age": [15, 30], "income": [np.nan, 40.0]})
_ = clean_customer_data(raw)
assert raw["income"].isnull().sum() == 1 and raw["age"].min() == 15
`,
            },
            {
              id: '3.1-h1',
              name: 'Resets index cleanly to 0..N-1',
              visibility: 'hidden',
              testCode: `
raw = pd.DataFrame({"age": [20, 20, 40], "income": [10.0, 10.0, 30.0]})
out = clean_customer_data(raw)
assert list(out.index) == [0, 1]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'ML models amplify data issues—cleaning duplicates, NaNs, and outliers comes first.',
          'Always work on `.copy()` so raw audit tables stay intact.',
        ],
        reflection_prompt: 'What happens to a linear model if one corrupted row has `age = 999`?',
      },
    },
    {
      id: '3.2',
      trackId: 'track-03',
      order: 2,
      code: '3.2',
      title: 'Data Distribution & Exploratory Data Analysis (EDA)',
      subtitle: 'Normal vs skewed distributions, mean vs median, IQR spread, correlation, and class imbalance.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Easy',
      estMinutes: 20,
      theory: {
        intro:
          'Before choosing any model, **Exploratory Data Analysis (EDA)** shows you the shape of your data: Is income right-skewed? Are 98% of transactions non-fraud? Which features actually correlate with the target?',
        why_it_matters:
          'Skewed features distort distance-based models (KNN/Linear), and severe class imbalance makes plain Accuracy completely misleading.',
        history_brief:
          'Statistician John Tukey championed EDA so analysts look at distributions and quartiles before jumping to formulas.',
        visual_diagram_id: 'ml-eda-distribution',
        key_rule: 'When Mean >> Median, your distribution is right-skewed—use Median/IQR and consider log-scaling.',
        syntax_breakdown: [
          { token: 'IQR', syntax: 'iqr = q75 - q25', description: 'Measures the middle 50% spread, resistant to outliers.' },
          { token: 'Skew Check', syntax: 'is_right_skewed = mean > median', description: 'Quick diagnostic for long right tails.' },
          { token: 'Class Balance', syntax: 'pos_rate = np.mean(y == 1)', description: 'Detects rare positive classes before training.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute Q1 (25th percentile), Q3 (75th percentile), and the Interquartile Range (`iqr`).',
        codeTemplate: `q1, q3 = np.___0___(values, [25, 75])\niqr = q3 - ___1___`,
        blanks: [
          { id: 'b0', answer: 'percentile', placeholder: 'fn' },
          { id: 'b1', answer: 'q1', placeholder: 'lower' },
        ],
        wordBank: ['percentile', 'q1', 'median', 'mean', 'std'],
        hint: 'NumPy uses `np.percentile(values, [25, 75])` and `iqr = q3 - q1`.',
        explanation: 'IQR captures the central 50% spread and powers the classic `1.5 * IQR` outlier fence.',
      },
      challenge: {
        id: 'chal-3-2',
        difficulty_kyu: '5 Kyu',
        xp_reward: 180,
        title: 'EDA Distribution & Imbalance Profiler',
        instructions:
          'Implement `profile_distribution(values, labels)` returning mean, median, IQR, a skewness label (`"right_skewed"` if `mean > median * 1.1`, `"left_skewed"` if `mean < median * 0.9`, else `"symmetric"`), and `is_imbalanced` (`True` if positive label rate `< 0.2` or `> 0.8`).',
        requirements: [
          'Compute `mean`, `median`, and `iqr = q3 - q1` using NumPy.',
          'Classify `skew_label` using the 10% mean-vs-median threshold.',
          'Compute `positive_rate = float(np.mean(np.array(labels) == 1))` and `is_imbalanced = positive_rate < 0.2 or positive_rate > 0.8`.',
          'Return `{"mean": ..., "median": ..., "iqr": ..., "skew_label": ..., "is_imbalanced": ...}`.',
        ],
        starter_file_url: '/starters/track03_02_eda.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 EDA Checks Pass',
        default_tasks: [
          'Compute mean, median, and IQR with NumPy.',
          'Classify skew_label as right_skewed, left_skewed, or symmetric.',
          'Flag imbalanced binary labels when positive_rate < 0.2 or > 0.8.',
        ],
        starter_code: `import numpy as np

def profile_distribution(values, labels):
    # Compute mean, median, iqr, skew_label, and is_imbalanced
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '3.2-s1',
              name: 'Detects right-skewed income & imbalanced fraud labels',
              visibility: 'sample',
              testCode: `
vals = [10, 12, 14, 15, 16, 18, 200]
lbls = [0, 0, 0, 0, 0, 0, 1]
out = profile_distribution(vals, lbls)
assert out["skew_label"] == "right_skewed", f"Got {out['skew_label']}"
assert out["is_imbalanced"] is True
assert abs(out["median"] - 15.0) < 1e-6
`,
            },
            {
              id: '3.2-s2',
              name: 'Detects symmetric distribution & balanced labels',
              visibility: 'sample',
              testCode: `
vals = [10, 20, 30, 40, 50]
lbls = [0, 1, 0, 1, 0]
out = profile_distribution(vals, lbls)
assert out["skew_label"] == "symmetric"
assert out["is_imbalanced"] is False
assert abs(out["iqr"] - 20.0) < 1e-6
`,
            },
            {
              id: '3.2-h1',
              name: 'Detects left-skewed distribution cleanly',
              visibility: 'hidden',
              testCode: `
vals = [1, 80, 82, 85, 88, 90]
lbls = [1, 1, 1, 0, 0, 0]
out = profile_distribution(vals, lbls)
assert out["skew_label"] == "left_skewed" and out["is_imbalanced"] is False
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Compare Mean vs Median and IQR to spot skewed tails before scaling.',
          'Always inspect class balance so you pick F1/ROC-AUC instead of plain Accuracy.',
        ],
        reflection_prompt: 'Why is median more trustworthy than mean for household income?',
      },
    },
    {
      id: '3.3',
      trackId: 'track-03',
      order: 3,
      code: '3.3',
      title: 'Feature Engineering & Train/Test Split',
      subtitle: 'Scaling, encoding, stratified splits, and preventing Train-Test Data Leakage.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 20,
      theory: {
        intro:
          'To measure how well a model generalizes to unseen future users, you split data into **Train** and **Test** sets FIRST. The golden rule of ML engineering: fit scalers and encoders **ONLY** on `X_train`, then apply those exact parameters to `X_test`.',
        why_it_matters:
          'Fitting a `StandardScaler` on the full dataset leaks test-set mean and standard deviation into training, producing fake high scores that collapse in production.',
        history_brief:
          'Scikit-Learn popularized `Pipeline` objects specifically to make leakage-free feature transformations automatic.',
        visual_diagram_id: 'ml-pipeline-leakage',
        key_rule: 'Split FIRST -> `fit_transform(X_train)` -> `transform(X_test)`. Never call `fit()` on test data!',
        syntax_breakdown: [
          { token: 'train_test_split', syntax: 'train_test_split(X, y, test_size=0.2, stratify=y)', description: 'Keeps class ratios identical across splits.' },
          { token: 'fit_transform', syntax: 'X_tr = (X_train - mu) / sigma', description: 'Learns scaling stats ONLY from X_train.' },
          { token: 'transform', syntax: 'X_te = (X_test - mu) / sigma', description: 'Applies training stats to unseen X_test.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Scale X_train with fit_transform and apply the learned scaler to X_test with transform.',
        codeTemplate: `X_tr_scaled = scaler.___0___(X_train)\nX_te_scaled = scaler.___1___(X_test)`,
        blanks: [
          { id: 'b0', answer: 'fit_transform', placeholder: 'train' },
          { id: 'b1', answer: 'transform', placeholder: 'test' },
        ],
        wordBank: ['fit_transform', 'transform', 'fit', 'predict', 'split'],
        hint: 'Learn statistics on train (`fit_transform`), apply only (`transform`) on test.',
        explanation: 'Using `transform(X_test)` guarantees zero test-set information leaks into training.',
      },
      challenge: {
        id: 'chal-3-3',
        difficulty_kyu: '4 Kyu',
        xp_reward: 200,
        title: 'Leakage-Free StandardScaler Pipeline',
        instructions:
          'Implement `leakage_free_scale(X_train, X_test)` computing `mean` and `std` ONLY from `X_train` (replacing zero std with `1.0`), then scaling both splits.',
        requirements: [
          'Compute `train_mean = np.mean(X_train, axis=0)` and `train_std = np.std(X_train, axis=0)`.',
          'Guard zero variance: `safe_std = np.where(train_std == 0, 1.0, train_std)`.',
          'Return `{"X_train_scaled": ..., "X_test_scaled": ..., "train_mean": train_mean, "train_std": safe_std}`.',
        ],
        starter_file_url: '/starters/track03_01_leakfree.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Anti-Leakage Tests Pass',
        default_tasks: [
          'Compute mean and std strictly along axis=0 of X_train.',
          'Guard constant columns (std == 0) with 1.0.',
          'Scale X_test using train_mean and safe_std.',
        ],
        starter_code: `import numpy as np

def leakage_free_scale(X_train, X_test):
    # Compute mean & std ONLY on X_train, guard std == 0, scale both splits
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '3.3-s1',
              name: 'Fits strictly on X_train and scales shifted X_test cleanly',
              visibility: 'sample',
              testCode: `
X_tr = np.array([[10.0, 100.0], [20.0, 200.0], [30.0, 300.0]])
X_te = np.array([[40.0, 400.0], [50.0, 500.0]])
out = leakage_free_scale(X_tr, X_te)
assert np.allclose(out["train_mean"], [20.0, 200.0])
assert np.allclose(np.mean(out["X_train_scaled"], axis=0), [0.0, 0.0], atol=1e-6)
assert out["X_test_scaled"][0, 0] > 2.0
`,
            },
            {
              id: '3.3-s2',
              name: 'Handles constant zero-variance columns without NaN',
              visibility: 'sample',
              testCode: `
X_tr = np.array([[5.0, 1.0], [5.0, 3.0]])
X_te = np.array([[5.0, 5.0]])
out = leakage_free_scale(X_tr, X_te)
assert not np.isnan(out["X_train_scaled"]).any()
assert not np.isnan(out["X_test_scaled"]).any()
`,
            },
            {
              id: '3.3-h1',
              name: 'Verifies exact train_std values',
              visibility: 'hidden',
              testCode: `
X_tr = np.array([[0.0], [2.0], [4.0]])
X_te = np.array([[6.0]])
out = leakage_free_scale(X_tr, X_te)
expected_std = np.std(X_tr, axis=0)
assert np.allclose(out["X_test_scaled"], (X_te - 2.0) / expected_std)
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Always split Train and Test BEFORE fitting any scaler or imputer.',
          'Guarding `std == 0` prevents `NaN` division errors on constant columns.',
        ],
        reflection_prompt: 'Why does stratified splitting matter when predicting rare events?',
      },
    },
    {
      id: '3.4',
      trackId: 'track-03',
      order: 4,
      code: '3.4',
      title: 'Regression Models & Visual Intuition',
      subtitle: 'Linear Regression, Ridge/Lasso regularization, and Decision Tree Regressor (line vs step fit).',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 25,
      theory: {
        intro:
          'When your target is a continuous number (house price, demand, temperature), you use **Regression**. **Linear Regression** fits a smooth straight trend, **Ridge/Lasso** shrink noisy weights to prevent overfitting, and **Decision Tree Regressors** partition data into rectangular step averages.',
        why_it_matters:
          'Seeing the geometry—a smooth line vs a stair-step tree—immediately tells you why linear models extrapolate smoothly while trees capture sharp non-linear thresholds.',
        history_brief:
          'Least-squares linear regression dates back to Gauss (1809) and remains the gold-standard baseline for every regression task.',
        visual_diagram_id: 'ml-regression-fit',
        key_rule: 'Start with Ridge/Linear Regression as your interpretable baseline, then compare against tree-based regressors using RMSE/MAE.',
        syntax_breakdown: [
          { token: 'LinearRegression', syntax: 'model = LinearRegression().fit(X_tr, y_tr)', description: 'Fits y = w1*x1 + ... + b minimizing squared error.' },
          { token: 'Ridge / Lasso', syntax: 'Ridge(alpha=1.0)', description: 'L2/L1 regularization prevents overfitting on noisy features.' },
          { token: 'Tree Regressor', syntax: 'DecisionTreeRegressor(max_depth=4)', description: 'Predicts piecewise-constant step averages.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Train a Ridge regression model on training data and predict on test features.',
        codeTemplate: `model = Ridge(alpha=1.0)\nmodel.___0___(X_train, y_train)\npreds = model.___1___(X_test)`,
        blanks: [
          { id: 'b0', answer: 'fit', placeholder: 'train' },
          { id: 'b1', answer: 'predict', placeholder: 'infer' },
        ],
        wordBank: ['fit', 'predict', 'transform', 'score', 'train'],
        hint: 'Scikit-Learn estimators follow `.fit(X_train, y_train)` then `.predict(X_test)`.',
        explanation: 'The unified `.fit()` / `.predict()` API lets you swap Linear, Ridge, and Tree regressors in one line.',
      },
      challenge: {
        id: 'chal-3-4',
        difficulty_kyu: '4 Kyu',
        xp_reward: 240,
        title: 'Housing Price Regression Arena (.CSV)',
        instructions:
          'Download train.csv and test_X.csv, train a regression model (Ridge, LinearRegression, or GradientBoostingRegressor) in Google Colab, and upload predictions.csv (columns: id, prediction) beating RMSE <= 22.0.',
        requirements: [
          'Download `train.csv` and `test_X.csv` from the buttons below.',
          'Train a regression model in Colab and predict all 60 rows of `test_X.csv`.',
          'Export `predictions.csv` with headers `id,prediction` and achieve RMSE <= 22.0.',
        ],
        starter_file_url: '/starters/track03_02_housing_regression.ipynb',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'csv_metric_eval',
        passing_threshold: 22.0,
        passing_label: 'RMSE <= 22.0 (Target: 60 rows)',
        default_tasks: [
          'Download train.csv & test_X.csv.',
          'Fit a Ridge or GradientBoostingRegressor in Colab.',
          'Upload predictions.csv and verify RMSE <= 22.0.',
        ],
        starter_code: `import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

train = pd.read_csv("track03_reg_train.csv")
test_X = pd.read_csv("track03_reg_test_X.csv")

features = ["sqft", "bedrooms", "age_years", "dist_center_km"]
pipe = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
pipe.fit(train[features], train["price_k"])

sub = pd.DataFrame({"id": test_X["id"], "prediction": pipe.predict(test_X[features])})
sub.to_csv("predictions.csv", index=False)
`,
        test_suite: {
          csvSpec: {
            taskType: 'regression',
            idColumnCandidates: ['id'],
            targetColumnCandidates: ['prediction', 'price_k', 'y_pred', 'pred'],
            primaryMetric: 'rmse',
            thresholdOperator: '<=',
            passingThreshold: 22.0,
            baselineMetric: 38.0,
            groundTruth: TRACK03_REG_TRUTH,
            trainCsvUrl: '/datasets/track03_reg_train.csv',
            testFeaturesCsvUrl: '/datasets/track03_reg_test_X.csv',
            sampleCsvHint: 'id,prediction\n1,215.4\n2,310.8',
          },
        },
      },
      summary: {
        key_takeaways: [
          'Linear/Ridge models capture smooth global slopes; Decision Trees create axis-aligned steps.',
          'RMSE penalizes large prediction misses heavily in the original target units.',
        ],
        reflection_prompt: 'When would a Decision Tree Regressor outperform plain Linear Regression?',
      },
    },
    {
      id: '3.5',
      trackId: 'track-03',
      order: 5,
      code: '3.5',
      title: 'Classification: Logistic, SVM & KNN',
      subtitle: 'Decision boundaries, Sigmoid probability, SVM maximum margin & kernels, and KNN distance neighbors.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'When predicting discrete categories (Spam vs Safe, Churn vs Stay), classifiers draw **decision boundaries**. **Logistic Regression** maps a linear score through a Sigmoid curve into probability `[0, 1]`, **SVM** maximizes the safety margin between classes (using kernels for curved data), and **KNN** polls the `K` closest neighbors.',
        why_it_matters:
          'Because SVM and KNN rely on geometric distances, scaling features with `StandardScaler` is mandatory before fitting them.',
        history_brief:
          'SVMs dominated computer vision and text classification throughout the 2000s before deep neural networks scaled up.',
        visual_diagram_id: 'ml-classification-boundary',
        key_rule: 'Always scale numeric features before SVM or KNN—otherwise a feature with range 0–10,000 dominates distance calculations.',
        syntax_breakdown: [
          { token: 'Sigmoid', syntax: 'p = 1 / (1 + np.exp(-z))', description: 'Turns any linear score z into probability 0..1.' },
          { token: 'SVM Margin', syntax: 'SVC(kernel="rbf", C=1.0)', description: 'Finds the widest margin boundary between classes.' },
          { token: 'KNN Vote', syntax: 'KNeighborsClassifier(n_neighbors=5)', description: 'Classifies a point by its K nearest neighbors.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute Sigmoid probability and classify as `1` when probability is at least `0.5`.',
        codeTemplate: `prob = 1 / (1 + np.___0___(-z))\nlabel = 1 if prob >= ___1___ else 0`,
        blanks: [
          { id: 'b0', answer: 'exp', placeholder: 'fn' },
          { id: 'b1', answer: '0.5', placeholder: 'thresh' },
        ],
        wordBank: ['exp', '0.5', 'log', '0.0', 'sqrt'],
        hint: 'Sigmoid uses `np.exp(-z)` and default classification threshold `0.5`.',
        explanation: 'At `z = 0`, `1 / (1 + exp(0)) = 0.5`, which is the decision boundary of Logistic Regression.',
      },
      challenge: {
        id: 'chal-3-5',
        difficulty_kyu: '4 Kyu',
        xp_reward: 200,
        title: 'Logistic Sigmoid & KNN Classifier Engine',
        instructions:
          'Implement `predict_logistic(z, threshold=0.5)` and `knn_vote(train_points, train_labels, query, k=3)` using Euclidean distance.',
        requirements: [
          '`predict_logistic(z, threshold=0.5)` computes `p = 1 / (1 + np.exp(-z))` and returns `1` if `p >= threshold` else `0`.',
          '`knn_vote(...)` computes Euclidean distance from `query` to every point in `train_points`, selects the `k` nearest labels, and returns the majority class (`0` or `1`).',
        ],
        starter_file_url: '/starters/track03_05_classification.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Classification Checks Pass',
        default_tasks: [
          'Implement predict_logistic using np.exp(-z).',
          'Compute Euclidean distances and pick the k nearest labels in knn_vote.',
        ],
        starter_code: `import numpy as np

def predict_logistic(z, threshold=0.5):
    # Compute sigmoid probability and return 1 if >= threshold else 0
    pass

def knn_vote(train_points, train_labels, query, k=3):
    # Find k nearest Euclidean neighbors and return majority label (0 or 1)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '3.5-s1',
              name: 'Logistic sigmoid thresholds positive and negative z properly',
              visibility: 'sample',
              testCode: `
assert predict_logistic(2.0) == 1
assert predict_logistic(-2.0) == 0
assert predict_logistic(0.0, threshold=0.5) == 1
`,
            },
            {
              id: '3.5-s2',
              name: 'KNN predicts majority class of 3 closest neighbors',
              visibility: 'sample',
              testCode: `
pts = np.array([[0.0, 0.0], [0.5, 0.2], [5.0, 5.0], [5.2, 4.9], [0.2, 0.4]])
lbls = np.array([0, 0, 1, 1, 0])
assert knn_vote(pts, lbls, np.array([0.1, 0.1]), k=3) == 0
assert knn_vote(pts, lbls, np.array([5.1, 5.1]), k=3) == 1
`,
            },
            {
              id: '3.5-h1',
              name: 'Respects custom threshold in Logistic Regression',
              visibility: 'hidden',
              testCode: `
assert predict_logistic(0.2, threshold=0.7) == 0
assert predict_logistic(1.5, threshold=0.7) == 1
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Logistic Regression outputs calibrated probabilities via Sigmoid.',
          'SVM maximizes margin with kernels; KNN relies on local neighbor distance—both need feature scaling.',
        ],
        reflection_prompt: 'Why does changing `K` from 1 to 15 smooth out a KNN decision boundary?',
      },
    },
    {
      id: '3.6',
      trackId: 'track-03',
      order: 6,
      code: '3.6',
      title: 'Ensemble Models: Random Forest & Gradient Boosting',
      subtitle: 'Bagging (Random Forest) vs sequential Boosting (XGBoost / LightGBM) and bias-variance trade-off.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'A single Decision Tree easily overfits. **Ensembles** combine many trees: **Random Forest (Bagging)** trains independent trees in parallel on random subsets and averages them to cut variance, while **Gradient Boosting (XGBoost / LightGBM)** builds trees sequentially, each correcting the previous trees’ residual errors.',
        why_it_matters:
          'On structured tabular data (finance, marketing, healthcare), XGBoost and LightGBM consistently outperform deep neural networks with less data and faster training.',
        history_brief:
          'Random Forest (Breiman, 2001) and XGBoost (Chen & Guestrin, 2016) became the undisputed champions of Kaggle tabular competitions.',
        visual_diagram_id: 'ml-ensemble-boost',
        key_rule: 'Bagging (Random Forest) reduces variance in parallel; Boosting (XGBoost/LightGBM) reduces bias sequentially via residuals.',
        syntax_breakdown: [
          { token: 'Bagging Avg', syntax: 'pred = np.mean(tree_preds, axis=0)', description: 'Averages independent tree predictions.' },
          { token: 'Boosting Step', syntax: 'F = F + lr * residual_tree_pred', description: 'Adds scaled residual corrections sequentially.' },
          { token: 'XGBoost', syntax: 'XGBClassifier(n_estimators=200, learning_rate=0.05)', description: 'Industry-standard gradient boosted trees.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Update a Gradient Boosting prediction by adding the scaled residual tree prediction.',
        codeTemplate: `residual = y_true - y_pred\ny_pred = y_pred + learning_rate * ___0___`,
        blanks: [
          { id: 'b0', answer: 'residual', placeholder: 'correction' },
        ],
        wordBank: ['residual', 'y_true', 'mean', 'variance', 'loss'],
        hint: 'Each boosting round fits the remaining `residual` error.',
        explanation: 'Sequential residual updates let Gradient Boosting steadily drive down bias.',
      },
      challenge: {
        id: 'chal-3-6',
        difficulty_kyu: '4 Kyu',
        xp_reward: 210,
        title: 'Bagging Voter & Boosting Residual Stepper',
        instructions:
          'Implement `bagging_majority(tree_votes)` (parallel majority vote across trees) and `boosting_update(base_pred, tree_residuals, lr=0.1)` (sequential additive boosting update).',
        requirements: [
          '`bagging_majority(tree_votes)` takes a 2D array `(n_trees, n_samples)` of 0/1 votes and returns 1D majority predictions (`>= 0.5 -> 1`).',
          '`boosting_update(base_pred, tree_residuals, lr=0.1)` starts from `base_pred.copy()` and adds `lr * r` for each residual array `r` in `tree_residuals`.',
        ],
        starter_file_url: '/starters/track03_06_ensembles.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Ensemble Tests Pass',
        default_tasks: [
          'Average votes along axis=0 and threshold >= 0.5 for bagging_majority.',
          'Accumulate lr * residual across rounds in boosting_update.',
        ],
        starter_code: `import numpy as np

def bagging_majority(tree_votes):
    # tree_votes shape: (n_trees, n_samples) -> return 1D int array of 0/1
    pass

def boosting_update(base_pred, tree_residuals, lr=0.1):
    # Start from float copy of base_pred and add lr * each residual array
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '3.6-s1',
              name: 'Bagging majority vote aggregates 3 parallel trees',
              visibility: 'sample',
              testCode: `
votes = np.array([[1, 0, 1], [1, 0, 0], [0, 0, 1]])
out = bagging_majority(votes)
assert list(out) == [1, 0, 1], f"Got {out}"
`,
            },
            {
              id: '3.6-s2',
              name: 'Boosting update accumulates residual steps cleanly',
              visibility: 'sample',
              testCode: `
base = np.array([10.0, 20.0])
res = [np.array([5.0, -5.0]), np.array([2.0, -2.0])]
out = boosting_update(base, res, lr=0.2)
assert np.allclose(out, [11.4, 18.6])
`,
            },
            {
              id: '3.6-h1',
              name: 'Does not mutate base_pred in place',
              visibility: 'hidden',
              testCode: `
base = np.array([5.0, 5.0])
_ = boosting_update(base, [np.array([10.0, 10.0])], lr=0.5)
assert np.allclose(base, [5.0, 5.0])
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Random Forest trains trees in parallel to cut variance; XGBoost/LightGBM train sequentially to cut bias.',
          'Learning rate (`lr`) controls how cautiously each boosting tree corrects residuals.',
        ],
        reflection_prompt: 'Why is XGBoost usually the first model you try on a tabular business dataset?',
      },
    },
    {
      id: '3.7',
      trackId: 'track-03',
      order: 7,
      code: '3.7',
      title: 'Unsupervised Learning: Clustering & PCA',
      subtitle: 'K-Means centroids, DBSCAN density clusters, and PCA dimensionality reduction without labels.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'When you have no target label `y`, **Unsupervised Learning** uncovers hidden structure automatically. **K-Means** groups points around `K` spherical centroids, **DBSCAN** finds arbitrary-shaped dense clusters while flagging noise/anomalies, and **PCA** projects high-dimensional features onto top variance axes.',
        why_it_matters:
          'Customer segmentation, anomaly detection, and visualizing 50-column embeddings in 2D all rely on clustering and PCA.',
        history_brief:
          'Principal Component Analysis (Pearson, 1901) and K-Means (Lloyd, 1957) remain foundational in modern AI pipelines.',
        visual_diagram_id: 'ml-unsupervised-pca',
        key_rule: 'Use K-Means for compact spherical groups, DBSCAN for irregular shapes + outlier noise, and PCA to compress correlated features.',
        syntax_breakdown: [
          { token: 'K-Means', syntax: 'KMeans(n_clusters=3).fit_predict(X)', description: 'Assigns every sample to its nearest centroid.' },
          { token: 'DBSCAN', syntax: 'DBSCAN(eps=0.5, min_samples=5)', description: 'Labels sparse outliers as -1 automatically.' },
          { token: 'PCA', syntax: 'PCA(n_components=2).fit_transform(X)', description: 'Projects data onto top-variance orthogonal axes.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Assign each point to its nearest centroid index using `np.argmin`.',
        codeTemplate: `dists = np.linalg.norm(X[:, None, :] - centroids[None, :, :], axis=2)\nclusters = np.___0___(dists, axis=___1___)`,
        blanks: [
          { id: 'b0', answer: 'argmin', placeholder: 'fn' },
          { id: 'b1', answer: '1', placeholder: 'axis' },
        ],
        wordBank: ['argmin', '1', 'argmax', '0', 'min'],
        hint: 'Use `np.argmin(..., axis=1)` to pick the closest centroid per row.',
        explanation: '`axis=1` compares distances across all K centroids for each sample row.',
      },
      challenge: {
        id: 'chal-3-7',
        difficulty_kyu: '4 Kyu',
        xp_reward: 210,
        title: 'K-Means Assignment & PCA Variance Ratio',
        instructions:
          'Implement `assign_clusters(X, centroids)` (nearest centroid index per sample) and `explained_variance_ratio(eigenvalues)` (fraction of total variance per component).',
        requirements: [
          '`assign_clusters(X, centroids)` returns a 1D integer array of nearest centroid indices using Euclidean distance.',
          '`explained_variance_ratio(eigenvalues)` returns `eigenvalues / np.sum(eigenvalues)` as a NumPy float array.',
        ],
        starter_file_url: '/starters/track03_07_unsupervised.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Unsupervised Tests Pass',
        default_tasks: [
          'Compute Euclidean distances from each row in X to each centroid.',
          'Normalize eigenvalues by their total sum for explained_variance_ratio.',
        ],
        starter_code: `import numpy as np

def assign_clusters(X, centroids):
    # Return 1D int array of nearest centroid index for each row in X
    pass

def explained_variance_ratio(eigenvalues):
    # Return fraction of total variance explained by each eigenvalue
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '3.7-s1',
              name: 'Assigns points to closest centroids accurately',
              visibility: 'sample',
              testCode: `
X = np.array([[0.1, 0.2], [9.8, 10.1], [0.4, -0.1]])
c = np.array([[0.0, 0.0], [10.0, 10.0]])
out = assign_clusters(X, c)
assert list(out) == [0, 1, 0], f"Got {out}"
`,
            },
            {
              id: '3.7-s2',
              name: 'Computes PCA explained variance ratios summing to 1.0',
              visibility: 'sample',
              testCode: `
ev = np.array([6.0, 3.0, 1.0])
ratios = explained_variance_ratio(ev)
assert np.allclose(ratios, [0.6, 0.3, 0.1])
assert abs(np.sum(ratios) - 1.0) < 1e-6
`,
            },
            {
              id: '3.7-h1',
              name: 'Supports 3 centroids in 3D space',
              visibility: 'hidden',
              testCode: `
X = np.array([[0, 0, 0], [5, 5, 5], [10, 0, 0]])
c = np.array([[0, 0, 0], [5, 5, 5], [10, 0, 0]])
assert list(assign_clusters(X, c)) == [0, 1, 2]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'K-Means minimizes distance to K centroids; DBSCAN finds density-based clusters and flags noise.',
          'PCA keeps the top components capturing the largest share of variance.',
        ],
        reflection_prompt: 'When would you choose DBSCAN over K-Means?',
      },
    },
    {
      id: '3.8',
      trackId: 'track-03',
      order: 8,
      code: '3.8',
      title: 'Model Evaluation & Hyperparameter Tuning',
      subtitle: 'Cross-validation, Precision/Recall/F1/ROC-AUC, confusion matrices, and GridSearch tuning.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'On a 99% non-fraud dataset, a lazy model predicting "0" for everyone gets **99% Accuracy** while missing 100% of fraud! Proper **Evaluation** uses Confusion Matrices (`Precision`, `Recall`, `F1`, `ROC-AUC`) and **Cross-Validation** + **Hyperparameter Tuning** (`GridSearchCV`) aligned to business cost.',
        why_it_matters:
          'Optimizing the wrong metric or tuning on the test set guarantees production failure. Cross-validation ensures your hyperparameters generalize.',
        history_brief:
          'F1-Score (harmonic mean of Precision and Recall) became the standard benchmark when false negatives and false positives both carry high cost.',
        visual_diagram_id: 'ml-eval-metrics',
        key_rule: 'Maximize Recall when missing a positive is catastrophic (cancer/fraud); maximize Precision when false alarms are costly (spam blocking).',
        syntax_breakdown: [
          { token: 'Precision', syntax: 'TP / (TP + FP)', description: 'Of all predicted positives, how many were truly positive?' },
          { token: 'Recall', syntax: 'TP / (TP + FN)', description: 'Of all actual positives, how many did we catch?' },
          { token: 'F1-Score', syntax: '2 * P * R / (P + R)', description: 'Harmonic mean balancing Precision and Recall.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute F1-Score from Precision (`p`) and Recall (`r`).',
        codeTemplate: `f1 = 2 * (p * r) / (___0___ + ___1___)`,
        blanks: [
          { id: 'b0', answer: 'p', placeholder: 'prec' },
          { id: 'b1', answer: 'r', placeholder: 'rec' },
        ],
        wordBank: ['p', 'r', '2', 'tp', 'fp'],
        hint: 'F1 is the harmonic mean: `2 * (p * r) / (p + r)`.',
        explanation: 'If either Precision or Recall collapses to 0, F1 immediately drops to 0.',
      },
      challenge: {
        id: 'chal-3-8',
        difficulty_kyu: '4 Kyu',
        xp_reward: 210,
        title: 'Fraud Metric Auditor (Accuracy vs F1)',
        instructions:
          'Implement `audit_classifier(y_true, y_pred)` computing accuracy, precision, recall, f1, and `accuracy_trap` (`True` when `accuracy >= 0.90` and `f1 < 0.50`).',
        requirements: [
          'Compute `tp`, `fp`, `fn`, `tn` cleanly.',
          'Guard zero denominators so precision, recall, and f1 return `0.0` instead of crashing.',
          'Set `accuracy_trap = (accuracy >= 0.90) and (f1 < 0.50)`.',
          'Return `{"accuracy": ..., "precision": ..., "recall": ..., "f1": ..., "accuracy_trap": ...}`.',
        ],
        starter_file_url: '/starters/track03_03_metrics.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Metric Audit Tests Pass',
        default_tasks: [
          'Count TP, FP, FN, TN from y_true and y_pred.',
          'Compute precision, recall, f1 with zero-division guards.',
          'Flag accuracy_trap when accuracy >= 0.90 and f1 < 0.50.',
        ],
        starter_code: `def audit_classifier(y_true, y_pred):
    # Return dict with accuracy, precision, recall, f1, and accuracy_trap
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '3.8-s1',
              name: 'Catches the 95% Accuracy Trap on all-zero predictions',
              visibility: 'sample',
              testCode: `
y_true = [0]*19 + [1]
y_pred = [0]*20
out = audit_classifier(y_true, y_pred)
assert abs(out["accuracy"] - 0.95) < 1e-6
assert out["f1"] == 0.0
assert out["accuracy_trap"] is True
`,
            },
            {
              id: '3.8-s2',
              name: 'Computes exact Precision, Recall, and F1 on balanced hits',
              visibility: 'sample',
              testCode: `
out = audit_classifier([1, 1, 0, 0], [1, 0, 1, 0])
assert abs(out["precision"] - 0.5) < 1e-6
assert abs(out["recall"] - 0.5) < 1e-6
assert abs(out["f1"] - 0.5) < 1e-6
assert out["accuracy_trap"] is False
`,
            },
            {
              id: '3.8-h1',
              name: 'Perfect predictions yield 1.0 across all metrics',
              visibility: 'hidden',
              testCode: `
out = audit_classifier([1, 0, 1, 1], [1, 0, 1, 1])
assert out["f1"] == 1.0 and out["accuracy"] == 1.0 and out["accuracy_trap"] is False
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'High Accuracy on imbalanced datasets can hide 0% Recall on the minority class.',
          'Tune hyperparameters with Cross-Validation against the metric that matches real business cost.',
        ],
        reflection_prompt: 'In medical screening, would you prioritize Recall or Precision—and why?',
      },
    },
    {
      id: '3.9',
      trackId: 'track-03',
      order: 9,
      code: '3.9',
      title: 'Data Storytelling & Model Interpretation',
      subtitle: 'Feature importance, SHAP impact direction, honest visual axes, and stakeholder narratives.',
      categoryLabel: 'Machine Learning',
      difficulty: 'Medium',
      estMinutes: 18,
      theory: {
        intro:
          'A model with 0.91 F1 creates zero business value if stakeholders do not trust or understand it. **Model Interpretation** (Feature Importance & **SHAP values**) explains *why* a prediction happened, and **Data Storytelling** turns technical numbers into a clear recommendation.',
        why_it_matters:
          'Executives, doctors, and regulators ask "Which factors drove this decision?"—ranking feature impacts and avoiding misleading truncated chart axes builds real trust.',
        history_brief:
          'SHAP (Lundberg & Lee, 2017) brought game-theoretic Shapley values to ML so every single prediction gets fair feature attributions.',
        visual_diagram_id: 'ml-storytelling-shap',
        key_rule: 'Pair every model metric with (1) Top Feature Drivers, (2) Direction of Impact (+/-), and (3) Concrete Business Action.',
        syntax_breakdown: [
          { token: 'abs(shap)', syntax: 'sorted(impacts.items(), key=lambda x: abs(x[1]), reverse=True)', description: 'Ranks features by magnitude of influence.' },
          { token: 'Direction', syntax: '"increases risk" if val > 0 else "reduces risk"', description: 'Translates +/- SHAP sign into plain English.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Sort feature impacts from largest absolute effect to smallest.',
        codeTemplate: `ranked = sorted(shap_dict.items(), key=lambda kv: ___0___(kv[1]), reverse=___1___)`,
        blanks: [
          { id: 'b0', answer: 'abs', placeholder: 'mag' },
          { id: 'b1', answer: 'True', placeholder: 'desc' },
        ],
        wordBank: ['abs', 'True', 'False', 'max', 'sum'],
        hint: 'Use `abs(kv[1])` with `reverse=True` so strong negative impacts rank near the top too.',
        explanation: 'A `-0.45` SHAP value is just as influential as `+0.45`, only in the protective direction.',
      },
      challenge: {
        id: 'chal-3-9',
        difficulty_kyu: '4 Kyu',
        xp_reward: 190,
        title: 'SHAP Driver Ranker & Executive Summary',
        instructions:
          'Implement `summarize_drivers(shap_values, top_n=2)` taking a dict `{feature: shap_score}` and returning the top `top_n` feature names sorted by `abs(score)` descending, plus a plain-English `headline` naming the #1 driver and whether it `"increases"` or `"decreases"` risk.',
        requirements: [
          'Sort features by `abs(score)` descending and take the first `top_n` names in `top_features`.',
          'For the #1 driver, set `direction = "increases" if score > 0 else "decreases"`.',
          'Set `headline = f"{top_feat} {direction} risk the most"`.',
          'Return `{"top_features": top_features, "direction": direction, "headline": headline}`.',
        ],
        starter_file_url: '/starters/track03_09_storytelling.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Storytelling Checks Pass',
        default_tasks: [
          'Rank features by abs(shap_score) descending.',
          'Build the direction and executive headline for the #1 driver.',
        ],
        starter_code: `def summarize_drivers(shap_values, top_n=2):
    # Return {"top_features": [...], "direction": ..., "headline": ...}
    pass
`,
        test_suite: {
          pyTests: [
            {
              id: '3.9-s1',
              name: 'Identifies strongest negative protective driver accurately',
              visibility: 'sample',
              testCode: `
shap = {"debt_ratio": 0.35, "credit_history_yrs": -0.62, "age": -0.10}
out = summarize_drivers(shap, top_n=2)
assert out["top_features"] == ["credit_history_yrs", "debt_ratio"]
assert out["direction"] == "decreases"
assert out["headline"] == "credit_history_yrs decreases risk the most"
`,
            },
            {
              id: '3.9-s2',
              name: 'Identifies strongest positive risk driver',
              visibility: 'sample',
              testCode: `
shap = {"late_payments": 0.80, "savings": -0.20}
out = summarize_drivers(shap, top_n=1)
assert out["top_features"] == ["late_payments"]
assert out["direction"] == "increases"
`,
            },
            {
              id: '3.9-h1',
              name: 'Handles top_n=3 cleanly',
              visibility: 'hidden',
              testCode: `
shap = {"a": 0.1, "b": -0.5, "c": 0.3, "d": -0.05}
out = summarize_drivers(shap, top_n=3)
assert out["top_features"] == ["b", "c", "a"]
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Feature importance shows *what* mattered; SHAP signs show *which direction* it pushed the prediction.',
          'Always translate technical metrics into a stakeholder-ready decision.',
        ],
        reflection_prompt: 'How would you explain a 0.85 F1-Score to a non-technical product manager?',
      },
    },
    {
      id: '3.10',
      trackId: 'track-03',
      order: 10,
      code: '3.10',
      title: 'Machine Learning Final Exam: Credit Risk Pipeline',
      subtitle: 'End-to-end ML Capstone: cleaning, EDA, modeling, evaluation & storytelling (F1 >= 0.82).',
      categoryLabel: 'Machine Learning',
      difficulty: 'Hard',
      estMinutes: 40,
      theory: {
        intro:
          'Put all 9 Machine Learning stages together: clean & inspect the Credit Risk dataset, split without leakage, train an ensemble classifier (Random Forest / XGBoost / Logistic), evaluate F1, and submit `predictions.csv` achieving `F1 >= 0.82`.',
        why_it_matters:
          'Passing this capstone validates your full end-to-end classical ML workflow on an imbalanced real-world classification problem.',
        history_brief:
          'Credit risk scoring is one of the highest-impact production applications of gradient boosted trees and SHAP explainability.',
        visual_diagram_id: 'ml-capstone-pipeline',
        key_rule: 'Clean -> EDA -> Stratified Split -> Leakage-Free Pipeline -> Tune for F1 -> Explain Top Drivers.',
        syntax_breakdown: [
          { token: 'Pipeline', syntax: 'make_pipeline(StandardScaler(), RandomForestClassifier(class_weight="balanced"))', description: 'Combines scaling and balanced ensemble modeling.' },
          { token: 'CSV Export', syntax: 'pd.DataFrame({"id": test_X["id"], "prediction": preds}).to_csv("predictions.csv", index=False)', description: 'Generates submission file for automated grading.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Configure RandomForestClassifier with balanced class weights for imbalanced credit risk.',
        codeTemplate: `clf = RandomForestClassifier(n_estimators=200, class_weight="___0___", random_state=42)`,
        blanks: [{ id: 'b0', answer: 'balanced', placeholder: 'weighting' }],
        wordBank: ['balanced', 'equal', 'auto', 'weighted', 'uniform'],
        hint: 'Scikit-Learn uses `class_weight="balanced"` to upweight minority classes.',
        explanation: '`class_weight="balanced"` prevents the forest from ignoring rarer default cases.',
      },
      challenge: {
        id: 'chal-3-10',
        difficulty_kyu: '2 Kyu',
        xp_reward: 500,
        is_final_exam: true,
        title: 'Machine Learning Final Exam: Credit Risk Pipeline (F1 >= 0.82)',
        instructions:
          'Download train.csv & test_X.csv, train a leakage-free classification pipeline in Colab, and upload predictions.csv (80 rows: id, prediction in {0, 1}) beating F1 >= 0.82.',
        requirements: [
          'Download `train.csv` and `test_X.csv`.',
          'Apply cleaning, EDA checks, and a leakage-free classifier (e.g. RandomForest/GradientBoosting).',
          'Submit `predictions.csv` achieving F1-Score >= 0.82.',
        ],
        starter_file_url: '/starters/track03_04_credit_exam.ipynb',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'csv_metric_eval',
        passing_threshold: 0.82,
        passing_label: 'F1-Score >= 0.82 (80 test rows)',
        default_tasks: [
          'Download train.csv & test_X.csv.',
          'Train a leakage-free classifier in Colab.',
          'Upload predictions.csv and beat F1 >= 0.82.',
        ],
        starter_code: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier

train = pd.read_csv("track03_exam_train.csv")
test_X = pd.read_csv("track03_exam_test_X.csv")

features = [c for c in test_X.columns if c != "id"]
clf = GradientBoostingClassifier(random_state=42)
clf.fit(train[features], train["default"])

preds = clf.predict(test_X[features])
pd.DataFrame({"id": test_X["id"], "prediction": preds}).to_csv("predictions.csv", index=False)
`,
        test_suite: {
          csvSpec: {
            taskType: 'binary_classification',
            idColumnCandidates: ['id'],
            targetColumnCandidates: ['prediction', 'default', 'y_pred', 'pred'],
            primaryMetric: 'f1',
            thresholdOperator: '>=',
            passingThreshold: 0.82,
            baselineMetric: 0.65,
            groundTruth: TRACK03_EXAM_TRUTH,
            trainCsvUrl: '/datasets/track03_exam_train.csv',
            testFeaturesCsvUrl: '/datasets/track03_exam_test_X.csv',
            sampleCsvHint: 'id,prediction\n1,0\n2,1',
          },
        },
      },
      summary: {
        key_takeaways: [
          'You completed the full 10-stage Machine Learning workflow from raw cleaning to F1-verified predictions.',
          'You are ready to step into Deep Learning—starting with its mathematical foundations.',
        ],
        reflection_prompt: 'Which model and preprocessing step gave your Credit Risk pipeline the biggest F1 lift?',
      },
    },
  ],
};
