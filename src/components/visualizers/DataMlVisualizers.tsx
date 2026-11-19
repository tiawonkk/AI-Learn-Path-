'use client';

import { useState } from 'react';
import type { DiagramId } from '@/types/curriculum';

export function DataMlVisualizer({ diagramId }: { diagramId: DiagramId }) {
  const [tensorMode, setTensorMode] = useState<'1D' | '2D' | '3D'>('2D');
  const [broadcastAdd, setBroadcastAdd] = useState(5);
  const [sliceMode, setSliceMode] = useState<'loc' | 'iloc'>('loc');
  const [groupMin, setGroupMin] = useState(10);
  const [skewMode, setSkewMode] = useState<'normal' | 'right' | 'left'>('right');
  const [leakyMode, setLeakyMode] = useState(false);
  const [regModel, setRegModel] = useState<'linear' | 'tree'>('linear');
  const [clfModel, setClfModel] = useState<'logistic' | 'svm' | 'knn'>('svm');
  const [ensMode, setEnsMode] = useState<'bagging' | 'boosting'>('boosting');
  const [unsupMode, setUnsupMode] = useState<'kmeans' | 'dbscan' | 'pca'>('kmeans');
  const [evalThresh, setEvalThresh] = useState(50);

  switch (diagramId) {
    case 'np-tensor-dims':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['1D', '2D', '3D'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTensorMode(m)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                  tensorMode === m ? 'bg-plum text-white' : 'bg-surface text-text-sub border border-border-soft'
                }`}
              >
                {m} Tensor
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <div className="font-mono text-xs font-bold text-plum">
              {tensorMode === '1D'
                ? 'Vector — shape: (4,), ndim: 1'
                : tensorMode === '2D'
                  ? 'Matrix (Tabular / Grayscale) — shape: (2, 3), ndim: 2'
                  : '3D Tensor (RGB Image) — shape: (2, 2, 3), ndim: 3'}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
              {tensorMode === '1D' &&
                [12, 25, 38, 41].map((v, i) => (
                  <span key={i} className="rounded-lg bg-lavender-soft px-3 py-1.5 font-bold text-text-main">
                    {v}
                  </span>
                ))}
              {tensorMode === '2D' && (
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((v) => (
                    <span key={v} className="rounded-lg bg-sunshine-soft px-3.5 py-1.5 text-center font-bold text-text-main">
                      {v}
                    </span>
                  ))}
                </div>
              )}
              {tensorMode === '3D' && (
                <div className="flex gap-3">
                  {['R', 'G', 'B'].map((ch) => (
                    <div key={ch} className="rounded-xl border border-border-soft bg-surface-subtle p-2">
                      <div className="mb-1 text-center text-[10px] font-bold text-plum">Channel {ch}</div>
                      <div className="grid grid-cols-2 gap-1">
                        {[0.2, 0.8, 0.5, 0.9].map((v, i) => (
                          <span key={i} className="rounded bg-rose-soft px-2 py-0.5 text-[11px] font-bold text-text-main">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'np-matmul-broadcast':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">Scalar bias b = +{broadcastAdd}</span>
            <input
              type="range"
              min={0}
              max={20}
              value={broadcastAdd}
              onChange={(e) => setBroadcastAdd(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3 font-mono text-xs">
              <div className="text-[11px] text-text-muted">Vector x</div>
              <div className="mt-1 font-bold text-text-main">[10, 20, 30]</div>
            </div>
            <div className="rounded-xl border border-plum bg-plum p-3 text-center font-mono text-xs text-white">
              <div className="text-[11px] text-[#DDA9FF]">Broadcasting + {broadcastAdd}</div>
              <div className="mt-1 font-bold">Zero Python loops!</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3 font-mono text-xs">
              <div className="text-[11px] text-text-muted">Result (C-speed)</div>
              <div className="mt-1 font-extrabold text-text-main">
                [{10 + broadcastAdd}, {20 + broadcastAdd}, {30 + broadcastAdd}]
              </div>
            </div>
          </div>
        </div>
      );

    case 'pd-dataframe-anatomy':
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['loc', 'iloc'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSliceMode(m)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                  sliceMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'loc' ? 'df.loc[0:1, "city"] (Label)' : 'df.iloc[0:1, 0] (Position)'}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-border-soft bg-surface p-3">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-soft text-left text-text-muted">
                  <th className="py-1.5 pr-3">idx</th>
                  <th className="py-1.5 pr-3">city</th>
                  <th className="py-1.5">salary_m</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { idx: 0, city: 'Jakarta', sal: 12.0 },
                  { idx: 1, city: 'Bandung', sal: 14.5 },
                  { idx: 2, city: 'Surabaya', sal: 18.0 },
                ].map((r) => {
                  const hi = sliceMode === 'loc' ? r.idx <= 1 : r.idx === 0;
                  return (
                    <tr
                      key={r.idx}
                      className={hi ? 'bg-lavender-soft font-bold text-text-main' : 'text-text-muted'}
                    >
                      <td className="py-1.5 pr-3">{r.idx}</td>
                      <td className="py-1.5 pr-3">{r.city}</td>
                      <td className="py-1.5">{r.sal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'pd-groupby-split': {
      const rows = [
        { city: 'Jakarta', sal: 8 },
        { city: 'Jakarta', sal: 14 },
        { city: 'Bandung', sal: 12 },
        { city: 'Surabaya', sal: 20 },
      ].filter((r) => r.sal >= groupMin);
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">Filter salary_m &gt;= {groupMin}</span>
            <input
              type="range"
              min={6}
              max={18}
              step={2}
              value={groupMin}
              onChange={(e) => setGroupMin(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="font-mono text-[11px] font-bold text-plum">1. Split (Filter)</div>
              <div className="mt-1 font-mono text-xs text-text-main">{rows.length} rows kept</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="font-mono text-[11px] font-bold text-plum">2. Apply (.mean())</div>
              <div className="mt-1 font-mono text-xs text-text-sub">Aggregates each city group</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3">
              <div className="font-mono text-[11px] font-bold text-text-main">3. Combine</div>
              <div className="mt-1 font-mono text-xs font-bold text-text-main">
                Top: {rows.length ? rows[rows.length - 1].city : 'None'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'pd-ml-tensor-bridge':
    case 'pd-bridge-capstone':
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          {[
            { t: '1. Raw CSV', d: 'Strings + NaNs', bg: 'bg-rose-soft' },
            { t: '2. Impute & Clip', d: 'Median + IQR fences', bg: 'bg-lavender-soft' },
            { t: '3. One-Hot Encode', d: 'pd.get_dummies -> 0/1', bg: 'bg-sunshine-soft' },
            { t: '4. float32 Tensor', d: 'X.shape (N, F), y (N,)', bg: 'bg-plum text-white' },
          ].map((s) => (
            <div key={s.t} className={`rounded-xl border border-border-soft p-3 ${s.bg}`}>
              <div className="font-mono text-xs font-bold">{s.t}</div>
              <div className="mt-1 text-[11px] opacity-90">{s.d}</div>
            </div>
          ))}
        </div>
      );

    case 'ml-data-cleaning':
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          {[
            { label: 'Raw Records', badge: '4 rows (dirty)', desc: '1 duplicate, 1 NaN, age=140' },
            { label: '1. Deduplicate', badge: 'drop_duplicates()', desc: '3 unique rows left' },
            { label: '2. Impute NaN', badge: 'fillna(median)', desc: 'Zero missing values' },
            { label: '3. Clip Outliers', badge: 'clip(18, 90)', desc: 'Model-ready clean table' },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`rounded-xl border p-3 ${
                idx === 3 ? 'border-plum bg-plum text-white' : 'border-border-soft bg-surface text-text-main'
              }`}
            >
              <div className="font-mono text-xs font-bold">{item.label}</div>
              <div className={`mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                idx === 3 ? 'bg-[#FACF4E] text-[#232124]' : 'bg-lavender-soft text-plum'
              }`}>
                {item.badge}
              </div>
              <div className="mt-1.5 text-[11px] opacity-85">{item.desc}</div>
            </div>
          ))}
        </div>
      );

    case 'ml-eda-distribution': {
      const pathD =
        skewMode === 'normal'
          ? 'M 20 110 Q 90 105 130 25 Q 170 105 240 110'
          : skewMode === 'right'
            ? 'M 20 110 Q 55 15 95 65 Q 150 105 245 110'
            : 'M 15 110 Q 110 105 165 65 Q 205 15 240 110';
      const meanX = skewMode === 'normal' ? 130 : skewMode === 'right' ? 112 : 148;
      const medX = skewMode === 'normal' ? 130 : skewMode === 'right' ? 78 : 182;
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['normal', 'right', 'left'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSkewMode(m)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  skewMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'normal' ? 'Symmetric (Normal)' : m === 'right' ? 'Right-Skewed (Income)' : 'Left-Skewed'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 125" className="h-32 w-full">
              <line x1="15" y1="110" x2="248" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
              <path d={pathD} fill="rgba(221, 169, 255, 0.35)" stroke="#532B71" strokeWidth="2.5" />
              <line x1={medX} y1="22" x2={medX} y2="110" stroke="#532B71" strokeWidth="2" strokeDasharray="4 3" />
              <text x={medX - 18} y="16" fontSize="9" fill="#532B71" fontWeight="700">Median</text>
              <line x1={meanX} y1="35" x2={meanX} y2="110" stroke="#F19BB6" strokeWidth="2.5" />
              <text x={meanX + 4} y="44" fontSize="9" fill="#232124" fontWeight="700">Mean</text>
            </svg>
            <div className="mt-1 text-xs text-text-sub">
              {skewMode === 'normal'
                ? 'Mean ≈ Median — balanced bell curve.'
                : skewMode === 'right'
                  ? 'Long right tail pulls Mean > Median. Use Median/IQR and consider log-transform!'
                  : 'Long left tail pulls Mean < Median.'}
            </div>
          </div>
        </div>
      );
    }

    case 'ml-pipeline-leakage':
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLeakyMode(false)}
              className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                !leakyMode ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
              }`}
            >
              Safe Pipeline (Correct)
            </button>
            <button
              type="button"
              onClick={() => setLeakyMode(true)}
              className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                leakyMode ? 'bg-[#F19BB6] text-[#232124]' : 'border border-border-soft bg-surface text-text-sub'
              }`}
            >
              Leaky Pipeline (Bug!)
            </button>
          </div>
          <div className={`rounded-xl border p-4 text-xs ${leakyMode ? 'border-[#F19BB6] bg-rose-soft' : 'border-plum bg-lavender-soft'}`}>
            <div className="font-mono font-bold text-text-main">
              {leakyMode
                ? 'Scale ALL data -> Split Train/Test (Test mean & std leaked into Train!)'
                : 'Split FIRST -> fit_transform(X_train) -> transform(X_test) (Zero Leakage)'}
            </div>
          </div>
        </div>
      );

    case 'ml-regression-fit':
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['linear', 'tree'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRegModel(m)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                  regModel === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'linear' ? 'Linear / Ridge Fit' : 'Decision Tree Regressor (Steps)'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 120" className="h-32 w-full">
              <line x1="20" y1="105" x2="245" y2="105" stroke="currentColor" strokeOpacity="0.2" />
              <line x1="20" y1="15" x2="20" y2="105" stroke="currentColor" strokeOpacity="0.2" />
              {[
                [35, 92], [65, 82], [95, 70], [130, 56], [165, 45], [200, 32], [230, 24],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#F19BB6" stroke="#532B71" strokeWidth="1.5" />
              ))}
              {regModel === 'linear' ? (
                <line x1="25" y1="96" x2="240" y2="20" stroke="#532B71" strokeWidth="3" />
              ) : (
                <path d="M 25 88 H 85 V 63 H 150 V 45 H 190 V 28 H 240" fill="none" stroke="#FACF4E" strokeWidth="3.5" />
              )}
            </svg>
            <div className="text-xs text-text-sub">
              {regModel === 'linear'
                ? 'Linear/Ridge learns a smooth global slope—ideal for smooth continuous trends & extrapolation.'
                : 'Decision Tree Regressor splits feature ranges into flat step averages—great for sharp thresholds.'}
            </div>
          </div>
        </div>
      );

    case 'ml-classification-boundary':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['logistic', 'svm', 'knn'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setClfModel(m)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  clfModel === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'logistic' ? 'Logistic Boundary' : m === 'svm' ? 'SVM Max Margin' : 'KNN Neighbors (K=3)'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 120" className="h-32 w-full">
              {[[45, 35], [65, 52], [55, 78], [85, 40]].map(([x, y], i) => (
                <circle key={`a-${i}`} cx={x} cy={y} r="5" fill="#DDA9FF" stroke="#532B71" strokeWidth="1.5" />
              ))}
              {[[175, 42], [195, 70], [215, 48], [185, 88]].map(([x, y], i) => (
                <rect key={`b-${i}`} x={x - 4} y={y - 4} width="9" height="9" rx="2" fill="#FACF4E" stroke="#232124" strokeWidth="1.2" />
              ))}
              {clfModel === 'logistic' && (
                <line x1="130" y1="12" x2="130" y2="108" stroke="#532B71" strokeWidth="2.5" />
              )}
              {clfModel === 'svm' && (
                <>
                  <rect x="108" y="12" width="44" height="96" fill="rgba(221, 169, 255, 0.25)" />
                  <line x1="130" y1="12" x2="130" y2="108" stroke="#532B71" strokeWidth="2.5" />
                  <line x1="108" y1="12" x2="108" y2="108" stroke="#F19BB6" strokeDasharray="4 3" strokeWidth="1.5" />
                  <line x1="152" y1="12" x2="152" y2="108" stroke="#F19BB6" strokeDasharray="4 3" strokeWidth="1.5" />
                </>
              )}
              {clfModel === 'knn' && (
                <>
                  <circle cx="90" cy="56" r="36" fill="rgba(250, 207, 78, 0.18)" stroke="#532B71" strokeDasharray="4 3" strokeWidth="1.5" />
                  <circle cx="90" cy="56" r="5" fill="#F19BB6" stroke="#232124" strokeWidth="1.5" />
                </>
              )}
            </svg>
            <div className="text-xs text-text-sub">
              {clfModel === 'logistic'
                ? 'Logistic Regression draws a linear probability boundary (p = 0.5).'
                : clfModel === 'svm'
                  ? 'SVM maximizes the wide safety street (margin) between support vectors.'
                  : 'KNN polls the K closest scaled neighbors around the query dot.'}
            </div>
          </div>
        </div>
      );

    case 'ml-ensemble-boost':
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['bagging', 'boosting'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setEnsMode(m)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                  ensMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'bagging' ? 'Random Forest (Parallel Bagging)' : 'XGBoost / LightGBM (Sequential Boosting)'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ensMode === 'bagging'
              ? ['Tree 1 (Bootstrap A)', 'Tree 2 (Bootstrap B)', 'Tree 3 (Bootstrap C)'].map((t) => (
                  <div key={t} className="rounded-xl border border-border-soft bg-surface p-3 text-center">
                    <div className="font-mono text-xs font-bold text-plum">{t}</div>
                    <div className="mt-1 text-[11px] text-text-muted">Votes in parallel -&gt; Cuts Variance</div>
                  </div>
                ))
              : ['Tree 1: Base Pred', 'Tree 2: Fixes Residual 1', 'Tree 3: Fixes Residual 2'].map((t, i) => (
                  <div key={t} className={`rounded-xl border p-3 text-center ${i === 2 ? 'border-plum bg-lavender-soft' : 'border-border-soft bg-surface'}`}>
                    <div className="font-mono text-xs font-bold text-plum">{t}</div>
                    <div className="mt-1 text-[11px] text-text-sub">Sequential + lr * residual -&gt; Cuts Bias</div>
                  </div>
                ))}
          </div>
        </div>
      );

    case 'ml-unsupervised-pca':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['kmeans', 'dbscan', 'pca'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setUnsupMode(m)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  unsupMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'kmeans' ? 'K-Means Centroids' : m === 'dbscan' ? 'DBSCAN Density + Noise' : 'PCA Projection'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 110" className="h-28 w-full">
              {unsupMode === 'kmeans' && (
                <>
                  <circle cx="70" cy="55" r="28" fill="rgba(221,169,255,0.28)" />
                  <circle cx="190" cy="55" r="28" fill="rgba(250,207,78,0.28)" />
                  <text x="64" y="60" fontSize="14" fill="#532B71" fontWeight="800">★</text>
                  <text x="184" y="60" fontSize="14" fill="#232124" fontWeight="800">★</text>
                </>
              )}
              {unsupMode === 'dbscan' && (
                <>
                  <path d="M 40 75 Q 90 20 140 75" fill="none" stroke="#532B71" strokeWidth="14" strokeLinecap="round" strokeOpacity="0.25" />
                  <circle cx="220" cy="30" r="5" fill="#F19BB6" stroke="#232124" strokeWidth="1.5" />
                  <text x="195" y="50" fontSize="9" fill="#532B71" fontWeight="700">Noise (-1)</text>
                </>
              )}
              {unsupMode === 'pca' && (
                <>
                  <line x1="35" y1="88" x2="225" y2="24" stroke="#532B71" strokeWidth="2.5" />
                  <text x="172" y="22" fontSize="9" fill="#532B71" fontWeight="700">PC1 (82% var)</text>
                  <line x1="115" y1="35" x2="145" y2="85" stroke="#F19BB6" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="148" y="88" fontSize="9" fill="#232124" fontWeight="700">PC2 (18%)</text>
                </>
              )}
            </svg>
          </div>
        </div>
      );

    case 'ml-eval-metrics': {
      const recall = Math.max(25, Math.min(98, 120 - evalThresh));
      const precision = Math.max(25, Math.min(98, evalThresh + 20));
      const f1 = Math.round((2 * precision * recall) / (precision + recall));
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">Threshold = {(evalThresh / 100).toFixed(2)}</span>
            <input
              type="range"
              min={20}
              max={85}
              value={evalThresh}
              onChange={(e) => setEvalThresh(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="text-[11px] text-text-muted">Precision</div>
              <div className="font-mono text-base font-extrabold text-plum">{precision}%</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="text-[11px] text-text-muted">Recall</div>
              <div className="font-mono text-base font-extrabold text-plum">{recall}%</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3">
              <div className="text-[11px] text-text-muted">F1-Score</div>
              <div className="font-mono text-base font-extrabold text-text-main">{f1}%</div>
            </div>
          </div>
        </div>
      );
    }

    case 'ml-storytelling-shap':
      return (
        <div className="space-y-2.5 rounded-xl border border-border-soft bg-surface p-4">
          <div className="font-mono text-xs font-bold text-plum">SHAP Feature Impact (Why Risk Changed)</div>
          {[
            { feat: 'credit_history_yrs', val: -0.62, dir: 'Reduces risk' },
            { feat: 'debt_ratio', val: +0.35, dir: 'Increases risk' },
            { feat: 'late_payments', val: +0.28, dir: 'Increases risk' },
          ].map((row) => (
            <div key={row.feat} className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="font-bold text-text-main">{row.feat}</span>
                <span className="text-text-muted">{row.val > 0 ? `+${row.val}` : row.val} ({row.dir})</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-pill">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(Math.abs(row.val) * 120)}%`,
                    backgroundColor: row.val > 0 ? '#F19BB6' : '#532B71',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    case 'ml-capstone-pipeline':
    default:
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {['1. Clean', '2. EDA', '3. Split & Scale', '4. Ensemble', '5. F1 & SHAP'].map((s, i) => (
            <div
              key={s}
              className={`rounded-xl border p-2.5 text-center font-mono text-xs font-bold ${
                i === 4 ? 'border-sunshine bg-sunshine text-charcoal' : 'border-border-soft bg-surface text-plum'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      );
  }
}
