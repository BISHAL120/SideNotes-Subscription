'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Coupon } from '@/types/product';
import {
  Sparkles,
  Tag,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { formatPrice } from '@/lib/format-price';

export default function OffersPage() {
  const products = useCatalogProducts();
  const deals = products.filter(
    product => product.isHotDeal || (product.originalPrice && product.originalPrice > product.price)
  );
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/coupons')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.coupons) {
          setCoupons(data.coupons);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">Special Offers & Vouchers</span>
        </nav>

        {/* Hero Promotional Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-neutral-950 text-white p-8 sm:p-12 mb-10 border border-neutral-800 shadow-2xl">
          <div className="max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-[#F58220] border border-orange-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              DIGITAL DISCOUNT SEASON 2026
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              Save Up to 55% on AI & Software Licenses
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
              Redeem exclusive digital discount vouchers on ChatGPT Plus, Next.js 15 enterprise boilerplates, Windows 11 Pro retail keys, and JetBrains IDE suites.
            </p>
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <Zap className="w-4 h-4 text-[#F58220]" />
              <span>Instant digital dispatch via email within 60 seconds</span>
            </div>
          </div>
        </div>

        {/* Voucher Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#F58220]" />
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Active Promo Coupons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div
                key={coupon.code}
                className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-black text-neutral-900">
                      {coupon.discountPercent
                        ? `${coupon.discountPercent}% OFF`
                        : formatPrice(coupon.discountAmount || 0) + ' OFF'}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500">
                      Min spend {formatPrice(coupon.minSpend)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="font-mono text-sm font-extrabold text-[#F58220] tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-[#F58220] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusive Digital Deals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Featured Discounted Software & Subscriptions
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-[#F58220] hover:text-[#E66D10] flex items-center gap-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
