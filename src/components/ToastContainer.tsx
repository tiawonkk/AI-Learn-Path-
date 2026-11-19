'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ToastItem } from '@/types/curriculum';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-20 right-5 z-[100] flex max-w-sm flex-col gap-2.5"
    >
      {toasts.map((t) => {
        const toneStyles =
          t.tone === 'success'
            ? 'border-plum/30 bg-lavender-soft text-text-main'
            : t.tone === 'error'
              ? 'border-[#F19BB6] bg-rose-soft text-text-main'
              : 'border-border-soft bg-surface text-text-main';

        const Icon =
          t.tone === 'success'
            ? CheckCircle2
            : t.tone === 'error'
              ? AlertCircle
              : Info;

        const iconColor =
          t.tone === 'success'
            ? 'text-plum'
            : t.tone === 'error'
              ? 'text-[#F19BB6]'
              : 'text-plum';

        return (
          <div
            key={t.id}
            className={`animate-gentle-fade pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-lg ${toneStyles}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} strokeWidth={2.2} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
