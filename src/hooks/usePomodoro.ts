'use client';

import { useEffect, useState } from 'react';
import { POMO_DURATIONS, workspaceActions } from '@/lib/workspaceStore';
import type { PomodoroMode, PomodoroState } from '@/types/curriculum';

function playCompletionChime(muted: boolean): void {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + idx * 0.14;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  } catch {
    // Ignore autoplay restriction silently
  }
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const rem = String(s % 60).padStart(2, '0');
  return `${m}:${rem}`;
}

export function usePomodoro(
  pomodoro: PomodoroState,
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void
) {
  const [alertActive, setAlertActive] = useState(false);

  useEffect(() => {
    document.title = pomodoro.running
      ? `[${formatClock(pomodoro.remainingSec)}] AI Mastery Hub`
      : 'AI Mastery Hub — Learn AI Step-by-Step';
  }, [pomodoro.running, pomodoro.remainingSec]);

  useEffect(() => {
    if (!pomodoro.running || !pomodoro.targetEndMs) return;

    const timer = window.setInterval(() => {
      const target = pomodoro.targetEndMs;
      if (!target) return;
      const left = Math.ceil((target - Date.now()) / 1000);

      if (left <= 0) {
        window.clearInterval(timer);
        playCompletionChime(pomodoro.muted);
        setAlertActive(true);
        window.setTimeout(() => setAlertActive(false), 5000);

        if (pomodoro.mode === 'focus') {
          const nextSessions = pomodoro.sessionsCompleted + 1;
          const nextMode: PomodoroMode = nextSessions % 4 === 0 ? 'long' : 'short';
          workspaceActions.updatePomodoro({
            running: false,
            targetEndMs: null,
            sessionsCompleted: nextSessions,
            mode: nextMode,
            remainingSec: POMO_DURATIONS[nextMode],
          });
          onNotify(
            `Focus sprint complete! Starting ${nextMode === 'long' ? '15m Long Break' : '5m Short Break'}.`,
            'success'
          );
        } else {
          workspaceActions.updatePomodoro({
            running: false,
            targetEndMs: null,
            mode: 'focus',
            remainingSec: POMO_DURATIONS.focus,
          });
          onNotify('Break complete! Ready for the next 25m Focus sprint.', 'info');
        }
      } else if (left !== pomodoro.remainingSec) {
        workspaceActions.updatePomodoro({ remainingSec: left });
      }
    }, 300);

    return () => window.clearInterval(timer);
  }, [
    pomodoro.running,
    pomodoro.targetEndMs,
    pomodoro.remainingSec,
    pomodoro.mode,
    pomodoro.sessionsCompleted,
    pomodoro.muted,
    onNotify,
  ]);

  const togglePlayPause = () => {
    if (pomodoro.running && pomodoro.targetEndMs) {
      const left = Math.max(0, Math.ceil((pomodoro.targetEndMs - Date.now()) / 1000));
      workspaceActions.updatePomodoro({
        running: false,
        targetEndMs: null,
        remainingSec: left,
      });
    } else {
      const baseSec =
        pomodoro.remainingSec > 0 ? pomodoro.remainingSec : POMO_DURATIONS[pomodoro.mode];
      workspaceActions.updatePomodoro({
        running: true,
        remainingSec: baseSec,
        targetEndMs: Date.now() + baseSec * 1000,
      });
    }
  };

  const switchMode = (mode: PomodoroMode) => {
    workspaceActions.updatePomodoro({
      mode,
      running: false,
      targetEndMs: null,
      remainingSec: POMO_DURATIONS[mode],
    });
  };

  const reset = () => {
    workspaceActions.updatePomodoro({
      running: false,
      targetEndMs: null,
      remainingSec: POMO_DURATIONS[pomodoro.mode],
    });
  };

  const toggleMute = () => {
    workspaceActions.updatePomodoro({ muted: !pomodoro.muted });
  };

  return {
    alertActive,
    togglePlayPause,
    switchMode,
    reset,
    toggleMute,
  };
}
