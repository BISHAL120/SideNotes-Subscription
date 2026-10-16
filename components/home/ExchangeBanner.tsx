'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, TicketPercent } from 'lucide-react';

export const ExchangeBanner: React.FC = () => {
  return (
    <section className="py-6 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141414] via-[#1F1F1F] to-[#121212] text-white border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Info */}
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F58220] to-[#E66D10] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Zap className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#F58220] text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-orange-500/30">
                <TicketPercent className="w-3.5 h-3.5" />
                <span>Save 20% with Coupon: DIGITAL20</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Instant Automated Delivery Guaranteed
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg leading-relaxed">
                Purchase any AI subscription, Windows license, or SaaS codebase and receive your official serial activation key and cloud download link immediately.
              </p>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>7-Day Key Guarantee</span>
            </div>
            <Link
              href="/offers"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-orange-500/20"
            >
              <span>Redeem Discount</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
