'use client';

import React from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AppleExclusiveSection: React.FC = () => {
  const products = useCatalogProducts();
  const saasProducts = products.filter(
    p => p.category.includes('SaaS') || p.digitalAssetType === 'SUBSCRIPTION'
  );

  const displayList = saasProducts.length > 0 ? saasProducts.slice(0, 5) : products.slice(0, 5);

  return (
    <section className="py-10 bg-[#F7F8FA] border-t border-neutral-200/60">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-neutral-900 text-white">
                <Sparkles className="w-4 h-4 text-[#F58220]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                AI & SaaS Subscriptions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Dedicated private accounts and enterprise licenses with instant automated credentials dispatch
            </p>
          </div>

          <Link
            href="/category/saas-subscriptions"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>View All Subscriptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
