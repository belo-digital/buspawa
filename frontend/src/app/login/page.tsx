'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const PRIMARY_LOGO_URL = '/primary-logo.svg';
const LOGIN_BACKGROUND_URL = '/a672894b-d51f-41e9-88c7-a533429d1b93.jpg';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@buspawa.com');
  const [password, setPassword] = useState('test123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
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

        <div className="flex flex-1 items-center py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,640px)] lg:gap-16">
          {/* Left: Marketing copy */}
          <section className="hidden max-w-2xl self-end pb-6 text-white lg:block" aria-label="BusPawa introduction">
            <div className="mb-7 h-1 w-16 rounded-full bg-white" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">
              BusPawa operations
            </p>
            <h1 className="mt-4 text-5xl leading-[1.05] tracking-tight xl:text-6xl">
              Every route. Every stop. One reliable operations desk.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Manage ticketing, parcel handoffs, fleet setup and revenue
              operations from a single connected workspace.
            </p>
          </section>

          {/* Right: Login form */}
          <section
            className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-10 lg:justify-self-end"
            aria-labelledby="login-title"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.16em] text-[hsl(180,67%,24%)]">
                Welcome back
              </p>
              <h2 id="login-title" className="mt-2 text-3xl tracking-tight text-slate-900 sm:text-4xl">
                Sign in to BusPawa
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Access your assigned operations workspace.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-800">
                  Email or username
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(180,67%,24%)]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(180,67%,24%)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 focus:ring-[hsl(180,67%,24%)]"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[hsl(180,67%,24%)] text-base font-medium text-white hover:bg-[hsl(180,67%,20%)] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <img src="/loader.svg" alt="" className="h-4 w-4 animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
