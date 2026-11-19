import React from 'react';

const KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

const BUILTINS = new Set([
  'abs',
  'all',
  'any',
  'bool',
  'dict',
  'enumerate',
  'float',
  'input',
  'int',
  'isinstance',
  'len',
  'list',
  'max',
  'min',
  'print',
  'range',
  'round',
  'set',
  'sorted',
  'str',
  'sum',
  'super',
  'tuple',
  'type',
  'zip',
]);

function highlightFStringBody(body: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let chunk = '';

  const flushChunk = () => {
    if (chunk) {
      parts.push(
        <span key={`${keyPrefix}-s-${parts.length}`} className="text-[#F19BB6]">
          {chunk}
        </span>
      );
      chunk = '';
    }
  };

  while (i < body.length) {
    if (body[i] === '{') {
      if (body[i + 1] === '{') {
        chunk += '{{';
        i += 2;
        continue;
      }
      const close = body.indexOf('}', i + 1);
      if (close !== -1) {
        flushChunk();
        const inner = body.slice(i + 1, close);
        parts.push(
          <span key={`${keyPrefix}-ob-${parts.length}`} className="text-[#FACF4E]">
            {'{'}
          </span>
        );
        parts.push(
          <span key={`${keyPrefix}-ex-${parts.length}`} className="text-[#FFFFFF]">
            {inner}
          </span>
        );
        parts.push(
          <span key={`${keyPrefix}-cb-${parts.length}`} className="text-[#FACF4E]">
            {'}'}
          </span>
        );
        i = close + 1;
        continue;
      }
    }
    chunk += body[i];
    i += 1;
  }

  flushChunk();
  return parts;
}

export function highlightPython(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let prevKeyword = '';
  const n = code.length;

  while (i < n) {
    const ch = code[i];

    // Comments (# to end of line)
    if (ch === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = n;
      nodes.push(
        <span key={`c-${i}`} className="italic text-[#9A92A3]">
          {code.slice(i, end)}
        </span>
      );
      i = end;
      continue;
    }

    // String literals (with optional f/r/b prefix)
    const isPrefixedStr =
      (ch === 'f' || ch === 'F' || ch === 'r' || ch === 'R' || ch === 'b' || ch === 'B') &&
      (code[i + 1] === '"' || code[i + 1] === "'");

    if (ch === '"' || ch === "'" || isPrefixedStr) {
      const start = i;
      const isFStr = isPrefixedStr && (ch === 'f' || ch === 'F');
      if (isPrefixedStr) {
        nodes.push(
          <span key={`pf-${i}`} className="font-semibold text-[#FACF4E]">
            {ch}
          </span>
        );
        i += 1;
      }
      const quote = code[i];
      const isTriple = code.slice(i, i + 3) === quote.repeat(3);
      const delim = isTriple ? quote.repeat(3) : quote;
      i += delim.length;
      const bodyStart = i;

      while (i < n) {
        if (code[i] === '\\' && i + 1 < n) {
          i += 2;
          continue;
        }
        if (code.slice(i, i + delim.length) === delim) {
          break;
        }
        if (!isTriple && code[i] === '\n') {
          break;
        }
        i += 1;
      }

      const body = code.slice(bodyStart, i);
      const hasClose = code.slice(i, i + delim.length) === delim;
      if (hasClose) i += delim.length;

      if (isFStr) {
        nodes.push(
          <span key={`qo-${start}`} className="text-[#F19BB6]">
            {delim}
          </span>
        );
        nodes.push(...highlightFStringBody(body, `f-${start}`));
        if (hasClose) {
          nodes.push(
            <span key={`qc-${start}`} className="text-[#F19BB6]">
              {delim}
            </span>
          );
        }
      } else {
        nodes.push(
          <span key={`str-${start}`} className="text-[#F19BB6]">
            {delim}
            {body}
            {hasClose ? delim : ''}
          </span>
        );
      }
      prevKeyword = '';
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      const start = i;
      while (i < n && /[0-9._eE]/.test(code[i])) {
        i += 1;
      }
      nodes.push(
        <span key={`num-${start}`} className="text-[#FACF4E]">
          {code.slice(start, i)}
        </span>
      );
      prevKeyword = '';
      continue;
    }

    // Identifiers, keywords, builtins, function/method names
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < n && /[a-zA-Z0-9_]/.test(code[i])) {
        i += 1;
      }
      const word = code.slice(start, i);
      const nextNonSpace = code[i];

      if (KEYWORDS.has(word)) {
        nodes.push(
          <span key={`kw-${start}`} className="font-semibold text-[#DDA9FF]">
            {word}
          </span>
        );
        prevKeyword = word === 'def' || word === 'class' ? word : '';
      } else if (word === 'self') {
        nodes.push(
          <span key={`self-${start}`} className="italic text-[#F19BB6]">
            {word}
          </span>
        );
        prevKeyword = '';
      } else if (prevKeyword === 'def' || prevKeyword === 'class') {
        nodes.push(
          <span key={`decl-${start}`} className="font-semibold text-[#FACF4E]">
            {word}
          </span>
        );
        prevKeyword = '';
      } else if (BUILTINS.has(word)) {
        nodes.push(
          <span key={`bi-${start}`} className="text-[#DDA9FF]">
            {word}
          </span>
        );
        prevKeyword = '';
      } else if (nextNonSpace === '(') {
        nodes.push(
          <span key={`fn-${start}`} className="text-[#FACF4E]">
            {word}
          </span>
        );
        prevKeyword = '';
      } else {
        nodes.push(
          <span key={`id-${start}`} className="text-[#FFFFFF]">
            {word}
          </span>
        );
        prevKeyword = '';
      }
      continue;
    }

    // Multi-char & single-char operators
    const twoChar = code.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '//', '**', '+=', '-=', '*=', '/='].includes(twoChar)) {
      nodes.push(
        <span key={`op2-${i}`} className="text-[#FACF4E]">
          {twoChar}
        </span>
      );
      i += 2;
      continue;
    }

    if ('=+-*/%<>@'.includes(ch)) {
      nodes.push(
        <span key={`op1-${i}`} className="text-[#FACF4E]">
          {ch}
        </span>
      );
      i += 1;
      continue;
    }

    if ('()[]{}:,.'.includes(ch)) {
      nodes.push(
        <span key={`pu-${i}`} className="text-[#C7BECF]">
          {ch}
        </span>
      );
      i += 1;
      continue;
    }

    // Whitespace / newlines / other characters
    const start = i;
    while (i < n && (code[i] === ' ' || code[i] === '\t' || code[i] === '\n' || code[i] === '\r')) {
      i += 1;
    }
    if (i === start) i += 1;
    nodes.push(<React.Fragment key={`ws-${start}`}>{code.slice(start, i)}</React.Fragment>);
  }

  return nodes;
}
