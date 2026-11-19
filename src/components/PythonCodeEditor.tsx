'use client';

import { useMemo, useRef } from 'react';
import { highlightPython } from '@/lib/pythonHighlight';

interface PythonCodeEditorProps {
  value: string;
  filename: string;
  onChange: (nextValue: string) => void;
}

export function PythonCodeEditor({
  value,
  filename,
  onChange,
}: PythonCodeEditorProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(() => value.split('\n'), [value]);
  const highlighted = useMemo(() => highlightPython(value), [value]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${value.slice(0, start)}    ${value.slice(end)}`;
      onChange(next);
      window.requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  const rowHeight = 23;
  const computedHeight = Math.max(250, Math.min(460, lines.length * rowHeight + 48));

  return (
    <div className="overflow-hidden rounded-2xl border border-code-border bg-code-surface">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-code-border bg-code-header px-4 py-2 font-mono text-[11px] text-[#B8B0C0]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F19BB6]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FACF4E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#DDA9FF]" />
          <span className="ml-1.5 text-white/90">{filename}</span>
        </div>
        <span>Tab = 4 spaces</span>
      </div>

      {/* Editor Body: Line Numbers + Overlay Syntax Highlighter */}
      <div
        className="relative flex font-mono text-[13.5px] leading-[1.7]"
        style={{ height: `${computedHeight}px` }}
      >
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-11 shrink-0 select-none overflow-hidden border-r border-code-border bg-[#1D1B1E] py-4 pr-3 text-right text-xs leading-[1.915] text-[#8E8596]"
        >
          {lines.map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Highlighted Backdrop + Interactive Transparent Textarea */}
        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-4 font-mono text-[13.5px] leading-[1.7] [tab-size:4]"
          >
            <code>
              {highlighted}
              {value.endsWith('\n') ? ' ' : ''}
            </code>
          </pre>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Python solution editor"
            className="relative z-10 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-[13.5px] leading-[1.7] text-transparent caret-[#FACF4E] outline-none selection:bg-[#DDA9FF]/30 [tab-size:4]"
          />
        </div>
      </div>
    </div>
  );
}
