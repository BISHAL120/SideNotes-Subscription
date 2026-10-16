'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

function getSafeCallbackUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('callbackUrl');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (role?: string) => {
    const callbackUrl = getSafeCallbackUrl();
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/account');
    }
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || 'Invalid email or password.');
        return;
      }

      const userRole = (res.data?.user as { role?: string } | undefined)?.role;
      redirectAfterLogin(userRole);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E66D10] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-2xl tracking-tighter">S</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black tracking-tight text-white">Side</span>
            <span className="text-2xl font-black tracking-tight text-[#F58220]">Note</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 ml-2 px-1.5 py-0.5 rounded bg-neutral-800">
              Auth
            </span>
          </div>
        </Link>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-white">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Access your digital software licenses, SaaS subscriptions, and downloads.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#181818] border border-neutral-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-neutral-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#F58220] transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-neutral-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#F58220] transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-lg shadow-orange-500/20 disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-bold text-[#F58220] hover:underline ml-1">
              Create an account
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with Better Auth Security & Session Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
