'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

const PRIMARY_LOGO_URL = '/primary-logo.svg';
const LOGIN_BACKGROUND_URL = '/a672894b-d51f-41e9-88c7-a533429d1b93.jpg';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetToken('');
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      setSuccess(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <section
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-10"
            aria-labelledby="forgot-title"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.16em] text-[hsl(180,67%,24%)]">
                Password reset
              </p>
              <h2 id="forgot-title" className="mt-2 text-2xl tracking-tight text-slate-900 sm:text-3xl">
                Forgot your password?
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {success}
                  </div>
                  {resetToken && (
                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      <p className="font-medium">Dev mode — Your reset token:</p>
                      <code className="mt-1 block break-all font-mono text-xs">{resetToken}</code>
                      <Link
                        href={`/login/reset?token=${resetToken}`}
                        className="mt-2 inline-block text-[hsl(180,67%,24%)] underline hover:no-underline"
                      >
                        Click here to reset your password
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-800">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(180,67%,24%)]"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[hsl(180,67%,24%)] text-base font-medium text-white hover:bg-[hsl(180,67%,20%)] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <img src="/loader.svg" alt="" className="h-4 w-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              <Link href="/login" className="font-medium text-[hsl(180,67%,24%)] hover:underline">
                Back to sign in
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
