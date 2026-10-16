'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { Product, Category } from '@/types/product';
import { ChevronRight, ArrowUpDown, Sparkles } from 'lucide-react';

interface CategoryCatalogProps {
  category: Category;
  products: Product[];
}

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({ category, products }) => {
  const [selectedSub, setSelectedSub] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('featured');

  const categoryProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchCategory = product.category.toLowerCase() === category.name.toLowerCase();
        if (!matchCategory) return false;

        if (
          selectedSub !== 'all' &&
          product.subcategory?.toLowerCase() !== selectedSub.toLowerCase()
        ) {
          return false;
        }

        if (selectedBrand !== 'all' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, category.name, selectedSub, selectedBrand, sortOption]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(product => {
      if (product.category.toLowerCase() === category.name.toLowerCase()) {
        brandSet.add(product.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [products, category.name]);

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-neutral-900 transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#F58220] font-semibold">{category.name}</span>
        </nav>

        <div className="p-6 sm:p-8 rounded-lg bg-white border border-neutral-200/80 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#F58220] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Official Category Store
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
                {category.description ||
                  `Browse genuine ${category.name.toLowerCase()} with instant delivery and an official 7-day replacement guarantee.`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 shrink-0">
              <span className="text-neutral-900 font-extrabold">{categoryProducts.length}</span>
              <span>Products Available</span>
            </div>
          </div>

          {category.subcategories.length > 0 && (
            <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedSub('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSub === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All {category.name}
              </button>
              {category.subcategories.map(sub => (
                <button
                  key={sub.slug}
                  onClick={() => setSelectedSub(sub.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedSub === sub.name
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {availableBrands.length > 0 && (
            <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                Brand:
              </span>
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBrand === 'all'
                    ? 'bg-[#F58220] text-white'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedBrand === brand
                      ? 'bg-[#F58220] text-white'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <div className="text-xs text-neutral-500 font-medium">
            Showing <span className="font-bold text-neutral-900">{categoryProducts.length}</span> items
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              aria-label="Sort products"
              className="bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#F58220]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {categoryProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-lg border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              No products found in this category filter
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try choosing &quot;All Brands&quot; or clearing your subcategory filter.
            </p>
            <button
              onClick={() => {
                setSelectedSub('all');
                setSelectedBrand('all');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
