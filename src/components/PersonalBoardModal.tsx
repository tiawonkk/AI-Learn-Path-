'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  Mail,
  Settings2,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  signInWithEmailPassword,
  signInWithOAuthProvider,
  signOutSupabase,
  signUpWithEmailPassword,
} from '@/lib/hybridPersistence';
import {
  buildJsonBackup,
  downloadTextFile,
  workspaceActions,
} from '@/lib/workspaceStore';
import type { WorkspaceState } from '@/types/curriculum';

interface PersonalBoardModalProps {
  open: boolean;
  state: WorkspaceState;
  isPersonalBoardRoute?: boolean;
  onClose: () => void;
  onNotify: (msg: string, tone?: 'success' | 'error' | 'info') => void;
}

function friendlyAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email atau password salah. Jika belum punya akun, klik tab "Sign Up" untuk mendaftar terlebih dahulu.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek inbox email Anda untuk klik link verifikasi, atau nonaktifkan "Confirm email" di Supabase Dashboard → Auth → Providers → Email.';
  }
  if (lower.includes('rate limit')) {
    return 'Terlalu banyak percobaan email dalam waktu singkat (batas free tier Supabase). Tunggu sebentar atau nonaktifkan Confirm email di Supabase Dashboard.';
  }
  return raw;
}

