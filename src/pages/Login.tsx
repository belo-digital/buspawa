import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { ROLES, RoleId } from '../lib/rbac';
import { Button, Label } from '../components/ui/primitives';
import { BrandLoader } from '../components/BrandLoader';
const PRIMARY_LOGO_URL = "/primary-logo.svg";
const LOGIN_BACKGROUND_URL = "/a672894b-d51f-41e9-88c7-a533429d1b93.jpg";
const DEMO_ACCOUNTS: {
  email: string;
  role: RoleId;
}[] = [{
  email: 'admin@buspawa.co.ke',
  role: 'super_admin'
}, {
  email: 'agent@buspawa.co.ke',
  role: 'booking_agent'
}, {
  email: 'finance@buspawa.co.ke',
  role: 'finance_officer'
}, {
  email: 'hr@buspawa.co.ke',
  role: 'hr_officer'
}, {
  email: 'conductor@buspawa.co.ke',
  role: 'conductor'
}, {
  email: 'auditor@buspawa.co.ke',
  role: 'auditor'
}];
export function Login() {
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@buspawa.co.ke');
  const [password, setPassword] = useState('buspawa2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const signInAs = (roleId: RoleId) => {
    signIn(roleId);
    navigate(ROLES[roleId].landing);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const match = DEMO_ACCOUNTS.find((account) => account.email === email.trim().toLowerCase()) ?? DEMO_ACCOUNTS[0];
    window.setTimeout(() => {
      setLoading(false);
      signInAs(match.role);
    }, 650);
  };
  return <main className="relative min-h-screen w-full overflow-hidden bg-[#063f42]">
      <img src={LOGIN_BACKGROUND_URL} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#0b5954]/65" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <header className="flex items-center justify-between">
          <img src={PRIMARY_LOGO_URL} alt="BusPawa" className="h-auto w-36 brightness-0 invert sm:w-44" />
          
        </header>

        <div className="flex flex-1 items-center py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,640px)] lg:gap-16">
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

          <motion.section initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.28,
          ease: 'easeOut'
        }} className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-10 lg:justify-self-end" aria-labelledby="login-title">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.16em] text-primary">
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
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-slate-800">
                  Email or username
                </Label>
                <input id="email" type="text" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-slate-800">
                  Password
                </Label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />{' '}
                Remember me
              </label>
              <Button type="submit" size="lg" className="h-12 w-full rounded-lg text-base" disabled={loading}>
                {loading ? <>
                    <BrandLoader label="Signing in" imageClassName="h-4 w-4" />{' '}
                    Signing in…
                  </> : 'Sign in'}
              </Button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              
            </div>
            <div className="mt-5">
              
              {demoOpen && <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Demo role access">
                  {DEMO_ACCOUNTS.map((account) => <button key={account.role} type="button" onClick={() => signInAs(account.role)} className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      {ROLES[account.role].label}
                    </button>)}
                </div>}
            </div>
          </motion.section>
        </div>
      </div>
    </main>;
}