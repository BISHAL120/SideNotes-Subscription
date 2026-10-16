'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  ShieldCheck,
  CreditCard,
  Zap,
  Headphones,
  Facebook,
  Youtube,
  Instagram,
  Github
} from 'lucide-react';
import { defaultCmsContent } from '@/data/cms-default';
import { StoreInfo } from '@/types/cms';

export const Footer: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultCmsContent.storeInfo);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content?.storeInfo) {
          setStoreInfo(data.content.storeInfo);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0C0C0C] text-neutral-400 text-xs border-t border-neutral-800 pb-20 md:pb-8">
      {/* 1. Value Proposition Highlights Strip */}
      <div className="border-b border-neutral-800/80 py-8 bg-[#111111]">
        <div className="max-w-[1440px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#F58220]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Instant Delivery</h4>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                License keys and cloud links sent within 60s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#F58220]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Licenses</h4>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Direct official publisher subscriptions & keys
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#F58220]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Payment</h4>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                bKash, Nagad, Visa, MasterCard & direct checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#F58220]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Priority Support</h4>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Dedicated developer chat & hotline support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Link Columns */}
      <div className="max-w-[1440px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Column 1: Brand & Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F58220] to-[#E66D10] flex items-center justify-center font-black text-white text-lg">
              S
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center">
                <span className="text-lg font-black tracking-tight text-white">Side</span>
                <span className="text-lg font-black tracking-tight text-[#F58220]">Note</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                Subscriptions & Digital
              </span>
            </div>
          </Link>

          <p className="text-neutral-400 leading-relaxed text-xs max-w-sm">
            {storeInfo.tagline}
          </p>

          <div className="space-y-2 pt-2">
            <a
              href={`tel:${storeInfo.hotline}`}
              className="flex items-center gap-2.5 text-white hover:text-[#F58220] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F58220]" />
              <span className="font-bold">{storeInfo.hotline} (Helpline)</span>
            </a>
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Mail className="w-4 h-4 text-[#F58220]" />
              <span>{storeInfo.supportEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Clock className="w-4 h-4 text-[#F58220]" />
              <span>{storeInfo.hours}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {storeInfo.facebookUrl && (
              <a
                href={storeInfo.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-[#F58220] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {storeInfo.youtubeUrl && (
              <a
                href={storeInfo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-[#F58220] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {storeInfo.instagramUrl && (
              <a
                href={storeInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-[#F58220] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {storeInfo.githubUrl && (
              <a
                href={storeInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-[#F58220] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            Digital Catalog
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/category/saas-subscriptions" className="hover:text-white transition-colors">
                AI & SaaS Subscriptions
              </Link>
            </li>
            <li>
              <Link href="/category/developer-templates" className="hover:text-white transition-colors">
                Next.js & SaaS Boilerplates
              </Link>
            </li>
            <li>
              <Link href="/category/design-assets" className="hover:text-white transition-colors">
                Figma Design Systems & 3D
              </Link>
            </li>
            <li>
              <Link href="/category/software-licenses" className="hover:text-white transition-colors">
                Windows 11 & Office Retail Keys
              </Link>
            </li>
            <li>
              <Link href="/category/ebooks-guides" className="hover:text-white transition-colors">
                Full-Stack System Design Guides
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Management & Portal */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            Management & Portal
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="hover:text-white text-[#F58220] font-bold transition-colors">
                Admin Management Dashboard
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-white transition-colors">
                My Digital Licenses & Keys
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In with Better Auth
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                Register Customer Account
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-white transition-colors">
                Special Offers & Promo Codes
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Official Guarantee & Legal */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            Customer Guarantee
          </h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Every digital product comes with genuine publisher activation and 7-day serial replacement warranty.
          </p>
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1 text-[11px]">
            <div className="font-bold text-neutral-200">Digital Delivery SLA:</div>
            <div className="text-neutral-400">Within 60 Seconds of Payment</div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Payment Badges */}
      <div className="border-t border-neutral-800 pt-6">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-neutral-500 text-center sm:text-left" suppressHydrationWarning>
            {storeInfo.copyrightText}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Supported:</span>
            <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-bold text-[10px]">
              bKash
            </span>
            <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-bold text-[10px]">
              Nagad
            </span>
            <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-bold text-[10px]">
              VISA
            </span>
            <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-bold text-[10px]">
              MasterCard
            </span>

            <button
              onClick={scrollToTop}
              className="ml-4 p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-[#F58220] text-white transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