export function PersonalBoardModal({
  open,
  state,
  isPersonalBoardRoute,
  onClose,
  onNotify,
}: PersonalBoardModalProps) {
  const [authBusy, setAuthBusy] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    tone: 'error' | 'success';
    text: string;
  } | null>(null);
  const [showGuestSettings, setShowGuestSettings] = useState(false);

  if (!open) return null;

  const isSignedIn = state.profile.authMode === 'supabase';
  const totalSubmissions = Object.values(state.submissionsByModule).reduce(
    (sum, list) => sum + list.length,
    0
  );

  const handleOAuth = async (provider: 'google' | 'github') => {
    setFormFeedback(null);
    setAuthBusy(true);
    const res = await signInWithOAuthProvider(provider);
    setAuthBusy(false);
    if (!res.ok) {
      setFormFeedback({
        tone: 'error',
        text: res.error || 'OAuth provider belum aktif di Supabase Dashboard.',
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    if (!email.trim() || password.length < 6) {
      setFormFeedback({
        tone: 'error',
        text: 'Masukkan email yang valid dan password minimal 6 karakter.',
      });
      return;
    }

    setAuthBusy(true);
    if (authTab === 'signin') {
      const res = await signInWithEmailPassword(email.trim(), password);
      setAuthBusy(false);
      if (!res.ok) {
        setFormFeedback({
          tone: 'error',
          text: friendlyAuthError(res.error || 'Gagal masuk. Coba lagi.'),
        });
      } else {
        setPassword('');
        onNotify('Berhasil masuk ke Personal Learning Board!', 'success');
        onClose();
      }
    } else {
      const res = await signUpWithEmailPassword(email.trim(), password);
      setAuthBusy(false);
      if (!res.ok) {
        setFormFeedback({
          tone: 'error',
          text: friendlyAuthError(res.error || 'Gagal membuat akun.'),
        });
      } else {
        setPassword('');
        setFormFeedback({
          tone: 'success',
          text:
            res.message ||
            'Akun berhasil dibuat! Cek inbox email untuk verifikasi lalu Sign In.',
        });
      }
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    await signOutSupabase();
    await workspaceActions.switchToGuestBoard();
    setAuthBusy(false);
    onNotify('Berhasil keluar — kembali ke Guest Mode.', 'info');
  };

  const handleExportJson = () => {
    const slug = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `ai-mastery-board-${state.profile.username}-${slug}.json`,
      buildJsonBackup(state),
      'application/json'
    );
    onNotify('Backup Personal Board (.json) berhasil diunduh!', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = (parsed?.state ?? parsed) as Partial<WorkspaceState>;
        if (!imported || typeof imported !== 'object' || !imported.challenges) {
          throw new Error('Invalid JSON');
        }
        workspaceActions.importSnapshot(imported);
        onNotify('Backup berhasil dipulihkan!', 'success');
      } catch {
        onNotify('File backup .json tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-label="Sign in to AI Mastery Hub"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-gentle-fade ed-card relative w-full max-w-[430px] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface-subtle text-text-sub hover:text-text-main"
        >
          <X className="h-4 w-4" />
        </button>

        {/* VIEW A: STANDARD LOGIN / SIGN UP SCREEN */}
        {!isSignedIn && !showGuestSettings && (
          <div className="max-h-[88vh] space-y-5 overflow-y-auto p-7">
            {/* Centered Brand Header */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-soft text-plum">
                <GraduationCap className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-text-main">
                {authTab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                {authTab === 'signin'
                  ? 'Sign in to sync your progress, XP, and saved works.'
                  : 'Get your own personal AI Mastery Hub learning board.'}
              </p>
            </div>

            {/* Clean Segmented Tabs: Sign In / Sign Up */}
            <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-pill p-1">
              {(['signin', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setAuthTab(tab);
                    setFormFeedback(null);
                  }}
                  className={`cursor-pointer rounded-full py-2 text-xs font-bold transition-colors ${
                    authTab === tab
                      ? 'bg-surface text-plum shadow-xs'
                      : 'text-text-sub hover:text-text-main'
                  }`}
                >
                  {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Inline Error / Success Feedback */}
            {formFeedback && (
              <div
                role="alert"
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
                  formFeedback.tone === 'error'
                    ? 'border-[#F19BB6] bg-rose-soft text-text-main'
                    : 'border-plum/30 bg-lavender-soft text-text-main'
                }`}
              >
                {formFeedback.tone === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F19BB6]" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                )}
                <span>{formFeedback.text}</span>
              </div>
            )}

            {/* Standard Vertical Login Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-xl border border-border-soft bg-surface-subtle py-2.5 pr-3.5 pl-10 text-sm text-text-main outline-none transition-colors focus:border-plum focus:bg-surface"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={authTab === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-border-soft bg-surface-subtle py-2.5 pr-10 pl-10 text-sm text-text-main outline-none transition-colors focus:border-plum focus:bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authBusy}
                className="w-full cursor-pointer rounded-full bg-[#532B71] py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#44215E] disabled:opacity-50"
              >
                {authBusy
                  ? 'Please wait...'
                  : authTab === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>

            {/* Clean Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border-soft" />
              <span className="text-[11px] font-medium text-text-muted">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border-soft" />
            </div>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={authBusy}
                onClick={() => handleOAuth('google')}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface py-2.5 text-xs font-bold text-text-main transition-colors hover:bg-surface-subtle disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#532B71"
                    d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.24-.92 2.29-1.97 3v2.49h3.19c1.86-1.72 2.94-4.25 2.94-7.25 0-.42-.04-.83-.11-1.22z"
                  />
                  <path
                    fill="#DDA9FF"
                    d="M12.17 22c2.65 0 4.88-.88 6.51-2.38l-3.19-2.49c-.88.59-2.01.95-3.32.95-2.55 0-4.71-1.72-5.48-4.04H3.4v2.56C5.02 19.82 8.33 22 12.17 22z"
                  />
                  <path
                    fill="#FACF4E"
                    d="M6.69 14.04a5.9 5.9 0 0 1 0-4.08V7.4H3.4a9.99 9.99 0 0 0 0 9.2l3.29-2.56z"
                  />
                  <path
                    fill="#F19BB6"
                    d="M12.17 5.92c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.04 2.98 14.82 2 12.17 2 8.33 2 5.02 4.18 3.4 7.4l3.29 2.56c.77-2.32 2.93-4.04 5.48-4.04z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                disabled={authBusy}
                onClick={() => handleOAuth('github')}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface py-2.5 text-xs font-bold text-text-main transition-colors hover:bg-surface-subtle disabled:opacity-50"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Guest Mode Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-4 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer font-semibold text-text-sub hover:text-text-main"
              >
                Continue as Guest (Offline)
              </button>
              <button
                type="button"
                onClick={() => setShowGuestSettings(true)}
                className="inline-flex cursor-pointer items-center gap-1 font-semibold text-plum hover:underline"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Board Settings &amp; Backup
              </button>
            </div>
          </div>
        )}

        {/* VIEW B: SIGNED-IN ACCOUNT OR GUEST BOARD SETTINGS */}
        {(isSignedIn || showGuestSettings) && (
          <div className="max-h-[88vh] space-y-5 overflow-y-auto p-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender-soft px-3 py-1 text-[11px] font-bold text-plum">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isSignedIn ? 'Cloud Account Connected' : 'Guest Mode (IndexedDB)'}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {totalSubmissions} saved work{totalSubmissions === 1 ? '' : 's'}
                </span>
              </div>
              <h2 className="mt-2.5 text-lg font-bold text-text-main">
                Personal Learning Board
              </h2>
              <p className="font-mono text-[11px] text-text-muted">
                @{state.profile.username} • {state.profile.boardId}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-subtle p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-text-muted">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={state.profile.displayName}
                    onChange={(e) =>
                      workspaceActions.updateUserProfile({ displayName: e.target.value })
                    }
                    className="w-full rounded-xl border border-border-soft bg-surface px-3 py-1.5 text-xs text-text-main outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-text-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    value={state.profile.username}
                    onChange={(e) =>
                      workspaceActions.updateUserProfile({ username: e.target.value })
                    }
                    className="w-full rounded-xl border border-border-soft bg-surface px-3 py-1.5 font-mono text-xs text-text-main outline-none focus:border-plum"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-2 pt-1 text-xs">
                <span className="font-medium text-text-sub">
                  Allow public board view
                </span>
                <input
                  type="checkbox"
                  checked={state.profile.publicBoardEnabled}
                  onChange={(e) =>
                    workspaceActions.updateUserProfile({
                      publicBoardEnabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#532B71]"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-sunshine px-4 py-2 text-xs font-bold text-charcoal hover:bg-sunshine-hover"
              >
                <Download className="h-3.5 w-3.5" />
                Export Backup (.json)
              </button>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text-sub hover:border-border-strong hover:text-text-main">
                <Upload className="h-3.5 w-3.5" />
                Import (.json)
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              {!isPersonalBoardRoute && (
                <Link
                  href="/board"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full border border-plum/30 bg-lavender-soft px-3.5 py-2 text-xs font-bold text-plum hover:opacity-90"
                >
                  Open /board
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border-soft pt-4 text-xs">
              {isSignedIn ? (
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={handleSignOut}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#F19BB6] bg-rose-soft px-3.5 py-1.5 font-semibold text-text-main hover:opacity-90"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGuestSettings(false)}
                  className="cursor-pointer font-bold text-plum hover:underline"
                >
                  ← Back to Sign In
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full bg-surface-pill px-4 py-1.5 font-semibold text-text-main"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
