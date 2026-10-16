'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Code, Sparkles, BookOpen, KeyRound } from 'lucide-react';

export const TechArticlesSection: React.FC = () => {
  return (
    <section className="py-12 bg-[#F7F8FA] border-t border-neutral-200/60">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Official Subscriptions */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                100% Genuine Digital Licenses &amp; SaaS Subscriptions
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                SideNote is your authorized destination for genuine AI subscriptions, software licenses, and developer boilerplates. We deliver verified private account credentials with full replacement warranties and instant dispatch.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link href="/products" className="text-xs font-bold text-[#F58220] hover:text-[#E66D10] flex items-center gap-1">
                <span>Explore Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: AI Workflow Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-white border border-neutral-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F58220] text-white">
                GENERATIVE AI SUITE
              </span>
              <h3 className="text-xl font-black text-white mt-3 mb-2">
                SUPERCHARGE WITH CHATGPT &amp; MIDJOURNEY
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Unlock unrestricted access to OpenAI GPT-4o, Canvas, and Midjourney v6.1 Stealth mode. Zero waitlists, private accounts, and instant delivery to your inbox.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800/80 relative z-10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">12 Months Dedicated Seat</span>
              <Link
                href="/category/saas-subscriptions"
                className="px-4 py-2 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold transition-colors"
              >
                GET ACCESS
              </Link>
            </div>
          </div>

          {/* Card 3: Developer Codebases */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-4">
                <Code className="w-5 h-5 text-[#F58220]" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Production-Ready Next.js &amp; Mobile Templates
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ship SaaS products in days instead of months. Our boilerplates include pre-configured Better Auth, Prisma ORM with MongoDB, Stripe subscription webhooks, and Tailwind v4.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link href="/category/developer-templates" className="text-xs font-bold text-[#F58220] hover:text-[#E66D10] flex items-center gap-1">
                <span>View Boilerplates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
