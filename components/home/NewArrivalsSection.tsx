'use client';

import React from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Zap, ArrowRight } from 'lucide-react';

export const NewArrivalsSection: React.FC = () => {
  const products = useCatalogProducts();
  const newItems = products
    .filter(p => p.isNewArrival || p.tags?.includes('new-arrival') || p.tags?.includes('exclusive'))
    .slice(0, 5);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex items-end justify-between mb-6 pb-2 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-orange-100 text-[#F58220]">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                New Arrival
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Freshly released AI tools, cloud subscriptions & enterprise codebases
            </p>
          </div>

          <Link
            href="/products?filter=new"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {newItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
