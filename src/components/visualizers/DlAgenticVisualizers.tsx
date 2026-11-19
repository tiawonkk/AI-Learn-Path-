'use client';

import { useState } from 'react';
import type { DiagramId } from '@/types/curriculum';

export function DlAgenticVisualizer({ diagramId }: { diagramId: DiagramId }) {
  const [weight, setWeight] = useState(1.2);
  const [actMode, setActMode] = useState<'relu' | 'sigmoid' | 'softmax'>('relu');
  const [lrMode, setLrMode] = useState<'small' | 'good' | 'huge'>('good');
  const [kernelPos, setKernelPos] = useState(0);
  const [forgetGate, setForgetGate] = useState(0.8);
  const [attnToken, setAttnToken] = useState(0);
  const [latentNoise, setLatentNoise] = useState(0.5);
  const [reactStep, setReactStep] = useState(0);
  const [hitlApproved, setHitlApproved] = useState(false);

  switch (diagramId) {
    case 'dl-math-neuron': {
      const x = 2.0;
      const b = 0.5;
      const yTrue = 4.0;
      const z = weight * x + b;
      const loss = (z - yTrue) ** 2;
      const grad = 2 * (z - yTrue) * x;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">Weight w = {weight.toFixed(2)}</span>
            <input
              type="range"
              min={-1}
              max={3.5}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="font-mono text-[11px] text-text-muted">z = w · x + b (x=2, b=0.5)</div>
              <div className="mt-1 font-mono text-sm font-extrabold text-plum">z = {z.toFixed(2)}</div>
              <div className="text-[11px] text-text-muted">Target y = 4.00</div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-3">
              <div className="font-mono text-[11px] text-text-muted">Squared Error Loss</div>
              <div className="mt-1 font-mono text-sm font-extrabold text-text-main">{loss.toFixed(2)}</div>
              <div className="text-[11px] text-text-muted">Goal: minimize to 0.00</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3">
              <div className="font-mono text-[11px] text-text-muted">Gradient dL/dw</div>
              <div className="mt-1 font-mono text-sm font-extrabold text-text-main">{grad.toFixed(2)}</div>
              <div className="text-[11px] text-text-sub">
                {Math.abs(grad) < 0.2 ? 'At minimum!' : grad > 0 ? 'Step w LEFT (-)' : 'Step w RIGHT (+)'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'dl-mlp-activations':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['relu', 'sigmoid', 'softmax'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setActMode(m)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                  actMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'relu' ? 'ReLU (Hidden)' : m === 'sigmoid' ? 'Sigmoid (Binary)' : 'Softmax (Multi-Class)'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 110" className="h-28 w-full">
              <line x1="20" y1="85" x2="245" y2="85" stroke="currentColor" strokeOpacity="0.2" />
              <line x1="130" y1="15" x2="130" y2="98" stroke="currentColor" strokeOpacity="0.2" />
              {actMode === 'relu' && (
                <path d="M 30 85 H 130 L 230 20" fill="none" stroke="#532B71" strokeWidth="3" />
              )}
              {actMode === 'sigmoid' && (
                <path d="M 30 84 C 95 84, 115 55, 130 52 C 145 49, 165 20, 230 20" fill="none" stroke="#F19BB6" strokeWidth="3" />
              )}
              {actMode === 'softmax' && (
                <>
                  <rect x="45" y="65" width="40" height="20" rx="4" fill="#DDA9FF" />
                  <rect x="110" y="45" width="40" height="40" rx="4" fill="#F19BB6" />
                  <rect x="175" y="22" width="40" height="63" rx="4" fill="#FACF4E" />
                  <text x="53" y="98" fontSize="9" fill="currentColor">12%</text>
                  <text x="118" y="98" fontSize="9" fill="currentColor">28%</text>
                  <text x="183" y="98" fontSize="9" fill="currentColor">60%</text>
                </>
              )}
            </svg>
            <div className="text-xs text-text-sub">
              {actMode === 'relu'
                ? 'ReLU = max(0, z): bends linear layers without vanishing positive gradients.'
                : actMode === 'sigmoid'
                  ? 'Sigmoid squashes any score into binary probability (0..1).'
                  : 'Softmax turns class logits into probabilities summing to 100%.'}
            </div>
          </div>
        </div>
      );

    case 'dl-gradient-descent':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['small', 'good', 'huge'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLrMode(m)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  lrMode === m ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {m === 'small' ? 'LR = 0.0001 (Too Small)' : m === 'good' ? 'LR = 0.05 (Optimal)' : 'LR = 2.0 (Diverges!)'}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <svg viewBox="0 0 260 110" className="h-28 w-full">
              <path d="M 25 20 Q 130 140 235 20" fill="none" stroke="#532B71" strokeWidth="2.5" />
              {lrMode === 'small' &&
                [50, 58, 66, 74].map((x, i) => (
                  <circle key={i} cx={x} cy={38 + i * 7} r="4.5" fill="#DDA9FF" stroke="#532B71" />
                ))}
              {lrMode === 'good' &&
                [[50, 38], [82, 66], [112, 78], [130, 80]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="#FACF4E" stroke="#232124" />
                ))}
              {lrMode === 'huge' && (
                <>
                  <path d="M 65 55 L 205 42 L 38 22" fill="none" stroke="#F19BB6" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx="38" cy="22" r="5" fill="#F19BB6" stroke="#232124" />
                </>
              )}
            </svg>
            <div className="text-xs text-text-sub">
              {lrMode === 'small'
                ? 'Tiny learning rate crawls slowly down the loss valley.'
                : lrMode === 'good'
                  ? 'Balanced learning rate settles smoothly into the minimum loss.'
                  : 'Oversized learning rate overshoots across the valley and explodes!'}
            </div>
          </div>
        </div>
      );

    case 'dl-cnn-kernel': {
      const cells = [1, 2, 0, 0, 1, 3, 2, 1, 0];
      const topLeftMap = [0, 1, 3, 4];
      const tl = topLeftMap[kernelPos];
      const activeSet = new Set([tl, tl + 1, tl + 3, tl + 4]);
      const sumVal = cells[tl] + cells[tl + 4];
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setKernelPos((p) => (p + 1) % 4)}
              className="cursor-pointer rounded-full bg-sunshine px-3.5 py-1 font-mono text-xs font-bold text-charcoal"
            >
              Slide 2x2 Kernel (Pos {kernelPos + 1}/4)
            </button>
            <span className="font-mono text-xs text-text-muted">Diagonal kernel [[1,0],[0,1]]</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border-soft bg-surface p-3 font-mono text-xs">
              {cells.map((v, i) => (
                <div
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold ${
                    activeSet.has(i) ? 'bg-plum text-white' : 'bg-surface-pill text-text-sub'
                  }`}
                >
                  {v}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft px-4 py-3 font-mono text-xs">
              <div className="text-text-muted">Feature Map Cell</div>
              <div className="mt-1 text-base font-extrabold text-text-main">dot = {sumVal}</div>
            </div>
          </div>
        </div>
      );
    }

    case 'dl-rnn-lstm':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">
              LSTM Forget Gate f_t = {forgetGate.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={forgetGate}
              onChange={(e) => setForgetGate(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3 font-mono text-xs">
              <div className="text-text-muted">Old Memory c_(t-1)</div>
              <div className="mt-1 font-bold text-plum">10.00</div>
            </div>
            <div className="rounded-xl border border-plum bg-plum p-3 text-center font-mono text-xs text-white">
              <div className="text-[#DDA9FF]">Retained (f_t * c_prev)</div>
              <div className="mt-1 font-bold">{(forgetGate * 10).toFixed(1)}</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3 font-mono text-xs">
              <div className="text-text-muted">Memory Behavior</div>
              <div className="mt-1 font-bold text-text-main">
                {forgetGate >= 0.7 ? 'Long-term retained' : forgetGate <= 0.2 ? 'Old context cleared' : 'Partial blend'}
              </div>
            </div>
          </div>
        </div>
      );

    case 'dl-transformer-attn': {
      const tokens = ['The', 'model', 'learned', 'fast'];
      const weightsByTok = [
        [0.45, 0.35, 0.12, 0.08],
        [0.15, 0.45, 0.30, 0.10],
        [0.08, 0.42, 0.35, 0.15],
        [0.05, 0.20, 0.45, 0.30],
      ];
      const weights = weightsByTok[attnToken];
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-sub">Query Token:</span>
            {tokens.map((tok, idx) => (
              <button
                key={tok}
                type="button"
                onClick={() => setAttnToken(idx)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold ${
                  attnToken === idx ? 'bg-plum text-white' : 'border border-border-soft bg-surface text-text-sub'
                }`}
              >
                {tok}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {tokens.map((tok, idx) => (
              <div key={tok} className="rounded-xl border border-border-soft bg-surface p-2.5 text-center">
                <div className="font-mono text-xs font-bold text-text-main">{tok}</div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-pill">
                  <div
                    className="h-full rounded-full bg-plum"
                    style={{ width: `${Math.round(weights[idx] * 100)}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[11px] font-bold text-plum">
                  {Math.round(weights[idx] * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'dl-generative-latent':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-text-main">
              VAE Sample Noise eps = {latentNoise.toFixed(1)}
            </span>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.2}
              value={latentNoise}
              onChange={(e) => setLatentNoise(Number(e.target.value))}
              className="flex-1 accent-[#532B71]"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface p-3 font-mono text-xs">
              <div className="text-text-muted">Encoder -&gt; (mu, sigma)</div>
              <div className="mt-1 font-bold text-plum">mu = 1.0, sigma = 0.5</div>
            </div>
            <div className="rounded-xl border border-plum bg-lavender-soft p-3 text-center font-mono text-xs">
              <div className="text-text-muted">Latent z = mu + sigma*eps</div>
              <div className="mt-1 font-extrabold text-plum">{(1.0 + 0.5 * latentNoise).toFixed(2)}</div>
            </div>
            <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3 font-mono text-xs">
              <div className="text-text-muted">Decoder / Denoiser</div>
              <div className="mt-1 font-bold text-text-main">Generates smooth variant</div>
            </div>
          </div>
        </div>
      );

    case 'dl-capstone-moons':
      return (
        <div className="rounded-xl border border-border-soft bg-surface p-3">
          <svg viewBox="0 0 260 110" className="h-28 w-full">
            <path d="M 45 72 Q 105 15 165 72" fill="none" stroke="#532B71" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.35" />
            <path d="M 95 42 Q 155 100 215 42" fill="none" stroke="#FACF4E" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.65" />
            <path d="M 40 92 C 110 68, 150 42, 220 20" fill="none" stroke="#F19BB6" strokeWidth="2.5" strokeDasharray="5 3" />
          </svg>
          <div className="text-xs text-text-sub">
            ReLU hidden layers bend the pink decision curve cleanly between the two interleaved moons.
          </div>
        </div>
      );

    case 'ai-structured-json':
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-surface p-3.5">
            <div className="font-mono text-xs font-bold text-text-muted">Passive Chatbot (Unstructured)</div>
            <p className="mt-1.5 text-xs text-text-sub">
              &quot;Sure! I think the user probably wants to search docs with high confidence.&quot;
            </p>
          </div>
          <div className="rounded-xl border border-code-border bg-code-surface p-3.5 font-mono text-xs text-white">
            <div className="font-bold text-[#FACF4E]">Agentic JSON Contract (Parseable)</div>
            <div className="mt-1.5 text-[#DDA9FF]">
              {'{'}&quot;intent&quot;: &quot;search_docs&quot;, &quot;confidence&quot;: 0.92{'}'}
            </div>
          </div>
        </div>
      );

    case 'ai-rag-pipeline':
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { t: '1. Chunk', d: 'Overlap keeps sentences intact' },
            { t: '2. Embed', d: 'Text -> dense vector' },
            { t: '3. Top-K Search', d: 'Highest cosine similarity' },
            { t: '4. Grounded LLM', d: 'Answers strictly from sources' },
          ].map((s, i) => (
            <div
              key={s.t}
              className={`rounded-xl border p-3 ${
                i === 3 ? 'border-plum bg-plum text-white' : 'border-border-soft bg-surface text-text-main'
              }`}
            >
              <div className="font-mono text-xs font-bold">{s.t}</div>
              <div className="mt-1 text-[11px] opacity-85">{s.d}</div>
            </div>
          ))}
        </div>
      );

    case 'ai-tool-calling':
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-code-border bg-code-surface p-3 font-mono text-xs text-[#DDA9FF]">
            Model emits: {'{'}&quot;tool&quot;:&quot;multiply&quot;, &quot;args&quot;:{'{'}&quot;a&quot;:6,&quot;b&quot;:7{'}'}{'}'}
          </div>
          <div className="rounded-xl border border-plum bg-lavender-soft p-3 text-center font-mono text-xs">
            <div className="font-bold text-plum">Allow-List Schema Gate</div>
            <div className="mt-1 text-[11px] text-text-sub">Blocks unknown tools & missing args</div>
          </div>
          <div className="rounded-xl border border-sunshine bg-sunshine-soft p-3 text-center font-mono text-xs">
            <div className="text-text-muted">Safe Tool Return</div>
            <div className="mt-1 font-extrabold text-text-main">{'{'}ok: True, result: 42{'}'}</div>
          </div>
        </div>
      );

    case 'ai-react-langgraph': {
      const trace = [
        { phase: 'Thought', text: 'I need the live GPU price before answering.' },
        { phase: 'Action', text: 'call_tool("price_lookup", arg="GPU")' },
        { phase: 'Observation', text: 'Tool returned "$1200".' },
        { phase: 'Final Answer', text: 'The current GPU price is $1200 (2/5 steps used).' },
      ];
      return (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setReactStep((s) => (s + 1) % trace.length)}
            className="cursor-pointer rounded-full bg-sunshine px-3.5 py-1 font-mono text-xs font-bold text-charcoal"
          >
            Next ReAct Step ({reactStep + 1}/{trace.length})
          </button>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {trace.map((item, idx) => (
              <div
                key={item.phase}
                className={`rounded-xl border p-3 transition-colors ${
                  idx === reactStep
                    ? 'border-plum bg-plum text-white'
                    : idx < reactStep
                      ? 'border-lavender bg-lavender-soft text-text-main'
                      : 'border-border-soft bg-surface text-text-muted opacity-65'
                }`}
              >
                <div className="font-mono text-[11px] font-bold">{item.phase}</div>
                <div className="mt-1 text-[11px]">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'ai-multiagent-hitl':
    case 'ai-capstone-multiagent':
    default:
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHitlApproved((v) => !v)}
              className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-xs font-bold ${
                hitlApproved ? 'bg-plum text-white' : 'bg-sunshine text-charcoal'
              }`}
            >
              {hitlApproved ? 'Human Approved ✓ (Click to Reset)' : 'Approve High-Risk Action (HITL)'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { role: 'Researcher', note: 'Gathers RAG facts', active: true },
              { role: 'Writer', note: 'Drafts brief', active: true },
              { role: 'Reviewer', note: 'Audits quality', active: true },
              {
                role: 'HITL Gate',
                note: hitlApproved ? 'Published ✓' : 'Paused (Pending Human)',
                active: hitlApproved,
              },
            ].map((node) => (
              <div
                key={node.role}
                className={`rounded-xl border p-3 text-center ${
                  node.active
                    ? 'border-plum bg-lavender-soft text-text-main'
                    : 'border-[#F19BB6] bg-rose-soft text-text-main'
                }`}
              >
                <div className="font-mono text-xs font-bold text-plum">{node.role}</div>
                <div className="mt-1 text-[11px] text-text-sub">{node.note}</div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}
