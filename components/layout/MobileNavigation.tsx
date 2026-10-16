'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingBag,
  User,
  X,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/categories';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-150">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-white border-b border-[#e5e5e7] flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f]">
              SideNote
            </span>
            <span className="text-[11px] text-[#7a7a7a] pl-1.5 border-l border-[#e5e5e7]">
              Subscriptions
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Fast Action */}
        <div className="p-3 bg-[#f5f5f7] border-b border-[#e5e5e7]">
          <a
            href="https://wa.me/8801779602069"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-full bg-[#1d1d1f] hover:bg-[#333333] text-white font-medium text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Order via WhatsApp (01779602069)</span>
          </a>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a] mb-2 px-2">
            Categories
          </div>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={cat.slug === 'all' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`}
              onClick={onClose}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
            >
              <span>{cat.name}</span>
              <ChevronRight className="w-4 h-4 text-[#8e8e93]" />
            </Link>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#f5f5f7] border-t border-[#e5e5e7] text-[12px] text-[#555558] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-[#1d1d1f]">
            <ShieldCheck className="w-4 h-4 text-[#0066cc]" />
            <span>100% Genuine Digital Licenses</span>
          </div>
          <div>5% Discount on 2nd Purchase</div>
          <div className="text-[#7a7a7a] text-[11px]">Hotline: 01779602069</div>
        </div>
      </div>
    </div>
  );
};

export const MobileBottomNav: React.FC<{ onOpenDrawer: () => void }> = ({ onOpenDrawer }) => {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, isAction: false },
    { label: 'Catalog', href: '/products', icon: Grid, isAction: false },
    { label: 'Menu', href: '#', icon: Menu, isAction: true },
    { label: 'Account', href: '/account', icon: User, isAction: false },
    { label: 'Bag', href: '/cart', icon: ShoppingBag, isAction: false, badge: totalItems }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e5e5e7] lg:hidden px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={onOpenDrawer}
                className="flex flex-col items-center justify-center py-1.5 px-3 text-[#555558] hover:text-[#1d1d1f] transition-colors"
              >
                <Icon className="w-5 h-5 text-[#1d1d1f]" />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 transition-colors ${
                isActive ? 'text-[#0066cc] font-semibold' : 'text-[#555558] hover:text-[#1d1d1f]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#0066cc] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
