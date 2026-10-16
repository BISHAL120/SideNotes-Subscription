'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';

export const FeaturedTabsSection: React.FC = () => {
  const products = useCatalogProducts();
  const [activeTab, setActiveTab] = useState<'best-deals' | 'top-selling'>('best-deals');

  const bestDeals = products.filter(p => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price)).slice(0, 5);
  const topSelling = products.filter(p => p.isTopSelling).slice(0, 5);

  const displayedList = activeTab === 'best-deals' ? bestDeals : topSelling;

  return (
    <section className="py-10 bg-[#F7F8FA] border-t border-neutral-200/60">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Section Heading & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Featured Products
            </h2>
            <div className="flex items-center bg-neutral-200/70 p-1 rounded-md">
              <button
                onClick={() => setActiveTab('best-deals')}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                  activeTab === 'best-deals'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                BEST DEALS
              </button>
              <button
                onClick={() => setActiveTab('top-selling')}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                  activeTab === 'top-selling'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                TOP SELLING
              </button>
            </div>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayedList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
