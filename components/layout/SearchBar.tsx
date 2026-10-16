'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/format-price';
import Image from 'next/image';

interface SearchBarProps {
  className?: string;
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', onSearchSubmit }) => {
  const router = useRouter();
  const products = useCatalogProducts();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.trim().length <= 1) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory?.toLowerCase().includes(q) ?? false) ||
          p.tags?.some(tag => tag.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, products]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    onSearchSubmit?.();
  };

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/product/${slug}`);
    onSearchSubmit?.();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-label="Search products"
          value={query}
          onFocus={() => {
            if (query.trim().length > 1) setIsOpen(true);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.trim().length > 1);
          }}
          placeholder="Search for AI subscriptions, licenses, templates, tools..."
          className="w-full h-10 pl-10 pr-10 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-400 text-xs sm:text-sm rounded-md focus:outline-none focus:border-[#F58220] focus:ring-1 focus:ring-[#F58220] transition-all"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-md shadow-xl border border-neutral-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                <span>Products matching &quot;{query}&quot;</span>
                <span>{results.length} results</span>
              </div>
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {results.map(product => (
                  <button
                    key={product.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 text-left transition-colors group"
                  >
                    <div className="w-12 h-12 relative rounded bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                      <Image
                        src={product.images?.[0] ?? '/placeholder-product.png'}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                        {product.brand} · {product.category}
                      </div>
                      <div className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#F58220] transition-colors">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-neutral-900 tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through tabular-nums">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#F58220] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
              <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 text-center">
                <button
                  onClick={handleSubmit}
                  className="text-xs font-semibold text-[#F58220] hover:text-[#E66D10] transition-colors"
                >
                  View all matching results for &quot;{query}&quot; →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">
              No digital products found matching &quot;{query}&quot;. Try &quot;ChatGPT&quot;, &quot;Next.js&quot;, or &quot;Windows&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
