'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password
      });

      if (res.error) {
        setErrorMsg(res.error.message || 'Failed to create account. Please check your details.');
        return;
      }

      router.push('/account');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Unable to register. Please try again.');
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
          </div>
        </Link>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-white">
          Create Your Free Account
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Unlock instant license keys, cloud downloads, and 24/7 priority support.
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-bold text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asif Mahmud"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#F58220] transition-colors"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="register-email"
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
              <label htmlFor="register-password" className="block text-xs font-bold text-neutral-300 mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
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
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#F58220] hover:underline ml-1">
              Sign In
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Better Auth 256-Bit Protection Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
