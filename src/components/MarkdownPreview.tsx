'use client';

import React from 'react';

interface MarkdownPreviewProps {
  source: string;
}

function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded-md bg-surface-pill px-1.5 py-0.5 font-mono text-[12px] text-brand"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-text-main">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownPreview({ source }: MarkdownPreviewProps) {
  if (!source.trim()) {
    return (
      <p className="text-xs italic text-text-muted">
        Markdown preview appears here as you take study notes...
      </p>
    );
  }

  const lines = source.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      nodes.push(
        <pre
          key={`code-${i}`}
          className="my-2 overflow-x-auto rounded-xl bg-code-surface p-3 font-mono text-xs text-white"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="mt-3 mb-1 text-sm font-bold text-text-main">
          {renderInline(line.slice(4))}
        </h3>
      );
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="mt-3 mb-1 text-base font-bold text-text-main">
          {renderInline(line.slice(3))}
        </h2>
      );
      i += 1;
      continue;
    }
    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={i} className="mt-3 mb-1 text-lg font-bold text-text-main">
          {renderInline(line.slice(2))}
        </h1>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote
          key={i}
          className="my-2 rounded-r-xl border-l-3 border-brand bg-brand-soft px-3 py-1.5 text-xs text-text-main"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-border-soft" />);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        const raw = lines[i].replace(/^[-*]\s+/, '');
        const task = raw.match(/^\[(x|X| )\]\s+(.+)/);
        if (task) {
          const checked = task[1].toLowerCase() === 'x';
          items.push(
            <li key={i} className="list-none -ml-4 flex items-start gap-2">
              <span className="font-mono text-[11px] font-semibold text-brand">
                {checked ? '[x]' : '[ ]'}
              </span>
              <span>{renderInline(task[2])}</span>
            </li>
          );
        } else {
          items.push(<li key={i}>{renderInline(raw)}</li>);
        }
        i += 1;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-1.5 list-disc space-y-1 pl-5 text-[13px] text-text-sub">
          {items}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\.\s+/, ''))}</li>);
        i += 1;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-1.5 list-decimal space-y-1 pl-5 text-[13px] text-text-sub">
          {items}
        </ol>
      );
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    nodes.push(
      <p key={i} className="my-1.5 text-[13px] leading-relaxed text-text-sub">
        {renderInline(line)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}
