'use client';

import { useState } from 'react';
import type { DiagramId } from '@/types/curriculum';

export function PythonVisualizer({ diagramId }: { diagramId: DiagramId }) {
  const [nameInput, setNameInput] = useState('Rina');
  const [castText, setCastText] = useState('42');
  const [score, setScore] = useState(82);
  const [loopEpoch, setLoopEpoch] = useState(1);
  const [listItems, setListItems] = useState<string[]>(['Linear', 'RandomForest', 'CNN']);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [opA, setOpA] = useState(17);
  const [opB, setOpB] = useState(5);
  const [varVal, setVarVal] = useState(10);
  const [fnInput, setFnInput] = useState(200);
  const [dictKey, setDictKey] = useState<'lr' | 'epochs' | 'batch_size'>('lr');
  const [rawTags, setRawTags] = useState<string[]>(['ai', 'python', 'ai', 'ml', 'python']);
  const [oopDone, setOopDone] = useState({ rina: 2, budi: 1 });

  switch (diagramId) {
    case 'py-io-stream':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-text-sub" htmlFor="vis-io-name">
              Try typing a name:
            </label>
            <input
              id="vis-io-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="rounded-xl border border-border-soft bg-surface px-3 py-1.5 font-mono text-xs text-text-main outline-none focus:border-plum"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3.5">
              <div className="font-mono text-[11px] font-bold text-plum">1. input()</div>
              <div className="mt-1 font-mono text-xs text-text-main">
                &quot;{nameInput || 'Engineer'}&quot;
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Always arrives as text (str)</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3.5">
              <div className="font-mono text-[11px] font-bold text-plum">2. f-string</div>
              <div className="mt-1 font-mono text-xs text-text-main">
                f&quot;Welcome, {'{'}name{'}'}!&quot;
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Injects variable cleanly</div>
            </div>
            <div className="rounded-xl border border-code-border bg-code-surface p-3.5 text-white">
              <div className="font-mono text-[11px] font-bold text-[#FACF4E]">3. print() output</div>
              <div className="mt-1 font-mono text-xs text-[#DDA9FF]">
                Welcome, {nameInput.trim() || 'Engineer'}!
              </div>
            </div>
          </div>
        </div>
      );

    case 'py-datatype-boxes': {
      const asInt = Number.parseInt(castText, 10);
      const validInt = !Number.isNaN(asInt);
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-sub">Raw string from input():</span>
            <input
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              className="w-28 rounded-xl border border-border-soft bg-surface px-3 py-1 font-mono text-xs text-text-main outline-none focus:border-plum"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <span className="rounded-full bg-rose-soft px-2 py-0.5 font-mono text-[10px] font-bold text-plum">
                str
              </span>
              <div className="mt-1.5 font-mono text-xs font-bold text-text-main">&quot;{castText}&quot;</div>
              <div className="mt-1 text-[11px] text-text-muted">Text only</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <span className="rounded-full bg-sunshine-soft px-2 py-0.5 font-mono text-[10px] font-bold text-text-main">
                int()
              </span>
              <div className="mt-1.5 font-mono text-xs font-bold text-text-main">
                {validInt ? asInt : 'ValueError'}
              </div>
              <div className="mt-1 text-[11px] text-text-muted">
                {validInt ? `${asInt} + 8 = ${asInt + 8}` : 'Digits needed'}
              </div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <span className="rounded-full bg-lavender-soft px-2 py-0.5 font-mono text-[10px] font-bold text-plum">
                float()
              </span>
              <div className="mt-1.5 font-mono text-xs font-bold text-text-main">
                {validInt ? `${asInt}.0` : 'NaN'}
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Decimal math</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <span className="rounded-full bg-plum-soft px-2 py-0.5 font-mono text-[10px] font-bold text-plum">
                bool()
              </span>
              <div className="mt-1.5 font-mono text-xs font-bold text-text-main">
                {castText.length > 0 ? 'True' : 'False'}
              </div>
              <div className="mt-1 text-[11px] text-text-muted">Non-empty = True</div>
            </div>
          </div>
        </div>
      );
    }

    case 'py-memory-vars':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVarVal((v) => v + 5)}
              className="cursor-pointer rounded-full bg-sunshine px-3.5 py-1.5 font-mono text-xs font-bold text-charcoal hover:bg-sunshine-hover"
            >
              score = score + 5
            </button>
            <button
              type="button"
              onClick={() => setVarVal(10)}
              className="cursor-pointer rounded-full border border-border-soft bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-text-sub hover:border-border-strong"
            >
              Reset to 10
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-soft bg-surface p-4">
            <div className="rounded-lg bg-plum px-3 py-2 font-mono text-xs font-bold text-white">
              score
            </div>
            <span className="font-mono text-sm font-bold text-plum">-&gt;</span>
            <div className="rounded-xl border border-lavender bg-lavender-soft px-5 py-2.5 font-mono text-base font-extrabold text-text-main">
              {varVal}
            </div>
            <span className="text-xs text-text-muted">
              Re-assigning overwrites the box cleanly with the new value.
            </span>
          </div>
        </div>
      );

    case 'py-operators-alu':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 font-mono text-text-sub">
              a =
              <input
                type="number"
                value={opA}
                onChange={(e) => setOpA(Number(e.target.value) || 0)}
                className="w-16 rounded-lg border border-border-soft bg-surface px-2 py-1 text-text-main"
              />
            </label>
            <label className="flex items-center gap-1.5 font-mono text-text-sub">
              b =
              <input
                type="number"
                value={opB}
                onChange={(e) => setOpB(Number(e.target.value) || 1)}
                className="w-16 rounded-lg border border-border-soft bg-surface px-2 py-1 text-text-main"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'a / b', val: opB ? (opA / opB).toFixed(2) : 'Err', note: 'True division' },
              { label: 'a // b', val: opB ? Math.floor(opA / opB) : 'Err', note: 'Floor division' },
              { label: 'a % b', val: opB ? ((opA % opB) + opB) % opB : 'Err', note: 'Remainder' },
              { label: 'a > b', val: opA > opB ? 'True' : 'False', note: 'Comparison' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border-soft bg-surface p-3">
                <div className="font-mono text-xs font-bold text-plum">{item.label}</div>
                <div className="mt-1 font-mono text-sm font-extrabold text-text-main">{item.val}</div>
                <div className="text-[11px] text-text-muted">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'py-branch-flow': {
      const grade = score >= 85 ? 'A (Mastery)' : score >= 70 ? 'B (Proficient)' : 'C (Keep Practicing)';
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">score = {score}</span>
            <input
              type="range"
              min={40}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { cond: 'if score >= 85:', active: score >= 85, out: 'A (Mastery)' },
              { cond: 'elif score >= 70:', active: score >= 70 && score < 85, out: 'B (Proficient)' },
              { cond: 'else:', active: score < 70, out: 'C (Keep Practicing)' },
            ].map((b) => (
              <div
                key={b.cond}
                className={`rounded-xl border p-3 transition-colors ${
                  b.active
                    ? 'border-plum bg-lavender-soft text-text-main'
                    : 'border-border-soft bg-surface text-text-muted opacity-65'
                }`}
              >
                <div className="font-mono text-xs font-bold">{b.cond}</div>
                <div className="mt-1 text-xs font-semibold">{b.out}</div>
              </div>
            ))}
          </div>
          <div className="font-mono text-xs text-text-sub">
            Active Branch: <strong className="text-plum">{grade}</strong>
          </div>
        </div>
      );
    }

    case 'py-loop-stepper':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLoopEpoch((e) => (e >= 5 ? 1 : e + 1))}
              className="cursor-pointer rounded-full bg-sunshine px-3.5 py-1.5 font-mono text-xs font-bold text-charcoal hover:bg-sunshine-hover"
            >
              Step Next Epoch ({loopEpoch}/5)
            </button>
            <span className="font-mono text-xs text-text-muted">for epoch in range(1, 6):</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((ep) => (
              <div
                key={ep}
                className={`rounded-xl border p-2.5 text-center font-mono text-xs font-bold ${
                  ep === loopEpoch
                    ? 'border-plum bg-plum text-white'
                    : ep < loopEpoch
                      ? 'border-lavender bg-lavender-soft text-text-main'
                      : 'border-border-soft bg-surface text-text-muted'
                }`}
              >
                Epoch {ep}
              </div>
            ))}
          </div>
        </div>
      );

    case 'py-list-indexer':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setListItems((prev) =>
                  prev.length < 5 ? [...prev, `Model_${prev.length + 1}`] : prev
                )
              }
              className="cursor-pointer rounded-full bg-sunshine px-3 py-1 font-mono text-xs font-bold text-charcoal"
            >
              .append()
            </button>
            <button
              type="button"
              onClick={() => {
                setListItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
                setSelectedIdx(0);
              }}
              className="cursor-pointer rounded-full border border-border-soft bg-surface px-3 py-1 font-mono text-xs font-semibold text-text-sub"
            >
              .pop()
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {listItems.map((item, idx) => (
              <button
                key={`${item}-${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`cursor-pointer rounded-xl border px-3.5 py-2 text-left font-mono transition-colors ${
                  selectedIdx === idx
                    ? 'border-plum bg-lavender-soft text-text-main'
                    : 'border-border-soft bg-surface text-text-sub'
                }`}
              >
                <div className="text-[10px] text-text-muted">index [{idx}]</div>
                <div className="text-xs font-bold">&quot;{item}&quot;</div>
              </button>
            ))}
          </div>
          <div className="font-mono text-xs text-text-sub">
            models[{selectedIdx}] == <strong className="text-plum">&quot;{listItems[selectedIdx] ?? ''}&quot;</strong>
          </div>
        </div>
      );

    case 'py-dict-set-map': {
      const sampleDict: Record<string, string | number> = { lr: 0.01, epochs: 20 };
      const lookupVal = dictKey in sampleDict ? sampleDict[dictKey] : '32 (default)';
      const uniqueSet = Array.from(new Set(rawTags));
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-surface p-3.5 space-y-2.5">
            <div className="font-mono text-xs font-bold text-plum">Dictionary Key -&gt; Value Lookup</div>
            <div className="flex flex-wrap gap-1.5">
              {(['lr', 'epochs', 'batch_size'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDictKey(k)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${
                    dictKey === k
                      ? 'bg-plum text-white'
                      : 'bg-surface-pill text-text-sub'
                  }`}
                >
                  .get(&quot;{k}&quot;, 32)
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-code-surface px-3 py-2 font-mono text-xs text-[#FACF4E]">
              Result: {String(lookupVal)}
            </div>
          </div>

          <div className="rounded-xl border border-border-soft bg-surface p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-plum">Set Deduplication</span>
              <button
                type="button"
                onClick={() => setRawTags((t) => [...t, 'ai'])}
                className="cursor-pointer rounded-full bg-sunshine px-2.5 py-0.5 font-mono text-[10px] font-bold text-charcoal"
              >
                + Add duplicate &quot;ai&quot;
              </button>
            </div>
            <div className="font-mono text-[11px] text-text-muted">
              list ({rawTags.length}): [{rawTags.join(', ')}]
            </div>
            <div className="rounded-lg bg-lavender-soft px-3 py-2 font-mono text-xs font-bold text-text-main">
              set ({uniqueSet.length}): {'{'}&quot;{uniqueSet.join('", "')}&quot;{'}'}
            </div>
          </div>
        </div>
      );
    }

    case 'py-function-machine':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">price = {fnInput}</span>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={fnInput}
              onChange={(e) => setFnInput(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
              <div className="text-[11px] text-text-muted">Input Parameter</div>
              <div className="mt-1 font-mono text-sm font-bold text-text-main">({fnInput}, 20)</div>
            </div>
            <div className="rounded-xl border border-plum bg-plum p-3 text-center text-white">
              <div className="font-mono text-[11px] text-[#DDA9FF]">def discount_price()</div>
              <div className="mt-1 font-mono text-xs">price * (1 - 20/100)</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3 text-center">
              <div className="text-[11px] text-text-muted">return Value</div>
              <div className="mt-1 font-mono text-sm font-extrabold text-text-main">
                {(fnInput * 0.8).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      );

    case 'py-oop-blueprint':
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['rina', 'budi'] as const).map((who) => (
            <div key={who} className="rounded-xl border border-border-soft bg-surface p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-plum">
                  {who === 'rina' ? 'rina = AILearner("Rina")' : 'budi = AILearner("Budi")'}
                </span>
                <button
                  type="button"
                  onClick={() => setOopDone((prev) => ({ ...prev, [who]: prev[who] + 1 }))}
                  className="cursor-pointer rounded-full bg-sunshine px-2.5 py-1 font-mono text-[10px] font-bold text-charcoal"
                >
                  .finish_module()
                </button>
              </div>
              <div className="mt-2 rounded-lg bg-surface-subtle px-3 py-2 font-mono text-xs text-text-main">
                self.modules_done = <strong className="text-plum">{oopDone[who]}</strong>
              </div>
            </div>
          ))}
        </div>
      );

    case 'py-capstone-arch':
    default:
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          {[
            { step: '1. Class', detail: 'ShoppingCart.__init__' },
            { step: '2. List', detail: 'self.prices.append(p)' },
            { step: '3. Loop', detail: 'for p in self.prices:' },
            { step: '4. Condition', detail: 'if subtotal > 100000: 10% off' },
          ].map((b) => (
            <div key={b.step} className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="font-mono text-xs font-bold text-plum">{b.step}</div>
              <div className="mt-1 font-mono text-[11px] text-text-sub">{b.detail}</div>
            </div>
          ))}
        </div>
      );
  }
}
