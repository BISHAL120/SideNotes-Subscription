'use client';

import React from 'react';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { KeyRound, ArrowRight } from 'lucide-react';

export const HomeAppliancesSection: React.FC = () => {
  const products = useCatalogProducts();
  const licenseProducts = products.filter(
    p =>
      p.category.includes('Licenses') ||
      p.digitalAssetType === 'LICENSE_KEY' ||
      p.category.includes('E-Book')
  );

  const displayedList = licenseProducts.length > 0 ? licenseProducts : products;

  return (
    <section className="py-10 bg-[#F7F8FA] border-t border-neutral-200/60">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-neutral-900 text-[#F58220]">
                <KeyRound className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Software & OS Lifetime Licenses
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Genuine Windows 11 Pro, Microsoft 365, JetBrains IDEs, and developer e-books with instant keys
            </p>
          </div>

          <Link
            href="/category/software-licenses"
            className="flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            <span>Explore All Licenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayedList.slice(0, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
