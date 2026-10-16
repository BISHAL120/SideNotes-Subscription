'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('success');
    setMessage('Thank you for subscribing! Check your inbox for exclusive digital offers & promo codes.');
    setEmail('');
  };

  return (
    <section className="py-12 bg-white border-t border-neutral-100">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-lg bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#F58220] text-white">
              Stay Connected
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2 tracking-tight">
              Stay Ahead with Exclusive Digital Deals
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Subscribe to get instant alerts on new AI releases, SaaS discounts, developer templates, and promo codes.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[380px]">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="Enter your email address..."
                  className="w-full h-11 pl-10 pr-4 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 text-xs sm:text-sm rounded-md focus:outline-none focus:border-[#F58220] transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-md bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold whitespace-nowrap transition-colors"
              >
                Subscribe
              </button>
            </form>

            {status === 'success' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {status === 'error' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
