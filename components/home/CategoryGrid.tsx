'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Code,
  Layers,
  Key,
  BookOpen,
  Terminal,
  Cpu,
  Cloud,
  Zap,
  Layout,
  LucideIcon
} from 'lucide-react';
import { Category } from '@/types/product';
import { digitalCategories } from '@/data/digital-categories';

const iconCatalog: Record<string, LucideIcon> = {
  Sparkles,
  Code,
  Layers,
  Key,
  BookOpen,
  Terminal,
  Cpu,
  Cloud,
  Zap,
  Layout
};

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(digitalCategories);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories?.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-end justify-between mb-6 pb-2 border-b border-neutral-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Digital Product Categories
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Explore authentic subscriptions, production source codes, license keys, and design systems.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#F58220] hover:text-[#E66D10] transition-colors"
          >
            Explore All Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((cat, idx) => {
            const Icon = iconCatalog[cat.iconName] || Sparkles;
            return (
              <Link
                key={cat.id || idx}
                href={`/category/${cat.slug}`}
                className="group flex flex-col p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-[#F58220]/50 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#F58220] group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-neutral-400">
                    {cat.itemCount} Items
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#F58220] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'Digital verified licenses with instant delivery'}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center text-[11px] font-bold text-[#F58220]">
                  <span>Browse Subcategories →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
