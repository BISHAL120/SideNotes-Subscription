'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Flame, Clock, ArrowRight } from 'lucide-react';

function getCampaignDeadline(): number {
  const now = new Date();
  const deadline = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return deadline.getTime();
}

export const ExclusiveDealsSection: React.FC = () => {
  const products = useCatalogProducts();
  const hotDeals = products
    .filter(product => product.isHotDeal || (product.originalPrice && product.originalPrice > product.price))
    .slice(0, 5);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(
    null
  );

  useEffect(() => {
    const deadline = getCampaignDeadline();
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Heading & Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-neutral-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-100 text-red-600">
                <Flame className="w-4 h-4 fill-current" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Exclusive Deals
              </h2>
            </div>

            {/* Countdown Badge */}
            {timeLeft && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                <Clock className="w-3.5 h-3.5" />
                <span>Ends in:</span>
                <span className="font-mono font-black tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <Link
            href="/offers"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {hotDeals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
