'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronRight,
  RotateCcw,
  Search,
  Sparkles,
  Zap,
  KeyRound
} from 'lucide-react';
import { formatPrice } from '@/lib/format-price';

const digitalTypes = [
  { label: 'All Types', value: '' },
  { label: 'SaaS Subscriptions', value: 'SUBSCRIPTION' },
  { label: 'Source Code & Templates', value: 'SOURCE_CODE' },
  { label: 'Software Licenses', value: 'LICENSE_KEY' },
  { label: 'Design Kits & UI Systems', value: 'UI_KIT' },
  { label: 'E-Books & Video Guides', value: 'EBOOK' }
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialType = searchParams.get('type') || '';
  const initialFilter = searchParams.get('filter') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  const products = useCatalogProducts();
  const maxCatalogPrice = useMemo(
    () => Math.max(50000, ...products.map(product => product.price)),
    [products]
  );
  const priceLimit = maxPrice ?? maxCatalogPrice;

  // Dynamic counts derived from actual catalog products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.name] = products.filter(
        p => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
    });
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    brands.forEach(b => {
      counts[b.name] = products.filter(
        p => p.brand.toLowerCase() === b.name.toLowerCase()
      ).length;
    });
    return counts;
  }, [products]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    digitalTypes.forEach(t => {
      counts[t.value] = t.value
        ? products.filter(p => p.digitalAssetType === t.value).length
        : products.length;
    });
    return counts;
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Special Preset Filters
        if (selectedFilter === 'new') {
          if (!p.isNewArrival && !p.tags?.includes('new-arrival') && !p.tags?.includes('exclusive')) {
            return false;
          }
        } else if (selectedFilter === 'deals' || selectedFilter === 'hot') {
          if (!p.isHotDeal && !(p.originalPrice && p.originalPrice > p.price)) {
            return false;
          }
        } else if (selectedFilter === 'featured') {
          if (!p.isFeatured) return false;
        } else if (selectedFilter === 'top' || selectedFilter === 'best-selling') {
          if (!p.isTopSelling) return false;
        }

        // Search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.subcategory?.toLowerCase().includes(q) ||
            p.tags?.some(t => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Category
        if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Brand
        if (selectedBrand && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Digital asset type
        if (selectedType && p.digitalAssetType !== selectedType) {
          return false;
        }

        // Price
        if (p.price > priceLimit) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating') return b.rating - a.rating;
        if (sortOption === 'discount') {
          const discA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discB - discA;
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedType, selectedFilter, priceLimit, sortOption]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedType('');
    setSelectedFilter('');
    setSearchQuery('');
    setMaxPrice(null);
    setSortOption('featured');
    router.push('/products');
  };

  const hasActiveFilters =
    selectedCategory || selectedBrand || selectedType || selectedFilter || searchQuery || maxPrice !== null;

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">Digital Products Catalog</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#F58220] font-semibold">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Page Title & Controls Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedFilter === 'new'
                ? 'New Arrival Digital Products'
                : selectedFilter === 'deals' || selectedFilter === 'hot'
                ? 'Hot Deals & Discounted Licenses'
                : selectedFilter === 'featured'
                ? 'Featured Subscriptions & Licenses'
                : selectedFilter === 'top' || selectedFilter === 'best-selling'
                ? 'Top Selling Digital Products'
                : selectedCategory
                ? selectedCategory
                : 'All Subscriptions & Software Licenses'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Showing <span className="font-bold text-neutral-900">{filteredProducts.length}</span> verified digital assets with instant email delivery
            </p>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {selectedFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F58220] text-[11px] font-bold">
                    <span>Filter: {selectedFilter === 'new' ? 'New Arrivals' : selectedFilter}</span>
                    <button type="button" onClick={() => setSelectedFilter('')} className="hover:text-neutral-900 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F58220] text-[11px] font-bold">
                    <span>Category: {selectedCategory}</span>
                    <button type="button" onClick={() => setSelectedCategory('')} className="hover:text-neutral-900 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F58220] text-[11px] font-bold">
                    <span>Publisher: {selectedBrand}</span>
                    <button type="button" onClick={() => setSelectedBrand('')} className="hover:text-neutral-900 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F58220] text-[11px] font-bold">
                    <span>Type: {digitalTypes.find(t => t.value === selectedType)?.label || selectedType}</span>
                    <button type="button" onClick={() => setSelectedType('')} className="hover:text-neutral-900 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
            >
              <Filter className="w-4 h-4 text-[#F58220]" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-neutral-500 hidden sm:inline font-medium">Sort by:</span>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F58220]"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar (Desktop) + Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
                <SlidersHorizontal className="w-4 h-4 text-[#F58220]" />
                <span>Filter Catalog</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#F58220] hover:text-[#E66D10] font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* In-catalog Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Keyword Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. ChatGPT, Next.js, Windows..."
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-neutral-900 focus:outline-none focus:border-[#F58220]"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Asset Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Digital Asset Type
              </label>
              <div className="space-y-1">
                {digitalTypes.map(t => {
                  const count = typeCounts[t.value] ?? 0;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedType === t.value
                          ? 'bg-orange-50 text-[#F58220] font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Categories
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === ''
                      ? 'bg-orange-50 text-[#F58220] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({products.length})</span>
                </button>
                {categories.map(cat => {
                  const count = categoryCounts[cat.name] ?? 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.name
                          ? 'bg-orange-50 text-[#F58220] font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Publishers & Vendors
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedBrand === ''
                      ? 'bg-orange-50 text-[#F58220] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Publishers</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({products.length})</span>
                </button>
                {brands.map(b => {
                  const count = brandCounts[b.name] ?? 0;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.name)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedBrand === b.name
                          ? 'bg-orange-50 text-[#F58220] font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <span>Max Price</span>
                <span className="text-neutral-900 font-extrabold normal-case">
                  {formatPrice(priceLimit)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max={maxCatalogPrice}
                step="1000"
                value={priceLimit}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#F58220]"
                aria-label="Maximum price"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>৳ 1,000</span>
                <span>{formatPrice(maxCatalogPrice)}</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Cols Desktop) */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F58220] mx-auto flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  No digital assets found matching your criteria
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  Try clearing your search query or adjusting your price limit to find available products.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-[#F58220] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <div className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#F58220]" />
                <span>Filters</span>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Asset Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Digital Asset Type
                </label>
                <div className="space-y-1">
                  {digitalTypes.map(t => {
                    const count = typeCounts[t.value] ?? 0;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setSelectedType(t.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                          selectedType === t.value ? 'bg-orange-50 text-[#F58220]' : 'text-neutral-700'
                        }`}
                      >
                        <span>{t.label}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedCategory === '' ? 'bg-orange-50 text-[#F58220]' : 'text-neutral-700'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({products.length})</span>
                  </button>
                  {categories.map(c => {
                    const count = categoryCounts[c.name] ?? 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                          selectedCategory === c.name ? 'bg-orange-50 text-[#F58220]' : 'text-neutral-700'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 mt-6 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F58220] text-white text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsContentWrapper() {
  const searchParams = useSearchParams();
  return <ProductsContent key={searchParams.toString()} />;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading digital catalog...</div>}>
      <ProductsContentWrapper />
    </Suspense>
  );
}
