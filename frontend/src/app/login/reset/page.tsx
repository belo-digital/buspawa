'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PRIMARY_LOGO_URL = '/primary-logo.svg';
const LOGIN_BACKGROUND_URL = '/a672894b-d51f-41e9-88c7-a533429d1b93.jpg';

function ResetForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-10"
      aria-labelledby="reset-title"
    >
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.16em] text-[hsl(180,67%,24%)]">
          New password
        </p>
        <h2 id="reset-title" className="mt-2 text-2xl tracking-tight text-slate-900 sm:text-3xl">
          Reset your password
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Enter your new password below.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
            <p className="font-medium">Password reset successfully!</p>
            <p className="mt-1">Redirecting to sign in…</p>
          </div>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-lg bg-[hsl(180,67%,24%)] text-base font-medium text-white hover:bg-[hsl(180,67%,20%)] transition-colors"
          >
            Sign in now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!token && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No reset token found. Please use the link from your email.
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-800">
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(180,67%,24%)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(180,67%,24%)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[hsl(180,67%,24%)] text-base font-medium text-white hover:bg-[hsl(180,67%,20%)] disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <img src="/loader.svg" alt="" className="h-4 w-4 animate-spin" />
                Resetting…
              </span>
            ) : (
              'Reset password'
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium text-[hsl(180,67%,24%)] hover:underline">
          Back to sign in
        </Link>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#063f42]">
      <img
        src={LOGIN_BACKGROUND_URL}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#0b5954]/65" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <header className="flex items-center justify-between">
          <img
            src={PRIMARY_LOGO_URL}
            alt="BusPawa"
            className="h-auto w-36 brightness-0 invert sm:w-44"
          />
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
              <img src="/loader.svg" alt="" className="h-8 w-8 animate-spin" />
            </div>
          }>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
