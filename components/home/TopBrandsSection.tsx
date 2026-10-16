'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Award, ArrowRight } from 'lucide-react';

export const TopBrandsSection: React.FC = () => {
  const products = useCatalogProducts();
  const [selectedBrand, setSelectedBrand] = useState('All');

  const brandNames = useMemo(
    () => Array.from(new Set(products.map(product => product.brand))).sort(),
    [products]
  );

  const filtered =
    selectedBrand === 'All'
      ? products.slice(0, 5)
      : products
          .filter(product => product.brand.toLowerCase() === selectedBrand.toLowerCase())
          .slice(0, 5);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex items-end justify-between mb-6 pb-2 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-neutral-100 text-neutral-800">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Top Brand Products
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Shop authentic flagships from the world&apos;s leading technology manufacturers
            </p>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>All Brands</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          <button
            onClick={() => setSelectedBrand('All')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedBrand === 'All'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Brands
          </button>
          {brandNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedBrand(name)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === name
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">
            No products available for {selectedBrand} right now.
          </p>
        )}
      </div>
    </section>
  );
};
