'use client';

import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import type { SubModule } from '@/types/curriculum';

interface LeaveWarningModalProps {
  open: boolean;
  subModule: SubModule;
  onStay: () => void;
  onConfirmLeave: () => void;
}

export function LeaveWarningModal({
  open,
  subModule,
  onStay,
  onConfirmLeave,
}: LeaveWarningModalProps) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="leave-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onStay();
      }}
    >
      <div className="animate-gentle-fade ed-card w-full max-w-md overflow-hidden border-[#F19BB6]">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-soft text-[#F19BB6]">
            <AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
          </div>

          <h2
            id="leave-warning-title"
            className="mt-4 text-lg font-bold text-text-main"
          >
            Peringatan: Materi Belum Selesai!
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-text-sub">
            Anda belum menyelesaikan{' '}
            <strong className="text-text-main">
              Module {subModule.code} — {subModule.title}
            </strong>
            . Jika keluar sekarang, progres langkah, kuis syntax, dan draft kode pada
            modul ini akan <strong>di-reset</strong> dan Anda harus{' '}
            <strong>mengulang dari awal (Step 1)</strong>.
          </p>

          <div className="mt-5 rounded-xl border border-sunshine/60 bg-sunshine-soft px-3.5 py-2.5 text-[11.5px] font-semibold text-text-main">
            Selesaikan &amp; lulus challenge terlebih dahulu agar progres tersimpan permanen.
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onStay}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#532B71] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#44215E]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Lanjut Belajar</span>
            </button>

            <button
              type="button"
              onClick={onConfirmLeave}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#F19BB6] bg-rose-soft px-4 py-2.5 text-xs font-bold text-text-main transition-colors hover:opacity-90"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#F19BB6]" />
              <span>Keluar &amp; Ulang dari Awal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
