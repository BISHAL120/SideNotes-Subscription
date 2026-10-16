'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchBar } from './SearchBar';
import { AnnouncementBar } from './AnnouncementBar';
import { useCart } from '@/context/CartContext';
import { digitalCategories } from '@/data/digital-categories';
import { Category } from '@/types/product';
import { formatPrice } from '@/lib/format-price';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Tag,
  Home as HomeIcon,
  Grid,
  ShieldCheck,
  KeyRound,
  LayoutDashboard
} from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { authClient } from '@/lib/auth-client';

export const Header: React.FC = () => {
  const { totalItems, subtotal } = useCart();
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';
  const [categories, setCategories] = useState<Category[]>(digitalCategories);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState<string | null>(null);
  const mounted = useIsMounted();

  const displayTotalItems = mounted ? totalItems : 0;
  const displaySubtotal = mounted ? subtotal : 0;

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
    <header className="w-full sticky top-0 z-40 bg-[#121212] text-white shadow-md overflow-x-hidden">
      {/* 1. Dynamic Top Announcement Bar from CMS */}
      <AnnouncementBar />

      {/* 2. Main Header Bar */}
      <div className="max-w-[1440px] mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F58220] to-[#E66D10] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-tighter">S</span>
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">Side</span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#F58220]">Note</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
              Subscriptions & Digital
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Desktop & Tablet) */}
        <div className="hidden sm:block flex-1 max-w-xl mx-4">
          <SearchBar />
        </div>

        {/* User Actions (Admin Dashboard, Wishlist, Cart, Account, Hamburger) */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Quick Admin Dashboard Link */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#F58220] border border-orange-500/30 text-xs font-bold transition-colors"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <Link
            href="/cart"
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-white transition-colors border border-neutral-700"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#F58220]" />
              {displayTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#F58220] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {displayTotalItems}
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase">Bag</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {formatPrice(displaySubtotal)}
              </span>
            </div>
          </Link>

          {/* User Account Link */}
          <Link
            href="/account"
            className="flex items-center gap-1.5 p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="My Account"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline text-xs font-medium">Account</span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchBar onSearchSubmit={() => setMobileMenuOpen(false)} />
      </div>

      {/* 3. Digital Category Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-[#1A1A1A] border-t border-neutral-800 text-xs font-semibold">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 lg:gap-2">
            <Link
              href="/products"
              className="flex items-center gap-2 py-3 px-3.5 text-white bg-[#F58220] hover:bg-[#E66D10] transition-colors rounded-t-lg font-bold"
            >
              <Menu className="w-4 h-4" />
              <span>All Digital Products</span>
            </Link>

            {categories.slice(0, 5).map(category => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveCategoryDropdown(category.id)}
                onMouseLeave={() => setActiveCategoryDropdown(null)}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="py-3 px-3 text-neutral-300 hover:text-white flex items-center gap-1 transition-colors group-hover:text-[#F58220]"
                >
                  <span>{category.name}</span>
                  {category.subcategories?.length > 0 && (
                    <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-[#F58220] transition-transform group-hover:rotate-180" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {category.subcategories && category.subcategories.length > 0 && activeCategoryDropdown === category.id && (
                  <div className="absolute top-full left-0 w-64 bg-[#1F1F1F] text-white border border-neutral-700/80 shadow-2xl rounded-b-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-neutral-400 border-b border-neutral-800">
                      Popular {category.name}
                    </div>
                    {category.subcategories.map(sub => (
                      <Link
                        key={sub.slug}
                        href={`/category/${category.slug}?sub=${sub.slug}`}
                        className="block px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 hover:pl-4 transition-all"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 py-2 text-[11px]">
            <Link
              href="/offers"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-[#F58220] hover:bg-orange-500/20 font-bold transition-colors border border-orange-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flash Deals: 20% OFF</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161616] border-t border-neutral-800 px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Browse Digital Categories
            </div>
            {categories.map(cat => (
              <div key={cat.id} className="border-b border-neutral-800/60 pb-2">
                <Link
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-200 hover:text-[#F58220]"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-neutral-500">({cat.itemCount})</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-[#F58220] font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Management Dashboard</span>
              </Link>
            )}
            <Link
              href="/offers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-neutral-300 hover:text-white"
            >
              <Tag className="w-4 h-4 text-[#F58220]" />
              <span>Special Offers & Deals</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-neutral-300 hover:text-white"
            >
              <User className="w-4 h-4 text-[#F58220]" />
              <span>My Digital Licenses & Orders</span>
            </Link>
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212] border-t border-neutral-800 py-2 px-3 flex md:hidden items-center justify-around shadow-2xl">
        <Link href="/" className="flex flex-col items-center text-neutral-400 hover:text-[#F58220]">
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center text-neutral-400 hover:text-[#F58220]">
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Catalog</span>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex flex-col items-center text-[#F58220] hover:text-[#E66D10]">
            <LayoutDashboard className="w-5 h-5 text-[#F58220]" />
            <span className="text-[10px] font-semibold mt-1 text-[#F58220]">Dashboard</span>
          </Link>
        )}
        <Link href="/account" className="flex flex-col items-center text-neutral-400 hover:text-[#F58220]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Account</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-neutral-400 hover:text-[#F58220] relative">
          <ShoppingBag className="w-5 h-5" />
          {displayTotalItems > 0 && (
            <span className="absolute -top-1 right-1 bg-[#F58220] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {displayTotalItems}
            </span>
          )}
          <span className="text-[10px] font-semibold mt-1">Cart</span>
        </Link>
      </nav>
    </header>
  );
};
